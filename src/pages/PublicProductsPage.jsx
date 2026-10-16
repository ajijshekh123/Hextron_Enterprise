import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SectionHeading from '../components/SectionHeading';
import {
  Search,
  Filter,
  ArrowRight,
  FileText,
  Sliders,
  ShieldCheck,
  CheckCircle,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import '../styles/sections.css';

export default function PublicProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get(`/products?category=${selectedCategory}&material=${selectedMaterial}&search=${searchQuery}`),
          api.get('/categories')
        ]);
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.warn('Could not load public products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, selectedMaterial, searchQuery]);

  const handleRequestQuote = (prod) => {
    const params = new URLSearchParams({
      component: prod.name,
      material: prod.material,
      sku: prod.sku,
      category: prod.category?.name || ''
    });
    navigate(`/quote?${params.toString()}`);
  };

  const parseSpecs = (specs) => {
    if (!specs) return null;
    if (typeof specs === 'object') return specs;
    try {
      return JSON.parse(specs);
    } catch {
      return null;
    }
  };

  return (
    <div className="site-root">
      <Header />

      <main style={{ paddingTop: '100px', minHeight: '80vh', background: 'var(--color-bg)' }}>
        <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
          {/* Page Banner */}
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(0, 102, 255, 0.1)',
              border: '1px solid rgba(0, 102, 255, 0.25)',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--color-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem'
            }}>
              <Package size={15} />
              <span>Engineered Component Catalog</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: 'var(--color-text-main)',
              letterSpacing: '-0.02em',
              margin: '0 0 1rem'
            }}>
              Precision CNC Turned Components
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
              Explore our active production range of shafts, hydraulic fittings, bronze bushings, poppet valves, and electrical pins machined to strict drawing tolerances in Ahmedabad.
            </p>
          </div>

          {/* Filter & Search Controls */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: selectedCategory === 'ALL' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: selectedCategory === 'ALL' ? 'var(--color-primary)' : 'transparent',
                  color: selectedCategory === 'ALL' ? '#FFFFFF' : 'var(--color-text-muted)'
                }}
              >
                All Components
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug || cat.id)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '999px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: (selectedCategory === cat.slug || selectedCategory === cat.id)
                      ? '1px solid var(--color-primary)'
                      : '1px solid var(--color-border)',
                    background: (selectedCategory === cat.slug || selectedCategory === cat.id)
                      ? 'var(--color-primary)'
                      : 'transparent',
                    color: (selectedCategory === cat.slug || selectedCategory === cat.id)
                      ? '#FFFFFF'
                      : 'var(--color-text-muted)'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Input & Material Select */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by component name, SKU (e.g. HEX-SFT-001), or material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                    color: 'var(--color-text-main)',
                    fontSize: '0.88rem'
                  }}
                />
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)'
                  }}
                />
              </div>

              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '0.65rem 1rem',
                  color: 'var(--color-text-main)',
                  fontSize: '0.88rem',
                  minWidth: '180px'
                }}
              >
                <option value="ALL">All Materials</option>
                <option value="Steel">Alloy & Carbon Steel</option>
                <option value="Stainless">Stainless Steel (304/316)</option>
                <option value="Brass">Brass (IS 319)</option>
                <option value="Bronze">Phosphor Bronze</option>
                <option value="Aluminium">Aluminium Alloys</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-text-muted)' }}>
              <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                <Package size={32} style={{ color: 'var(--color-secondary)' }} />
              </div>
              <div>Loading precision components...</div>
            </div>
          ) : products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'var(--color-surface)',
              borderRadius: '12px',
              border: '1px solid var(--color-border)'
            }}>
              <Package size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-main)', margin: '0 0 0.5rem' }}>
                No Components Found
              </h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
                We could not find any active products matching your search criteria. You can request a custom job work quote directly.
              </p>
              <Link to="/quote" className="btn-primary">
                <span>Request Custom Quote</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem'
            }}>
              {products.map((prod) => {
                const specsObj = parseSpecs(prod.specifications);
                return (
                  <div
                    key={prod.id}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                  >
                    {/* Component Image */}
                    <div style={{ height: '210px', background: '#0B1120', position: 'relative', overflow: 'hidden' }}>
                      <img
                        src={prod.imageUrl || '/images/gallery/gallery-1.jpg'}
                        alt={prod.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '0.85rem',
                        left: '0.85rem',
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        color: '#38BDF8',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em'
                      }}>
                        {prod.sku}
                      </div>

                      <div style={{
                        position: 'absolute',
                        top: '0.85rem',
                        right: '0.85rem',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: '#E2E8F0',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        {prod.category?.name || 'Turned Part'}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--color-text-main)' }}>
                        {prod.name}
                      </h3>

                      <div style={{
                        fontSize: '0.82rem',
                        color: 'var(--color-secondary)',
                        fontWeight: 600,
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <span>Material:</span>
                        <span style={{ color: 'var(--color-text-main)' }}>{prod.material}</span>
                      </div>

                      <p style={{
                        fontSize: '0.88rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.5,
                        margin: '0 0 1.25rem',
                        flex: 1
                      }}>
                        {prod.description}
                      </p>

                      {/* Specifications Summary */}
                      {specsObj && (
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '6px',
                          padding: '0.75rem',
                          marginBottom: '1.25rem',
                          fontSize: '0.78rem'
                        }}>
                          {Object.entries(specsObj).slice(0, 3).map(([key, val]) => (
                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                              <span style={{ color: 'var(--color-text-muted)' }}>{key}:</span>
                              <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Request Quote Button */}
                      <button
                        type="button"
                        onClick={() => handleRequestQuote(prod)}
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 1rem' }}
                      >
                        <FileText size={16} />
                        <span>Request a Quote for this Part</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
