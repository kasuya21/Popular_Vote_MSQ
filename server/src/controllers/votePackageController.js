const prisma = require('../utils/prisma');
const AppError = require('../utils/errors');
const { createPackageSchema, updatePackageSchema } = require('../validators/schemas');

// --- PUBLIC APIs ---

exports.getPublicPackages = async (req, res, next) => {
  try {
    const packages = await prisma.votePackage.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });

    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    next(error);
  }
};

// --- ADMIN APIs ---

exports.getAdminPackages = async (req, res, next) => {
  try {
    const packages = await prisma.votePackage.findMany({
      orderBy: { price: 'asc' }
    });
    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    next(error);
  }
};

exports.createPackage = async (req, res, next) => {
  try {
    const data = createPackageSchema.shape.body.parse(req.body);
    
    const pkg = await prisma.votePackage.create({
      data
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'CREATE',
        entityType: 'VotePackage',
        entityId: pkg.id,
        afterData: pkg
      }
    });

    res.status(201).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

exports.updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updatePackageSchema.shape.body.parse(req.body);

    const oldPkg = await prisma.votePackage.findUnique({ where: { id } });
    if (!oldPkg) return next(new AppError('Package not found', 404));

    const pkg = await prisma.votePackage.update({
      where: { id },
      data
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'VotePackage',
        entityId: pkg.id,
        beforeData: oldPkg,
        afterData: pkg
      }
    });

    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

exports.toggleActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const oldPkg = await prisma.votePackage.findUnique({ where: { id } });
    if (!oldPkg) return next(new AppError('Package not found', 404));

    const pkg = await prisma.votePackage.update({
      where: { id },
      data: { isActive: !oldPkg.isActive }
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'TOGGLE_ACTIVE',
        entityType: 'VotePackage',
        entityId: pkg.id,
        beforeData: { isActive: oldPkg.isActive },
        afterData: { isActive: pkg.isActive }
      }
    });

    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};
