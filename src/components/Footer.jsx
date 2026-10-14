import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  ArrowUp,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { companyInfo } from '../data/companyInfo';
import { services } from '../data/services';

function LinkedInIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="site-footer">
      {/* Top Value Strip */}
      <div className="footer-top-strip">
        <div className="container">
          <div className="footer-strip-grid">
            <div className="footer-strip-item">
              <CheckCircle2 size={18} />
              <span><strong>100% Dimensional Inspection</strong> for Accuracy</span>
            </div>
            <div className="footer-strip-item">
              <ShieldCheck size={18} />
              <span><strong>Customer Drawing & Sample-Based</strong> Machining</span>
            </div>
            <div className="footer-strip-item">
              <Clock size={18} />
              <span><strong>Disciplined Delivery Planning</strong> in Ahmedabad, Gujarat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1: Brand & Overview */}
            <div className="footer-col">
              <a
                href="#home"
                onClick={(e) => handleNavClick(e, '#home')}
                className="footer-logo-link"
                aria-label="Hextron Enterprises"
              >
                <img
                  src="/images/logo-dark.png"
                  alt="Hextron Enterprises"
                  className="footer-logo-img"
                  width="180"
                  height="48"
                />
              </a>
              <p className="footer-desc">
                Specialist in CNC turning job work and precision turned components manufactured strictly according to customer engineering drawings, CAD models, and physical samples.
              </p>
              <div className="footer-social-links">
                <a
                  href={companyInfo.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  aria-label="Hextron Enterprises on LinkedIn"
                >
                  <LinkedInIcon size={18} />
                </a>
                <a
                  href={companyInfo.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-btn"
                  aria-label="Hextron Enterprises on Instagram"
                >
                  <InstagramIcon size={18} />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="footer-col">
              <h4 className="footer-col-title">Navigation</h4>
              <ul className="footer-links-list">
                <li>
                  <a
                    href="#home"
                    className="footer-link"
                    onClick={(e) => handleNavClick(e, '#home')}
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="footer-link"
                    onClick={(e) => handleNavClick(e, '#about')}
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="footer-link"
                    onClick={(e) => handleNavClick(e, '#services')}
                  >
                    Machining Services
                  </a>
                </li>
                <li>
                  <a
                    href="#materials"
                    className="footer-link"
                    onClick={(e) => handleNavClick(e, '#materials')}
                  >
                    Materials & Capabilities
                  </a>
                </li>
                <li>
                  <a
                    href="#industries"
                    className="footer-link"
                    onClick={(e) => handleNavClick(e, '#industries')}
                  >
                    Target Industries
                  </a>
                </li>
                <li>
                  <a
                    href="#showcase"
                    className="footer-link"
                    onClick={(e) => handleNavClick(e, '#showcase')}
                  >
                    Component Showcase
                  </a>
                </li>
                <li>
                  <a
                    href="#quote"
                    className="footer-link"
                    onClick={(e) => handleNavClick(e, '#quote')}
                  >
                    Request a Quote
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Services */}
            <div className="footer-col">
              <h4 className="footer-col-title">Services</h4>
              <ul className="footer-links-list">
                {services.slice(0, 5).map((service) => (
                  <li key={service.id}>
                    <a
                      href="#services"
                      className="footer-link"
                      onClick={(e) => handleNavClick(e, '#services')}
                    >
                      {service.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Contact Information */}
            <div className="footer-col">
              <h4 className="footer-col-title">Works & Office</h4>
              <ul className="footer-contact-list">
                <li className="footer-contact-item">
                  <MapPin size={20} />
                  <span>
                    {companyInfo.address.line1},<br />
                    {companyInfo.address.line2},<br />
                    {companyInfo.address.line3},<br />
                    {companyInfo.address.city} - {companyInfo.address.pincode}, {companyInfo.address.state}, India.
                  </span>
                </li>
                <li className="footer-contact-item">
                  <Phone size={18} />
                  <a href={`tel:${companyInfo.phoneRaw}`}>
                    {companyInfo.phone}
                  </a>
                </li>
                <li className="footer-contact-item">
                  <Mail size={18} />
                  <a href={`mailto:${companyInfo.email}`}>
                    {companyInfo.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Back-to-Top Bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-flex">
            <p>
              &copy; {currentYear} {companyInfo.name}. All Rights Reserved. Precision CNC Turning Job Work Specialist.
            </p>
            <button
              type="button"
              onClick={scrollToTop}
              className="back-to-top-btn"
              aria-label="Back to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
