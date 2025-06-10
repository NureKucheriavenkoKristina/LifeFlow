const express = require('express');
const { createZoomMeeting } = require('../controllers/zoom.controller');
const { authenticateUser } = require('../middlewares/auth');

const router = express.Router();

router.post('/create-meeting', authenticateUser, createZoomMeeting);

module.exports = router;
