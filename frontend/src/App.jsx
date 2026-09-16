import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/Public/LandingPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<div><h2>Login Page</h2></div>} />
        <Route path="/register" element={<div><h2>Register Page</h2></div>} />

        {/* Student Routes */}
        <Route path="/student/*" element={<div><h2>Student Dashboard</h2></div>} />

        {/* Faculty Routes */}
        <Route path="/faculty/*" element={<div><h2>Faculty Dashboard</h2></div>} />

        {/* Alumni Routes */}
        <Route path="/alumni/*" element={<div><h2>Alumni Dashboard</h2></div>} />

        {/* Recruiter Routes */}
        <Route path="/recruiter/*" element={<div><h2>Recruiter Dashboard</h2></div>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
