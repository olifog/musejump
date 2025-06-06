import { TrackDetails } from "@/components/TrackDetails";
import { getSpotifyApi } from "@/lib/spotify";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

type Props = {
	params: Promise<{ trackId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	try {
		const user = await currentUser();
		if (!user) {
			return {
				title: "Track Details",
				description: "View track details",
			};
		}

		const spotify = await getSpotifyApi(user.id);
		const track = await spotify.tracks.get((await params).trackId);

		return {
			title: `${track.name} - ${track.artists[0]?.name || "Unknown Artist"}`,
			description: `Details for ${track.name} by ${track.artists.map((artist) => artist.name).join(", ")}`,
		};
	} catch (error) {
		return {
			title: "Track Details",
			description: "View track details",
		};
	}
}

export default async function TrackPage({ params }: Props) {
	const user = await currentUser();

	if (!user) {
		redirect("/");
	}

	const spotify = await getSpotifyApi(user.id);
	const track = await spotify.tracks.get((await params).trackId);
	// const trackAnalysis = await spotify.tracks.audioFeatures(track.id);
	// console.log(trackAnalysis);

	return <TrackDetails track={track} />;
}
