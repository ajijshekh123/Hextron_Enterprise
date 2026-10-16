import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  MessageCircle,
  ExternalLink,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import { companyInfo } from '../data/companyInfo';
import { api } from '../api/client';

export default function Contact() {
  const encodedAddress = encodeURIComponent(companyInfo.address.full);
  const whatsappUrl = `https://wa.me/${companyInfo.whatsappNumber}?text=${encodeURIComponent(companyInfo.whatsappMessage)}`;

  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Please enter your full name';
    if (!formData.email.trim()) {
      errs.email = 'Please provide an email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Please provide a valid phone number';
    } else if (!/^[+0-9\s-]{8,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid contact phone number';
    }
    if (!formData.subject.trim()) errs.subject = 'Please specify the subject or component scope';
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Please provide at least 10 characters describing your inquiry';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const res = await api.post('/enquiries/public', formData);
      setSubmitSuccess({
        message: res.message || 'Thank you! Your enquiry has been received.',
        timestamp: res.data?.timestamp || new Date().toISOString()
      });
      setFormData({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit enquiry. Please try again or reach out on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-wrapper">
      <div className="container">
        <SectionHeading
          eyebrow="Contact & Location"
          title="Get in Touch With Us"
          subtitle="Reach out to discuss drawings, request technical consultation, or visit our machining facility in Behrampura, Ahmedabad."
        />

        {/* Contact Submission & Channels Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem'
        }}>
          {/* Left Column: Direct Interactive Inquiry Form */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.4rem', color: 'var(--color-text-main)' }}>
                Send Technical Enquiry
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Directly submitted to our technical estimating engineers in Behrampura.
              </p>
            </div>

            {/* Success Feedback Alert */}
            {submitSuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                color: '#34D399',
                fontSize: '0.86rem'
              }}>
                <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Enquiry Submitted Successfully!</strong>
                  <div style={{ marginTop: '0.2rem', color: '#E2E8F0' }}>{submitSuccess.message}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.4rem' }}>
                    Reference Timestamp: {new Date(submitSuccess.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {submitError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                color: '#F87171',
                fontSize: '0.86rem'
              }}>
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{submitError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="contact-name" className="form-label">
                    Your Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    className="form-input"
                    placeholder="e.g. Arvind Mehta"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && <span className="form-error-msg">{errors.name}</span>}
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="contact-company" className="form-label">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="contact-company"
                    name="companyName"
                    className="form-input"
                    placeholder="e.g. Mehta Gears Pvt Ltd"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="contact-email" className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    className="form-input"
                    placeholder="arvind@mehtagears.in"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <span className="form-error-msg">{errors.email}</span>}
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="contact-phone" className="form-label">
                    Phone / Mobile <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contact-phone"
                    name="phone"
                    className="form-input"
                    placeholder="+91 9825598765"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                  {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="contact-subject" className="form-label">
                  Subject / Requirement Scope <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="contact-subject"
                  name="subject"
                  className="form-input"
                  placeholder="e.g. CNC turning job work for 2000 pcs monthly batch"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
                {errors.subject && <span className="form-error-msg">{errors.subject}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="contact-message" className="form-label">
                  Detailed Message / Job Details <span className="required">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  className="form-textarea"
                  rows={4}
                  placeholder="Describe dimensions, tolerance requirements, material, or request a workshop visit..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
                {errors.message && <span className="form-error-msg">{errors.message}</span>}
              </div>

              <button
                type="submit"
                className="btn-submit-quote"
                disabled={isSubmitting}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Submitting Enquiry...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Submit Enquiry Directly</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Direct Contact Channels & WhatsApp */}
          <div className="contact-info-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                <div className="contact-channel-sub">Click to initiate direct call</div>
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
                <div className="contact-channel-val" style={{ fontSize: '0.92rem' }}>
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
              style={{ marginTop: 'auto' }}
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
        </div>

        {/* Google Maps Interactive Frame */}
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
    </section>
  );
}
