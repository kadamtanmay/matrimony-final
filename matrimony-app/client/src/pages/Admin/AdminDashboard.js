import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/adminApi';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <i className={icon}></i>
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <div className="error-message">
            <div className="alert alert-danger" role="alert">
              {error}
              <button 
                className="btn btn-outline-danger ms-3"
                onClick={fetchDashboardStats}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome to the matrimony application admin panel</p>
        </div>

        <div className="stats-grid">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon="fas fa-users"
            color="#007bff"
          />
          <StatCard
            title="Active Users"
            value={stats?.activeUsers || 0}
            icon="fas fa-user-check"
            color="#28a745"
          />
          <StatCard
            title="Recently Registered"
            value={stats?.recentlyRegistered || 0}
            icon="fas fa-user-plus"
            color="#ffc107"
          />
          <StatCard
            title="Approved Profiles"
            value={stats?.approvedProfiles || 0}
            icon="fas fa-check-circle"
            color="#17a2b8"
          />
          <StatCard
            title="Pending Profiles"
            value={stats?.pendingProfiles || 0}
            icon="fas fa-clock"
            color="#dc3545"
          />
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/admin/users'}
            >
              <i className="fas fa-users"></i>
              Manage Users
            </button>
            <button 
              className="btn btn-success"
              onClick={() => window.location.href = '/admin/profiles'}
            >
              <i className="fas fa-user-check"></i>
              Review Profiles
            </button>

          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <i className="fas fa-info-circle text-info"></i>
              <span>Dashboard loaded successfully</span>
              <small>{new Date().toLocaleString()}</small>
            </div>
            <div className="activity-item">
              <i className="fas fa-chart-line text-success"></i>
              <span>Statistics updated</span>
              <small>{new Date().toLocaleString()}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
