import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/actions";
import axios from "axios";
import "./Sidebar.css";

const Sidebar = () => {
  const [messageCount, setMessageCount] = useState(0);
  const user = useSelector((state) => state.user); // Getting user data from Redux store
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch unread messages from backend when the component mounts or user changes
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (!user || !user.id) return; // Check if user exists and has an ID

      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get(
          `http://localhost:8080/messages/unreadCount/${user.id}`, // API endpoint to get unread messages count
          { headers }
        );
        
        // Handle the new response format: {success: true, unreadCount: number}
        let unreadCount = 0;
        if (response.data && response.data.success && typeof response.data.unreadCount === 'number') {
          unreadCount = response.data.unreadCount;
        } else if (typeof response.data === 'number') {
          // Fallback for old format
          unreadCount = response.data;
        }
        
        setMessageCount(unreadCount); // Set unread message count
      } catch (error) {
        // Silently handle error - don't log to console in production
        setMessageCount(0); // Default to 0 if error occurs
      }
    };

    fetchUnreadMessages();
    
    // Listen for refresh events from other components
    const handleRefreshUnreadCount = () => {
      fetchUnreadMessages();
    };
    
    window.addEventListener('refreshUnreadCount', handleRefreshUnreadCount);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('refreshUnreadCount', handleRefreshUnreadCount);
    };
  }, [user]); // Run the effect when the user state changes

  return (
    <div className="sidebar d-flex flex-column">
      <h3 className="text-center text-white mb-4">💍 Matrimony</h3>
      <ul className="list-unstyled">
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/matches"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Matches
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/message"
            className={({ isActive }) =>
              `nav-link position-relative ${isActive ? "active" : ""}`
            }
          >
            Messages
            {messageCount > 0 && (
              <span className="badge rounded-circle bg-danger text-white position-absolute top-0 start-100 translate-middle">
                {messageCount}
              </span>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Profile
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/SelectPreferences"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Select Preferences
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/subscription"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Subscription
          </NavLink>
        </li>
        
      </ul>
    </div>
  );
};

export default Sidebar;
