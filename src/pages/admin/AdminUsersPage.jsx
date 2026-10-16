import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Plus, Key, X, Check, AlertCircle, UserX, UserCheck } from 'lucide-react';
import '../../styles/admin.css';

export default function AdminUsersPage() {
  const { user: currentAuthUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create User Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    role: 'SALES',
    employeeId: ''
  });

  // Reset Password Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || []);
    } catch (err) {
      alert('Error fetching users: ' + err.message);
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
    fetchUsers();
    fetchEmployees();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', createForm);
      setIsCreateModalOpen(false);
      setCreateForm({ email: '', password: '', role: 'SALES', employeeId: '' });
      fetchUsers();
      alert('User account created successfully');
    } catch (err) {
      alert('Failed to create user: ' + err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    }
  };

  const toggleUserActive = async (u) => {
    if (u.id === currentAuthUser?.id) {
      alert('You cannot deactivate your own active session account.');
      return;
    }

    try {
      await api.put(`/users/${u.id}`, { isActive: !u.isActive });
      fetchUsers();
    } catch (err) {
      alert('Failed to change user status: ' + err.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!targetUser || !newPassword) return;

    try {
      await api.post(`/users/${targetUser.id}/reset-password`, { newPassword });
      setIsResetModalOpen(false);
      setNewPassword('');
      alert(`Password reset successfully for ${targetUser.email}`);
    } catch (err) {
      alert('Password reset failed: ' + err.message);
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
            User Accounts & Role Permissions
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94A3B8' }}>
            Manage staff credentials, role-based access levels (ADMIN, SALES, EMPLOYEE), and account security.
          </p>
        </div>

        <button onClick={() => setIsCreateModalOpen(true)} className="admin-btn-primary">
          <Plus size={16} />
          <span>Create User Account</span>
        </button>
      </div>

      <div className="admin-card-panel">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email / User</th>
                <th>Linked Employee Profile</th>
                <th>System Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    Loading user accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    No user accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.email}</div>
                      {u.id === currentAuthUser?.id && (
                        <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 700 }}>
                          (CURRENT SESSION)
                        </span>
                      )}
                    </td>
                    <td>
                      {u.employee ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>{u.employee.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                            {u.employee.employeeCode} • {u.employee.designation}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#64748B', fontSize: '0.82rem' }}>No employee link</span>
                      )}
                    </td>
                    <td>
                      <select
                        className="admin-form-select"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.id === currentAuthUser?.id}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="SALES">SALES</option>
                        <option value="EMPLOYEE">EMPLOYEE</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleUserActive(u)}
                        disabled={u.id === currentAuthUser?.id}
                        style={{
                          background: u.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: `1px solid ${u.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          color: u.isActive ? '#34D399' : '#F87171',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          cursor: u.id === currentAuthUser?.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}
                      >
                        {u.isActive ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never logged in'}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setTargetUser(u);
                          setIsResetModalOpen(true);
                        }}
                        className="admin-btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                      >
                        <Key size={13} />
                        <span>Reset Pass</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create User */}
      {isCreateModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Create Staff User Account</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Login Email Address *</label>
                  <input
                    type="email"
                    className="admin-form-input"
                    required
                    placeholder="user@hextron-demo.internal"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Initial Password (Min 8 characters) *</label>
                  <input
                    type="password"
                    className="admin-form-input"
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Role Privilege *</label>
                    <select
                      className="admin-form-select"
                      required
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    >
                      <option value="SALES">SALES (Quotations & Inquiries)</option>
                      <option value="ADMIN">ADMIN (Complete Administrative Access)</option>
                      <option value="EMPLOYEE">EMPLOYEE (Restricted Work View)</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Link to Employee Profile (Optional)</label>
                    <select
                      className="admin-form-select"
                      value={createForm.employeeId}
                      onChange={(e) => setCreateForm({ ...createForm, employeeId: e.target.value })}
                    >
                      <option value="">None / External</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} ({emp.employeeCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {isResetModalOpen && targetUser && (
        <div className="admin-modal-overlay" onClick={() => setIsResetModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Reset Password: {targetUser.email}</h3>
              <button
                onClick={() => setIsResetModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="admin-modal-body">
                <p style={{ fontSize: '0.86rem', color: '#94A3B8', marginTop: 0 }}>
                  Enter a new secure password for this user. The password will be hashed using bcrypt before storage.
                </p>

                <div className="admin-form-group">
                  <label>New Password (Min 8 characters) *</label>
                  <input
                    type="password"
                    className="admin-form-input"
                    required
                    minLength={8}
                    placeholder="New password..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsResetModalOpen(false)} className="admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  <span>Save New Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
