import { Routes, Route } from "react-router-dom";
import Homepage from "../pages/Homepage";
import CollectionPage from "../pages/CollectionPage";

const Approutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/collection" element={<CollectionPage />} />
    </Routes>
  );
};

export default Approutes;
