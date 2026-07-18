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

// Orders & Payments (Moved to Admin POS system)
// Note: Online voting is disabled, so public order routes have been removed.

module.exports = router;
