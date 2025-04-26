import React, { useState, useEffect, useRef } from 'react';
import ollama from 'ollama/browser';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  model: string;
  placeholder?: string;
}

const Chat: React.FC<ChatProps> = ({ model, placeholder = 'Type a message...' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
    setMessages(prev => [...prev, { role: 'user', content }]);
    setInput('');
    const msgsForModel = [...messages, { role: 'user', content }];
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    try {
      const stream = await ollama.chat({ model, messages: msgsForModel, stream: true });
      for await (const chunk of stream) {
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg.role !== 'assistant') return prev;
          const updated = { ...lastMsg, content: lastMsg.content + chunk.message.content };
          return [...prev.slice(0, -1), updated];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={clsx(
              'p-3 rounded-lg max-w-[80%]',
              msg.role === 'user'
                ? 'self-end bg-blue-100 text-black'
                : 'self-start bg-gray-200 text-black'
            )}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t flex items-center space-x-2">
        <input
          type="text"
          className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;