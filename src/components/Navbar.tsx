import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, LogOut, ShieldCheck, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const isAdmin = profile?.role === 'admin';

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      isScrolled ? "bg-black/50 backdrop-blur-md border-white/10 py-3 shadow-xl" : "bg-white/5 backdrop-blur-sm border-white/5 py-5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center transition-transform group-hover:scale-110">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">
              Nexus<span className="text-blue-400">Arena</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">Home</Link>
            <Link to="/search" className="text-slate-400 hover:text-white transition-colors">Explore</Link>
            <Link to="/deals" className="text-slate-400 hover:text-white transition-colors">Deals</Link>
            {isAdmin && <Link to="/admin-dashboard" className="text-purple-400 hover:text-purple-300 transition-colors">Admin Panel</Link>}
            
            <div className="flex items-center gap-6 border-l border-white/10 pl-8">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search games..." 
                  className="bg-white/10 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-xs focus:ring-0 w-48 placeholder-slate-500 text-white outline-none focus:border-blue-500/50 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/search?q=${(e.target as HTMLInputElement).value}`);
                  }}
                />
              </div>
              
              {user ? (
                <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border border-white/20 overflow-hidden">
                    <img src={profile?.avatar_url || null} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">{profile?.username || 'Gamer'}</span>
                </Link>
              ) : (
                <Link to="/login" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">Home</Link>
              <Link to="/search" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">Explore</Link>
              <Link to="/deals" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">Deals</Link>
              
              <div className="pt-4 mt-4 border-t border-white/10">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 px-3 py-4 text-lg font-medium text-gray-300 hover:text-white">
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    <button 
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-3 py-4 text-lg font-medium text-red-400 hover:text-red-300"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold">
                    Join Nexus Arena
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
