import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { appointmentAPI, doctorAPI, patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AppointmentEdit = () => {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDateTime: '',
    reason: '',
    notes: '',
    status: ''
  });
  const [originalAppointment, setOriginalAppointment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { hasRole, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const statusOptions = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW', label: 'No Show' }
  ];

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const promises = [appointmentAPI.getAppointmentById(id)];
      
      // Fetch doctors and patients if admin
      if (hasRole('ADMIN')) {
        promises.push(doctorAPI.getAllDoctors());
        promises.push(patientAPI.getAllPatients());
      } else if (hasRole('DOCTOR')) {
        promises.push(doctorAPI.getAllDoctors());
        promises.push(patientAPI.getAllPatients());
      }

      const results = await Promise.all(promises);
      
      const appointment = results[0].data;
      setOriginalAppointment(appointment);
      
      // Format datetime for input
      const formattedDateTime = appointment.appointmentTime 
        ? new Date(appointment.appointmentTime).toISOString().slice(0, 16)
        : '';
      
      setFormData({
        patientId: appointment.patient?.id?.toString() || '',
        doctorId: appointment.doctor?.id?.toString() || '',
        appointmentDateTime: formattedDateTime,
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        status: appointment.status || 'SCHEDULED'
      });

      if (results[1]) setDoctors(results[1].data);
      if (results[2]) setPatients(results[2].data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load appointment data. Please try again.');
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
    
    if (appointmentDate <= now && formData.status === 'SCHEDULED') {
      setError('Scheduled appointments must be in the future');
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
        status: formData.status
      };

      await appointmentAPI.updateAppointment(id, appointmentData);
      setSuccess('Appointment updated successfully!');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/appointments/${id}`);
      }, 2000);
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canEditPatient = () => {
    return hasRole('ADMIN');
  };

  const canEditDoctor = () => {
    return hasRole('ADMIN');
  };

  const canEditStatus = () => {
    return hasRole('ADMIN') || (hasRole('DOCTOR') && originalAppointment?.doctor?.id === user?.id);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading appointment...</p>
      </Container>
    );
  }

  if (!originalAppointment) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          Appointment not found or you don't have permission to edit it.
        </Alert>
        <Button as={Link} to="/appointments" variant="primary">
          Back to Appointments
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
              <i className="bi bi-pencil-square me-2"></i>
              Edit Appointment
            </h2>
            <div>
              <Button as={Link} to={`/appointments/${id}`} variant="outline-secondary" className="me-2">
                <i className="bi bi-eye me-1"></i>
                View Details
              </Button>
              <Button as={Link} to="/appointments" variant="outline-secondary">
                <i className="bi bi-arrow-left me-1"></i>
                Back to List
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
                    disabled={!canEditPatient()}
                  >
                    <option value="">Select Patient</option>
                    {canEditPatient() ? (
                      patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} - {patient.email}
                        </option>
                      ))
                    ) : (
                      <option value={originalAppointment.patient?.id}>
                        {originalAppointment.patient?.name}
                      </option>
                    )}
                  </Form.Select>
                  {!canEditPatient() && (
                    <Form.Text className="text-muted">
                      Patient cannot be changed.
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
                    disabled={!canEditDoctor()}
                  >
                    <option value="">Select Doctor</option>
                    {canEditDoctor() ? (
                      doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.name} - {doctor.specialization?.replace(/_/g, ' ')}
                        </option>
                      ))
                    ) : (
                      <option value={originalAppointment.doctor?.id}>
                        Dr. {originalAppointment.doctor?.name} - {originalAppointment.doctor?.specialization?.replace(/_/g, ' ')}
                      </option>
                    )}
                  </Form.Select>
                  {!canEditDoctor() && (
                    <Form.Text className="text-muted">
                      Doctor cannot be changed.
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
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    disabled={!canEditStatus()}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                  {!canEditStatus() && (
                    <Form.Text className="text-muted">
                      Status cannot be changed.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

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
                to={`/appointments/${id}`} 
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
                    Update Appointment
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Edit Guidelines */}
      <Card className="mt-4 border-info">
        <Card.Header className="bg-info text-white">
          <h6 className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Edit Guidelines
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6 className="text-info">Permissions:</h6>
              <ul className="list-unstyled">
                <li>
                  <i className={`bi ${hasRole('ADMIN') ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'} me-1`}></i>
                  Admin: Can edit all fields
                </li>
                <li>
                  <i className={`bi ${hasRole('DOCTOR') ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'} me-1`}></i>
                  Doctor: Can edit own appointments (time, reason, notes, status)
                </li>
                <li>
                  <i className={`bi ${hasRole('PATIENT') ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'} me-1`}></i>
                  Patient: Limited edit access
                </li>
              </ul>
            </Col>
            <Col md={6}>
              <h6 className="text-info">Important Notes:</h6>
              <ul className="list-unstyled">
                <li><i className="bi bi-exclamation-triangle me-1"></i>Scheduled appointments must be in the future</li>
                <li><i className="bi bi-clock me-1"></i>Please update appointment time if rescheduling</li>
                <li><i className="bi bi-person-check me-1"></i>Status changes are tracked for record keeping</li>
              </ul>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AppointmentEdit;
