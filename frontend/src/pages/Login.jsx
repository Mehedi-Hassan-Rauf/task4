import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const payload = {
      email,
      password,
    };

    try {
      // Make the API call to the backend
      const response = await axios.post('https://task4-server-jxfl.onrender.com/api/login', payload);

      // response contains a token
      const { token } = response.data;

      // Store the token in local storage
      localStorage.setItem('token', token);

      // Redirect to a protected route or admin page
      navigate('/admin');

    } catch (error) {
      // Handle error
      setErrorMessage('Invalid email or password. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className='m-4'>
      <h3 className="text-center mb-4">Login</h3>
      <form onSubmit={handleLogin}>
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
        <button type="submit" className="btn btn-primary w-100">Login</button>
        {errorMessage && <p>{errorMessage}</p>} {/* Display error message if any */}
        <p className="text-center mt-3">
          Don't have an account? <span className="text-primary" style={{ cursor: 'pointer' }} onClick={()=>{navigate('/register')}}>Register</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
