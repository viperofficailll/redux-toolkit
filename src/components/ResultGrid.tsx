import { useEffect } from "react";
import { fetchGifs, fetchPhotos, fetchVideos } from "../api/mediaApi";
import { useAppDispatch, useAppSelector } from "../Redux/hooks";
import {
  setError,
  setLoading,
  setResults,
} from "../Redux/features/searchSlice";
import type {
  GifResponse,
  MediaItem,
  PhotoResponse,
  VideoResponse,
} from "../types/types";

const ResultGrid = () => {
  const { query, activeTab, loading, error, results } = useAppSelector(
    (store) => store.search
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!query) return;

    const getData = async () => {
      try {
        dispatch(setLoading());

        let data: MediaItem[] = [];

        if (activeTab === "photos") {
          const response: PhotoResponse = await fetchPhotos(query, 1, 20);
          data = response.results.map((item) => ({
            id: item.id,
            type: "photo",
            title: item.alt_description ?? "Photo",
            thumbnail: item.urls.small,
            src: item.urls.full,
            url: item.links.html,
          }));
        }

        if (activeTab === "videos") {
          const response: VideoResponse = await fetchVideos(query);
          data = response.videos.map((item) => ({
            id: item.id,
            type: "video",
            title: item.user.name || "Video",
            thumbnail: item.image,
            src: item.video_files[0].link,
            url: item.url,
          }));
        }

        if (activeTab === "gif") {
          const response: GifResponse = await fetchGifs(query);
          data = response.data.results.map((item) => ({
            id: item.id,
            type: "gif",
            title: item.title || "GIF",
            thumbnail: item.media_formats.tinygif.url,
            src: item.media_formats.gif.url,
            url: item.url,
          }));
        }

        dispatch(setResults(data));
      } catch (err) {
        dispatch(setError((err as Error).message));
      }
    };

    getData();
  }, [query, activeTab, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {results.map((item) => (
        <div key={item.id} className="border rounded overflow-hidden">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-2">
            <p className="text-sm truncate">{item.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultGrid;
