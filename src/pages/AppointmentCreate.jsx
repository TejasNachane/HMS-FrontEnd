import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentAPI, doctorAPI, patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AppointmentCreate = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDateTime: '',
    reason: '',
    notes: ''
  });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { hasRole, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const promises = [];
      
      // Always fetch doctors
      promises.push(doctorAPI.getAllDoctors());
      
      // Fetch patients if admin or doctor
      if (hasRole('ADMIN') || hasRole('DOCTOR')) {
        promises.push(patientAPI.getAllPatients());
      }

      const results = await Promise.all(promises);
      
      setDoctors(results[0].data);
      if (results[1]) {
        setPatients(results[1].data);
      }

      // If user is a doctor, pre-select themselves
      if (hasRole('DOCTOR')) {
        setFormData(prev => ({ ...prev, doctorId: user.id.toString() }));
      }
      
      // If user is a patient, pre-select themselves
      if (hasRole('PATIENT')) {
        setFormData(prev => ({ ...prev, patientId: user.id.toString() }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load required data. Please try again.');
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
    const appointmentDate = new Date(formData.appointmentDateTime);
    const now = new Date();
    
    if (appointmentDate <= now) {
      setError('Appointment date and time must be in the future');
      setSaving(false);
      return;
    }

    try {
      const appointmentData = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        appointmentTime: formData.appointmentDateTime, // Backend expects 'appointmentTime'
        reason: formData.reason,
        notes: formData.notes,
        status: 'SCHEDULED'
      };

      await appointmentAPI.createAppointment(appointmentData);
      setSuccess('Appointment scheduled successfully!');
      
      // Reset form
      setFormData({
        patientId: hasRole('PATIENT') ? user.id.toString() : '',
        doctorId: hasRole('DOCTOR') ? user.id.toString() : '',
        appointmentDateTime: '',
        reason: '',
        notes: ''
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError('Failed to schedule appointment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Get minimum date/time (current time + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-primary">
              <i className="bi bi-calendar-plus me-2"></i>
              Schedule New Appointment
            </h2>
            <Button as={Link} to="/appointments" variant="outline-secondary">
              <i className="bi bi-arrow-left me-1"></i>
              Back to Appointments
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="shadow">
        <Card.Header className="bg-warning text-dark">
          <h5 className="mb-0">
            <i className="bi bi-calendar-event me-2"></i>
            Appointment Details
          </h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient *</Form.Label>
                  <Form.Select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    required
                    disabled={hasRole('PATIENT')}
                  >
                    <option value="">Select Patient</option>
                    {hasRole('PATIENT') ? (
                      <option value={user.id}>{user.name || user.username}</option>
                    ) : (
                      patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} - {patient.email}
                        </option>
                      ))
                    )}
                  </Form.Select>
                  {hasRole('PATIENT') && (
                    <Form.Text className="text-muted">
                      You are scheduling an appointment for yourself.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Doctor *</Form.Label>
                  <Form.Select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    required
                    disabled={hasRole('DOCTOR')}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.name} - {doctor.specialization?.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Form.Select>
                  {hasRole('DOCTOR') && (
                    <Form.Text className="text-muted">
                      You are scheduling an appointment for yourself.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Appointment Date & Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="appointmentDateTime"
                    value={formData.appointmentDateTime}
                    onChange={handleChange}
                    required
                    min={getMinDateTime()}
                  />
                  <Form.Text className="text-muted">
                    Appointment must be scheduled at least 1 hour from now.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Reason for Visit</Form.Label>
                  <Form.Control
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="e.g., General checkup, Follow-up, Consultation"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Additional Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any additional information or special requirements..."
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button 
                as={Link} 
                to="/appointments" 
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
                    Scheduling...
                  </>
                ) : (
                  <>
                    <i className="bi bi-calendar-plus me-1"></i>
                    Schedule Appointment
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Available Time Slots Info */}
      <Card className="mt-4 border-info">
        <Card.Header className="bg-info text-white">
          <h6 className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Appointment Guidelines
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6 className="text-info">Operating Hours:</h6>
              <ul className="list-unstyled">
                <li><i className="bi bi-clock me-1"></i>Monday - Friday: 8:00 AM - 6:00 PM</li>
                <li><i className="bi bi-clock me-1"></i>Saturday: 9:00 AM - 2:00 PM</li>
                <li><i className="bi bi-clock me-1"></i>Sunday: Closed</li>
              </ul>
            </Col>
            <Col md={6}>
              <h6 className="text-info">Important Notes:</h6>
              <ul className="list-unstyled">
                <li><i className="bi bi-check-circle me-1"></i>Appointments must be scheduled at least 1 hour in advance</li>
                <li><i className="bi bi-check-circle me-1"></i>Please arrive 15 minutes before your scheduled time</li>
                <li><i className="bi bi-check-circle me-1"></i>Bring a valid ID and insurance card</li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AppointmentCreate;
