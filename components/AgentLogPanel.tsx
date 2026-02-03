import React from 'react';
import { AgentLog, AgentRole } from '../types';
import { BrainCircuit, Loader2, User, ChevronRight } from 'lucide-react';

interface AgentLogPanelProps {
  logs: AgentLog[];
  isProcessing: boolean;
}

const AgentLogPanel: React.FC<AgentLogPanelProps> = ({ logs, isProcessing }) => {
  const getRoleIcon = (role: AgentRole) => {
    switch (role) {
      case AgentRole.PLANNER: return <BrainCircuit size={14} className="text-purple-400" />;
      case AgentRole.MANAGER: return <User size={14} className="text-blue-400" />;
      case AgentRole.EXECUTOR: return <BrainCircuit size={14} className="text-emerald-400" />;
      case AgentRole.REVIEWER: return <ChevronRight size={14} className="text-amber-400" />;
    }
  };

  const getRoleColor = (role: AgentRole) => {
    switch (role) {
      case AgentRole.PLANNER: return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case AgentRole.MANAGER: return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case AgentRole.EXECUTOR: return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case AgentRole.REVIEWER: return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-300 border-l border-slate-900 shadow-2xl">
      <div className="p-4 border-b border-slate-900 flex items-center justify-between bg-slate-950">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <BrainCircuit size={16} />
          Agent Orchestration
        </h2>
        {isProcessing && <Loader2 size={16} className="animate-spin text-blue-500" />}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 mono text-[11px]">
        {logs.length === 0 && !isProcessing && (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center px-6">
            <BrainCircuit size={32} className="mb-4 opacity-10" />
            <p className="max-w-[200px]">Initiate a request to see agent collaboration logs.</p>
          </div>
        )}

        {logs.map((log) => (
          <div key={log.id} className="space-y-2 group animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded flex items-center gap-1.5 font-bold tracking-tight ${getRoleColor(log.role)}`}>
                {getRoleIcon(log.role)}
                {log.role}
              </span>
              <span className="text-[10px] text-slate-700">
                {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="pl-4 border-l border-slate-800 text-slate-500 leading-relaxed whitespace-pre-wrap">
              {log.content}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <span className="text-slate-600 italic">Consulting next agent...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentLogPanel;