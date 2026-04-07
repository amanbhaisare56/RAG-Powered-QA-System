const express = require('express');
const router = express.Router();
const { getAllDocs } = require('../controllers/docsController');

router.get('/', getAllDocs);

module.exports = router;