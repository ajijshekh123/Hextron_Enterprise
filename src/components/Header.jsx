import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Phone, Mail } from 'lucide-react';
import { companyInfo } from '../data/companyInfo';

const navItems = [
  { label: 'Home', href: '#home', path: '/' },
  { label: 'About', href: '#about', path: '/#about' },
  { label: 'Services', href: '#services', path: '/#services' },
  { label: 'Products', href: '/products', path: '/products', isRoute: true },
  { label: 'Materials', href: '#materials', path: '/#materials' },
  { label: 'Industries', href: '#industries', path: '/#industries' },
  { label: 'Contact', href: '#contact', path: '/#contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Track active section if on homepage
      if (window.location.pathname === '/') {
        const sections = navItems.filter(i => !i.isRoute).map(item => item.href.substring(1));
        const scrollPos = window.scrollY + 120;

        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i]);
          if (el && el.offsetTop <= scrollPos) {
            setActiveSection(sections[i]);
            break;
          }
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

  const handleNavClick = (e, item) => {
    setMobileMenuOpen(false);

    if (item.isRoute) {
      // Let standard browser link navigation or window.location handle it
      return;
    }

    if (window.location.pathname !== '/') {
      // If not on homepage, navigate to homepage with hash
      window.location.href = '/' + item.href;
      return;
    }

    e.preventDefault();
    const targetId = item.href.substring(1);
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
            href="/"
            className="brand-link"
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
              {navItems.map((item) => {
                const isActive = item.isRoute
                  ? window.location.pathname === item.path
                  : activeSection === item.href.substring(1);

                return (
                  <li key={item.href}>
                    <a
                      href={item.isRoute ? item.path : item.href}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      onClick={(e) => handleNavClick(e, item)}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Header Action Buttons */}
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <a
              href="/admin/dashboard"
              className="header-portal-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#38BDF8',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Admin Portal</span>
            </a>

            <a
              href="/quote"
              className="header-quote-btn"
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
            const isActive = item.isRoute
              ? window.location.pathname === item.path
              : activeSection === item.href.substring(1);
            return (
              <li key={item.href}>
                <a
                  href={item.isRoute ? item.path : item.href}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, item)}
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
            href="/quote"
            className="mobile-cta-btn"
          >
            <span>Request a Quote</span>
            <ArrowRight size={18} />
          </a>

          <a
            href="/admin/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1rem',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38BDF8',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              marginTop: '0.65rem'
            }}
          >
            <span>Staff & Admin Portal</span>
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
