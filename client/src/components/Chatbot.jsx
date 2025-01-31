import React, { useState } from 'react';
import { motion } from 'framer-motion';
import customerQueries from '../data/customerQueries.json';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = () => {
    if (!input) return;

    // Add user message to chat
    setMessages([...messages, { sender: 'user', text: input }]);

    // Find a matching response from the JSON data
    const query = customerQueries.queries.find(q => q.question.toLowerCase() === input.toLowerCase());
    const response = query ? query.response : "Sorry, I don't understand that question.";

    // Add bot response to chat
    setMessages([...messages, { sender: 'user', text: input }, { sender: 'bot', text: response }]);
    setInput('');
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      // Clear messages when closing the chatbot
      setMessages([]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={toggleChatbot}
        className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
      >
        Chat
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="max-w-md w-full bg-gray-800 text-white p-4 border border-gray-700 rounded-lg shadow-lg mt-2"
        >
          <div className="h-64 overflow-y-auto mb-4 bg-gray-900 p-2 rounded">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: msg.sender === 'user' ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-2 mb-2 rounded ${
                  msg.sender === 'user' ? 'bg-blue-700 text-right' : 'bg-green-700 text-left'
                }`}
              >
                {msg.text}
              </motion.div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-grow p-2 border border-gray-600 rounded-l bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Chatbot; 