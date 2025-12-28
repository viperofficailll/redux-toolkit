import { useState } from "react";
import { useDispatch } from "react-redux";
import { setQuery } from "../Redux/features/searchSlice";

const SearchBar = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = search.trim();
    if (!trimmed) return;

    // Set loading state
    setIsLoading(true);

    try {
      // Dispatch the search query
      dispatch(setQuery(trimmed));
      
      // Simulate API call delay for loading animation
      await new Promise(resolve => setTimeout(resolve, 800));
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <form 
      onSubmit={submitHandler} 
      className="searchbar-enhanced"
      role="form"
    >
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        required
        className={`search-input-enhanced ${isLoading ? 'search-input-loading' : ''}`}
        type="text"
        placeholder="Search anything..."
        disabled={isLoading}
        aria-label="Search for media content"
      />

      <button
        type="submit"
        className={`search-button-enhanced ${isLoading ? 'search-button-loading' : ''}`}
        disabled={isLoading}
        aria-label={isLoading ? "Searching..." : "Search"}
      >
        <span className="button-text">
          {isLoading ? "Searching..." : "Search"}
        </span>
      </button>
    </form>
  );
};

export default SearchBar;
