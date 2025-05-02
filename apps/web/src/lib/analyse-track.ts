import { env } from "@/env";
import type { Track } from "@spotify/web-api-ts-sdk";

export const analyseTrack = async (track: Track) => {
	let search = track.name;

	if (track.artists.length > 0) {
		search += ` - ${track.artists[0]?.name}`;
	}

	const response = await fetch(
		`${env.NEXT_PUBLIC_ANALYSER_URL}/analyse?search=${search}`,
		{
			headers: {
				"ngrok-skip-browser-warning": "69420",
			},
		}
	);
	const data = (await response.json()) as {
		video_id: string;
		cached: boolean;
		result: {
			segments: {
				start: number;
				end: number;
				label: string;
				lyrics: string;
			}[];
			bpm: number;
		};
	};

	return data;
};
