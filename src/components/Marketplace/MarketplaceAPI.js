// ─── MarketplaceAPI.js — API layer for the Marketplace feature ───────────────
// Handles fetching product listings and posting new listings.

import axios from 'axios';

const BASE_URL = 'https://api.example-farm.com/marketplace';

// ── fetchListings ─────────────────────────────────────────────────────────────
// GET /marketplace — retrieves all available product listings.
// Each listing: { id, title, category, price, unit, sellerName, description, imageUrl }
export async function fetchListings() {
  const response = await axios.get(BASE_URL);
  return response.data;
}

// ── fetchListingsByCategory ───────────────────────────────────────────────────
// GET /marketplace?category=Livestock — filter listings server-side.
// @param category — string like 'Livestock', 'Crops', 'Equipment', 'Supplies'
// Passing params as a second argument lets axios build the query string safely.
export async function fetchListingsByCategory(category) {
  const response = await axios.get(BASE_URL, {
    params: { category },   // axios serialises this to ?category=Livestock
  });
  return response.data;
}

// ── createListing ─────────────────────────────────────────────────────────────
// POST /marketplace — publish a new listing.
// @param listingData — { title, category, price, unit, sellerName, description }
export async function createListing(listingData) {
  const response = await axios.post(BASE_URL, listingData);
  return response.data;
}

// ── deleteListing ─────────────────────────────────────────────────────────────
// DELETE /marketplace/:id — remove a listing (seller or admin only in a real app).
export async function deleteListing(id) {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
}
