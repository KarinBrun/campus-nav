
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Map,
  MapPin,
  Calendar,
  CalendarDays,
  ChevronDown,
  Settings,
  LogOut
} from 'lucide-react';
import grandViewLogo from '../assets/grand-view-logo-red.png';
import NextUp from './NextUp';

function Header() {
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);

  const storedUser = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const firstName = storedUser.firstName || 'Account';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAccountOpen(false);
    navigate('/login');
  };

  const navigationItems = [
    {
      label: 'Map',
      path: '/map',
      icon: Map,
    },
    {
      label: 'Find Classroom',
      path: '/find-classroom',
      icon: MapPin,
    },
    {
      label: 'Schedule',
      path: '/schedule',
      icon: Calendar,
    },
    {
      label: 'Events',
      path: '/events',
      icon: CalendarDays,
    },
  ];


  const renderNavigation = (className) => (
    <nav className={className} aria-label="Main navigation">
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon" aria-hidden="true">
              <Icon size={20} strokeWidth={1.8} />
            </span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="desktop-sidebar">
        <Link to="/" className="sidebar-logo">
          <img
            src={grandViewLogo}
            alt="Grand View University - Home"
          />
        </Link>

        <div className="sidebar-scroll-content">
          {renderNavigation('sidebar-navigation')}

          <div className="sidebar-next-class">
            <NextUp />
          </div>
        </div>
      </aside>

      <header className="desktop-header">
        <div className="header-account">
          <button
            type="button"
            className="account-trigger"
            onClick={() => setAccountOpen(!accountOpen)}
            aria-expanded={accountOpen}
            aria-haspopup="true"
          >
            <span className="account-avatar">
              {firstName.charAt(0).toUpperCase()}
            </span>
            <span>{firstName}</span>
            <ChevronDown size={16} strokeWidth={2} />
          </button>

          {accountOpen && (
            <div className="account-dropdown">
              <Link
                to="/account"
                onClick={() => setAccountOpen(false)}
              >
                <Settings size={17} strokeWidth={1.8} />
                <span>Account Settings</span>
              </Link>

              <div className="dropdown-divider" />

              <button type="button" onClick={handleLogout}>
                <LogOut size={17} strokeWidth={1.8} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <header className="mobile-header">
        <Link to="/" className="mobile-logo">
          <img
            src={grandViewLogo}
            alt="Grand View University - Home"
          />
        </Link>

        <div className="header-account">
          <button
            type="button"
            className="account-trigger"
            onClick={() => setAccountOpen(!accountOpen)}
            aria-expanded={accountOpen}
            aria-haspopup="true"
          >
            <span className="account-avatar">
              {firstName.charAt(0).toUpperCase()}
            </span>
            <span aria-hidden="true">⌄</span>
          </button>

          {accountOpen && (
            <div className="account-dropdown">
              <Link
                to="/account"
                onClick={() => setAccountOpen(false)}
              >
                Account Settings
              </Link>
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {renderNavigation('mobile-bottom-navigation')}
    </>
  );
}

export default Header;
