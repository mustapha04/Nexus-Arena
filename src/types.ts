export interface Game {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
  freetogame_profile_url: string;
  screenshots?: { id: number; image: string }[];
  minimum_system_requirements?: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
}

export interface Deal {
  title: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  thumb: string;
  dealID: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
  role: 'user' | 'admin';
  isBanned?: boolean;
  created_at: string;
  combat_level?: number;
  artifacts_found?: number;
  grid_uptime?: string;
  core_integrity?: string;
}

export interface FavoriteItem {
  id?: string;
  user_id: string;
  game_id: string;
  title: string;
  image: string;
  created_at: string;
}

export interface WishlistItem {
  id?: string;
  user_id: string;
  game_id: string;
  title: string;
  image: string;
  created_at: string;
}

export interface GameList {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  games: string[]; // game IDs
  created_at: string;
}

export interface Rating {
  id?: string;
  user_id: string;
  game_id: string;
  rating: number;
  created_at: string;
}

export interface Comment {
  id?: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  game_id: string;
  content: string;
  likes: number;
  liked_by?: string[]; // IDs of users who liked
  created_at: string;
}

export interface AffiliateLink {
  id: string;
  game_id: string;
  platform: string;
  affiliate_url: string;
  clicks: number;
  created_at: string;
  is_active?: boolean;
}

export interface AffiliateClick {
  id: string;
  user_id?: string;
  game_id: string;
  platform: string;
  clicked_at: string;
}

export interface GameStats {
  id: string;
  game_id: string;
  views: number;
  searches: number;
}
