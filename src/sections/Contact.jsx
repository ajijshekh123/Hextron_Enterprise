import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  MessageCircle,
  ExternalLink,
  Clock,
  ShieldCheck
} from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import { companyInfo } from '../data/companyInfo';

export default function Contact() {
  const encodedAddress = encodeURIComponent(companyInfo.address.full);
  const whatsappUrl = `https://wa.me/${companyInfo.whatsappNumber}?text=${encodeURIComponent(companyInfo.whatsappMessage)}`;

  return (
    <section id="contact" className="section-wrapper">
      <div className="container">
        <SectionHeading
          eyebrow="Contact & Location"
          title="Get in Touch With Us"
          subtitle="Reach out to discuss drawings, request technical consultation, or visit our machining facility in Behrampura, Ahmedabad."
        />

        <div className="contact-grid">
          {/* Left: Contact Channels */}
          <div className="contact-info-panel">
            {/* Phone */}
            <a
              href={`tel:${companyInfo.phoneRaw}`}
              className="contact-channel-card"
              aria-label={`Call ${companyInfo.phone}`}
            >
              <div className="contact-channel-icon">
                <Phone size={22} />
              </div>
              <div className="contact-channel-text">
                <h4>Telephone / Direct Call</h4>
                <div className="contact-channel-val">{companyInfo.phone}</div>
                <div className="contact-channel-sub">Click to initiate call</div>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${companyInfo.email}`}
              className="contact-channel-card"
              aria-label={`Email ${companyInfo.email}`}
            >
              <div className="contact-channel-icon">
                <Mail size={22} />
              </div>
              <div className="contact-channel-text">
                <h4>Official Email Address</h4>
                <div className="contact-channel-val">{companyInfo.email}</div>
                <div className="contact-channel-sub">Send drawings & CAD specifications</div>
              </div>
            </a>

            {/* Website */}
            <a
              href={companyInfo.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-channel-card"
            >
              <div className="contact-channel-icon">
                <Globe size={22} />
              </div>
              <div className="contact-channel-text">
                <h4>Official Website</h4>
                <div className="contact-channel-val">{companyInfo.websiteDisplay}</div>
                <div className="contact-channel-sub">www.hextronenterprise.com</div>
              </div>
            </a>

            {/* Physical Works Address */}
            <a
              href={companyInfo.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-channel-card"
            >
              <div className="contact-channel-icon">
                <MapPin size={22} />
              </div>
              <div className="contact-channel-text">
                <h4>Works & Facility Address</h4>
                <div className="contact-channel-val" style={{ fontSize: '0.94rem' }}>
                  {companyInfo.address.line1}, {companyInfo.address.line2}, {companyInfo.address.line3}, {companyInfo.address.city} - {companyInfo.address.pincode}, {companyInfo.address.state}, India.
                </div>
                <div className="contact-channel-sub">Open in Google Maps</div>
              </div>
            </a>

            {/* WhatsApp Direct Action Banner */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-action-card"
            >
              <div className="whatsapp-action-left">
                <div className="whatsapp-icon-box">
                  <MessageCircle size={26} />
                </div>
                <div className="whatsapp-action-text">
                  <h4>Chat Directly on WhatsApp</h4>
                  <p>Send samples, drawings, or RFQs for quick response: +91 9879964414</p>
                </div>
              </div>
              <ExternalLink size={20} style={{ color: '#A7F3D0', flexShrink: 0 }} />
            </a>
          </div>

          {/* Right: Google Maps Interactive Frame */}
          <div className="map-frame-wrapper">
            <div className="map-header">
              <h4>
                <MapPin size={18} style={{ color: 'var(--color-secondary)' }} />
                <span>Facility Location • Behrampura, Ahmedabad</span>
              </h4>
              <a
                href={companyInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>View Full Map</span> &rarr;
              </a>
            </div>

            <div className="map-embed-container">
              <iframe
                title="Hextron Enterprises Location Map"
                src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div
              style={{
                padding: '1rem 1.25rem',
                background: '#FFFFFF',
                fontSize: '0.84rem',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem'
              }}
            >
              <Clock size={16} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
              <span>
                <strong>Operating Schedule:</strong> Monday – Saturday | Prior appointment recommended for drawing reviews and sample evaluations.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
