import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Container>
      {/* Hero Section */}
      <Row className="text-center py-5">
        <Col>
          <h1 className="display-4 text-primary mb-4">
            <i className="bi bi-hospital me-3"></i>
            Hospital Management System
          </h1>
          <p className="lead text-muted mb-4">
            Comprehensive healthcare management solution for modern hospitals
          </p>
          {!isAuthenticated() ? (
            <div>
              <Button as={Link} to="/login" variant="primary" size="lg" className="me-3">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
              </Button>
              <Button as={Link} to="/register" variant="outline-primary" size="lg">
                <i className="bi bi-person-plus me-2"></i>
                Register as Patient
              </Button>
            </div>
          ) : (
            <div>
              <h4 className="text-success mb-3">
                Welcome back, {user?.username}!
              </h4>
              <Button as={Link} to="/dashboard" variant="success" size="lg">
                <i className="bi bi-speedometer2 me-2"></i>
                Go to Dashboard
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="py-5">
        <Col>
          <h2 className="text-center text-secondary mb-5">
            <i className="bi bi-star me-2"></i>
            Key Features
          </h2>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6} lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="text-primary mb-3">
                <i className="bi bi-people-fill" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="card-title">Patient Management</h5>
              <p className="card-text text-muted">
                Comprehensive patient registration, medical history tracking, and profile management.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="text-success mb-3">
                <i className="bi bi-person-badge-fill" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="card-title">Doctor Portal</h5>
              <p className="card-text text-muted">
                Specialized dashboard for doctors to manage appointments, patients, and prescriptions.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="text-warning mb-3">
                <i className="bi bi-calendar-check-fill" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="card-title">Appointment Scheduling</h5>
              <p className="card-text text-muted">
                Easy-to-use appointment booking system with real-time availability checking.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="text-danger mb-3">
                <i className="bi bi-prescription2" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="card-title">Prescription Management</h5>
              <p className="card-text text-muted">
                Digital prescription system with medication tracking and history.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="text-info mb-3">
                <i className="bi bi-shield-check" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="card-title">Secure & Compliant</h5>
              <p className="card-text text-muted">
                HIPAA-compliant security measures to protect patient data and privacy.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="text-secondary mb-3">
                <i className="bi bi-graph-up" style={{ fontSize: '3rem' }}></i>
              </div>
              <h5 className="card-title">Analytics & Reports</h5>
              <p className="card-text text-muted">
                Comprehensive reporting and analytics for better hospital management.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Section */}
      <Row className="py-5 mt-5 bg-light rounded">
        <Col>
          <h3 className="text-center text-secondary mb-4">
            <i className="bi bi-bar-chart me-2"></i>
            System Overview
          </h3>
        </Col>
      </Row>

      <Row className="text-center py-3 bg-light rounded">
        <Col md={3}>
          <div className="p-3">
            <h2 className="text-primary">24/7</h2>
            <p className="text-muted mb-0">System Availability</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="p-3">
            <h2 className="text-success">100%</h2>
            <p className="text-muted mb-0">Data Security</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="p-3">
            <h2 className="text-warning">Fast</h2>
            <p className="text-muted mb-0">Response Time</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="p-3">
            <h2 className="text-info">Cloud</h2>
            <p className="text-muted mb-0">Based Solution</p>
          </div>
        </Col>
      </Row>

      {/* CTA Section */}
      {!isAuthenticated() && (
        <Row className="text-center py-5">
          <Col>
            <h3 className="text-secondary mb-4">Ready to get started?</h3>
            <p className="text-muted mb-4">
              Join thousands of healthcare professionals using our system
            </p>
            <Button as={Link} to="/register" variant="primary" size="lg" className="me-3">
              <i className="bi bi-person-plus me-2"></i>
              Register Now
            </Button>
            <Button as={Link} to="/login" variant="outline-primary" size="lg">
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Login
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Home;
