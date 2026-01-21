
import React, { useState } from 'react';
import { Checklist, ChecklistStatus, ChecklistStep } from '../../types';
import { ArrowLeft, CheckCircle2, MoreVertical, Calendar, MessageSquare, Info, ChevronDown, ChevronUp, Lock, RefreshCcw, Trash2, Send } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface ChecklistViewProps {
  checklist: Checklist;
  onBack: () => void;
  onToggleStep: (stepId: string) => void;
  onResolve: (finalNotes: string) => void;
  onDelete: (id: string) => void;
  onReset: (id: string) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  checklist,
  onBack,
  onToggleStep,
  onResolve,
  onDelete,
  onReset
}) => {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [finalNotes, setFinalNotes] = useState('');
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const isResolved = checklist.status === ChecklistStatus.RESOLVED;

  const handleResolveSubmit = () => {
    onResolve(finalNotes);
    setIsResolveModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F7FA] overflow-hidden animate-fadeIn">
      {/* Header */}
      <header className="h-16 bg-white border-b border-monday-border flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ArrowLeft size={20} /></button>
          <div className="h-6 w-[1px] bg-gray-200"></div>
          <div className="flex flex-col">
             <h2 className="font-bold text-monday-dark text-lg leading-none">{checklist.name}</h2>
             <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Based on: {checklist.sopTitle} (v{checklist.sopVersion}.0)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          {checklist.progress === 100 && !isResolved && (
            <button 
              onClick={() => setIsResolveModalOpen(true)}
              className="bg-monday-green text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-monday-greenHover flex items-center gap-2 shadow-sm animate-pulse"
            >
              <CheckCircle2 size={16} /> Resolve Checklist
            </button>
          )}

          {isResolved && (
            <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-gray-200">
               <Lock size={16} /> Resolved
            </div>
          )}

          <button 
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className="p-2 text-gray-400 hover:text-monday-dark hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical size={20} />
          </button>

          {isOptionsOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-monday-border rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-fadeIn">
               <button onClick={() => { onReset(checklist.id); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                  <RefreshCcw size={16} className="text-gray-400" /> Reset Progress
               </button>
               <div className="h-[1px] bg-gray-100 my-1"></div>
               <button onClick={() => { if(confirm('Delete this checklist permanently?')) onDelete(checklist.id); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
                  <Trash2 size={16} /> Delete Checklist
               </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left Column: Progress & Metadata */}
        <aside className="w-full md:w-80 bg-white border-r border-monday-border p-6 overflow-y-auto custom-scrollbar shadow-sm z-20">
           <div className="space-y-8">
              <div>
                 <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Overall Progress</h3>
                 <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                       <div>
                          <span className="text-xs font-bold inline-block py-1 px-2 uppercase rounded-full text-monday-primary bg-blue-50">
                            {checklist.progress}% Complete
                          </span>
                       </div>
                       <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-monday-primary">
                            {checklist.steps.filter(s => s.isCompleted).length}/{checklist.steps.length}
                          </span>
                       </div>
                    </div>
                    <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-100 shadow-inner">
                       <div 
                         style={{ width: `${checklist.progress}%` }} 
                         className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${checklist.progress === 100 ? 'bg-monday-green' : 'bg-monday-primary'}`}
                       ></div>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Details</h3>
                 
                 <div className="space-y-3">
                    <div className="flex items-start gap-3">
                       <Calendar size={16} className="text-gray-400 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-xs font-bold text-monday-dark">Due Date</p>
                          <p className="text-sm text-gray-600">{checklist.dueDate ? new Date(checklist.dueDate).toLocaleDateString() : 'No due date set'}</p>
                       </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                       <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-xs font-bold text-monday-dark">Created</p>
                          <p className="text-sm text-gray-600">{new Date(checklist.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>

                    <div className="flex items-start gap-3">
                       <img src={checklist.createdBy.avatar} className="w-4 h-4 rounded-full mt-0.5" alt="" />
                       <div>
                          <p className="text-xs font-bold text-monday-dark">Owner</p>
                          <p className="text-sm text-gray-600">{checklist.createdBy.name}</p>
                       </div>
                    </div>
                 </div>
              </div>

              {checklist.notes && (
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                   <h3 className="text-xs font-bold text-yellow-800 uppercase mb-2 flex items-center gap-1.5"><MessageSquare size={12}/> Notes</h3>
                   <p className="text-sm text-yellow-900 leading-relaxed italic">"{checklist.notes}"</p>
                </div>
              )}

              {checklist.resolvedAt && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                   <h3 className="text-xs font-bold text-green-800 uppercase mb-2 flex items-center gap-1.5"><CheckCircle2 size={12}/> Resolution Summary</h3>
                   <p className="text-xs text-green-700 mb-2">Resolved on {new Date(checklist.resolvedAt).toLocaleString()}</p>
                   {checklist.finalNotes && <p className="text-sm text-green-900 leading-relaxed">"{checklist.finalNotes}"</p>}
                </div>
              )}
           </div>
        </aside>

        {/* Right Column: Step List */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
           <div className="max-w-3xl mx-auto space-y-4 pb-20">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-monday-dark uppercase tracking-wider text-sm">Procedure Steps</h3>
                 <span className="text-xs text-gray-400">{checklist.steps.length} total steps</span>
              </div>

              <div className="space-y-3">
                 {checklist.steps.map((step, idx) => {
                    const isExpanded = expandedStepId === step.id;
                    const isNextIncomplete = !step.isCompleted && checklist.steps.slice(0, idx).every(s => s.isCompleted);
                    
                    return (
                       <div 
                         key={step.id} 
                         className={`
                           group rounded-xl border transition-all duration-300
                           ${step.isCompleted ? 'bg-monday-green/5 border-monday-green/20' : 'bg-white border-monday-border'}
                           ${isNextIncomplete ? 'ring-2 ring-monday-primary ring-offset-2 scale-[1.01] shadow-md' : 'hover:border-gray-300 shadow-sm'}
                           ${isResolved ? 'opacity-80' : ''}
                         `}
                       >
                          <div 
                            className="p-4 flex items-start gap-4 cursor-pointer"
                            onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                          >
                             {/* Checkbox */}
                             <button 
                               onClick={(e) => { 
                                 e.stopPropagation(); 
                                 if (!isResolved) onToggleStep(step.id); 
                               }}
                               disabled={isResolved}
                               className={`
                                 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                                 ${step.isCompleted 
                                   ? 'bg-monday-green border-monday-green text-white' 
                                   : 'bg-white border-gray-300 hover:border-monday-primary'
                                 }
                               `}
                             >
                                {step.isCompleted && <Check size={14} strokeWidth={4} />}
                             </button>

                             <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                   <div>
                                      <h4 className={`font-bold text-sm md:text-base leading-tight ${step.isCompleted ? 'text-gray-400 line-through' : 'text-monday-dark'}`}>
                                        <span className="text-gray-400 font-normal mr-2">#{idx + 1}</span> {step.title}
                                      </h4>
                                      {isNextIncomplete && (
                                         <span className="inline-block mt-1 text-[9px] font-bold bg-monday-primary text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Next Step</span>
                                      )}
                                   </div>
                                   <div className="flex items-center gap-2">
                                      {step.isCompleted && (
                                         <span className="text-[10px] text-monday-green font-bold uppercase hidden md:inline-block">Done</span>
                                      )}
                                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                   </div>
                                </div>

                                {step.completedAt && (
                                   <p className="text-[10px] text-gray-400 mt-2 font-medium">Completed: {new Date(step.completedAt).toLocaleString()}</p>
                                )}
                             </div>
                          </div>

                          {isExpanded && (
                             <div className="px-14 pb-4 border-t border-gray-100 pt-4 animate-fadeIn">
                                <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                                   {/* In a real app we'd render the Lexical content properly */}
                                   <p className="whitespace-pre-wrap">{step.description?.root?.children?.[0]?.children?.[0]?.text || "No detailed instructions provided."}</p>
                                </div>
                                {!step.isCompleted && !isResolved && (
                                   <button 
                                     onClick={() => onToggleStep(step.id)}
                                     className="mt-4 px-4 py-2 bg-monday-primary/10 text-monday-primary rounded-lg text-sm font-bold hover:bg-monday-primary/20 transition-colors flex items-center gap-2"
                                   >
                                     <Check size={16} /> Mark as Completed
                                   </button>
                                )}
                             </div>
                          )}
                       </div>
                    );
                 })}
              </div>
           </div>
        </main>
      </div>

      {/* Resolve Modal */}
      <Modal isOpen={isResolveModalOpen} onClose={() => setIsResolveModalOpen(false)} title="Resolve Checklist">
         <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
               <CheckCircle2 className="text-monday-green mt-0.5 shrink-0" size={20} />
               <div className="text-sm text-green-900">
                  <p className="font-bold mb-1">Success! All steps complete.</p>
                  <p className="opacity-80">Resolving this checklist will move it to your completed folder and lock it from further edits.</p>
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-bold text-monday-dark">Final Notes <span className="font-normal text-gray-400">(optional)</span></label>
               <textarea 
                 className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[100px]"
                 placeholder="e.g. All onboarding tasks verified. User has access to all tools."
                 value={finalNotes}
                 onChange={e => setFinalNotes(e.target.value)}
               />
            </div>

            <div className="flex justify-end gap-2 pt-2">
               <button onClick={() => setIsResolveModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium">Keep Open</button>
               <button 
                 onClick={handleResolveSubmit}
                 className="px-6 py-2 bg-monday-green text-white rounded text-sm font-bold hover:bg-monday-greenHover shadow-sm flex items-center gap-2"
               >
                 Resolve Checklist
               </button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

const Check = ({ size, className, strokeWidth }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || "2"} strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);
