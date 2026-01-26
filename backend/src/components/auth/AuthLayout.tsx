
import React from 'react';
import { Layers } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center items-center p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-monday-primary rounded-xl flex items-center justify-center text-white shadow-lg mb-4">
           <Layers size={28} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-monday-dark">SOP Hub</h1>
      </div>
      
      <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-xl border border-monday-border overflow-hidden animate-scaleIn">
         {children}
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-400">
         <p>&copy; {new Date().getFullYear()} SOP Hub Enterprise. All rights reserved.</p>
         <div className="flex gap-4 justify-center mt-2">
            <a href="#" className="hover:text-monday-primary">Privacy Policy</a>
            <a href="#" className="hover:text-monday-primary">Terms of Service</a>
         </div>
      </div>
    </div>
  );
};
