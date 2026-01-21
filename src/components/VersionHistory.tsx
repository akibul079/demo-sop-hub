import React from 'react';
import { Clock, RotateCcw, X, GitCommit } from 'lucide-react';
import { SOPVersion } from '../types';

interface VersionHistoryProps {
  versions: SOPVersion[];
  onRestore: (version: SOPVersion) => void;
  onClose: () => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ versions, onRestore, onClose }) => {
  const sortedVersions = [...versions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="w-full md:w-80 border-l border-gray-200 bg-white h-full flex flex-col shadow-2xl absolute right-0 top-0 bottom-0 z-40 animate-slideInRight">
      <div className="p-4 md:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/80 backdrop-blur-sm sticky top-0">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Clock size={18} className="text-[#C73EE2]" /> 
          Version History
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-200 rounded transition-colors">
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/30">
        {sortedVersions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
            <GitCommit size={32} className="mb-2 opacity-50" />
            <p>No version history yet.</p>
            <p className="text-xs opacity-70">Publish to create versions.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 py-2">
            {sortedVersions.map((version) => (
              <div key={version.id} className="relative pl-6 group">
                {/* Timeline dot */}
                <div className="absolute -left-[9px] top-3 w-4 h-4 rounded-full border-2 border-white bg-gray-300 group-hover:bg-[#C73EE2] transition-colors shadow-sm"></div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-[#C73EE2]/50 hover:shadow-md transition-all group-hover:-translate-y-0.5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-gradient-to-r from-[#E044A7]/10 to-[#8B5CF6]/10 text-[#C73EE2] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      v{version.versionNumber}.0
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(version.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3 italic">
                    "{version.note || 'Update'}"
                  </p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                     <div className="flex items-center gap-1.5" title={version.createdBy.name}>
                       <img src={version.createdBy.avatar} className="w-5 h-5 rounded-full border border-gray-100" alt="" />
                       <span className="text-[10px] text-gray-500 truncate max-w-[80px]">{version.createdBy.name}</span>
                     </div>
                     <button 
                       onClick={() => onRestore(version)}
                       className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-gray-100 hover:bg-[#C73EE2] text-gray-700 hover:text-white px-2 py-1 rounded flex items-center gap-1 font-medium"
                     >
                       <RotateCcw size={10} /> Restore
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};