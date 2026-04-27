export type WishStatus =
  | "open"
  | "clarifying"
  | "in_progress"
  | "supported"
  | "completed";

export type ResponseType =
  | "Advice"
  | "Resource"
  | "Introduction"
  | "Opportunity"
  | "Support"
  | "Similar Experience";

export type WishCategory =
  | "Life"
  | "Creative"
  | "Learning"
  | "Career"
  | "Community";

export interface ProgressUpdate {
  id: string;
  title: string;
  detail: string;
  date: string;
}

export interface Wish {
  id: string;
  title: string;
  summary: string;
  originLabel?: string;
  description: string;
  whyImportant: string;
  currentBlocker: string;
  desiredResponseTypes: ResponseType[];
  category: WishCategory;
  status: WishStatus;
  responseCount: number;
  featured: boolean;
  allowAnonymous: boolean;
  allowPlatformSupport: boolean;
  createdAt: string;
  updatedAt: string;
  progressUpdates: ProgressUpdate[];
}

export interface Response {
  id: string;
  wishId: string;
  authorName: string;
  isAnonymous: boolean;
  type: ResponseType;
  content: string;
  createdAt: string;
}

export type MessageType = "text" | "image";

export type MessageRequestStatus = "pending" | "accepted" | "ignored";

export type ConversationStatus = "active" | "archived";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  messageType: MessageType;
  imageUrl?: string;
  isRead?: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userAId: string;
  userBId: string;
  otherUserName?: string;
  otherUserDisplayName?: string;
  otherUserAvatar?: string;
  wishContextId?: string;
  wishContextTitle?: string;
  status: ConversationStatus;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRequest {
  id: string;
  conversationId: string;
  senderName?: string;
  senderDisplayName?: string;
  senderAvatar?: string;
  lastMessage?: string;
  wishContextTitle?: string;
  status: MessageRequestStatus;
  createdAt: string;
}

