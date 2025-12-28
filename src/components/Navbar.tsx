import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar-enhanced">
      <Link to="/" className="navbar-brand">
        MediaSearch
      </Link>
      <div className="navbar-links">
        <Link
          className="navbar-link"
          to="/"
        >
          Search
        </Link>
        <Link
          className="navbar-link"
          to="/collection"
        >
          Collection
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
