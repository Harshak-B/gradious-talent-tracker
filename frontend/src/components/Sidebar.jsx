import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/students', icon: '🎓', label: 'Students' },
  { to: '/companies', icon: '🏢', label: 'Companies' },
  { to: '/drives', icon: '📅', label: 'Drives' },
  { to: '/interviews', icon: '🗣️', label: 'Interviews' },
  { to: '/outcomes', icon: '🏆', label: 'Outcomes' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-logo">
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
          <rect width="100" height="100" rx="18" fill="#2563eb" />
          <text y="68" x="50" textAnchor="middle" fontSize="58" fontFamily="Arial" fontWeight="bold" fill="white">G</text>
        </svg>
        <span>
          Gradious
          <span className="sub">Talent Tracker</span>
        </span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        © {new Date().getFullYear()} Gradious Training
      </div>
    </aside>
  );
}
