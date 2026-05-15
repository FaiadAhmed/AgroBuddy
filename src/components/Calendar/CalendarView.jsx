// ─── CalendarView.jsx — Feature: Farm Calendar ───────────────────────────────
// Displays a monthly calendar grid. Clicking a date shows events for that day
// and lets the user add or delete events. Uses the react-calendar library for
// the calendar UI and fetches events from the server via CalendarAPI.js.

import React, { useState, useEffect, useCallback } from 'react';
// useState    — local state management
// useEffect   — side effects (initial event load)
// useCallback — memoize event handlers that are passed to child components

import Calendar from 'react-calendar';               // Third-party calendar widget
import 'react-calendar/dist/Calendar.css';            // Default react-calendar styles (needed)
import './CalendarView.css';                          // Our custom overrides on top
import { fetchEvents, createEvent, deleteEvent } from './CalendarAPI';

// Event type options — displayed in the dropdown when adding a new event
const EVENT_TYPES = ['Vet Visit', 'Harvest', 'Market Day', 'Medication', 'Maintenance', 'Other'];

export default function CalendarView() {

  // selectedDate — the Date object the user clicked on the calendar.
  // Defaults to today so the right panel immediately shows today's events.
  const [selectedDate, setSelectedDate] = useState(new Date());

  // events — all events fetched from the server (array of event objects)
  const [events, setEvents] = useState([]);

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [showForm, setShowForm] = useState(false);

  // formData mirrors the "Add Event" form fields
  const [formData, setFormData] = useState({
    title: '',
    type:  'Vet Visit',
    notes: '',
  });

  // ── Load events on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEvents();
      setEvents(data);
    } catch (err) {
      setError('Could not load calendar events.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ── toDateString ─────────────────────────────────────────────────────────────
  // Converts a Date object to an ISO "YYYY-MM-DD" string for easy comparison.
  // We store dates as strings in state to avoid timezone conversion issues.
  // @param date — a JavaScript Date object
  function toDateString(date) {
    // toISOString() returns e.g. "2026-05-14T21:00:00.000Z"
    // .split('T')[0] extracts just the date part: "2026-05-14"
    return date.toISOString().split('T')[0];
  }

  // ── eventsForSelectedDate ─────────────────────────────────────────────────
  // Derived value: filter the events array to only those matching selectedDate.
  // This runs on every render, but the array is typically small so it's fine.
  // (If the array were large, we'd use useMemo here.)
  const selectedDateStr = toDateString(selectedDate);
  const eventsForSelectedDate = events.filter((ev) => ev.date === selectedDateStr);

  // ── tileContent ──────────────────────────────────────────────────────────────
  // Passed to react-calendar's tileContent prop.
  // react-calendar calls this for every cell; if we return a non-null element,
  // it renders inside that day's tile — we use it to show a dot on days with events.
  //
  // @param { date } — the Date object for this calendar tile
  const tileContent = useCallback(
    ({ date }) => {
      // Check if any event's date matches this tile's date
      const hasEvent = events.some((ev) => ev.date === toDateString(date));
      // If yes, render a small green dot indicator; otherwise render nothing (null)
      return hasEvent ? <span className="cv-dot" /> : null;
    },
    [events]   // Re-create this function whenever the events array changes
  );

  // ── handleInputChange ───────────────────────────────────────────────────────
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // ── handleAddEvent ──────────────────────────────────────────────────────────
  async function handleAddEvent(e) {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Event title is required.');
      return;
    }

    try {
      // Build the event object — date comes from the currently selected tile
      const newEvent = await createEvent({
        ...formData,
        date: selectedDateStr,    // "YYYY-MM-DD" string of the clicked date
      });

      // Append the new event to local state so the dot and list update immediately
      setEvents((prev) => [...prev, newEvent]);
      setFormData({ title: '', type: 'Vet Visit', notes: '' });
      setShowForm(false);
    } catch (err) {
      setError('Failed to add event.');
      console.error(err);
    }
  }

  // ── handleDeleteEvent ───────────────────────────────────────────────────────
  async function handleDeleteEvent(id) {
    if (!window.confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      setError('Failed to delete event.');
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="calendar-view">
      <h2 className="section-title">Farm Calendar</h2>

      {/* Status messages at the top */}
      {loading && <p className="ap-loading">Loading events...</p>}
      {error   && <p className="ap-error">{error}</p>}

      {/* Two-column layout: calendar on the left, event detail panel on the right */}
      <div className="cv-layout">

        {/* ── Left: react-calendar widget ── */}
        <div className="cv-calendar-wrap">
          <Calendar
            // value is the currently highlighted date
            value={selectedDate}
            // onChange fires when the user clicks a new date tile
            onChange={setSelectedDate}
            // tileContent adds the green dot to days that have events
            tileContent={tileContent}
            // calendarType prevents locale-specific week start differences
            calendarType="iso8601"
          />
        </div>

        {/* ── Right: event detail panel ── */}
        <div className="cv-detail">

          {/* Panel header: selected date + add button */}
          <div className="cv-detail-header">
            <h3 className="cv-detail-date">
              {/* Convert the Date object to a readable string */}
              {selectedDate.toLocaleDateString('en-GB', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </h3>
            <button
              className="btn-primary"
              onClick={() => setShowForm((p) => !p)}
            >
              {showForm ? 'Cancel' : '+ Add Event'}
            </button>
          </div>

          {/* ── Add Event Form ── */}
          {showForm && (
            <form className="cv-form card" onSubmit={handleAddEvent}>
              <label className="ap-label">
                Event Title *
                <input
                  className="input-field"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Vet visit for Bessie"
                />
              </label>

              <label className="ap-label">
                Event Type
                <select
                  className="input-field"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>

              <label className="ap-label">
                Notes
                <textarea
                  className="input-field"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Optional details..."
                />
              </label>

              <button type="submit" className="btn-primary">Save Event</button>
            </form>
          )}

          {/* ── Events for Selected Date ── */}
          {eventsForSelectedDate.length === 0 && !showForm ? (
            <p className="ap-empty">No events for this day. Add one above!</p>
          ) : (
            <ul className="cv-event-list">
              {eventsForSelectedDate.map((ev) => (
                <li key={ev.id} className="cv-event-item card">
                  {/* Type badge */}
                  <span className="cv-event-type">{ev.type}</span>
                  <strong className="cv-event-title">{ev.title}</strong>
                  {ev.notes && <p className="cv-event-notes">{ev.notes}</p>}

                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteEvent(ev.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
