// ─── AuthAPI.js — API calls for Sign In and Sign Up ──────────────────────────
// All authentication HTTP requests live here so Auth.jsx stays UI-only.

import axios from 'axios';

const BASE_URL = 'https://api.example-farm.com/auth';

// ── login ─────────────────────────────────────────────────────────────────────
// POST /auth/login — authenticates an existing user.
// @param email    — user's email address
// @param password — user's plain-text password (HTTPS encrypts it in transit)
// Returns: { token, user: { id, name, email } }
// The token is a JWT the server issues; we store it in localStorage so future
// requests can attach it in the Authorization header.
export async function login(email, password) {
  const response = await axios.post(`${BASE_URL}/login`, { email, password });
  return response.data;
}

// ── signup ────────────────────────────────────────────────────────────────────
// POST /auth/signup — registers a new user account.
// @param name     — display name
// @param email    — unique email address
// @param password — chosen password (hashed server-side before storing)
// Returns: { token, user: { id, name, email } }
export async function signup(name, email, password) {
  const response = await axios.post(`${BASE_URL}/signup`, { name, email, password });
  return response.data;
}
