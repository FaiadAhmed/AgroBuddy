// ─── CalendarAPI.js — API layer for Calendar events ──────────────────────────
// Fetches and manages farm events (vet visits, harvests, market days, etc.)
// that are displayed on the calendar.

import axios from 'axios';

const BASE_URL = 'https://api.example-farm.com/events';

// ── fetchEvents ───────────────────────────────────────────────────────────────
// GET /events — retrieves all calendar events.
// Each event: { id, title, date, type, notes }
// date is stored as an ISO date string: "YYYY-MM-DD"
export async function fetchEvents() {
  const response = await axios.get(BASE_URL);
  return response.data;
}

// ── fetchEventsByMonth ────────────────────────────────────────────────────────
// GET /events?year=2026&month=5 — fetches events for a specific month.
// @param year  — 4-digit year (number)
// @param month — 1-indexed month number (1=Jan … 12=Dec)
// Using server-side filtering reduces data transfer (only load what we show).
export async function fetchEventsByMonth(year, month) {
  const response = await axios.get(BASE_URL, {
    params: { year, month },   // axios serialises to ?year=2026&month=5
  });
  return response.data;
}

// ── createEvent ───────────────────────────────────────────────────────────────
// POST /events — creates a new event.
// @param eventData — { title, date, type, notes }
export async function createEvent(eventData) {
  const response = await axios.post(BASE_URL, eventData);
  return response.data;
}

// ── deleteEvent ───────────────────────────────────────────────────────────────
// DELETE /events/:id — removes an event permanently.
export async function deleteEvent(id) {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
}
