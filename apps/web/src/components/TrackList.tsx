import { TrackItem } from "./TrackItem";
import { Track } from "@spotify/web-api-ts-sdk";

interface TrackListProps<T extends Track> {
  tracks: T[];
  showIndex?: boolean;
  renderRightElement?: (track: T, index: number) => React.ReactNode;
  onTrackClick?: (track: T) => void;
  emptyMessage?: string;
}

export const TrackList = <T extends Track>({
  tracks,
  showIndex = false,
  renderRightElement,
  onTrackClick,
  emptyMessage = "No tracks found",
}: TrackListProps<T>) => {
  if (tracks.length === 0) {
    return <div className="text-center py-8 text-gray-400">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-1">
      {tracks.map((track, index) => (
        <TrackItem
          key={track.id + index}
          track={track}
          index={showIndex ? index : undefined}
          rightElement={
            renderRightElement ? renderRightElement(track, index) : undefined
          }
          onClick={() => onTrackClick && onTrackClick(track)}
        />
      ))}
    </div>
  );
};
