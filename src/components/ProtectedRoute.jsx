import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F172A',
        color: '#F8FAFC'
      }}>
        <Loader2 size={36} className="animate-spin" style={{ color: '#0066FF', marginBottom: '1rem' }} />
        <p style={{ fontSize: '0.95rem', color: '#94A3B8' }}>Verifying secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F172A',
        color: '#F8FAFC',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#EF4444',
          marginBottom: '1.5rem'
        }}>
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Access Restricted</h2>
        <p style={{ color: '#94A3B8', maxWidth: '420px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Your current account role (<strong>{role}</strong>) does not have sufficient administrative privileges to access this view.
        </p>
        <a
          href="/admin/dashboard"
          style={{
            padding: '0.65rem 1.25rem',
            background: '#0066FF',
            color: '#FFFFFF',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600
          }}
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return children;
}
