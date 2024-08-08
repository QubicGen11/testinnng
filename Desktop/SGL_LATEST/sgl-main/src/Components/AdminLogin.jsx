import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending request with:', { email, password });
      const response = await axios.post('http://localhost:8083/api/admin/login', { email, password });
      console.log('Response:', response);
      localStorage.setItem('token', response.data.token);
      navigate('/admin');
    } catch (error) {
      console.error('Error response:', error.response);
      setError('Invalid email or password');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://res.cloudinary.com/defsu5bfc/video/upload/v1721895303/lawyer-2_p11u9h.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gray-900 bg-opacity-50"></div>
      <div className="relative z-10 bg-gray-300 bg-opacity-90 p-6 rounded shadow-md w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl mb-4">Admin Login</h2>
          {error && <p className="text-red-500">{error}</p>}
          <div className="mb-4">
            
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
