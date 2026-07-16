const prisma = require('../utils/prisma');
const AppError = require('../utils/errors');
const { createCandidateSchema, updateCandidateSchema } = require('../validators/schemas');
const { getFromCache, setToCache } = require('../services/cacheService');

// --- PUBLIC APIs ---

exports.getPublicCandidates = async (req, res, next) => {
  try {
    const cacheKey = 'public_candidates_all';
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({ success: true, data: cachedData, cached: true });
    }

    const candidates = await prisma.candidate.findMany({
      where: {
        isActive: true,
        isDeleted: false
      },
      select: {
        id: true,
        candidateNumber: true,
        category: true,
        nickname: true,
        fullName: true,
        faculty: true,
        profileImage: true,
        voteCount: true,
      }
    });

    // Natural sort by category then candidateNumber (e.g. S2 before S10)
    candidates.sort((a, b) => {
      if (a.category !== b.category) {
        return (a.category || '').localeCompare(b.category || '');
      }
      return (a.candidateNumber || '').localeCompare(b.candidateNumber || '', undefined, { numeric: true, sensitivity: 'base' });
    });

    setToCache(cacheKey, candidates, 10); // Cache for 10 seconds
    res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    next(error);
  }
};

exports.getPublicCandidateById = async (req, res, next) => {
  try {
    const cacheKey = `public_candidate_${req.params.id}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({ success: true, data: cachedData, cached: true });
    }

    const candidate = await prisma.candidate.findFirst({
      where: {
        id: req.params.id,
        isActive: true,
        isDeleted: false
      },
      select: {
        id: true,
        candidateNumber: true,
        category: true,
        nickname: true,
        fullName: true,
        faculty: true,
        major: true,
        year: true,
        bio: true,
        talent: true,
        motto: true,
        socialInstagram: true,
        socialFacebook: true,
        socialTiktok: true,
        profileImage: true,
        coverImage: true,
        galleryImages: true,
        introVideoUrl: true,
        voteCount: true
      }
    });

    if (!candidate) {
      return next(new AppError('Candidate not found', 404));
    }

    setToCache(cacheKey, candidate, 10);
    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    next(error);
  }
};

exports.getRankings = async (req, res, next) => {
  try {
    const { category } = req.query;

    const cacheKey = `public_rankings_${category || 'all'}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      return res.status(200).json({ success: true, data: cachedData, cached: true });
    }

    const where = {
      isActive: true,
      isDeleted: false
    };

    if (category) {
      where.category = category;
    }

    const rankings = await prisma.candidate.findMany({
      where,
      select: {
        id: true,
        candidateNumber: true,
        category: true,
        nickname: true,
        fullName: true,
        faculty: true,
        profileImage: true,
        voteCount: true,
      },
      orderBy: {
        voteCount: 'desc'
      }
    });

    setToCache(cacheKey, rankings, 10);
    res.status(200).json({ success: true, data: rankings });
  } catch (error) {
    next(error);
  }
};

// --- ADMIN APIs ---

exports.getAdminCandidates = async (req, res, next) => {
  try {
    const candidates = await prisma.candidate.findMany({
      where: { isDeleted: false }
    });

    // Natural sort by category then candidateNumber
    candidates.sort((a, b) => {
      if (a.category !== b.category) {
        return (a.category || '').localeCompare(b.category || '');
      }
      return (a.candidateNumber || '').localeCompare(b.candidateNumber || '', undefined, { numeric: true, sensitivity: 'base' });
    });

    res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    next(error);
  }
};

exports.createCandidate = async (req, res, next) => {
  try {
    const data = createCandidateSchema.shape.body.parse(req.body);

    const candidate = await prisma.candidate.create({
      data: {
        ...data,
        fullName: data.nickname,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        createdById: req.admin.id
      }
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'CREATE',
        entityType: 'Candidate',
        entityId: candidate.id,
        afterData: candidate
      }
    });

    res.status(201).json({ success: true, data: candidate });
  } catch (error) {
    if (error.code === 'P2002') {
      return next(new AppError('Candidate number in this category already exists', 400));
    }
    next(error);
  }
};

exports.updateCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = updateCandidateSchema.shape.body.parse(req.body);

    // Prevent updating voteCount directly
    delete data.voteCount;

    const oldCandidate = await prisma.candidate.findUnique({ where: { id } });
    if (!oldCandidate) return next(new AppError('Candidate not found', 404));

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        ...data,
        fullName: data.nickname || oldCandidate.nickname,
        updatedById: req.admin.id
      }
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'UPDATE',
        entityType: 'Candidate',
        entityId: candidate.id,
        beforeData: oldCandidate,
        afterData: candidate
      }
    });

    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    next(error);
  }
};

exports.toggleActive = async (req, res, next) => {
  try {
    const { id } = req.params;

    const oldCandidate = await prisma.candidate.findUnique({ where: { id } });
    if (!oldCandidate) return next(new AppError('Candidate not found', 404));

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        isActive: !oldCandidate.isActive,
        updatedById: req.admin.id
      }
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'TOGGLE_ACTIVE',
        entityType: 'Candidate',
        entityId: candidate.id,
        beforeData: { isActive: oldCandidate.isActive },
        afterData: { isActive: candidate.isActive }
      }
    });

    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    next(error);
  }
};

exports.softDelete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const oldCandidate = await prisma.candidate.findUnique({ where: { id } });
    if (!oldCandidate) return next(new AppError('Candidate not found', 404));

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
        updatedById: req.admin.id
      }
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'SOFT_DELETE',
        entityType: 'Candidate',
        entityId: candidate.id,
        beforeData: { isDeleted: false },
        afterData: { isDeleted: true }
      }
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        entityType: 'Candidate',
        entityId: req.params.id
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
