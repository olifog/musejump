"use client";

import { RecentlyPlayedSection } from "@/components/RecentlyPlayedSection";
import { SearchSection } from "@/components/SearchSection";
import { TopTracksSection } from "@/components/TopTracksSection";
import { UserHeader } from "@/components/UserHeader";
import type { PlayHistory, Track, UserProfile } from "@spotify/web-api-ts-sdk";

interface AppContentProps {
	user: UserProfile;
	recentlyPlayed: PlayHistory[];
	topTracks: Track[];
	onSearch: (query: string) => Promise<Track[]>;
}

export const AppContent = ({
	user,
	recentlyPlayed,
	topTracks,
	onSearch,
}: AppContentProps) => {
	return (
		<div className="min-h-screen bg-background text-foreground p-4">
			<UserHeader user={user} />

			<SearchSection onSearch={onSearch} />

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<RecentlyPlayedSection tracks={recentlyPlayed} />
				<TopTracksSection tracks={topTracks} />
			</div>
		</div>
	);
};
