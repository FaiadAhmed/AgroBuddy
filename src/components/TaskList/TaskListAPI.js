// ─── TaskListAPI.js — API calls for the Task List feature ────────────────────
// Centralises all HTTP requests related to farm tasks.
// The component (TaskList.jsx) imports these functions and never uses axios directly.

import axios from 'axios';

// Base URL for the tasks endpoint
const BASE_URL = 'https://api.example-farm.com/tasks';

// ── fetchTasks ────────────────────────────────────────────────────────────────
// GET /tasks — retrieves all tasks.
// Returns: Promise<Array<{id, title, dueDate, priority, completed}>>
export async function fetchTasks() {
  const response = await axios.get(BASE_URL);
  return response.data;   // axios already parsed the JSON body for us
}

// ── createTask ────────────────────────────────────────────────────────────────
// POST /tasks — creates a new task record.
// @param taskData — { title, dueDate, priority }
// Returns: Promise with the saved task object (including server-assigned id)
export async function createTask(taskData) {
  const response = await axios.post(BASE_URL, taskData);
  return response.data;
}

// ── toggleTaskComplete ────────────────────────────────────────────────────────
// PATCH /tasks/:id — flips the completed boolean on the server.
// @param id        — task id
// @param completed — the NEW boolean value to save (true or false)
// PATCH is used instead of PUT because we're only changing one field, not the whole object.
export async function toggleTaskComplete(id, completed) {
  const response = await axios.patch(`${BASE_URL}/${id}`, { completed });
  return response.data;
}

// ── deleteTask ────────────────────────────────────────────────────────────────
// DELETE /tasks/:id — permanently removes a task.
// @param id — task id
export async function deleteTask(id) {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
}
