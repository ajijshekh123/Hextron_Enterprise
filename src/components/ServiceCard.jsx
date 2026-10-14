import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function ServiceCard({ service, onEnquire }) {
  const isCore = service.isVerified;

  return (
    <article className="service-card">
      <div className="service-img-wrap">
        <img
          src={service.image}
          alt={service.title}
          className="service-card-img"
          loading="lazy"
          width="400"
          height="200"
        />
        <div className="service-status-badge">
          <span className={`badge ${isCore ? 'badge-verified' : 'badge-amber'}`}>
            {service.badge}
          </span>
        </div>
      </div>

      <div className="service-body">
        <span className="service-category-tag">{service.category}</span>
        <h3 className="service-card-title">{service.title}</h3>
        <p className="service-card-desc">{service.description}</p>

        <ul className="service-deliverables-list" aria-label="Key Deliverables">
          {service.deliverables.map((item, idx) => (
            <li key={idx} className="deliverable-item">
              <CheckCircle2 size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="service-card-footer">
          <a
            href="#quote"
            className="service-enquiry-link"
            onClick={(e) => {
              if (onEnquire) {
                e.preventDefault();
                onEnquire(service);
              }
            }}
          >
            <span>Inquire About This Service</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </article>
  );
}
