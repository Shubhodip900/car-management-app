// src/components/Navbar.js
import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Triggering re-render on user context change
  useEffect(() => {
  }, [user]); // The useEffect will run whenever `user` changes

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        {/* Home Link - Aligned to the left */}
        <Link to="/" className="navbar-brand ms-4">CarEase</Link>

        {/* CarEase Brand - Aligned to the center */}
        <Link to="/" className="navbar-brand">Home</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text me-3">Welcome, {user.username}</span>
                </li>
                <li className="nav-item">
                  <button onClick={handleLogout} className="btn btn-outline-light btn-sm">Logout</button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <div className="d-flex">
                  <Link to="/login" className="nav-link me-3">Login</Link>
                  <Link to="/register" className="nav-link">Register</Link>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;