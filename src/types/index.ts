export type MediaType = 'movie' | 'tv_show' | 'game' | 'book' | 'music' | 'comic' | 'manga' | 'anime';

export type Role = 'admin' | 'moderator' | 'member' | 'viewer';

export type BackupStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
}

export interface Genre {
  id: string;
  name: string;
  mediaType: MediaType;
}

export interface List {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPrivate: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListItem {
  id: string;
  listId: string;
  mediaId: string;
  addedAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  mediaId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface ExtendedPost extends Post {
  commentCount: number;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  mediaId: string;
  rating: number;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  members?: {
    count: number;
  };
  createdBy: string;
  mediaType?: MediaType;
  isPrivate: boolean;
  createdAt: Date;
}

export interface CommunityMember {
  communityId: string;
  userId: string;
  role: Role;
  joinedAt: Date;
}

export interface Conversation {
  id: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  content: string;
  relatedId?: string;
  read: boolean;
  createdAt: Date;
}

export interface ActivityItem {
  id: string;
  userId: string;
  type: string;
  content: any;
  createdAt: Date;
}

export interface Backup {
  id: string;
  userId: string;
  size: number;
  fileUrl?: string;
  status: BackupStatus;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface BackupItem {
  id: string;
  backupId: string;
  itemType: string;
  itemCount: number;
  createdAt: Date;
}

export interface BackupStats {
  totalSize: number;
  backupCount: number;
  lastBackupAt?: Date;
  nextScheduledBackup?: Date;
}

export type ExternalSourceType = 
  | 'tmdb'
  | 'igdb'
  | 'google_books'
  | 'lastfm'
  | 'comic_vine';

export interface Attribution {
  source: string;
  sourceUrl: string;
  license?: string;
  timestamp: string;
}

export interface ExternalReference {
  id: string;
  mediaId: string;
  externalId: string;
  externalSource: ExternalSourceType;
  referenceData: Record<string, any>;
  attribution: Attribution;
  lastFetched: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Media {
  id: string;
  title: string;
  description?: string;
  mediaType: MediaType;
  releaseDate?: Date;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  averageRating?: number;
  totalReviews?: number;
  externalReference?: ExternalReference;
}

export interface MediaReference {
  internalId?: string;
  externalId: string;
  externalSource: ExternalSourceType;
  title: string;
  description?: string;
  mediaType: MediaType;
  releaseDate?: Date;
  coverImage?: string;
  averageRating?: number;
  totalReviews?: number;
  attribution: Attribution;
  referenceData?: Record<string, any>;
}

export interface SearchFilters {
  query?: string;
  mediaTypes?: MediaType[];
  genres?: string[];
  minRating?: number;
  maxRating?: number;
  releaseYearStart?: number;
  releaseYearEnd?: number;
  sortBy?: 'rating' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
  publishedAt: string;
  source: string;
  type: 'upcoming_release' | 'game_update' | 'new_release' | 'news';
}