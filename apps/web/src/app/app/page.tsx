import { AppContent } from "@/components/AppContent";
import { getSpotifyApi } from "@/lib/spotify";
import { searchTracks } from "@/lib/spotify-actions";
import { auth } from "@clerk/nextjs/server";
import type { Track } from "@spotify/web-api-ts-sdk";

export default async function App() {
	const { userId, redirectToSignIn } = await auth();
	if (!userId) {
		return redirectToSignIn();
	}

	const spotifyApi = await getSpotifyApi(userId);

	const user = await spotifyApi.currentUser.profile();
	const recentlyPlayed = await spotifyApi.player.getRecentlyPlayedTracks(50);
	const topTracks = await spotifyApi.currentUser.topItems(
		"tracks",
		"medium_term",
		50,
	);

	// Function to handle track search
	const handleSearch = async (query: string): Promise<Track[]> => {
		"use server";
		return searchTracks(userId, query);
	};

	return (
		<AppContent
			user={user}
			recentlyPlayed={recentlyPlayed.items}
			topTracks={topTracks.items}
			onSearch={handleSearch}
		/>
	);
}
