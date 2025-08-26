import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DoctorEdit = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    specialization: '',
    qualification: '',
    experience: '',
    phone: '',
    address: '',
    consultationFee: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const specializations = [
    'CARDIOLOGY', 'DERMATOLOGY', 'ENDOCRINOLOGY', 'GASTROENTEROLOGY',
    'HEMATOLOGY', 'NEUROLOGY', 'ONCOLOGY', 'ORTHOPEDICS', 'PEDIATRICS',
    'PSYCHIATRY', 'RADIOLOGY', 'SURGERY', 'UROLOGY', 'GENERAL_PRACTICE'
  ];

  useEffect(() => {
    // Check if user has admin role
    if (!hasRole('ADMIN')) {
      navigate('/unauthorized');
      return;
    }
    fetchDoctor();
  }, [id, hasRole, navigate]);

  const fetchDoctor = async () => {
    try {
      const response = await doctorAPI.getDoctorById(id);
      const doctor = response.data;
      setFormData({
        username: doctor.username || '',
        email: doctor.email || '',
        name: doctor.name || '',
        specialization: doctor.specialization || '',
        qualification: doctor.qualification || '',
        experience: doctor.experience || '',
        phone: doctor.phone || '',
        address: doctor.address || '',
        consultationFee: doctor.consultationFee || ''
      });
    } catch (error) {
      console.error('Error fetching doctor:', error);
      setError('Failed to fetch doctor details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    // Validation
    if (formData.experience < 0) {
      setError('Experience cannot be negative');
      setSaving(false);
      return;
    }

    if (formData.consultationFee < 0) {
      setError('Consultation fee cannot be negative');
      setSaving(false);
      return;
    }

    try {
      await doctorAPI.updateDoctor(id, formData);
      setSuccess('Doctor updated successfully!');
      setTimeout(() => {
        navigate(`/doctors/${id}`);
      }, 2000);
    } catch (error) {
      console.error('Error updating doctor:', error);
      setError('Failed to update doctor. Please try again.');
    } finally {
      setSaving(false);
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

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-primary">
              <i className="bi bi-pencil me-2"></i>
              Edit Doctor
            </h2>
            <div>
              <Button as={Link} to={`/doctors/${id}`} variant="outline-secondary" className="me-2">
                <i className="bi bi-arrow-left me-1"></i>
                Back to Details
              </Button>
              <Button as={Link} to="/doctors" variant="outline-secondary">
                <i className="bi bi-list me-1"></i>
                All Doctors
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="shadow">
        <Card.Header className="bg-warning text-dark">
          <h5 className="mb-0">
            <i className="bi bi-person-badge me-2"></i>
            Doctor Information
          </h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username *</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter username"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Specialization *</Form.Label>
                  <Form.Select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>
                        {spec.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Experience (years) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="Years of experience"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Qualification *</Form.Label>
                  <Form.Control
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                    placeholder="Enter medical qualifications (e.g., MBBS, MD)"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Consultation Fee *</Form.Label>
                  <Form.Control
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Enter consultation fee"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Address *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="Enter full address"
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button 
                as={Link} 
                to={`/doctors/${id}`} 
                variant="secondary" 
                className="me-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="success"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1"></i>
                    Update Doctor
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DoctorEdit;
