import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // Filter patients based on search term
    const filtered = patients.filter(patient =>
      (patient.name && patient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.phone && patient.phone.includes(searchTerm))
    );
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getAllPatients();
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to fetch patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await patientAPI.deletePatient(patientId);
        setPatients(patients.filter(patient => patient.id !== patientId));
        alert('Patient deleted successfully!');
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
        <p className="mt-2">Loading patients...</p>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-primary">
              <i className="bi bi-people me-2"></i>
              Patients
            </h2>
            {hasRole('ADMIN') && (
              <Button as={Link} to="/patients/register" variant="success">
                <i className="bi bi-person-plus me-1"></i>
                Register New Patient
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
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-end">
          <small className="text-muted">
            Showing {filteredPatients.length} of {patients.length} patients
          </small>
        </Col>
      </Row>

      <Card className="shadow">
        <Card.Body>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="text-muted mt-3">No patients found</h5>
              <p className="text-muted">
                {patients.length === 0 
                  ? 'No patients have been registered yet.' 
                  : 'Try adjusting your search criteria.'
                }
              </p>
              {hasRole('ADMIN') && patients.length === 0 && (
                <Button as={Link} to="/patients/register" variant="success">
                  <i className="bi bi-person-plus me-1"></i>
                  Register First Patient
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped hover>
                <thead className="table-primary">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Blood Group</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>#{patient.id}</td>
                      <td>
                        <strong>{patient.name}</strong>
                      </td>
                      <td>{patient.age}</td>
                      <td>
                        <span className={`badge ${
                          patient.gender === 'MALE' ? 'bg-primary' : 
                          patient.gender === 'FEMALE' ? 'bg-info' : 'bg-secondary'
                        }`}>
                          {patient.gender}
                        </span>
                      </td>
                      <td>{patient.phone}</td>
                      <td>{patient.email}</td>
                      <td>
                        {patient.bloodGroup && (
                          <span className="badge bg-danger">
                            {patient.bloodGroup}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Button
                            as={Link}
                            to={`/patients/${patient.id}`}
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
                                to={`/patients/${patient.id}/edit`}
                                variant="outline-warning"
                                size="sm"
                                title="Edit Patient"
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                title="Delete Patient"
                                onClick={() => handleDelete(patient.id)}
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
      {patients.length > 0 && (
        <Row className="mt-4">
          <Col md={3}>
            <Card className="text-center border-primary">
              <Card.Body>
                <h4 className="text-primary">{patients.length}</h4>
                <small className="text-muted">Total Patients</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-info">
              <Card.Body>
                <h4 className="text-info">
                  {patients.filter(p => p.gender === 'MALE').length}
                </h4>
                <small className="text-muted">Male Patients</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-warning">
              <Card.Body>
                <h4 className="text-warning">
                  {patients.filter(p => p.gender === 'FEMALE').length}
                </h4>
                <small className="text-muted">Female Patients</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-success">
              <Card.Body>
                <h4 className="text-success">
                  {new Set(patients.map(p => p.bloodGroup).filter(Boolean)).size}
                </h4>
                <small className="text-muted">Blood Groups</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Patients;
