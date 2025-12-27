import axios from "axios";

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY as string;
const PEXELS_KEY = import.meta.env.VITE_PEXELS_KEY as string;
const TENOR_KEY = import.meta.env.VITE_TENOR_KEY as string;

export const fetchPhotos = async (query: string, page = 1, per_page = 20) => {
  const res = await axios.get("https://api.unsplash.com/search/photos", {
    params: { query, page, per_page },
    headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
  });
  return res.data;
};

export const fetchVideos = async (query: string, per_page = 20) => {
  const res = await axios.get("https://api.pexels.com/videos/search", {
    params: { query, per_page },
    headers: { Authorization: PEXELS_KEY },
  });
  return res.data;
};

export const fetchGifs = async (query: string, limit = 20) => {
  const res = await axios.get("https://tenor.googleapis.com/v2/search", {
    params: { q: query, key: TENOR_KEY, limit },
  });
  return { data: { results: res.data.results } };
};
