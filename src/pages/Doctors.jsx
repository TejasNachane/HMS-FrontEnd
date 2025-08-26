import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    // Filter doctors based on search term
    const filtered = doctors.filter(doctor =>
      (doctor.name && doctor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor.email && doctor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor.specialization && doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor.phone && doctor.phone.includes(searchTerm))
    );
    setFilteredDoctors(filtered);
  }, [doctors, searchTerm]);

  const fetchDoctors = async () => {
    try {
      const response = await doctorAPI.getAllDoctors();
      setDoctors(response.data);
      setFilteredDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to fetch doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      try {
        await doctorAPI.deleteDoctor(doctorId);
        setDoctors(doctors.filter(doctor => doctor.id !== doctorId));
        alert('Doctor deleted successfully!');
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
        <p className="mt-2">Loading doctors...</p>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-primary">
              <i className="bi bi-person-badge me-2"></i>
              Doctors
            </h2>
            {hasRole('ADMIN') && (
              <Button as={Link} to="/doctors/register" variant="success">
                <i className="bi bi-person-plus me-1"></i>
                Register New Doctor
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
              placeholder="Search doctors by name, email, specialization, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-end">
          <small className="text-muted">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </small>
        </Col>
      </Row>

      <Card className="shadow">
        <Card.Body>
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-person-badge text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="text-muted mt-3">No doctors found</h5>
              <p className="text-muted">
                {doctors.length === 0 
                  ? 'No doctors have been registered yet.' 
                  : 'Try adjusting your search criteria.'
                }
              </p>
              {hasRole('ADMIN') && doctors.length === 0 && (
                <Button as={Link} to="/doctors/register" variant="success">
                  <i className="bi bi-person-plus me-1"></i>
                  Register First Doctor
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead className="table-success">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Consultation Fee</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td>#{doctor.id}</td>
                      <td>
                        <strong>{doctor.name}</strong>
                        <br />
                        <small className="text-muted">{doctor.qualification}</small>
                      </td>
                      <td>
                        <Badge bg="primary">
                          {doctor.specialization?.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {doctor.experience} years
                        </span>
                      </td>
                      <td>{doctor.phone}</td>
                      <td>{doctor.email}</td>
                      <td>
                        <span className="text-success fw-bold">
                          ${doctor.consultationFee}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button
                            as={Link}
                            to={`/doctors/${doctor.id}`}
                            variant="outline-primary"
                            size="sm"
                            title="View Details"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          {hasRole('ADMIN') && (
                            <>
                              <Button
                                as={Link}
                                to={`/doctors/${doctor.id}/edit`}
                                variant="outline-warning"
                                size="sm"
                                title="Edit Doctor"
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                title="Delete Doctor"
                                onClick={() => handleDelete(doctor.id)}
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
      {doctors.length > 0 && (
        <Row className="mt-4">
          <Col md={3}>
            <Card className="text-center border-success">
              <Card.Body>
                <h4 className="text-success">{doctors.length}</h4>
                <small className="text-muted">Total Doctors</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-primary">
              <Card.Body>
                <h4 className="text-primary">
                  {new Set(doctors.map(d => d.specialization).filter(Boolean)).size}
                </h4>
                <small className="text-muted">Specializations</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-info">
              <Card.Body>
                <h4 className="text-info">
                  {doctors.length > 0 ? Math.round(doctors.reduce((sum, d) => sum + (d.experience || 0), 0) / doctors.length) : 0}
                </h4>
                <small className="text-muted">Avg Experience (years)</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-warning">
              <Card.Body>
                <h4 className="text-warning">
                  ${doctors.length > 0 ? Math.round(doctors.reduce((sum, d) => sum + (d.consultationFee || 0), 0) / doctors.length) : 0}
                </h4>
                <small className="text-muted">Avg Consultation Fee</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Doctors;
