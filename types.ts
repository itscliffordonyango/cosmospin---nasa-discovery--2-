
export interface ApodData {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
}

export enum AppTab {
  HOME = 'home',
  EXPLORE = 'explore',
  RANDOM = 'random',
  FAVORITES = 'favorites'
}

export interface AppState {
  currentTab: AppTab;
  selectedApod: ApodData | null;
  favorites: ApodData[];
}
