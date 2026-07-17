export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  allowSearch?: boolean;
  requireMessageRequests?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  participantIds: string[];
  createdBy: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  createdAt: string;
  seen?: boolean;
}

export interface MessageRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}
