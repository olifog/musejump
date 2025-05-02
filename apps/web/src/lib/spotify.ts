import { env } from "@/env";
import { clerkClient } from "@clerk/nextjs/server";
import { type AccessToken, SpotifyApi } from "@spotify/web-api-ts-sdk";

const spotifyApiCache = new Map<string, SpotifyApi>();

export async function getSpotifyApi(userId: string) {
	if (spotifyApiCache.has(userId)) {
		const spotifyApi = spotifyApiCache.get(userId);
		if (spotifyApi) {
			const accessToken = await spotifyApi.getAccessToken();
			if (accessToken?.expires_in && accessToken.expires_in < 1000) {
				spotifyApiCache.delete(userId);
			} else {
				return spotifyApi;
			}
		}
	}

	const clerk = await clerkClient();
	const tokenResponse = await clerk.users.getUserOauthAccessToken(
		userId,
		"spotify",
	);

	if (!tokenResponse.data[0]) {
		throw new Error("No token response");
	}

	const accessToken: AccessToken = {
		access_token: tokenResponse.data[0].token,
		token_type: "Bearer",
		expires_in: tokenResponse.data[0].expiresAt ?? 0,
		refresh_token: "",
	};

	const spotifyApi = SpotifyApi.withAccessToken(
		env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
		accessToken,
	);

	// Store in cache
	spotifyApiCache.set(userId, spotifyApi);

	return spotifyApi;
}
