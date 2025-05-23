"use server";

import type { Track } from "@spotify/web-api-ts-sdk";
import { getSpotifyApi } from "./spotify";

export async function searchTracks(
	userId: string,
	query: string,
): Promise<Track[]> {
	if (!query.trim()) return [];

	try {
		const spotifyApi = await getSpotifyApi(userId);
		const searchResults = await spotifyApi.search(
			query,
			["track"],
			undefined,
			20,
		);

		return searchResults.tracks.items;
	} catch (error) {
		console.error("Failed to search tracks:", error);
		return [];
	}
}
