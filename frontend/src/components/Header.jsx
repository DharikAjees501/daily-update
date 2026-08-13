import React from 'react';
import { CalendarCheck2, User, ShieldCheck, LogOut } from 'lucide-react';

export default function Header({ activePortal, setActivePortal, isTLLoggedIn, onTLLogout }) {
  return (
    <header className="header-wrapper">
      <div className="header-brand">
        <div className="header-icon">
          <CalendarCheck2 size={24} />
        </div>
        <div className="header-title">
          <h1>Daily Work Update</h1>
          <p>Internal employee status & TL review portal</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="nav-tabs-wrapper">
          <button
            className={`nav-tab-btn ${activePortal === 'employee' ? 'active' : ''}`}
            onClick={() => setActivePortal('employee')}
          >
            <User size={16} /> Employee Portal
          </button>
          <button
            className={`nav-tab-btn ${activePortal === 'tl' ? 'active' : ''}`}
            onClick={() => setActivePortal('tl')}
          >
            <ShieldCheck size={16} /> TL Dashboard
          </button>
        </div>

        {isTLLoggedIn && activePortal === 'tl' && (
          <button className="btn-logout" onClick={onTLLogout} title="Logout TL Session">
            <LogOut size={15} /> Logout TL
          </button>
        )}
      </div>
    </header>
  );
}
