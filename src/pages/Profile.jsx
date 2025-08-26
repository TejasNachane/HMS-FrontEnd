import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, hasRole } = useAuth();

  if (!user) {
    return (
      <Container className="text-center mt-5">
        <h3>Loading profile...</h3>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-secondary text-white text-center">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                User Profile
              </h4>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <div className="bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '100px', height: '100px', fontSize: '3rem' }}>
                  <i className="bi bi-person"></i>
                </div>
                <h3 className="mt-3 mb-1">{user.username}</h3>
                <Badge bg={
                  user.role === 'ADMIN' ? 'danger' : 
                  user.role === 'DOCTOR' ? 'success' : 'info'
                } className="fs-6 px-3 py-2">
                  {user.role}
                </Badge>
              </div>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Username:</strong>
                </Col>
                <Col sm={8}>
                  {user.username}
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Role:</strong>
                </Col>
                <Col sm={8}>
                  <Badge bg={
                    user.role === 'ADMIN' ? 'danger' : 
                    user.role === 'DOCTOR' ? 'success' : 'info'
                  }>
                    {user.role}
                  </Badge>
                </Col>
              </Row>

              {user.firstName && (
                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>First Name:</strong>
                  </Col>
                  <Col sm={8}>
                    {user.firstName}
                  </Col>
                </Row>
              )}

              {user.lastName && (
                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Last Name:</strong>
                  </Col>
                  <Col sm={8}>
                    {user.lastName}
                  </Col>
                </Row>
              )}

              {user.email && (
                <Row className="mb-3">
                  <Col sm={4}>
                    <strong>Email:</strong>
                  </Col>
                  <Col sm={8}>
                    {user.email}
                  </Col>
                </Row>
              )}

              <hr />

              <div className="text-center">
                <h5 className="text-muted mb-3">Quick Actions</h5>
                
                <div className="d-grid gap-2 d-md-block">
                  <Button as={Link} to="/dashboard" variant="primary" className="me-2">
                    <i className="bi bi-speedometer2 me-1"></i>
                    Dashboard
                  </Button>

                  {hasRole('ADMIN') && (
                    <>
                      <Button as={Link} to="/doctors" variant="success" className="me-2">
                        <i className="bi bi-person-badge me-1"></i>
                        Manage Doctors
                      </Button>
                      <Button as={Link} to="/patients" variant="info" className="me-2">
                        <i className="bi bi-people me-1"></i>
                        Manage Patients
                      </Button>
                    </>
                  )}

                  {(hasRole('ADMIN') || hasRole('DOCTOR')) && (
                    <Button as={Link} to="/appointments" variant="warning" className="me-2">
                      <i className="bi bi-calendar-check me-1"></i>
                      Appointments
                    </Button>
                  )}
                </div>
              </div>

              <hr />

              <div className="text-center">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Profile editing features will be available soon
                </small>
              </div>
            </Card.Body>
          </Card>

          {/* Role-specific Information Card */}
          <Card className="mt-4 shadow">
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                <i className="bi bi-info-circle me-1"></i>
                Role Information
              </h6>
            </Card.Header>
            <Card.Body>
              {hasRole('ADMIN') && (
                <div>
                  <h6 className="text-danger">Administrator Privileges</h6>
                  <ul className="mb-0 text-muted">
                    <li>Manage doctors and patients</li>
                    <li>View all appointments and prescriptions</li>
                    <li>Access system analytics</li>
                    <li>Manage user roles and permissions</li>
                  </ul>
                </div>
              )}

              {hasRole('DOCTOR') && (
                <div>
                  <h6 className="text-success">Doctor Privileges</h6>
                  <ul className="mb-0 text-muted">
                    <li>View and manage patient records</li>
                    <li>Create and manage appointments</li>
                    <li>Write and manage prescriptions</li>
                    <li>Access medical histories</li>
                  </ul>
                </div>
              )}

              {hasRole('PATIENT') && (
                <div>
                  <h6 className="text-info">Patient Access</h6>
                  <ul className="mb-0 text-muted">
                    <li>View your appointments</li>
                    <li>Access your prescriptions</li>
                    <li>Update personal information</li>
                    <li>View medical history</li>
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
