// ─── VetFinder.jsx — Feature: Vet Finder ─────────────────────────────────────
// Lets farmers find vets by searching their name or area/location.
// Users can add new vets and remove existing ones.

import React, { useState, useEffect, useMemo } from 'react';
// useState   — manages vet list, search text, and form data
// useEffect  — fetches vets from the API on first render
// useMemo    — derives the filtered list only when vets or searchQuery changes

import './VetFinder.css';
import { fetchVets, createVet, deleteVet } from './VetFinderAPI';

export default function VetFinder() {

  // vets — full list of vet objects loaded from the server
  const [vets, setVets] = useState([]);

  // searchQuery — what the user typed in the search box
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [showForm, setShowForm] = useState(false);

  // formData mirrors every field in the "Add Vet" form
  const [formData, setFormData] = useState({
    name:     '',   // Vet's full name
    clinic:   '',   // Clinic or hospital name
    phone:    '',   // Contact phone number
    email:    '',   // Contact email
    location: '',   // City or area
  });

  // ── Load vets once when the component first mounts ──────────────────────────
  useEffect(() => {
    loadVets();
  }, []); // Empty array means: run once after the first render, never again

  async function loadVets() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVets();  // GET request via VetFinderAPI.js
      setVets(data);
    } catch (err) {
      setError('Could not load vets. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ── filteredVets (useMemo) ────────────────────────────────────────────────────
  // Returns only the vets whose name OR location contains the search text.
  // toLowerCase() makes the comparison case-insensitive.
  // Recomputes only when vets array or searchQuery string changes.
  const filteredVets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    // If the search box is empty, show all vets
    if (!q) return vets;

    return vets.filter(
      (vet) =>
        vet.name.toLowerCase().includes(q) ||       // match by vet name
        vet.location.toLowerCase().includes(q)      // match by area / city
    );
  }, [vets, searchQuery]);

  // ── handleInputChange ─────────────────────────────────────────────────────────
  // Single handler for all controlled form inputs.
  // e.target.name identifies which field changed; e.target.value is the new text.
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // ── handleAddVet ──────────────────────────────────────────────────────────────
  // Validates, sends to API, prepends result to local state, resets form.
  async function handleAddVet(e) {
    e.preventDefault(); // Stop the browser's default page-reload on form submit

    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Vet name and phone number are required.');
      return;
    }

    try {
      const newVet = await createVet(formData); // POST to server → returns saved vet with id
      setVets((prev) => [newVet, ...prev]);     // Prepend so it appears at the top

      // Reset all fields to empty for the next use
      setFormData({ name: '', clinic: '', phone: '', email: '', location: '' });
      setShowForm(false);
    } catch (err) {
      setError('Failed to add vet. Please try again.');
      console.error(err);
    }
  }

  // ── handleDelete ──────────────────────────────────────────────────────────────
  // Confirms, then deletes from server and removes from local state.
  async function handleDelete(id) {
    if (!window.confirm('Remove this vet from the directory?')) return;
    try {
      await deleteVet(id);
      setVets((prev) => prev.filter((v) => v.id !== id)); // remove by id
    } catch (err) {
      setError('Failed to remove vet.');
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="vet-finder">

      {/* ── Header: title + Add Vet button ── */}
      <div className="vf-header">
        <h2 className="section-title">Vet Finder</h2>
        <button className="btn-primary" onClick={() => setShowForm((p) => !p)}>
          {showForm ? 'Cancel' : '+ Add Vet'}
        </button>
      </div>

      {/* ── Add Vet Form ── */}
      {showForm && (
        <form className="vf-form card" onSubmit={handleAddVet}>
          <h3 className="vf-form-title">Register a New Vet</h3>

          <div className="vf-row">
            <label className="ap-label">
              Full Name *
              <input
                className="input-field"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Dr. Jane Smith"
              />
            </label>

            <label className="ap-label">
              Clinic / Hospital
              <input
                className="input-field"
                type="text"
                name="clinic"
                value={formData.clinic}
                onChange={handleInputChange}
                placeholder="e.g. Green Valley Animal Hospital"
              />
            </label>
          </div>

          <div className="vf-row">
            <label className="ap-label">
              Phone *
              <input
                className="input-field"
                type="tel"         // shows numeric keyboard on mobile
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+880 1700 000000"
              />
            </label>

            <label className="ap-label">
              Email
              <input
                className="input-field"
                type="email"       // validates email format on submit
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="vet@clinic.com"
              />
            </label>
          </div>

          <label className="ap-label">
            Area / Location
            <input
              className="input-field"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. Dhaka, Chittagong, Sylhet"
            />
          </label>

          <button type="submit" className="btn-primary">Save Vet</button>
        </form>
      )}

      {/* ── Single Search Bar ── */}
      {/* Updating value triggers useMemo → filteredVets recomputes instantly */}
      <input
        className="input-field vf-search"
        type="text"
        placeholder="Search by name or area..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* ── Status Messages ── */}
      {loading && <p className="ap-loading">Loading vets...</p>}
      {error   && <p className="ap-error">{error}</p>}
      {!loading && !error && filteredVets.length === 0 && (
        <p className="ap-empty">No vets found. Try a different name or area.</p>
      )}

      {/* ── Vet Cards Grid ── */}
      <div className="vf-grid">
        {filteredVets.map((vet) => (
          <div key={vet.id} className="vf-card card">

            {/* Vet name */}
            <h3 className="vf-name">{vet.name}</h3>

            {/* Detail list — row only renders if the field has a value */}
            <ul className="vf-details">
              {vet.clinic && (
                <li><span className="vf-icon">🏥</span>{vet.clinic}</li>
              )}
              {vet.location && (
                <li><span className="vf-icon">📍</span>{vet.location}</li>
              )}
              {vet.phone && (
                // href="tel:…" lets mobile users tap to call
                <li>
                  <span className="vf-icon">📞</span>
                  <a href={`tel:${vet.phone}`} className="vf-link">{vet.phone}</a>
                </li>
              )}
              {vet.email && (
                // href="mailto:…" opens the user's email client
                <li>
                  <span className="vf-icon">✉️</span>
                  <a href={`mailto:${vet.email}`} className="vf-link">{vet.email}</a>
                </li>
              )}
            </ul>

            {/* Remove button — aligned to the bottom-right of the card */}
            <div className="vf-actions">
              <button className="btn-danger" onClick={() => handleDelete(vet.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
