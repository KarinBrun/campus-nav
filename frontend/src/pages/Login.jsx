import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config';
import campusImage from '../assets/GV Campus.jpg';
import grandViewLogo from '../assets/grand-view-logo-white.jpg';
import './Login.scss';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const sessionExpired = location.state?.sessionExpired;
  const registrationSuccess = location.state?.registrationSuccess;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
        }),
        });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/');
    } catch (error) {
      console.error(error);
      setError('Unable to connect to the server.');
    }
  };

  return (
    <main
      className="login-page"
      style={{ backgroundImage: `url("${campusImage}")` }}
    >
      <div className="login-card">
        <img
          src={grandViewLogo}
          alt="Grand View University"
          className="login-logo"
        />

        <h2>Campus Nav</h2>
        <p>Sign in to access campus navigation.</p>

        {sessionExpired && (
          <p role="alert" className="login-error">
            Your session has expired. Please sign in again.
          </p>
        )}

        {registrationSuccess && (
          <p role="status">
            Account created successfully. Please sign in.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        <p>
          Don't have an account?{' '}
          <Link to="/register">Create Account</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
