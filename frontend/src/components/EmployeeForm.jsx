import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, UserCircle, Calendar, History, Target, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchEmployees, submitDailyUpdate } from '../api';

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function EmployeeForm({ onUpdateSubmitted, onEmployeeSelect }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const [date, setDate] = useState(getTodayString());
  const [yesterdayWork, setYesterdayWork] = useState('');
  const [todayPlan, setTodayPlan] = useState('');
  const [blockers, setBlockers] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load active employees added by TL on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const data = await fetchEmployees(true); // fetch active employees only
      setEmployees(data);
      if (data.length > 0) {
        const firstId = String(data[0].id);
        setSelectedEmployeeId(firstId);
        if (onEmployeeSelect) onEmployeeSelect(data[0].id, data[0].name);
      } else {
        setSelectedEmployeeId('');
        if (onEmployeeSelect) onEmployeeSelect(null, null);
      }
    } catch (err) {
      console.error("Error loading employees:", err);
    }
  }

  function handleEmployeeChange(val) {
    setSelectedEmployeeId(val);
    if (!val) {
      if (onEmployeeSelect) onEmployeeSelect(null, null);
      return;
    }
    const emp = employees.find((e) => String(e.id) === String(val));
    if (onEmployeeSelect) {
      onEmployeeSelect(emp ? emp.id : null, emp ? emp.name : null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!selectedEmployeeId) {
      setErrorMessage("Please select your employee name from the dropdown.");
      return;
    }

    if (!yesterdayWork.trim()) {
      setErrorMessage("Please enter Yesterday's Work.");
      return;
    }

    if (!todayPlan.trim()) {
      setErrorMessage("Please enter Today's Plan.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        employee_id: parseInt(selectedEmployeeId, 10),
        date,
        yesterday_work: yesterdayWork.trim(),
        today_plan: todayPlan.trim(),
        blockers: blockers.trim(),
      };

      const createdUpdate = await submitDailyUpdate(payload);

      setSuccessMessage("Daily update submitted successfully!");
      setYesterdayWork('');
      setTodayPlan('');
      setBlockers('');

      if (onUpdateSubmitted) {
        onUpdateSubmitted(createdUpdate.employee_id);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit update. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="glass-card">
      <div className="card-header">
        <UserCircle className="card-header-icon" size={24} />
        <h2 className="card-title">Submit Daily Update</h2>
      </div>

      {successMessage && (
        <div className="alert-banner alert-success">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Employee Selection Dropdown */}
        <div className="form-group">
          <label className="form-label">
            Employee Name <span className="required-star">*</span>
          </label>
          
          {employees.length > 0 ? (
            <select
              className="form-select"
              value={selectedEmployeeId}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              required
            >
              <option value="">-- Select Your Name --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--rose-border)', color: 'var(--rose-text)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              No active employees configured. Please ask your Team Lead (TL) to add your name to the employee roster.
            </div>
          )}
        </div>

        {/* Date Field */}
        <div className="form-group">
          <label className="form-label">
            <Calendar size={15} /> Date <span className="required-star">*</span>
          </label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Yesterday's Work Textarea */}
        <div className="form-group">
          <label className="form-label">
            <History size={15} className="title-yesterday" /> Yesterday's Work <span className="required-star">*</span>
          </label>
          <textarea
            className="form-textarea"
            placeholder="What tasks or progress did you complete yesterday?"
            value={yesterdayWork}
            onChange={(e) => setYesterdayWork(e.target.value)}
            required
          />
        </div>

        {/* Today's Plan Textarea */}
        <div className="form-group">
          <label className="form-label">
            <Target size={15} className="title-today" /> Today's Plan <span className="required-star">*</span>
          </label>
          <textarea
            className="form-textarea"
            placeholder="What are your key goals and targets for today?"
            value={todayPlan}
            onChange={(e) => setTodayPlan(e.target.value)}
            required
          />
        </div>

        {/* Blockers / Issues Textarea */}
        <div className="form-group">
          <label className="form-label">
            <AlertTriangle size={15} className="title-blockers" /> Blockers / Issues
          </label>
          <textarea
            className="form-textarea"
            placeholder="Any impediments, technical blockers, or dependency delays? (Optional)"
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn-submit" disabled={submitting || employees.length === 0}>
          {submitting ? (
            <>
              <Loader2 className="spinner" size={18} />
              Submitting...
            </>
          ) : (
            <>
              <Send size={18} />
              Submit Update
            </>
          )}
        </button>
      </form>
    </div>
  );
}
