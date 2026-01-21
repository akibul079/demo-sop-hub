
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../lib/authContext';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

interface LoginProps {
  onNavigate: (page: string) => void;
}

// Extend window interface to avoid TS errors
declare global {
  interface Window {
    google: any;
  }
}

//  Google Cloud Console
const GOOGLE_CLIENT_ID = '438126746650-vks0pg8lbcdq5d0feq6j25us34ohug0m.apps.googleusercontent.com';



export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Initialize Google Sign-In with robust loading check
  useEffect(() => {
    const initializeGSI = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response: any) => {
              if (response.credential) {
                loginWithGoogle(response.credential);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'continue_with',
              logo_alignment: 'left'
            });
          }
          return true;
        } catch (e) {
          console.error('Google Sign-In initialization failed:', e);
          return false;
        }
      }
      return false;
    };

    // Attempt to initialize immediately
    if (!initializeGSI()) {
      // If the script hasn't loaded yet, check every 100ms
      const intervalId = setInterval(() => {
        if (initializeGSI()) {
          clearInterval(intervalId);
        }
      }, 100);

      // Cleanup interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [loginWithGoogle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError('Please enter both email and password');
        return;
    }
    
    setError('');
    setLoading(true);
    try {
        await login(email, password);
    } catch (err) {
        setError('Invalid email or password');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-8">
       <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-monday-dark mb-2">Welcome back</h2>
          <p className="text-gray-500 text-sm">Enter your details to access your workspace</p>
       </div>

       <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
             <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {error}
             </div>
          )}

          <div className="space-y-1.5">
             <label className="text-sm font-bold text-monday-dark">Email</label>
             <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-monday-primary focus:ring-4 focus:ring-monday-primary/10 transition-all text-sm"
                  placeholder="name@company.com"
               />
             </div>
          </div>

          <div className="space-y-1.5">
             <div className="flex justify-between">
                <label className="text-sm font-bold text-monday-dark">Password</label>
                <button type="button" onClick={() => onNavigate('forgot-password')} className="text-xs text-monday-primary hover:underline">Forgot password?</button>
             </div>
             <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-monday-primary focus:ring-4 focus:ring-monday-primary/10 transition-all text-sm"
                  placeholder="••••••••"
                />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-monday-primary text-white py-2.5 rounded-lg font-bold hover:bg-monday-primaryHover transition-colors flex items-center justify-center gap-2 shadow-sm mt-2"
          >
             {loading ? <Loader2 size={18} className="animate-spin" /> : 'Log In'}
          </button>
       </form>

       <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-medium">Or continue with</span></div>
       </div>

       <div className="space-y-3">
          {/* Google Sign-In Button Container */}
          <div ref={googleButtonRef} className="w-full min-h-[40px] flex justify-center"></div>
       </div>

       <p className="text-center text-sm text-gray-500 mt-8">
          Don't have an account? <button onClick={() => onNavigate('signup')} className="text-monday-primary font-bold hover:underline">Sign up</button>
       </p>
    </div>
  );
};
