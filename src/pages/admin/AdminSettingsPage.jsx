import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Settings, Save, ShieldCheck, Mail, Database, Info, CheckCircle2 } from 'lucide-react';
import '../../styles/admin.css';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    COMPANY_NAME: 'Hextron Enterprises',
    DEFAULT_TAX_RATE: '18.00',
    QUOTATION_PREFIX: 'HEX-QT',
    CURRENCY: 'INR'
  });
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data.settings) {
        setSettings((prev) => ({ ...prev, ...res.data.settings }));
      }
      setEmailConfigured(res.data.emailDeliveryConfigured || false);
    } catch (err) {
      alert('Error loading settings: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/settings', { settings });
      alert('Settings saved successfully');
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#F8FAFC' }}>
          System & Commercial Settings
        </h2>
        <p style={{ margin: 0, fontSize: '0.86rem', color: '#94A3B8' }}>
          Configure company parameters, quotation calculation defaults, and external service credentials.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Main Settings Form */}
        <div className="admin-card-panel">
          <div className="admin-card-header">
            <h2>Commercial & Quotation Defaults</h2>
          </div>

          <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
            <div className="admin-form-group">
              <label>Registered Company Name</label>
              <input
                type="text"
                className="admin-form-input"
                value={settings.COMPANY_NAME || ''}
                onChange={(e) => setSettings({ ...settings, COMPANY_NAME: e.target.value })}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Quotation Number Prefix</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={settings.QUOTATION_PREFIX || 'HEX-QT'}
                  onChange={(e) => setSettings({ ...settings, QUOTATION_PREFIX: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Default GST Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="admin-form-input"
                  value={settings.DEFAULT_TAX_RATE || '18.00'}
                  onChange={(e) => setSettings({ ...settings, DEFAULT_TAX_RATE: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Currency Symbol / Code</label>
              <input
                type="text"
                className="admin-form-input"
                value={settings.CURRENCY || 'INR'}
                onChange={(e) => setSettings({ ...settings, CURRENCY: e.target.value })}
              />
            </div>

            <button type="submit" className="admin-btn-primary" disabled={isSaving} style={{ marginTop: '0.5rem' }}>
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </form>
        </div>

        {/* External Integrations & Service Readiness Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Email Notification Status */}
          <div className="admin-card-panel">
            <div className="admin-card-header">
              <h2>Email Delivery Service Status</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: emailConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${emailConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                marginBottom: '1rem'
              }}>
                <Mail size={22} style={{ color: emailConfigured ? '#34D399' : '#FBBF24', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.9rem' }}>
                    {emailConfigured ? 'SMTP Email Delivery Configured' : 'Email Delivery: Manual / Direct WhatsApp Mode'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.15rem' }}>
                    {emailConfigured
                      ? 'Automated quotation PDF and enquiry notifications are sent via configured SMTP.'
                      : 'SMTP credentials not configured in .env. Enquiries and quotations are safely logged in PostgreSQL and forwarded via WhatsApp.'}
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
                To enable automated background email delivery, configure <code>SMTP_HOST</code>, <code>SMTP_PORT</code>, <code>SMTP_USER</code>, and <code>SMTP_PASS</code> in <code>server/.env</code>.
              </p>
            </div>
          </div>

          {/* Database & Architecture Summary */}
          <div className="admin-card-panel">
            <div className="admin-card-header">
              <h2>Infrastructure & Security Architecture</h2>
            </div>
            <div style={{ padding: '1.5rem', fontSize: '0.84rem', color: '#94A3B8' }}>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <li>
                  <strong style={{ color: '#F8FAFC' }}>Database Engine:</strong> PostgreSQL with Prisma ORM
                </li>
                <li>
                  <strong style={{ color: '#F8FAFC' }}>Authentication:</strong> Argon2/Bcrypt Password Hashing + JWT Token Bearer
                </li>
                <li>
                  <strong style={{ color: '#F8FAFC' }}>Role Enforcement:</strong> Server-side middleware (ADMIN, SALES, EMPLOYEE)
                </li>
                <li>
                  <strong style={{ color: '#F8FAFC' }}>Calculation Safety:</strong> Cent-safe fixed decimal arithmetic
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
