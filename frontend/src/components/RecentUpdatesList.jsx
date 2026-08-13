import React, { useState, useEffect } from 'react';
import { History, Target, AlertTriangle, RefreshCw, FileText, Loader2, CheckCircle2, Clock, MessageSquare, Lock } from 'lucide-react';
import { fetchDailyUpdates } from '../api';

export default function RecentUpdatesList({ employeeId, employeeName, refreshKey }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employeeId) {
      loadUpdates();
    } else {
      setUpdates([]);
    }
  }, [employeeId, refreshKey]);

  async function loadUpdates() {
    if (!employeeId) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchDailyUpdates({ employee_id: employeeId });
      setUpdates(data);
    } catch (err) {
      console.error("Failed to load personal updates:", err);
      setError(err.message || "Failed to load your update history.");
    } finally {
      setLoading(false);
    }
  }

  function getInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  return (
    <div className="glass-card">
      <div className="card-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <FileText className="card-header-icon" size={24} />
          <h2 className="card-title">
            {employeeName ? `${employeeName}'s Submissions` : 'Your Recent Submissions'}
          </h2>
        </div>
        {employeeId && (
          <button
            className="btn-icon-secondary"
            onClick={loadUpdates}
            title="Refresh History"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          </button>
        )}
      </div>

      {!employeeId && (
        <div className="empty-state">
          <Lock className="empty-icon" size={40} style={{ margin: '0 auto', color: 'var(--text-dim)' }} />
          <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>Private Employee Updates</p>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Select your employee name on the left to view your personal update history.
          </p>
        </div>
      )}

      {employeeId && loading && (
        <div className="empty-state">
          <Loader2 className="spinner empty-icon" size={32} style={{ margin: '0 auto' }} />
          <p>Fetching your updates...</p>
        </div>
      )}

      {employeeId && error && (
        <div className="alert-banner alert-error">
          <p>{error}</p>
        </div>
      )}

      {employeeId && !loading && !error && updates.length === 0 && (
        <div className="empty-state">
          <FileText className="empty-icon" size={44} style={{ margin: '0 auto' }} />
          <p>No previous updates submitted for {employeeName || 'this employee'}.</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
            Submit your daily update using the form on the left!
          </p>
        </div>
      )}

      {employeeId && !loading && !error && updates.length > 0 && (
        <div className="updates-list">
          {updates.map((update) => {
            const empName = update.employee?.name || employeeName || `Employee #${update.employee_id}`;
            const isAccepted = update.tl_status === 'Accepted';

            return (
              <div key={update.id} className="update-item-card">
                <div className="update-header">
                  <div className="employee-badge">
                    <div className="avatar-circle">
                      {getInitials(empName)}
                    </div>
                    <span>{empName}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`status-badge ${isAccepted ? 'status-badge-accepted' : 'status-badge-pending'}`}>
                      {isAccepted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {update.tl_status || 'Pending'}
                    </span>
                    <span className="update-date-badge">
                      {update.date}
                    </span>
                  </div>
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
  );
}
