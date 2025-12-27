import { setActiveTabs } from "../Redux/features/searchSlice";
import { useAppDispatch, useAppSelector } from "../Redux/hooks";

const Tabs = () => {
  const tabs = ["photos", "videos", "gif"] as const; // Match JS values
  const dispatch = useAppDispatch();
  const currtab = useAppSelector((state) => state.search.activeTab); // Changed from activetabs

  return (
    <div className="flex gap-10 p-10">
      {tabs.map((elem, i) => {
        return (
          <button
            className={` ${
              currtab === elem ? "bg-blue-600" : "bg-gray-600"
            } px-5 py-2 rounded uppercase cursor-pointer active:scale-95 transition`}
            key={i}
            onClick={() => {
              dispatch(setActiveTabs(elem));
            }}
          >
            {elem}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
