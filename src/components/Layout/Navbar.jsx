// ─── Navbar.jsx — Top Navigation Bar with Auth Dropdown ──────────────────────
// The right side of the navbar shows:
//   • "Sign In" button (when logged out) — clicking opens a dropdown panel
//     with Sign In / Sign Up forms
//   • Avatar + name + Sign Out (when logged in)
// Clicking outside the dropdown closes it (via useRef + useEffect).

import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { login, signup } from '../Auth/AuthAPI';  // API calls live in AuthAPI.js

const logo = process.env.PUBLIC_URL + '/logo.png';

// Props from App.jsx:
//   tabs, activeTab, onTabChange — feature tab controls
//   user      — logged-in user object { name, email } or null
//   onLogin   — function(user) called after successful sign-in / sign-up
//   onLogout  — function() called when Sign Out is clicked
export default function Navbar({ tabs, activeTab, onTabChange, user, onLogin, onLogout }) {

  // showPanel — whether the auth dropdown is open
  const [showPanel, setShowPanel] = useState(false);

  // mode — which form is active inside the dropdown: 'signin' or 'signup'
  const [mode, setMode] = useState('signin');

  // fields — controlled values for all form inputs
  const [fields, setFields] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });

  // error — validation or API error message shown inside the dropdown
  const [error, setError] = useState('');

  // loading — true while the API call is in-flight; disables the submit button
  const [loading, setLoading] = useState(false);

  // panelRef — a ref attached to the dropdown container so we can detect outside clicks
  const panelRef = useRef(null);

  // ── Close panel on outside click ───────────────────────────────────────────
  // useEffect adds a mousedown listener when the panel is open, and removes it
  // when the panel closes or the component unmounts (the returned cleanup function).
  useEffect(() => {
    function handleOutsideClick(e) {
      // If the click target is outside the panel container, close the panel
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowPanel(false);
      }
    }
    if (showPanel) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    // Cleanup: remove listener when panel closes or component unmounts
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showPanel]); // Re-run this effect whenever showPanel changes

  // ── switchMode ─────────────────────────────────────────────────────────────
  // Switches between Sign In and Sign Up, clearing all fields and errors.
  function switchMode(newMode) {
    setMode(newMode);
    setFields({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
  }

  // ── handleChange ───────────────────────────────────────────────────────────
  // Updates only the field that changed; clears error so old messages disappear.
  function handleChange(e) {
    const { name, value } = e.target;
    setError('');
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  // ── validate ───────────────────────────────────────────────────────────────
  // Client-side checks before hitting the API.
  // Returns an error string, or '' if all inputs are valid.
  function validate() {
    if (mode === 'signup' && !fields.name.trim())
      return 'Please enter your full name.';
    if (!fields.email.trim())
      return 'Please enter your email address.';
    if (!/\S+@\S+\.\S+/.test(fields.email))
      return 'Please enter a valid email.';
    if (fields.password.length < 6)
      return 'Password must be at least 6 characters.';
    if (mode === 'signup' && fields.password !== fields.confirmPassword)
      return 'Passwords do not match.';
    return '';
  }

  // ── handleSubmit ───────────────────────────────────────────────────────────
  // Runs validation, calls the correct API function, stores session, notifies App.
  async function handleSubmit(e) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    try {
      setLoading(true);
      setError('');

      // Call login() or signup() depending on active mode
      const result = mode === 'signin'
        ? await login(fields.email, fields.password)
        : await signup(fields.name, fields.email, fields.password);

      // Persist session so it survives page refresh
      localStorage.setItem('agro_token', result.token);
      localStorage.setItem('agro_user', JSON.stringify(result.user));

      // Notify App.jsx → user state updates → navbar re-renders showing avatar
      onLogin(result.user);

      // Close the dropdown and reset the form
      setShowPanel(false);
      setFields({ name: '', email: '', password: '', confirmPassword: '' });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        (mode === 'signin' ? 'Invalid email or password.' : 'Could not create account.')
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <nav className="navbar">

      {/* ── Brand ── */}
      <div className="navbar-brand">
        <img src={logo} alt="Agro Buddy" className="navbar-logo-img" />
        <span className="navbar-title">Agro Buddy</span>
      </div>

      {/* ── Feature Tabs ── */}
      <ul className="navbar-tabs">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <button
              className={`navbar-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* ── Auth Section (right side) ──
          panelRef wraps both the trigger button and the dropdown so outside-click
          detection works correctly — clicks inside either element are ignored. */}
      <div className="navbar-auth-wrap" ref={panelRef}>

        {user ? (
          /* ── Logged-in state: avatar + name + sign out ── */
          <div className="navbar-user">
            {/* Circle avatar showing first letter of the user's name */}
            <div className="navbar-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <span className="navbar-user-name">{user.name}</span>
            <button className="navbar-signout" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        ) : (
          /* ── Logged-out state: Sign In button ── */
          <button
            className="navbar-signin-btn"
            onClick={() => setShowPanel((p) => !p)}   // toggle the dropdown
          >
            Sign In
          </button>
        )}

        {/* ── Auth Dropdown Panel ──
            Only shown when no user is logged in AND the Sign In button was clicked */}
        {showPanel && !user && (
          <div className="nav-auth-panel">

            {/* Panel header */}
            <p className="nap-heading">Welcome to Agro Buddy</p>

            {/* Sign In / Sign Up toggle tabs */}
            <div className="nap-tabs">
              <button
                type="button"
                className={`nap-tab ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => switchMode('signin')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`nap-tab ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => switchMode('signup')}
              >
                Sign Up
              </button>
            </div>

            {/* Form — onSubmit calls handleSubmit above */}
            <form className="nap-form" onSubmit={handleSubmit}>

              {/* Name — Sign Up only */}
              {mode === 'signup' && (
                <input
                  className="input-field nap-input"
                  type="text"
                  name="name"
                  value={fields.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  autoComplete="name"
                />
              )}

              <input
                className="input-field nap-input"
                type="email"
                name="email"
                value={fields.email}
                onChange={handleChange}
                placeholder="Email Address"
                autoComplete="email"
              />

              <input
                className="input-field nap-input"
                type="password"
                name="password"
                value={fields.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />

              {/* Confirm Password — Sign Up only */}
              {mode === 'signup' && (
                <input
                  className="input-field nap-input"
                  type="password"
                  name="confirmPassword"
                  value={fields.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                />
              )}

              {/* Error message */}
              {error && <p className="nap-error">{error}</p>}

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary nap-submit"
                disabled={loading}
              >
                {loading
                  ? '...'
                  : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Switch mode link */}
            <p className="nap-switch">
              {mode === 'signin' ? "No account? " : 'Have an account? '}
              <button
                type="button"
                className="nap-switch-btn"
                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        )}
      </div>
    </nav>
  );
}
