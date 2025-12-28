import { configureStore } from "@reduxjs/toolkit";
import searchreducer from "./features/searchSlice";
import collectionreducer from "./features/collectionSlice";

export const store = configureStore({
  reducer: {
    search: searchreducer,
    collection: collectionreducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
