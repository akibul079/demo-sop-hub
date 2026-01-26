
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/authContext';
import { supabase } from '../../supabase';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface VerifyEmailProps {
  onNavigate: (page: string) => void;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ onNavigate }) => {
  const { user } = useAuth(); // Monitor user state
  const [status, setStatus] = useState<'VERIFYING' | 'SUCCESS'>('VERIFYING');

  useEffect(() => {
    // If we have a user, it means email link worked or we are logged in
    if (user) {
      setStatus('SUCCESS');
    } else {
      // If no user, stay in verifying/check-email mode
      // But we might want to poll or just rely on the AuthProvider's listener 
      // which updates 'user' automatically when session is established.
    }
  }, [user]);

  return (
    <div className="p-10 text-center">
      {status === 'VERIFYING' ? (
        <div className="py-10">
          <Loader2 size={48} className="animate-spin text-monday-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-monday-dark">Please check your email</h2>
        </div>
      ) : (
        <div className="py-4 animate-fadeIn">
          <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-monday-dark mb-2">Email Verified!</h2>
          <p className="text-gray-600 text-sm mb-8">
            Your account has been successfully created.
          </p>

          <button
            onClick={() => onNavigate('workspace-setup')}
            className="w-full bg-monday-primary text-white py-3 rounded-lg font-bold hover:bg-monday-primaryHover transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            Continue <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
