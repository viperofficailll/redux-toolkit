import type { MediaItem } from "../types/types";
import { useAppDispatch } from "../Redux/hooks";
import { addedToast, addItem } from "../Redux/features/collectionSlice";

interface ResultCardProps {
  item: MediaItem;
}

const ResultCard = ({ item }: ResultCardProps) => {
  const dispatch = useAppDispatch();

  const saveToCollection = (media: MediaItem) => {
    dispatch(addItem(media));
    dispatch(addedToast());
  };

  return (
    <div className="result-card-enhanced">
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="result-card-link"
      >
        <div className="result-card-media-container">
          {item.type === "photo" && (
            <img
              className="result-card-media"
              src={item.src}
              alt={item.title}
              loading="lazy"
            />
          )}

          {item.type === "video" && (
            <video
              className="result-card-media"
              autoPlay
              loop
              muted
              src={item.src}
              aria-label={item.title}
            />
          )}

          {item.type === "gif" && (
            <img
              className="result-card-media"
              src={item.src}
              alt={item.title}
              loading="lazy"
            />
          )}
          
          {/* Gradient overlay for better text readability */}
          <div className="result-card-overlay"></div>
        </div>
      </a>

      <div className="result-card-content">
        <h2 className="result-card-title">
          {item.title}
        </h2>

        <button
          onClick={() => saveToCollection(item)}
          className="result-card-save-button"
          aria-label={`Save ${item.title} to collection`}
        >
          <span className="result-card-save-text">Save</span>
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
