import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    registrationNo: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Save token and user data to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login successful");

        // ✅ Reload the page after successful login to reinitialize app state
        window.location.href = "/home"; // This forces a full reload
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Server error");
    }
  };

  return (
    <>
    <Container fluid className="d-flex align-items-center" style={{ minHeight: "90vh" }}>
      <Row className="w-100">
        <div className="w-100 mb-4 text-primary fw-bold" style={{ fontSize: "20px" }}>
          Connect Guru
        </div>

        <Col md={6} className="p-5 d-flex align-items-center justify-content-center flex-column">
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <h3 className="mb-3 fw-bold">Login to your account</h3>
            <p className="text-muted">Enter your credentials to continue</p>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="registrationNo">
                <Form.Label>Registration No *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="SP22-BCS-000"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password *</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="********"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button variant="primary" className="w-100 mt-3" type="submit">
                Login
              </Button>
            </Form>
          </div>
          <div className="mt-3 text-center">
            <span>Don't have an account? </span>
            <Button variant="link" onClick={() => navigate('/')}>Register Now</Button>
          </div>
        </Col>

        <Col md={6} className="d-none d-md-block p-0">
          <div
            style={{
              height: "70vh",
              background: `url('sign.svg') center/cover no-repeat`,
            }}
          ></div>
        </Col>
      </Row>
    </Container>
    </>
  );
};
