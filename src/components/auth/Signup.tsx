
import React, { useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';

interface SignupProps {
   onNavigate: (page: string) => void;
}

export const Signup: React.FC<SignupProps> = ({ onNavigate }) => {
   const { signup } = useAuth();
   const [step, setStep] = useState<'FORM' | 'VERIFY'>('FORM');
   const [firstName, setFirstName] = useState('');
   const [lastName, setLastName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
         await signup(email, password, firstName, lastName);
         setStep('VERIFY');
      } catch (error: any) {
         console.error(error);
         alert(error.message || "Failed to sign up");
      } finally {
         setLoading(false);
      }
   };

   if (step === 'VERIFY') {
      return (
         <div className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 text-monday-primary rounded-full flex items-center justify-center mx-auto mb-6">
               <Mail size={32} />
            </div>
            <h2 className="text-2xl font-bold text-monday-dark mb-2">Check your email</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
               We sent a verification link to <span className="font-bold text-monday-dark">{email}</span>.<br />
               Click the link to verify your account.
            </p>

            <div className="space-y-3">
               <button onClick={() => onNavigate('verify-email')} className="w-full bg-monday-primary text-white py-2.5 rounded-lg font-bold hover:bg-monday-primaryHover transition-colors shadow-sm text-sm">
                  Simulate: Click Link
               </button>
               <button onClick={() => setStep('FORM')} className="text-gray-500 hover:text-monday-dark text-sm">
                  Wrong email? Start over
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="p-8">
         <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-monday-dark mb-2">Create your account</h2>
            <p className="text-gray-500 text-sm">Start managing your SOPs for free</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-sm font-bold text-monday-dark">First Name</label>
                  <input
                     type="text"
                     required
                     value={firstName}
                     onChange={e => setFirstName(e.target.value)}
                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-monday-primary focus:ring-4 focus:ring-monday-primary/10 transition-all text-sm"
                     placeholder="Sarah"
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-sm font-bold text-monday-dark">Last Name</label>
                  <input
                     type="text"
                     required
                     value={lastName}
                     onChange={e => setLastName(e.target.value)}
                     className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-monday-primary focus:ring-4 focus:ring-monday-primary/10 transition-all text-sm"
                     placeholder="Johnson"
                  />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-bold text-monday-dark">Work Email</label>
               <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                     type="email"
                     required
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-monday-primary focus:ring-4 focus:ring-monday-primary/10 transition-all text-sm"
                     placeholder="sarah@acmecorp.com"
                  />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-sm font-bold text-monday-dark">Password</label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                     type="password"
                     required
                     minLength={8}
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-monday-primary focus:ring-4 focus:ring-monday-primary/10 transition-all text-sm"
                     placeholder="Min 8 characters"
                  />
               </div>
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-monday-primary text-white py-2.5 rounded-lg font-bold hover:bg-monday-primaryHover transition-colors flex items-center justify-center gap-2 shadow-sm mt-4"
            >
               {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
            </button>
         </form>

         <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account? <button onClick={() => onNavigate('login')} className="text-monday-primary font-bold hover:underline">Log in</button>
         </p>
      </div>
   );
};
