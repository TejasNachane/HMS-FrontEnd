import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorAPI, patientAPI, appointmentAPI, prescriptionAPI } from '../services/api';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    prescriptions: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard - Current user object:', user); // Debug log
    fetchStats();
    if (hasRole('ADMIN')) {
      fetchRecentPatients();
      fetchAllDoctors();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const promises = [];
      
      if (hasRole('ADMIN')) {
        promises.push(
          doctorAPI.getAllDoctors(),
          patientAPI.getAllPatients(),
          appointmentAPI.getAllAppointments(),
          prescriptionAPI.getAllPrescriptions()
        );
      } else if (hasRole('DOCTOR')) {
        // Get doctor's own appointments and prescriptions
        const doctorId = user.doctorId || user.id;
        if (doctorId) {
          promises.push(
            patientAPI.getAllPatients(), // Doctors can see all patients
            appointmentAPI.getAppointmentsByDoctor(doctorId),
            prescriptionAPI.getPrescriptionsByDoctor(doctorId)
          );
        } else {
          console.error('Doctor ID not found. Please log out and log back in.');
          setLoading(false);
          return;
        }
      } else if (hasRole('PATIENT')) {
        // Get patient's own appointments and prescriptions
        const patientId = user.patientId || user.id;
        if (patientId) {
          promises.push(
            appointmentAPI.getAppointmentsByPatient(patientId),
            prescriptionAPI.getPrescriptionsByPatient(patientId)
          );
        } else {
          console.error('Patient ID not found. Please log out and log back in.');
          setLoading(false);
          return;
        }
      }

      const results = await Promise.allSettled(promises);
      
      const newStats = { ...stats };
      let index = 0;
      
      if (hasRole('ADMIN')) {
        if (results[index]?.status === 'fulfilled') newStats.doctors = results[index].value.data.length;
        index++;
        if (results[index]?.status === 'fulfilled') newStats.patients = results[index].value.data.length;
        index++;
        if (results[index]?.status === 'fulfilled') newStats.appointments = results[index].value.data.length;
        index++;
        if (results[index]?.status === 'fulfilled') newStats.prescriptions = results[index].value.data.length;
      } else if (hasRole('DOCTOR')) {
        if (results[index]?.status === 'fulfilled') newStats.patients = results[index].value.data.length;
        index++;
        if (results[index]?.status === 'fulfilled') newStats.appointments = results[index].value.data.length;
        index++;
        if (results[index]?.status === 'fulfilled') newStats.prescriptions = results[index].value.data.length;
      } else if (hasRole('PATIENT')) {
        if (results[index]?.status === 'fulfilled') newStats.appointments = results[index].value.data.length;
        index++;
        if (results[index]?.status === 'fulfilled') newStats.prescriptions = results[index].value.data.length;
      }
      
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPatients = async () => {
    try {
      const response = await patientAPI.getAllPatients();
      // Get the most recent 5 patients (assuming they have a creation date or ID order)
      const patients = response.data;
      const sortedPatients = patients
        .sort((a, b) => {
          // Sort by ID in descending order (assuming higher ID = more recent)
          return b.id - a.id;
        })
        .slice(0, 5);
      setRecentPatients(sortedPatients);
    } catch (error) {
      console.error('Error fetching recent patients:', error);
    }
  };

  const fetchAllDoctors = async () => {
    try {
      const response = await doctorAPI.getAllDoctors();
      setAllDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, link }) => (
    <Col md={6} lg={3} className="mb-4">
      <Card className={`border-${color} h-100`}>
        <Card.Body className="text-center">
          <div className={`text-${color} mb-3`}>
            <i className={`bi ${icon} fs-1`}></i>
          </div>
          <h2 className={`text-${color} mb-2`}>{loading ? '...' : value}</h2>
          <p className="text-muted mb-3">{title}</p>
          {link && (
            <Button as={Link} to={link} variant={`outline-${color}`} size="sm">
              View All <i className="bi bi-arrow-right ms-1"></i>
            </Button>
          )}
        </Card.Body>
      </Card>
    </Col>
  );

  const QuickAction = ({ title, description, icon, color, link }) => (
    <Col md={6} lg={4} className="mb-3">
      <Card className="h-100 border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            <div className={`bg-${color} text-white rounded-circle p-3 me-3`}>
              <i className={`bi ${icon} fs-5`}></i>
            </div>
            <div>
              <h6 className="mb-1">{title}</h6>
              <small className="text-muted">{description}</small>
            </div>
          </div>
          <Button as={Link} to={link} variant={color} size="sm" className="w-100">
            <i className={`bi ${icon} me-1`}></i>
            {title}
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard
          </h2>
          <p className="text-muted">
            Welcome back, <strong>{user?.username}</strong>! You are logged in as{' '}
            <span className="badge bg-primary">{user?.role}</span>
          </p>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row>
        {hasRole('ADMIN') && (
          <StatCard
            title="Total Doctors"
            value={stats.doctors}
            icon="bi-person-badge"
            color="success"
            link="/doctors"
          />
        )}
        
        {(hasRole('ADMIN') || hasRole('DOCTOR')) && (
          <StatCard
            title="Total Patients"
            value={stats.patients}
            icon="bi-people"
            color="info"
            link="/patients"
          />
        )}
        
        <StatCard
          title="Appointments"
          value={stats.appointments}
          icon="bi-calendar-check"
          color="warning"
          link="/appointments"
        />
        
        <StatCard
          title="Prescriptions"
          value={stats.prescriptions}
          icon="bi-prescription2"
          color="danger"
          link="/prescriptions"
        />
      </Row>

      {/* Admin Dashboard Content */}
      {hasRole('ADMIN') && (
        <Row className="mt-5">
          {/* Recently Added Patients - 60% */}
          <Col lg={7} className="mb-4">
            <Card className="border-0 h-100" style={{ 
              backgroundColor: '#fefefe', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)', 
              borderRadius: '16px',
              border: '1px solid #e8f4f8'
            }}>
              <Card.Header 
                className="border-0 text-white position-relative" 
                style={{ 
                  background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                  borderRadius: '16px 16px 0 0',
                  padding: '20px 24px',
                  overflow: 'hidden'
                }}
              >
                {/* Notebook lines decoration */}
                <div 
                  className="position-absolute start-0 top-0 h-100 opacity-25"
                  style={{
                    width: '40px',
                    backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 23px, rgba(255,255,255,0.3) 24px, rgba(255,255,255,0.3) 25px)',
                    borderRight: '2px solid rgba(255,255,255,0.3)'
                  }}
                />
                <h5 className="mb-0 position-relative" style={{ marginLeft: '50px', fontFamily: 'Georgia, serif', letterSpacing: '0.5px' }}>
                  <i className="bi bi-people me-2"></i>
                  Recently Added Patients
                </h5>
              </Card.Header>
              <Card.Body style={{ 
                padding: '24px',
                backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 30px, rgba(0,123,255,0.05) 31px, rgba(0,123,255,0.05) 32px)',
                borderLeft: '3px solid #17a2b8',
                marginLeft: '20px'
              }}>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : recentPatients.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentPatients.map((patient, index) => (
                      <div key={patient.id} className="list-group-item border-0 px-0 py-3" style={{
                        borderBottom: index < recentPatients.length - 1 ? '1px dotted #dee2e6' : 'none',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div style={{ position: 'relative', paddingLeft: '20px' }}>
                            {/* Bullet point */}
                            <div 
                              className="position-absolute"
                              style={{
                                left: '0px',
                                top: '8px',
                                width: '6px',
                                height: '6px',
                                backgroundColor: '#17a2b8',
                                borderRadius: '50%'
                              }}
                            />
                            <h6 className="mb-1" style={{ color: '#2c3e50', fontWeight: '600' }}>{patient.name}</h6>
                            <small className="text-muted d-block" style={{ lineHeight: '1.4' }}>
                              <i className="bi bi-envelope me-1" style={{ color: '#17a2b8' }}></i>
                              {patient.email}
                            </small>
                            <small className="text-muted d-block" style={{ lineHeight: '1.4' }}>
                              <i className="bi bi-telephone me-1" style={{ color: '#17a2b8' }}></i>
                              {patient.phone}
                            </small>
                          </div>
                          <div className="text-end">
                            <span className="badge" style={{ 
                              backgroundColor: '#e8f4f8', 
                              color: '#17a2b8',
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              padding: '4px 8px'
                            }}>ID: {patient.id}</span>
                            <br />
                            <small className="text-muted mt-1 d-block" style={{ fontStyle: 'italic' }}>
                              {patient.age} years, {patient.gender}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5" style={{ 
                    background: 'linear-gradient(45deg, #f8f9fa 25%, transparent 25%), linear-gradient(-45deg, #f8f9fa 25%, transparent 25%)',
                    backgroundSize: '20px 20px',
                    borderRadius: '8px',
                    border: '2px dashed #dee2e6'
                  }}>
                    <i className="bi bi-people text-muted" style={{ fontSize: '3rem', opacity: '0.5' }}></i>
                    <p className="text-muted mt-3" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>No patients registered yet</p>
                    <Button as={Link} to="/patients/register" 
                      style={{ 
                        backgroundColor: '#17a2b8', 
                        border: 'none',
                        borderRadius: '20px',
                        padding: '8px 20px',
                        fontWeight: '500'
                      }}
                    >
                      <i className="bi bi-person-plus me-1"></i>
                      Register First Patient
                    </Button>
                  </div>
                )}
                <div className="mt-4 text-center" style={{ borderTop: '1px solid #e9ecef', paddingTop: '16px' }}>
                  <Button as={Link} to="/patients" 
                    variant="outline-info" 
                    size="sm"
                    style={{ 
                      borderRadius: '20px',
                      padding: '6px 16px',
                      fontWeight: '500',
                      borderColor: '#17a2b8',
                      color: '#17a2b8'
                    }}
                  >
                    View All Patients <i className="bi bi-arrow-right ms-1"></i>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* All Doctors - 40% */}
          <Col lg={5} className="mb-4">
            <Card className="border-0 h-100" style={{ 
              backgroundColor: '#fefefe', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)', 
              borderRadius: '16px',
              border: '1px solid #e8f5e8'
            }}>
              <Card.Header 
                className="border-0 text-white position-relative" 
                style={{ 
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  borderRadius: '16px 16px 0 0',
                  padding: '20px 24px',
                  overflow: 'hidden'
                }}
              >
                {/* Notebook lines decoration */}
                <div 
                  className="position-absolute start-0 top-0 h-100 opacity-25"
                  style={{
                    width: '40px',
                    backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 23px, rgba(255,255,255,0.3) 24px, rgba(255,255,255,0.3) 25px)',
                    borderRight: '2px solid rgba(255,255,255,0.3)'
                  }}
                />
                <h5 className="mb-0 position-relative" style={{ marginLeft: '50px', fontFamily: 'Georgia, serif', letterSpacing: '0.5px' }}>
                  <i className="bi bi-person-badge me-2"></i>
                  All Doctors
                </h5>
              </Card.Header>
              <Card.Body style={{ 
                padding: '24px',
                backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 30px, rgba(40,167,69,0.05) 31px, rgba(40,167,69,0.05) 32px)',
                borderLeft: '3px solid #28a745',
                marginLeft: '20px'
              }}>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : allDoctors.length > 0 ? (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {allDoctors.map((doctor, index) => (
                      <div key={doctor.id} className="mb-3">
                        <div 
                          className="d-flex align-items-center p-3 position-relative"
                          style={{
                            backgroundColor: index % 2 === 0 ? '#f8fff8' : '#ffffff',
                            borderRadius: '12px',
                            border: '1px dotted #20c997',
                            borderLeft: '4px solid #28a745',
                            marginLeft: '16px',
                            backgroundImage: 'linear-gradient(90deg, #28a745 0px, #28a745 2px, transparent 2px)',
                            paddingLeft: '24px'
                          }}
                        >
                          {/* Bullet point */}
                          <div 
                            className="position-absolute"
                            style={{
                              left: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '8px',
                              height: '8px',
                              backgroundColor: '#28a745',
                              borderRadius: '50%'
                            }}
                          />
                          <div className="me-3">
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center text-white"
                              style={{ 
                                width: '45px', 
                                height: '45px', 
                                background: 'linear-gradient(135deg, #28a745, #20c997)',
                                fontSize: '18px',
                                fontWeight: 'bold'
                              }}
                            >
                              {doctor.name?.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1" style={{ color: '#155724', fontFamily: 'Georgia, serif', fontWeight: '600' }}>
                              Dr. {doctor.name}
                            </h6>
                            <p className="mb-1" style={{ fontSize: '14px', fontStyle: 'italic' }}>
                              <i className="bi bi-briefcase me-1" style={{ color: '#28a745' }}></i>
                              <span className="badge" style={{ 
                                backgroundColor: '#e8f5e8', 
                                color: '#28a745',
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                padding: '4px 8px'
                              }}>
                                {doctor.specialization?.replace(/_/g, ' ')}
                              </span>
                            </p>
                            <p className="mb-0" style={{ fontSize: '13px', color: '#6c757d' }}>
                              <i className="bi bi-clock me-1"></i>
                              {doctor.experience} years exp. | 
                              <span className="text-success fw-bold ms-1">${doctor.consultationFee}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="text-center py-5"
                    style={{
                      background: 'linear-gradient(135deg, #f8fff8 0%, #fff 100%)',
                      borderRadius: '12px',
                      border: '2px dashed #28a745',
                      margin: '16px'
                    }}
                  >
                    <i className="bi bi-person-badge" style={{ fontSize: '48px', color: '#28a745', opacity: 0.6 }}></i>
                    <p className="text-muted mt-3 mb-3" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                      No doctors registered yet
                    </p>
                    <Button as={Link} to="/doctors/register" 
                      style={{ 
                        backgroundColor: '#28a745', 
                        border: 'none',
                        borderRadius: '20px',
                        padding: '8px 20px',
                        fontWeight: '500'
                      }}
                    >
                      <i className="bi bi-person-plus me-1"></i>
                      Register First Doctor
                    </Button>
                  </div>
                )}
                <div 
                  className="mt-4 text-center" 
                  style={{ borderTop: '1px solid #e9ecef', paddingTop: '16px' }}
                >
                  <Button as={Link} to="/doctors" 
                    variant="outline-success" 
                    size="sm"
                    style={{ 
                      borderRadius: '20px',
                      padding: '6px 16px',
                      fontWeight: '500',
                      borderColor: '#28a745',
                      color: '#28a745'
                    }}
                  >
                    View All Doctors <i className="bi bi-arrow-right ms-1"></i>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Non-Admin Quick Actions */}
      {!hasRole('ADMIN') && (
        <>
          <Row className="mt-5">
            <Col>
              <h4 className="text-secondary mb-4">
                <i className="bi bi-lightning me-2"></i>
                Quick Actions
              </h4>
            </Col>
          </Row>

          <Row>
            {hasRole('DOCTOR') && (
              <>
                <QuickAction
                  title="Create Appointment"
                  description="Schedule a new appointment"
                  icon="bi-calendar-plus"
                  color="warning"
                  link="/appointments/create"
                />
                <QuickAction
                  title="Create Prescription"
                  description="Write a new prescription"
                  icon="bi-prescription2"
                  color="danger"
                  link="/prescriptions/create"
                />
              </>
            )}

            {hasRole('PATIENT') && (
              <QuickAction
                title="Book Appointment"
                description="Schedule a new appointment"
                icon="bi-calendar-plus"
                color="warning"
                link="/appointments/create"
              />
            )}

            <QuickAction
              title="View Profile"
              description="Update your profile information"
              icon="bi-person-circle"
              color="secondary"
              link="/profile"
            />
          </Row>
        </>
      )}

    </Container>
  );
};

export default Dashboard;
