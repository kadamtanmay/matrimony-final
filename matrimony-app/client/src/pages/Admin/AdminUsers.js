import React, { useState, useEffect } from 'react';
import { getAllUsers, searchUsers, updateUser, softDeleteUser, restoreUser } from '../../services/adminApi';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, searchField, showDeleted]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const searchValue = searchTerm.toLowerCase();
        switch (searchField) {
          case 'name':
            return (user.firstName && user.firstName.toLowerCase().includes(searchValue)) ||
                   (user.lastName && user.lastName.toLowerCase().includes(searchValue));
          case 'email':
            return user.email && user.email.toLowerCase().includes(searchValue);
          case 'gender':
            return user.gender && user.gender.toLowerCase().includes(searchValue);
          default:
            return true;
        }
      });
    }

    // Filter by active/deleted status
    if (!showDeleted) {
      filtered = filtered.filter(user => user.isActive);
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  const handleSaveUser = async () => {
    try {
      await updateUser(editingUser.id, editingUser);
      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      setEditingUser(null);
      alert('User updated successfully!');
    } catch (err) {
      alert('Failed to update user');
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await softDeleteUser(userId);
        setUsers(users.map(user => 
          user.id === userId ? { ...user, isActive: false } : user
        ));
        alert('User deleted successfully!');
      } catch (err) {
        alert('Failed to delete user');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleRestoreUser = async (userId) => {
    try {
      await restoreUser(userId);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: true } : user
      ));
      alert('User restored successfully!');
    } catch (err) {
      alert('Failed to restore user');
      console.error('Error restoring user:', err);
    }
  };

  const UserRow = ({ user }) => (
    <tr key={user.id} className={!user.isActive ? 'deleted-user' : ''}>
      <td>
        <div className="user-info">
          <div className="user-name">
            {user.firstName} {user.lastName}
          </div>
          <div className="user-email">{user.email}</div>
        </div>
      </td>
      <td>{user.gender || 'N/A'}</td>
      <td>{user.age || 'N/A'}</td>
      <td>{user.location || 'N/A'}</td>
      <td>
        <span className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
          {user.role}
        </span>
      </td>
      <td>
        <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
          {user.isActive ? 'Active' : 'Deleted'}
        </span>
      </td>
      <td>
        <span className={`badge ${user.profileApproved ? 'bg-success' : 'bg-warning'}`}>
          {user.profileApproved ? 'Approved' : 'Pending'}
        </span>
      </td>
      <td>
        <div className="action-buttons">
          {editingUser?.id === user.id ? (
            <>
              <button 
                className="btn btn-success btn-sm"
                onClick={handleSaveUser}
                title="Save Changes"
              >
                <i className="fas fa-save"></i> Save
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setEditingUser(null)}
                title="Cancel Edit"
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => handleEditUser(user)}
                title="Edit User"
              >
                <i className="fas fa-edit"></i> Edit
              </button>
              {user.isActive ? (
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteUser(user.id)}
                  title="Delete User"
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              ) : (
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => handleRestoreUser(user.id)}
                  title="Restore User"
                >
                  <i className="fas fa-undo"></i> Restore
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const EditableField = ({ field, value, onChange }) => (
    <input
      type="text"
      className="form-control form-control-sm"
      value={value || ''}
      onChange={(e) => onChange(field, e.target.value)}
    />
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
          <h1>User Management</h1>
          <p>Manage all registered users in the system</p>
        </div>

        <div className="controls-section">
          <div className="search-controls">
            <div className="input-group">
              <select 
                className="form-select"
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="gender">Gender</option>
              </select>
              <input
                type="text"
                className="form-control"
                placeholder={`Search by ${searchField}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setSearchTerm('')}
                title="Clear Search"
              >
                <i className="fas fa-times"></i> Clear
              </button>
            </div>
          </div>

          <div className="filter-controls">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="showDeleted"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="showDeleted">
                Show Deleted Users
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
            <button 
              className="btn btn-outline-danger ms-3"
              onClick={fetchUsers}
            >
              Retry
            </button>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>User</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Location</th>
                <th>Role</th>
                <th>Status</th>
                <th>Profile</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="no-results">
            <p>No users found matching your criteria.</p>
          </div>
        )}

        {editingUser && (
          <div className="edit-modal-overlay" onClick={() => setEditingUser(null)}>
            <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="edit-modal-header">
                <h4>Edit User: {editingUser.firstName} {editingUser.lastName}</h4>
                <button 
                  className="btn-close" 
                  onClick={() => setEditingUser(null)}
                  aria-label="Close"
                ></button>
              </div>
              
              <div className="edit-form">
                {/* Basic Information */}
                <div className="form-section">
                  <h6 className="section-title">Basic Information</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">First Name *</label>
                      <EditableField 
                        field="firstName" 
                        value={editingUser.firstName} 
                        onChange={(field, value) => setEditingUser({...editingUser, [field]: value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name *</label>
                      <EditableField 
                        field="lastName" 
                        value={editingUser.lastName} 
                        onChange={(field, value) => setEditingUser({...editingUser, [field]: value})} 
                      />
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label className="form-label">Email *</label>
                      <EditableField 
                        field="email" 
                        value={editingUser.email} 
                        onChange={(field, value) => setEditingUser({...editingUser, [field]: value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <EditableField 
                        field="phone" 
                        value={editingUser.phone} 
                        onChange={(field, value) => setEditingUser({...editingUser, [field]: value})} 
                      />
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label className="form-label">Gender</label>
                      <select 
                        className="form-select"
                        value={editingUser.gender || ''}
                        onChange={(e) => setEditingUser({...editingUser, gender: e.target.value})}
                      >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Age</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editingUser.age || ''}
                        onChange={(e) => setEditingUser({...editingUser, age: parseInt(e.target.value) || null})}
                        min="18"
                        max="100"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Address */}
                <div className="form-section">
                  <h6 className="section-title">Location & Address</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Location</label>
                      <EditableField 
                        field="location" 
                        value={editingUser.location} 
                        onChange={(field, value) => setEditingUser({...editingUser, [field]: value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={editingUser.address || ''}
                        onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="form-section">
                  <h6 className="section-title">Personal Details</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Marital Status</label>
                      <select 
                        className="form-select"
                        value={editingUser.maritalStatus || 'SINGLE'}
                        onChange={(e) => setEditingUser({...editingUser, maritalStatus: e.target.value})}
                      >
                        <option value="SINGLE">Single</option>
                        <option value="MARRIED">Married</option>
                        <option value="DIVORCED">Divorced</option>
                        <option value="WIDOWED">Widowed</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Religion</label>
                      <EditableField 
                        field="religion" 
                        value={editingUser.religion} 
                        onChange={(field, value) => setEditingUser({...editingUser, [field]: value})} 
                      />
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label className="form-label">Caste</label>
                      <EditableField 
                        field="caste" 
                        value={editingUser.caste} 
                        onChange={(field, value) => setEditingUser({...editingUser, [field]: value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Mother Tongue</label>
                      <EditableField 
                        field="motherTongue" 
                        value={editingUser.motherTongue} 
                        onChange={(field, value) => setEditingUser({...editingUser, [field]: value})} 
                      />
                    </div>
                  </div>
                </div>

                {/* Education & Profession */}
                <div className="form-section">
                  <h6 className="section-title">Education & Profession</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Education</label>
                      <EditableField 
                        field="education" 
                        value={editingUser.education} 
                        onChange={(field, value) => setEditingUser({...editingUser, [field]: value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Profession</label>
                      <EditableField 
                        field="profession" 
                        value={editingUser.profession} 
                        onChange={(field, value) => setEditingUser({...editingUser, [field]: value})} 
                      />
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label className="form-label">Annual Income</label>
                      <EditableField 
                        field="annualIncome" 
                        value={editingUser.annualIncome} 
                        onChange={(field, value) => setEditingUser({...editingUser, [field]: value})} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Hobbies</label>
                      <EditableField 
                        field="hobbies" 
                        value={editingUser.hobbies} 
                        onChange={(field, value) => setEditingUser({...editingUser, [field]: value})} 
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="form-section">
                  <h6 className="section-title">Bio</h6>
                  <div className="row">
                    <div className="col-12">
                      <label className="form-label">Bio</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={editingUser.bio || ''}
                        onChange={(e) => setEditingUser({...editingUser, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                        maxLength="500"
                      />
                      <small className="form-text text-muted">
                        {editingUser.bio ? editingUser.bio.length : 0}/500 characters
                      </small>
                    </div>
                  </div>
                </div>

                {/* Admin Settings */}
                <div className="form-section">
                  <h6 className="section-title">Admin Settings</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Role</label>
                      <select 
                        className="form-select"
                        value={editingUser.role}
                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Profile Status</label>
                      <select 
                        className="form-select"
                        value={editingUser.profileApproved ? 'true' : 'false'}
                        onChange={(e) => setEditingUser({...editingUser, profileApproved: e.target.value === 'true'})}
                      >
                        <option value="false">Pending</option>
                        <option value="true">Approved</option>
                      </select>
                    </div>
                  </div>
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label className="form-label">Account Status</label>
                      <select 
                        className="form-select"
                        value={editingUser.isActive ? 'true' : 'false'}
                        onChange={(e) => setEditingUser({...editingUser, isActive: e.target.value === 'true'})}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Subscription Status</label>
                      <select 
                        className="form-select"
                        value={editingUser.subscriptionStatus || 0}
                        onChange={(e) => setEditingUser({...editingUser, subscriptionStatus: parseInt(e.target.value)})}
                      >
                        <option value="0">Free</option>
                        <option value="1">Premium</option>
                        <option value="2">VIP</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer with Action Buttons */}
              <div className="edit-modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  <i className="fas fa-times me-2"></i>
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveUser}
                >
                  <i className="fas fa-save me-2"></i>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
