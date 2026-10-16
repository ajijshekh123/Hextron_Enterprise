import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Image as ImageIcon
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    material: 'Mild Steel (MS)',
    specifications: '',
    imageUrl: '/images/gallery/gallery-1.jpg',
    isActive: true,
    isPublic: true
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        category: selectedCategory,
        search: searchQuery
      });
      const res = await api.get(`/products/admin/all?${query.toString()}`);
      setProducts(res.data.products || []);
    } catch (err) {
      alert('Error fetching products: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/admin');
      setCategories(res.data.categories || []);
    } catch (err) {
      console.warn('Could not load categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      material: 'Mild Steel (MS)',
      specifications: '{\n  "Diameter": "Dia 25mm to 50mm",\n  "Tolerance": "± 0.010 mm",\n  "Surface Finish": "Ra 0.4 µm Ground"\n}',
      imageUrl: '/images/gallery/gallery-1.jpg',
      isActive: true,
      isPublic: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      description: p.description,
      categoryId: p.categoryId,
      material: p.material,
      specifications: typeof p.specifications === 'string' ? p.specifications : JSON.stringify(p.specifications, null, 2),
      imageUrl: p.imageUrl || '/images/gallery/gallery-1.jpg',
      isActive: p.isActive,
      isPublic: p.isPublic
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
        alert('Product updated successfully');
      } else {
        await api.post('/products', formData);
        alert('Product created successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert('Failed to save product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product: ' + err.message);
    }
  };

  const togglePublic = async (p) => {
    try {
      await api.put(`/products/${p.id}`, { isPublic: !p.isPublic });
      fetchProducts();
    } catch (err) {
      alert('Failed to toggle public visibility: ' + err.message);
    }
  };

  const toggleActive = async (p) => {
    try {
      await api.put(`/products/${p.id}`, { isActive: !p.isActive });
      fetchProducts();
    } catch (err) {
      alert('Failed to toggle active status: ' + err.message);
    }
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
            Product Catalog Management
          </h2>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#94A3B8' }}>
            Maintain standard turned parts, hydraulic fittings, bushes, and specifications.
          </p>
        </div>

        <button onClick={openCreateModal} className="admin-btn-primary">
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} className="admin-filters-bar" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="admin-select-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search SKU, name, material..."
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
            Total <strong>{products.length}</strong> items in database
          </div>
        </form>
      </div>

      {/* Products Table */}
      <div className="admin-card-panel">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Material</th>
                <th>Status</th>
                <th>Public Site</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.imageUrl || '/images/gallery/gallery-1.jpg'}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                      />
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#38BDF8', fontSize: '0.84rem' }}>
                        {p.sku}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.76rem', color: '#94A3B8', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.description}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {p.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.84rem' }}>{p.material}</td>
                    <td>
                      <button
                        onClick={() => toggleActive(p)}
                        style={{
                          background: p.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: `1px solid ${p.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                          color: p.isActive ? '#34D399' : '#F87171',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}
                      >
                        {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => togglePublic(p)}
                        style={{
                          background: p.isPublic ? 'rgba(56, 189, 248, 0.15)' : 'rgba(100, 116, 139, 0.2)',
                          border: `1px solid ${p.isPublic ? 'rgba(56, 189, 248, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
                          color: p.isPublic ? '#38BDF8' : '#94A3B8',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {p.isPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{p.isPublic ? 'VISIBLE' : 'HIDDEN'}</span>
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => openEditModal(p)}
                          className="admin-btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-card large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Machined Product'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>SKU / Part Code *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      placeholder="e.g. HEX-SFT-007"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      placeholder="e.g. Precision Stepped Drive Shaft"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Category *</label>
                    <select
                      className="admin-form-select"
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Material Specification *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      required
                      placeholder="e.g. EN24 Alloy Steel / SS 316"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Description *</label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea"
                    required
                    placeholder="Provide engineering scope, turning details, surface finish, tolerance specs..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Image URL</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="/images/gallery/gallery-1.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Visibility Controls</label>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.65rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#F8FAFC' }}>
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <span>Active</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#F8FAFC' }}>
                        <input
                          type="checkbox"
                          checked={formData.isPublic}
                          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                        />
                        <span>Visible on Public Website</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Technical Specifications (JSON or key-value text)</label>
                  <textarea
                    rows={4}
                    className="admin-form-textarea"
                    style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                    placeholder='{"Tolerance": "±0.010 mm", "Surface Roughness": "Ra 0.4 µm"}'
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
