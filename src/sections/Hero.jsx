import React from 'react';
import {
  ArrowRight,
  Crosshair,
  ShieldCheck,
  Clock,
  Layers,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { companyInfo } from '../data/companyInfo';
import { materials } from '../data/materials';

export default function Hero() {
  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Messaging & CTAs */}
          <div className="hero-content">
            <div className="hero-badge-wrap">
              <span className="hero-badge">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-secondary)' }}></span>
                CNC Turning Job Work Specialist
              </span>
              <span className="hero-location-badge">
                <MapPin size={14} style={{ color: 'var(--color-secondary-light)' }} />
                Behrampura, Ahmedabad
              </span>
            </div>

            <h1 className="hero-title">
              Precision Turned.
              <span className="highlight">Performance Assured.</span>
            </h1>

            <p className="hero-subtitle">
              {companyInfo.supportingTagline}
            </p>

            <p className="hero-description">
              Hextron Enterprises specializes in CNC turning job work and custom precision turned components manufactured strictly according to your engineering drawings, CAD models, and physical samples.
            </p>

            <div className="hero-cta-group">
              <a
                href="#quote"
                className="btn-primary-hero"
                onClick={(e) => handleScrollTo(e, 'quote')}
              >
                <span>Request a Quote</span>
                <ArrowRight size={18} />
              </a>

              <a
                href="#services"
                className="btn-secondary-hero"
                onClick={(e) => handleScrollTo(e, 'services')}
              >
                <span>Explore Our Services</span>
              </a>
            </div>

            {/* Three Value Propositions */}
            <div className="hero-pillars">
              <div className="pillar-item">
                <div className="pillar-icon-box">
                  <Crosshair size={20} />
                </div>
                <div className="pillar-text">
                  <h4>High Precision</h4>
                  <p>Tight dimensional tolerances & smooth surface finishes</p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon-box">
                  <ShieldCheck size={20} />
                </div>
                <div className="pillar-text">
                  <h4>Consistent Quality</h4>
                  <p>100% inspection for dimensional accuracy & fit</p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon-box">
                  <Clock size={20} />
                </div>
                <div className="pillar-text">
                  <h4>On-Time Delivery</h4>
                  <p>Disciplined batch scheduling and dependable dispatch</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Frame with Supplied Banner */}
          <div className="hero-visual-frame">
            <img
              src="/images/banner.png"
              alt="Hextron Enterprises CNC Turning Machining Banner"
              className="hero-banner-img"
              width="1086"
              height="362"
              loading="eager"
            />
            <div className="hero-floating-tag">
              <div className="floating-tag-item">
                <CheckCircle2 size={16} />
                <span>100% Dimensional Inspection</span>
              </div>
              <div className="floating-tag-item">
                <Layers size={16} />
                <span>Drawing & Sample Based</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Materials Quick Bar */}
      <div className="hero-material-strip">
        <div className="container">
          <div className="material-strip-inner">
            <span className="material-strip-label">
              <Layers size={14} />
              Machining Materials:
            </span>
            <div className="material-chip-list">
              {materials.map((m) => (
                <span key={m.id} className="material-chip">
                  <span></span>
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
