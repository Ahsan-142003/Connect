import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    registrationNo: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("User registered successfully");
        navigate("/home");
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      alert("Error connecting to the server");
    }
  };

  return (
    <>
  <style>{`
  body {
    margin: 0;
    overflow-y: auto;
  }

  .signup-header {
    text-align: center;
    padding-top: 20px;
    font-size: 28px;
  }

  .signup-container {
    min-height: 100vh;
    padding: 20px 10px;
    display: flex;
    align-items: center;
  }

  .form-box {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .signup-img {
    height: 100vh;
    background: url('sign.svg') center/cover no-repeat;
  }

  .login-link {
    color: blue;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .signup-container {
      display: block;
      padding: 20px;
    }

    .signup-img {
      display: none;
    }

    .signup-header {
      font-size: 24px;
      margin-bottom: 10px;
    }
  }
`}</style>


      <div className="signup-header text-primary fw-bold">Connect Guru</div>

      <Container fluid>
        <Row className="signup-container">
          <Col md={6}>
            <div className="form-box">
              <h4 className="fw-bold mb-3">Create an account</h4>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2" controlId="fullName">
                  <Form.Label>Full name *</Form.Label>
                  <Form.Control type="text" placeholder="Name" required onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-2" controlId="registrationNo">
                  <Form.Label>Registration No *</Form.Label>
                  <Form.Control type="text" placeholder="SP22-BCS-000" required onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-2" controlId="email">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control type="email" placeholder="email@email.com" required onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-2" controlId="userType">
                  <Form.Label>Register as *</Form.Label>
                  <Form.Select required onChange={handleChange}>
                    <option value="">Select an option</option>
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2" controlId="password">
                  <Form.Label>Password *</Form.Label>
                  <Form.Control type="password" placeholder="********" required onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Repeat password *</Form.Label>
                  <Form.Control type="password" placeholder="********" required onChange={handleChange} />
                </Form.Group>

                <Form.Text className="text-muted">
                  By clicking Sign up, you agree to our Terms and Conditions.
                </Form.Text>

                <Button variant="primary" className="w-100 mt-2" type="submit">
                  Sign up
                </Button>
              </Form>

              <div className="mt-3 text-center">
              <span>Already Registered?</span>
              <Button variant="link" onClick={() => navigate('/login')}>Login Now</Button>
            </div> 
            
            </div>
          </Col>

          <Col md={6} className="d-none d-md-block p-0">
            <div className="signup-img"></div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Signup;
