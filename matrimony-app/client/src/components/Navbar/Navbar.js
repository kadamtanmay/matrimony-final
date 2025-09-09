import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/actions';


const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    // Dispatch logout action to clear user state
    dispatch(logout());
    // Redirect to homepage
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Matrimony</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                {user.role === 'ADMIN' ? (
                  // Admin users only see logout button
                  <li className="nav-item">
                    <button className="btn nav-link text-white" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-1"></i>
                      Logout
                    </button>
                  </li>
                ) : (
                  // Regular users see only Home (Dashboard) and Logout
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/dashboard">Home</Link>
                    </li>
                    <li className="nav-item">
                      <button className="btn nav-link" onClick={handleLogout}>Logout</button>
                    </li>
                  </>
                )}
              </>
            ) : (
              // Non-authenticated users see login/signup
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">Signup</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
