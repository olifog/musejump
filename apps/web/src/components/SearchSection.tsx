"use client";

import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { TrackList } from "./TrackList";
import { Track } from "@spotify/web-api-ts-sdk";
import { Skeleton } from "./ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchSectionProps {
  onSearch: (query: string) => Promise<Track[]>;
}

export const SearchSection = ({ onSearch }: SearchSectionProps) => {
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
    <Card className="mb-3">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-bold">
          Search Tracks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {isLoading && (
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
        )}
        {!isLoading && hasSearched && (
          <ScrollArea className="mt-4 h-[40vh] pr-2">
            <TrackList
              tracks={results}
              emptyMessage="No tracks found. Try a different search."
            />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
