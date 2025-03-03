import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Load previous messages from MongoDB
    socket.on('loadMessages', (loadedMessages) => {
      setMessages(loadedMessages);
    });

    // Receive new messages
    socket.on('receiveMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('loadMessages');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const messageData = {
        user: 'User1', // Replace with actual username
        text: message,
        timestamp: new Date().toISOString(),
      };

      // Send message to the server
      socket.emit('sendMessage', messageData);

      // Update UI immediately (optimistic update)
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setMessage('');
    }
  };

  return (
    <div>
      <h1>Push Messaging System</h1>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        <h2>Messages:</h2>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.user}</strong>: {msg.text} <em>({new Date(msg.timestamp).toLocaleTimeString()})</em>
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
//hi