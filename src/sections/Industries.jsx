import React from 'react';
import SectionHeading from '../components/SectionHeading';
import IndustryCard from '../components/IndustryCard';
import { industries, industryNote } from '../data/industries';
import { Info } from 'lucide-react';

export default function Industries() {
  return (
    <section id="industries" className="section-wrapper">
      <div className="container">
        <SectionHeading
          eyebrow="Target Sectors"
          title="Industries We Serve"
          subtitle="Engineered turned components tailored to the functional demands of diverse industrial equipment and machinery sectors."
        />

        <div className="industries-grid">
          {industries.map((ind) => (
            <IndustryCard key={ind.id} industry={ind} />
          ))}
        </div>

        <div
          style={{
            marginTop: '2.5rem',
            padding: '1rem 1.25rem',
            background: 'var(--bg-alt)',
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
          <span>{industryNote}</span>
        </div>
      </div>
    </section>
  );
}
