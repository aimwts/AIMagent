import React, { useState, useEffect, useRef } from 'react';
import { AppState, ChatMessage, Task, CalendarEvent, AgentLog } from './types';
import { INITIAL_TASKS, INITIAL_EVENTS } from './constants';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import AgentLogPanel from './components/AgentLogPanel';
import { runAgentWorkflow } from './services/geminiService';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  Send, 
  Bot, 
  Menu, 
  X, 
  Sparkles,
  Search,
  Zap,
  User,
  Plus,
  Mic,
  MicOff,
  Calendar as CalendarIcon
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    tasks: INITIAL_TASKS,
    events: INITIAL_EVENTS,
    messages: [
      {
        id: '1',
        sender: 'assistant',
        content: "Hello! I am your OmniAgent. I coordinate multiple specialized agents to help you manage your day. How can I assist you today?",
        timestamp: new Date()
      }
    ],
    isProcessing: false
  });

  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'calendar'>('dashboard');
  const [currentLogs, setCurrentLogs] = useState<AgentLog[]>([]);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start recognition", err);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || state.isProcessing) return;

    if (isListening) {
      recognitionRef.current?.stop();
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isProcessing: true
    }));
    setInput('');
    setCurrentLogs([]);
    
    setActiveTab('chat');

    const result = await runAgentWorkflow(input, state, (newLog) => {
      setCurrentLogs(prev => [...prev, newLog]);
    });

    setState(prev => {
      let updatedTasks = [...prev.tasks];
      let updatedEvents = [...prev.events];

      if (result.updatedTasks) {
        result.updatedTasks.forEach((t: any) => {
          updatedTasks.push({
            id: Math.random().toString(),
            title: t.title,
            completed: false,
            priority: t.priority || 'medium',
            category: t.category || 'General'
          });
        });
      }

      if (result.updatedEvents) {
        result.updatedEvents.forEach((e: any) => {
          updatedEvents.push({
            id: Math.random().toString(),
            title: e.title,
            startTime: e.startTime,
            endTime: e.endTime || 'Noon',
            type: e.type || 'work'
          });
        });
      }

      return {
        ...prev,
        tasks: updatedTasks,
        events: updatedEvents,
        messages: [...prev.messages, {
          id: Date.now().toString(),
          sender: 'assistant',
          content: result.response,
          timestamp: new Date(),
          logs: result.logs
        }],
        isProcessing: false
      };
    });
  };

  const toggleTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completed: false
    };
    setState(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
  };

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
    };
    setState(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col items-center lg:items-stretch py-8 shrink-0">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Zap className="text-white fill-current" size={24} />
          </div>
          <h1 className="hidden lg:block font-bold text-xl text-slate-100 tracking-tight">OmniAgent</h1>
        </div>

        <div className="flex-1 space-y-2 px-3">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="hidden lg:block font-semibold">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'calendar' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <CalendarIcon size={20} />
            <span className="hidden lg:block font-semibold">Calendar</span>
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'chat' ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <MessageSquare size={20} />
            <span className="hidden lg:block font-semibold">Concierge Chat</span>
          </button>
        </div>

        <div className="px-3 pt-6 border-t border-slate-800 mt-auto">
          <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all">
            <Settings size={20} />
            <span className="hidden lg:block font-medium">Preferences</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative bg-slate-950">
        {/* Header */}
        <header className="h-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
             <div className="lg:hidden cursor-pointer">
               <Menu size={24} className="text-slate-400" />
             </div>
             <div>
               <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                 {activeTab === 'dashboard' ? 'Overview' : activeTab === 'calendar' ? 'Schedule' : 'Interactive Session'}
               </h2>
               <p className="text-slate-100 font-semibold">
                 {activeTab === 'dashboard' ? "Your Daily Landscape" : activeTab === 'calendar' ? "Full Calendar View" : "OmniAgent Multi-Model Chat"}
               </p>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search knowledge..." 
                className="bg-slate-900 rounded-full py-2 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 border border-slate-800"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/10">
              JD
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 flex flex-row overflow-hidden">
          <div className="flex-1 flex flex-col h-full">
            {activeTab === 'dashboard' && (
              <Dashboard 
                tasks={state.tasks} 
                events={state.events} 
                onToggleTask={toggleTask} 
                onAddTask={addTask}
                onAddEvent={addEvent} 
              />
            )}
            {activeTab === 'calendar' && (
              <CalendarView events={state.events} onAddEvent={addEvent} />
            )}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col relative h-full">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {state.messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        msg.sender === 'user' ? 'bg-slate-800 border border-slate-700' : 'bg-blue-600 text-white shadow-blue-500/20'
                      }`}>
                        {msg.sender === 'user' ? <User size={20} className="text-slate-300" /> : <Bot size={20} />}
                      </div>
                      <div className={`max-w-[80%] space-y-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                        <div className={`inline-block p-4 rounded-3xl shadow-sm text-sm leading-relaxed ${
                          msg.sender === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-slate-900 text-slate-100 rounded-tl-none border border-slate-800'
                        }`}>
                          {msg.content}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {state.isProcessing && (
                    <div className="flex gap-4 animate-pulse">
                      <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <Bot size={20} className="text-blue-500" />
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-3xl rounded-tl-none border border-slate-800 flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                        <span className="text-xs font-medium text-slate-500">Agent group thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input Bar */}
                <div className="p-6 bg-slate-950 border-t border-slate-900 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] mt-auto">
                  <div className="max-w-4xl mx-auto flex items-end gap-3 relative">
                    <div className="flex-1 relative">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder={isListening ? "Listening..." : "Add a task, ask about your day, or request a plan..."}
                        rows={1}
                        className={`w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-6 pr-14 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 resize-none transition-all min-h-[56px] block ${isListening ? 'ring-2 ring-red-500/20 border-red-500/50' : ''}`}
                      />
                      <div className="absolute right-3 bottom-3 flex gap-2">
                         <button 
                           onClick={handleSend}
                           disabled={state.isProcessing || !input.trim()}
                           className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-800 shadow-md shadow-blue-500/10 transition-all active:scale-95"
                         >
                           <Send size={18} />
                         </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={toggleListening}
                      className={`p-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center shrink-0 ${
                        isListening 
                        ? 'bg-red-600 text-white shadow-red-500/30 animate-pulse' 
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-100 hover:bg-slate-800'
                      }`}
                      title={isListening ? "Stop Listening" : "Start Voice Input"}
                    >
                      {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>
                  </div>
                  
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-4xl mx-auto">
                    {['Add grocery list task', 'What is my next event?', 'Plan my evening', 'High priority cleanup'].map(suggestion => (
                      <button 
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="whitespace-nowrap px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 hover:text-slate-200 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles size={12} className="text-amber-500" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Agent Log Sidebar */}
          <div className="hidden xl:block w-96 shrink-0 h-full">
            <AgentLogPanel logs={currentLogs} isProcessing={state.isProcessing} />
          </div>
        </div>
      </main>

      {/* Floating Action Button (Mobile Only) */}
      <button 
        onClick={() => {
          setActiveTab('dashboard');
          window.dispatchEvent(new CustomEvent('open-add-task'));
        }}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 shadow-blue-500/20 active:scale-95 transition-transform"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default App;