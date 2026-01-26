
import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div className="p-8 text-center animate-fadeIn">
         <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
         </div>
         <h2 className="text-2xl font-bold text-monday-dark mb-2">Check your email</h2>
         <p className="text-gray-600 text-sm mb-8">
            We sent a password reset link to <strong>{email}</strong>
         </p>
         <button onClick={() => onNavigate('login')} className="text-monday-primary font-bold hover:underline">
            Back to Login
         </button>
      </div>
    );
  }

  return (
    <div className="p-8">
       <button onClick={() => onNavigate('login')} className="text-sm text-gray-500 hover:text-monday-dark mb-6">← Back to Login</button>
       <h2 className="text-2xl font-bold text-monday-dark mb-2">Reset Password</h2>
       <p className="text-gray-500 text-sm mb-8">Enter your email and we'll send you instructions to reset your password.</p>

       <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
             <label className="text-sm font-bold text-monday-dark">Email Address</label>
             <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-monday-primary"
                  placeholder="name@company.com"
                />
             </div>
          </div>

          <button type="submit" className="w-full bg-monday-primary text-white py-2.5 rounded-lg font-bold hover:bg-monday-primaryHover transition-colors flex items-center justify-center gap-2">
             Send Reset Link <ArrowRight size={16} />
          </button>
       </form>
    </div>
  );
};
