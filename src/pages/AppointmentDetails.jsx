import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AppointmentDetails = () => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const { id } = useParams();
  const { hasRole, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const response = await appointmentAPI.getAppointmentById(id);
      setAppointment(response.data);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      setError('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await appointmentAPI.updateAppointmentStatus(id, newStatus);
      setAppointment(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update appointment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentAPI.deleteAppointment(id);
        navigate('/appointments');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        setError('Failed to delete appointment');
      }
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'primary';
      case 'CONFIRMED': return 'info';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      case 'NO_SHOW': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const canEdit = () => {
    if (hasRole('ADMIN')) return true;
    if (hasRole('DOCTOR') && appointment?.doctor?.id === user?.id) return true;
    return false;
  };

  const canUpdateStatus = () => {
    return hasRole('ADMIN') || (hasRole('DOCTOR') && appointment?.doctor?.id === user?.id);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading appointment details...</p>
      </Container>
    );
  }

  if (error || !appointment) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          {error || 'Appointment not found'}
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
              <i className="bi bi-calendar-event me-2"></i>
              Appointment Details
            </h2>
            <Button as={Link} to="/appointments" variant="outline-secondary">
              <i className="bi bi-arrow-left me-1"></i>
              Back to Appointments
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={8}>
          <Card className="shadow mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Appointment Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <h6 className="text-muted">Patient</h6>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-person-circle text-primary me-2"></i>
                    <div>
                      <strong>{appointment.patient?.name || 'N/A'}</strong>
                      <br />
                      <small className="text-muted">{appointment.patient?.email}</small>
                    </div>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <h6 className="text-muted">Doctor</h6>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-person-badge text-success me-2"></i>
                    <div>
                      <strong>Dr. {appointment.doctor?.name || 'N/A'}</strong>
                      <br />
                      <small className="text-muted">{appointment.doctor?.specialization?.replace(/_/g, ' ')}</small>
                    </div>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <h6 className="text-muted">Date & Time</h6>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-calendar-event text-warning me-2"></i>
                    <strong>{formatDateTime(appointment.appointmentTime)}</strong>
                  </div>
                </Col>
                <Col md={6} className="mb-3">
                  <h6 className="text-muted">Status</h6>
                  <Badge bg={getStatusVariant(appointment.status)} className="fs-6">
                    <i className="bi bi-check-circle me-1"></i>
                    {appointment.status?.replace(/_/g, ' ')}
                  </Badge>
                </Col>
              </Row>

              {appointment.reason && (
                <Row>
                  <Col className="mb-3">
                    <h6 className="text-muted">Reason for Visit</h6>
                    <p className="mb-0">{appointment.reason}</p>
                  </Col>
                </Row>
              )}

              {appointment.notes && (
                <Row>
                  <Col className="mb-3">
                    <h6 className="text-muted">Notes</h6>
                    <p className="mb-0">{appointment.notes}</p>
                  </Col>
                </Row>
              )}

              <Row>
                <Col md={6} className="mb-3">
                  <h6 className="text-muted">Created On</h6>
                  <small className="text-muted">
                    {appointment.createdAt ? formatDateTime(appointment.createdAt) : 'N/A'}
                  </small>
                </Col>
                <Col md={6} className="mb-3">
                  <h6 className="text-muted">Last Updated</h6>
                  <small className="text-muted">
                    {appointment.updatedAt ? formatDateTime(appointment.updatedAt) : 'N/A'}
                  </small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Actions Card */}
          <Card className="shadow mb-4">
            <Card.Header className="bg-warning text-dark">
              <h6 className="mb-0">
                <i className="bi bi-gear me-2"></i>
                Actions
              </h6>
            </Card.Header>
            <Card.Body>
              {canEdit() && (
                <Button
                  as={Link}
                  to={`/appointments/${appointment.id}/edit`}
                  variant="primary"
                  className="w-100 mb-2"
                >
                  <i className="bi bi-pencil me-1"></i>
                  Edit Appointment
                </Button>
              )}

              {hasRole('ADMIN') && (
                <Button
                  variant="danger"
                  className="w-100 mb-2"
                  onClick={handleDelete}
                >
                  <i className="bi bi-trash me-1"></i>
                  Delete Appointment
                </Button>
              )}

              <Button
                as={Link}
                to="/appointments"
                variant="outline-secondary"
                className="w-100"
              >
                <i className="bi bi-list me-1"></i>
                View All Appointments
              </Button>
            </Card.Body>
          </Card>

          {/* Status Update Card */}
          {canUpdateStatus() && (
            <Card className="shadow">
              <Card.Header className="bg-info text-white">
                <h6 className="mb-0">
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Update Status
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  {appointment.status !== 'CONFIRMED' && (
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleStatusUpdate('CONFIRMED')}
                      disabled={updating}
                    >
                      {updating ? <Spinner animation="border" size="sm" /> : 'Confirm'}
                    </Button>
                  )}
                  {appointment.status !== 'IN_PROGRESS' && (
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleStatusUpdate('IN_PROGRESS')}
                      disabled={updating}
                    >
                      {updating ? <Spinner animation="border" size="sm" /> : 'In Progress'}
                    </Button>
                  )}
                  {appointment.status !== 'COMPLETED' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleStatusUpdate('COMPLETED')}
                      disabled={updating}
                    >
                      {updating ? <Spinner animation="border" size="sm" /> : 'Complete'}
                    </Button>
                  )}
                  {appointment.status !== 'CANCELLED' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleStatusUpdate('CANCELLED')}
                      disabled={updating}
                    >
                      {updating ? <Spinner animation="border" size="sm" /> : 'Cancel'}
                    </Button>
                  )}
                  {appointment.status !== 'NO_SHOW' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusUpdate('NO_SHOW')}
                      disabled={updating}
                    >
                      {updating ? <Spinner animation="border" size="sm" /> : 'No Show'}
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AppointmentDetails;
