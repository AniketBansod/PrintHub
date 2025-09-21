import React, { useState } from 'react';
import { motion } from 'framer-motion';
import customerQueries from '../data/customerQueries.json';
import { MessageCircle, X, Send } from 'lucide-react';

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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg mt-2"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Print Assistant</h3>
            <button
              onClick={toggleChatbot}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="h-64 overflow-y-auto mb-4 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Ask me anything about printing!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 ml-8'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-8'
                  }`}
                >
                  {message.text}
                </div>
              ))
            )}
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors duration-200"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChatbot}
        className="bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>
    </div>
  );
};

export default Chatbot; 