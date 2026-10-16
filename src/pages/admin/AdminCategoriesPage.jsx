import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Tags, Plus, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';
import '../../styles/admin.css';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    displayOrder: 1,
    isActive: true
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/categories/admin');
      setCategories(res.data.categories || []);
    } catch (err) {
      alert('Error fetching categories: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '/images/gallery/gallery-2.jpg',
      displayOrder: categories.length + 1,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      displayOrder: cat.displayOrder || 1,
      isActive: cat.isActive
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        alert('Category updated successfully');
      } else {
        await api.post('/categories', formData);
        alert('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert('Failed to save category: ' + err.message);
    }
  };

  const handleDelete = async (id, name, productCount) => {
    if (productCount > 0) {
      alert(`Cannot delete category "${name}": It has ${productCount} assigned products. Reassign or delete those products first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const toggleActive = async (cat) => {
    try {
      await api.patch(`/categories/${cat.id}/status`);
      fetchCategories();
    } catch (err) {
      alert('Failed to toggle status: ' + err.message);
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
            Part Categories
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94A3B8' }}>
            Classify turned parts for the public catalog and quotation estimation modules.
          </p>
        </div>

        <button onClick={openCreateModal} className="admin-btn-primary">
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="admin-card-panel">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Display Order</th>
                <th>Category Name</th>
                <th>Slug (URL)</th>
                <th>Assigned Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: '#38BDF8', width: '90px' }}>
                      #{c.displayOrder}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      {c.description && (
                        <div style={{ fontSize: '0.76rem', color: '#94A3B8', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#38BDF8' }}>
                        {c.slug}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#F8FAFC' }}>
                        {c._count?.products || 0}
                      </span>{' '}
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>parts</span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleActive(c)}
                        style={{
                          background: c.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: `1px solid ${c.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          color: c.isActive ? '#34D399' : '#F87171',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}
                      >
                        {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => openEditModal(c)}
                          className="admin-btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name, c._count?.products || 0)}
                          className="admin-btn-danger"
                        >
                          <Trash2 size={13} />
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

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Create Category'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    required
                    placeholder="e.g. Precision Shafts & Spindles"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>URL Slug (Optional)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="precision-shafts"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Display Sort Order</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 1 })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea"
                    placeholder="Describe typical applications, tolerances, components in this category..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Banner Image URL</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="/images/gallery/gallery-3.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
