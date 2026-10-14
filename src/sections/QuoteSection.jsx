import React from 'react';
import SectionHeading from '../components/SectionHeading';
import QuoteForm from '../components/QuoteForm';

export default function QuoteSection({ selectedService }) {
  return (
    <section id="quote-section" className="section-wrapper quote-section">
      <div className="container">
        <SectionHeading
          eyebrow="Quotation & Consultation"
          title="Request a Custom Machining Quote"
          subtitle="Submit your component specifications, material preference, or drawing files. Our technical team will review tolerances and provide an accurate quotation."
        />

        <QuoteForm preselectedService={selectedService} />
      </div>
    </section>
  );
}
