import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { MediaItem } from "../../types/types";
import { toast } from "react-toastify";

interface CollectionState {
  items: MediaItem[];
}

// Load initial items from localStorage
const initialState: CollectionState = {
  items: JSON.parse(localStorage.getItem("collection") || "[]"),
};

const collectionSlice = createSlice({
  name: "collection",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<MediaItem>) => {
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
        localStorage.setItem("collection", JSON.stringify(state.items));
      }
    },
    removeItem: (state, action: PayloadAction<number | string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      localStorage.setItem("collection", JSON.stringify(state.items));
    },
    clearCollection: (state) => {
      state.items = [];
      localStorage.setItem("collection", "[]");
    },
    addedToast: () => {
      toast("Added to Collection");
    },
    removeToast: () => {
      toast("Removed from collection");
    },
    clearedToast: () => {
      toast("Collection cleared successufully");
    },
  },
});

export const {
  addItem,
  removeItem,
  clearCollection,
  addedToast,
  clearedToast,
  removeToast,
} = collectionSlice.actions;
export default collectionSlice.reducer;
