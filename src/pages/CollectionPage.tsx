import { useAppSelector, useAppDispatch } from "../Redux/hooks";
import {
  removeItem,
  clearCollection,
  clearedToast,
  removeToast,
} from "../Redux/features/collectionSlice";
import type { MediaItem } from "../types/types";

const CollectionPage = () => {
  const dispatch = useAppDispatch();
  const items: MediaItem[] = useAppSelector((store) => store.collection.items);

  if (items.length === 0) {
    return (
      <h1 className="text-2xl font-bold p-10">
        No items in your collection yet.
      </h1>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Your Collection</h1>

      <button
        onClick={() => {
          dispatch(clearCollection());
          dispatch(clearedToast());
        }}
        className="mb-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Clear Collection
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative rounded overflow-hidden shadow-lg"
          >
            {item.type === "photo" || item.type === "gif" ? (
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-64 object-cover"
              />
            ) : item.type === "video" ? (
              <video
                src={item.src}
                autoPlay
                loop
                muted
                className="w-full h-64 object-cover"
              />
            ) : null}

            <div className="p-4 flex justify-between items-center bg-white">
              <h2 className="font-semibold text-lg">{item.title}</h2>
              <button
                onClick={() => {
                  dispatch(removeItem(item.id));
                  dispatch(removeToast());
                }}
                className="text-red-600 font-bold hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionPage;
