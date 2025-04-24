"use client";

import { useState } from "react";
import { UserHeader } from "@/components/UserHeader";
import { RecentlyPlayedSection } from "@/components/RecentlyPlayedSection";
import { TopTracksSection } from "@/components/TopTracksSection";
import { SearchSection } from "@/components/SearchSection";
import { TrackModal } from "@/components/TrackModal";
import { Track, PlayHistory, UserProfile } from "@spotify/web-api-ts-sdk";

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
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const handleTrackClick = (track: Track) => {
    setSelectedTrack(track);
  };

  const handleCloseModal = () => {
    setSelectedTrack(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <UserHeader user={user} />

      <SearchSection onSearch={onSearch} onTrackClick={handleTrackClick} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <RecentlyPlayedSection
          tracks={recentlyPlayed}
          onTrackClick={handleTrackClick}
        />
        <TopTracksSection tracks={topTracks} onTrackClick={handleTrackClick} />
      </div>

      <TrackModal track={selectedTrack} onClose={handleCloseModal} />
    </div>
  );
};
