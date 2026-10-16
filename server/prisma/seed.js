import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Hextron Enterprises: Database Seeding Started ---');

  // Clear existing records in reverse dependency order
  await prisma.internalNote.deleteMany();
  await prisma.quotationHistory.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.contactEnquiry.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.systemSetting.deleteMany();

  // Create Employees
  const emp1 = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-001',
      fullName: 'Rajesh M. Patel',
      workEmail: 'rajesh.patel@hextron-demo.internal',
      phone: '+91 9879964414',
      department: 'Operations & Management',
      designation: 'Managing Partner & Machine Shop Head',
      joiningDate: new Date('2020-01-15'),
      isActive: true,
    }
  });

  const emp2 = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-002',
      fullName: 'Bhavin K. Shah',
      workEmail: 'bhavin.shah@hextron-demo.internal',
      phone: '+91 9825012345',
      department: 'CNC Production',
      designation: 'Senior CNC Lathe Programmer & Setter',
      joiningDate: new Date('2021-03-01'),
      isActive: true,
    }
  });

  const emp3 = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-003',
      fullName: 'Jignesh Trivedi',
      workEmail: 'jignesh.trivedi@hextron-demo.internal',
      phone: '+91 9879054321',
      department: 'Quality Assurance',
      designation: 'Metrology & QA Lead Inspector',
      joiningDate: new Date('2021-08-10'),
      isActive: true,
    }
  });

  const emp4 = await prisma.employee.create({
    data: {
      employeeCode: 'EMP-004',
      fullName: 'Neha Desai',
      workEmail: 'neha.desai@hextron-demo.internal',
      phone: '+91 9898011223',
      department: 'Sales & Estimation',
      designation: 'Technical RFQ Estimation Engineer',
      joiningDate: new Date('2022-02-15'),
      isActive: true,
    }
  });

  // Create Users with secure hashed passwords
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('DemoAdmin@2026!', salt);
  const salesHash = await bcrypt.hash('DemoSales@2026!', salt);
  const empHash = await bcrypt.hash('DemoEmp@2026!', salt);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hextron-demo.internal',
      passwordHash: adminHash,
      role: 'ADMIN',
      isActive: true,
      employeeId: emp1.id
    }
  });

  const salesUser = await prisma.user.create({
    data: {
      email: 'sales@hextron-demo.internal',
      passwordHash: salesHash,
      role: 'SALES',
      isActive: true,
      employeeId: emp4.id
    }
  });

  await prisma.user.create({
    data: {
      email: 'operator@hextron-demo.internal',
      passwordHash: empHash,
      role: 'EMPLOYEE',
      isActive: true,
      employeeId: emp2.id
    }
  });

  // Create Categories
  const catShafts = await prisma.category.create({
    data: {
      name: 'Precision Shafts & Spindles',
      slug: 'precision-shafts',
      description: 'CNC turned drive shafts, stepped shafts, rotor spindles, and splined pins machined with runout tolerance up to 10 microns.',
      imageUrl: '/images/gallery/gallery-3.jpg',
      displayOrder: 1,
      isActive: true
    }
  });

  const catFittings = await prisma.category.create({
    data: {
      name: 'Threaded Fittings & Adapters',
      slug: 'threaded-fittings',
      description: 'BSP, NPT, Metric, and UNF hydraulic adaptors, hex plugs, hose nipples, and custom threaded fittings in Brass and SS.',
      imageUrl: '/images/gallery/gallery-2.jpg',
      displayOrder: 2,
      isActive: true
    }
  });

  const catBushings = await prisma.category.create({
    data: {
      name: 'Bushings & Guide Sleeves',
      slug: 'bushings-sleeves',
      description: 'Flanged bronze bushings, hardened steel wear rings, guide sleeves, and spacer washers.',
      imageUrl: '/images/gallery/gallery-4.jpg',
      displayOrder: 3,
      isActive: true
    }
  });

  const catValves = await prisma.category.create({
    data: {
      name: 'Valve & Flow Machined Parts',
      slug: 'valve-components',
      description: 'Poppet valve bodies, needle stems, seat rings, and orifice plugs turned from stainless steel 304/316 and brass.',
      imageUrl: '/images/gallery/gallery-6.jpg',
      displayOrder: 4,
      isActive: true
    }
  });

  const catElectrical = await prisma.category.create({
    data: {
      name: 'Electrical & Instrumentation Turned Parts',
      slug: 'electrical-components',
      description: 'Brass electrical pins, grounding studs, connector bodies, neutral links, and sensor probe housings.',
      imageUrl: '/images/gallery/gallery-2.jpg',
      displayOrder: 5,
      isActive: true
    }
  });

  // Create Products
  await prisma.product.createMany({
    data: [
      {
        sku: 'HEX-SFT-001',
        name: 'Precision Stepped Drive Shaft',
        description: 'Multi-diameter turned shaft with keyway slot and ground bearing seats. Designed for high torque industrial transmission.',
        categoryId: catShafts.id,
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
        isPublic: true
      },
      {
        sku: 'HEX-FIT-002',
        name: 'Hexagonal Hydraulic Pipe Adaptor',
        description: 'High-pressure male-to-female adaptor with precision cut BSP threads and clean O-ring groove seat.',
        categoryId: catFittings.id,
        material: 'Stainless Steel 316',
        specifications: JSON.stringify({
          "Thread Specification": "1/2\" BSP Male x 3/8\" BSP Female",
          "Hex Size": "27 mm A/F",
          "Working Pressure": "Up to 350 Bar",
          "Surface Finish": "Passivated & Ultrasonically Cleaned"
        }),
        imageUrl: '/images/gallery/gallery-2.jpg',
        isActive: true,
        isPublic: true
      },
      {
        sku: 'HEX-BSH-003',
        name: 'Flanged Self-Lubricating Guide Bushing',
        description: 'Precision bored flanged bushing with internal grease relief spiral groove for guide rod applications.',
        categoryId: catBushings.id,
        material: 'Phosphor Bronze (PB2 / SAE 660)',
        specifications: JSON.stringify({
          "Inside Diameter": "30.00 mm (+0.015 / +0.005)",
          "Outside Diameter": "42.00 mm",
          "Flange Diameter": "54.00 mm x 6.00 mm Thk",
          "Concentricity": "Within 0.010 mm"
        }),
        imageUrl: '/images/gallery/gallery-4.jpg',
        isActive: true,
        isPublic: true
      },
      {
        sku: 'HEX-VLV-004',
        name: 'Precision Poppet Valve Stem',
        description: 'Micro-turned needle stem with polished 45-degree sealing cone for fluid regulation systems.',
        categoryId: catValves.id,
        material: 'Stainless Steel 304',
        specifications: JSON.stringify({
          "Stem Diameter": "8.00 mm (h7)",
          "Length": "95 mm",
          "Sealing Angle": "45° Ground & Lapped",
          "Runout": "< 0.008 mm"
        }),
        imageUrl: '/images/gallery/gallery-6.jpg',
        isActive: true,
        isPublic: true
      },
      {
        sku: 'HEX-CON-005',
        name: 'Brass High-Current Terminal Stud',
        description: 'Turned threaded stud with knurled press-fit collar for electrical distribution panels.',
        categoryId: catElectrical.id,
        material: 'Free Cutting Brass IS 319 Grade 1',
        specifications: JSON.stringify({
          "Thread Size": "M10 x 1.5 Pitch",
          "Hex Collar": "17 mm Hex with Diamond Knurl",
          "Plating": "Bright Tin Plated (5-8 µm)"
        }),
        imageUrl: '/images/gallery/gallery-2.jpg',
        isActive: true,
        isPublic: true
      },
      {
        sku: 'HEX-SFT-006',
        name: 'Heavy Duty Spline Pinion Shaft Blank',
        description: 'Pre-machined CNC turned blank ready for gear hobbing and induction hardening.',
        categoryId: catShafts.id,
        material: 'EN8 / AISI 1040 Carbon Steel',
        specifications: JSON.stringify({
          "Major Diameter": "65.00 mm",
          "Length": "145 mm",
          "Center Holes": "60° Type A with ground centers",
          "Tolerance": "± 0.020 mm"
        }),
        imageUrl: '/images/gallery/gallery-3.jpg',
        isActive: true,
        isPublic: true
      }
    ]
  });

  // Create Customers
  const cust1 = await prisma.customer.create({
    data: {
      fullName: 'Vikram Seth',
      companyName: 'Apex Machinery & Pumps Pvt Ltd',
      email: 'vikram.seth@apexmachinery-demo.in',
      phone: '+91 9825123456',
    }
  });

  // Create Quotation with Items and History
  const qt1 = await prisma.quotation.create({
    data: {
      quotationNumber: 'HEX-QT-2026-0001',
      customerId: cust1.id,
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
      assignedEmployeeId: emp4.id,
      items: {
        create: [
          {
            itemOrder: 1,
            partName: 'Precision Stepped Drive Shaft (Dia 32mm x 180mm)',
            description: 'Turned on CNC lathe from EN24 bar stock with keyway slot and ground bearing journals.',
            material: 'EN24 Alloy Steel',
            quantity: 500,
            unit: 'PCS',
            unitPrice: 175.00,
            total: 87500.00,
            specifications: 'Tolerance ± 0.012mm | Ra 0.4'
          }
        ]
      },
      history: {
        create: [
          {
            previousStatus: 'NEW',
            newStatus: 'UNDER_REVIEW',
            changedById: salesUser.id,
            changedByName: 'Neha Desai (Sales)',
            remarks: 'Drawing DWG-2026-AP-04 verified with Bhavin Shah for tooling setup and cycle time estimation.'
          },
          {
            previousStatus: 'UNDER_REVIEW',
            newStatus: 'QUOTED',
            changedById: salesUser.id,
            changedByName: 'Neha Desai (Sales)',
            remarks: 'Quotation sent to customer with unit price ₹175/pc and delivery lead time 10-14 days.'
          }
        ]
      },
      internalNotes: {
        create: [
          {
            authorId: salesUser.id,
            authorName: 'Neha Desai',
            note: 'Customer mentioned they will expand order to 1,500 pcs if initial 500 pcs match runout specs.'
          }
        ]
      }
    }
  });

  // Create Enquiries
  await prisma.contactEnquiry.createMany({
    data: [
      {
        name: 'Arvind Mehta',
        companyName: 'Mehta Transmission Gears',
        email: 'arvind@mehtagears-demo.in',
        phone: '+91 9825598765',
        subject: 'Inquiry for CNC turning job work for 2000 pcs monthly batch',
        message: 'We require regular job work for EN8 turned pinion blanks. Please let us know machine capacity and current lathe availability in Behrampura.',
        status: 'NEW',
        followUpDate: new Date('2026-04-18')
      },
      {
        name: 'Sanjay Doshi',
        companyName: 'Doshi Precision Valves',
        email: 'sdoshi@doshivalves-demo.com',
        phone: '+91 9879154321',
        subject: 'Tolerance capability inquiry on SS 316 CNC turning',
        message: 'Looking for a precision turning partner capable of holding ±0.010 mm consistently on 300 series stainless steel. Can we visit your works facility?',
        status: 'RESPONDED',
        assignedEmployeeId: emp4.id,
        followUpDate: new Date('2026-04-20')
      }
    ]
  });

  // System Settings
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'COMPANY_NAME',
        value: 'Hextron Enterprises',
        description: 'Official registered entity name'
      },
      {
        key: 'DEFAULT_TAX_RATE',
        value: '18.00',
        description: 'Standard Goods & Services Tax (GST) percentage'
      },
      {
        key: 'QUOTATION_PREFIX',
        value: 'HEX-QT',
        description: 'Prefix used for safe quotation numbering'
      },
      {
        key: 'CURRENCY',
        value: 'INR',
        description: 'Primary operating currency (₹ Indian Rupee)'
      }
    ]
  });

  console.log('✓ Database Seeding Completed Successfully!');
  console.log('  Initial Administrator Account:');
  console.log('    Email: admin@hextron-demo.internal');
  console.log('    Password: DemoAdmin@2026!');
  console.log('  Sales Account:');
  console.log('    Email: sales@hextron-demo.internal');
  console.log('    Password: DemoSales@2026!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
