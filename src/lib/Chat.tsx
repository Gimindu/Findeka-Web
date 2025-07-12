import React, { useState } from 'react';
import { Send, User, QrCode } from 'lucide-react'; // Ensure icons are imported
import colorClasses from '@/styles/colors'; // Make sure this file exists and contains the color classes you need

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Jane Smith', message: 'Hi! I found a wallet that matches your description. Could you confirm the details?', timestamp: '2:30 PM', isUser: false },
    { id: 2, sender: 'You', message: 'Yes! It\'s a brown leather wallet. Does it have a driver\'s license for John Doe?', timestamp: '2:32 PM', isUser: true },
    { id: 3, sender: 'Jane Smith', message: 'Yes, it does! Where would you like to meet to get it back?', timestamp: '2:35 PM', isUser: false }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        sender: 'You',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: true
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${colorClasses.textPrimary}`}>Messages</h1>

      <div className="bg-white rounded-lg shadow-sm border border-orange-100 h-96 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <div>
              <div className={`font-semibold ${colorClasses.textPrimary}`}>Jane Smith</div>
              <div className={`text-sm ${colorClasses.textSecondary}`}>About: Found Wallet</div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg ${
                message.isUser 
                  ? `${colorClasses.primary} text-white` 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="text-sm">{message.message}</div>
                <div className={`text-xs mt-1 ${message.isUser ? 'text-orange-100' : 'text-gray-500'}`}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-orange-100">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className={`flex-1 px-3 py-2 border ${colorClasses.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DD6B20]`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className={`px-4 py-2 ${colorClasses.primary} ${colorClasses.primaryHover} rounded-lg transition-colors`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
