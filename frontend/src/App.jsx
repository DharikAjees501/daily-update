import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EmployeeForm from './components/EmployeeForm';
import RecentUpdatesList from './components/RecentUpdatesList';
import TLLogin from './components/TLLogin';
import TLDashboard from './components/TLDashboard';

export default function App() {
  const [activePortal, setActivePortal] = useState('employee'); // 'employee' | 'tl'
  const [isTLLoggedIn, setIsTLLoggedIn] = useState(false);
  
  // Active selected employee for private history view
  const [activeEmployeeId, setActiveEmployeeId] = useState(null);
  const [activeEmployeeName, setActiveEmployeeName] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const session = localStorage.getItem('tl_session');
    if (session === 'true') {
      setIsTLLoggedIn(true);
    }
  }, []);

  function handleTLLoginSuccess() {
    setIsTLLoggedIn(true);
    localStorage.setItem('tl_session', 'true');
  }

  function handleTLLogout() {
    setIsTLLoggedIn(false);
    localStorage.removeItem('tl_session');
  }

  function handleEmployeeSelect(id, name) {
    setActiveEmployeeId(id);
    setActiveEmployeeName(name);
  }

  function handleUpdateSubmitted(submittedEmpId) {
    if (submittedEmpId) {
      setActiveEmployeeId(submittedEmpId);
    }
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <div className="app-container">
      <Header
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        isTLLoggedIn={isTLLoggedIn}
        onTLLogout={handleTLLogout}
      />

      <main>
        {activePortal === 'employee' ? (
          <div className="main-grid">
            <EmployeeForm
              onUpdateSubmitted={handleUpdateSubmitted}
              onEmployeeSelect={handleEmployeeSelect}
            />
            <RecentUpdatesList
              employeeId={activeEmployeeId}
              employeeName={activeEmployeeName}
              refreshKey={refreshKey}
            />
          </div>
        ) : (
          <div>
            {!isTLLoggedIn ? (
              <TLLogin onLoginSuccess={handleTLLoginSuccess} />
            ) : (
              <TLDashboard />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
