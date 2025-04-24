import { Search } from "lucide-react";
import { useState, useRef, FormEvent } from "react";

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
        <div className="absolute left-3 text-gray-400">
          <Search size={18} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 text-gray-400 hover:text-white"
          >
            ×
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3">
            <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
          </div>
        )}
      </div>
    </form>
  );
};
