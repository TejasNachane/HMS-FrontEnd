import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PatientDetails = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const response = await patientAPI.getPatientById(id);
      setPatient(response.data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      setError('Failed to fetch patient details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await patientAPI.deletePatient(id);
        alert('Patient deleted successfully!');
        navigate('/patients');
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Failed to delete patient. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading patient details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link} to="/patients" variant="secondary">
          <i className="bi bi-arrow-left me-1"></i>
          Back to Patients
        </Button>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Patient not found.</Alert>
        <Button as={Link} to="/patients" variant="secondary">
          <i className="bi bi-arrow-left me-1"></i>
          Back to Patients
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
              <i className="bi bi-person me-2"></i>
              Patient Details
            </h2>
            <div>
              <Button as={Link} to="/patients" variant="outline-secondary" className="me-2">
                <i className="bi bi-arrow-left me-1"></i>
                Back to Patients
              </Button>
              {hasRole('ADMIN') && (
                <>
                  <Button 
                    as={Link} 
                    to={`/patients/${patient.id}/edit`} 
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
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-person-badge me-2"></i>
                Personal Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Patient ID:</strong>
                    <p className="mb-0">#{patient.id}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Full Name:</strong>
                    <p className="mb-0">{patient.name}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Age:</strong>
                    <p className="mb-0">{patient.age} years</p>
                  </div>
                  <div className="mb-3">
                    <strong>Gender:</strong>
                    <p className="mb-0">
                      <Badge bg={patient.gender === 'MALE' ? 'primary' : patient.gender === 'FEMALE' ? 'info' : 'secondary'}>
                        {patient.gender}
                      </Badge>
                    </p>
                  </div>
                  <div className="mb-3">
                    <strong>Date of Birth:</strong>
                    <p className="mb-0">{patient.dateOfBirth || 'Not provided'}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Phone:</strong>
                    <p className="mb-0">
                      <a href={`tel:${patient.phone}`} className="text-decoration-none">
                        <i className="bi bi-telephone me-1"></i>
                        {patient.phone}
                      </a>
                    </p>
                  </div>
                  <div className="mb-3">
                    <strong>Email:</strong>
                    <p className="mb-0">
                      <a href={`mailto:${patient.email}`} className="text-decoration-none">
                        <i className="bi bi-envelope me-1"></i>
                        {patient.email}
                      </a>
                    </p>
                  </div>
                  <div className="mb-3">
                    <strong>Blood Group:</strong>
                    <p className="mb-0">
                      {patient.bloodGroup ? (
                        <Badge bg="danger">{patient.bloodGroup}</Badge>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>
                  <div className="mb-3">
                    <strong>Emergency Contact:</strong>
                    <p className="mb-0">{patient.emergencyContact || 'Not provided'}</p>
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
                <p className="mb-0">{patient.address || 'Not provided'}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow mb-4">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-heart-pulse me-2"></i>
                Medical Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Medical History:</strong>
                <p className="mb-0">{patient.medicalHistory || 'No medical history recorded'}</p>
              </div>
              <div className="mb-3">
                <strong>Allergies:</strong>
                <p className="mb-0">{patient.allergies || 'No known allergies'}</p>
              </div>
              <div className="mb-3">
                <strong>Current Medications:</strong>
                <p className="mb-0">{patient.currentMedications || 'No current medications'}</p>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">
                <i className="bi bi-clock me-2"></i>
                Registration Info
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Registration Date:</strong>
                <p className="mb-0">
                  {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Not available'}
                </p>
              </div>
              <div className="mb-3">
                <strong>Last Updated:</strong>
                <p className="mb-0">
                  {patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'Not available'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PatientDetails;
