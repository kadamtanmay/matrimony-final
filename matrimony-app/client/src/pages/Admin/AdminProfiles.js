import React, { useState, useEffect } from 'react';
import { getAllProfiles, getPendingProfiles, approveProfile, rejectProfile, revokeProfile } from '../../services/adminApi';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import './AdminProfiles.css';

const AdminProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectingProfile, setRejectingProfile] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingProfiles, setProcessingProfiles] = useState(new Set());

  useEffect(() => {
    fetchProfiles();
  }, [filter]);

  useEffect(() => {
    filterProfiles();
  }, [profiles, filter, searchTerm]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      if (filter === 'pending') {
        response = await getPendingProfiles();
      } else {
        response = await getAllProfiles();
      }
      
      
      if (response && response.data) {
        setProfiles(response.data);
      } else {
        setError('Invalid response format from server');
        console.error('Invalid response:', response);
      }
    } catch (err) {
      setError('Failed to fetch profiles: ' + (err.response?.data || err.message));
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    // Apply status filter
    if (filter === 'pending') {
      // Show profiles that are not approved (pending for review)
      filtered = filtered.filter(profile => !profile.profileApproved);
    } else if (filter === 'approved') {
      filtered = filtered.filter(profile => profile.profileApproved);
    } else if (filter === 'rejected') {
      // Show profiles that are not approved (rejected profiles)
      filtered = filtered.filter(profile => !profile.profileApproved);
    }

    // Apply search filter
    if (searchTerm) {
      const searchValue = searchTerm.toLowerCase();
      filtered = filtered.filter(profile => 
        (profile.firstName && profile.firstName.toLowerCase().includes(searchValue)) ||
        (profile.lastName && profile.lastName.toLowerCase().includes(searchValue)) ||
        (profile.email && profile.email.toLowerCase().includes(searchValue))
      );
    }



    setFilteredProfiles(filtered);
  };

  const handleApproveProfile = async (profileId) => {
    if (window.confirm('Are you sure you want to approve this profile?')) {
      try {
        await approveProfile(profileId);
        
        // Update local state immediately for better UX
        setProfiles(prevProfiles => 
          prevProfiles.map(profile => 
            profile.id === profileId ? { ...profile, profileApproved: true } : profile
          )
        );
        alert('Profile approved successfully!');
        
        // Force a re-filter to update the UI immediately
        setTimeout(() => {
          filterProfiles();
        }, 200);
        
        // Refresh the profiles list to ensure consistency with server
        setTimeout(() => fetchProfiles(), 1500);
      } catch (err) {
        alert('Failed to approve profile: ' + (err.response?.data || err.message));
        console.error('Error approving profile:', err);
      }
    }
  };

  const handleRejectProfile = async (profileId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    // Check if profile is already rejected
    const profileToReject = profiles.find(p => p.id === profileId);
    if (profileToReject && !profileToReject.profileApproved) {
      alert('This profile is already rejected!');
      setRejectingProfile(null);
      setRejectionReason('');
      return;
    }

    // Add profile to processing state
    setProcessingProfiles(prev => new Set(prev).add(profileId));
    
    try {
      const response = await rejectProfile(profileId, rejectionReason);
      
      // Update local state immediately for better UX
      setProfiles(prevProfiles => {
        const profileToUpdate = prevProfiles.find(p => p.id === profileId);
        
        if (!profileToUpdate) {
          console.error('Profile not found in current state! Profile ID:', profileId);
          return prevProfiles; // Don't update if profile not found
        }
        
        const updatedProfiles = prevProfiles.map(profile => 
          profile.id === profileId ? { ...profile, profileApproved: false } : profile
        );
        
        return updatedProfiles;
      });
      
      setRejectingProfile(null);
      setRejectionReason('');
      alert('Profile rejected successfully!');
      
      // Force a re-filter to update the UI immediately
      setTimeout(() => {
        filterProfiles();
      }, 200);
      
      // Also trigger a filter update after a short delay to ensure state is updated
      setTimeout(() => {
        filterProfiles();
      }, 50);
      
      // Refresh the profiles list to ensure consistency with server
      setTimeout(() => fetchProfiles(), 1500);
    } catch (err) {
      console.error('Error rejecting profile:', err);
      alert('Failed to reject profile: ' + (err.response?.data || err.message));
    } finally {
      // Remove profile from processing state
      setProcessingProfiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
    }
  };

  const handleRevokeProfile = async (profileId) => {
    if (window.confirm('Are you sure you want to revoke approval for this profile?')) {
      try {
        await revokeProfile(profileId);
        
        // Update local state immediately for better UX
        setProfiles(prevProfiles => 
          prevProfiles.map(profile => 
            profile.id === profileId ? { ...profile, profileApproved: false } : profile
          )
        );
        alert('Profile approval revoked successfully!');
        
        // Force a re-filter to update the UI immediately
        setTimeout(() => {
          filterProfiles();
        }, 200);
        
        // Refresh the profiles list to ensure consistency with server
        setTimeout(() => fetchProfiles(), 1500);
      } catch (err) {
        alert('Failed to revoke profile approval: ' + (err.response?.data || err.message));
        console.error('Error revoking profile approval:', err);
      }
    }
  };



  const ProfileCard = ({ profile }) => (
    <div className={`profile-card ${profile.profileApproved ? 'approved' : 'rejected'} ${processingProfiles.has(profile.id) ? 'processing' : ''}`}>
      <div className="profile-header">
        <div className="profile-avatar">
          <i className="fas fa-user"></i>
        </div>
        <div className="profile-info">
          <h4>{profile.firstName} {profile.lastName}</h4>
          <p className="profile-email">{profile.email}</p>
          <div className="profile-meta">
            <span className="badge bg-primary">{profile.gender || 'N/A'}</span>
            <span className="badge bg-info">{profile.age || 'N/A'} years</span>
            <span className="badge bg-secondary">{profile.location || 'N/A'}</span>
          </div>
        </div>
        <div className="profile-status">
          <span className={`badge ${profile.profileApproved ? 'bg-success' : 'bg-danger'}`}>
            {profile.profileApproved ? 'Approved' : 'Rejected'}
          </span>
          {processingProfiles.has(profile.id) && (
            <span className="badge bg-info ms-2">
              <i className="fas fa-spinner fa-spin"></i> Processing
            </span>
          )}
        </div>
      </div>

      <div className="profile-details">
        <div className="detail-row">
          <span className="detail-label">Religion:</span>
          <span className="detail-value">{profile.religion || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Caste:</span>
          <span className="detail-value">{profile.caste || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Education:</span>
          <span className="detail-value">{profile.education || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Profession:</span>
          <span className="detail-value">{profile.profession || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Annual Income:</span>
          <span className="detail-value">{profile.annualIncome || 'N/A'}</span>
        </div>
        {profile.bio && (
          <div className="detail-row">
            <span className="detail-label">Bio:</span>
            <span className="detail-value">{profile.bio}</span>
          </div>
        )}
      </div>

      <div className="profile-actions">
        {profile.profileApproved ? (
          <button 
            className="btn btn-warning btn-sm"
            onClick={() => handleRevokeProfile(profile.id)}
            disabled={processingProfiles.has(profile.id)}
          >
            <i className="fas fa-undo"></i> Revoke Approval
          </button>
        ) : (
          <>
            <button 
              className="btn btn-success btn-sm"
              onClick={() => handleApproveProfile(profile.id)}
              disabled={processingProfiles.has(profile.id)}
            >
              <i className="fas fa-check"></i> Approve
            </button>
                        {/* Show Reject button for profiles that can be rejected */}
            {profile.profileApproved === true && (
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => setRejectingProfile(profile)}
                disabled={processingProfiles.has(profile.id)}
              >
                <i className="fas fa-times"></i> Reject
              </button>
            )}
            {/* Show info message for rejected profiles */}
            {profile.profileApproved === false && (
              <small className="text-muted d-block mt-2">
                <i className="fas fa-info-circle"></i> Profile already rejected
              </small>
            )}
          </>
        )}
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

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Profile Management</h1>
          <p>Review and manage user profiles</p>
          <div className="admin-header-buttons">
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={fetchProfiles}
              title="Refresh profiles list"
            >
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>

        <div className="controls-section">
          <div className="filter-controls">
            <div className="btn-group" role="group">
              <button 
                type="button" 
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('all')}
              >
                All Profiles
              </button>
              <button 
                type="button" 
                className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button 
                type="button" 
                className={`btn ${filter === 'approved' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('approved')}
              >
                Approved
              </button>
              <button 
                type="button" 
                className={`btn ${filter === 'rejected' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilter('rejected')}
              >
                Rejected
              </button>
            </div>
          </div>

          <div className="search-controls">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setSearchTerm('')}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
            <button 
              className="btn btn-outline-danger ms-3"
              onClick={fetchProfiles}
            >
              Retry
            </button>
          </div>
        )}

        <div className="profiles-grid">
          {filteredProfiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="no-results">
            <p>No profiles found matching your criteria.</p>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectingProfile && (
          <div className="rejection-modal">
            <div className="rejection-modal-content">
              <h4>Reject Profile: {rejectingProfile.firstName} {rejectingProfile.lastName}</h4>
              <div className="form-group">
                <label htmlFor="rejectionReason">Reason for Rejection:</label>
                <textarea
                  id="rejectionReason"
                  className="form-control"
                  rows="4"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this profile..."
                />
              </div>
              <div className="modal-actions">
                <button 
                  className="btn btn-danger"
                  onClick={() => handleRejectProfile(rejectingProfile.id)}
                >
                  Reject Profile
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setRejectingProfile(null);
                    setRejectionReason('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfiles;
