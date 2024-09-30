import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent form submission

    const registrationData = {
      name,
      email,
      password,
    };

    try {
      // Make an API call to the backend for registration
      const response = await axios.post('https://task4-server-jxfl.onrender.com/api/register', registrationData);

      setSuccessMessage('Registration successful! You can now log in.');
      setErrorMessage(''); // Clear any previous error message
      navigate('/login');

    } catch (error) {
      // Handle error
      setErrorMessage('Registration failed. Please try again.');
      setSuccessMessage(''); // Clear any previous success message
      console.error('Registration error:', error);
    }
  };

  return (
    <div>
      <h3 className="text-center mb-4">Register</h3>
      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Register</button>
        {errorMessage && <p className="text-danger">{errorMessage}</p>} {/* Display error message */}
        {successMessage && <p className="text-success">{successMessage}</p>} {/* Display success message */}
        <p className="text-center mt-3">
          Already have an account? <span className="text-primary" style={{ cursor: 'pointer' }} onClick={()=>{navigate('/login')}}>Login</span>
        </p>
      </form>
    </div>
  );
};

export default Register;
