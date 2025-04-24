import { clerkClient } from "@clerk/nextjs/server";
import { env } from "@/env";
import { SpotifyApi, type AccessToken } from "@spotify/web-api-ts-sdk";

export async function getSpotifyApi(userId: string) {
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

  return spotifyApi;
}
