import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import Matches from './pages/Matches/Matches';
import Dashboard from './pages/Dashboard/Dashboard';

import { DarkModeProvider } from './components/Context/DarkModeContext';
import Message from './pages/Mesage/Message';
import MessageScreen from './pages/MessageScreen/MessageScreen';
import ViewProfile from './pages/ViewProfile/ViewProfile';
import SelectPreferences from './pages/SelectPreferences/SelectPreferences'; // Adjust this based on the actual relative path
import 'bootstrap/dist/css/bootstrap.min.css';
import Subscription from './pages/Subscription/Subscription';

// Admin Components
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminProfiles from './pages/Admin/AdminProfiles';


const App = () => {
  return (
    <DarkModeProvider>

    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<><Home /><Footer /></>} />
        <Route path="/login" element={<><Login /><Footer /></>} />
        <Route path="/signup" element={<><Register /><Footer /></>} />
        
        {/* Authenticated Routes with Layout */}
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/matches" element={<Layout><Matches /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/message" element={<Layout><Message /></Layout>} />
        <Route path="/messages/:id" element={<Layout><MessageScreen /></Layout>} />
        <Route path="/view-profile/:name" element={<Layout><Profile /></Layout>} />
        <Route path="/SelectPreferences" element={<Layout><SelectPreferences /></Layout>} />
        <Route path="/subscription" element={<Layout><Subscription /></Layout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/users" element={<Layout><AdminUsers /></Layout>} />
        <Route path="/admin/profiles" element={<Layout><AdminProfiles /></Layout>} />
      </Routes>
    </Router>
    </DarkModeProvider>
  );
};

export default App;
