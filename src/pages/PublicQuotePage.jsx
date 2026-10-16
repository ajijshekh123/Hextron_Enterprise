import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuoteForm from '../components/QuoteForm';
import SectionHeading from '../components/SectionHeading';
import { ShieldCheck, Clock, Award, FileSpreadsheet } from 'lucide-react';

export default function PublicQuotePage() {
  const [searchParams] = useSearchParams();
  const componentParam = searchParams.get('component') || '';
  const materialParam = searchParams.get('material') || '';
  const serviceParam = searchParams.get('service') || '';

  return (
    <div className="site-root">
      <Header />

      <main style={{ paddingTop: '100px', minHeight: '80vh', background: 'var(--color-bg)' }}>
        <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
          <SectionHeading
            eyebrow="Commercial Quotation & RFQ"
            title="Request Precision CNC Machining Quotation"
            subtitle="Submit your component specifications, 2D PDF drawings, or 3D STEP files for cycle time estimation and competitive batch pricing."
          />

          {/* Pre-fill Notice Banner if arriving from a Product Card */}
          {(componentParam || materialParam) && (
            <div style={{
              maxWidth: '820px',
              margin: '0 auto 1.5rem',
              background: 'rgba(0, 102, 255, 0.1)',
              border: '1px solid rgba(0, 102, 255, 0.3)',
              borderRadius: '8px',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--color-secondary)',
              fontSize: '0.88rem'
            }}>
              <FileSpreadsheet size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Component Pre-selected:</strong> {componentParam}{' '}
                {materialParam && <span>({materialParam})</span>}
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Fields below have been initialized with your chosen catalog component.
                </div>
              </div>
            </div>
          )}

          {/* Render the interactive QuoteForm */}
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <QuoteForm preselectedService={serviceParam || componentParam || 'CNC Turning Job Work'} />
          </div>

          {/* Assurance Badges */}
          <div style={{
            maxWidth: '820px',
            margin: '2.5rem auto 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <ShieldCheck size={22} style={{ color: 'var(--color-secondary)' }} />
              <div>
                <strong style={{ fontSize: '0.86rem', display: 'block', color: 'var(--color-text-main)' }}>
                  Strict NDA & IP Protection
                </strong>
                <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                  Drawings and proprietary CAD data kept confidential.
                </span>
              </div>
            </div>

            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Clock size={22} style={{ color: 'var(--color-secondary)' }} />
              <div>
                <strong style={{ fontSize: '0.86rem', display: 'block', color: 'var(--color-text-main)' }}>
                  Fast RFQ Turnaround
                </strong>
                <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                  Standard quotations estimated within 24 to 48 hours.
                </span>
              </div>
            </div>

            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Award size={22} style={{ color: 'var(--color-secondary)' }} />
              <div>
                <strong style={{ fontSize: '0.86rem', display: 'block', color: 'var(--color-text-main)' }}>
                  Quality Inspection Guaranteed
                </strong>
                <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                  100% dimensional checks with calibrated micrometers & gauges.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
