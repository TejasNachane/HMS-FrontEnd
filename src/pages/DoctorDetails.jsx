import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DoctorDetails = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const response = await doctorAPI.getDoctorById(id);
      setDoctor(response.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      setError('Failed to fetch doctor details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      try {
        await doctorAPI.deleteDoctor(id);
        alert('Doctor deleted successfully!');
        navigate('/doctors');
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Failed to delete doctor. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading doctor details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link} to="/doctors" variant="secondary">
          <i className="bi bi-arrow-left me-1"></i>
          Back to Doctors
        </Button>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Doctor not found.</Alert>
        <Button as={Link} to="/doctors" variant="secondary">
          <i className="bi bi-arrow-left me-1"></i>
          Back to Doctors
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-primary">
              <i className="bi bi-person-badge me-2"></i>
              Doctor Details
            </h2>
            <div>
              <Button as={Link} to="/doctors" variant="outline-secondary" className="me-2">
                <i className="bi bi-arrow-left me-1"></i>
                Back to Doctors
              </Button>
              {hasRole('ADMIN') && (
                <>
                  <Button 
                    as={Link} 
                    to={`/doctors/${doctor.id}/edit`} 
                    variant="warning" 
                    className="me-2"
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={handleDelete}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="shadow mb-4">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-person-badge me-2"></i>
                Personal Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Doctor ID:</strong>
                    <p className="mb-0">#{doctor.id}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Full Name:</strong>
                    <p className="mb-0">{doctor.name}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Username:</strong>
                    <p className="mb-0">{doctor.username}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Specialization:</strong>
                    <p className="mb-0">
                      <Badge bg="primary" className="fs-6">
                        {doctor.specialization?.replace(/_/g, ' ')}
                      </Badge>
                    </p>
                  </div>
                  <div className="mb-3">
                    <strong>Qualification:</strong>
                    <p className="mb-0">{doctor.qualification}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Phone:</strong>
                    <p className="mb-0">
                      <a href={`tel:${doctor.phone}`} className="text-decoration-none">
                        <i className="bi bi-telephone me-1"></i>
                        {doctor.phone}
                      </a>
                    </p>
                  </div>
                  <div className="mb-3">
                    <strong>Email:</strong>
                    <p className="mb-0">
                      <a href={`mailto:${doctor.email}`} className="text-decoration-none">
                        <i className="bi bi-envelope me-1"></i>
                        {doctor.email}
                      </a>
                    </p>
                  </div>
                  <div className="mb-3">
                    <strong>Experience:</strong>
                    <p className="mb-0">
                      <Badge bg="info" className="fs-6">
                        {doctor.experience} years
                      </Badge>
                    </p>
                  </div>
                  <div className="mb-3">
                    <strong>Consultation Fee:</strong>
                    <p className="mb-0">
                      <span className="text-success fw-bold fs-5">
                        ${doctor.consultationFee}
                      </span>
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="shadow">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-geo-alt me-2"></i>
                Address Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Address:</strong>
                <p className="mb-0">{doctor.address || 'Not provided'}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow mb-4">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">
                <i className="bi bi-award me-2"></i>
                Professional Info
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Specialization:</strong>
                <p className="mb-0">
                  <Badge bg="primary" className="fs-6">
                    {doctor.specialization?.replace(/_/g, ' ')}
                  </Badge>
                </p>
              </div>
              <div className="mb-3">
                <strong>Years of Experience:</strong>
                <p className="mb-0">
                  <Badge bg="info" className="fs-6">
                    {doctor.experience} years
                  </Badge>
                </p>
              </div>
              <div className="mb-3">
                <strong>Medical Qualification:</strong>
                <p className="mb-0">{doctor.qualification}</p>
              </div>
              <div className="mb-3">
                <strong>Consultation Fee:</strong>
                <p className="mb-0">
                  <span className="text-success fw-bold fs-5">
                    ${doctor.consultationFee}
                  </span>
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow">
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">
                <i className="bi bi-clock me-2"></i>
                Registration Info
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Registration Date:</strong>
                <p className="mb-0">
                  {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : 'Not available'}
                </p>
              </div>
              <div className="mb-3">
                <strong>Last Updated:</strong>
                <p className="mb-0">
                  {doctor.updatedAt ? new Date(doctor.updatedAt).toLocaleDateString() : 'Not available'}
                </p>
              </div>
              <div className="mb-3">
                <strong>Status:</strong>
                <p className="mb-0">
                  <Badge bg="success">Active</Badge>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorDetails;
