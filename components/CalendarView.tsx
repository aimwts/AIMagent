
import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus, X, ChevronDown } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
}

type ViewMode = 'day' | 'week' | 'month';

const CalendarView: React.FC<CalendarViewProps> = ({ events, onAddEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStartTime, setNewEventStartTime] = useState('09:00');
  const [newEventEndTime, setNewEventEndTime] = useState('10:00');
  const [newEventType, setNewEventType] = useState<'work' | 'personal' | 'health' | 'social'>('work');
  const [newEventLocation, setNewEventLocation] = useState('');

  // Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const getEventStyles = (type: string) => {
    switch (type) {
      case 'work': return 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400';
      case 'health': return 'bg-rose-500/20 border-rose-500/30 text-rose-400';
      case 'personal': return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
      default: return 'bg-amber-500/20 border-amber-500/30 text-amber-400';
    }
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    onAddEvent({
      title: newEventTitle,
      startTime: newEventStartTime,
      endTime: newEventEndTime,
      type: newEventType,
      location: newEventLocation.trim() || undefined
    });

    setNewEventTitle('');
    setNewEventStartTime('09:00');
    setNewEventEndTime('10:00');
    setNewEventType('work');
    setNewEventLocation('');
    setIsAddingEvent(false);
  };

  const renderMonthView = () => {
    const totalDays = daysInMonth(year, currentDate.getMonth());
    const startDay = startDayOfMonth(year, currentDate.getMonth());
    const days = [];
    
    // Padding
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`pad-${i}`} className="h-32 bg-slate-900/20 border border-slate-800/50"></div>);
    }

    // Days
    for (let d = 1; d <= totalDays; d++) {
      const isToday = d === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && year === new Date().getFullYear();
      
      days.push(
        <div key={d} className={`h-32 p-2 border border-slate-800 transition-colors hover:bg-slate-900/40 relative overflow-hidden group`}>
          <span className={`text-xs font-bold ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-500'}`}>
            {d}
          </span>
          <div className="mt-1 space-y-1">
            {d % 5 === 0 && (
              <div className={`text-[10px] p-1 rounded border truncate font-medium ${getEventStyles('work')}`}>Sync Meeting</div>
            )}
            {d % 7 === 0 && (
              <div className={`text-[10px] p-1 rounded border truncate font-medium ${getEventStyles('health')}`}>Gym</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 border-l border-t border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-500 border-r border-b border-slate-800 text-center">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="flex-1 flex flex-col space-y-4">
        <div className="grid grid-cols-7 gap-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase">{d}</span>
              <div className="h-60 bg-slate-900 rounded-xl border border-slate-800 mt-2 p-2 space-y-2 overflow-y-auto">
                {d === 'Wed' && <div className={`text-[9px] p-1.5 rounded border ${getEventStyles('personal')}`}>Call Mom</div>}
                {d === 'Fri' && <div className={`text-[9px] p-1.5 rounded border ${getEventStyles('work')}`}>Deep Work</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div className="space-y-4 max-w-2xl mx-auto w-full pb-20">
        {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(hour => {
          const hourEvents = events.filter(e => e.startTime.startsWith(hour.toString().padStart(2, '0')));

          return (
            <div key={hour} className="flex gap-4 group">
              <span className="text-[10px] font-bold text-slate-600 w-12 pt-1">
                {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </span>
              <div className="flex-1 min-h-[5rem] border-t border-slate-800 group-hover:border-slate-700 transition-colors relative">
                {hourEvents.map(e => (
                   <div key={e.id} className={`m-1 p-2 rounded-lg border shadow-sm ${getEventStyles(e.type)}`}>
                      <h4 className="font-bold text-xs">{e.title}</h4>
                      <p className="text-[9px] opacity-70">{e.startTime} - {e.endTime}</p>
                      {e.location && (
                        <p className="text-[9px] opacity-70 mt-1 flex items-center gap-1">
                          <MapPin size={10} /> {e.location}
                        </p>
                      )}
                   </div>
                ))}
                {hour === 9 && hourEvents.length === 0 && (
                   <div className={`m-1 p-2 rounded-lg border shadow-sm opacity-50 ${getEventStyles('work')}`}>
                      <h4 className="font-bold text-xs italic">Strategy Sync (Mock)</h4>
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            {viewMode === 'month' ? `${monthName} ${year}` : currentDate.toDateString()}
          </h2>
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl shadow-inner">
            <button onClick={() => navigate('prev')} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 text-xs font-bold text-slate-300 hover:text-white">Today</button>
            <button onClick={() => navigate('next')} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsAddingEvent(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus size={16} />
            Add Event
          </button>
          
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  viewMode === mode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Overlay Form */}
      {isAddingEvent && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-100">Schedule New Event</h3>
              <button onClick={() => setIsAddingEvent(false)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-xl">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddEventSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 px-1">Event Title</label>
                <input 
                  type="text"
                  autoFocus
                  placeholder="What's happening?"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 px-1">Location (Optional)</label>
                <input 
                  type="text"
                  placeholder="Where is it?"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500 px-1">Start Time</label>
                  <input 
                    type="time"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500 px-1">End Time</label>
                  <input 
                    type="time"
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 px-1">Event Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['work', 'personal', 'health', 'social'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewEventType(type)}
                      className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        newEventType === type 
                          ? 'bg-indigo-600 border-transparent text-white shadow-lg' 
                          : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!newEventTitle.trim()}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                Save Event
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
};

export default CalendarView;
