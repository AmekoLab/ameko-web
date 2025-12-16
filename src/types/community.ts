export interface Author {
  name: string;
  avatar: string;
  role?: string;
}

export interface PostStats {
  likes: number;
  comments: number;
  shares: number;
}

export interface PostSpecs {
  keyboard: string;
  switches: string;
  keycaps: string;
}

export interface Post {
  id: number;
  author: Author;
  time: string;
  content: string;
  images: string[];
  specs?: PostSpecs;
  stats: PostStats;
  isLiked?: boolean;
}

export interface PostComment {
  id: number;
  postId: number;
  author: Author;
  content: string;
  time: string;
}
