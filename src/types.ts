export type TaskCategory = 'learning' | 'life';

export type TaskTone = 'blue' | 'purple' | 'green' | 'pink' | 'orange' | 'teal';

export interface Task {
  id: number;
  name: string;
  icon: IconName;
  tone: TaskTone;
  category: TaskCategory;
  score: number;
}

export interface Reward {
  id: number;
  name: string;
  cost: number;
}

export interface HistoryItem {
  id: number;
  time: string;
  message: string;
  value: number;
  type: 'add' | 'spend' | 'system';
}

export interface AppData {
  childName: string;
  tasks: Task[];
  rewards: Reward[];
  crowns: number;
  history: HistoryItem[];
  pin: string | null;
}

export type IconName =
  | 'book'
  | 'chinese'
  | 'calculator'
  | 'language'
  | 'performance'
  | 'broom'
  | 'run'
  | 'moon'
  | 'tidy'
  | 'star'
  | 'crown'
  | 'gift'
  | 'user'
  | 'settings'
  | 'history'
  | 'plus'
  | 'minus'
  | 'download'
  | 'upload'
  | 'key'
  | 'trash'
  | 'edit'
  | 'close'
  | 'check';
