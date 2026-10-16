import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import '../../styles/admin.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/admin/dashboard';

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both your email address and password');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #1E293B 0%, #090D16 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#0F172A',
        border: '1px solid #1E293B',
        borderRadius: '12px',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a href="/" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <img
              src="/images/logo-dark.png"
              alt="Hextron Enterprises"
              style={{ height: '42px', width: 'auto' }}
            />
          </a>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#F8FAFC', margin: '0 0 0.35rem' }}>
            Admin & Staff Portal
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#94A3B8', margin: 0 }}>
            Precision Job-Work & Commercial Management System
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            color: '#FCA5A5',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="admin-form-group">
            <label htmlFor="login-email">Work Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                className="admin-form-input"
                placeholder="name@hextron-demo.internal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Mail
                size={17}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="admin-form-group">
            <label htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                className="admin-form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <Lock
                size={17}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.75rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Switcher */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #1E293B'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem'
          }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Demo Evaluation Accounts
            </span>
            <span style={{ fontSize: '0.72rem', color: '#38BDF8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
              Click to Auto-fill
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fillDemoCredentials('admin@hextron-demo.internal', 'DemoAdmin@2026!')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.85rem',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '6px',
                color: '#F8FAFC',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>
                <strong>Administrator</strong> (Full System Access)
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>admin@hextron-demo.internal</div>
              </div>
              <span className="role-pill admin">ADMIN</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoCredentials('sales@hextron-demo.internal', 'DemoSales@2026!')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.85rem',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '6px',
                color: '#F8FAFC',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>
                <strong>Sales & RFQ Engineer</strong> (Quotations & Inquiries)
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>sales@hextron-demo.internal</div>
              </div>
              <span className="role-pill sales">SALES</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoCredentials('operator@hextron-demo.internal', 'DemoEmp@2026!')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.85rem',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '6px',
                color: '#F8FAFC',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>
                <strong>CNC Operator / Setter</strong> (Shop Floor View)
                <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>operator@hextron-demo.internal</div>
              </div>
              <span className="role-pill employee">STAFF</span>
            </button>
          </div>
        </div>

        {/* Public Website Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a
            href="/"
            style={{
              color: '#94A3B8',
              fontSize: '0.84rem',
              textDecoration: 'none',
              transition: 'color 0.15s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#F8FAFC')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            &larr; Return to Public Corporate Website
          </a>
        </div>
      </div>
    </div>
  );
}
