const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticateUser } = require('../middlewares/auth');
const { validateMessage } = require('../middlewares/validation');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Send message
router.post('/send', validateMessage, messageController.sendMessage);

// Get conversation with specific user
router.get('/conversation/:userId', messageController.getConversation);

// Get all conversations
router.get('/conversations', messageController.getAllConversations);

// Create a new conversation
router.post('/create-conversation', messageController.createConversation);

// Delete conversation
router.delete('/conversation/:userId', messageController.deleteConversation);

module.exports = router;