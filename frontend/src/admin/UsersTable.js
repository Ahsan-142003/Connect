import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("All");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/all-users");
        setUsers(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Apply filters
  const filteredUsers = users.filter((user) => {
    const nameMatch = user.fullName
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const audienceMatch =
      audienceFilter === "All" || user.userType === audienceFilter;
    return nameMatch && audienceMatch;
  });

  return (
    <div className="p-4">
      <h2 className="mb-4">All Registered Users</h2>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </Col>
        <Col md={6}>
          <Form.Select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
          </Form.Select>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>User Type</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u._id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.userType}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UsersTable;
