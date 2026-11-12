import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)',
            zIndex: 99, display: 'none',
          }}
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="main-content">
        <header className="topbar">
          <button
            className="btn btn-outline btn-icon"
            style={{ display: 'none' }}
            aria-label="Toggle menu"
            onClick={() => setSidebarOpen((o) => !o)}
            id="menu-toggle"
          >
            ☰
          </button>
          <span className="topbar-title">Gradious Talent Tracker</span>
          <div className="topbar-actions">
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
              Placement Portal
            </span>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
