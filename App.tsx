import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { Customer, Message, ChatSession } from './types';
import { generateReply } from './services/geminiService';

// Initial Mock Data
const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: '王总 (宏达机械)', avatarSeed: '101', lastMessage: '上次那个M6的丝锥还有货吗？', lastMessageTime: Date.now() - 3600000 },
  { id: 'c2', name: '张工 (精密模具)', avatarSeed: '202', lastMessage: '滚花轮纹路有点浅，怎么调？', lastMessageTime: Date.now() - 86400000 },
  { id: 'c3', name: '李老板 (五金加工)', avatarSeed: '303', lastMessage: '收到货了，质量不错。', lastMessageTime: Date.now() - 172800000 },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'c1': [
    { id: 'm1', sender: 'other', text: '老李，上次那个M6的丝锥还有货吗？', type: 'text', timestamp: Date.now() - 3600000 },
  ],
  'c2': [
    { id: 'm2', sender: 'other', text: '滚花轮纹路有点浅，怎么调？', type: 'text', timestamp: Date.now() - 86400000 },
  ],
  'c3': [
    { id: 'm3', sender: 'other', text: '收到货了，质量不错。', type: 'text', timestamp: Date.now() - 172800000 },
  ]
};

const App: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [activeCustomerId, setActiveCustomerId] = useState<string>('c1');
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [inputDrafts, setInputDrafts] = useState<Record<string, string>>({});
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});

  const activeCustomer = customers.find(c => c.id === activeCustomerId);

  // Helper to add message locally
  const addMessage = useCallback((customerId: string, message: Message) => {
    setChatHistory(prev => ({
      ...prev,
      [customerId]: [...(prev[customerId] || []), message]
    }));
    
    // Update sidebar snippet
    setCustomers(prev => prev.map(c => {
        if (c.id === customerId) {
            return {
                ...c,
                lastMessage: message.type === 'image' ? '[图片]' : message.text,
                lastMessageTime: message.timestamp
            };
        }
        return c;
    }));
  }, []);

  const handleSendMessage = async (text: string, imageBase64?: string) => {
    if (!activeCustomerId) return;

    const currentCustId = activeCustomerId; // lock ID

    // 1. User Message
    const userMsgId = Date.now().toString();
    const userMsg: Message = {
      id: userMsgId,
      text: text,
      type: imageBase64 ? 'image' : 'text',
      imageUrl: imageBase64,
      sender: 'me', // Visual: Right side (Green). This is the "User" of the app (The Customer asking Qs).
      timestamp: Date.now()
    };

    addMessage(currentCustId, userMsg);
    
    // Clear Input
    setInputDrafts(prev => ({ ...prev, [currentCustId]: '' }));
    
    // 2. AI Processing state
    setIsTyping(prev => ({ ...prev, [currentCustId]: true }));

    // 3. AI Generates Reply (The "Agent" replies)
    // We reverse the roles for the AI context: 
    // AI thinks it is "Model" (Agent), User is "User" (Customer).
    // In our UI: User(Green/Right) -> AI(White/Left).
    // In our Type: User='me', AI='other'.
    
    // History needs to be formatted correctly.
    const history = chatHistory[currentCustId] || [];
    
    // The "history" passed to Gemini needs to know who said what.
    // Our 'me' (User/Customer) -> Gemini 'user'.
    // Our 'other' (Agent) -> Gemini 'model'.
    const responseText = await generateReply(text, history, imageBase64);

    // 4. AI Message
    const botMsg: Message = {
      id: Date.now().toString() + '_bot',
      text: responseText,
      type: 'text', // AI only sends text for now
      sender: 'other', // Visual: Left side (White). This is the Agent.
      timestamp: Date.now()
    };

    setIsTyping(prev => ({ ...prev, [currentCustId]: false }));
    addMessage(currentCustId, botMsg);
  };

  const handleInputChange = (val: string) => {
    if (activeCustomerId) {
      setInputDrafts(prev => ({ ...prev, [activeCustomerId]: val }));
    }
  };

  const handleAddCustomer = (name: string) => {
    const newId = 'c' + Date.now();
    const newCustomer: Customer = {
      id: newId,
      name: name,
      avatarSeed: Math.random().toString(),
      lastMessage: '刚添加了好友',
      lastMessageTime: Date.now()
    };
    setCustomers(prev => [newCustomer, ...prev]);
    setActiveCustomerId(newId);
    setChatHistory(prev => ({ ...prev, [newId]: [] }));
  };

  const handleRenameCustomer = (id: string, newName: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  return (
    <div className="flex w-full h-full">
      <Sidebar 
        customers={customers} 
        activeCustomerId={activeCustomerId}
        onSelectCustomer={setActiveCustomerId}
        onAddCustomer={handleAddCustomer}
      />
      {activeCustomer ? (
        <ChatWindow
          customer={activeCustomer}
          messages={chatHistory[activeCustomerId] || []}
          inputValue={inputDrafts[activeCustomerId] || ''}
          isTyping={!!isTyping[activeCustomerId]}
          onInputChange={handleInputChange}
          onSendMessage={handleSendMessage}
          onRenameCustomer={handleRenameCustomer}
        />
      ) : (
        <div className="flex-1 bg-[#f5f5f5] flex items-center justify-center text-gray-400 select-none">
          <div className="text-center">
            <span className="text-6xl block mb-4">💬</span>
            <p>选择一个客户开始聊天</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;