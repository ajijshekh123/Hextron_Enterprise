import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { prisma, memoryStore, isLiveDb } from '../lib/prisma.js';

const router = Router();

/**
 * GET /api/v1/dashboard/metrics
 * Returns real database-driven operational and business statistics
 */
router.get('/metrics', authenticateToken, async (req, res, next) => {
  try {
    let metrics = {};
    let recentQuotations = [];
    let recentEnquiries = [];

    if (isLiveDb && prisma) {
      const [
        totalQuotations,
        pendingQuotations,
        totalEnquiries,
        unresolvedEnquiries,
        activeProducts,
        activeCategories,
        activeEmployees,
        quotations,
        enquiries
      ] = await Promise.all([
        prisma.quotation.count({ where: { isArchived: false } }),
        prisma.quotation.count({
          where: {
            isArchived: false,
            status: { in: ['NEW', 'UNDER_REVIEW'] }
          }
        }),
        prisma.contactEnquiry.count(),
        prisma.contactEnquiry.count({
          where: {
            status: { in: ['NEW', 'IN_PROGRESS'] }
          }
        }),
        prisma.product.count({ where: { isActive: true } }),
        prisma.category.count({ where: { isActive: true } }),
        prisma.employee.count({ where: { isActive: true } }),
        prisma.quotation.findMany({
          where: { isArchived: false },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { assignedEmployee: true }
        }),
        prisma.contactEnquiry.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { assignedEmployee: true }
        })
      ]);

      metrics = {
        totalQuotations,
        pendingQuotations,
        totalEnquiries,
        unresolvedEnquiries,
        activeProducts,
        activeCategories,
        activeEmployees
      };
      recentQuotations = quotations;
      recentEnquiries = enquiries;
    } else {
      // Memory Store queries
      const totalQuotations = memoryStore.quotations.filter((q) => !q.isArchived).length;
      const pendingQuotations = memoryStore.quotations.filter(
        (q) => !q.isArchived && (q.status === 'NEW' || q.status === 'UNDER_REVIEW')
      ).length;
      const totalEnquiries = memoryStore.contactEnquiries.length;
      const unresolvedEnquiries = memoryStore.contactEnquiries.filter(
        (e) => e.status === 'NEW' || e.status === 'IN_PROGRESS'
      ).length;
      const activeProducts = memoryStore.products.filter((p) => p.isActive).length;
      const activeCategories = memoryStore.categories.filter((c) => c.isActive).length;
      const activeEmployees = memoryStore.employees.filter((e) => e.isActive).length;

      metrics = {
        totalQuotations,
        pendingQuotations,
        totalEnquiries,
        unresolvedEnquiries,
        activeProducts,
        activeCategories,
        activeEmployees
      };

      recentQuotations = [...memoryStore.quotations]
        .filter((q) => !q.isArchived)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((q) => {
          const emp = memoryStore.employees.find((e) => e.id === q.assignedEmployeeId);
          return { ...q, assignedEmployee: emp || null };
        });

      recentEnquiries = [...memoryStore.contactEnquiries]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((e) => {
          const emp = memoryStore.employees.find((emp) => emp.id === e.assignedEmployeeId);
          return { ...e, assignedEmployee: emp || null };
        });
    }

    res.json({
      success: true,
      data: {
        metrics,
        recentActivity: {
          quotations: recentQuotations,
          enquiries: recentEnquiries
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
