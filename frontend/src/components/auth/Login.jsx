import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-login-container">
      <div className="auth-login-card">
        <h2 className="auth-login-title">Login to CampusHive</h2>
        {error && <div className="auth-login-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-login-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="auth-login-input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="auth-login-input"
          />
          <button type="submit" disabled={loading} className="auth-login-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-login-link">
          Don't have an account?{' '}
          <span onClick={() => navigate('/register')} className="auth-login-linkText">
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;

