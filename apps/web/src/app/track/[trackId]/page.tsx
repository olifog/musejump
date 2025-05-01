import { Metadata } from "next";
import { getSpotifyApi } from "@/lib/spotify";
import { TrackDetails } from "@/components/TrackDetails";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type Props = {
  params: { trackId: string };
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        title: "Track Details",
        description: "View track details"
      };
    }

    const spotify = await getSpotifyApi(user.id);
    const track = await spotify.tracks.get(params.trackId);
    
    return {
      title: `${track.name} - ${track.artists[0]?.name || "Unknown Artist"}`,
      description: `Details for ${track.name} by ${track.artists.map(artist => artist.name).join(", ")}`
    };
  } catch (error) {
    return {
      title: "Track Details",
      description: "View track details"
    };
  }
}

export default async function TrackPage({ params }: Props) {
  const user = await currentUser();
  
  if (!user) {
    redirect("/");
  }
  
  const spotify = await getSpotifyApi(user.id);
  const track = await spotify.tracks.get(params.trackId);
  
  return <TrackDetails track={track} />;
}
