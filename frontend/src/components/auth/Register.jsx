import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    studentId: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-register-container">
      <div className="auth-register-card">
        <h2 className="auth-register-title">Register for CampusHive</h2>
        {error && <div className="auth-register-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-register-form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="auth-register-input"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="auth-register-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            className="auth-register-input"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="auth-register-input"
          />
          <input
            type="text"
            name="department"
            placeholder="Department (optional)"
            value={formData.department}
            onChange={handleChange}
            className="auth-register-input"
          />
          <input
            type="text"
            name="studentId"
            placeholder="Student ID (optional)"
            value={formData.studentId}
            onChange={handleChange}
            className="auth-register-input"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone (optional)"
            value={formData.phone}
            onChange={handleChange}
            className="auth-register-input"
          />
          <button type="submit" disabled={loading} className="auth-register-button">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-register-link">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="auth-register-linkText">
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;

