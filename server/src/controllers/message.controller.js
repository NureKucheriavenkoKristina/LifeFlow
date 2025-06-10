const Message = require('../models/message.model');
const User = require('../models/user.model');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    
    // Create new message
    const newMessage = new Message({
      senderId: req.user.id,
      receiverId,
      content
    });
    
    await newMessage.save();
    
    res.status(201).json({
      message: 'Message sent successfully',
      newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get conversation
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get messages between users
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    
    res.status(200).json({
      messages
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all conversations
exports.getAllConversations = async (req, res) => {
  try {
    // Get all sent and received messages
    const sentMessages = await Message.find({ senderId: req.user.id })
      .sort({ createdAt: -1 });
      
    const receivedMessages = await Message.find({ receiverId: req.user.id })
      .sort({ createdAt: -1 });
    
    // Combine and get unique conversation partners
    const allMessages = [...sentMessages, ...receivedMessages];
    
    const conversationPartners = [];
    const userIds = new Set();
    
    for (const msg of allMessages) {
      const partnerId = msg.senderId.toString() === req.user.id.toString()
        ? msg.receiverId
        : msg.senderId;
      
      if (!userIds.has(partnerId.toString())) {
        userIds.add(partnerId.toString());
        conversationPartners.push({
          userId: partnerId,
          lastMessage: msg
        });
      }
    }
    
    // Get user details for each partner
    const conversations = await Promise.all(
      conversationPartners.map(async (conv) => {
        const user = await User.findById(conv.userId)
          .select('firstName surName role');
          
        return {
          user,
          lastMessage: conv.lastMessage
        };
      })
    );
    
    res.status(200).json({
      conversations
    });
  } catch (error) {
    console.error('Get all conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create conversation
exports.createConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;
    
    // Проверка входных данных
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if there are any existing messages
    const existingMessages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: -1 }).limit(1);
    
    const lastMessage = existingMessages.length > 0 ? existingMessages[0] : null;
    
    // Create conversation object
    const conversation = {
      user: {
        _id: user._id,
        firstName: user.firstName,
        surName: user.surName,
        role: user.role
      },
      lastMessage
    };
    
    // Отладочный вывод
    console.log('Created conversation:', conversation);
    
    return res.status(201).json({ 
      message: 'Conversation created', 
      conversation 
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    
    // Delete all messages between these users
    const result = await Message.deleteMany({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    });
    
    res.status(200).json({ 
      message: 'Conversation deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};