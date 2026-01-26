
import React from 'react';
import { Trash2, RotateCcw, AlertTriangle, FileX, Clock } from 'lucide-react';
import { SOP } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface TrashViewProps {
  sops: SOP[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export const TrashView: React.FC<TrashViewProps> = ({ sops, onRestore, onPermanentDelete }) => {
  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-monday-dark flex items-center gap-3">
            <Trash2 size={24} className="text-red-500" /> Trash
          </h1>
          <p className="text-gray-500 text-sm mt-1">Items here will be permanently deleted after 30 days.</p>
        </div>
      </div>

      {sops.length > 0 ? (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="text-orange-500 shrink-0" size={20} />
          <div>
            <p className="text-sm text-orange-800 font-bold">You have {sops.length} items in your trash.</p>
            <p className="text-xs text-orange-700 mt-0.5">Restoring an SOP will move it back to your Drafts library.</p>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {sops.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-xl border border-monday-border border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <FileX size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-400">Trash is empty</h3>
            <p className="text-sm text-gray-400">Items you delete will appear here.</p>
          </div>
        ) : (
          sops.map(sop => (
            <div key={sop.id} className="bg-white rounded-lg border border-red-100 p-4 hover:shadow-sm transition-all group border-l-4 border-l-red-500">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-monday-dark truncate">{sop.title}</h3>
                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">DELETED</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><Trash2 size={12} /> Deleted {formatDistanceToNow(new Date(sop.deletedAt!))} ago</span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} /> Auto-delete in 27 days</span>
                  </div>
                  {sop.deleteReason && (
                    <p className="text-xs text-gray-600 italic mt-2 bg-gray-50 p-2 rounded border border-gray-100">"{sop.deleteReason}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                   <button 
                     onClick={() => onRestore(sop.id)}
                     className="px-4 py-2 text-monday-primary bg-blue-50 hover:bg-blue-100 rounded-md text-sm font-bold flex items-center gap-2 transition-colors"
                   >
                     <RotateCcw size={16} /> Restore
                   </button>
                   <button 
                     onClick={() => { if(confirm('Permanently delete this SOP? This action cannot be undone.')) onPermanentDelete(sop.id); }}
                     className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md text-sm font-bold flex items-center gap-2 transition-colors"
                   >
                     <Trash2 size={16} /> Permanent Delete
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
