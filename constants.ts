
import { Task, CalendarEvent } from './types';

export const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Prepare weekly grocery list', completed: false, priority: 'medium', category: 'Personal' },
  { id: '2', title: 'Review project milestones', completed: true, priority: 'high', category: 'Work' },
  { id: '3', title: 'Schedule dental appointment', completed: false, priority: 'low', category: 'Health' },
];

export const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Morning Sync', startTime: '09:00', endTime: '09:30', type: 'work' },
  { id: 'e2', title: 'Gym Session', startTime: '17:30', endTime: '18:30', type: 'health' },
  { id: 'e3', title: 'Dinner with Sarah', startTime: '19:30', endTime: '21:00', type: 'social' },
];

export const AGENT_SYSTEM_PROMPTS = {
  PLANNER: `You are the Lead Planner for OmniAgent. Your job is to decompose the user's request into actionable sub-tasks. 
            Identify which specialized agents are needed (Manager, Executor, or Reviewer). 
            Output a clear execution strategy.`,
  MANAGER: `You are the Information Manager. You handle the persistent state like tasks, calendar events, and preferences. 
            You must provide the necessary context to other agents.`,
  EXECUTOR: `You are the Primary Executor. You perform the actual logic, calculations, and content generation. 
             Be concise and effective.`,
  REVIEWER: `You are the Final Quality Assurance Agent. Your job is to take the Executor's work and format it perfectly for the user. 
             Ensure it sounds professional, helpful, and aligns with the user's goal.`
};
