const { createMeeting } = require('../services/zoomService');
const {model} = require("mongoose");
const User = model('User');

exports.createZoomMeeting = async (req, res) => {
    try {
        const { receiverId, topic } = req.body;

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        const now = new Date();
        const meeting = await createMeeting(topic || 'Blood Donation Coordination', now.toISOString(), 30);

        return res.status(201).json({
            message: 'Zoom meeting created successfully',
            join_url: meeting,
        });
    } catch (error) {
        console.error('Failed to create Zoom meeting:', error);
        return res.status(500).json({ message: 'Failed to create Zoom meeting' });
    }
};
