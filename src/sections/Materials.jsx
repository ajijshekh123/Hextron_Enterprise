import React from 'react';
import { Info, Check } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import { materials, materialDisclaimer } from '../data/materials';

export default function Materials() {
  return (
    <section id="materials" className="section-wrapper bg-alt">
      <div className="container">
        <SectionHeading
          eyebrow="Materials & Capabilities"
          title="Wide Range of Machining Materials"
          subtitle="Experienced in turning diverse ferrous, non-ferrous, and high-tensile alloys according to drawing requirements."
        />

        <div className="materials-grid">
          {materials.map((mat) => (
            <div key={mat.id} className="material-card">
              <div className="material-card-top">
                <div
                  className="material-symbol"
                  style={{
                    color: mat.colorAccent,
                    borderColor: `${mat.colorAccent}40`,
                    backgroundColor: `${mat.colorAccent}12`
                  }}
                >
                  {mat.symbol}
                </div>
                <span className="badge badge-verified">
                  <Check size={12} /> {mat.status}
                </span>
              </div>

              <h3>{mat.name}</h3>
              <div className="material-grades">{mat.gradeExamples}</div>

              <p className="material-desc">{mat.characteristics}</p>

              <div className="material-uses">
                <strong>Common Uses:</strong> {mat.commonUses}
              </div>
            </div>
          ))}
        </div>

        {/* Required Material & Tolerance Confirmation Note */}
        <div className="material-disclaimer-box">
          <Info size={24} style={{ color: 'var(--color-secondary)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4>{materialDisclaimer.title}</h4>
            <p>{materialDisclaimer.content}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
