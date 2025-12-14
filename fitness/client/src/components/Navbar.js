import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isTrainer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <i className="fas fa-dumbbell"></i> FitPlanHub
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/trainers" className="nav-link">Trainers</Link>
          
          {isAuthenticated ? (
            <>
              {isTrainer ? (
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              ) : (
                <>
                  <Link to="/feed" className="nav-link">My Feed</Link>
                  <Link to="/my-plans" className="nav-link">My Plans</Link>
                </>
              )}
              
              <span className="nav-link" style={{ cursor: 'default' }}>
                Hi, {user.name}! ({user.role})
              </span>
              
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
