import { TrackList } from "./TrackList";
import { Track } from "@spotify/web-api-ts-sdk";

interface TopTracksProps {
  tracks: Track[];
  onTrackClick?: (track: Track) => void;
}

export const TopTracksSection = ({ tracks, onTrackClick }: TopTracksProps) => {
  const renderRightElement = (track: Track) => (
    <span className="text-xs text-gray-400">
      {Math.floor(track.duration_ms / 60000)}:
      {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, "0")}
    </span>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <h2 className="text-sm uppercase tracking-wider text-gray-400 font-bold mb-2">
        Top Tracks
      </h2>
      <div className="overflow-y-auto max-h-[70vh]">
        <TrackList
          tracks={tracks}
          showIndex={true}
          renderRightElement={renderRightElement}
          onTrackClick={onTrackClick}
          emptyMessage="No top tracks found."
        />
      </div>
    </div>
  );
};
