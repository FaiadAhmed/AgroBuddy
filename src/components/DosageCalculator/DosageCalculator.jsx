// ─── DosageCalculator.jsx — Feature: Medication Dosage Calculator ────────────
// Helps farmers calculate the correct medication volume for an animal based on:
//   • Animal weight (kg)
//   • Prescribed dose rate (mg per kg of body weight)
//   • Medication concentration (mg per ml)
//
// It also generates a full administration schedule showing each dosing date.
// All math is in DosageCalculatorLogic.js; this file handles UI only.

import React, { useState } from 'react';
import './DosageCalculator.css';
import {
  calculateDosage,   // Returns {totalMg, totalMl, warning}
  doseSchedule,      // Returns array of Date objects
  formatDoseDate,    // Formats a Date to a readable string
} from './DosageCalculatorLogic';

export default function DosageCalculator() {

  // inputs — all form field values as strings (inputs are always strings in HTML)
  const [inputs, setInputs] = useState({
    animalName:    '',    // Identifier (e.g. "Bessie") — just for display
    weightKg:      '',    // Animal weight in kg
    dosePerKg:     '',    // mg/kg dose rate from the prescription
    concentration: '',    // mg/ml concentration of the medication
    startDate:     '',    // First treatment date (ISO string from date picker)
    frequencyDays: '1',   // Days between doses
    durationDays:  '7',   // Total treatment duration in days
  });

  // result — the object returned by calculateDosage(), or null before calculation
  const [result, setResult] = useState(null);

  // schedule — array of Date objects from doseSchedule(), or []
  const [schedule, setSchedule] = useState([]);

  // ── handleChange ──────────────────────────────────────────────────────────
  // Single handler for all form inputs — same pattern as other components.
  function handleChange(e) {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  }

  // ── handleCalculate ───────────────────────────────────────────────────────
  // Converts string inputs to numbers, calls the logic functions, and stores results.
  function handleCalculate(e) {
    e.preventDefault();   // Don't reload the page

    // parseFloat converts the string input to a floating-point number.
    // If the field is empty or non-numeric, parseFloat returns NaN.
    const weight        = parseFloat(inputs.weightKg);
    const dose          = parseFloat(inputs.dosePerKg);
    const concentration = parseFloat(inputs.concentration);
    const frequency     = parseInt(inputs.frequencyDays, 10);  // Whole days only
    const duration      = parseInt(inputs.durationDays, 10);

    // Validate that all numeric fields are real, positive numbers
    if ([weight, dose, concentration, frequency, duration].some((v) => isNaN(v) || v <= 0)) {
      alert('Please fill in all fields with positive numbers.');
      return;
    }

    // ── Call pure logic function ──
    // calculateDosage returns { totalMg, totalMl, warning }
    const dosageResult = calculateDosage(weight, dose, concentration);
    setResult(dosageResult);

    // ── Build schedule if a start date was provided ──
    if (inputs.startDate) {
      // new Date(string) parses "YYYY-MM-DD" into a JavaScript Date object
      const start = new Date(inputs.startDate);
      const dates = doseSchedule(start, frequency, duration);
      setSchedule(dates);
    } else {
      setSchedule([]);    // Clear any previous schedule
    }
  }

  // ── handleReset ──────────────────────────────────────────────────────────
  // Clears all inputs and results so the user can start a new calculation.
  function handleReset() {
    setInputs({
      animalName: '', weightKg: '', dosePerKg: '', concentration: '',
      startDate: '', frequencyDays: '1', durationDays: '7',
    });
    setResult(null);
    setSchedule([]);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="dosage-calculator">
      <h2 className="section-title">Dosage Calculator</h2>

      {/* ── Input Form ── */}
      <form className="dc-form card" onSubmit={handleCalculate}>

        <div className="dc-row">
          <label className="ap-label">
            Animal Name / ID
            <input
              className="input-field"
              type="text"
              name="animalName"
              value={inputs.animalName}
              onChange={handleChange}
              placeholder="e.g. Bessie"
            />
          </label>

          <label className="ap-label">
            Animal Weight (kg) *
            <input
              className="input-field"
              type="number"
              name="weightKg"
              value={inputs.weightKg}
              onChange={handleChange}
              min="0.1"
              step="0.1"
              placeholder="e.g. 450"
            />
          </label>
        </div>

        <div className="dc-row">
          <label className="ap-label">
            Dose Rate (mg / kg) *
            {/* This comes from the vet's prescription label */}
            <input
              className="input-field"
              type="number"
              name="dosePerKg"
              value={inputs.dosePerKg}
              onChange={handleChange}
              min="0.001"
              step="0.001"
              placeholder="e.g. 5"
            />
          </label>

          <label className="ap-label">
            Concentration (mg / ml) *
            {/* This is on the medication bottle label */}
            <input
              className="input-field"
              type="number"
              name="concentration"
              value={inputs.concentration}
              onChange={handleChange}
              min="0.001"
              step="0.001"
              placeholder="e.g. 50"
            />
          </label>
        </div>

        {/* Schedule section heading */}
        <p className="dc-subheading">Treatment Schedule (optional)</p>

        <div className="dc-row">
          <label className="ap-label">
            Start Date
            <input
              className="input-field"
              type="date"
              name="startDate"
              value={inputs.startDate}
              onChange={handleChange}
            />
          </label>

          <label className="ap-label">
            Frequency (days between doses)
            <input
              className="input-field"
              type="number"
              name="frequencyDays"
              value={inputs.frequencyDays}
              onChange={handleChange}
              min="1"
            />
          </label>

          <label className="ap-label">
            Duration (total days)
            <input
              className="input-field"
              type="number"
              name="durationDays"
              value={inputs.durationDays}
              onChange={handleChange}
              min="1"
            />
          </label>
        </div>

        {/* Form action buttons */}
        <div className="dc-actions">
          <button type="submit" className="btn-primary">Calculate</button>
          {/* Reset button is type="button" so it doesn't trigger form submit */}
          <button type="button" className="btn-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      {/* ── Results Panel ── (only shown after a successful calculation) */}
      {result && (
        <div className="dc-result card">
          <h3 className="dc-result-title">
            Result{inputs.animalName ? ` for ${inputs.animalName}` : ''}
          </h3>

          {/* Main dosage numbers */}
          <div className="dc-result-grid">
            <div className="dc-result-item">
              <span className="dc-result-label">Total Dose</span>
              {/* toFixed(2) rounds to 2 decimal places for display */}
              <span className="dc-result-value">{result.totalMg.toFixed(2)} mg</span>
            </div>
            <div className="dc-result-item">
              <span className="dc-result-label">Volume to Administer</span>
              <span className="dc-result-value dc-volume">{result.totalMl.toFixed(2)} ml</span>
            </div>
          </div>

          {/* Show warning banner if the logic function flagged a concern */}
          {result.warning && (
            <div className="dc-warning">
              ⚠️ {result.warning}
            </div>
          )}

          {/* ── Schedule Table ── (only if start date was provided) */}
          {schedule.length > 0 && (
            <div className="dc-schedule">
              <h4 className="dc-schedule-title">Administration Schedule</h4>
              <table className="dc-table">
                <thead>
                  <tr>
                    <th>Dose #</th>
                    <th>Date</th>
                    <th>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Map each Date in the schedule array to a table row */}
                  {schedule.map((date, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      {/* formatDoseDate converts the Date object to a readable string */}
                      <td>{formatDoseDate(date)}</td>
                      <td>{result.totalMl.toFixed(2)} ml</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
