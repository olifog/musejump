import { TrackList } from "./TrackList";
import { PlayHistory, Track } from "@spotify/web-api-ts-sdk";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <span className="text-xs text-muted-foreground">
      {new Date(track.played_at).toLocaleString(undefined, {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  );

  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-bold">
          Recently Played
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pl-3 pr-3 pb-3">
        <ScrollArea className="h-[70vh] pr-2">
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
