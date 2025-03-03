const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow React frontend
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/MessageDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Message Schema & Model
const messageSchema = new mongoose.Schema({
  user: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send stored messages when a user connects
  Message.find().then((messages) => {
    socket.emit('loadMessages', messages);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Handle sending messages
  socket.on('sendMessage', async (messageData) => {
    try {
      if (typeof messageData !== 'object' || !messageData.text) {
        console.error('Invalid message format:', messageData);
        return;
      }
  
      const newMessage = new Message({
        user: messageData.user || 'Anonymous', // Default user if missing
        text: messageData.text,
        timestamp: messageData.timestamp || new Date(),
      });
  
      await newMessage.save();
  
      // Broadcast only to other users
      socket.broadcast.emit('receiveMessage', newMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });
});  

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
