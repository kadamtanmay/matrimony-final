import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchMatches } from '../../redux/actions';

const Matches = () => {
  const user = useSelector((state) => state.user);
  const matches = useSelector((state) => state.matches);
  const loading = useSelector((state) => state.loading);
  const error = useSelector((state) => state.error);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State to store profile images and search/filter state
  const [profileImages, setProfileImages] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    age: '',
    caste: '',
    religion: '',
    profession: ''
  });
  const [filteredMatches, setFilteredMatches] = useState(matches);

  useEffect(() => {
    if (user) {
      dispatch(fetchMatches(user.id)); // Fetch matches for the logged-in user
    }
  }, [user, dispatch]);

  useEffect(() => {
    // Fetch profile images for each match
    const fetchProfileImages = async () => {
      const newProfileImages = {};
      for (const match of matches) {
        try {
          const response = await axios.get('http://localhost:8080/profile-picture', { params: { userId: match.id } });
          newProfileImages[match.id] = response.data; // Save profile image URL with match id as key
        } catch (error) {
          console.error("Error fetching profile image", error);
          newProfileImages[match.id] = 'https://media.istockphoto.com/id/1681388313/vector/cute-baby-panda-cartoon-on-white-background.jpg?s=612x612&w=0&k=20&c=qFrzn8TqONiSfwevvkYhys1z80NAmDfw3o-HRdwX0d8='; // Default image URL
        }
      }
      setProfileImages(newProfileImages); // Update state with profile images
    };

    if (matches.length > 0) {
      fetchProfileImages();
    }
  }, [matches]); // Re-fetch profile images when matches change

  useEffect(() => {
    filterMatches(searchTerm, filters);
  }, [matches, searchTerm, filters]);

  // Function to filter matches based on search and filters
  const filterMatches = (search, appliedFilters) => {
    let results = matches;

    if (search) {
      results = results.filter((match) =>
        match.firstName.toLowerCase().includes(search.toLowerCase()) // Matching case-insensitively
      );
    }

    Object.keys(appliedFilters).forEach((key) => {
      if (appliedFilters[key]) {
        results = results.filter((match) => 
          match[key]?.toLowerCase().includes(appliedFilters[key].toLowerCase()) // Matching case-insensitively
        );
      }
    });

    setFilteredMatches(results);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
  };

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
      <div className="container-fluid p-4">
        <h1>Matches</h1>

        {/* Search Bar */}
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearch}
        />

        {/* Filters */}
        <div className="row mb-4">
          <div className="col">
            <select
              name="age"
              className="form-select"
              value={filters.age}
              onChange={handleFilterChange}
            >
              <option value="">Age</option>
              {/* Populate age options */}
              <option value="18-25">18-25</option>
              <option value="26-35">26-35</option>
              <option value="36-45">36-45</option>
            </select>
          </div>
          <div className="col">
            <select
              name="caste"
              className="form-select"
              value={filters.caste}
              onChange={handleFilterChange}
            >
              <option value="">Caste</option>
              {/* Populate caste options */}
              <option value="General">GENERAL</option>
              <option value="OBC">OBC</option>
              <option value="SC/ST">SC/ST</option>
            </select>
          </div>
          <div className="col">
            <select
              name="religion"
              className="form-select"
              value={filters.religion}
              onChange={handleFilterChange}
            >
              <option value="">Religion</option>
              {/* Populate religion options */}
              <option value="Hindu">Hindu</option>
              <option value="Muslim">Muslim</option>
              <option value="Christian">Christian</option>
            </select>
          </div>
          <div className="col">
            <select
              name="profession"
              className="form-select"
              value={filters.profession}
              onChange={handleFilterChange}
            >
              <option value="">Profession</option>
              {/* Populate profession options */}
              <option value="Engineer">Engineer</option>
              <option value="Doctor">Doctor</option>
              <option value="Teacher">Teacher</option>
            </select>
          </div>
        </div>

        {/* Display Matches */}
        <div className="row g-4">
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match, index) => (
              <div className="col-lg-4 col-md-6 col-sm-12" key={index}>
                <div className="card shadow-lg border-0 h-100">
                  <div className="card-body text-center">
                    {/* Fetch profile image from the state */}
                    <img
                      src={profileImages[match.id] || 'https://media.istockphoto.com/id/1681388313/vector/cute-baby-panda-cartoon-on-white-background.jpg?s=612x612&w=0&k=20&c=qFrzn8TqONiSfwevvkYhys1z80NAmDfw3o-HRdwX0d8='}
                      className="card-img-top rounded-circle mx-auto mb-3"
                      alt={match.firstName}
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                    <h3 className="card-title mb-2">{match.firstName}</h3>
                    <p className="text-muted">Profession: {match.profession}</p>
                    <p className="text-muted">Marital Status: {match.maritalStatus}</p>
                    <p className="text-muted">Date of Birth: {match.dateOfBirth}</p>
                    <button
  className="btn btn-primary"
  onClick={() => navigate(`/view-profile/${match.firstName}`, { 
    state: { 
      match: match,
      userId: match.id  // Add userId explicitly for easier access
    } 
  })}
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
  );
};

export default Matches;
