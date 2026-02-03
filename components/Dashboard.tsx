import React, { useState, useEffect } from 'react';
import { Task, CalendarEvent } from '../types';
import { CheckCircle2, Circle, Clock, Calendar, Star, Tag, Plus, Filter, X, ChevronDown } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  events: CalendarEvent[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
}

type EventFilter = 'all' | 'work' | 'personal' | 'health' | 'social';

const Dashboard: React.FC<DashboardProps> = ({ tasks, events, onToggleTask, onAddTask, onAddEvent }) => {
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('General');

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('09:00');
  const [newEventEndTime, setNewEventEndTime] = useState('10:00');
  const [newEventType, setNewEventType] = useState<'work' | 'personal' | 'health' | 'social'>('work');

  useEffect(() => {
    const handleOpenAddTask = () => setIsAddingTask(true);
    window.addEventListener('open-add-task', handleOpenAddTask);
    return () => window.removeEventListener('open-add-task', handleOpenAddTask);
  }, []);

  const filteredEvents = eventFilter === 'all' 
    ? events 
    : events.filter(event => event.type === eventFilter);

  const filterOptions: { label: string, value: EventFilter, color: string }[] = [
    { label: 'All', value: 'all', color: 'bg-slate-700' },
    { label: 'Work', value: 'work', color: 'bg-indigo-500' },
    { label: 'Personal', value: 'personal', color: 'bg-emerald-500' },
    { label: 'Health', value: 'health', color: 'bg-rose-500' },
    { label: 'Social', value: 'social', color: 'bg-amber-500' },
  ];

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    onAddTask({
      title: newTaskTitle,
      priority: newTaskPriority,
      category: newTaskCategory
    });
    
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskCategory('General');
    setIsAddingTask(false);
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    onAddEvent({
      title: newEventTitle,
      startTime: newEventStartTime,
      endTime: newEventEndTime,
      type: newEventType
    });

    setNewEventTitle('');
    setNewEventStartTime('09:00');
    setNewEventEndTime('10:00');
    setNewEventType('work');
    setIsAddingEvent(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
      {/* Task Section */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[500px]">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-blue-500" />
            Pending Tasks
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20">
              {tasks.filter(t => !t.completed).length} Total
            </span>
            <button 
              onClick={() => {
                setIsAddingTask(!isAddingTask);
                if (isAddingEvent) setIsAddingEvent(false);
              }}
              className={`p-1.5 rounded-lg transition-all ${isAddingTask ? 'bg-slate-800 text-slate-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700'}`}
            >
              {isAddingTask ? <X size={18} /> : <Plus size={18} />}
            </button>
          </div>
        </div>

        {isAddingTask && (
          <form onSubmit={handleAddTaskSubmit} className="p-6 bg-slate-800/30 border-b border-slate-800 animate-in slide-in-from-top duration-300">
            <div className="space-y-4">
              <input 
                type="text"
                autoFocus
                placeholder="What needs to be done?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block px-1">Priority</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none appearance-none cursor-pointer hover:border-slate-600 transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 bottom-2.5 text-slate-500 pointer-events-none" />
                </div>
                <div className="relative">
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block px-1">Category</label>
                  <input 
                    type="text"
                    placeholder="General"
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setIsAddingTask(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200">Cancel</button>
                <button type="submit" disabled={!newTaskTitle.trim()} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 hover:bg-blue-700">Create Task</button>
              </div>
            </div>
          </form>
        )}

        <div className="divide-y divide-slate-800 overflow-y-auto flex-1">
          {tasks.length === 0 ? (
            <div className="p-10 text-center text-slate-600 italic">No tasks found.</div>
          ) : (
            tasks.map(task => (
              <div key={task.id} onClick={() => onToggleTask(task.id)} className="group flex items-center gap-4 px-6 py-4 hover:bg-slate-800 transition-all cursor-pointer">
                {task.completed ? <CheckCircle2 className="text-emerald-500 shrink-0" size={20} /> : <Circle className="text-slate-600 group-hover:text-blue-500 shrink-0" size={20} />}
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${task.completed ? 'text-slate-600 line-through' : 'text-slate-200'}`}>{task.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${task.priority === 'high' ? 'text-rose-500' : task.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'}`}>{task.priority}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1"><Tag size={10} /> {task.category}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Calendar Section */}
      <section className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[500px]">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-500" />
            Schedule
          </h2>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => {
                setIsAddingEvent(!isAddingEvent);
                if (isAddingTask) setIsAddingTask(false);
              }}
              className={`p-1.5 rounded-lg transition-all ${isAddingEvent ? 'bg-slate-800 text-slate-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700'}`}
            >
              {isAddingEvent ? <X size={18} /> : <Plus size={18} />}
            </button>
            <span className="text-xs text-slate-500 font-medium">Today</span>
          </div>
        </div>
        
        {isAddingEvent && (
          <form onSubmit={handleAddEventSubmit} className="p-6 bg-slate-800/30 border-b border-slate-800 animate-in slide-in-from-top duration-300">
             <div className="space-y-4">
              <input 
                type="text"
                autoFocus
                placeholder="What is the event?"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block px-1">Start Time</label>
                  <input 
                    type="time"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none appearance-none cursor-pointer"
                  />
                </div>
                <div className="relative">
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block px-1">End Time</label>
                  <input 
                    type="time"
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none appearance-none cursor-pointer"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block px-1">Type</label>
                <select 
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="health">Health</option>
                  <option value="social">Social</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 bottom-2.5 text-slate-500 pointer-events-none" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setIsAddingEvent(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200">Cancel</button>
                <button type="submit" disabled={!newEventTitle.trim()} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 hover:bg-indigo-700">Create Event</button>
              </div>
            </div>
          </form>
        )}

        {/* Filter Pills */}
        <div className="px-6 py-3 bg-slate-900/30 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0">
          <Filter size={14} className="text-slate-500 shrink-0" />
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setEventFilter(option.value)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight transition-all border whitespace-nowrap ${
                eventFilter === option.value
                  ? `${option.color} text-white border-transparent shadow-lg shadow-${option.color.split('-')[1]}-500/20`
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {filteredEvents.length === 0 ? (
            <div className="p-10 text-center text-slate-600 italic">
              {eventFilter === 'all' ? 'Clear for takeoff.' : `No ${eventFilter} events scheduled.`}
            </div>
          ) : (
            filteredEvents.map(event => (
              <div key={event.id} className="flex gap-4 group">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-400 transition-colors">
                    {event.startTime}
                  </span>
                  <div className="w-px h-full bg-slate-800 group-last:bg-transparent"></div>
                </div>
                <div className={`flex-1 p-3 rounded-xl border transition-all ${
                  event.type === 'work' ? 'border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10' : 
                  event.type === 'health' ? 'border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10' : 
                  event.type === 'personal' ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10' :
                  'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10'
                }`}>
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-semibold text-slate-200">{event.title}</h3>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase border ${
                       event.type === 'work' ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' : 
                       event.type === 'health' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' : 
                       event.type === 'personal' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                       'border-amber-500/30 text-amber-400 bg-amber-500/10'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> {event.startTime} - {event.endTime}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;