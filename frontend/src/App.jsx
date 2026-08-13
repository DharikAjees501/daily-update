import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EmployeeForm from './components/EmployeeForm';
import TLLogin from './components/TLLogin';
import TLDashboard from './components/TLDashboard';

export default function App() {
  const [activePortal, setActivePortal] = useState('employee'); // 'employee' | 'tl'
  const [isTLLoggedIn, setIsTLLoggedIn] = useState(false);

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
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <EmployeeForm />
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
