
import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { SOP, SOPStatus, ChecklistStatus, User } from '../../types';
import { Search, FileText, Calendar, ArrowRight, Check } from 'lucide-react';

interface CreateChecklistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sops: SOP[];
  initialSop?: SOP | null;
  onCreate: (checklistData: {
    name: string;
    sopId: string;
    notes?: string;
    dueDate?: string;
  }) => void;
}

export const CreateChecklistDialog: React.FC<CreateChecklistDialogProps> = ({
  isOpen,
  onClose,
  sops,
  initialSop,
  onCreate
}) => {
  const [step, setStep] = useState<'SELECT' | 'DETAILS'>(initialSop ? 'DETAILS' : 'SELECT');
  const [selectedSopId, setSelectedSopId] = useState<string>(initialSop?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Reset when opened
  React.useEffect(() => {
    if (isOpen) {
      setStep(initialSop ? 'DETAILS' : 'SELECT');
      setSelectedSopId(initialSop?.id || '');
      setName(initialSop ? `${initialSop.title} - Checklist` : '');
      setNotes('');
      setDueDate('');
    }
  }, [isOpen, initialSop]);

  // Allow ALL SOPs for now to avoid confusion
  const publishedSops = sops;

  const filteredSops = publishedSops.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNext = () => {
    const sop = publishedSops.find(s => s.id === selectedSopId);
    if (sop) {
      setName(`${sop.title} - Checklist`);
      setStep('DETAILS');
    }
  };

  const handleCreate = () => {
    if (!selectedSopId || !name.trim()) return;
    onCreate({
      name,
      sopId: selectedSopId,
      notes,
      dueDate: dueDate || undefined
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'SELECT' ? "Select a Procedure" : "Checklist Details"}
    >
      {step === 'SELECT' ? (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search published SOPs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-monday-primary"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
            {filteredSops.length === 0 ? (
              <p className="text-center py-4 text-gray-500 text-sm">No published SOPs found.</p>
            ) : (
              filteredSops.map(sop => (
                <button
                  key={sop.id}
                  onClick={() => setSelectedSopId(sop.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group ${selectedSopId === sop.id
                      ? 'border-monday-primary bg-blue-50'
                      : 'border-gray-100 hover:border-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className={selectedSopId === sop.id ? 'text-monday-primary' : 'text-gray-400'} />
                    <div>
                      <p className={`text-sm font-bold ${selectedSopId === sop.id ? 'text-monday-primary' : 'text-monday-dark'}`}>{sop.title}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">v{sop.version}.0 • {sop.steps.length} steps</p>
                    </div>
                  </div>
                  {selectedSopId === sop.id && <Check size={16} className="text-monday-primary" />}
                </button>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium">Cancel</button>
            <button
              disabled={!selectedSopId}
              onClick={handleNext}
              className="px-4 py-2 bg-monday-primary text-white rounded text-sm font-medium hover:bg-monday-primaryHover flex items-center gap-2 disabled:opacity-50"
            >
              Next <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Source Procedure</p>
            <p className="text-sm font-bold text-monday-dark">{publishedSops.find(s => s.id === selectedSopId)?.title}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-monday-dark">Checklist Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="e.g. New Employee Onboarding"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-monday-dark">Due Date <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-monday-dark">Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[80px]"
              placeholder="Add any context or instructions..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {!initialSop && <button onClick={() => setStep('SELECT')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium">Back</button>}
            <button
              disabled={!name.trim()}
              onClick={handleCreate}
              className="px-6 py-2 bg-monday-primary text-white rounded text-sm font-bold hover:bg-monday-primaryHover shadow-sm"
            >
              Start Checklist
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
