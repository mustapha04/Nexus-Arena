import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Github, MessageSquare, ShieldCheck, Mail, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Login() {
  const { signInWithGoogle, user, profile, isFirebaseReady, loading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isAdminPath = pathname === '/admin-login';

  // Check if inside an iframe
  let isInIframe = false;
  try {
    isInIframe = window.self !== window.top;
  } catch (e) {
    isInIframe = true;
  }

  React.useEffect(() => {
    if (user) {
      if (isAdminPath && profile?.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/profile');
      }
    }
  }, [user, profile, isAdminPath]);

  if (loading) {
    return (
      <div className="bg-transparent min-h-screen text-white flex items-center justify-center pt-20 px-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen text-white flex items-center justify-center pt-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-12">
             <div className="inline-block p-4 bg-blue-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/20">
                {isAdminPath ? <ShieldCheck className="w-8 h-8" /> : <LogIn className="w-8 h-8" />}
             </div>
             <h1 className="text-4xl font-black mb-4 tracking-tighter italic uppercase">{isAdminPath ? 'ADMIN' : 'IDENTIFIED'}</h1>
             <p className="text-slate-400 font-medium opacity-80">
               {isAdminPath 
                 ? 'High-level authentication required. Accessing the Forge Terminal requires verified administrator credentials.' 
                 : 'Join the elite gaming community. Your progress, favorites, and AI insights await.'}
             </p>
          </div>

          {isInIframe && (
            <div className="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-400 text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
                <ExternalLink className="w-4 h-4 text-yellow-400" />
                <span>Preview Mode Warning</span>
              </div>
              <p className="font-medium opacity-90">
                Google Authentication is blocked inside iframe preview screens by modern web browsers. 
                Please click the <strong className="text-white">"Open in New Tab"</strong> button in the top right of your preview tab to sign in successfully.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {!isFirebaseReady ? (
               <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center text-[10px] font-black uppercase tracking-widest">
                 System Offline: Firebase Required
               </div>
            ) : (
              <>
                <button 
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-4 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  <span>{isAdminPath ? 'Admin Protocol Login' : 'Log in with Protocol'}</span>
                </button>

                <button className="w-full flex items-center justify-center gap-4 py-5 bg-[#5865F2] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <MessageSquare className="w-5 h-5 fill-current" />
                  <span>{isAdminPath ? 'Admin Discord Sync' : 'Sync with Discord'}</span>
                </button>
              </>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">
               {isAdminPath ? 'Return to Nexus' : 'Forge Authority Only'}
             </p>
             <button 
              onClick={() => navigate(isAdminPath ? '/login' : '/admin-login')}
              className="flex items-center justify-center gap-2 mx-auto text-blue-400 font-black hover:text-blue-300 transition-colors uppercase tracking-widest text-[10px] bg-white/5 px-6 py-3 rounded-full border border-white/5"
             >
               {isAdminPath ? <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> : <ShieldCheck className="w-4 h-4" />}
               <span>{isAdminPath ? 'External Portal' : 'Admin Terminal'}</span>
               {!isAdminPath && <ArrowRight className="w-4 h-4 ml-1" />}
             </button>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center space-x-6 text-gray-600 text-xs font-bold uppercase tracking-widest leading-loose">
           <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
           <span>•</span>
           <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
           <span>•</span>
           <a href="#" className="hover:text-indigo-400 transition-colors">Support</a>
        </div>
      </motion.div>
    </div>
  );
}
