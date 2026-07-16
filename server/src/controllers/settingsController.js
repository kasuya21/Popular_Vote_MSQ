const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ApiError } = require('../utils/errors.js');

/**
 * Get current system settings
 */
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' }
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'default',
          isRankingVisible: true
        }
      });
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Update system settings (Admin only)
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const { isRankingVisible } = req.body;

    const settings = await prisma.systemSettings.upsert({
      where: { id: 'default' },
      update: {
        isRankingVisible: isRankingVisible !== undefined ? isRankingVisible : true
      },
      create: {
        id: 'default',
        isRankingVisible: isRankingVisible !== undefined ? isRankingVisible : true
      }
    });

    res.json(settings);
  } catch (error) {
    next(error);
  }
};
