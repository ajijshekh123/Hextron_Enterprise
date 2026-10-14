import React from 'react';
import {
  DraftingCompass,
  Gauge,
  CheckCircle,
  Users2,
  Truck,
  ShieldCheck
} from 'lucide-react';
import SectionHeading from '../components/SectionHeading';

const aboutHighlights = [
  {
    icon: DraftingCompass,
    title: 'Drawing & Sample-Based',
    desc: 'Components turned strictly from customer 2D prints, 3D CAD files, or physical reference samples.'
  },
  {
    icon: Gauge,
    title: 'Focus on Dimensional Accuracy',
    desc: 'Strict adherence to specified concentricity, bore fits, thread profiles, and surface finishes.'
  },
  {
    icon: ShieldCheck,
    title: 'Quality-Conscious Production',
    desc: 'In-process verification using calibrated micrometers and gauges at every machining setup.'
  },
  {
    icon: Users2,
    title: 'Customer-Specific Requirements',
    desc: 'Tailored tooling setups and batch volumes customized to each client’s assembly requirements.'
  },
  {
    icon: Truck,
    title: 'Delivery Coordination',
    desc: 'Organized production scheduling with realistic lead-times and proactive dispatch planning.'
  },
  {
    icon: CheckCircle,
    title: 'Direct Technical Access',
    desc: 'Clear communication with decision-makers for prompt drawing reviews and revisions.'
  }
];

export default function About() {
  return (
    <section id="about" className="section-wrapper bg-alt">
      <div className="container">
        <SectionHeading
          eyebrow="About Hextron Enterprises"
          title="Engineering Precision. Building Trust."
          subtitle="A dedicated CNC turning job work and precision components partner based in Ahmedabad, Gujarat."
        />

        <div className="about-grid">
          {/* Content Column */}
          <div className="about-content">
            <p className="about-lead">
              Hextron Enterprises provides reliable CNC turning job work and precision turned components designed to integrate seamlessly into your assemblies.
            </p>

            <p className="about-text">
              We specialize in turning cylindrical metal components from bar stock according to custom drawings and physical samples. We understand that in precision engineering, a minor deviation in bore diameter, thread pitch, or concentricity can halt an entire production line. That is why our operation is centered around meticulous process control, careful tool selection, and vigilant inspection.
            </p>

            <p className="about-text">
              Whether you need pilot prototypes to validate a new assembly, recurring job work batches, or specialized turning in mild steel, stainless steel, brass, aluminium, or engineering steels, Hextron Enterprises offers attentive technical collaboration and disciplined execution.
            </p>

            <div className="about-features-list">
              {aboutHighlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="about-feature-card">
                    <div className="about-feature-icon">
                      <Icon size={20} />
                    </div>
                    <div className="about-feature-text">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Column */}
          <div className="about-visual-column">
            <div className="about-image-card">
              <img
                src="/images/gallery/gallery-4.jpg"
                alt="Precision machined components on engineering blueprint"
                className="about-main-img"
                width="600"
                height="450"
                loading="lazy"
              />
            </div>

            <div className="about-floating-stat">
              <div className="stat-number">100%</div>
              <div className="stat-label">
                Dimensional Inspection commitment on critical customer parameters
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
