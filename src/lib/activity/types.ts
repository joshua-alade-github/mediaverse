export type ActivityType =
  | 'media_rate'
  | 'media_review'
  | 'list_create'
  | 'list_update'
  | 'follow_user'
  | 'achievement_earned'
  | 'comment_create'
  | 'media_complete';

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  content: string;
  metadata: Record<string, any>;
  createdAt: Date;
}