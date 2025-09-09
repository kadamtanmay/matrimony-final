import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { savePreferences } from "../../redux/actions";

const SelectPreferences = () => {
  const dispatch = useDispatch();

  // Get user details from Redux state
  const user = useSelector((state) => state.user); // Adjust path based on your store structure

  const [preferences, setPreferences] = useState({
    age: "",
    location: "",
    religion: "",
    caste: "",
    education: "",
    profession: "",
    gender: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      console.error("User ID is missing. Cannot save preferences.");
      return;
    }

    // Dispatch action to save preferences with user ID
    dispatch(savePreferences(user.id, preferences));
  };

  return (
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          padding: '40px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
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

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#64748b',
              borderRadius: '50%',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 1.138 1.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-1.138 1.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-1.138-1.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 1.138-1.138z"/>
              </svg>
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a202c',
              margin: '0 0 8px 0'
            }}>
              Select Your Preferences
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#718096',
              margin: '0'
            }}>
              Customize your search criteria to find your perfect match
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {/* Age */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#4a5568',
                  marginBottom: '8px'
                }}>
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={preferences.age}
                  onChange={handleChange}
                  min="18"
                  max="100"
                  placeholder="Enter preferred age"
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
              </div>

              {/* Location */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#4a5568',
                  marginBottom: '8px'
                }}>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={preferences.location}
                  onChange={handleChange}
                  placeholder="Enter preferred location"
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
              </div>

              {/* Religion */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#4a5568',
                  marginBottom: '8px'
                }}>
                  Religion
                </label>
                <select
                  name="religion"
                  value={preferences.religion}
                  onChange={handleChange}
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
                  <option value="">Select Religion</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Christian">Christian</option>
                  <option value="Sikh">Sikh</option>
                </select>
              </div>

              {/* Caste */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#4a5568',
                  marginBottom: '8px'
                }}>
                  Caste
                </label>
                <select
                  name="caste"
                  value={preferences.caste}
                  onChange={handleChange}
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
                  <option value="">Select Caste</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>

              {/* Education */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#4a5568',
                  marginBottom: '8px'
                }}>
                  Education
                </label>
                <input
                  type="text"
                  name="education"
                  value={preferences.education}
                  onChange={handleChange}
                  placeholder="Enter education qualification"
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
              </div>

              {/* Profession */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#4a5568',
                  marginBottom: '8px'
                }}>
                  Profession
                </label>
                <select
                  name="profession"
                  value={preferences.profession}
                  onChange={handleChange}
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
                  <option value="">Select Profession</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Artist">Artist</option>
                  <option value="Lawyer">Lawyer</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                </select>
              </div>

              {/* Gender - Full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#4a5568',
                  marginBottom: '8px'
                }}>
                  Gender
                </label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#4a5568'
                  }}>
                    <input
                      type="radio"
                      name="gender"
                      value="MALE"
                      checked={preferences.gender === "MALE"}
                      onChange={handleChange}
                      style={{
                        transform: 'scale(1.2)',
                        accentColor: '#64748b'
                      }}
                    />
                    Male
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#4a5568'
                  }}>
                    <input
                      type="radio"
                      name="gender"
                      value="FEMALE"
                      checked={preferences.gender === "FEMALE"}
                      onChange={handleChange}
                      style={{
                        transform: 'scale(1.2)',
                        accentColor: '#64748b'
                      }}
                    />
                    Female
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button
                type="submit"
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  height: '48px',
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
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default SelectPreferences;
