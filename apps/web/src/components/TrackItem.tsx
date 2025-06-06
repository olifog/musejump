"use client";

import { useTRPC } from "@/trpc/client";
import type { Track } from "@spotify/web-api-ts-sdk";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface TrackItemProps {
	track: Track;
	index?: number;
	rightElement?: React.ReactNode;
}

export const TrackItem = ({ track, index, rightElement }: TrackItemProps) => {
	const trpc = useTRPC();
	const router = useRouter();

	const { data: jumps } = useQuery(
		trpc.jumps.getJumps.queryOptions({
			songId: track.id,
		}),
	);

	const handleClick = () => {
		router.push(`/track/${track.id}`);
	};

	return (
		<div
			className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg transition cursor-pointer"
			onClick={handleClick}
		>
			{index !== undefined && (
				<div className="w-5 text-center text-xs text-muted-foreground">
					{index + 1}
				</div>
			)}

			{track.album.images?.[0]?.url && (
				<div className="relative h-7 w-7 flex-shrink-0">
					<Image
						src={track.album.images[0].url}
						alt={track.name}
						fill
						className="object-cover rounded"
					/>
				</div>
			)}

			<div className="min-w-0 flex-1">
				<p className="font-medium truncate">{track.name}</p>
				<p className="text-muted-foreground text-sm truncate">
					{track.artists.map((artist) => artist.name).join(", ")}
				</p>
			</div>

			{jumps && jumps.length > 0 && (
				<div className="text-primary-foreground text-xs rounded-full bg-primary w-6 h-6 flex items-center justify-center">
					{jumps.length}
				</div>
			)}

			{rightElement}
		</div>
	);
};
