import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/Navigation';
import ProtectedRoute from './utils/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import PatientEdit from './pages/PatientEdit';
import Doctors from './pages/Doctors';
import DoctorDetails from './pages/DoctorDetails';
import DoctorEdit from './pages/DoctorEdit';
import DoctorRegister from './pages/DoctorRegister';
import Appointments from './pages/Appointments';
import AppointmentDetails from './pages/AppointmentDetails';
import AppointmentEdit from './pages/AppointmentEdit';
import AppointmentCreate from './pages/AppointmentCreate';
import Profile from './pages/Profile';
import Unauthorized from './pages/Unauthorized';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      <Navigation />
      
      <main className="pb-5">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route 
            path="/login" 
            element={
              isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register />
              )
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/patients" 
            element={
              <ProtectedRoute>
                <Patients />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/patients/:id" 
            element={
              <ProtectedRoute>
                <PatientDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/patients/:id/edit" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <PatientEdit />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/patients/register" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <Register />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/doctors" 
            element={
              <ProtectedRoute>
                <Doctors />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/doctors/:id" 
            element={
              <ProtectedRoute>
                <DoctorDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/doctors/:id/edit" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <DoctorEdit />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/doctors/register" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <DoctorRegister />
              </ProtectedRoute>
            } 
          />
          
          {/* Appointment Routes */}
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointments/create" 
            element={
              <ProtectedRoute>
                <AppointmentCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointments/:id" 
            element={
              <ProtectedRoute>
                <AppointmentDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointments/:id/edit" 
            element={
              <ProtectedRoute>
                <AppointmentEdit />
              </ProtectedRoute>
            } 
          />
          
          {/* Error Routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <Container className="text-center mt-5">
                <h2 className="text-muted">404 - Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
              </Container>
            } 
          />
        </Routes>
      </main>
      
      {/* Footer */}
      <footer className="bg-light text-center text-muted py-3 mt-auto">
        <Container>
          <small>
            Hospital Management System.
          </small>
        </Container>
      </footer>
    </div>
  );
}

export default App;
