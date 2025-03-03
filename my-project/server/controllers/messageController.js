const Message = require('../models/Message');

exports.saveMessage = async (req, res) => {
  const { content, sender } = req.body;
  try {
    const newMessage = new Message({ content, sender });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save message' });
  }
};
