import React, { useRef, useEffect, useState } from 'react';
import { Customer, Message } from '../types';
import { Avatar } from './Avatar';

interface ChatWindowProps {
  customer: Customer;
  messages: Message[];
  inputValue: string;
  isTyping: boolean;
  onInputChange: (val: string) => void;
  onSendMessage: (text: string, image?: string) => void;
  onRenameCustomer: (id: string, newName: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  customer,
  messages,
  inputValue,
  isTyping,
  onInputChange,
  onSendMessage,
  onRenameCustomer,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(customer.name);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Update temp name when customer changes
  useEffect(() => {
    setTempName(customer.name);
    setIsEditingName(false);
  }, [customer]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSendMessage(inputValue);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Directly send image upon selection for simplicity in this UX
        onSendMessage('', base64);
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNameSave = () => {
    if (tempName.trim() !== customer.name) {
      onRenameCustomer(customer.id, tempName.trim());
    }
    setIsEditingName(false);
  };

  const emojis = ['👍', '🤝', '👌', '🙏', '😂', '😊', '🤔', '📦', '🏭', '🔧', '🔩'];

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f5] h-full relative">
      {/* Header */}
      <div className="h-16 border-b border-[#e7e7e7] flex items-center justify-between px-6 bg-[#f5f5f5] select-none">
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <input
              autoFocus
              className="text-lg font-medium bg-white border border-gray-300 px-2 rounded"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
            />
          ) : (
            <h2 
              className="text-lg font-medium cursor-pointer hover:text-gray-600 flex items-center gap-2"
              onClick={() => setIsEditingName(true)}
              title="Click to rename"
            >
              {customer.name}
              <span className="opacity-0 hover:opacity-100 text-xs text-gray-400">✏️</span>
            </h2>
          )}
        </div>
        <div className="text-gray-400 cursor-pointer hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'} gap-3`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 pt-1">
              <Avatar 
                seed={msg.sender === 'me' ? 'myself_agent_001' : customer.avatarSeed} 
                size="sm" 
              />
            </div>

            {/* Bubble */}
            <div className={`max-w-[70%] relative group`}>
              {msg.type === 'text' && (
                <div
                  className={`px-3 py-2 rounded-md text-[15px] leading-relaxed break-words whitespace-pre-wrap shadow-sm relative ${
                    msg.sender === 'me'
                      ? 'bg-[#95ec69] text-black before:content-[""] before:absolute before:right-[-6px] before:top-3 before:w-0 before:h-0 before:border-t-[6px] before:border-t-transparent before:border-b-[6px] before:border-b-transparent before:border-l-[6px] before:border-l-[#95ec69]'
                      : 'bg-white text-black before:content-[""] before:absolute before:left-[-6px] before:top-3 before:w-0 before:h-0 before:border-t-[6px] before:border-t-transparent before:border-b-[6px] before:border-b-transparent before:border-r-[6px] before:border-r-white'
                  }`}
                >
                  {msg.text}
                </div>
              )}

              {msg.type === 'image' && msg.imageUrl && (
                <div className={`rounded-md overflow-hidden bg-white shadow-sm p-1 ${
                    msg.sender === 'me' ? 'bg-[#95ec69]' : 'bg-white'
                }`}>
                  <img src={msg.imageUrl} alt="Uploaded" className="max-w-[200px] max-h-[200px] object-cover rounded" />
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex flex-row gap-3">
             <div className="flex-shrink-0 pt-1">
                <Avatar seed={customer.avatarSeed} size="sm" />
             </div>
             <div className="bg-white px-4 py-3 rounded-md shadow-sm flex gap-1 items-center">
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="h-[180px] border-t border-[#e7e7e7] bg-[#f5f5f5] flex flex-col">
        {/* Toolbar */}
        <div className="h-10 flex items-center px-4 gap-4 text-[#606060]">
          {/* Emoji */}
          <div className="relative">
            <button onClick={() => setShowEmoji(!showEmoji)} className="hover:text-[#2e2e2e]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </button>
            {showEmoji && (
                <div className="absolute bottom-8 left-0 bg-white shadow-lg rounded p-2 grid grid-cols-4 gap-2 z-10 w-48 border border-gray-200">
                    {emojis.map(e => (
                        <button key={e} onClick={() => {onInputChange(inputValue + e); setShowEmoji(false)}} className="text-xl hover:bg-gray-100 rounded p-1">
                            {e}
                        </button>
                    ))}
                </div>
            )}
          </div>

          {/* Image Upload */}
          <button onClick={() => fileInputRef.current?.click()} className="hover:text-[#2e2e2e]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/png, image/jpeg, image/webp" 
            onChange={handleFileChange} 
          />
        </div>

        {/* Text Area */}
        <textarea
          className="flex-1 bg-[#f5f5f5] px-5 py-2 resize-none focus:outline-none text-[15px] font-sans"
          placeholder=""
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Footer Send Button */}
        <div className="h-12 flex items-center justify-end px-6">
          <button
            onClick={() => {
                if (inputValue.trim()) onSendMessage(inputValue);
            }}
            className="bg-[#e9e9e9] hover:bg-[#d2d2d2] text-[#07c160] px-6 py-1.5 rounded text-sm font-medium transition-colors"
          >
            发送 (S)
          </button>
        </div>
      </div>
    </div>
  );
};