// ─── Marketplace.jsx — Feature: Farm Marketplace ─────────────────────────────
// Displays product listings. Users can search by listing title,
// post new listings, and remove existing ones.

import React, { useState, useEffect, useMemo } from 'react';
import './Marketplace.css';
import { fetchListings, createListing, deleteListing } from './MarketplaceAPI';

export default function Marketplace() {

  // listings — full array fetched from the server
  const [listings, setListings] = useState([]);

  // searchQuery — text the user types in the search box
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [showForm, setShowForm] = useState(false);

  // formData mirrors every field in the "Post Listing" form
  const [formData, setFormData] = useState({
    title:       '',
    price:       '',
    unit:        '',   // e.g. "per head", "per kg"
    sellerName:  '',
    description: '',
  });

  // ── Fetch listings once on mount ─────────────────────────────────────────────
  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchListings();
      setListings(data);
    } catch (err) {
      setError('Could not load marketplace listings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ── filteredListings (useMemo) ────────────────────────────────────────────────
  // Returns only listings whose title contains the search text.
  // toLowerCase() makes the match case-insensitive.
  // Only recomputes when listings or searchQuery changes.
  const filteredListings = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    // Empty search box — show everything
    if (!q) return listings;

    return listings.filter((item) =>
      item.title.toLowerCase().includes(q)   // match by listing title/name only
    );
  }, [listings, searchQuery]);

  // ── handleInputChange ─────────────────────────────────────────────────────────
  // Single handler for all form inputs — updates only the field that changed.
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // ── handleAddListing ──────────────────────────────────────────────────────────
  // Validates, posts to API, prepends result to state, resets form.
  async function handleAddListing(e) {
    e.preventDefault(); // Prevent browser page reload on form submit

    if (!formData.title.trim() || !formData.price || !formData.sellerName.trim()) {
      alert('Title, price, and seller name are required.');
      return;
    }

    try {
      const newListing = await createListing(formData);
      setListings((prev) => [newListing, ...prev]); // Prepend so it appears at top
      setFormData({ title: '', price: '', unit: '', sellerName: '', description: '' });
      setShowForm(false);
    } catch (err) {
      setError('Failed to post listing.');
      console.error(err);
    }
  }

  // ── handleDelete ──────────────────────────────────────────────────────────────
  // Confirms, deletes from server, removes from local state.
  async function handleDelete(id) {
    if (!window.confirm('Remove this listing?')) return;
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError('Failed to remove listing.');
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="marketplace">

      {/* Header: title + post button */}
      <div className="mp-header">
        <h2 className="section-title">Farm Marketplace</h2>
        <button className="btn-primary" onClick={() => setShowForm((p) => !p)}>
          {showForm ? 'Cancel' : '+ Post Listing'}
        </button>
      </div>

      {/* ── Post Listing Form ── */}
      {showForm && (
        <form className="mp-form card" onSubmit={handleAddListing}>
          <h3 className="mp-form-title">New Listing</h3>

          <label className="ap-label">
            Title *
            <input
              className="input-field"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Holstein Cows for Sale"
            />
          </label>

          <div className="mp-row">
            <label className="ap-label">
              Price ($) *
              <input
                className="input-field"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                placeholder="0.00"
              />
            </label>

            <label className="ap-label">
              Unit
              <input
                className="input-field"
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                placeholder="e.g. per head, per kg"
              />
            </label>
          </div>

          <label className="ap-label">
            Seller Name *
            <input
              className="input-field"
              type="text"
              name="sellerName"
              value={formData.sellerName}
              onChange={handleInputChange}
              placeholder="Your name or farm name"
            />
          </label>

          <label className="ap-label">
            Description
            <textarea
              className="input-field"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Details about the listing..."
            />
          </label>

          <button type="submit" className="btn-primary">Post Listing</button>
        </form>
      )}

      {/* ── Search by name only ── */}
      <input
        className="input-field mp-search"
        type="text"
        placeholder="Search by listing name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Status messages */}
      {loading && <p className="ap-loading">Loading listings...</p>}
      {error   && <p className="ap-error">{error}</p>}
      {!loading && !error && filteredListings.length === 0 && (
        <p className="ap-empty">No listings found. Try a different name or post one above!</p>
      )}

      {/* ── Listings Grid ── */}
      <div className="mp-grid">
        {filteredListings.map((item) => (
          <div key={item.id} className="mp-card card">

            <h3 className="mp-card-title">{item.title}</h3>

            {/* Price — shown prominently */}
            <div className="mp-price">
              ${Number(item.price).toFixed(2)}
              {item.unit && <span className="mp-unit"> {item.unit}</span>}
            </div>

            <p className="mp-description">{item.description}</p>

            <div className="mp-footer">
              <span className="mp-seller">🧑‍🌾 {item.sellerName}</span>
              <button className="btn-danger" onClick={() => handleDelete(item.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
