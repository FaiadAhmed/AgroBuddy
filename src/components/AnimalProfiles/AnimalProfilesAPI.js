// ─── AnimalProfilesAPI.js — All API calls for Animal Profiles ────────────────
// Keeping API calls here (separate from the component) means:
//   • The component stays clean and only handles UI
//   • If the backend URL changes, we update it in one place
//   • We can mock this file in tests without touching the component

import axios from 'axios';   // axios is a promise-based HTTP client (simpler than fetch)

// Base URL for the animals API endpoint.
// Change this one constant if the server address ever changes.
const BASE_URL = 'https://api.example-farm.com/animals';

// ── fetchAnimals ──────────────────────────────────────────────────────────────
// Sends a GET request to retrieve all animals from the server.
// Returns: a Promise that resolves to an array of animal objects.
// Each animal object looks like: { id, name, species, age, weight, notes }
export async function fetchAnimals() {
  // axios.get() sends an HTTP GET request to BASE_URL.
  // The 'await' pauses execution until the server responds.
  const response = await axios.get(BASE_URL);

  // response.data is the actual JSON body returned by the server.
  // axios automatically parses JSON, so we don't need JSON.parse().
  return response.data;
}

// ── createAnimal ──────────────────────────────────────────────────────────────
// Sends a POST request to add a new animal to the database.
// @param animalData — object with the new animal's fields (name, species, etc.)
// Returns: a Promise that resolves to the newly created animal (with its new id).
export async function createAnimal(animalData) {
  // axios.post() sends the animalData as a JSON body in the request.
  // The server creates the record and returns the saved object.
  const response = await axios.post(BASE_URL, animalData);
  return response.data;
}

// ── deleteAnimal ──────────────────────────────────────────────────────────────
// Sends a DELETE request to remove an animal by its unique id.
// @param id — the numeric or string id of the animal to delete.
// Returns: a Promise (the resolved value is usually empty or a confirmation message).
export async function deleteAnimal(id) {
  // Template literal `${id}` inserts the id into the URL: /animals/42
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
}

// ── updateAnimal ──────────────────────────────────────────────────────────────
// Sends a PUT request to overwrite an existing animal's data.
// @param id         — the id of the animal to update
// @param animalData — object with the updated fields
// Returns: a Promise that resolves to the updated animal object.
export async function updateAnimal(id, animalData) {
  // axios.put() replaces the whole resource at the given URL.
  const response = await axios.put(`${BASE_URL}/${id}`, animalData);
  return response.data;
}
