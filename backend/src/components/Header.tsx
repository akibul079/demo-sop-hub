
import React from 'react';
import { Search, Bell, Menu, Plus, Zap, User as UserIcon, Upload } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
  onCreateClick: () => void;
  onUploadClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onMenuClick, onCreateClick, onUploadClick }) => {
  return (
    <header className="h-16 bg-white border-b border-monday-border flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-500 hover:bg-monday-lightGray rounded-lg md:hidden transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Search Command Center */}
        <div className="relative group w-full max-w-xl hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-monday-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search for anything..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-monday-border hover:border-gray-400 rounded-full text-sm text-monday-dark placeholder-gray-400 focus:outline-none focus:border-monday-primary focus:ring-4 focus:ring-monday-primary/10 transition-all shadow-sm"
          />
        </div>
      </div>
      
      {/* Mobile Search Icon */}
      <button className="md:hidden text-gray-500 p-2">
        <Search size={20} />
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Invite/Upgrade Mock */}
        <button className="hidden md:flex items-center gap-1.5 text-xs font-medium text-monday-primary border border-monday-primary/30 px-3 py-1.5 rounded-full hover:bg-monday-primary/5 transition-colors">
           <Zap size={12} fill="currentColor" />
           <span>Upgrade</span>
        </button>

        <div className="h-6 w-[1px] bg-monday-border hidden md:block"></div>

        <button className="relative p-2 text-gray-500 hover:text-monday-dark hover:bg-monday-lightGray rounded-full transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-monday-red rounded-full ring-2 ring-white"></span>
        </button>

        <button 
          onClick={onUploadClick}
          className="hidden md:flex items-center gap-2 text-gray-600 hover:text-monday-dark hover:bg-monday-lightGray px-4 py-2 rounded-full font-medium transition-all"
        >
          <Upload size={18} />
          <span className="text-sm">Upload</span>
        </button>
        
        <button 
          onClick={onCreateClick}
          className="hidden md:flex items-center gap-2 bg-monday-primary hover:bg-monday-primaryHover text-white px-4 py-2 rounded-full font-medium transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="text-sm">New SOP</span>
        </button>

        <button className="flex items-center gap-2 ml-1 p-0.5 rounded-full hover:ring-2 hover:ring-monday-primary/20 transition-all">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-monday-blue to-monday-purple p-[2px]">
             <img 
               src={user.avatar} 
               alt={user.name} 
               className="w-full h-full rounded-full object-cover border-2 border-white" 
             />
          </div>
        </button>
      </div>
    </header>
  );
};
