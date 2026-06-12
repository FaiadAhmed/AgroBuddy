import React, { useState } from 'react';
import './Auth.css';
import { login, signup } from './AuthAPI';

const logo = process.env.PUBLIC_URL + '/logo.png';

export default function Auth({ onAuthSuccess }) {

  // which form is showing — 'signin' or 'signup'
  const [mode, setMode] = useState('signin');

  // all form fields in one object so there's only one piece of state to reset
  const [fields, setFields] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
  });

  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Switch between Sign In and Sign Up, wiping the form each time
  // so old values don't leak across modes
  function switchMode(newMode) {
    setMode(newMode);
    setFields({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
  }

  // Single handler for all inputs — name attribute on each input tells us which field to update
  function handleChange(e) {
    const { name, value } = e.target;
    setError(''); // clear the error as soon as the user starts typing again
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  // Client-side validation before we touch the API.
  // Returns an error string if something's wrong, empty string if everything's fine.
  function validate() {
    if (mode === 'signup' && !fields.name.trim()) {
      return 'Please enter your full name.';
    }
    if (!fields.email.trim()) {
      return 'Please enter your email address.';
    }
    if (!/\S+@\S+\.\S+/.test(fields.email)) {
      return 'Please enter a valid email address.';
    }
    if (fields.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (mode === 'signup' && fields.password !== fields.confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      let result;
      if (mode === 'signin') {
        result = await login(fields.email, fields.password);
      } else {
        result = await signup(fields.name, fields.email, fields.password);
      }

      // Store credentials so the session survives a page refresh
      localStorage.setItem('agro_token', result.token);
      localStorage.setItem('agro_user', JSON.stringify(result.user));

      // Tell App.jsx who logged in — it takes over from here
      onAuthSuccess(result.user);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        (mode === 'signin'
          ? 'Invalid email or password.'
          : 'Could not create account. Try a different email.')
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">
          <img src={logo} alt="Agro Buddy" className="auth-logo" />
          <h1 className="auth-app-name">Agro Buddy</h1>
          <p className="auth-tagline">Your smart farm management companion</p>
        </div>

        {/* Tab row — clicking one resets the form so stale values don't carry over */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => switchMode('signin')}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>

          {/* Name only needed when creating a new account */}
          {mode === 'signup' && (
            <label className="auth-label">
              Full Name
              <input
                className="input-field"
                type="text"
                name="name"
                value={fields.name}
                onChange={handleChange}
                placeholder="e.g. Ahmed Rahman"
                autoComplete="name"
              />
            </label>
          )}

          <label className="auth-label">
            Email Address
            <input
              className="input-field"
              type="email"
              name="email"
              value={fields.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="auth-label">
            Password
            <input
              className="input-field"
              type="password"
              name="password"
              value={fields.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>

          {/* Confirm password only shown for sign-up */}
          {mode === 'signup' && (
            <label className="auth-label">
              Confirm Password
              <input
                className="input-field"
                type="password"
                name="confirmPassword"
                value={fields.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
            </label>
          )}

          {error && <p className="auth-error">{error}</p>}

          {/* Disabled while the request is in-flight to prevent double submissions */}
          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {loading
              ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
              : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'signin'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button
            className="auth-switch-btn"
            onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
            type="button"
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
