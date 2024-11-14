// src/pages/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); 

  const handleChange = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      navigate('/');
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4">
            <h3 className="text-center mb-4">Login</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  id="email"
                  placeholder="Enter email"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  id="password"
                  placeholder="Enter password"
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
