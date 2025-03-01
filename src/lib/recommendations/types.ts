import { Media } from "@/types";

export interface UserPreferences {
  mediaType: string;
  genreWeights: Record<string, number>;
  creatorWeights: Record<string, number>;
}

export interface Recommendation {
  id: string;
  mediaId: string;
  score: number;
  reason: string;
  media?: Media;
}