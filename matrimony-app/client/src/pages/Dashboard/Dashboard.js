import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchMatches, fetchDashboardStats } from '../../redux/actions';
import './Dashboard.css';

const Dashboard = () => {
  const user = useSelector((state) => state.user);
  const matches = useSelector((state) => state.matches);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const dashboardStats = useSelector((state) => state.dashboardStats);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Re-add this state for profile images
  const [profileImages, setProfileImages] = useState({});
  // Filtered matches list
  const [filteredMatches, setFilteredMatches] = useState([]);
  // Add pending requests state
  const [pendingRequests, setPendingRequests] = useState([]);

  // Fetch pending requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`http://localhost:8080/pending-requests/pending/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Handle the correct response format: { success: true, requests: [...] }
        if (response.data.success && response.data.requests) {
          setPendingRequests(response.data.requests);
        } else {
          setPendingRequests([]);
        }
        
        // Refresh dashboard stats to ensure consistency with pending requests count
        dispatch(fetchDashboardStats(user.id));
      } catch (error) {
        console.error('Failed to fetch pending requests:', error);
        setPendingRequests([]);
      }
    };
    
    if (user) {
      fetchPendingRequests();
    }
  }, [user, dispatch]);

  // Handle accept request
  const handleAcceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/pending-requests/accept/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      // Refresh dashboard stats to update the pending requests count
      dispatch(fetchDashboardStats(user.id));
      alert('Request accepted successfully!');
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Failed to accept request');
    }
  };
    useEffect(() => {
    // Redirect admins to admin panel
    if (user && user.role === 'ADMIN') {
      navigate('/admin');
    }
  }, [user, navigate]);

  // Handle reject request
  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/pending-requests/reject/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh pending requests
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      // Refresh dashboard stats to update the pending requests count
      dispatch(fetchDashboardStats(user.id));
      alert('Request rejected successfully!');
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Failed to reject request');
    }
  };

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMatches(user.id));
      dispatch(fetchDashboardStats(user.id));
    }
  }, [user, dispatch]);

  useEffect(() => {
    setFilteredMatches(matches);
  }, [matches]);

  useEffect(() => {
    const fetchProfileImages = async () => {
      const newImages = {};
      for (const match of matches) {
        try {
          const res = await axios.get(
            'http://localhost:8080/profile-picture',
            { params: { userId: match.id } }
          );
          newImages[match.id] = res.data;
        } catch {
          newImages[match.id] =
            'https://media.istockphoto.com/id/1681388313/vector/cute-baby-panda-cartoon-on-white-background.jpg';
        }
      }
      setProfileImages(newImages);
    };
    if (matches.length > 0) fetchProfileImages();
  }, [matches]);

  if (!user) return <Navigate to="/login" />;

  const stats = [
    { label: 'Total Matches', value: dashboardStats.totalMatches || 0 },
    { label: 'New Messages', value: dashboardStats.newMessages || 0 },
    { label: 'Pending Requests', value: dashboardStats.pendingRequests || 0 },
    { label: 'Profile Views', value: dashboardStats.profileViews || 0 },
  ];

  const actions = [
    { label: 'View Matches', icon: 'fa-heart', color: 'text-danger', path: '/matches' },
    { label: 'Messages', icon: 'fa-envelope', color: 'text-primary', path: '/message' },
    { label: 'Profile', icon: 'fa-user', color: 'text-warning', path: '/profile' },
  ];

  const profileCompletion = 85;
  const topMatches = filteredMatches.slice(0, 3);

  const refreshDashboard = () => {
    if (user?.id) {
      dispatch(fetchDashboardStats(user.id));
      dispatch(fetchMatches(user.id));
      // Also refresh pending requests
      const fetchPendingRequests = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:8080/pending-requests/pending/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Handle the correct response format: { success: true, requests: [...] }
          if (response.data.success && response.data.requests) {
            setPendingRequests(response.data.requests);
          } else {
            setPendingRequests([]);
          }
        } catch (error) {
          console.error('Failed to fetch pending requests:', error);
        }
      };
      fetchPendingRequests();
    }
  };

  return (
      <div className="container-fluid p-4">
        <div className="mb-4">
          <h1>Welcome, {user.firstName}</h1>
          <p>{user.bio}</p>
        </div>

        <div className="mt-4">
          <h4>Profile Completion</h4>
          <div className="progress" style={{ height: '25px' }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${profileCompletion}%` }}
            >
              {profileCompletion}%
            </div>
          </div>
        </div>

        <div className="row g-3 mt-4">
          {stats.map((stat, idx) => (
            <div className="col-lg-3 col-md-6 col-sm-12" key={idx}>
              <div className="card stats-card h-100">
                <div className="card-body text-center">
                  <h4 className="mb-2">{stat.value}</h4>
                  <p className="text-muted mb-0">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3 mt-4 justify-content-center">
          {actions.map((action, idx) => (
            <div className="col-md-3 col-sm-6" key={idx}>
              <Link to={action.path} className="text-decoration-none">
                <div className="card text-center border h-100 simple-card">
                  <div className="card-body">
                    <i className={`fa ${action.icon} fa-2x mb-2 ${action.color}`} />
                    <h6 className="mb-0">{action.label}</h6>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* ✅ PENDING REQUESTS SECTION - MOVED INSIDE RETURN */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5>Pending Requests ({pendingRequests.length})</h5>
              </div>
              <div className="card-body">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((request, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center border-bottom py-2">
                      <div>
                        <strong>{request.sender.firstName} {request.sender.lastName}</strong>
                        <p className="text-muted mb-0">Sent you a connection request</p>
                        <small className="text-muted">{new Date(request.timestamp).toLocaleDateString()}</small>
                      </div>
                      <div>
                        <button 
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          Accept
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No pending requests</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h4>Top Matches</h4>
          <div className="row g-4">
            {loading ? (
              <p>Loading matches...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : topMatches.length > 0 ? (
              topMatches.map((match, idx) => (
                <div className="col-lg-4 col-md-6 col-sm-12" key={idx}>
                  <div className="card shadow-lg border-0 h-100">
                    <div className="card-body text-center">
                      <img
                        src={
                          profileImages[match.id] ||
                          'https://media.istockphoto.com/id/1681388313/vector/cute-baby-panda-cartoon-on-white-background.jpg'
                        }
                        className="card-img-top rounded-circle mx-auto mb-3"
                        alt={match.firstName}
                        style={{
                          width: '150px',
                          height: '150px',
                          objectFit: 'cover',
                        }}
                      />
                      <h3 className="card-title mb-2">{match.firstName}</h3>
                      <p className="text-muted">Profession: {match.profession}</p>
                      <p className="text-muted">Marital Status: {match.maritalStatus}</p>
                      <p className="text-muted">Date of Birth: {match.dateOfBirth}</p>
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          navigate(`/view-profile/${match.firstName}`, { state: { match } })
                        }
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No matches found.</p>
            )}
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
