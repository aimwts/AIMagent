
export enum AgentRole {
  PLANNER = 'Planner',
  MANAGER = 'Manager',
  EXECUTOR = 'Executor',
  REVIEWER = 'Reviewer'
}

export interface AgentLog {
  id: string;
  role: AgentRole;
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: 'work' | 'personal' | 'health' | 'social';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  logs?: AgentLog[];
}

export interface AppState {
  tasks: Task[];
  events: CalendarEvent[];
  messages: ChatMessage[];
  currentGoal?: string;
  isProcessing: boolean;
}
