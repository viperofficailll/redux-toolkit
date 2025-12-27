export type MediaType = "photo" | "video" | "gif";
export type ActiveTab = "photos" | "videos" | "gif"; // Match the JS values

export interface MediaItem {
  id: string | number;
  type: "photo" | "video" | "gif";
  title: string;
  thumbnail: string;
  src: string;
  url: string;
}

export interface PhotoResponse {
  results: PhotoItem[];
}

export interface PhotoItem {
  id: string;
  alt_description: string | null;
  urls: {
    small: string;
    full: string;
  };
  links: {
    html: string;
  };
}

export interface VideoResponse {
  videos: VideoItem[];
}

export interface VideoItem {
  id: number;
  image: string;
  url: string;
  user: {
    name: string;
  };
  video_files: {
    link: string;
  }[];
}

export interface GifResponse {
  data: {
    results: GifItem[];
  };
}

export interface GifItem {
  id: string;
  title: string;
  url: string;
  media_formats: {
    gif: {
      url: string;
    };
    tinygif: {
      url: string;
    };
  };
}
