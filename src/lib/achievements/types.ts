export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  conditionType: string;
  conditionValue: Record<string, any>;
  iconName: string;
  points: number;
  createdAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  achievement?: Achievement;
}