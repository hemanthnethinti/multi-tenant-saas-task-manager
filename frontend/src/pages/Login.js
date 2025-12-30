import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import '../styles/Auth.css';

function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantSubdomain: ''
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

    try {
      const response = await login(formData);
      const { user, token } = response.data.data;
      loginUser(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Organization Subdomain</label>
            <div className="subdomain-input">
              <input
                type="text"
                name="tenantSubdomain"
                value={formData.tenantSubdomain}
                onChange={handleChange}
                className="form-input"
                placeholder="your-company"
                required
              />
              <span className="subdomain-suffix">.taskflow.com</span>
            </div>
            <small className="text-muted">
              Super admins can leave subdomain empty
            </small>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Create Organization</Link>
          </p>
        </form>

        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Email: admin@acme.com<br />
          Password: Admin@123<br />
          Subdomain: acme</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
