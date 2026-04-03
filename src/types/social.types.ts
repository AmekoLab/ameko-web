export interface SocialProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  imageUrls: string[];
  quantity: number;
  isAvailable: boolean;
}

export interface Post {
  id: number;
  userId: string;
  title: string;
  createdAt: string;
  assembledProductId?: string | null;
  attachmentUrls: string[];
  reactionCount: number;
  commentCount: number;
  product?: SocialProduct | null;
  // TODO: backend currently returns only userId
  username?: string;
  fullName?: string;
  // TODO: backend currently returns only userId
  avatarUrl?: string;
  shopId?: string | null;
  role?: string;
  currentReaction?: PostReactionType | null; // Added to fix the reload issue
}

export interface FeedResponseData {
  items: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CreatePostPayload {
  title: string;
  assembledProductId?: string;
  attachmentUrls: string[];
}

export interface UpdatePostPayload {
  title: string;
}

export interface DeletePostData {
  id: number;
}

export type PostReactionType =
  | "Like"
  | "Love"
  | "Haha"
  | "Wow"
  | "Sad"
  | "Angry";

export interface PostReaction {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  reactionType: PostReactionType;
  createdAt: string;
  isReacted?: boolean;
}

export interface ReactToPostPayload {
  type: PostReactionType;
}

export interface ReactToPostData {
  success: boolean;
}

export interface SocialComment {
  id: number;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  content: string;
  createdAt: string;
}

export interface CommentsResponseData {
  items: SocialComment[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface AddCommentPayload {
  content: string;
}
