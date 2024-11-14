// src/pages/CarList.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const CarList = () => {
  const { user } = useContext(AuthContext); // Get logged-in user from context
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [newCar, setNewCar] = useState({
    title: '',
    description: '',
    tags: {
      car_type: '',
      company: '',
    },
    images: [],
  });
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch cars for the logged-in user when the component mounts
  useEffect(() => {
    console.log("calling api 1");
    console.log(user);
  
    // Only make the API call if the user is logged in
    // if (user) {
      console.log("calling api 2");
      api
        .get(`/cars`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((response) => setCars(response.data))
        .catch((error) => console.error('Error fetching cars:', error));
    // }
  }, [user]); // Add 'user' as a dependency

  // Filter cars based on the search term
  const filteredCars = cars.filter((car) =>
    car.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.tags?.car_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.tags.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCar((prevCar) => ({
      ...prevCar,
      [name]: value,
    }));
  };

  // Handle tag input change
  const handleTagChange = (e) => {
    const { name, value } = e.target;
    setNewCar((prevCar) => ({
      ...prevCar,
      tags: {
        ...prevCar.tags,
        [name]: value,
      },
    }));
  };

  // Handle image file change
  const handleImageChange = (e) => {
    setNewCar((prevCar) => ({
      ...prevCar,
      images: [...e.target.files],
    }));
  };

  // Handle form submission to create a new car
  const handleCreateCar = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', newCar.title);
    formData.append('description', newCar.description);
    formData.append('tags[car_type]', newCar.tags?.car_type);
    formData.append('tags[company]', newCar.tags.company);
    newCar.images.forEach((image) => formData.append('images', image));

    try {
      await api.post('/cars', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setShowModal(false); // Close the modal after successful creation
      setNewCar({
        title: '',
        description: '',
        tags: {
          car_type: '',
          company: '',
        },
        images: [],
      }); // Reset form state
      api
        .get(`/cars`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((response) => setCars(response.data))
        .catch((error) => console.error('Error fetching cars:', error));
    } catch (error) {
      console.error('Error creating car:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Cars</h2>
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search cars by title, description, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Button to Open Create Car Modal */}
      {user && (
        <div className="mb-4">
          <Button variant="success" onClick={() => setShowModal(true)}>
            Create New Car
          </Button>
        </div>
      )}


      {/* Cars List */}
      <div className="row">
        {filteredCars.length > 0 ? (
          filteredCars.map((car) => (
            <div className="col-md-4 mb-4" key={car._id}>
              <div className="card shadow-lg">
                <div className="card-body">
                  {/* Car Title */}
                  <h5 className="card-title">{car?.title}</h5>
                  
                  {/* Car Description */}
                  <p className="card-text">{car.description.slice(0, 100)}...</p>

                  {/* Car Tags */}
                  <div className="mb-2">
                    <strong>Type:</strong> {car?.tags?.car_type} <br />
                    <strong>Company:</strong> {car?.tags?.company}
                  </div>

                  {/* View Details Button */}
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/cars/${car._id}`)} // Navigate to the car's detail page
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No cars found.</p>
        )}
      </div>

      {/* Modal for Creating a New Car */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create a New Car</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateCar}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter car title"
                name="title"
                value={newCar.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter car description"
                name="description"
                value={newCar.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Car Type</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter car type"
                name="car_type"
                value={newCar.tags?.car_type}
                onChange={handleTagChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Company</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter car company"
                name="company"
                value={newCar.tags.company}
                onChange={handleTagChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleImageChange}
                accept="image/*"
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Create Car
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CarList;