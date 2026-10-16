import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

let prismaInstance = null;
let isLiveDb = false;

// Initialize Prisma
try {
  prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
} catch (err) {
  console.warn('[Database] Prisma Client initialization notice:', err.message);
}

// In-Memory Fallback Store (Used automatically if PostgreSQL server is offline during initial preview/tests)
class MemoryStore {
  constructor() {
    this.users = [];
    this.employees = [];
    this.customers = [];
    this.categories = [];
    this.products = [];
    this.quotations = [];
    this.quotationItems = [];
    this.quotationHistory = [];
    this.contactEnquiries = [];
    this.internalNotes = [];
    this.auditLogs = [];
    this.systemSettings = [];
    this.initialized = false;
  }

  async initSeed() {
    if (this.initialized) return;

    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('DemoAdmin@2026!', salt);
    const salesHash = await bcrypt.hash('DemoSales@2026!', salt);
    const empHash = await bcrypt.hash('DemoEmp@2026!', salt);

    // Seed Employees
    this.employees = [
      {
        id: 'emp_01',
        employeeCode: 'EMP-001',
        fullName: 'Rajesh M. Patel',
        workEmail: 'rajesh.patel@hextron-demo.internal',
        phone: '+91 9879964414',
        department: 'Operations & Management',
        designation: 'Managing Partner & Machine Shop Head',
        joiningDate: new Date('2020-01-15'),
        isActive: true,
        createdAt: new Date('2020-01-15'),
        updatedAt: new Date()
      },
      {
        id: 'emp_02',
        employeeCode: 'EMP-002',
        fullName: 'Bhavin K. Shah',
        workEmail: 'bhavin.shah@hextron-demo.internal',
        phone: '+91 9825012345',
        department: 'CNC Production',
        designation: 'Senior CNC Lathe Programmer & Setter',
        joiningDate: new Date('2021-03-01'),
        isActive: true,
        createdAt: new Date('2021-03-01'),
        updatedAt: new Date()
      },
      {
        id: 'emp_03',
        employeeCode: 'EMP-003',
        fullName: 'Jignesh Trivedi',
        workEmail: 'jignesh.trivedi@hextron-demo.internal',
        phone: '+91 9879054321',
        department: 'Quality Assurance',
        designation: 'Metrology & QA Lead Inspector',
        joiningDate: new Date('2021-08-10'),
        isActive: true,
        createdAt: new Date('2021-08-10'),
        updatedAt: new Date()
      },
      {
        id: 'emp_04',
        employeeCode: 'EMP-004',
        fullName: 'Neha Desai',
        workEmail: 'neha.desai@hextron-demo.internal',
        phone: '+91 9898011223',
        department: 'Sales & Estimation',
        designation: 'Technical RFQ Estimation Engineer',
        joiningDate: new Date('2022-02-15'),
        isActive: true,
        createdAt: new Date('2022-02-15'),
        updatedAt: new Date()
      }
    ];

    // Seed Users
    this.users = [
      {
        id: 'usr_admin',
        email: 'admin@hextron-demo.internal',
        passwordHash: adminHash,
        role: 'ADMIN',
        isActive: true,
        employeeId: 'emp_01',
        lastLoginAt: new Date(),
        createdAt: new Date('2020-01-15'),
        updatedAt: new Date()
      },
      {
        id: 'usr_sales',
        email: 'sales@hextron-demo.internal',
        passwordHash: salesHash,
        role: 'SALES',
        isActive: true,
        employeeId: 'emp_04',
        lastLoginAt: null,
        createdAt: new Date('2022-02-15'),
        updatedAt: new Date()
      },
      {
        id: 'usr_employee',
        email: 'operator@hextron-demo.internal',
        passwordHash: empHash,
        role: 'EMPLOYEE',
        isActive: true,
        employeeId: 'emp_02',
        lastLoginAt: null,
        createdAt: new Date('2021-03-01'),
        updatedAt: new Date()
      }
    ];

    // Seed Categories
    this.categories = [
      {
        id: 'cat_01',
        name: 'Precision Shafts & Spindles',
        slug: 'precision-shafts',
        description: 'CNC turned drive shafts, stepped shafts, rotor spindles, and splined pins machined with runout tolerance up to 10 microns.',
        imageUrl: '/images/gallery/gallery-3.jpg',
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cat_02',
        name: 'Threaded Fittings & Adapters',
        slug: 'threaded-fittings',
        description: 'BSP, NPT, Metric, and UNF hydraulic adaptors, hex plugs, hose nipples, and custom threaded fittings in Brass and SS.',
        imageUrl: '/images/gallery/gallery-2.jpg',
        displayOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cat_03',
        name: 'Bushings & Guide Sleeves',
        slug: 'bushings-sleeves',
        description: 'Flanged bronze bushings, hardened steel wear rings, guide sleeves, and spacer washers.',
        imageUrl: '/images/gallery/gallery-4.jpg',
        displayOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cat_04',
        name: 'Valve & Flow Machined Parts',
        slug: 'valve-components',
        description: 'Poppet valve bodies, needle stems, seat rings, and orifice plugs turned from stainless steel 304/316 and brass.',
        imageUrl: '/images/gallery/gallery-6.jpg',
        displayOrder: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cat_05',
        name: 'Electrical & Instrumentation Turned Parts',
        slug: 'electrical-components',
        description: 'Brass electrical pins, grounding studs, connector bodies, neutral links, and sensor probe housings.',
        imageUrl: '/images/gallery/gallery-2.jpg',
        displayOrder: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Seed Products
    this.products = [
      {
        id: 'prd_01',
        sku: 'HEX-SFT-001',
        name: 'Precision Stepped Drive Shaft',
        description: 'Multi-diameter turned shaft with keyway slot and ground bearing seats. Designed for high torque industrial transmission.',
        categoryId: 'cat_01',
        material: 'EN24 Alloy Steel',
        specifications: JSON.stringify({
          "Diameter Range": "Dia 25mm to 45mm",
          "Total Length": "210 mm",
          "Dimensional Tolerance": "± 0.012 mm",
          "Surface Roughness": "Ra 0.4 µm Ground",
          "Hardness": "30 - 34 HRC"
        }),
        imageUrl: '/images/gallery/gallery-3.jpg',
        isActive: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prd_02',
        sku: 'HEX-FIT-002',
        name: 'Hexagonal Hydraulic Pipe Adaptor',
        description: 'High-pressure male-to-female adaptor with precision cut BSP threads and clean O-ring groove seat.',
        categoryId: 'cat_02',
        material: 'Stainless Steel 316',
        specifications: JSON.stringify({
          "Thread Specification": "1/2\" BSP Male x 3/8\" BSP Female",
          "Hex Size": "27 mm A/F",
          "Working Pressure": "Up to 350 Bar",
          "Surface Finish": "Passivated & Ultrasonically Cleaned"
        }),
        imageUrl: '/images/gallery/gallery-2.jpg',
        isActive: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prd_03',
        sku: 'HEX-BSH-003',
        name: 'Flanged Self-Lubricating Guide Bushing',
        description: 'Precision bored flanged bushing with internal grease relief spiral groove for guide rod applications.',
        categoryId: 'cat_03',
        material: 'Phosphor Bronze (PB2 / SAE 660)',
        specifications: JSON.stringify({
          "Inside Diameter": "30.00 mm (+0.015 / +0.005)",
          "Outside Diameter": "42.00 mm",
          "Flange Diameter": "54.00 mm x 6.00 mm Thk",
          "Concentricity": "Within 0.010 mm"
        }),
        imageUrl: '/images/gallery/gallery-4.jpg',
        isActive: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prd_04',
        sku: 'HEX-VLV-004',
        name: 'Precision Poppet Valve Stem',
        description: 'Micro-turned needle stem with polished 45-degree sealing cone for fluid regulation systems.',
        categoryId: 'cat_04',
        material: 'Stainless Steel 304',
        specifications: JSON.stringify({
          "Stem Diameter": "8.00 mm (h7)",
          "Length": "95 mm",
          "Sealing Angle": "45° Ground & Lapped",
          "Runout": "< 0.008 mm"
        }),
        imageUrl: '/images/gallery/gallery-6.jpg',
        isActive: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prd_05',
        sku: 'HEX-CON-005',
        name: 'Brass High-Current Terminal Stud',
        description: 'Turned threaded stud with knurled press-fit collar for electrical distribution panels.',
        categoryId: 'cat_05',
        material: 'Free Cutting Brass IS 319 Grade 1',
        specifications: JSON.stringify({
          "Thread Size": "M10 x 1.5 Pitch",
          "Hex Collar": "17 mm Hex with Diamond Knurl",
          "Plating": "Bright Tin Plated (5-8 µm)"
        }),
        imageUrl: '/images/gallery/gallery-2.jpg',
        isActive: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prd_06',
        sku: 'HEX-SFT-006',
        name: 'Heavy Duty Spline Pinion Shaft Blank',
        description: 'Pre-machined CNC turned blank ready for gear hobbing and induction hardening.',
        categoryId: 'cat_01',
        material: 'EN8 / AISI 1040 Carbon Steel',
        specifications: JSON.stringify({
          "Major Diameter": "65.00 mm",
          "Length": "145 mm",
          "Center Holes": "60° Type A with ground centers",
          "Tolerance": "± 0.020 mm"
        }),
        imageUrl: '/images/gallery/gallery-3.jpg',
        isActive: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Seed Customers
    this.customers = [
      {
        id: 'cust_01',
        fullName: 'Vikram Seth',
        companyName: 'Apex Machinery & Pumps Pvt Ltd',
        email: 'vikram.seth@apexmachinery-demo.in',
        phone: '+91 9825123456',
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-10')
      },
      {
        id: 'cust_02',
        fullName: 'Jayesh Parekh',
        companyName: 'Western Valves & Flow Systems',
        email: 'j.parekh@westernvalves-demo.com',
        phone: '+91 9879100200',
        createdAt: new Date('2026-02-05'),
        updatedAt: new Date('2026-02-05')
      },
      {
        id: 'cust_03',
        fullName: 'Sunita Rao',
        companyName: 'Precision Motion Controls LLP',
        email: 'srao@precisionmotion-demo.org',
        phone: '+91 9898234567',
        createdAt: new Date('2026-03-01'),
        updatedAt: new Date('2026-03-01')
      }
    ];

    // Seed Quotations
    this.quotations = [
      {
        id: 'qt_01',
        quotationNumber: 'HEX-QT-2026-0001',
        customerId: 'cust_01',
        customerName: 'Vikram Seth',
        companyName: 'Apex Machinery & Pumps Pvt Ltd',
        email: 'vikram.seth@apexmachinery-demo.in',
        phone: '+91 9825123456',
        componentName: 'Precision Stepped Drive Shaft',
        description: 'Batch production of stepped drive shaft as per drawing DWG-2026-AP-04 rev B. Material EN24.',
        materialType: 'EN24 Alloy Steel',
        quantity: 500,
        drawingRef: 'DWG-2026-AP-04-revB.pdf',
        status: 'QUOTED',
        unitPrice: 175.00,
        discountPercent: 0.00,
        discountAmount: 0.00,
        taxRate: 18.00,
        taxAmount: 15750.00,
        subtotal: 87500.00,
        grandTotal: 103250.00,
        estimatedDelivery: '10 to 14 working days',
        assignedEmployeeId: 'emp_04',
        isArchived: false,
        createdAt: new Date('2026-03-12T10:30:00Z'),
        updatedAt: new Date('2026-03-12T14:45:00Z')
      },
      {
        id: 'qt_02',
        quotationNumber: 'HEX-QT-2026-0002',
        customerId: 'cust_02',
        customerName: 'Jayesh Parekh',
        companyName: 'Western Valves & Flow Systems',
        email: 'j.parekh@westernvalves-demo.com',
        phone: '+91 9879100200',
        componentName: 'Hexagonal Hydraulic Pipe Adaptor',
        description: 'Precision CNC turned hydraulic BSP adaptors in SS 316. Thread verification with plug gauges required.',
        materialType: 'Stainless Steel 316',
        quantity: 1200,
        drawingRef: 'WV-HYD-502.step',
        status: 'UNDER_REVIEW',
        unitPrice: 120.00,
        discountPercent: 5.00,
        discountAmount: 7200.00,
        taxRate: 18.00,
        taxAmount: 24624.00,
        subtotal: 144000.00,
        grandTotal: 161424.00,
        estimatedDelivery: '15 to 20 working days',
        assignedEmployeeId: 'emp_04',
        isArchived: false,
        createdAt: new Date('2026-03-25T11:00:00Z'),
        updatedAt: new Date('2026-03-25T11:00:00Z')
      },
      {
        id: 'qt_03',
        quotationNumber: 'HEX-QT-2026-0003',
        customerId: 'cust_03',
        customerName: 'Sunita Rao',
        companyName: 'Precision Motion Controls LLP',
        email: 'srao@precisionmotion-demo.org',
        phone: '+91 9898234567',
        componentName: 'Flanged Self-Lubricating Guide Bushing',
        description: 'Phosphor bronze bushings with ID tolerance +0.015/+0.005. Complete with material test certificate.',
        materialType: 'Phosphor Bronze',
        quantity: 350,
        drawingRef: 'PMC-BSH-304.pdf',
        status: 'ACCEPTED',
        unitPrice: 160.00,
        discountPercent: 0.00,
        discountAmount: 0.00,
        taxRate: 18.00,
        taxAmount: 10080.00,
        subtotal: 56000.00,
        grandTotal: 66080.00,
        estimatedDelivery: '7 to 10 working days',
        assignedEmployeeId: 'emp_04',
        isArchived: false,
        createdAt: new Date('2026-04-01T09:15:00Z'),
        updatedAt: new Date('2026-04-03T16:20:00Z')
      },
      {
        id: 'qt_04',
        quotationNumber: 'HEX-QT-2026-0004',
        customerId: null,
        customerName: 'Prakash M. Solanki',
        companyName: 'Shreeji Engineering Works',
        email: 'shreeji.engg.works@solanki-demo.in',
        phone: '+91 9426098765',
        componentName: 'Brass High-Current Terminal Stud',
        description: 'New RFQ received via website portal. Requires sample batch evaluation first.',
        materialType: 'Brass IS 319',
        quantity: 2000,
        drawingRef: null,
        status: 'NEW',
        unitPrice: 0.00,
        discountPercent: 0.00,
        discountAmount: 0.00,
        taxRate: 18.00,
        taxAmount: 0.00,
        subtotal: 0.00,
        grandTotal: 0.00,
        estimatedDelivery: 'TBD',
        assignedEmployeeId: null,
        isArchived: false,
        createdAt: new Date('2026-04-10T14:20:00Z'),
        updatedAt: new Date('2026-04-10T14:20:00Z')
      }
    ];

    // Seed Quotation Items
    this.quotationItems = [
      {
        id: 'qti_01',
        quotationId: 'qt_01',
        itemOrder: 1,
        partName: 'Precision Stepped Drive Shaft (Dia 32mm x 180mm)',
        description: 'Turned on CNC lathe from EN24 bar stock with keyway slot and ground bearing journals.',
        material: 'EN24 Alloy Steel',
        quantity: 500,
        unit: 'PCS',
        unitPrice: 175.00,
        total: 87500.00,
        specifications: 'Tolerance ± 0.012mm | Ra 0.4',
        createdAt: new Date('2026-03-12T10:30:00Z'),
        updatedAt: new Date('2026-03-12T10:30:00Z')
      },
      {
        id: 'qti_02',
        quotationId: 'qt_02',
        itemOrder: 1,
        partName: 'Hexagonal Hydraulic Adaptor 1/2" x 3/8"',
        description: 'CNC turned hydraulic adaptor with BSP thread form',
        material: 'SS 316',
        quantity: 1200,
        unit: 'PCS',
        unitPrice: 120.00,
        total: 144000.00,
        specifications: 'Pressure test 350 Bar',
        createdAt: new Date('2026-03-25T11:00:00Z'),
        updatedAt: new Date('2026-03-25T11:00:00Z')
      },
      {
        id: 'qti_03',
        quotationId: 'qt_03',
        itemOrder: 1,
        partName: 'Flanged Self-Lubricating Guide Bushing',
        description: 'Turned phosphor bronze bushing with internal groove',
        material: 'Phosphor Bronze PB2',
        quantity: 350,
        unit: 'PCS',
        unitPrice: 160.00,
        total: 56000.00,
        specifications: 'ID 30mm (+0.015/+0.005)',
        createdAt: new Date('2026-04-01T09:15:00Z'),
        updatedAt: new Date('2026-04-01T09:15:00Z')
      }
    ];

    // Seed Quotation History
    this.quotationHistory = [
      {
        id: 'qth_01',
        quotationId: 'qt_01',
        previousStatus: 'NEW',
        newStatus: 'UNDER_REVIEW',
        changedById: 'usr_sales',
        changedByName: 'Neha Desai (Sales)',
        remarks: 'Drawing DWG-2026-AP-04 verified with Bhavin Shah for tooling setup and cycle time estimation.',
        createdAt: new Date('2026-03-12T11:00:00Z')
      },
      {
        id: 'qth_02',
        quotationId: 'qt_01',
        previousStatus: 'UNDER_REVIEW',
        newStatus: 'QUOTED',
        changedById: 'usr_sales',
        changedByName: 'Neha Desai (Sales)',
        remarks: 'Quotation sent to Vikram Seth with unit price ₹175/pc and delivery lead time 10-14 days.',
        createdAt: new Date('2026-03-12T14:45:00Z')
      },
      {
        id: 'qth_03',
        quotationId: 'qt_03',
        previousStatus: 'QUOTED',
        newStatus: 'ACCEPTED',
        changedById: 'usr_sales',
        changedByName: 'Neha Desai (Sales)',
        remarks: 'Customer purchase order received via email. Work order scheduled for CNC shop floor.',
        createdAt: new Date('2026-04-03T16:20:00Z')
      }
    ];

    // Seed Contact Enquiries
    this.contactEnquiries = [
      {
        id: 'enq_01',
        name: 'Arvind Mehta',
        companyName: 'Mehta Transmission Gears',
        email: 'arvind@mehtagears-demo.in',
        phone: '+91 9825598765',
        subject: 'Inquiry for CNC turning job work for 2000 pcs monthly batch',
        message: 'We require regular job work for EN8 turned pinion blanks. Please let us know machine capacity and current lathe availability in Behrampura.',
        status: 'NEW',
        assignedEmployeeId: null,
        customerId: null,
        followUpDate: new Date('2026-04-18'),
        createdAt: new Date('2026-04-14T09:30:00Z'),
        updatedAt: new Date('2026-04-14T09:30:00Z')
      },
      {
        id: 'enq_02',
        name: 'Sanjay Doshi',
        companyName: 'Doshi Precision Valves',
        email: 'sdoshi@doshivalves-demo.com',
        phone: '+91 9879154321',
        subject: 'Tolerance capability inquiry on SS 316 CNC turning',
        message: 'Looking for a precision turning partner capable of holding ±0.010 mm consistently on 300 series stainless steel. Can we visit your works facility?',
        status: 'RESPONDED',
        assignedEmployeeId: 'emp_04',
        customerId: null,
        followUpDate: new Date('2026-04-20'),
        createdAt: new Date('2026-04-11T14:00:00Z'),
        updatedAt: new Date('2026-04-12T10:15:00Z')
      },
      {
        id: 'enq_03',
        name: 'Divya Patel',
        companyName: 'Gujarat Agro Tools',
        email: 'divya.patel@agrotools-demo.co.in',
        phone: '+91 9909012345',
        subject: 'Drawing review consultation for custom bushes',
        message: 'We have 3 CAD drawings for hardened guide bushes in EN31 steel. Would like technical consultation on grinding vs fine turning finish.',
        status: 'IN_PROGRESS',
        assignedEmployeeId: 'emp_02',
        customerId: null,
        followUpDate: new Date('2026-04-19'),
        createdAt: new Date('2026-04-08T16:45:00Z'),
        updatedAt: new Date('2026-04-09T11:20:00Z')
      }
    ];

    // Seed Internal Notes
    this.internalNotes = [
      {
        id: 'not_01',
        quotationId: 'qt_01',
        enquiryId: null,
        authorId: 'usr_sales',
        authorName: 'Neha Desai',
        note: 'Customer mentioned they will expand order to 1,500 pcs if initial 500 pcs match runout specs.',
        createdAt: new Date('2026-03-12T15:00:00Z')
      },
      {
        id: 'not_02',
        quotationId: null,
        enquiryId: 'enq_02',
        authorId: 'usr_sales',
        authorName: 'Neha Desai',
        note: 'Called Mr. Doshi. Scheduled workshop visit for Saturday 11:30 AM with Mr. Rajesh Patel.',
        createdAt: new Date('2026-04-12T10:15:00Z')
      }
    ];

    // Seed System Settings
    this.systemSettings = [
      {
        id: 'set_01',
        key: 'COMPANY_NAME',
        value: 'Hextron Enterprises',
        description: 'Official registered entity name',
        updatedAt: new Date()
      },
      {
        id: 'set_02',
        key: 'DEFAULT_TAX_RATE',
        value: '18.00',
        description: 'Standard Goods & Services Tax (GST) percentage',
        updatedAt: new Date()
      },
      {
        id: 'set_03',
        key: 'QUOTATION_PREFIX',
        value: 'HEX-QT',
        description: 'Prefix used for safe quotation numbering',
        updatedAt: new Date()
      },
      {
        id: 'set_04',
        key: 'CURRENCY',
        value: 'INR',
        description: 'Primary operating currency (₹ Indian Rupee)',
        updatedAt: new Date()
      }
    ];

    this.initialized = true;
  }
}

export const memoryStore = new MemoryStore();

/**
 * Check if PostgreSQL connection is live
 */
export async function testDbConnection() {
  if (!prismaInstance) return false;
  try {
    await prismaInstance.$queryRaw`SELECT 1`;
    isLiveDb = true;
    console.log('✓ PostgreSQL Database connection verified via Prisma.');
    return true;
  } catch (err) {
    isLiveDb = false;
    console.log('ℹ PostgreSQL not connected at DATABASE_URL. Activating in-memory store for local evaluation/testing.');
    await memoryStore.initSeed();
    return false;
  }
}

export { prismaInstance as prisma, isLiveDb };
