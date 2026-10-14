import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Phone, Mail } from 'lucide-react';
import { companyInfo } from '../data/companyInfo';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Materials', href: '#materials' },
  { label: 'Industries', href: '#industries' },
  { label: 'Why Choose Us', href: '#why-us' },
  { label: 'Showcase', href: '#showcase' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Track active section
      const sections = navItems.map(item => item.href.substring(1));
      const scrollPos = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
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
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container header-container">
          {/* Logo */}
          <a
            href="#home"
            className="brand-link"
            onClick={(e) => handleNavClick(e, '#home')}
            aria-label="Hextron Enterprises Homepage"
          >
            <img
              src="/images/logo-dark.png"
              alt="Hextron Enterprises - CNC Turning Job Work"
              className="brand-logo-img"
              width="180"
              height="48"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            <ul className="nav-links-list">
              {navItems.slice(0, 5).map((item) => {
                const sectionId = item.href.substring(1);
                const isActive = activeSection === sectionId;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      onClick={(e) => handleNavClick(e, item.href)}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
              <li>
                <a
                  href="#contact"
                  className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, '#contact')}
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          {/* Header Action Button */}
          <div className="header-actions">
            <a
              href="#quote"
              className="header-quote-btn"
              onClick={(e) => handleNavClick(e, '#quote')}
            >
              <span>Request a Quote</span>
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-expanded={mobileMenuOpen}
            aria-label="Open mobile menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-drawer-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer */}
      <div
        className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        <div className="mobile-drawer-header">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="brand-link"
          >
            <img
              src="/images/logo-dark.png"
              alt="Hextron Enterprises"
              style={{ height: '38px', width: 'auto' }}
            />
          </a>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close mobile menu"
          >
            <X size={22} />
          </button>
        </div>

        <ul className="mobile-nav-list">
          {navItems.map((item) => {
            const sectionId = item.href.substring(1);
            const isActive = activeSection === sectionId;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  <span>{item.label}</span>
                  <ArrowRight size={15} style={{ opacity: isActive ? 1 : 0.4 }} />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mobile-drawer-footer">
          <a
            href="#quote"
            className="mobile-cta-btn"
            onClick={(e) => handleNavClick(e, '#quote')}
          >
            <span>Request a Quote</span>
            <ArrowRight size={18} />
          </a>

          <div className="mobile-contact-quick">
            <a href={`tel:${companyInfo.phoneRaw}`}>
              <Phone size={14} />
              <span>{companyInfo.phone}</span>
            </a>
            <a href={`mailto:${companyInfo.email}`}>
              <Mail size={14} />
              <span>{companyInfo.email}</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
