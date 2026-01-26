
import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { Building, Users, ArrowRight, Loader2, Plus, Link } from 'lucide-react';

export const WorkspaceSetup: React.FC = () => {
   const { createWorkspace, joinWorkspace } = useAuth();
   const [mode, setMode] = useState<'CHOICE' | 'CREATE' | 'JOIN'>('CHOICE');
   const [name, setName] = useState('');
   const [size, setSize] = useState('2-10');
   const [loading, setLoading] = useState(false);

   const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name) return;
      setLoading(true);
      try {
         await createWorkspace(name, size);
      } catch (error: any) {
         console.error(error);
         alert(error.message || "Failed to create workspace");
      } finally {
         setLoading(false);
      }
   };

   if (mode === 'CHOICE') {
      return (
         <div className="p-8">
            <h2 className="text-2xl font-bold text-monday-dark mb-2 text-center">How would you like to start?</h2>
            <p className="text-gray-500 text-sm mb-8 text-center">Join an existing team or start a new one.</p>

            <div className="space-y-4">
               <button
                  onClick={() => setMode('CREATE')}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-monday-primary hover:bg-blue-50 transition-all group"
               >
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Building size={20} />
                     </div>
                     <div>
                        <h3 className="font-bold text-monday-dark">Create a Workspace</h3>
                        <p className="text-xs text-gray-500">I want to set up SOP Hub for my team.</p>
                     </div>
                     <ArrowRight className="ml-auto text-gray-300 group-hover:text-monday-primary" size={20} />
                  </div>
               </button>

               <button
                  onClick={() => setMode('JOIN')}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-monday-primary hover:bg-blue-50 transition-all group"
               >
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Users size={20} />
                     </div>
                     <div>
                        <h3 className="font-bold text-monday-dark">Join a Workspace</h3>
                        <p className="text-xs text-gray-500">I have an invite code or link.</p>
                     </div>
                     <ArrowRight className="ml-auto text-gray-300 group-hover:text-monday-primary" size={20} />
                  </div>
               </button>
            </div>
         </div>
      );
   }

   if (mode === 'CREATE') {
      return (
         <div className="p-8">
            <button onClick={() => setMode('CHOICE')} className="text-sm text-gray-500 hover:text-monday-dark mb-6">← Back</button>

            <h2 className="text-2xl font-bold text-monday-dark mb-6">Create Workspace</h2>

            <form onSubmit={handleCreate} className="space-y-5">
               <div className="space-y-1.5">
                  <label className="text-sm font-bold text-monday-dark">Workspace Name</label>
                  <input
                     type="text"
                     value={name}
                     onChange={e => setName(e.target.value)}
                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-monday-primary outline-none"
                     placeholder="Acme Corp"
                     autoFocus
                  />
               </div>

               <div className="space-y-1.5">
                  <label className="text-sm font-bold text-monday-dark">Team Size</label>
                  <div className="grid grid-cols-2 gap-3">
                     {['Just me', '2-10', '11-50', '50+'].map(opt => (
                        <button
                           type="button"
                           key={opt}
                           onClick={() => setSize(opt)}
                           className={`py-2 rounded-lg text-sm font-medium border ${size === opt ? 'bg-monday-primary text-white border-monday-primary' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                           {opt}
                        </button>
                     ))}
                  </div>
               </div>

               <button
                  type="submit"
                  disabled={!name || loading}
                  className="w-full bg-monday-primary text-white py-3 rounded-lg font-bold hover:bg-monday-primaryHover transition-colors flex items-center justify-center gap-2 mt-4"
               >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Workspace'}
               </button>
            </form>
         </div>
      );
   }

   return (
      <div className="p-8 text-center">
         <button onClick={() => setMode('CHOICE')} className="text-sm text-gray-500 hover:text-monday-dark mb-6 text-left w-full">← Back</button>
         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Link size={32} />
         </div>
         <h2 className="text-xl font-bold text-monday-dark mb-2">Join via Invite</h2>
         <p className="text-sm text-gray-500 mb-6">Ask your admin for an invite link sent to your email.</p>
         <button onClick={() => setMode('CREATE')} className="text-monday-primary text-sm font-bold hover:underline">Create a new workspace instead</button>
      </div>
   );
};
