"use client";

import { formatTime } from "@/lib/utils";
import type { Section } from "@spotify/web-api-ts-sdk";
export interface Segment {
	start: number;
	end: number;
	label: string;
	lyrics: string;
}

interface SongData {
	bpm: number;
	segments: Segment[];
}

interface MergedSegment extends Segment {
	color: string;
	width: number;
}

interface SongStructureVisualizerProps {
	songData: SongData;
	setHoveredSegment: (segment: Segment | null) => void;
}

// Define colors for different segment types
const segmentColors: Record<string, string> = {
	intro: "bg-emerald-500",
	verse: "bg-violet-500",
	chorus: "bg-amber-500",
	bridge: "bg-rose-500",
	solo: "bg-cyan-500",
	inst: "bg-indigo-500",
	outro: "bg-orange-500",
};

export default function SongStructureVisualizer({
	songData,
	setHoveredSegment,
}: SongStructureVisualizerProps) {
	// Function to merge adjacent segments with the same label
	const mergeSegments = (segments: Segment[]): Segment[] => {
		if (!segments.length) return [];

		// Filter out start and end segments
		const filteredSegments = segments.filter(
			(seg) => seg.label !== "start" && seg.label !== "end",
		);

		if (!filteredSegments.length) return [];

		const mergedSegments: Segment[] = [];
		let currentSegment = { ...filteredSegments[0]! };

		for (let i = 1; i < filteredSegments.length; i++) {
			if (filteredSegments[i]?.label === currentSegment.label) {
				// Merge with current segment
				currentSegment.end = filteredSegments[i]?.end ?? 0;
			} else {
				// Add current segment to result and start a new one
				mergedSegments.push(currentSegment);
				currentSegment = { ...filteredSegments[i]! };
			}
		}

		// Add the last segment
		mergedSegments.push(currentSegment);

		return mergedSegments;
	};

	// Process the segments
	const mergedSegments = mergeSegments(songData.segments);

	// Find the actual start and end times after filtering out start/end segments
	const actualStart = mergedSegments.length > 0 ? mergedSegments[0]?.start : 0;
	const actualEnd =
		mergedSegments.length > 0
			? mergedSegments[mergedSegments.length - 1]?.end
			: 0;
	const totalDuration = (actualEnd ?? 0) - (actualStart ?? 0);

	// Calculate widths and assign colors
	const processedSegments: MergedSegment[] = mergedSegments.map((segment) => {
		const duration = segment.end - segment.start;
		const width = (duration / totalDuration) * 100;
		const color = segmentColors[segment.label] || "bg-gray-400";

		return {
			...segment,
			color,
			width,
		};
	});

	return (
		<div className="flex items-center gap-4">
			{/* BPM Circle */}
			<div className="flex-shrink-0 w-16 h-16 rounded-full bg-[--secondary] flex items-center justify-center">
				<div className="text-center">
					<div className="text-xl font-bold">{songData.bpm}</div>
					<div className="text-xs text-[--muted-foreground]">BPM</div>
				</div>
			</div>

			{/* Segment visualization */}
			<div className="relative w-full h-16 bg-gray-100 rounded-lg">
				<div className="absolute inset-0 flex">
					{processedSegments.map((segment, index) => (
						<div
							key={index}
							className={`h-full ${segment.color} relative group ${index === 0 && "rounded-l-lg"} ${index === processedSegments.length - 1 && "rounded-r-lg"}`}
							style={{ width: `${segment.width + 1}%` }}
							onMouseEnter={() => setHoveredSegment(segment)}
						>
							{segment.width > 3 && (
								<div className="absolute inset-0 flex items-center justify-center text-white font-medium text-xs md:text-sm">
									{segment.label}
								</div>
							)}
							<div className="absolute -bottom-4 text-xs">
								<span className="text-primary text-xs">
									{formatTime(segment.start)}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
