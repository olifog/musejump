import { analyseTrack } from "@/lib/analyse-track";
import type { Track } from "@spotify/web-api-ts-sdk";
import { Repeat, SkipForward } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import SongStructureVisualizer, {
	type Segment,
} from "./song-structure-visualizer";
import { Button } from "./ui/button";

export const TrackAnalysis = ({
	track,
	skipSegment,
	repeatSegment,
}: {
	track: Track;
	skipSegment: (segment: Segment) => Promise<void>;
	repeatSegment: (segment: Segment) => Promise<void>;
}) => {
	const [analysis, setAnalysis] = useState<Awaited<
		ReturnType<typeof analyseTrack>
	> | null>(null);
	const [loading, setLoading] = useState(true);
	const [hoveredSegment, setHoveredSegment] = useState<Segment | null>(null);

	useEffect(() => {
		const fetchAnalysis = async () => {
			const analysis = await analyseTrack(track);
			setAnalysis(analysis);
			setLoading(false);
		};

		fetchAnalysis();
	}, [track]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!analysis) {
		return <div>No analysis found</div>;
	}

	return (
		<div className="flex flex-col gap-4">
			<SongStructureVisualizer
				songData={analysis.result}
				setHoveredSegment={setHoveredSegment}
			/>
			{hoveredSegment && (
				<div className="flex flex-col gap-2">
					<div className="flex gap-2 items-center">
						<Button variant="outline" size="icon" onClick={() => repeatSegment(hoveredSegment)}>
							<Repeat />
						</Button>
						<Button variant="outline" size="icon" onClick={() => skipSegment(hoveredSegment)}>
							<SkipForward />
						</Button>
						<h3 className="text-lg font-bold">{hoveredSegment.label}</h3>
					</div>
					<div className="flex flex-col gap-0.5 max-">
						{"lyrics" in hoveredSegment &&
							hoveredSegment.lyrics.split("\n").map((line, index) => (
								<p key={index} className="text-sm text-muted-foreground">
									{line}
								</p>
							))}
					</div>
				</div>
			)}
		</div>
	);
};
