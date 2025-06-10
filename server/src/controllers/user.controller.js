const User = require('../models/user.model');

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search by firstName, surName, or role
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { surName: { $regex: query, $options: 'i' } },
        { role: { $regex: query, $options: 'i' } }
      ]
    })
    .select('_id firstName surName role')
    .limit(10);
    
    res.status(200).json({ users });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error' });
  }

  
};