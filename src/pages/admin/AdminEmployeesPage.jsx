import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Users, Plus, Search, Edit2, Trash2, X, Check, Phone, Mail, Briefcase } from 'lucide-react';
import '../../styles/admin.css';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    workEmail: '',
    phone: '',
    department: 'CNC Production',
    designation: 'CNC Lathe Programmer',
    joiningDate: ''
  });

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        department: departmentFilter,
        search: searchQuery
      });
      const res = await api.get(`/employees?${query.toString()}`);
      setEmployees(res.data.employees || []);
    } catch (err) {
      alert('Error fetching employees: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [departmentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    const nextCode = `EMP-00${employees.length + 1}`;
    setFormData({
      employeeCode: nextCode,
      fullName: '',
      workEmail: '',
      phone: '+91 ',
      department: 'CNC Production',
      designation: 'CNC Lathe Setter / Operator',
      joiningDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      employeeCode: emp.employeeCode,
      fullName: emp.fullName,
      workEmail: emp.workEmail,
      phone: emp.phone,
      department: emp.department,
      designation: emp.designation,
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}`, formData);
        alert('Employee updated successfully');
      } else {
        await api.post('/employees', formData);
        alert('Employee added successfully');
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      alert('Failed to save employee: ' + err.message);
    }
  };

  const toggleActive = async (emp) => {
    try {
      await api.patch(`/employees/${emp.id}/status`);
      fetchEmployees();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div>
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
            Staff & Employee Directory
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94A3B8' }}>
            Maintain machine shop workforce, metrology inspectors, and sales engineers.
          </p>
        </div>

        <button onClick={openCreateModal} className="admin-btn-primary">
          <Plus size={16} />
          <span>Add New Employee</span>
        </button>
      </div>

      <div className="admin-card-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} className="admin-filters-bar" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="admin-select-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              <option value="CNC Production">CNC Production</option>
              <option value="Quality Assurance">Quality Assurance (QA)</option>
              <option value="Sales & Estimation">Sales & RFQ Estimation</option>
              <option value="Operations & Management">Operations & Management</option>
              <option value="Executive Administration">Executive Administration</option>
            </select>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search code, name, designation..."
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
            Total <strong>{employees.length}</strong> employees listed
          </div>
        </form>
      </div>

      <div className="admin-card-panel">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Full Name</th>
                <th>Department & Designation</th>
                <th>Work Contact</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    Loading employee records...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#38BDF8', fontSize: '0.84rem' }}>
                        {emp.employeeCode}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#F1F5F9' }}>{emp.designation}</div>
                      <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>{emp.department}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>{emp.workEmail}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{emp.phone}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                      {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleActive(emp)}
                        style={{
                          background: emp.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: `1px solid ${emp.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          color: emp.isActive ? '#34D399' : '#F87171',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}
                      >
                        {emp.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => openEditModal(emp)}
                        className="admin-btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingEmployee ? 'Edit Employee Profile' : 'Add New Employee'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Employee Code *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      placeholder="e.g. EMP-005"
                      value={formData.employeeCode}
                      onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                      disabled={Boolean(editingEmployee)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      placeholder="e.g. Bhavin K. Shah"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                      placeholder="bhavin@hextron-demo.internal"
                      value={formData.workEmail}
                      onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Phone Number *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      placeholder="+91 9825012345"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Department *</label>
                    <select
                      className="admin-form-select"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="CNC Production">CNC Production</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                      <option value="Sales & Estimation">Sales & RFQ Estimation</option>
                      <option value="Operations & Management">Operations & Management</option>
                      <option value="Executive Administration">Executive Administration</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Designation / Role Title *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      placeholder="e.g. Senior CNC Lathe Setter"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Joining Date</label>
                  <input
                    type="date"
                    className="admin-form-input"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  <span>{editingEmployee ? 'Save Profile' : 'Add Employee'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
