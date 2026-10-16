import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Mail,
  Package,
  Tags,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import '../styles/admin.css';

export default function AdminLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Quotations', path: '/admin/quotations', icon: FileText },
    { label: 'Contact Enquiries', path: '/admin/enquiries', icon: Mail },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Tags },
    { label: 'Employees', path: '/admin/employees', icon: Users },
    ...(role === 'ADMIN' ? [{ label: 'Users & Roles', path: '/admin/users', icon: ShieldCheck }] : []),
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  // Derive current page title
  const currentNav = navItems.find((item) => location.pathname.startsWith(item.path));
  const pageTitle = currentNav ? currentNav.label : 'Management Portal';

  return (
    <div className="admin-layout-wrapper">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 95
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <a href="/admin/dashboard" className="admin-brand-logo">
            <img src="/images/logo-dark.png" alt="Hextron Enterprises" />
          </a>
          <span className="admin-brand-badge">PORTAL</span>
        </div>

        <div className="admin-nav-section-title">Navigation</div>
        <ul className="admin-nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="admin-nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer with Active User */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-profile-card">
            <div className="admin-user-avatar">
              {(user?.employee?.fullName || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-details">
              <div className="admin-user-name" title={user?.email}>
                {user?.employee?.fullName || user?.email?.split('@')[0]}
              </div>
              <div className="admin-user-role">
                <span className={`role-pill ${(role || '').toLowerCase()}`}>{role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '4px'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="admin-main-viewport">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="admin-page-heading">
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="admin-topbar-right">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn-secondary"
              title="Open Public Website in new tab"
            >
              <ExternalLink size={15} />
              <span>View Website</span>
            </a>

            <button onClick={handleLogout} className="admin-btn-secondary">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Container */}
        <main className="admin-page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
