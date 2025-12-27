import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./redux/store";
import { decrement, increment } from "./redux/features/counterSlice";

const App = () => {
  const dispatch = useDispatch();
  const displaycount = useSelector((state:RootState)=>state.counter.value);
  return (
    <>
      <div>
        <h1>{displaycount}</h1>

        <button onClick={() => {
          dispatch(increment())
        }}> Increment </button>
        <button onClick={() => {dispatch(decrement())}}> Decrement </button>
      </div>
    </>
  );
};

export default App;
