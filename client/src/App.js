import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth pages
import Login from './pages/auth/Login';
import PreRegister from './pages/auth/PreRegister';
import VerifyEmail from './pages/auth/VerifyEmail';
import CompleteRegister from './pages/auth/CompleteRegister';

// Donor pages
import DonorDashboard from './pages/donor/Dashboard';
import DonorQuestionnaire from './pages/donor/Questionnaire';
import DonorRequests from './pages/donor/Requests';
import DonorDonationHistory from './pages/donor/DonationHistory';
import DonorMessages from './pages/donor/Messages';
import DonorSettings from './pages/donor/Settings';

// Seeker pages
import SeekerDashboard from './pages/seeker/Dashboard';
import SeekerSearch from './pages/seeker/Search';
import SeekerRequests from './pages/seeker/Requests';
import SeekerMessages from './pages/seeker/Messages';

// Doctor pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorVerifications from './pages/doctor/Verifications';
import DoctorMessages from './pages/doctor/Messages';
import DoctorStatistics from './pages/doctor/Statistics';
import DoctorRecordDonation from './pages/doctor/RecordDonation';
import DoctorUsersList from './pages/doctor/DoctorUsersList';
import DoctorDonationsList from './pages/doctor/DoctorDonationsList';

// Context and components
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import ForgotAndReset from "./pages/auth/ForgotAndReset";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<PreRegister />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/complete-register" element={<CompleteRegister />} />
        <Route path="/forgot-password" element={<ForgotAndReset />} />

        <Route 
          path="/donor"
          element={
            <ProtectedRoute role="DONOR">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DonorDashboard />} />
          <Route path="questionnaire" element={<DonorQuestionnaire />} />
          <Route path="requests" element={<DonorRequests />} />
          <Route path="history" element={<DonorDonationHistory />} />
          <Route path="messages" element={<DonorMessages />} />
          <Route path="messages/:userId" element={<DonorMessages />} />
          <Route path="settings" element={<DonorSettings />} />
          <Route path="" element={<Navigate to="/donor/dashboard" replace />} />
        </Route>
        
        {/* Seeker routes - FLAT STRUCTURE */}
        <Route 
          path="/seeker" 
          element={
            <ProtectedRoute role="SEEKER">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<SeekerDashboard />} />
          <Route path="search" element={<SeekerSearch />} />
          <Route path="requests" element={<SeekerRequests />} />
          <Route path="messages" element={<SeekerMessages />} />
          <Route path="messages/:userId" element={<SeekerMessages />} />
          <Route path="" element={<Navigate to="/seeker/dashboard" replace />} />
        </Route>
        
        {/* Doctor routes - FLAT STRUCTURE */}
        <Route 
          path="/doctor" 
          element={
            <ProtectedRoute role="DOCTOR">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="verifications" element={<DoctorVerifications />} />
          <Route path="messages" element={<DoctorMessages />} />
          <Route path="messages/:userId" element={<DoctorMessages />} />
          <Route path="statistics" element={<DoctorStatistics />} />
          <Route path="record-donation" element={<DoctorRecordDonation />} />
          <Route path="users" element={<DoctorUsersList />} />
          <Route path="donations" element={<DoctorDonationsList />} />
          <Route path="" element={<Navigate to="/doctor/dashboard" replace />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;