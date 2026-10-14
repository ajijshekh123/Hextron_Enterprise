import React from 'react';
import {
  Target,
  SlidersHorizontal,
  ShieldCheck,
  Layers2,
  MessageSquareText,
  Clock
} from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import { whyChooseUs } from '../data/companyInfo';

const iconMap = {
  Target,
  SlidersHorizontal,
  ShieldCheck,
  Layers2,
  MessageSquareText,
  Clock
};

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="section-wrapper bg-dark">
      <div className="container">
        <SectionHeading
          eyebrow="Why Partner With Us"
          title="Engineered for Precision & Dependability"
          subtitle="A disciplined manufacturing approach focused on technical integrity, dimensional accuracy, and transparent collaboration."
          isDark={true}
        />

        <div className="why-us-grid">
          {whyChooseUs.map((item) => {
            const Icon = iconMap[item.icon] || Target;
            return (
              <div key={item.id} className="why-us-card">
                <div className="why-us-icon-box">
                  <Icon size={24} />
                </div>
                <div className="why-us-tag">{item.tag}</div>
                <h3 className="why-us-title">{item.title}</h3>
                <p className="why-us-desc">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
