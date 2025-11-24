import React, { useState } from 'react';
import { Customer } from '../types';
import { Avatar } from './Avatar';

interface SidebarProps {
  customers: Customer[];
  activeCustomerId: string | null;
  onSelectCustomer: (id: string) => void;
  onAddCustomer: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  customers,
  activeCustomerId,
  onSelectCustomer,
  onAddCustomer,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomerName.trim()) {
      onAddCustomer(newCustomerName.trim());
      setNewCustomerName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-[250px] md:w-[280px] bg-[#2e2e2e] h-full flex flex-col flex-shrink-0 text-white">
      {/* Header / My Profile */}
      <div className="p-4 flex items-center justify-between bg-[#2e2e2e] pb-2">
        <div className="flex items-center gap-3">
          <Avatar seed="myself_agent_001" size="md" />
          <span className="font-semibold text-sm opacity-90">老李 (技术支持)</span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-gray-400 hover:text-white transition bg-[#3e3e3e] p-1.5 rounded"
          title="添加客户"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* Add Customer Form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="px-3 pb-2">
          <input
            autoFocus
            type="text"
            className="w-full bg-[#1f1f1f] text-white text-sm px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-green-500"
            placeholder="输入客户称呼..."
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
          />
        </form>
      )}

      {/* Search Bar (Visual only for this demo) */}
      <div className="px-3 py-2">
        <div className="bg-[#262626] rounded-md flex items-center px-2 py-1">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="搜索" className="bg-transparent border-none text-xs text-white ml-2 focus:outline-none w-full" disabled />
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {customers.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectCustomer(c.id)}
            className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors ${
              activeCustomerId === c.id ? 'bg-[#c7c6c6] text-black' : 'hover:bg-[#3b3b3b] hover:text-white text-gray-200'
            }`}
          >
            <Avatar seed={c.avatarSeed} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-medium text-sm truncate">{c.name}</span>
                <span className="text-[10px] opacity-60">
                  {c.lastMessageTime
                    ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : ''}
                </span>
              </div>
              <p className="text-xs opacity-60 truncate">
                {c.lastMessage || '暂无消息'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};