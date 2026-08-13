import React, { useState, useEffect } from 'react';
import { X, Calendar, History, Target, AlertTriangle, MessageSquare, CheckCircle2, Clock, Loader2, FileText } from 'lucide-react';
import { fetchDailyUpdates } from '../api';

export default function EmployeeHistoryModal({ employee, onClose }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employee?.id) {
      loadEmployeeHistory();
    }
  }, [employee]);

  async function loadEmployeeHistory() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDailyUpdates({ employee_id: employee.id });
      setUpdates(data);
    } catch (err) {
      console.error("Failed to load employee history:", err);
      setError(err.message || 'Failed to fetch update history.');
    } finally {
      setLoading(false);
    }
  }

  if (!employee) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="avatar-circle" style={{ width: '38px', height: '38px', fontSize: '0.9rem' }}>
              {employee.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)' }}>{employee.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Update History & Performance Timeline</p>
            </div>
          </div>

          <button className="btn-icon-secondary" onClick={onClose} title="Close Modal">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && (
            <div className="alert-banner alert-error">
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="empty-state">
              <Loader2 className="spinner empty-icon" size={32} style={{ margin: '0 auto' }} />
              <p>Loading update history...</p>
            </div>
          )}

          {!loading && !error && updates.length === 0 && (
            <div className="empty-state">
              <FileText className="empty-icon" size={40} style={{ margin: '0 auto' }} />
              <p>No daily updates found for {employee.name}.</p>
            </div>
          )}

          {!loading && !error && updates.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {updates.map((update) => {
                const isAccepted = update.tl_status === 'Accepted';
                return (
                  <div key={update.id} className="update-item-card" style={{ marginBottom: 0 }}>
                    <div className="update-header">
                      <span className="update-date-badge">
                        <Calendar size={13} style={{ marginRight: '4px' }} /> {update.date}
                      </span>
                      <span className={`status-badge ${isAccepted ? 'status-badge-accepted' : 'status-badge-pending'}`}>
                        {isAccepted ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        {update.tl_status || 'Pending'}
                      </span>
                    </div>

                    <div className="update-section">
                      <div className="update-section-title title-yesterday">
                        <History size={13} /> Yesterday's Work
                      </div>
                      <div className="update-section-text">{update.yesterday_work}</div>
                    </div>

                    <div className="update-section">
                      <div className="update-section-title title-today">
                        <Target size={13} /> Today's Plan
                      </div>
                      <div className="update-section-text">{update.today_plan}</div>
                    </div>

                    {update.blockers && update.blockers.trim() !== '' && (
                      <div className="update-section">
                        <div className="update-section-title title-blockers">
                          <AlertTriangle size={13} /> Blockers / Issues
                        </div>
                        <div className="update-section-text">{update.blockers}</div>
                      </div>
                    )}

                    {update.tl_comment && update.tl_comment.trim() !== '' && (
                      <div className="update-section" style={{ marginTop: '0.6rem', background: '#f0fdf4', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                        <div className="update-section-title" style={{ color: '#166534' }}>
                          <MessageSquare size={13} /> TL Feedback
                        </div>
                        <div className="update-section-text" style={{ color: '#14532d', fontStyle: 'italic' }}>
                          "{update.tl_comment}"
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-icon-secondary" onClick={onClose}>
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
