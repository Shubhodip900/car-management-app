// src/pages/CarDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const CarDetail = () => {
  const { id } = useParams(); // Get the car ID from the URL params
  const [car, setCar] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Track if we're editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: { car_type: '', company: '' },
    images: []
  });
  const navigate = useNavigate();

  // Fetch car details based on the ID from the URL
  const fetchCar = async () => {
    const { data } = await api.get(`/cars/${id}`);
    setCar(data);
    setFormData({
      title: data.title,
      description: data.description,
      tags: data.tags,
      images: data.images // Assuming images are in base64 format or URLs
    });
  };

  useEffect(() => {
    fetchCar();
  }, [id]);

  // Handle delete car
  const deleteCar = async () => {
    await api.delete(`/cars/${id}`);
    navigate('/'); // Navigate back to the car list after deletion
  };

  // Handle form data change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prevData) => ({
        ...prevData,
        [parent]: {
          ...prevData[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  // Handle file input change for images
  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...e.target.files]
    }));
  };

  // Handle remove existing image
  const handleRemoveImage = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index)
    }));
  };

  // Handle form submit to update car details
  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedCar = new FormData();
    updatedCar.append('title', formData.title);
    updatedCar.append('description', formData.description);
    updatedCar.append('tags', JSON.stringify(formData.tags));

    // Append only new files and existing images that have not been removed
    formData.images.forEach((image, i) => {
      // Check if image is a File object (newly uploaded), otherwise it's an existing image
      if (image instanceof File) {
        updatedCar.append('images', image);
      } else {
        // Existing image, send it as a base64 string or keep as URL (depends on backend handling)
        updatedCar.append(`existing_images[${i}]`, image);
      }
    });
    console.log("updated car details");
    console.log(updatedCar);
    await api.put(`/cars/${id}`, updatedCar, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setIsEditing(false); // Turn off editing mode
    fetchCar(); // Refresh car details
  };

  if (!car) return <div>Loading...</div>;

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card shadow-lg p-4">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <h2>Edit Car</h2>

                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="car_type" className="form-label">Car Type</label>
                  <input
                    type="text"
                    className="form-control"
                    id="car_type"
                    name="tags.car_type"
                    value={formData.tags.car_type}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="company" className="form-label">Company</label>
                  <input
                    type="text"
                    className="form-control"
                    id="company"
                    name="tags.company"
                    value={formData.tags.company}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                <label htmlFor="images" className="form-label">Existing Images</label>
                <div className="row">
                  {formData.images.map((image, index) => (
                    <div className="col-md-4 position-relative" key={index}>
                      <img
                        src={image instanceof File ? URL.createObjectURL(image) : `data:image/jpeg;base64,${image}`}
                        alt={`Car Image ${index}`}
                        className="img-fluid rounded mb-2"
                        style={{ height: '100px', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        className="btn-close position-absolute top-0 end-0 m-1"
                        aria-label="Remove"
                        onClick={() => handleRemoveImage(index)}
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: '50%' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

                <div className="mb-3">
                  <label htmlFor="images" className="form-label">Upload New Images</label>
                  <input
                    type="file"
                    className="form-control"
                    id="images"
                    name="images"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>

                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <h2 className="mb-4">{car.title}</h2>
                <p className="text-muted">{car.description}</p>

                <div className="mb-3">
                  {car.tags && car.tags.car_type && (
                    <span className="badge bg-info me-2">{car.tags.car_type}</span>
                  )}
                  {car.tags && car.tags.company && (
                    <span className="badge bg-success">{car.tags.company}</span>
                  )}
                </div>

                <div className="mb-4">
                  <h5>Images</h5>
                  <div className="row">
                    {car.images && car.images.length > 0 ? (
                      car.images.map((image, idx) => (
                        <div className="col-md-4" key={idx}>
                          <img
                            src={`data:image/jpeg;base64,${image}`}
                            alt={`Car Image ${idx}`}
                            className="img-fluid rounded mb-3"
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        </div>
                      ))
                    ) : (
                      <p>No images available for this car.</p>
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-danger"
                    onClick={deleteCar}
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;