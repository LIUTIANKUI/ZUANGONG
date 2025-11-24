export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other'; // 'me' is the AI/Agent, 'other' is the customer
  type: 'text' | 'image';
  imageUrl?: string; // Base64 or URL
  timestamp: number;
}

export interface Customer {
  id: string;
  name: string;
  avatarSeed: string; // For picsum
  lastMessage?: string;
  lastMessageTime?: number;
}

export interface ChatSession {
  customerId: string;
  messages: Message[];
  draft: string; // Current text in input
}

export enum ToolType {
  TAP = '丝锥',
  DRILL = '钻头',
  DIE = '板牙',
  KNURLING = '滚花刀',
}