import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<div><h2>Public Home</h2></div>} />
        
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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
