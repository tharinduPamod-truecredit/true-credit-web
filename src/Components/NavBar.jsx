import { Link } from "react-router-dom";
import { useState } from "react";
import "./NavBar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-logo">TRUE CREDIT</h1>

        <div className="menu-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </div>

        <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)}>
            About
          </Link>
          <Link
            to="/login"
            className="login-btn"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
