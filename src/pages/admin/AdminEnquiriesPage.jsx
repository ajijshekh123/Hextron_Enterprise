import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Mail,
  Search,
  Filter,
  Eye,
  X,
  MessageSquare,
  Calendar,
  UserCheck,
  Send,
  Building,
  Phone,
  Clock
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [assignedEmp, setAssignedEmp] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // New Note
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        status: statusFilter,
        search: searchQuery
      });
      const res = await api.get(`/enquiries?${query.toString()}`);
      setEnquiries(res.data.enquiries || []);
    } catch (err) {
      alert('Error fetching enquiries: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees?active=true');
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.warn('Could not load employees:', err);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    fetchEmployees();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEnquiries();
  };

  const viewEnquiryDetails = async (id) => {
    try {
      const res = await api.get(`/enquiries/${id}`);
      const enq = res.data.enquiry;
      setSelectedEnquiry(enq);
      setUpdateStatus(enq.status);
      setAssignedEmp(enq.assignedEmployeeId || '');
      setFollowUpDate(enq.followUpDate ? enq.followUpDate.split('T')[0] : '');
      setIsModalOpen(true);
    } catch (err) {
      alert('Failed to load enquiry details: ' + err.message);
    }
  };

  const handleUpdateEnquiry = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    setIsUpdating(true);
    try {
      await api.patch(`/enquiries/${selectedEnquiry.id}`, {
        status: updateStatus,
        assignedEmployeeId: assignedEmp || null,
        followUpDate: followUpDate || null
      });
      await viewEnquiryDetails(selectedEnquiry.id);
      fetchEnquiries();
      alert('Enquiry updated successfully');
    } catch (err) {
      alert('Failed to update enquiry: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedEnquiry) return;
    setIsSubmittingNote(true);
    try {
      await api.post(`/enquiries/${selectedEnquiry.id}/notes`, { note: newNote });
      setNewNote('');
      await viewEnquiryDetails(selectedEnquiry.id);
    } catch (err) {
      alert('Failed to save note: ' + err.message);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    return <span className={`status-badge ${s}`}>{status?.replace('_', ' ')}</span>;
  };

  return (
    <div>
      {/* Header */}
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
            Contact Enquiries
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94A3B8' }}>
            Review incoming public technical inquiries, assign staff, and track communications.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} className="admin-filters-bar" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="admin-select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Enquiries</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESPONDED">Responded</option>
              <option value="CLOSED">Closed</option>
            </select>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search name, company, email, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="admin-btn-secondary" style={{ padding: '0.45rem 0.85rem' }}>
              <Search size={15} />
              <span>Search</span>
            </button>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
            Showing <strong>{enquiries.length}</strong> inquiries
          </div>
        </form>
      </div>

      {/* Enquiries Table */}
      <div className="admin-card-panel">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Sender / Company</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Assigned Staff</th>
                <th>Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    Loading inquiries...
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    No contact enquiries found.
                  </td>
                </tr>
              ) : (
                enquiries.map((e) => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: '#94A3B8' }}>
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{e.name}</div>
                      {e.companyName && (
                        <div style={{ fontSize: '0.78rem', color: '#38BDF8' }}>{e.companyName}</div>
                      )}
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{e.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#F1F5F9' }}>{e.subject}</div>
                      <div style={{
                        fontSize: '0.76rem',
                        color: '#94A3B8',
                        maxWidth: '260px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {e.message}
                      </div>
                    </td>
                    <td>{getStatusBadge(e.status)}</td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {e.assignedEmployee ? e.assignedEmployee.fullName : <span style={{ color: '#64748B' }}>Unassigned</span>}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                      {e.followUpDate ? new Date(e.followUpDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => viewEnquiryDetails(e.id)}
                        className="admin-btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                      >
                        <Eye size={14} />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Enquiry Modal */}
      {isModalOpen && selectedEnquiry && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Enquiry: {selectedEnquiry.subject}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Sender Details */}
              <div style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Contact Person</span>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{selectedEnquiry.name}</div>
                  {selectedEnquiry.companyName && (
                    <div style={{ fontSize: '0.84rem', color: '#38BDF8' }}>{selectedEnquiry.companyName}</div>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Direct Channels</span>
                  <div style={{ fontSize: '0.84rem' }}>{selectedEnquiry.email}</div>
                  <div style={{ fontSize: '0.84rem' }}>{selectedEnquiry.phone}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Received Date</span>
                  <div style={{ fontSize: '0.84rem', color: '#E2E8F0' }}>
                    {new Date(selectedEnquiry.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Inquiry Message Body */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.92rem', color: '#F8FAFC' }}>
                  Customer Message Scope
                </h4>
                <div style={{ fontSize: '0.92rem', lineHeight: 1.6, color: '#E2E8F0', whiteSpace: 'pre-wrap' }}>
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* Status & Assignment Controls */}
              <form onSubmit={handleUpdateEnquiry} style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.92rem', color: '#F8FAFC' }}>
                  Status & Operational Assignment
                </h4>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Enquiry Status</label>
                    <select
                      className="admin-form-select"
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                    >
                      <option value="NEW">NEW</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESPONDED">RESPONDED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Assigned Technical Staff</label>
                    <select
                      className="admin-form-select"
                      value={assignedEmp}
                      onChange={(e) => setAssignedEmp(e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} ({emp.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Follow-up Date</label>
                    <input
                      type="date"
                      className="admin-form-input"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="admin-btn-primary" disabled={isUpdating}>
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>

              {/* Internal Notes Thread */}
              <div style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                padding: '1.25rem'
              }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.92rem', color: '#F8FAFC' }}>
                  Internal Communication Notes
                </h4>
                <div style={{
                  maxHeight: '160px',
                  overflowY: 'auto',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  {selectedEnquiry.internalNotes?.length === 0 ? (
                    <div style={{ color: '#94A3B8', fontSize: '0.82rem' }}>No internal notes recorded.</div>
                  ) : (
                    selectedEnquiry.internalNotes?.map((n) => (
                      <div key={n.id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '6px',
                        padding: '0.65rem 0.85rem',
                        fontSize: '0.82rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38BDF8', marginBottom: '0.2rem' }}>
                          <strong>{n.authorName}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ color: '#F1F5F9' }}>{n.note}</div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Record notes on phone discussions, technical samples, or visits..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <button type="submit" className="admin-btn-primary" disabled={isSubmittingNote}>
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
