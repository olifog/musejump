"use client";

import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { TrackList } from "./TrackList";
import { Track } from "@spotify/web-api-ts-sdk";
import { Skeleton } from "./ui/skeleton";

interface SearchSectionProps {
  onSearch: (query: string) => Promise<Track[]>;
  onTrackClick?: (track: Track) => void;
}

export const SearchSection = ({
  onSearch,
  onTrackClick,
}: SearchSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Track[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 mb-3">
      <h2 className="text-sm uppercase tracking-wider text-gray-400 font-bold mb-3">
        Search Tracks
      </h2>
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
        </div>
      ) : hasSearched ? (
        <div className="mt-4 max-h-[40vh] overflow-y-auto">
          <TrackList
            tracks={results}
            onTrackClick={onTrackClick}
            emptyMessage="No tracks found. Try a different search."
          />
        </div>
      ) : null}
    </div>
  );
};
