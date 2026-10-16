import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  FileText,
  Clock,
  Mail,
  HelpCircle,
  Package,
  Tags,
  Users,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/metrics');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    return <span className={`status-badge ${s}`}>{status?.replace('_', ' ')}</span>;
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#F8FAFC' }}>
            Operational Overview
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94A3B8' }}>
            Real-time shop-floor RFQs, commercial quotations, and engineering enquiries.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchDashboardData}
            className="admin-btn-secondary"
            title="Refresh statistics"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/admin/quotations" className="admin-btn-primary">
            <Plus size={16} />
            <span>New Quotation</span>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#FCA5A5'
        }}>
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="admin-metrics-grid">
        {/* Total Quotations */}
        <div className="metric-card">
          <div className="metric-value-box">
            <span>Total Quotations</span>
            <h3>{isLoading ? '...' : (data?.metrics?.totalQuotations ?? 0)}</h3>
            <span style={{ fontSize: '0.75rem', color: '#38BDF8' }}>Commercial records</span>
          </div>
          <div className="metric-icon-box blue">
            <FileText size={22} />
          </div>
        </div>

        {/* Pending Quotations */}
        <div className="metric-card">
          <div className="metric-value-box">
            <span>Pending Review</span>
            <h3>{isLoading ? '...' : (data?.metrics?.pendingQuotations ?? 0)}</h3>
            <span style={{ fontSize: '0.75rem', color: '#FBBF24' }}>Requires technical action</span>
          </div>
          <div className="metric-icon-box amber">
            <Clock size={22} />
          </div>
        </div>

        {/* Total Enquiries */}
        <div className="metric-card">
          <div className="metric-value-box">
            <span>Contact Enquiries</span>
            <h3>{isLoading ? '...' : (data?.metrics?.totalEnquiries ?? 0)}</h3>
            <span style={{ fontSize: '0.75rem', color: '#34D399' }}>From website & clients</span>
          </div>
          <div className="metric-icon-box emerald">
            <Mail size={22} />
          </div>
        </div>

        {/* Unresolved Enquiries */}
        <div className="metric-card">
          <div className="metric-value-box">
            <span>Unresolved Enquiries</span>
            <h3>{isLoading ? '...' : (data?.metrics?.unresolvedEnquiries ?? 0)}</h3>
            <span style={{ fontSize: '0.75rem', color: '#F87171' }}>Awaiting follow-up</span>
          </div>
          <div className="metric-icon-box amber">
            <HelpCircle size={22} />
          </div>
        </div>

        {/* Active Products */}
        <div className="metric-card">
          <div className="metric-value-box">
            <span>Active Products</span>
            <h3>{isLoading ? '...' : (data?.metrics?.activeProducts ?? 0)}</h3>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>In catalog</span>
          </div>
          <div className="metric-icon-box purple">
            <Package size={22} />
          </div>
        </div>

        {/* Active Categories */}
        <div className="metric-card">
          <div className="metric-value-box">
            <span>Part Categories</span>
            <h3>{isLoading ? '...' : (data?.metrics?.activeCategories ?? 0)}</h3>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Manufacturing sectors</span>
          </div>
          <div className="metric-icon-box blue">
            <Tags size={22} />
          </div>
        </div>

        {/* Active Employees */}
        <div className="metric-card">
          <div className="metric-value-box">
            <span>Active Staff</span>
            <h3>{isLoading ? '...' : (data?.metrics?.activeEmployees ?? 0)}</h3>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Operations & QA</span>
          </div>
          <div className="metric-icon-box emerald">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Two Column Section for Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Quotation Activity */}
        <div className="admin-card-panel">
          <div className="admin-card-header">
            <h2>Recent Quotations</h2>
            <Link to="/admin/quotations" className="admin-btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Quotation No.</th>
                  <th>Customer / Company</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                      Loading quotation activity...
                    </td>
                  </tr>
                ) : data?.recentActivity?.quotations?.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                      No quotations recorded yet.
                    </td>
                  </tr>
                ) : (
                  data?.recentActivity?.quotations?.map((q) => (
                    <tr key={q.id}>
                      <td>
                        <Link
                          to={`/admin/quotations?id=${q.id}`}
                          style={{ color: '#38BDF8', fontWeight: 600, textDecoration: 'none' }}
                        >
                          {q.quotationNumber}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {new Date(q.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{q.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{q.companyName}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {formatCurrency(q.grandTotal)}
                      </td>
                      <td>{getStatusBadge(q.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Contact Enquiries */}
        <div className="admin-card-panel">
          <div className="admin-card-header">
            <h2>Recent Inquiries</h2>
            <Link to="/admin/enquiries" className="admin-btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Subject / Scope</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                      Loading inquiries...
                    </td>
                  </tr>
                ) : data?.recentActivity?.enquiries?.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                      No contact enquiries received yet.
                    </td>
                  </tr>
                ) : (
                  data?.recentActivity?.enquiries?.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{e.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{e.email}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {new Date(e.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, color: '#F1F5F9' }}>{e.subject}</div>
                        <div style={{
                          fontSize: '0.76rem',
                          color: '#94A3B8',
                          maxWidth: '240px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {e.message}
                        </div>
                      </td>
                      <td>{getStatusBadge(e.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
