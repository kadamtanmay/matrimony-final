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

const initialState = {
  user: null,
  matches: [],
  loading: false,
  error: null,
  preferences: {},            // ensure this exists
  dashboardStats: {
    totalMatches: 0,
    newMessages: 0,
    pendingRequests: 0,
    profileViews: 0,
  },
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };

    case UPDATE_USER:
      return { ...state, user: action.payload };

    case LOGOUT:
      return {
        ...state,
        user: null,
        preferences: {},
        matches: [],
      };

    case SET_LOADING:
      return { ...state, loading: action.payload };

    case SET_ERROR:
      return { ...state, error: action.payload };

    case SAVE_PREFERENCES:
      return { ...state, preferences: action.payload };

    case SET_MATCHES:
      return { ...state, matches: action.payload };

    case SET_DASHBOARD_STATS:
      return {
        ...state,
        dashboardStats: action.payload,
      };

    case SET_DASHBOARD_STATS_ERROR:
      return {
        ...state,
        // Optionally clear stats or leave as-is
        dashboardStats: {
          totalMatches: 0,
          newMessages: 0,
          pendingRequests: 0,
          profileViews: 0,
        },
      };

    default:
      return state;
  }
};

export default userReducer;
