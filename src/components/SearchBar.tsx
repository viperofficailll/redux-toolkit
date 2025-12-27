import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setQuery } from "../Redux/features/searchSlice";

const SearchBar = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <div>
      <form
        onSubmit={(e) => {
          submitHandler(e);
          dispatch(setQuery(search));
        }}
        className=" flex p-10 gap-5 bg-gray-900"
      >
        <input
          required
          className="border-2 px-4 py-2 text-xl rounded outline-none"
          type="text"
          placeholder=" Search Anything"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <button className="border-2 px-4 py-2 text-xl rounded outline-none cursor-pointer active:scale-95">
          {" "}
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
