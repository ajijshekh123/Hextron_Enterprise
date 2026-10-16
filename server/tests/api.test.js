import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { memoryStore } from '../src/lib/prisma.js';

let adminToken = '';
let salesToken = '';
let employeeToken = '';

beforeAll(async () => {
  // Ensure seed data is initialized
  await memoryStore.initSeed();

  // Obtain Admin Token
  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@hextron-demo.internal', password: 'DemoAdmin@2026!' });
  expect(adminRes.status).toBe(200);
  adminToken = adminRes.body.data.token;

  // Obtain Sales Token
  const salesRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'sales@hextron-demo.internal', password: 'DemoSales@2026!' });
  expect(salesRes.status).toBe(200);
  salesToken = salesRes.body.data.token;

  // Obtain Employee Token
  const empRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'operator@hextron-demo.internal', password: 'DemoEmp@2026!' });
  expect(empRes.status).toBe(200);
  employeeToken = empRes.body.data.token;
});

describe('1. Authentication & Security Tests', () => {
  it('rejects invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@hextron-demo.internal', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects unauthenticated requests to protected endpoints', async () => {
    const res = await request(app).get('/api/v1/quotations');
    expect(res.status).toBe(401);
  });

  it('provides current authenticated session via /auth/me', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('ADMIN');
    expect(res.body.data.user.email).toBe('admin@hextron-demo.internal');
  });
});

describe('2. Role-Based Access Control (RBAC) Tests', () => {
  it('allows ADMIN to access user management', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.users.length).toBeGreaterThan(0);
  });

  it('blocks SALES from accessing user management with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('blocks EMPLOYEE from creating categories with 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ name: 'Unauthorized Category' });

    expect(res.status).toBe(403);
  });
});

describe('3. Public Forms & Submissions', () => {
  it('accepts valid public contact enquiry and stores it with NEW status', async () => {
    const res = await request(app)
      .post('/api/v1/enquiries/public')
      .send({
        name: 'Test Customer',
        companyName: 'Test Industries Ltd',
        email: 'test@example.com',
        phone: '+91 9876543210',
        subject: 'Machining Requirement for Custom Flanges',
        message: 'Looking for CNC turned mild steel flanges batch of 500 pcs.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('NEW');
  });

  it('rejects invalid contact enquiry missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/enquiries/public')
      .send({
        name: 'Incomplete',
        email: 'invalid-email'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('accepts public quotation request and generates safe quotation number', async () => {
    const res = await request(app)
      .post('/api/v1/quotations/public')
      .send({
        fullName: 'Ramesh Shah',
        companyName: 'Shah Precision Components',
        email: 'ramesh.shah@test-demo.in',
        phone: '+91 9825098765',
        serviceType: 'CNC Turning Job Work',
        material: 'Stainless Steel 316',
        quantity: 300,
        requirements: 'Tolerance ± 0.015mm, drawing will be provided upon review.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quotationNumber).toMatch(/^HEX-QT-\d{4}-\d{4}$/);
  });
});

describe('4. Quotation Management & Status Transitions', () => {
  it('allows staff to list quotations and filter by status', async () => {
    const res = await request(app)
      .get('/api/v1/quotations?status=ALL')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.quotations)).toBe(true);
  });

  it('allows staff to create multi-line quotation with accurate totals', async () => {
    const res = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        customerName: 'Kailash Patel',
        companyName: 'Kailash Precision Engineering',
        email: 'kailash@kailash-demo.in',
        phone: '+91 9909988776',
        componentName: 'Precision Hydraulic Cylinder Piston',
        materialType: 'EN8 Steel',
        quantity: 250,
        unitPrice: 320.00,
        discountPercent: 5.00,
        taxRate: 18.00,
        estimatedDelivery: '10 working days',
        items: [
          {
            partName: 'Hydraulic Cylinder Piston (Dia 50mm)',
            quantity: 250,
            unit: 'PCS',
            unitPrice: 320.00,
            specifications: 'Ground finish Ra 0.4'
          }
        ]
      });

    expect(res.status).toBe(201);
    const q = res.body.data.quotation;
    expect(q.subtotal).toBe(80000.00); // 250 * 320 = 80,000
    expect(q.discountAmount).toBe(4000.00); // 5% of 80,000 = 4,000
    // Net: 76,000. Tax 18%: 13,680. Grand Total: 89,680.00
    expect(q.grandTotal).toBe(89680.00);
  });

  it('transitions status and saves remarks into audit history', async () => {
    // Pick first quotation
    const listRes = await request(app)
      .get('/api/v1/quotations')
      .set('Authorization', `Bearer ${salesToken}`);
    const firstQ = listRes.body.data.quotations[0];

    const patchRes = await request(app)
      .patch(`/api/v1/quotations/${firstQ.id}/status`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        status: 'UNDER_REVIEW',
        remarks: 'Tooling setup verified by production team'
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);
  });
});

describe('5. Products & Categories Management', () => {
  it('exposes public products catalog with category filtering', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBeGreaterThan(0);
  });

  it('prevents category deletion when products are linked to it', async () => {
    // Get list of categories
    const catRes = await request(app).get('/api/v1/categories');
    const firstCat = catRes.body.data.categories[0];

    const delRes = await request(app)
      .delete(`/api/v1/categories/${firstCat.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Should be rejected with 400 because products reference this category
    expect(delRes.status).toBe(400);
    expect(delRes.body.error.message).toContain('Cannot delete category');
  });
});

describe('6. Employee Management', () => {
  it('allows ADMIN to create and list employees', async () => {
    const newEmpCode = `EMP-TEST-${Date.now().toString().slice(-4)}`;
    const createRes = await request(app)
      .post('/api/v1/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeCode: newEmpCode,
        fullName: 'Test Operator',
        workEmail: `test.op.${Date.now()}@hextron-demo.internal`,
        phone: '+91 9988776655',
        department: 'CNC Production',
        designation: 'CNC Turner'
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.employee.employeeCode).toBe(newEmpCode);
  });
});
