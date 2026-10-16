import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { prisma, memoryStore, isLiveDb } from '../lib/prisma.js';

const router = Router();

const updateSettingSchema = z.object({
  body: z.object({
    settings: z.record(z.string())
  })
});

/**
 * GET /api/v1/settings
 * Retrieve system settings and operational parameters
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    let settingsMap = {};

    if (isLiveDb && prisma) {
      const records = await prisma.systemSetting.findMany();
      records.forEach((r) => {
        settingsMap[r.key] = r.value;
      });
    } else {
      memoryStore.systemSettings.forEach((r) => {
        settingsMap[r.key] = r.value;
      });
    }

    res.json({
      success: true,
      data: {
        settings: settingsMap,
        emailDeliveryConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/settings
 * Update system parameters (ADMIN only)
 */
router.put('/', authenticateToken, requireRole('ADMIN'), validate(updateSettingSchema), async (req, res, next) => {
  try {
    const { settings } = req.body;

    if (isLiveDb && prisma) {
      for (const [key, value] of Object.entries(settings)) {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        });
      }
    } else {
      for (const [key, value] of Object.entries(settings)) {
        const item = memoryStore.systemSettings.find((s) => s.key === key);
        if (item) {
          item.value = String(value);
          item.updatedAt = new Date();
        } else {
          memoryStore.systemSettings.push({
            id: `set_${Date.now()}`,
            key,
            value: String(value),
            updatedAt: new Date()
          });
        }
      }
    }

    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
