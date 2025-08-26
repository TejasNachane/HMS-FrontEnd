import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="text-center shadow">
            <Card.Body className="p-5">
              <div className="text-warning mb-4">
                <i className="bi bi-exclamation-triangle" style={{ fontSize: '4rem' }}></i>
              </div>
              
              <h2 className="text-warning mb-3">Access Denied</h2>
              
              <p className="text-muted mb-4">
                You don't have permission to access this page. 
                Please contact your administrator if you believe this is an error.
              </p>
              
              <div className="d-grid gap-2">
                <Button as={Link} to="/dashboard" variant="primary">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Go to Dashboard
                </Button>
                
                <Button as={Link} to="/" variant="outline-secondary">
                  <i className="bi bi-house me-2"></i>
                  Back to Home
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Unauthorized;
