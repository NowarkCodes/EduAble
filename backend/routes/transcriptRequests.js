const express = require('express');
const router = express.Router();
const transcriptRequestController = require('../controllers/transcriptRequestController');

// Open endpoint for retrieving community list on the frontend
router.get('/', transcriptRequestController.getRequests);

module.exports = router;
