import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/actions';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h3>Admin Panel</h3>
      </div>
      
      <nav className="admin-sidebar-nav">
        <ul>
          <li className={isActive('/admin') ? 'active' : ''}>
            <Link to="/admin">
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </Link>
          </li>
          
          <li className={isActive('/admin/users') ? 'active' : ''}>
            <Link to="/admin/users">
              <i className="fas fa-users"></i>
              Users
            </Link>
          </li>
          
          <li className={isActive('/admin/profiles') ? 'active' : ''}>
            <Link to="/admin/profiles">
              <i className="fas fa-user-check"></i>
              Profiles
            </Link>
          </li>
          

        </ul>
      </nav>
      
      <div className="admin-sidebar-footer">
        <button 
          className="btn btn-outline-danger btn-sm"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
