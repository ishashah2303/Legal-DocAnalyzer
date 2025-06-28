import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, User, Bot } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { type: 'assistant', content: 'Hello! I am DocBot 🤖 — your AI-powered Document Analyzer. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(
    localStorage.getItem('sessionId') || `session-${Date.now()}`
  );
  const messageEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('sessionId', sessionId);
  }, [sessionId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, session_id: sessionId }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'assistant', content: data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { type: 'assistant', content: 'Oops! Something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch('/api/clear-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const newId = `session-${Date.now()}`;
      setSessionId(newId);
      setMessages([
        { type: 'assistant', content: 'Chat cleared. Ready for a fresh start! 😊' }
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-[#F5F0EB] flex items-center justify-center">
      <div className="relative w-full p-0 h-[90vh] bg-white bg-opacity-70 backdrop-blur-lg rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Floating Accent Bar */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-36 h-1 bg-gradient-to-r from-[#A0522D] to-[#6B3A1E] rounded-full" />

        {/* Header */}
        <header className="flex justify-between items-center px-8 py-6">
          <h1 className="text-3xl font-extrabold text-[#6B3A1E]">DocBot</h1>
          <button
            onClick={clearChat}
            className="p-2 rounded-full hover:bg-[#A0522D]/20 transition"
          >
            <RefreshCw size={20} className="text-[#6B3A1E]" />
          </button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end gap-3">
                {msg.type === 'assistant' && (
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <Bot size={18} className="text-[#6B3A1E]" />
                  </div>
                )}
                <div
                  className={`relative max-w-[70%] px-5 py-3 text-sm break-words transition-opacity duration-300 ease-out
                    ${msg.type === 'user'
                      ? 'self-end bg-[#bd6e4a] text-white rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-xl shadow-inner'
                      : 'self-start bg-white text-gray-800 rounded-br-3xl rounded-tr-3xl rounded-bl-3xl rounded-tl-xl shadow'}`
                }
                >
                  {msg.content}
                </div>
                {msg.type === 'user' && (
                  <div className="w-8 h-8 bg-[#A0522D] rounded-full flex items-center justify-center shadow-inner">
                    <User size={18} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-inner">
                <Bot size={18} className="text-[#6B3A1E] animate-pulse" />
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
              </div>
            </div>
          )}

          <div ref={messageEndRef} />
        </div>

        {/* Input/Footer */}
        <footer className="px-8 py-4 bg-white border-t border-[#e5d4cc]">
          <div className="relative">
            <textarea
              rows={1}
              className="w-full resize-none border border-[#e5d4cc] rounded-full py-3 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D]"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition
                ${input.trim() && !isLoading
                  ? 'bg-[#A0522D] hover:bg-[#8b4525] text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <Send size={18} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ChatInterface;
