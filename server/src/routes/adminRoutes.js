const express = require('express');
const { authenticateAdmin, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const adminAuthRoutes = require('./adminAuthRoutes');
const candidateController = require('../controllers/candidateController');
const packageController = require('../controllers/votePackageController');

const router = express.Router();

// Auth routes don't require global auth (login is public to admins)
router.use('/auth', adminAuthRoutes);

// Apply authentication to all routes below
router.use(authenticateAdmin);

// --- CANDIDATE MANAGEMENT ---
router.get('/candidates', requireRole('SUPER_ADMIN', 'EVENT_ADMIN', 'CONTENT_ADMIN', 'VIEWER'), candidateController.getAdminCandidates);
router.post('/candidates', requireRole('SUPER_ADMIN', 'EVENT_ADMIN', 'CONTENT_ADMIN'), candidateController.createCandidate);
router.patch('/candidates/:id', requireRole('SUPER_ADMIN', 'EVENT_ADMIN', 'CONTENT_ADMIN'), candidateController.updateCandidate);
router.patch('/candidates/:id/toggle-active', requireRole('SUPER_ADMIN', 'EVENT_ADMIN', 'CONTENT_ADMIN'), candidateController.toggleActive);
router.delete('/candidates/:id', requireRole('SUPER_ADMIN', 'EVENT_ADMIN', 'CONTENT_ADMIN'), candidateController.softDelete);
router.get('/candidates/:id/history', requireRole('SUPER_ADMIN', 'EVENT_ADMIN', 'CONTENT_ADMIN', 'VIEWER'), candidateController.getHistory);

// --- VOTE PACKAGE MANAGEMENT ---
router.get('/vote-packages', requireRole('SUPER_ADMIN', 'EVENT_ADMIN', 'VIEWER'), packageController.getAdminPackages);
router.post('/vote-packages', requireRole('SUPER_ADMIN', 'EVENT_ADMIN'), packageController.createPackage);
router.patch('/vote-packages/:id', requireRole('SUPER_ADMIN', 'EVENT_ADMIN'), packageController.updatePackage);
router.patch('/vote-packages/:id/toggle-active', requireRole('SUPER_ADMIN', 'EVENT_ADMIN'), packageController.toggleActive);

// --- FILE UPLOADS ---
router.post('/uploads/images', requireRole('SUPER_ADMIN', 'EVENT_ADMIN', 'CONTENT_ADMIN'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // Cloudinary provides the URL in req.file.path
  const imageUrl = req.file.path;
  res.status(200).json({ success: true, url: imageUrl });
});

const paymentController = require('../controllers/paymentController');

// --- PAYMENTS & RECONCILIATION ---
router.get('/payments', requireRole('SUPER_ADMIN', 'FINANCE_ADMIN', 'VIEWER'), paymentController.getPayments);
router.get('/payments/reconciliation', requireRole('SUPER_ADMIN', 'FINANCE_ADMIN'), paymentController.getReconciliation);
router.get('/payments/:orderNo', requireRole('SUPER_ADMIN', 'FINANCE_ADMIN', 'VIEWER'), paymentController.getPaymentDetail);
router.patch('/payments/:orderNo/note', requireRole('SUPER_ADMIN', 'FINANCE_ADMIN'), paymentController.updatePaymentNote);

// --- MANUAL SLIP APPROVAL ---
const orderController = require('../controllers/orderController');
router.post('/orders/:orderNo/approve', requireRole('SUPER_ADMIN', 'FINANCE_ADMIN', 'EVENT_ADMIN'), orderController.approveSlip);
router.post('/orders/:orderNo/reject', requireRole('SUPER_ADMIN', 'FINANCE_ADMIN', 'EVENT_ADMIN'), orderController.rejectSlip);

// --- REFUNDS ---
router.get('/refunds', requireRole('SUPER_ADMIN', 'FINANCE_ADMIN', 'VIEWER'), paymentController.getRefunds);

module.exports = router;
