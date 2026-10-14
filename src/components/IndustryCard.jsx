import React from 'react';
import { Car, Cog, Zap, Wrench, Factory } from 'lucide-react';

const iconMap = {
  Car,
  Cog,
  Zap,
  Wrench,
  Factory
};

export default function IndustryCard({ industry }) {
  const IconComponent = iconMap[industry.icon] || Cog;

  return (
    <div className="industry-card">
      <div className="industry-icon-wrap">
        <IconComponent size={26} />
      </div>

      <span className="badge badge-blue" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}>
        {industry.scope}
      </span>

      <h3 className="industry-title">{industry.title}</h3>
      <p className="industry-desc">{industry.summary}</p>

      <div className="industry-parts-box">
        <h5>Typical Turned Components</h5>
        <ul>
          {industry.typicalParts.map((part, idx) => (
            <li key={idx}>{part}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
