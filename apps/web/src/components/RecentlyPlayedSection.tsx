import { TrackList } from "./TrackList";
import { PlayHistory, Track } from "@spotify/web-api-ts-sdk";

interface RecentlyPlayedSectionProps {
  tracks: PlayHistory[];
}

export interface TrackWithPlayedAt extends Track {
  played_at: string;
}

export const RecentlyPlayedSection = ({
  tracks,
}: RecentlyPlayedSectionProps) => {
  const renderRightElement = (track: TrackWithPlayedAt) => (
    <span className="text-xs text-gray-400">
      {new Date(track.played_at).toLocaleString(undefined, {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  );

  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <h2 className="text-sm uppercase tracking-wider text-gray-400 font-bold mb-2">
        Recently Played
      </h2>
      <div className="overflow-y-auto max-h-[70vh]">
        <TrackList
          tracks={
            tracks.map((track) => ({
              ...track.track,
              played_at: track.played_at,
            })) as TrackWithPlayedAt[]
          }
          renderRightElement={renderRightElement}
          emptyMessage="No recently played tracks found."
        />
      </div>
    </div>
  );
};
