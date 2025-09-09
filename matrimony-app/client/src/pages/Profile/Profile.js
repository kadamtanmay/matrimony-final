import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import { updateUser } from '../../redux/actions';
import axios from 'axios';

const Profile = () => {
  const currentUser = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { userName } = useParams();
  const location = useLocation();
  
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [profileUser, setProfileUser] = useState(null);

  // Pending request and connection states
  const [isConnected, setIsConnected] = useState(false);
  const [requestSent, setRequestSent] = useState(false);



  // Check if this is own profile or viewing another user's profile
  useEffect(() => {
    if (location.pathname.includes('view-profile')) {
      setIsOwnProfile(false);

      if (location.state?.match) {
        setProfileUser(location.state.match);
        setFormData(location.state.match);
      } else {
        const nameFromUrl = decodeURIComponent(userName || '');
        const nameParts = nameFromUrl.split(' ');
        const tempProfileUser = {
          id: 999, // temporary ID
          firstName: nameParts[0] || nameFromUrl,
          lastName: nameParts.slice(1).join(' ') || '',
          email: 'demo1@matrimoni.com',
          phone: '09172143507',
          dateOfBirth: '2025-07-01',
          maritalStatus: 'SINGLE',
          gender: 'MALE',
          religion: 'h',
          address: 'Not Available',
          annualIncome: 'Not Available',
          caste: 'Not Available',
          motherTongue: 'Not Available',
          education: 'Not Available',
          location: 'Not Available',
          hobbies: 'Not Available',
          profession: 'Not Available',
          bio: 'Bio not available'
        };

        setProfileUser(tempProfileUser);
        setFormData(tempProfileUser);
      }
    } else {
      setIsOwnProfile(true);
      setProfileUser(currentUser);
      setFormData({ ...currentUser });
    }
  }, [userName, currentUser, location.pathname, location.state]);

  // Ensure formData is properly initialized when currentUser changes
  useEffect(() => {
    if (currentUser && isOwnProfile && !location.pathname.includes('view-profile')) {
      setFormData({ ...currentUser });
    }
  }, [currentUser, isOwnProfile, location.pathname]);

  // ✅ Separate useEffect for recording profile views
  useEffect(() => {
    const recordProfileView = async () => {
      if (!isOwnProfile && profileUser && currentUser && profileUser.id !== 999) {
        try {
          const token = localStorage.getItem('token');
          await axios.post(
            `http://localhost:8080/user/profile/view/${profileUser.id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.error('Failed to record profile view:', error);
        }
      }
    };

    if (profileUser && currentUser) {
      recordProfileView();
    }
  }, [isOwnProfile, profileUser, currentUser]);

  // Get user's profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const userId = isOwnProfile ? currentUser.id : profileUser?.id;
        if (!userId || userId === 999) return;

        const response = await axios.get(`http://localhost:8080/profile-picture`, {
          params: { userId: userId }
        });
        if (response.data) {
          setImageUrl(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile picture");
      }
    };

    if (profileUser) {
      fetchProfilePicture();
    }
  }, [isOwnProfile, currentUser?.id, profileUser]);

  // Check request/connection status
  useEffect(() => {
    const checkStatus = async () => {
      if (isOwnProfile || !profileUser || !currentUser || profileUser.id === 999) {
        return;
      }

      try {
        const token = localStorage.getItem('token');


        const connectedResp = await axios.get('http://localhost:8080/pending-requests/is-connected', {
          params: { userId1: currentUser.id, userId2: profileUser.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsConnected(connectedResp.data.connected);

        const sentResp = await axios.get('http://localhost:8080/pending-requests/has-sent', {
          params: { senderId: currentUser.id, receiverId: profileUser.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequestSent(sentResp.data.hasSent);

      } catch (error) {
        console.error('Error checking status:', error);
        setIsConnected(false);
        setRequestSent(false);
      }
    };

    checkStatus();
  }, [isOwnProfile, currentUser, profileUser]);

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [name]: value,
      };
      return newData;
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    const form = new FormData();
    form.append("file", file);
    form.append("userId", currentUser.id);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again to upload profile picture');
        return;
      }
      
      const response = await axios.post("http://localhost:8080/profile-picture/upload", form, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });
      
      if (response.data.success) {
        alert('Profile picture uploaded successfully!');
        // Update the image URL to show the new picture
        setImageUrl(response.data.fileUrl);
        // Clear the file input
        setFile(null);
        // Reset the file input element
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        alert('Upload failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      if (error.response?.data?.error) {
        alert('Upload failed: ' + error.response.data.error);
      } else if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        alert('Access denied. You can only upload pictures for your own account.');
      } else {
        alert('Upload failed. Please try again.');
      }
    }
  };

  const handleSaveClick = async () => {
    try {
      
      // Clean up the data
      const dataToSend = { ...formData };
      
      // Remove empty values
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '' || dataToSend[key] === 'no' || dataToSend[key] === 'Not Available') {
          dataToSend[key] = null;
        }
        
        // Convert age to integer if it's a valid number
        if (key === 'age' && dataToSend[key] !== null) {
          const ageValue = parseInt(dataToSend[key]);
          if (!isNaN(ageValue)) {
            dataToSend[key] = ageValue;
          } else {
            dataToSend[key] = null;
          }
        }
      });
      
      // Ensure dateOfBirth is in the correct format
      if (dataToSend.dateOfBirth && typeof dataToSend.dateOfBirth === 'string') {
        // If it's a string, ensure it's in YYYY-MM-DD format
        const date = new Date(dataToSend.dateOfBirth);
        if (!isNaN(date.getTime())) {
          dataToSend.dateOfBirth = date.toISOString().split('T')[0];
        }
      }
      
      
      const result = await dispatch(updateUser(dataToSend));
      if (result) {
        alert('Profile updated successfully!');
        setIsEditing(false);
        // Update user data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Function to get current user from backend if not in Redux state
  const getCurrentUserFromBackend = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }
      
      const response = await axios.get('http://localhost:8080/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
    return null;
  };

  // Enhanced send request function
  const handleSendRequest = async () => {
    if (profileUser.id === 999) {
      alert('Cannot send request - need real user ID');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again to send requests');
        return;
      }
      
      // Get current user - either from Redux state or backend
      let senderUser = currentUser;
      if (!senderUser || !senderUser.id) {
        senderUser = await getCurrentUserFromBackend();
        if (!senderUser || !senderUser.id) {
          alert('Unable to identify current user. Please login again.');
          return;
        }
      }
      
      const response = await axios.post('http://localhost:8080/pending-requests/send', null, {
        params: { senderId: senderUser.id, receiverId: profileUser.id },
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setRequestSent(true);
        alert('Request sent successfully!');
      } else {
        alert('Failed to send request: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      if (error.response?.data?.error) {
        alert('Failed to send request: ' + error.response.data.error);
      } else if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        alert('Access denied. You can only send requests from your own account.');
      } else if (error.response?.status === 400) {
        alert('Bad request: ' + (error.response.data?.error || 'Invalid parameters'));
      } else if (error.response?.status === 500) {
        alert('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR') {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('Failed to send request. Please try again.');
      }
    }
  };

  const handleSendMessage = () => {
    window.location.href = `/messages/${profileUser.id}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '20px'
    }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          padding: '40px',
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '80px',
            height: '80px',
            background: '#e2e8f0',
            borderRadius: '50%',
            opacity: '0.3'
          }}></div>

          {/* Profile Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#64748b',
              borderRadius: '50%',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                </svg>
              )}
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a202c',
              margin: '0 0 8px 0'
            }}>
              {formData.firstName} {formData.lastName}
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#718096',
              margin: '0 0 16px 0'
            }}>
              {formData.email}
            </p>
            
            {/* Profile Picture Upload - Only for own profile */}
            {isOwnProfile && (
              <div style={{ marginBottom: '24px' }}>
                                 <input
                   type="file"
                   accept="image/*"
                   onChange={handleFileChange}
                   style={{ display: 'none' }}
                   id="profile-picture-input"
                 />
                <label
                  htmlFor="profile-picture-input"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: '#64748b',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(100, 116, 139, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Upload Photo
                </label>
                {file && (
                  <button
                    onClick={handleUpload}
                    style={{
                      marginLeft: '12px',
                      padding: '8px 16px',
                      background: '#38a169',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(56, 161, 105, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Save Photo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1a202c',
              margin: '0 0 20px 0',
              textAlign: 'center'
            }}>
              Profile Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                  <strong style={{ color: '#1a202c' }}>Phone:</strong> {formData.phone || "Not Available"}
                </p>
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                  <strong style={{ color: '#1a202c' }}>Date of Birth:</strong> {formData.dateOfBirth || "Not Available"}
                </p>
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                  <strong style={{ color: '#1a202c' }}>Religion:</strong> {formData.religion || "Not Available"}
                </p>
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                  <strong style={{ color: '#1a202c' }}>Address:</strong> {formData.address || "Not Available"}
                </p>
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                  <strong style={{ color: '#1a202c' }}>Location:</strong> {formData.location || "Not Available"}
                </p>
              </div>
              <div>
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                  <strong style={{ color: '#1a202c' }}>Annual Income:</strong> {formData.annualIncome || "Not Available"}
                </p>
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                  <strong style={{ color: '#1a202c' }}>Caste:</strong> {formData.caste || "Not Available"}
                </p>
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                  <strong style={{ color: '#1a202c' }}>Marital Status:</strong> {formData.maritalStatus || "Not Available"}
                </p>
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                  <strong style={{ color: '#1a202c' }}>Mother Tongue:</strong> {formData.motherTongue || "Not Available"}
                </p>
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                  <strong style={{ color: '#1a202c' }}>Education:</strong> {formData.education || "Not Available"}
                </p>
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                  <strong style={{ color: '#1a202c' }}>Gender:</strong> {formData.gender || "Not Available"}
                </p>
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                  <strong style={{ color: '#1a202c' }}>Hobbies:</strong> {formData.hobbies || "Not Available"}
                </p>
                <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                  <strong style={{ color: '#1a202c' }}>Profession:</strong> {formData.profession || "Not Available"}
                </p>
              </div>
            </div>

            {/* Bio Section */}
            {formData.bio && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a202c',
                  margin: '0 0 12px 0'
                }}>
                  About Me
                </h4>
                <p style={{
                  fontSize: '16px',
                  color: '#4a5568',
                  lineHeight: '1.6',
                  margin: '0'
                }}>
                  {formData.bio}
                </p>
              </div>
            )}

            {/* Only show edit button for own profile */}
            {isOwnProfile && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '12px 24px',
                    background: '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(100, 116, 139, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons - Only for other users' profiles */}
          {!isOwnProfile && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {isConnected ? (
                  <button 
                    onClick={handleSendMessage}
                    style={{
                      padding: '12px 24px',
                      background: '#64748b',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(100, 116, 139, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Send Message
                  </button>
                ) : requestSent ? (
                  <button 
                    disabled
                    style={{
                      padding: '12px 24px',
                      background: '#a0aec0',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'not-allowed'
                    }}
                  >
                    Request Sent
                  </button>
                ) : (
                  <button 
                    onClick={handleSendRequest}
                    style={{
                      padding: '12px 24px',
                      background: '#ed8936',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(237, 137, 54, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Send Request
                  </button>
                )}
                <button 
                  style={{
                    padding: '12px 24px',
                    background: '#e53e3e',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(229, 62, 62, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Report Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal - Only for own profile */}
      {isEditing && isOwnProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              background: '#64748b',
              color: 'white',
              padding: '24px',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                margin: 0
              }}>
                Edit Profile
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <form onSubmit={(e) => e.preventDefault()}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  {Object.keys(formData).filter(key => key !== 'id' && key !== 'password' && key !== 'role' && key !== 'isActive' && key !== 'profileApproved' && key !== 'createdAt' && key !== 'subscriptionStatus').map((key) => (
                    <div key={key}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#4a5568',
                        marginBottom: '8px'
                      }}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/\_/g, ' ')}
                      </label>
                      {key === 'dateOfBirth' ? (
                        <input
                          type="date"
                          name={key}
                          value={formData[key] || ""}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            height: '48px',
                            padding: '0 16px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#64748b';
                            e.target.style.boxShadow = '0 0 0 3px rgba(100, 116, 139, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      ) : key === 'gender' ? (
                        <select
                          name={key}
                          value={formData[key] || ""}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            height: '48px',
                            padding: '0 16px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxSizing: 'border-box',
                            background: 'white'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#64748b';
                            e.target.style.boxShadow = '0 0 0 3px rgba(100, 116, 139, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value="">Select Gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      ) : key === 'maritalStatus' ? (
                        <select
                          name={key}
                          value={formData[key] || ""}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            height: '48px',
                            padding: '0 16px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxSizing: 'border-box',
                            background: 'white'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#64748b';
                            e.target.style.boxShadow = '0 0 0 3px rgba(100, 116, 139, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value="">Select Marital Status</option>
                          <option value="SINGLE">Single</option>
                          <option value="MARRIED">Married</option>
                          <option value="DIVORCED">Divorced</option>
                          <option value="WIDOWED">Widowed</option>
                        </select>
                      ) : key === 'bio' ? (
                        <textarea
                          name={key}
                          rows="3"
                          value={formData[key] || ""}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself..."
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxSizing: 'border-box',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#64748b';
                            e.target.style.boxShadow = '0 0 0 3px rgba(100, 116, 139, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      ) : (
                        <input
                          type="text"
                          name={key}
                          value={formData[key] || ""}
                          onChange={handleInputChange}
                          placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toLowerCase())}`}
                          style={{
                            width: '100%',
                            height: '48px',
                            padding: '0 16px',
                            border: '2px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#64748b';
                            e.target.style.boxShadow = '0 0 0 3px rgba(100, 116, 139, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: '12px 24px',
                  background: '#a0aec0',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(160, 174, 192, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClick}
                style={{
                  padding: '12px 24px',
                  background: '#64748b',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(100, 116, 139, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
