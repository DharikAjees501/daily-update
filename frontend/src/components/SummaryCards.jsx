import React from 'react';
import { Users, CalendarCheck, Clock, CheckCircle2 } from 'lucide-react';

export default function SummaryCards({ stats }) {
  const {
    total_employees = 0,
    active_employees = 0,
    submitted_today = 0,
    pending_count = 0,
    accepted_count = 0
  } = stats || {};

  return (
    <div className="summary-cards-grid">
      {/* Total Employees Card */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-title">Total Employees</span>
          <div className="summary-icon-box icon-purple">
            <Users size={18} />
          </div>
        </div>
        <div className="summary-card-value">{total_employees}</div>
        <div className="summary-card-sub">{active_employees} Active</div>
      </div>

      {/* Submitted Today Card */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-title">Submitted Today</span>
          <div className="summary-icon-box icon-blue">
            <CalendarCheck size={18} />
          </div>
        </div>
        <div className="summary-card-value">{submitted_today}</div>
        <div className="summary-card-sub">Daily Submissions</div>
      </div>

      {/* Pending Review Card */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-title">Pending Review</span>
          <div className="summary-icon-box icon-amber">
            <Clock size={18} />
          </div>
        </div>
        <div className="summary-card-value">{pending_count}</div>
        <div className="summary-card-sub">Awaiting Acceptance</div>
      </div>

      {/* Accepted Card */}
      <div className="summary-card">
        <div className="summary-card-header">
          <span className="summary-card-title">Accepted Updates</span>
          <div className="summary-icon-box icon-emerald">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="summary-card-value">{accepted_count}</div>
        <div className="summary-card-sub">Reviewed & Approved</div>
      </div>
    </div>
  );
}
