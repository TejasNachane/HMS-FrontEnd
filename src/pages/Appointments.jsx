import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { appointmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { hasRole, user } = useAuth();

  const appointmentStatuses = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  useEffect(() => {
    console.log('Current user object:', user); // Debug log
    fetchAppointments();
  }, []);

  useEffect(() => {
    // Filter appointments based on search term and status
    let filtered = appointments.filter(appointment => {
      const matchesSearch = 
        (appointment.patientName && appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (appointment.doctorName && appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (appointment.reason && appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === '' || appointment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  const fetchAppointments = async () => {
    try {
      let response;
      if (hasRole('ADMIN')) {
        response = await appointmentAPI.getAllAppointments();
      } else if (hasRole('DOCTOR')) {
        // Use doctorId if available, otherwise user.id for backward compatibility
        const doctorId = user.doctorId || user.id;
        if (!doctorId) {
          console.error('Doctor ID not found. Please log out and log back in.');
          setError('Doctor ID not found. Please log out and log back in.');
          return;
        }
        response = await appointmentAPI.getAppointmentsByDoctor(doctorId);
      } else if (hasRole('PATIENT')) {
        // Use patientId if available, otherwise user.id for backward compatibility
        const patientId = user.patientId || user.id;
        if (!patientId) {
          console.error('Patient ID not found. Please log out and log back in.');
          setError('Patient ID not found. Please log out and log back in.');
          return;
        }
        response = await appointmentAPI.getAppointmentsByPatient(patientId);
      }
      
      setAppointments(response.data);
      setFilteredAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to fetch appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await appointmentAPI.updateAppointmentStatus(appointmentId, newStatus);
      // Refresh appointments
      fetchAppointments();
      alert('Appointment status updated successfully!');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update appointment status. Please try again.');
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      try {
        await appointmentAPI.deleteAppointment(appointmentId);
        setAppointments(appointments.filter(appointment => appointment.id !== appointmentId));
        alert('Appointment deleted successfully!');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'primary';
      case 'CONFIRMED': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'info';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading appointments...</p>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-primary">
              <i className="bi bi-calendar-check me-2"></i>
              Appointments
            </h2>
            {(hasRole('ADMIN') || hasRole('DOCTOR') || hasRole('PATIENT')) && (
              <Button as={Link} to="/appointments/create" variant="success">
                <i className="bi bi-calendar-plus me-1"></i>
                Schedule New Appointment
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by patient, doctor, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {appointmentStatuses.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3} className="text-end">
          <small className="text-muted">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </small>
        </Col>
      </Row>

      <Card className="shadow">
        <Card.Body>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-calendar-check text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="text-muted mt-3">No appointments found</h5>
              <p className="text-muted">
                {appointments.length === 0 
                  ? 'No appointments have been scheduled yet.' 
                  : 'Try adjusting your search criteria or filters.'
                }
              </p>
              {(hasRole('ADMIN') || hasRole('DOCTOR') || hasRole('PATIENT')) && appointments.length === 0 && (
                <Button as={Link} to="/appointments/create" variant="success">
                  <i className="bi bi-calendar-plus me-1"></i>
                  Schedule First Appointment
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead className="table-warning">
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>#{appointment.id}</td>
                      <td>
                        <strong>{appointment.patientName}</strong>
                        {appointment.patientPhone && (
                          <><br /><small className="text-muted">{appointment.patientPhone}</small></>
                        )}
                      </td>
                      <td>
                        <strong>{appointment.doctorName}</strong>
                        {appointment.doctorSpecialization && (
                          <><br /><small className="text-muted">{appointment.doctorSpecialization}</small></>
                        )}
                      </td>
                      <td>
                        <strong>{formatDateTime(appointment.appointmentTime)}</strong>
                      </td>
                      <td>{appointment.reason || 'General consultation'}</td>
                      <td>
                        <Badge bg={getStatusColor(appointment.status)}>
                          {appointment.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button
                            as={Link}
                            to={`/appointments/${appointment.id}`}
                            variant="outline-primary"
                            size="sm"
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          {(hasRole('ADMIN') || hasRole('DOCTOR')) && (
                            <>
                              <Button
                                as={Link}
                                to={`/appointments/${appointment.id}/edit`}
                                variant="outline-warning"
                                size="sm"
                                title="Edit Appointment"
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  title="Mark as Completed"
                                  onClick={() => handleStatusUpdate(appointment.id, 'COMPLETED')}
                                >
                                  <i className="bi bi-check-lg"></i>
                                </Button>
                              )}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                title="Delete Appointment"
                                onClick={() => handleDelete(appointment.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Summary Cards */}
      {appointments.length > 0 && (
        <Row className="mt-4">
          <Col md={3}>
            <Card className="text-center border-primary">
              <Card.Body>
                <h4 className="text-primary">{appointments.length}</h4>
                <small className="text-muted">Total Appointments</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-success">
              <Card.Body>
                <h4 className="text-success">
                  {appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length}
                </h4>
                <small className="text-muted">Upcoming</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-info">
              <Card.Body>
                <h4 className="text-info">
                  {appointments.filter(a => a.status === 'COMPLETED').length}
                </h4>
                <small className="text-muted">Completed</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-danger">
              <Card.Body>
                <h4 className="text-danger">
                  {appointments.filter(a => a.status === 'CANCELLED').length}
                </h4>
                <small className="text-muted">Cancelled</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Appointments;
