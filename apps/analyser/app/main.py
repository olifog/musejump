import dotenv

from fastapi import FastAPI
from youtube_search import YoutubeSearch
from openai import OpenAI
import os
import json
import yt_dlp
import allin1
import tempfile
import shutil
from typing import Dict
import lyricsgenius
import time
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

dotenv.load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

genius = lyricsgenius.Genius(os.environ.get("GENIUS_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CACHE_DIR = "./data/musejump_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

QUERY_CACHE: Dict[str, str] = {}


class Section(BaseModel):
    start: float
    end: float
    label: str
    lyrics: str


class SectionLyrics(BaseModel):
    sections: list[Section]


class CleanedSearch(BaseModel):
    cleaned_search: str


@app.get("/analyse")
async def analyse(search: str):
    if search in QUERY_CACHE:
        video_id = QUERY_CACHE[search]
    else:
        results = YoutubeSearch(search, max_results=10).to_dict()

        response = client.responses.create(
            model="gpt-4.1",
            instructions="You are a tool that helps choose which youtube video has the purest audio source for a song. i.e. don't choose live versions, or music videos -- choose the video that has the official audio of the song but with no extraneous content. e.g. the official audio, or a lyric video potentially. It MUST be the real song, not a cover, and ideally the channel should be the band's official channel. Output JUST the video id of the best result.",
            input=json.dumps(results),
        )

        video_id = response.output_text.strip()
        QUERY_CACHE[search] = video_id

    cache_file_path = os.path.join(CACHE_DIR, f"{video_id}.json")

    # Check cache first
    if os.path.exists(cache_file_path):
        try:
            with open(cache_file_path, "r") as f:
                cached_result = json.load(f)
            print(f"Returning cached result for video ID: {video_id}")
            return {"video_id": video_id, "result": cached_result, "cached": True}
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error reading cache file {cache_file_path}: {e}. Re-analyzing.")
            # If cache is corrupted, proceed to download and analyze

    # If not in cache or cache read error, proceed with download and analysis
    # Use a temporary directory within /tmp for audio files
    temp_audio_dir = tempfile.mkdtemp(prefix="musejump_audio_", dir="/tmp")
    # Ensure the output template uses the temporary directory
    output_template = os.path.join(temp_audio_dir, "%(id)s.%(ext)s")
    # The final path after postprocessing will be .wav
    audio_path = os.path.join(temp_audio_dir, f"{video_id}.wav")

    ydl_opts = {
        "format": "bestaudio/best",  # Select best audio quality
        "outtmpl": output_template,  # Template for output filename
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",  # Use FFmpeg to extract audio
                "preferredcodec": "wav",  # Convert to wav format
            }
        ],
        "quiet": True,  # Suppress verbose output from yt-dlp
        "noplaylist": True,  # Ensure only single video is downloaded
    }

    download_url = f"https://www.youtube.com/watch?v={video_id}"

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([download_url])
        print(
            f"Audio downloaded successfully to: {audio_path}"
        )  # Logging for confirmation

        # Analyse the downloaded audio
        allin1.analyze(audio_path, device="cpu", out_dir=CACHE_DIR)
        json_result = json.load(open(os.path.join(CACHE_DIR, f"{video_id}.json")))

        cleaned_search = client.responses.parse(
            model="gpt-4.1",
            text_format=CleanedSearch,
            instructions="You are a tool that cleans up a Genius song search query. Genius only understands the song name exactly, followed by the artist name exactly, remove any additional information (year of remaster, album, dashes, etc.) For example 'The Way You Make Me Feel - 2012 Remaster - Michael Jackson' should be 'The Way You Make Me Feel Michael Jackson'",
            input=search,
        )

        song = genius.search_song(cleaned_search.output_parsed.cleaned_search)
        new_segments = []
        current_start = 0
        current_label = ""

        filtered_segments = [
            segment
            for segment in json_result["segments"]
            if segment["label"] not in ["start", "end"]
        ]

        for _, segment in enumerate(filtered_segments):
            if segment["label"] != current_label:
                if current_label != "":
                    new_segments.append(
                        {
                            "start": current_start,
                            "end": segment["start"],
                            "label": current_label,
                        }
                    )

                current_label = segment["label"]
                current_start = segment["start"]

        new_segments.append(
            {"start": current_start, "end": segment["end"], "label": current_label}
        )

        if song is None:
            return_val = {"segments": new_segments, "bpm": json_result["bpm"]}
        else:
            response = None
            for _ in range(3):
                try:
                    response = client.responses.parse(
                        model="gpt-4.1",
                        text_format=SectionLyrics,
                        instructions="""
                You are a tool that merges lyrics from Genius and the segment labels from the audio analysis.
                You should match up the lyrics into the correct segments based on your judgement, and clean up the
                lyrics from Genius into just the text with newline characters to split, no labels/formatting.
                You can use multiple newlines if appropriate in certain circumstances, and you can use the
                start/end times to help you (their length is in seconds).
                The section labels within the Genius text might not be accurate, use your judgement.
                """,
                        input=json.dumps(
                            {"segments": new_segments, "lyrics": song.lyrics}
                        ),
                        max_output_tokens=10000
                    )
                except Exception as e:
                    print(f"Error parsing response: {e}")
                    time.sleep(1)

                if response is not None:
                    break

            return_val = {
                "segments": [x.model_dump() for x in response.output_parsed.sections],
                "bpm": json_result["bpm"],
            }

        # save the return_val to a file
        with open(os.path.join(CACHE_DIR, f"{video_id}.json"), "w") as f:
            json.dump(return_val, f)

        # Clean up the temporary audio file/directory after analysis
        # shutil.rmtree(temp_audio_dir) # Uncomment to enable cleanup

        # Return the analysis result
        return {"video_id": video_id, "cached": False, "result": return_val}

    except yt_dlp.utils.DownloadError as e:
        # Handle potential download errors
        print(f"Error downloading audio: {e}")
        # Clean up potentially partially created temp dir
        # if os.path.exists(temp_audio_dir): shutil.rmtree(temp_audio_dir)
        return {
            "error": f"Failed to download audio for video ID {video_id}",
            "details": str(e),
        }
    except Exception as e:
        # Handle other potential exceptions
        print(f"An unexpected error occurred: {e}")
        # Clean up potentially partially created temp dir
        # if os.path.exists(temp_audio_dir): shutil.rmtree(temp_audio_dir)
        return {"error": "An unexpected error occurred", "details": str(e)}
    finally:
        # Ensure cleanup happens even if allin1.analyze fails (optional)
        if os.path.exists(temp_audio_dir):
            try:
                shutil.rmtree(temp_audio_dir)
                print(f"Cleaned up temporary directory: {temp_audio_dir}")
            except Exception as cleanup_error:
                print(
                    f"Error cleaning up temporary directory {temp_audio_dir}: {cleanup_error}"
                )
