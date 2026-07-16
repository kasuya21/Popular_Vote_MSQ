const express = require('express');
const candidateController = require('../controllers/candidateController');
const packageController = require('../controllers/votePackageController');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Candidates
router.get('/candidates', candidateController.getPublicCandidates);
router.get('/candidates/:id', candidateController.getPublicCandidateById);
router.get('/rankings', candidateController.getRankings);

// Packages
router.get('/vote-packages', packageController.getPublicPackages);

// Orders
router.post('/orders', orderController.createOrder);
router.get('/orders/by-email', orderController.getOrdersByEmail);
router.get('/orders/:orderNo', orderController.getOrder);
router.post('/orders/:orderNo/upload-slip', require('../middleware/upload').single('slip'), orderController.uploadSlip);

// Payments & Webhooks
router.post('/payments/webhook', orderController.handleWebhook);
router.post('/payments/mock-webhook', orderController.mockWebhook); // DEV only

module.exports = router;
