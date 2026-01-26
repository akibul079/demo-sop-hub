
import React, { useState } from 'react';
import { Checklist, ChecklistStatus } from '../../types';
import { Search, Plus, Filter, ClipboardCheck, Clock, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

interface ChecklistListProps {
  checklists: Checklist[];
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}

export const ChecklistList: React.FC<ChecklistListProps> = ({ checklists, onSelect, onCreateNew }) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'RESOLVED' | 'ALL'>('ACTIVE');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = checklists.filter(c => {
    const matchesTab = activeTab === 'ALL' || (activeTab === 'ACTIVE' ? c.status !== ChecklistStatus.RESOLVED : c.status === ChecklistStatus.RESOLVED);
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.sopTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusDisplay = (checklist: Checklist) => {
    if (checklist.status === ChecklistStatus.RESOLVED) return { label: 'Resolved', color: 'text-gray-400', icon: CheckCircle2 };
    if (checklist.progress === 100) return { label: 'Ready to Resolve', color: 'text-monday-green', icon: CheckCircle2 };

    if (checklist.dueDate && new Date(checklist.dueDate) < new Date()) {
      return { label: 'Overdue', color: 'text-monday-red', icon: AlertTriangle };
    }

    return { label: 'Active', color: 'text-monday-primary', icon: Clock };
  };

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-monday-dark flex items-center gap-3">
            <ClipboardCheck size={28} className="text-monday-primary" /> My Checklists
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track progress on procedures and tasks.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-monday-primary text-white px-5 py-2.5 rounded-lg hover:bg-monday-primaryHover transition-all flex items-center gap-2 font-bold shadow-sm"
        >
          <Plus size={18} /> New Checklist
        </button>
      </div>

      <div className="flex border-b border-monday-border mb-6">
        {['ACTIVE', 'RESOLVED', 'ALL'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 -mb-[1px] ${activeTab === t
              ? 'border-monday-primary text-monday-primary'
              : 'border-transparent text-gray-400 hover:text-monday-dark'
              }`}
          >
            {t === 'ACTIVE' ? 'Active' : t === 'RESOLVED' ? 'Completed' : 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl border border-monday-border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search checklists..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-monday-primary focus:bg-white transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-monday-border border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <ClipboardCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700">No checklists found</h3>
            <p className="text-gray-500 text-sm">Select an SOP to start tracking your progress.</p>
          </div>
        ) : (
          filtered.map(c => {
            const status = getStatusDisplay(c);
            return (
              <div
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`bg-white rounded-xl border p-5 hover:shadow-hover transition-all cursor-pointer group flex flex-col md:flex-row md:items-center gap-6 ${status.label === 'Overdue' ? 'border-red-100 bg-red-50/20' : 'border-monday-border'
                  }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-monday-dark group-hover:text-monday-primary transition-colors truncate">{c.name}</h3>
                    <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${status.color}`}>
                      <status.icon size={12} /> {status.label}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FileText size={12} /> {c.sopTitle}</span>
                    {c.dueDate && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className={status.label === 'Overdue' ? 'text-red-500 font-bold' : ''}>
                          Due: {new Date(c.dueDate).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-64 shrink-0">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-monday-dark">{c.progress}% complete</span>
                    <span className="text-xs text-gray-400">{c.steps?.filter(s => s.isCompleted).length || 0} / {c.steps?.length || 0} steps</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${c.status === ChecklistStatus.RESOLVED ? 'bg-gray-300' : 'bg-monday-primary'}`}
                      style={{ width: `${c.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:pl-4 md:border-l border-monday-border">
                  {c.createdBy ? (
                    <img src={c.createdBy.avatar} className="w-8 h-8 rounded-full border border-white shadow-sm" alt="" title={c.createdBy.name} />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 border border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-500">?</div>
                  )}
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-monday-primary transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const FileText = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
);
