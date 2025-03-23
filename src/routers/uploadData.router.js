const express = require('express');
const { uploadData } = require('../controllers/uploadData.controller');
const router = express.Router();



router.post('/upload-internship', uploadData);

module.exports = router;