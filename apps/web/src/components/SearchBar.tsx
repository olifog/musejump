import { Search, X, Loader2 } from "lucide-react";
import { useState, useRef, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export const SearchBar = ({
  onSearch,
  placeholder = "Search for songs, artists or albums...",
  isLoading = false,
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <form className="relative w-full" onSubmit={handleSubmit}>
      <div className="relative flex items-center">
        <Search
          size={18}
          className="absolute left-3 text-muted-foreground pointer-events-none"
        />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10"
          disabled={isLoading}
        />
        {query && !isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-2 h-7 w-7 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X size={16} />
          </Button>
        )}
        {isLoading && (
          <Loader2
            size={18}
            className="absolute right-3 animate-spin text-muted-foreground"
          />
        )}
      </div>
    </form>
  );
};
