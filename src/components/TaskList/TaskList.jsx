// ─── TaskList.jsx — Feature: Task List ───────────────────────────────────────
// Manages farm tasks (feeding, harvesting, vet visits, etc.).
// Users can add tasks with a due date and priority level, mark them complete,
// and delete them. Tasks are sorted so incomplete ones appear before completed.

import React, { useState, useEffect, useMemo } from 'react';
// useState  — local component state
// useEffect — run side effects (API calls) after renders
// useMemo   — memoize derived values (sorted task list) to avoid recalculating every render

import './TaskList.css';
import { fetchTasks, createTask, toggleTaskComplete, deleteTask } from './TaskListAPI';

// Priority levels for the dropdown selector
// Defined as a constant array outside the component so it's not recreated every render
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

export default function TaskList() {

  // tasks — full array of task objects from the server
  const [tasks, setTasks] = useState([]);

  // filter — controls which tasks are visible: 'all', 'active', or 'completed'
  const [filter, setFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [showForm, setShowForm] = useState(false);

  // formData mirrors each input field in the "Add Task" form
  const [formData, setFormData] = useState({
    title:    '',       // Task description
    dueDate:  '',       // ISO date string from <input type="date">
    priority: 'Medium', // Default priority
  });

  // ── Load tasks on first render ───────────────────────────────────────────────
  useEffect(() => {
    loadTasks();
  }, []);  // Empty dependency array = run once after mount

  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError('Could not load tasks.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ── filteredTasks (useMemo) ──────────────────────────────────────────────────
  // useMemo computes filteredTasks only when tasks or filter changes.
  // Without useMemo, this filtering would run on every single re-render (even unrelated ones).
  // The result is a sorted array: incomplete tasks first, then completed.
  const filteredTasks = useMemo(() => {
    // First, filter by the active filter tab
    let result;
    if (filter === 'active') {
      result = tasks.filter((t) => !t.completed);        // Only incomplete tasks
    } else if (filter === 'completed') {
      result = tasks.filter((t) => t.completed);         // Only completed tasks
    } else {
      result = tasks;                                     // All tasks
    }

    // Sort: incomplete (false) before completed (true).
    // Booleans compare as 0 and 1, so false - true = -1 (incomplete comes first).
    return [...result].sort((a, b) => a.completed - b.completed);
  }, [tasks, filter]);  // Re-run whenever tasks array or filter string changes

  // ── handleInputChange ───────────────────────────────────────────────────────
  // Generic handler for all controlled form inputs.
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // ── handleAddTask ───────────────────────────────────────────────────────────
  async function handleAddTask(e) {
    e.preventDefault();   // Prevent page reload

    if (!formData.title.trim()) {
      alert('Task title is required.');
      return;
    }

    try {
      // The server returns the new task with an id; we add it to local state.
      const newTask = await createTask({ ...formData, completed: false });
      // Prepend to the array so the new task appears at the top of the list.
      setTasks((prev) => [newTask, ...prev]);
      setFormData({ title: '', dueDate: '', priority: 'Medium' });
      setShowForm(false);
    } catch (err) {
      setError('Failed to add task.');
      console.error(err);
    }
  }

  // ── handleToggle ────────────────────────────────────────────────────────────
  // Flips the completed status of a task both on the server and in local state.
  // @param task — the full task object (we need task.id and task.completed)
  async function handleToggle(task) {
    const newCompleted = !task.completed;   // Flip the boolean

    try {
      // Optimistic update: change local state BEFORE the API responds
      // so the UI feels instant. If the API fails, we roll back.
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: newCompleted } : t
        )
      );

      // Confirm the change on the server
      await toggleTaskComplete(task.id, newCompleted);
    } catch (err) {
      // Rollback: revert the optimistic update if the server call failed
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: task.completed } : t  // restore original
        )
      );
      setError('Failed to update task. Reverted.');
    }
  }

  // ── handleDelete ────────────────────────────────────────────────────────────
  async function handleDelete(id) {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError('Failed to delete task.');
    }
  }

  // ── priorityClass ───────────────────────────────────────────────────────────
  // Returns a CSS class based on priority string so we can color-code priorities.
  function priorityClass(priority) {
    return `priority-${priority.toLowerCase()}`;  // e.g. "priority-high"
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="task-list">

      {/* Header: title + add button */}
      <div className="tl-header">
        <h2 className="section-title">Task List</h2>
        <button className="btn-primary" onClick={() => setShowForm((p) => !p)}>
          {showForm ? 'Cancel' : '+ Add Task'}
        </button>
      </div>

      {/* Filter tabs: All / Active / Completed */}
      <div className="tl-filters">
        {/* Render one filter button per option */}
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            // Active filter gets a highlighted class
            className={`tl-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}    // Switch the filter state
          >
            {/* Capitalise the first letter for display */}
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Add Task Form ── (conditionally rendered) */}
      {showForm && (
        <form className="tl-form card" onSubmit={handleAddTask}>
          <h3 className="tl-form-title">New Task</h3>

          <label className="ap-label">
            Task Title *
            <input
              className="input-field"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Feed the chickens"
            />
          </label>

          <div className="tl-row">
            <label className="ap-label">
              Due Date
              {/* type="date" renders a native date picker */}
              <input
                className="input-field"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
              />
            </label>

            <label className="ap-label">
              Priority
              {/* <select> dropdown for priority level */}
              <select
                className="input-field"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                {/* Render one <option> per priority level */}
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" className="btn-primary">Save Task</button>
        </form>
      )}

      {/* Status messages */}
      {loading && <p className="ap-loading">Loading tasks...</p>}
      {error   && <p className="ap-error">{error}</p>}
      {!loading && !error && filteredTasks.length === 0 && (
        <p className="ap-empty">No tasks here. Add one above!</p>
      )}

      {/* ── Task Items ── */}
      <ul className="tl-items">
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            // Add 'completed' class to strike through and grey out done tasks
            className={`tl-item card ${task.completed ? 'completed' : ''}`}
          >
            {/* Checkbox to toggle completion */}
            <input
              type="checkbox"
              className="tl-checkbox"
              checked={task.completed}           // Controlled: reflects state
              onChange={() => handleToggle(task)} // Optimistic toggle on change
            />

            {/* Task body: title, due date, priority */}
            <div className="tl-body">
              <span className="tl-title">{task.title}</span>
              <div className="tl-meta">
                {/* Only show due date if one was set */}
                {task.dueDate && <span className="tl-date">Due: {task.dueDate}</span>}
                {/* Color-coded priority badge via priorityClass() */}
                <span className={`tl-priority ${priorityClass(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            {/* Delete button — only shows on hover (controlled by CSS) */}
            <button
              className="btn-danger tl-delete"
              onClick={() => handleDelete(task.id)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
