# Hextron Enterprises — Corporate Website

> **Precision Turned. Performance Assured.**  
> Precision CNC Turning Components for Every Industry.

A modern, responsive, high-performance corporate website for **Hextron Enterprises**, a CNC turning job work specialist based in Behrampura, Ahmedabad, Gujarat, India.

---

## 🏭 Company Information

- **Company Name:** Hextron Enterprises
- **Core Specialization:** CNC Turning Job Work and Precision Turned Components
- **Website:** [https://www.hextronenterprise.com](https://www.hextronenterprise.com)
- **Email:** [hextronenterprise@gmail.com](mailto:hextronenterprise@gmail.com)
- **Phone / WhatsApp:** [+91 9879964414](tel:+919879964414)
- **Works & Facility Address:**  
  138, 162 Paiki Plot No-21, Mohmadi Estate,  
  Near Rehan Masjid, Opposite Excel Industries,  
  Suez Farm, Behrampura,  
  Ahmedabad - 380022, Gujarat, India.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 (Functional components, React Hooks)
- **Build Tool:** Vite 8 (Ultra-fast HMR and production bundle optimization)
- **Styling:** Modular CSS3 with custom design tokens, dark navy & electric blue palette, and responsive breakpoints
- **Iconography:** Lucide React icons + official SVG branding marks
- **SEO & Structured Data:** Semantic HTML5, Open Graph meta tags, and Schema.org LocalBusiness JSON-LD markup

---

## 📂 Project Structure

```text
hextron-enterprises/
├── public/
│   ├── images/
│   │   ├── banner.png          # High-resolution CNC lathe machining banner
│   │   ├── logo-dark.png       # Optimized brand logo for dark backgrounds
│   │   ├── logo-light.png      # Brand logo on light background
│   │   ├── favicon.png         # 3D Hexagonal brand mark
│   │   └── gallery/            # Manufacturing showcase images
│   │       ├── gallery-1.jpg   # CNC lathe turning center in operation
│   │       ├── gallery-2.jpg   # Precision turned brass & copper fittings
│   │       ├── gallery-3.jpg   # High-precision threaded shafts & lead screws
│   │       ├── gallery-4.jpg   # Precision machined bushings & sleeves
│   │       ├── gallery-5.jpg   # Metrology & 100% dimensional inspection
│   │       └── gallery-6.jpg   # Multi-material turned components assortment
│   ├── favicon.ico             # Browser shortcut icon
│   ├── favicon-32x32.png       # Standard tab icon
│   ├── robots.txt              # Search engine crawler directives
│   └── sitemap.xml             # Search engine index sitemap
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Sticky navigation with mobile slide-out drawer
│   │   ├── Footer.jsx          # Multi-column footer with contact and social links
│   │   ├── SectionHeading.jsx  # Reusable section title with badge and subtitle
│   │   ├── ServiceCard.jsx     # Service card with verified status badge & RFQ jump
│   │   ├── IndustryCard.jsx    # Sector card with typical turned parts lists
│   │   └── QuoteForm.jsx       # Interactive RFQ form with validation & WhatsApp action
│   ├── sections/
│   │   ├── Hero.jsx            # Hero with dual CTA, banner visual, and 3 value pillars
│   │   ├── About.jsx           # Engineering precision, drawing & sample-based focus
│   │   ├── Services.jsx        # 6 core CNC turning capabilities
│   │   ├── Materials.jsx       # MS, SS, EN series, Brass, Al, Copper & tolerance notice
│   │   ├── Industries.jsx      # Automotive, Machinery, Electrical, General Engineering
│   │   ├── WhyChooseUs.jsx     # 6 disciplined manufacturing pillars (dark section)
│   │   ├── Gallery.jsx         # Filterable showcase with interactive lightbox preview
│   │   ├── QuoteSection.jsx    # RFQ section container with form integration
│   │   └── Contact.jsx         # Works address, Google Maps embed, phone, email, WhatsApp
│   ├── data/
│   │   ├── companyInfo.js      # Central business contact data, taglines, pillars
│   │   ├── services.js         # Service catalog and verified capability badges
│   │   ├── materials.js        # Metal grades, characteristics, common applications
│   │   ├── industries.js       # Target industry sectors and typical parts
│   │   └── gallery.js          # Showcase image catalog, categories, and captions
│   ├── styles/
│   │   ├── global.css          # Design tokens, typography, CSS resets, utilities
│   │   ├── header.css          # Sticky header and responsive drawer styles
│   │   ├── hero.css            # Hero visual layout and value pillar styles
│   │   ├── sections.css        # Styles for About, Services, Materials, Industries, Gallery
│   │   ├── forms.css           # Quote form inputs, validation states, and file upload zone
│   │   └── footer.css          # Multi-column footer styles and back-to-top button
│   ├── App.jsx                 # Main application layout and state coordination
│   ├── index.css               # Central stylesheet import manifest
│   └── main.jsx                # React DOM entry point
├── index.html                  # HTML5 shell with OpenGraph and JSON-LD structured data
├── package.json                # Project dependencies and npm scripts
├── vite.config.js              # Vite bundler configuration
└── README.md                   # Documentation and deployment manual
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (version 18 or higher recommended)
- npm (version 9 or higher)

### 2. Installation
Open your terminal in the `hextron-enterprises` root directory and run:
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The website will start at `http://localhost:5173/` with hot module replacement (HMR).

### 4. Build for Production
To generate an optimized production bundle:
```bash
npm run build
```
Output files will be written to the `dist/` directory.

### 5. Preview Production Build
To preview the generated production build locally:
```bash
npm run preview
```

---

## 🌐 Deployment to GitHub & Vercel

### Step 1: Initialize Git and Push to GitHub

1. Initialize git in the project root (if not already initialized):
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of Hextron Enterprises corporate website"
   ```

2. Create a new repository on your GitHub account (e.g., `hextron-enterprises`).

3. Link and push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/hextron-enterprises.git
   git push -u origin main
   ```

---

### Step 2: Deploy to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository (`hextron-enterprises`).
4. Vercel automatically detects the Vite framework with the following preset settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click **Deploy**.
6. Once deployed, Vercel provides a live URL (e.g., `https://hextron-enterprises.vercel.app`).
7. **Custom Domain:** Go to **Project Settings** → **Domains** and add `www.hextronenterprise.com` and `hextronenterprise.com`, pointing DNS records (CNAME or A record) as instructed by Vercel.

---

## ✨ Key Features Implemented

1. **Brand Identity & Assets:**
   - Metallic 3D Hexagon brand logo rendered in both dark and light modes.
   - High-resolution CNC lathe machining banner integrated into the Hero visual frame.
   - High-fidelity product gallery showcasing CNC turned brass, copper, stainless steel shafts, lead screws, and precision bushings.
   - Favicons generated from the official hexagonal brand mark.

2. **Navigation & Usability:**
   - Responsive sticky navigation bar with backdrop blur.
   - Smooth scrolling offset calculations so sticky header does not obscure section titles.
   - Mobile slide-out drawer menu with auto-close and backdrop dismiss.
   - Back-to-top floating button for long scrolls.

3. **Quote & Commercial Inquiries:**
   - Full client-side validation for Name, Company, Email, Phone, and Scope.
   - File attachment support for PDF, DWG, DXF, STEP, JPG, PNG (max 15MB).
   - Strict confidentiality disclaimer to protect proprietary customer drawings.
   - Clearly labeled Demo Mode indicating client-side state.
   - **Instant WhatsApp Quote Generator:** Pre-formats the user's entered requirements into a structured WhatsApp message sent directly to `+91 9879964414`.

4. **SEO & Accessibility:**
   - Descriptive title tag: `Hextron Enterprises | CNC Turning Job Work in Ahmedabad`.
   - Meta description, Open Graph cards, and Twitter summary cards.
   - Schema.org JSON-LD structured data for `LocalBusiness` with coordinates and contact channels.
   - Calibrated contrast ratios, visible keyboard focus indicators (`:focus-visible`), and `prefers-reduced-motion` compliance.

---

## 📋 Next Steps for Production

1. **Email Backend / Form Service:**
   - To send quote form emails directly to `hextronenterprise@gmail.com` without WhatsApp, connect a backend form service such as Formspree, Resend, or a Vercel Serverless Function (`/api/quote`).
2. **DNS & Custom Domain:**
   - Add DNS CNAME/A records on your domain registrar pointing `www.hextronenterprise.com` to Vercel.
3. **Google Business Profile:**
   - Link the live website URL to Hextron Enterprises' Google Business Profile for Ahmedabad local search presence.
