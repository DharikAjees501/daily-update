import React, { useState } from 'react';
import { X, CheckCircle2, History, Target, AlertTriangle, MessageSquare, Clock, User, Calendar, Loader2 } from 'lucide-react';
import { reviewDailyUpdate } from '../api';

export default function UpdateDetailModal({ update, onClose, onReviewed }) {
  const [comment, setComment] = useState(update.tl_comment || '');
  const [status, setStatus] = useState(update.tl_status || 'Pending');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!update) return null;

  const empName = update.employee?.name || `Employee #${update.employee_id}`;

  async function handleSaveReview(newStatus) {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        tl_status: newStatus,
        tl_comment: comment.trim(),
      };
      const updatedItem = await reviewDailyUpdate(update.id, payload);
      setStatus(updatedItem.tl_status);
      if (onReviewed) {
        onReviewed(updatedItem);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save review.');
    } finally {
      setSubmitting(false);
    }
  }

  const detailBoxStyle = {
    background: '#f8fafc',
    padding: '0.85rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #e2e8f0',
    color: '#1e293b',
    fontSize: '0.9rem',
    lineHeight: '1.5'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="avatar-circle" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
              {empName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>{empName}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Calendar size={13} /> {update.date}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`status-badge ${status === 'Accepted' ? 'status-badge-accepted' : 'status-badge-pending'}`}>
              {status === 'Accepted' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
              {status}
            </span>
            <button className="btn-icon-secondary" onClick={onClose} title="Close Modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && (
            <div className="alert-banner alert-error">
              <span>{error}</span>
            </div>
          )}

          {/* Yesterday's Work */}
          <div className="update-section">
            <div className="update-section-title title-yesterday" style={{ fontSize: '0.825rem' }}>
              <History size={15} /> Yesterday's Work
            </div>
            <div className="update-section-text" style={detailBoxStyle}>
              {update.yesterday_work}
            </div>
          </div>

          {/* Today's Plan */}
          <div className="update-section">
            <div className="update-section-title title-today" style={{ fontSize: '0.825rem' }}>
              <Target size={15} /> Today's Plan
            </div>
            <div className="update-section-text" style={detailBoxStyle}>
              {update.today_plan}
            </div>
          </div>

          {/* Blockers */}
          {update.blockers && update.blockers.trim() !== '' && (
            <div className="update-section">
              <div className="update-section-title title-blockers" style={{ fontSize: '0.825rem' }}>
                <AlertTriangle size={15} /> Blockers / Issues
              </div>
              <div className="update-section-text" style={detailBoxStyle}>
                {update.blockers}
              </div>
            </div>
          )}

          {/* TL Comment Section */}
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.9rem' }}>
              <MessageSquare size={16} className="card-header-icon" /> TL Feedback & Comment
            </label>
            <textarea
              className="form-textarea"
              placeholder="Add feedback, notes, or remarks for this update..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ minHeight: '85px' }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button className="btn-icon-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          
          <button
            className="btn-submit"
            style={{ width: 'auto', marginTop: 0, padding: '0.75rem 1.25rem' }}
            onClick={() => handleSaveReview(status)}
            disabled={submitting}
          >
            Save Comment
          </button>

          {status !== 'Accepted' && (
            <button
              className="btn-accept"
              onClick={() => handleSaveReview('Accepted')}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="spinner" size={16} />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Accept Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
