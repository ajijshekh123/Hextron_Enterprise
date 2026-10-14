import React, { useState } from 'react';
import { ZoomIn, X, Info } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import { galleryCategories, galleryItems, galleryDisclaimer } from '../data/gallery';

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <section id="showcase" className="section-wrapper bg-alt">
      <div className="container">
        <SectionHeading
          eyebrow="Manufacturing Showcase"
          title="Turned Components & Machining Portfolio"
          subtitle="Explore visual demonstrations of CNC turned geometry, precision threads, metrology, and cylindrical parts."
        />

        {/* Category Filters */}
        <div className="gallery-filters" role="tablist" aria-label="Showcase categories">
          {galleryCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              className={`gallery-filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Cards Grid */}
        <div className="gallery-grid">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="gallery-card"
              onClick={() => setSelectedItem(item)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedItem(item);
                }
              }}
              aria-label={`View enlarged image: ${item.title}`}
            >
              <div className="gallery-image-box">
                <img
                  src={item.image}
                  alt={item.title}
                  className="gallery-img"
                  loading="lazy"
                  width="400"
                  height="240"
                />
                <div className="gallery-overlay">
                  <span className="gallery-zoom-badge">
                    <ZoomIn size={16} />
                    <span>Enlarge Inspection</span>
                  </span>
                </div>
              </div>

              <div className="gallery-content">
                <div className="gallery-badge-row">
                  <span className="gallery-category-text">{item.category}</span>
                  <span className="badge badge-dark" style={{ fontSize: '0.7rem' }}>
                    {item.tag}
                  </span>
                </div>
                <h3 className="gallery-title">{item.title}</h3>
                <p className="gallery-caption">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transparency Disclaimer Note */}
        <div
          style={{
            marginTop: '2.5rem',
            padding: '1rem 1.25rem',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.84rem',
            color: 'var(--color-text-muted)'
          }}
        >
          <Info size={18} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
          <span>{galleryDisclaimer}</span>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="lightbox-modal"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setSelectedItem(null)}
              aria-label="Close image preview"
            >
              <X size={22} />
            </button>

            <img
              src={selectedItem.image}
              alt={selectedItem.title}
              className="lightbox-img"
            />

            <div className="lightbox-info">
              <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>
                {selectedItem.category} • {selectedItem.highlight}
              </span>
              <h3>{selectedItem.title}</h3>
              <p>{selectedItem.caption}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
