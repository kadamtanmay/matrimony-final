import axios from 'axios';
import {
  SET_USER,
  LOGOUT,
  SET_LOADING,
  SET_ERROR,
  UPDATE_USER,
  SAVE_PREFERENCES,
  SET_MATCHES,
  SET_DASHBOARD_STATS,
  SET_DASHBOARD_STATS_ERROR
} from './actionTypes';

const BASE_URL = 'http://localhost:8080';

// Action creators
export const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user,
  };
};

export const logout = () => ({
  type: LOGOUT,
});

export const setLoading = (loading) => ({
  type: SET_LOADING,
  payload: loading,
});

export const setError = (error) => ({
  type: SET_ERROR,
  payload: error,
});

export const setMatches = (matches) => ({
  type: SET_MATCHES,
  payload: matches,
});

// Thunk action for login
// In client/src/redux/actions.js, line 58
export const login = (email, password, navigate) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${BASE_URL}/user/login`, { email, password });
    if (response.data) {
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      dispatch(setUser(user));
      
      // FIX: Check user role and redirect accordingly
      if (user.role === 'ADMIN') {
        navigate('/admin');  // Redirect admins to admin panel
      } else {
        navigate('/dashboard');  // Redirect regular users to dashboard
      }
    } else {
      dispatch(setError('Login failed! Invalid credentials.'));
    }
  } catch {
    dispatch(setError('An error occurred during login.'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk action for registering a new user
export const register = (userData) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));
  try {
    const response = await axios.post(
      `${BASE_URL}/user/signup`,
      JSON.stringify(userData),
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (response.data) {
      window.location.href = '/login';
    } else {
      dispatch(setError('Registration failed! Please try again.'));
    }
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Registration failed due to a server issue.'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk action to update user details
export const updateUser = (userData) => async (dispatch) => {
  dispatch(setLoading(true));
  const userId = userData.id;
  try {
    
    const token = localStorage.getItem('token');
    
    const response = await axios.put(
      `${BASE_URL}/user/update/${userId}`,
      userData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    if (response.data) {
      dispatch({ type: UPDATE_USER, payload: response.data });
      return response.data;
    } else {
      dispatch(setError('Failed to update user information.'));
    }
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to update user information.'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Save user preferences
export const savePreferences = (userId, preferences) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${BASE_URL}/user/preferences/save/${userId}`, preferences);
    if (response.data) {
      dispatch({ type: SAVE_PREFERENCES, payload: response.data });
    }
  } catch {
    dispatch(setError('Failed to save preferences.'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Fetch matches
export const fetchMatches = (userId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${BASE_URL}/user/matches/find/${userId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    dispatch(setMatches(response.data));
  } catch (error) {
    console.error('Matches error:', error);
    dispatch(setError('Error fetching matches. Please try again later.'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Fetch dashboard statistics
export const fetchDashboardStats = (userId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${BASE_URL}/user/dashboard-stats/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    dispatch({ type: SET_DASHBOARD_STATS, payload: response.data });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    dispatch(setError('Error fetching dashboard statistics.'));
    dispatch({ type: SET_DASHBOARD_STATS_ERROR, payload: 'Error fetching dashboard statistics.' });
  } finally {
    dispatch(setLoading(false));
  }
};
