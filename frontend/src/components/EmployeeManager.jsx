import React, { useState, useEffect } from 'react';
import { UserPlus, Search, UserCheck, UserX, History, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchEmployees, createEmployee, updateEmployee } from '../api';
import EmployeeHistoryModal from './EmployeeHistoryModal';

export default function EmployeeManager({ onRosterUpdated }) {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Employee Form State
  const [newEmpName, setNewEmpName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');
  const [addError, setAddError] = useState('');

  // History Modal State
  const [selectedEmpHistory, setSelectedEmpHistory] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchEmployees(false); // get all employees
      setEmployees(data);
    } catch (err) {
      console.error("Failed to load employee roster:", err);
      setError(err.message || 'Failed to fetch employee list.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddEmployee(e) {
    e.preventDefault();
    setAddSuccess('');
    setAddError('');

    if (!newEmpName.trim()) {
      setAddError('Please enter an employee name.');
      return;
    }

    setAdding(true);
    try {
      const created = await createEmployee(newEmpName.trim());
      setAddSuccess(`Employee '${created.name}' added successfully!`);
      setNewEmpName('');
      await loadEmployees();
      if (onRosterUpdated) onRosterUpdated();
    } catch (err) {
      setAddError(err.message || 'Failed to add employee.');
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleActive(employee) {
    const newActiveState = !employee.is_active;
    try {
      const updated = await updateEmployee(employee.id, { is_active: newActiveState });
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === updated.id ? updated : emp))
      );
      if (onRosterUpdated) onRosterUpdated();
    } catch (err) {
      alert(err.message || 'Failed to update employee status.');
    }
  }

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Add Employee Form Card */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <UserPlus className="card-header-icon" size={20} />
          <h3 className="card-title" style={{ fontSize: '1.05rem' }}>Add New Employee</h3>
        </div>

        {addSuccess && (
          <div className="alert-banner alert-success" style={{ marginBottom: '1rem' }}>
            <CheckCircle2 size={16} />
            <span>{addSuccess}</span>
          </div>
        )}

        {addError && (
          <div className="alert-banner alert-error" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            <span>{addError}</span>
          </div>
        )}

        <form onSubmit={handleAddEmployee} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Enter new employee full name..."
            value={newEmpName}
            onChange={(e) => setNewEmpName(e.target.value)}
            style={{ flex: 1, minWidth: '220px' }}
            required
          />
          <button
            type="submit"
            className="btn-submit"
            disabled={adding}
            style={{ width: 'auto', marginTop: 0, padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
          >
            {adding ? (
              <>
                <Loader2 className="spinner" size={16} /> Adding...
              </>
            ) : (
              <>
                <UserPlus size={16} /> Add Employee
              </>
            )}
          </button>
        </form>
      </div>

      {/* Roster & Controls */}
      <div className="glass-card">
        <div className="card-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 className="card-title" style={{ fontSize: '1.15rem' }}>Employee Roster ({employees.length})</h3>

          {/* Roster Search Bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search employee roster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {loading && (
          <div className="empty-state">
            <Loader2 className="spinner empty-icon" size={32} style={{ margin: '0 auto' }} />
            <p>Loading roster...</p>
          </div>
        )}

        {error && (
          <div className="alert-banner alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && filteredEmployees.length === 0 && (
          <div className="empty-state">
            <p>No employees found matching '{searchQuery}'.</p>
          </div>
        )}

        {!loading && !error && filteredEmployees.length > 0 && (
          <div className="tl-table-wrapper">
            <table className="tl-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="tl-row" style={{ cursor: 'default' }}>
                    <td>
                      <div className="employee-badge">
                        <div className="avatar-circle">
                          {emp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{emp.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${emp.is_active ? 'status-badge-accepted' : 'badge-inactive'}`}>
                        {emp.is_active ? <UserCheck size={13} /> : <UserX size={13} />}
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className="update-date-badge">
                        {emp.created_at ? emp.created_at.split('T')[0] : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn-icon-secondary"
                          onClick={() => setSelectedEmpHistory(emp)}
                          title="View History Timeline"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          <History size={14} style={{ marginRight: '4px' }} /> History
                        </button>

                        <button
                          className="btn-icon-secondary"
                          onClick={() => handleToggleActive(emp)}
                          title={emp.is_active ? 'Deactivate Employee' : 'Activate Employee'}
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.75rem',
                            color: emp.is_active ? 'var(--rose-text)' : 'var(--emerald-text)',
                            borderColor: emp.is_active ? 'var(--rose-border)' : 'var(--emerald-border)',
                          }}
                        >
                          {emp.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee History Modal */}
      {selectedEmpHistory && (
        <EmployeeHistoryModal
          employee={selectedEmpHistory}
          onClose={() => setSelectedEmpHistory(null)}
        />
      )}
    </div>
  );
}
