import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, User, Calendar, CheckCircle2, Clock, Search, FileText, Loader2, X, Users, Layers } from 'lucide-react';
import { fetchEmployees, fetchDailyUpdates, fetchDashboardStats } from '../api';
import SummaryCards from './SummaryCards';
import EmployeeManager from './EmployeeManager';
import UpdateDetailModal from './UpdateDetailModal';

function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getThisWeekStartDate() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default function TLDashboard() {
  const [activeTab, setActiveTab] = useState('updates'); // 'updates' | 'roster'
  const [stats, setStats] = useState({});
  const [employees, setEmployees] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [datePreset, setDatePreset] = useState('All'); // 'All', 'Today', 'Yesterday', 'ThisWeek', 'Custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Selected update modal state
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    loadStats();
    loadEmployees();
    loadUpdates();
  }

  async function loadStats() {
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    }
  }

  async function loadEmployees() {
    try {
      const data = await fetchEmployees(false);
      setEmployees(data);
    } catch (err) {
      console.error("Failed to load employees for TL filter:", err);
    }
  }

  async function loadUpdates() {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (filterEmployeeId) filters.employee_id = filterEmployeeId;
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (filterStatus && filterStatus !== 'All') filters.status = filterStatus;

      // Apply Date Presets
      if (datePreset === 'Today') {
        filters.date = getTodayString();
      } else if (datePreset === 'Yesterday') {
        filters.date = getYesterdayString();
      } else if (datePreset === 'ThisWeek') {
        filters.start_date = getThisWeekStartDate();
        filters.end_date = getTodayString();
      } else if (datePreset === 'Custom') {
        if (customStartDate) filters.start_date = customStartDate;
        if (customEndDate) filters.end_date = customEndDate;
      }

      const data = await fetchDailyUpdates(filters);
      setUpdates(data);
    } catch (err) {
      console.error("Failed to load TL updates:", err);
      setError(err.message || 'Failed to fetch employee updates.');
    } finally {
      setLoading(false);
    }
  }

  // Trigger search when filters change
  useEffect(() => {
    loadUpdates();
  }, [datePreset, customStartDate, customEndDate, searchQuery, filterEmployeeId, filterStatus]);

  function handleClearFilters() {
    setDatePreset('All');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearchQuery('');
    setFilterEmployeeId('');
    setFilterStatus('All');
  }

  function handleUpdateReviewed(updatedItem) {
    setUpdates((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    loadStats();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Summary Cards Row */}
      <SummaryCards stats={stats} />

      {/* 2. Main TL Container */}
      <div className="glass-card">
        {/* Header & Sub-tabs */}
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.4rem' }}>TL Management Dashboard</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Review daily work updates, filter history, and manage team roster.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="nav-tabs-wrapper">
              <button
                className={`nav-tab-btn ${activeTab === 'updates' ? 'active' : ''}`}
                onClick={() => setActiveTab('updates')}
              >
                <Layers size={15} /> Daily Updates
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
                onClick={() => setActiveTab('roster')}
              >
                <Users size={15} /> Employee Roster
              </button>
            </div>

            {activeTab === 'updates' && (
              <button
                className="btn-icon-secondary"
                onClick={loadDashboardData}
                title="Refresh Dashboard"
                disabled={loading}
              >
                <RefreshCw size={18} className={loading ? 'spinner' : ''} />
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Daily Updates Review */}
        {activeTab === 'updates' && (
          <div>
            {/* Date Preset Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
                Date Presets:
              </span>
              {[
                { key: 'All', label: 'All Time' },
                { key: 'Today', label: 'Today' },
                { key: 'Yesterday', label: 'Yesterday' },
                { key: 'ThisWeek', label: 'This Week' },
                { key: 'Custom', label: 'Custom Range' },
              ].map((p) => (
                <button
                  key={p.key}
                  className={`preset-pill ${datePreset === p.key ? 'active' : ''}`}
                  onClick={() => setDatePreset(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Main Filters Bar */}
            <div className="filters-bar">
              {/* Employee Search Bar */}
              <div className="filter-item">
                <label><Search size={13} /> Search Employee</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Employee Select Filter */}
              <div className="filter-item">
                <label><User size={13} /> Employee</label>
                <select
                  className="form-select"
                  value={filterEmployeeId}
                  onChange={(e) => setFilterEmployeeId(e.target.value)}
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="filter-item">
                <label><Filter size={13} /> Status</label>
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                </select>
              </div>

              {/* Custom Date Range Inputs */}
              {datePreset === 'Custom' && (
                <>
                  <div className="filter-item">
                    <label><Calendar size={13} /> Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div className="filter-item">
                    <label><Calendar size={13} /> End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Reset Filters Button */}
              {(filterEmployeeId || searchQuery || filterStatus !== 'All' || datePreset !== 'All') && (
                <button
                  className="btn-icon-secondary"
                  onClick={handleClearFilters}
                  title="Clear all filters"
                  style={{ padding: '0.65rem 0.9rem', fontSize: '0.8rem' }}
                >
                  <X size={15} /> Clear
                </button>
              )}
            </div>

            {/* Error alert */}
            {error && (
              <div className="alert-banner alert-error">
                <span>{error}</span>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="empty-state">
                <Loader2 className="spinner empty-icon" size={32} style={{ margin: '0 auto' }} />
                <p>Loading employee updates...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && updates.length === 0 && (
              <div className="empty-state">
                <FileText className="empty-icon" size={44} style={{ margin: '0 auto' }} />
                <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>No matching daily updates found</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                  Try adjusting your search query, date presets, or filters.
                </p>
              </div>
            )}

            {/* Updates Table */}
            {!loading && !error && updates.length > 0 && (
              <div className="tl-table-wrapper">
                <table className="tl-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Date</th>
                      <th>Yesterday's Summary</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {updates.map((update) => {
                      const empName = update.employee?.name || `Employee #${update.employee_id}`;
                      const isAccepted = update.tl_status === 'Accepted';

                      return (
                        <tr
                          key={update.id}
                          className="tl-row"
                          onClick={() => setSelectedUpdate(update)}
                        >
                          <td>
                            <div className="employee-badge">
                              <div className="avatar-circle">
                                {empName.slice(0, 2).toUpperCase()}
                              </div>
                              <span>{empName}</span>
                            </div>
                          </td>
                          <td>
                            <span className="update-date-badge">{update.date}</span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {update.yesterday_work.length > 55
                                ? `${update.yesterday_work.slice(0, 55)}...`
                                : update.yesterday_work}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${isAccepted ? 'status-badge-accepted' : 'status-badge-pending'}`}>
                              {isAccepted ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                              {update.tl_status || 'Pending'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-icon-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUpdate(update);
                              }}
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Employee Roster & History */}
        {activeTab === 'roster' && (
          <EmployeeManager onRosterUpdated={loadDashboardData} />
        )}
      </div>

      {/* Modal Detail & Review Component */}
      {selectedUpdate && (
        <UpdateDetailModal
          update={selectedUpdate}
          onClose={() => setSelectedUpdate(null)}
          onReviewed={handleUpdateReviewed}
        />
      )}
    </div>
  );
}
