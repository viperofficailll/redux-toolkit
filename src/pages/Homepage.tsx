import Navbar from "../components/Navbar";
import ResultGrid from "../components/ResultGrid";
import SearchBar from "../components/SearchBar";
import Tabs from "../components/Tabs";
import { useAppSelector } from "../Redux/hooks";

const Homepage = () => {
  const query = useAppSelector((store) => store.search.query);

  return (
    <>
    <div >

      <Navbar />
      <SearchBar />

      {query && (
          <div>
          <Tabs />
          <ResultGrid />
        </div>
      )}
      </div>
    </>
  );
};

export default Homepage;
