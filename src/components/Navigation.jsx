import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <i className="bi bi-hospital me-2"></i>
          Hospital Management System
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated() && (
              <>
                <Nav.Link as={Link} to="/dashboard">
                  <i className="bi bi-speedometer2 me-1"></i>
                  Dashboard
                </Nav.Link>
                
                {(hasRole('ADMIN') || hasRole('DOCTOR')) && (
                  <NavDropdown title={<><i className="bi bi-people me-1"></i>Patients</>} id="patients-dropdown">
                    <NavDropdown.Item as={Link} to="/patients">
                      <i className="bi bi-list me-1"></i>
                      View All Patients
                    </NavDropdown.Item>
                    {hasRole('ADMIN') && (
                      <NavDropdown.Item as={Link} to="/patients/register">
                        <i className="bi bi-person-plus me-1"></i>
                        Register Patient
                      </NavDropdown.Item>
                    )}
                  </NavDropdown>
                )}
                
                {hasRole('ADMIN') && (
                  <NavDropdown title={<><i className="bi bi-person-badge me-1"></i>Doctors</>} id="doctors-dropdown">
                    <NavDropdown.Item as={Link} to="/doctors">
                      <i className="bi bi-list me-1"></i>
                      View All Doctors
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/doctors/register">
                      <i className="bi bi-person-plus me-1"></i>
                      Register Doctor
                    </NavDropdown.Item>
                  </NavDropdown>
                )}
                
                <NavDropdown title={<><i className="bi bi-calendar-check me-1"></i>Appointments</>} id="appointments-dropdown">
                  <NavDropdown.Item as={Link} to="/appointments">
                    <i className="bi bi-list me-1"></i>
                    View Appointments
                  </NavDropdown.Item>
                  {(hasRole('ADMIN') || hasRole('DOCTOR') || hasRole('PATIENT')) && (
                    <NavDropdown.Item as={Link} to="/appointments/create">
                      <i className="bi bi-plus-circle me-1"></i>
                      Create Appointment
                    </NavDropdown.Item>
                  )}
                </NavDropdown>
                
                {(hasRole('ADMIN') || hasRole('DOCTOR')) && (
                  <NavDropdown title={<><i className="bi bi-prescription2 me-1"></i>Prescriptions</>} id="prescriptions-dropdown">
                    <NavDropdown.Item as={Link} to="/prescriptions">
                      <i className="bi bi-list me-1"></i>
                      View Prescriptions
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/prescriptions/create">
                      <i className="bi bi-plus-circle me-1"></i>
                      Create Prescription
                    </NavDropdown.Item>
                  </NavDropdown>
                )}
              </>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated() ? (
              <NavDropdown 
                title={
                  <>
                    <i className="bi bi-person-circle me-1"></i>
                    {user?.username || 'User'}
                  </>
                } 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item>
                  <strong>Role:</strong> {user?.role}
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/profile">
                  <i className="bi bi-person me-1"></i>
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-1"></i>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <i className="bi bi-person-plus me-1"></i>
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
