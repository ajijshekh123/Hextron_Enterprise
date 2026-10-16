import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import {
  FileText,
  Search,
  Plus,
  Filter,
  Eye,
  Printer,
  X,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Calendar,
  Building,
  User,
  Phone,
  Mail,
  Send
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminQuotationsPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id');

  const [quotations, setQuotations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // New Note state
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    customerName: '',
    companyName: '',
    email: '',
    phone: '',
    componentName: '',
    description: '',
    materialType: 'Mild Steel (MS)',
    quantity: 100,
    unitPrice: 150,
    discountPercent: 0,
    taxRate: 18,
    estimatedDelivery: '7 - 10 working days',
    assignedEmployeeId: '',
    items: [
      {
        partName: '',
        description: '',
        material: 'Mild Steel (MS)',
        quantity: 100,
        unit: 'PCS',
        unitPrice: 150,
        specifications: ''
      }
    ]
  });

  const fetchQuotations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        status: statusFilter,
        search: searchQuery
      });
      const res = await api.get(`/quotations?${query.toString()}`);
      setQuotations(res.data.quotations || []);

      if (initialId && !selectedQuotation) {
        const target = (res.data.quotations || []).find((q) => q.id === initialId);
        if (target) {
          viewQuotationDetails(target.id);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch quotations');
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
    fetchQuotations();
    fetchEmployees();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuotations();
  };

  const viewQuotationDetails = async (id) => {
    try {
      const res = await api.get(`/quotations/${id}`);
      setSelectedQuotation(res.data.quotation);
      setNewStatus(res.data.quotation.status);
      setStatusRemarks('');
      setIsDetailsModalOpen(true);
    } catch (err) {
      alert('Error loading quotation details: ' + err.message);
    }
  };

  const handleStatusTransition = async (e) => {
    e.preventDefault();
    if (!selectedQuotation) return;
    setIsUpdatingStatus(true);
    try {
      await api.patch(`/quotations/${selectedQuotation.id}/status`, {
        status: newStatus,
        remarks: statusRemarks
      });
      await viewQuotationDetails(selectedQuotation.id);
      fetchQuotations();
      setStatusRemarks('');
    } catch (err) {
      alert('Status update failed: ' + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedQuotation) return;
    setIsSubmittingNote(true);
    try {
      await api.post(`/quotations/${selectedQuotation.id}/notes`, { note: newNote });
      setNewNote('');
      await viewQuotationDetails(selectedQuotation.id);
    } catch (err) {
      alert('Failed to add note: ' + err.message);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Line item helpers for create form
  const handleAddItem = () => {
    setCreateForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          partName: '',
          description: '',
          material: prev.materialType,
          quantity: 100,
          unit: 'PCS',
          unitPrice: 0,
          specifications: ''
        }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    setCreateForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setCreateForm((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  // Calculate live preview totals for create form
  const calcCreateTotals = () => {
    const subtotal = createForm.items.reduce((acc, item) => {
      return acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }, 0);
    const discountAmount = (subtotal * (Number(createForm.discountPercent) || 0)) / 100;
    const net = subtotal - discountAmount;
    const taxAmount = (net * (Number(createForm.taxRate) || 0)) / 100;
    const grandTotal = net + taxAmount;
    return { subtotal, discountAmount, net, taxAmount, grandTotal };
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...createForm,
        quantity: Number(createForm.items[0]?.quantity || 1),
        unitPrice: Number(createForm.items[0]?.unitPrice || 0),
        discountPercent: Number(createForm.discountPercent) || 0,
        taxRate: Number(createForm.taxRate) || 18,
        items: createForm.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0
        }))
      };

      await api.post('/quotations', payload);
      setIsCreateModalOpen(false);
      fetchQuotations();
      alert('Quotation generated successfully!');
    } catch (err) {
      alert('Error creating quotation: ' + err.message);
    }
  };

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
      {/* Top Action Bar */}
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
            Commercial Quotations
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94A3B8' }}>
            Manage incoming RFQs, issue engineering estimates, and track customer approvals.
          </p>
        </div>

        <button onClick={() => setIsCreateModalOpen(true)} className="admin-btn-primary">
          <Plus size={16} />
          <span>Create New Quotation</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} className="admin-filters-bar" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <select
              className="admin-select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New Submissions</option>
              <option value="UNDER_REVIEW">Under Technical Review</option>
              <option value="QUOTED">Quoted / Sent</option>
              <option value="ACCEPTED">Accepted / PO Received</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLOSED">Closed</option>
            </select>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search quotation no, customer, company..."
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
            Showing <strong>{quotations.length}</strong> quotations
          </div>
        </form>
      </div>

      {/* Quotations Table */}
      <div className="admin-card-panel">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Quotation No</th>
                <th>Customer / Company</th>
                <th>Component / Material</th>
                <th>Quantity</th>
                <th>Grand Total</th>
                <th>Status</th>
                <th>Assigned Staff</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    Loading quotations...
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    No quotations found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <span style={{ color: '#38BDF8', fontWeight: 600 }}>{q.quotationNumber}</span>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{q.customerName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{q.companyName}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{q.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {q.componentName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#38BDF8' }}>{q.materialType}</div>
                    </td>
                    <td>{Number(q.quantity).toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: '#F8FAFC' }}>
                      {formatCurrency(q.grandTotal)}
                    </td>
                    <td>{getStatusBadge(q.status)}</td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {q.assignedEmployee ? q.assignedEmployee.fullName : <span style={{ color: '#64748B' }}>Unassigned</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => viewQuotationDetails(q.id)}
                          className="admin-btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          title="View Details & Workflow"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={async () => {
                            await viewQuotationDetails(q.id);
                            setIsPrintModalOpen(true);
                          }}
                          className="admin-btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          title="Printable Quotation"
                        >
                          <Printer size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Quotation Details & Status Transition */}
      {isDetailsModalOpen && selectedQuotation && (
        <div className="admin-modal-overlay" onClick={() => setIsDetailsModalOpen(false)}>
          <div className="admin-modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Quotation: {selectedQuotation.quotationNumber}</h3>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                  Submitted on {new Date(selectedQuotation.createdAt).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="admin-btn-secondary"
                >
                  <Printer size={15} />
                  <span>Print Sheet</span>
                </button>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="admin-modal-body">
              {/* Customer Info Card */}
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
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Client / Company</span>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{selectedQuotation.customerName}</div>
                  <div style={{ fontSize: '0.84rem', color: '#38BDF8' }}>{selectedQuotation.companyName}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Contact Channels</span>
                  <div style={{ fontSize: '0.84rem' }}>{selectedQuotation.email}</div>
                  <div style={{ fontSize: '0.84rem' }}>{selectedQuotation.phone}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Current Status</span>
                  <div>{getStatusBadge(selectedQuotation.status)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Estimated Delivery</span>
                  <div style={{ fontWeight: 500 }}>{selectedQuotation.estimatedDelivery || 'TBD'}</div>
                </div>
              </div>

              {/* Line Items Table */}
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#F8FAFC' }}>
                Machined Component Items
              </h4>
              <div className="admin-table-responsive" style={{ marginBottom: '1.5rem' }}>
                <table className="admin-table" style={{ background: 'var(--admin-card)' }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Part Name & Specifications</th>
                      <th>Material</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Unit Price</th>
                      <th>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuotation.items?.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td>{item.itemOrder || idx + 1}</td>
                        <td>
                          <strong>{item.partName}</strong>
                          {item.description && (
                            <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>{item.description}</div>
                          )}
                        </td>
                        <td>{item.material || selectedQuotation.materialType}</td>
                        <td>{Number(item.quantity).toLocaleString()}</td>
                        <td>{item.unit || 'PCS'}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Breakdown */}
              <div style={{
                background: 'rgba(0, 102, 255, 0.05)',
                border: '1px solid rgba(0, 102, 255, 0.2)',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <div style={{ width: '280px', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0' }}>
                    <span style={{ color: '#94A3B8' }}>Subtotal:</span>
                    <strong style={{ color: '#F8FAFC' }}>{formatCurrency(selectedQuotation.subtotal)}</strong>
                  </div>
                  {Number(selectedQuotation.discountAmount) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: '#34D399' }}>
                      <span>Discount ({Number(selectedQuotation.discountPercent)}%):</span>
                      <span>-{formatCurrency(selectedQuotation.discountAmount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0' }}>
                    <span style={{ color: '#94A3B8' }}>GST ({Number(selectedQuotation.taxRate)}%):</span>
                    <strong style={{ color: '#F8FAFC' }}>{formatCurrency(selectedQuotation.taxAmount)}</strong>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0 0.2rem',
                    borderTop: '1px solid var(--admin-border-light)',
                    fontSize: '1.1rem',
                    color: '#38BDF8',
                    fontWeight: 800
                  }}>
                    <span>Grand Total:</span>
                    <span>{formatCurrency(selectedQuotation.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Workflow & Status Transition Section */}
              <div style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.92rem', color: '#F8FAFC' }}>
                  Update Workflow Status & Audit Log
                </h4>
                <form onSubmit={handleStatusTransition} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>
                        Transition To:
                      </label>
                      <select
                        className="admin-form-select"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                      >
                        <option value="NEW">NEW</option>
                        <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                        <option value="QUOTED">QUOTED</option>
                        <option value="ACCEPTED">ACCEPTED (PO Received)</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>

                    <div style={{ flex: 2, minWidth: '260px' }}>
                      <label style={{ fontSize: '0.78rem', color: '#94A3B8', display: 'block', marginBottom: '0.3rem' }}>
                        Audit Remarks / Change Note:
                      </label>
                      <input
                        type="text"
                        className="admin-form-input"
                        placeholder="e.g. Rate approved by Rajesh Patel, email dispatched to client"
                        value={statusRemarks}
                        onChange={(e) => setStatusRemarks(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      className="admin-btn-primary"
                      disabled={isUpdatingStatus || newStatus === selectedQuotation.status}
                    >
                      <span>Update Workflow Status</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Two Column Grid for Audit History & Internal Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {/* Audit History Log */}
                <div style={{
                  background: 'var(--admin-card)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '8px',
                  padding: '1.25rem'
                }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.92rem', color: '#F8FAFC' }}>
                    Quotation Audit Timeline
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {selectedQuotation.history?.length === 0 ? (
                      <div style={{ color: '#94A3B8', fontSize: '0.82rem' }}>No status changes yet.</div>
                    ) : (
                      selectedQuotation.history?.map((h) => (
                        <div key={h.id} style={{
                          borderLeft: '2px solid #0066FF',
                          paddingLeft: '0.75rem',
                          fontSize: '0.82rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            {getStatusBadge(h.newStatus)}
                            <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                              {new Date(h.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div style={{ color: '#E2E8F0', fontWeight: 500 }}>
                            By {h.changedByName}
                          </div>
                          {h.remarks && (
                            <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                              {h.remarks}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Internal Notes */}
                <div style={{
                  background: 'var(--admin-card)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '8px',
                  padding: '1.25rem'
                }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '0.92rem', color: '#F8FAFC' }}>
                    Staff Internal Notes (Hidden from Customer)
                  </h4>
                  <div style={{
                    maxHeight: '180px',
                    overflowY: 'auto',
                    marginBottom: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}>
                    {selectedQuotation.internalNotes?.length === 0 ? (
                      <div style={{ color: '#94A3B8', fontSize: '0.82rem' }}>No internal notes added.</div>
                    ) : (
                      selectedQuotation.internalNotes?.map((n) => (
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
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div style={{ color: '#F1F5F9' }}>{n.note}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="Add an internal engineering note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                    />
                    <button type="submit" className="admin-btn-primary" disabled={isSubmittingNote}>
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button onClick={() => setIsDetailsModalOpen(false)} className="admin-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Quotation (Staff) */}
      {isCreateModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="admin-modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Create Commercial Quotation</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation}>
              <div className="admin-modal-body">
                {/* Customer Details */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Customer Full Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      placeholder="e.g. Vikram Seth"
                      value={createForm.customerName}
                      onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Company / Workshop Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      placeholder="e.g. Apex Machinery & Pumps"
                      value={createForm.companyName}
                      onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Work Email *</label>
                    <input
                      type="email"
                      className="admin-form-input"
                      required
                      placeholder="vikram@apexmachinery.in"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Phone / Mobile *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      placeholder="+91 9825123456"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Primary Component / Scope *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      placeholder="e.g. Precision Stepped Drive Shaft"
                      value={createForm.componentName}
                      onChange={(e) => setCreateForm({ ...createForm, componentName: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Primary Material *</label>
                    <select
                      className="admin-form-select"
                      value={createForm.materialType}
                      onChange={(e) => setCreateForm({ ...createForm, materialType: e.target.value })}
                    >
                      <option value="Mild Steel (MS)">Mild Steel (MS)</option>
                      <option value="Stainless Steel 304">Stainless Steel 304</option>
                      <option value="Stainless Steel 316">Stainless Steel 316</option>
                      <option value="EN8 / EN9 Steel">EN8 / EN9 Carbon Steel</option>
                      <option value="EN24 Alloy Steel">EN24 Alloy Steel</option>
                      <option value="Free Cutting Brass IS 319">Free Cutting Brass IS 319</option>
                      <option value="Phosphor Bronze PB2">Phosphor Bronze PB2</option>
                      <option value="Aluminium 6061 / 7075">Aluminium 6061 / 7075</option>
                    </select>
                  </div>
                </div>

                {/* Line Items Builder */}
                <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#F8FAFC' }}>
                      Quotation Line Items
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="admin-btn-secondary"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                    >
                      <Plus size={14} />
                      <span>Add Component Line</span>
                    </button>
                  </div>

                  {createForm.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--admin-card)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '6px',
                        padding: '1rem',
                        marginBottom: '0.75rem',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Part Name / Drawing Ref</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            required
                            placeholder="e.g. Stepped Shaft Dia 32x180"
                            value={item.partName}
                            onChange={(e) => handleItemChange(idx, 'partName', e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Material</label>
                          <input
                            type="text"
                            className="admin-form-input"
                            placeholder="EN24"
                            value={item.material}
                            onChange={(e) => handleItemChange(idx, 'material', e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Qty</label>
                          <input
                            type="number"
                            className="admin-form-input"
                            min="1"
                            required
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Unit Price (₹)</label>
                          <input
                            type="number"
                            className="admin-form-input"
                            min="0"
                            step="0.01"
                            required
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Line Total (₹)</label>
                          <div style={{ padding: '0.6rem 0', fontWeight: 600, color: '#38BDF8' }}>
                            {formatCurrency((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}
                          </div>
                        </div>
                        {createForm.items.length > 1 && (
                          <div>
                            <label>&nbsp;</label>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.5rem' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Adjustments & Totals Preview */}
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Discount Percentage (%)</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      min="0"
                      max="100"
                      step="0.1"
                      value={createForm.discountPercent}
                      onChange={(e) => setCreateForm({ ...createForm, discountPercent: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Tax Rate (GST %)</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      min="0"
                      step="0.1"
                      value={createForm.taxRate}
                      onChange={(e) => setCreateForm({ ...createForm, taxRate: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Estimated Delivery Time</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={createForm.estimatedDelivery}
                      onChange={(e) => setCreateForm({ ...createForm, estimatedDelivery: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Assign to Technical Staff</label>
                    <select
                      className="admin-form-select"
                      value={createForm.assignedEmployeeId}
                      onChange={(e) => setCreateForm({ ...createForm, assignedEmployeeId: e.target.value })}
                    >
                      <option value="">Unassigned</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} ({emp.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Decimal Arithmetic Summary */}
                {(() => {
                  const totals = calcCreateTotals();
                  return (
                    <div style={{
                      background: 'rgba(0, 102, 255, 0.08)',
                      border: '1px solid rgba(0, 102, 255, 0.25)',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Calculated Subtotal:</span>
                        <div style={{ fontWeight: 600 }}>{formatCurrency(totals.subtotal)}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Discount:</span>
                        <div style={{ color: '#34D399', fontWeight: 600 }}>-{formatCurrency(totals.discountAmount)}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>GST ({createForm.taxRate}%):</span>
                        <div style={{ fontWeight: 600 }}>{formatCurrency(totals.taxAmount)}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Grand Total (INR):</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38BDF8' }}>
                          {formatCurrency(totals.grandTotal)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  <span>Generate Official Quotation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Quotation Sheet */}
      {isPrintModalOpen && selectedQuotation && (
        <div className="admin-modal-overlay" onClick={() => setIsPrintModalOpen(false)}>
          <div className="admin-modal-card large" onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF' }}>
            <div className="admin-modal-header" style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <h3 style={{ color: '#0F172A' }}>Printable Quotation Document</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => window.print()}
                  className="admin-btn-primary"
                  style={{ background: '#0066FF' }}
                >
                  <Printer size={16} />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="admin-modal-body" style={{ background: '#FFFFFF' }}>
              <div className="printable-quotation-sheet">
                {/* Header */}
                <div className="quotation-brand-header">
                  <div>
                    <img src="/images/logo-dark.png" alt="Hextron Enterprises" style={{ height: '48px', filter: 'brightness(0.2)' }} />
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.4rem' }}>
                      <strong>CNC Turning Job Work & Precision Turned Components</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      138, 162 Paiki Plot No-21, Mohmadi Estate, Near Rehan Masjid, Behrampura, Ahmedabad - 380022
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      Email: hextronenterprise@gmail.com | Phone: +91 9879964414
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0066FF' }}>
                      COMMERCIAL QUOTATION
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                      No: {selectedQuotation.quotationNumber}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      Date: {new Date(selectedQuotation.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Customer Details Box */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>
                      Quotation To:
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                      {selectedQuotation.companyName}
                    </div>
                    <div style={{ fontSize: '0.86rem' }}>Kind Attn: {selectedQuotation.customerName}</div>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>Email: {selectedQuotation.email}</div>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>Phone: {selectedQuotation.phone}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 700 }}>
                      Job Execution Details:
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>Primary Scope:</strong> {selectedQuotation.componentName}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>Raw Material:</strong> {selectedQuotation.materialType}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>Delivery Schedule:</strong> {selectedQuotation.estimatedDelivery || '7 - 10 working days'}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>Drawing Reference:</strong> {selectedQuotation.drawingRef || 'As per approved technical sample'}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>Sr.</th>
                      <th>Description of Machining Work & Specifications</th>
                      <th>Material</th>
                      <th style={{ width: '80px', textAlign: 'right' }}>Quantity</th>
                      <th style={{ width: '60px' }}>Unit</th>
                      <th style={{ width: '110px', textAlign: 'right' }}>Rate (₹)</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuotation.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                        <td>
                          <strong>{item.partName}</strong>
                          {item.description && (
                            <div style={{ fontSize: '0.78rem', color: '#475569' }}>{item.description}</div>
                          )}
                        </td>
                        <td>{item.material || selectedQuotation.materialType}</td>
                        <td style={{ textAlign: 'right' }}>{Number(item.quantity).toLocaleString()}</td>
                        <td style={{ textAlign: 'center' }}>{item.unit || 'PCS'}</td>
                        <td style={{ textAlign: 'right' }}>{Number(item.unitPrice).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{Number(item.total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals Summary */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0 2rem' }}>
                  <div style={{ width: '280px', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                      <span>Subtotal:</span>
                      <strong>₹{Number(selectedQuotation.subtotal).toFixed(2)}</strong>
                    </div>
                    {Number(selectedQuotation.discountAmount) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                        <span>Discount ({Number(selectedQuotation.discountPercent)}%):</span>
                        <span>-₹{Number(selectedQuotation.discountAmount).toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                      <span>GST ({Number(selectedQuotation.taxRate)}%):</span>
                      <strong>₹{Number(selectedQuotation.taxAmount).toFixed(2)}</strong>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderTop: '2px solid #0F172A',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#0066FF'
                    }}>
                      <span>Grand Total:</span>
                      <span>₹{Number(selectedQuotation.grandTotal).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Commercial Terms & Sign-off */}
                <div style={{
                  borderTop: '1px solid #CBD5E1',
                  paddingTop: '1rem',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '2rem',
                  fontSize: '0.76rem',
                  color: '#475569'
                }}>
                  <div>
                    <strong style={{ color: '#0F172A' }}>Terms & Conditions:</strong>
                    <ol style={{ paddingLeft: '1.2rem', margin: '0.4rem 0 0' }}>
                      <li>Payment Terms: 30 days from dispatch against approved delivery challan.</li>
                      <li>Tolerance & Quality: All components strictly manufactured as per approved 2D drawings / 3D CAD models.</li>
                      <li>Delivery: Ex-works Ahmedabad. Transit insurance at buyer's scope.</li>
                      <li>Validity: This quotation is valid for 30 days from the date of issue.</li>
                    </ol>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>For, HEXTRON ENTERPRISES</div>
                    <div style={{ height: '50px' }}></div>
                    <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '0.3rem', fontSize: '0.78rem' }}>
                      Authorized Signatory / Technical Estimator
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ background: '#F8FAFC' }}>
              <button onClick={() => setIsPrintModalOpen(false)} className="admin-btn-secondary">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
