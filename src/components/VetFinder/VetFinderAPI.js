// ─── VetFinderAPI.js — All API calls for the Vet Finder feature ──────────────
// Keeping HTTP logic here means VetFinder.jsx stays clean (UI only).
// Every function is async and returns the parsed JSON from the server.

import axios from 'axios';

// Single source of truth for the endpoint — change once if the URL ever moves
const BASE_URL = 'https://api.example-farm.com/vets';

// ── fetchVets ─────────────────────────────────────────────────────────────────
// GET /vets — retrieves all registered vets.
// Each vet object: { id, name, specialty, clinic, phone, email, location, rating, available }
export async function fetchVets() {
  const response = await axios.get(BASE_URL);
  return response.data;   // axios auto-parses JSON
}

// ── searchVets ────────────────────────────────────────────────────────────────
// GET /vets?query=cattle&location=Dhaka — server-side search (optional).
// @param query    — keyword to match against name, specialty, or clinic
// @param location — city / area to filter by
// Passing both as params lets axios build the query string safely.
export async function searchVets(query, location) {
  const response = await axios.get(BASE_URL, {
    params: { query, location },   // e.g. ?query=cattle&location=Dhaka
  });
  return response.data;
}

// ── createVet ─────────────────────────────────────────────────────────────────
// POST /vets — adds a new vet record to the database.
// @param vetData — { name, specialty, clinic, phone, email, location, available }
// Returns the newly created vet object including its server-assigned id.
export async function createVet(vetData) {
  const response = await axios.post(BASE_URL, vetData);
  return response.data;
}

// ── deleteVet ─────────────────────────────────────────────────────────────────
// DELETE /vets/:id — permanently removes a vet record.
// @param id — unique vet id
export async function deleteVet(id) {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
}

// ── updateVetAvailability ─────────────────────────────────────────────────────
// PATCH /vets/:id — toggles the vet's availability status.
// @param id        — vet id
// @param available — new boolean value (true = available, false = unavailable)
// PATCH is used here because we're only changing one field, not the full object.
export async function updateVetAvailability(id, available) {
  const response = await axios.patch(`${BASE_URL}/${id}`, { available });
  return response.data;
}
