import "./App.css";

function App() {
  return (
    <>
      <div
        id="main"
        className="bg-[#80D8C3] h-[100%] w-[100%] relative justify-center  flex"
      >
        <div
          id="header"
          className="bg-[#4DA8DA] w-[500px] h-[75px] left-[500px] top-[50px] absolute  items-center flex justify-center rounded-2xl"
        >
          <div
            id="headingtext"
            className="items-center w-fit h-fit text-2xl font-bold "
          >
            CHILL-REDUX-TODO
          </div>
        </div>
        <div
          id="inputfield"
          className="h-[50px] w-[500px] absolute top-[250px] flex "
        >
          <form className=" flex  justify-between ">
            <input
              type="text"
              placeholder="ADD TASKS"
              className="bg-green-500 w-[380px] text-white px-3 py-2 rounded-lg"
            />

            <input
              type="submit"
              value=" submit"
              className="bg-[#4DA8DA] rounded-2xl px-[50px] py-[15px] text-white font-semibold cursor-pointer"
            />
          </form>
        </div>
      </div>
    </>
  );
}

export default App;
