import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import About from './sections/About';
import Services from './sections/Services';
import Materials from './sections/Materials';
import Industries from './sections/Industries';
import WhyChooseUs from './sections/WhyChooseUs';
import Gallery from './sections/Gallery';
import QuoteSection from './sections/QuoteSection';
import Contact from './sections/Contact';

export default function App() {
  const [selectedService, setSelectedService] = useState('CNC Turning Job Work');

  const handleSelectService = (serviceTitle) => {
    setSelectedService(serviceTitle);
  };

  return (
    <div className="site-root">
      {/* Sticky Header with Navigation & Quote Action */}
      <Header />

      {/* Main Page Sections */}
      <main id="main-content">
        <Hero />
        <About />
        <Services onSelectService={handleSelectService} />
        <Materials />
        <Industries />
        <WhyChooseUs />
        <Gallery />
        <QuoteSection selectedService={selectedService} />
        <Contact />
      </main>

      {/* Comprehensive Corporate Footer */}
      <Footer />
    </div>
  );
}
