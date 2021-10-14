import React from 'react';
import { Container, Nav } from 'react-bootstrap';
import Navbar from 'react-bootstrap/esm/Navbar';
import { Link } from 'react-router-dom';
import DashboardRouter from './DashboardRouter';
import './dashboard.style.scss';

const Dashboard = () => {
  return (
    <React.Fragment>
      <Navbar collapseOnSelect expand="lg" bg="secondary" variant="dark">
        <Container>
          <Navbar.Brand href="#">
            <h5>
              Karina<span>Extranet</span>
            </h5>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Link
                className="nav-bar-link-fix"
                to="/dashboard/gestion-demanda"
              >
                Gestión De Demanda
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container>
        <DashboardRouter />
      </Container>
    </React.Fragment>
  );
};

export default Dashboard;
