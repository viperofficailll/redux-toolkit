import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ActiveTab, MediaItem } from "../../types/types";

interface SearchState {
  query: string;
  activeTab: ActiveTab; // Changed from activetabs
  results: MediaItem[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  query: "",
  activeTab: "photos", // Changed from activetabs
  results: [],
  loading: false,
  error: null,
};

export const searchSlice = createSlice({
  name: "searchSlice",
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setActiveTabs: (state, action: PayloadAction<ActiveTab>) => {
      state.activeTab = action.payload; // Changed from activetabs
    },
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setResults: (state, action: PayloadAction<MediaItem[]>) => {
      state.results = action.payload;
      state.loading = false;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearResults: (state) => {
      state.results = [];
    },
  },
});

export const {
  setQuery,
  setActiveTabs,
  setLoading,
  setResults,
  setError,
  clearResults,
} = searchSlice.actions;

export default searchSlice.reducer;
