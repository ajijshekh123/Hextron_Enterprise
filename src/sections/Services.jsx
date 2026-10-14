import React from 'react';
import SectionHeading from '../components/SectionHeading';
import ServiceCard from '../components/ServiceCard';
import { services } from '../data/services';

export default function Services({ onSelectService }) {
  const handleEnquire = (service) => {
    if (onSelectService) {
      onSelectService(service.title);
    }
    const el = document.getElementById('quote');
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
    <section id="services" className="section-wrapper">
      <div className="container">
        <SectionHeading
          eyebrow="Our Machining Services"
          title="Precision CNC Turning Solutions"
          subtitle="From prototype trials to repeat batches, we deliver cylindrical turned components manufactured to exacting specifications."
        />

        <div className="services-grid">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEnquire={handleEnquire}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
