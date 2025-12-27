import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./redux/store";
import {
  decrement,
  decrementbyamount,
  incementbyamount,
  increment,
} from "./redux/features/counterSlice";
import { useState } from "react";

const App = () => {
  const dispatch = useDispatch();
  const [num, setnum] = useState(5);
  const displaycount = useSelector((state: RootState) => state.counter.value);
  return (
    <>
      <div>
        <h1>{displaycount}</h1>

        <button
          onClick={() => {
            dispatch(increment());
          }}
        >
          {" "}
          Increment{" "}
        </button>
        <button
          onClick={() => {
            dispatch(decrement());
          }}
        >
          {" "}
          Decrement{" "}
        </button>

        <input type="number" value={num} onChange={(e) => setnum(Number(e.target.value))} />
        <button
          onClick={() => {
            dispatch(incementbyamount(num));
          }}
        >
          Incement by value
        </button>
        <button
          onClick={() => {
            dispatch(decrementbyamount(num));
          }}
        >
          Decrement by value
        </button>
      </div>
    </>
  );
};

export default App;
