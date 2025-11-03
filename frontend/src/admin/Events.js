import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Row,
  Col,
  Image,
  Carousel,
  Form,
  Button,
  Modal,
} from "react-bootstrap";

const Events = () => {
  const [eventList, setEventList] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");
  const [filterAudience, setFilterAudience] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewEvent, setViewEvent] = useState(null);

  const formatTime = (time) => {
    return time
      ? new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "N/A";
  };

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/events");
        setEventList(res.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = [...eventList];
    if (filterDate) {
      filtered = filtered.filter(
        (event) =>
          event.date &&
          !isNaN(new Date(event.date)) &&
          new Date(event.date).toISOString().split("T")[0] === filterDate
      );
    }
    if (filterTime) {
      filtered = filtered.filter((event) => event.time === filterTime);
    }
    if (filterAudience) {
      filtered = filtered.filter((event) => event.audience === filterAudience);
    }
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    return filtered;
  }, [eventList, filterDate, filterTime, filterAudience, sortOrder]);

  const handleClearFilters = () => {
    setFilterDate("");
    setFilterTime("");
    setFilterAudience("");
    setSortOrder("asc");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      setEventList((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("❌ Failed to delete event.");
    }
  };

  const handleEditClick = (event) => {
    setSelectedEvent({ ...event, newFiles: [] });
    setShowEditModal(true);
  };

  const handleViewClick = (event) => {
    setViewEvent(event);
    setShowViewModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const {
        _id,
        title,
        date,
        time,
        audience,
        description,
        images,
        newFiles,
      } = selectedEvent;

      const formData = new FormData();
      formData.append("title", title);
      formData.append("date", date);
      formData.append("time", time);
      formData.append("audience", audience);
      formData.append("description", description);

      images.forEach((img) => formData.append("existingImages[]", img));
      if (newFiles && newFiles.length > 0) {
        Array.from(newFiles).forEach((file) =>
          formData.append("newImages", file)
        );
      }

      const res = await axios.put(
        `http://localhost:5000/api/events/${_id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setEventList((prev) =>
        prev.map((e) => (e._id === _id ? res.data : e))
      );
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update event:", err);
      alert("❌ Failed to update event.");
    }
  };

  return (
    <>
      <h4 className="mb-3">Posted Events</h4>

      {/* Filters */}
      <Form className="mb-4">
        <Row className="g-3">
          <Col md={3}>
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Time</Form.Label>
            <Form.Control
              type="time"
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Label>Audience</Form.Label>
            <Form.Select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
            >
              <option value="">All</option>
              <option value="Student">Student</option>
              <option value="Alumni">Alumni</option>
              <option value="Both">Both</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Label>Sort by Date</Form.Label>
            <Form.Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </Form.Select>
          </Col>
          <Col md={1} className="d-flex align-items-end">
            <Button variant="secondary" onClick={handleClearFilters}>
              Clear
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Event Cards */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredEvents.map((event) => (
          <Col key={event._id}>
            <Card className="shadow-sm h-100">
              {event.images.length > 0 && (
                <Carousel interval={3000}>
                  {event.images.map((img, idx) => (
                    <Carousel.Item key={idx}>
                      <Image
                        src={`http://localhost:5000/uploads/${img}`}
                        alt={`Slide ${idx}`}
                        fluid
                        style={{
                          height: "200px",
                          objectFit: "cover",
                          width: "100%",
                        }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              )}
              <Card.Body>
                <Card.Title>{event.title}</Card.Title>
                <p className="mb-1">
                  <strong>Event Date:</strong>{" "}
                  {event.date
                    ? new Date(event.date).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="mb-1">
                  <strong>Time:</strong> {formatTime(event.time)}
                </p>
                <p className="mb-1">
                  <strong>Audience:</strong> {event.audience}
                </p>
                <Card.Text>{event.description}</Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Posted on:{" "}
                    {new Date(event.createdAt).toLocaleDateString()}
                  </small>
                  <div className="d-flex gap-2">
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleViewClick(event)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEditClick(event)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(event._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={selectedEvent.title}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedEvent.date?.split("T")[0] || ""}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Time</Form.Label>
                <Form.Control
                  type="time"
                  name="time"
                  value={selectedEvent.time || ""}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Audience</Form.Label>
                <Form.Select
                  name="audience"
                  value={selectedEvent.audience}
                  onChange={handleEditChange}
                >
                  <option value="">Select</option>
                  <option value="Student">Student</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Both">Both</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={selectedEvent.description}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Existing Images</Form.Label>
                <Row className="g-2">
                  {selectedEvent.images?.map((img, idx) => (
                    <Col xs={4} key={idx} className="position-relative">
                      <Image
                        src={`http://localhost:5000/uploads/${img}`}
                        thumbnail
                        style={{ height: "80px", objectFit: "cover" }}
                      />
                      <Button
                        size="sm"
                        variant="danger"
                        style={{ position: "absolute", top: 2, right: 2 }}
                        onClick={() =>
                          setSelectedEvent((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        ×
                      </Button>
                    </Col>
                  ))}
                </Row>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Upload New Images</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={(e) =>
                    setSelectedEvent((prev) => ({
                      ...prev,
                      newFiles: e.target.files,
                    }))
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Event Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewEvent && (
            <>
              <h5>{viewEvent.title}</h5>
              <p>
                <strong>Date:</strong>{" "}
                {viewEvent.date
                  ? new Date(viewEvent.date).toLocaleDateString()
                  : "N/A"}
              </p>
              <p>
                <strong>Time:</strong> {formatTime(viewEvent.time)}
              </p>
              <p>
                <strong>Audience:</strong> {viewEvent.audience}
              </p>
              <p>
                <strong>Description:</strong> {viewEvent.description}
              </p>
              {viewEvent.images?.length > 0 && (
                <Carousel interval={3000}>
  {viewEvent.images.map((img, idx) => (
    <Carousel.Item key={idx}>
      <a
        href={`http://localhost:5000/uploads/${img}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Click to view full image"
      >
        <Image
          src={`http://localhost:5000/uploads/${img}`}
          fluid
          style={{
            height: "200px",
            objectFit: "cover",
            width: "100%",
            cursor: "zoom-in",
          }}
        />
      </a>
    </Carousel.Item>
  ))}
</Carousel>

              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Events;
