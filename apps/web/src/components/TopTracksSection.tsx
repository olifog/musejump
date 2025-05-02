import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Track } from "@spotify/web-api-ts-sdk";
import { TrackList } from "./TrackList";

interface TopTracksProps {
	tracks: Track[];
}

export const TopTracksSection = ({ tracks }: TopTracksProps) => {
	const renderRightElement = (track: Track) => (
		<span className="text-xs text-muted-foreground">
			{Math.floor(track.duration_ms / 60000)}:
			{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, "0")}
		</span>
	);

	return (
		<Card>
			<CardHeader className="p-3 pb-2">
				<CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-bold">
					Top Tracks
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0 pl-3 pr-3 pb-3">
				<ScrollArea className="h-[70vh] pr-2">
					<TrackList
						tracks={tracks}
						showIndex={true}
						renderRightElement={renderRightElement}
						emptyMessage="No top tracks found."
					/>
				</ScrollArea>
			</CardContent>
		</Card>
	);
};
