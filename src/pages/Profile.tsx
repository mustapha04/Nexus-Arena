import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User as UserIcon, Gamepad2, Heart, 
  Settings, Award, History, LogOut, 
  ChevronRight, Sparkles, Trophy
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, Navigate } from 'react-router-dom';
import { cn } from '../lib/utils';

import FavoritesTab from '../components/profile/FavoritesTab';
import WishlistTab from '../components/profile/WishlistTab';
import CustomListsTab from '../components/profile/CustomListsTab';

export default function Profile() {
  const { user, profile, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'favorites' | 'wishlist' | 'lists' | 'activity'>('favorites');

  if (loading) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  const tabs = [
    { id: 'favorites', label: 'Arsenal' },
    { id: 'wishlist', label: 'Manifest' },
    { id: 'lists', label: 'Archives' },
    { id: 'activity', label: 'Logs' },
  ] as const;

  return (
    <div className="bg-transparent min-h-screen text-white pt-32 pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Profile Header */}
        <div className="relative mb-20 md:mb-32">
          <div className="h-64 rounded-[3rem] bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-md border border-white/5 overflow-hidden relative">
             <div className="absolute inset-0 bg-black/10" />
             <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:items-end gap-12 -mt-20 md:px-12 relative z-10">
             <div className="relative p-1 bg-gradient-to-br from-blue-500 to-purple-500 rounded-[2.5rem] shadow-2xl">
                <img 
                  src={profile?.avatar_url || null} 
                  className="w-44 h-44 rounded-[2.3rem] object-cover border-4 border-brand-bg shadow-inner scale-100" 
                  alt={profile?.username || "User avatar"}
                />
                <div className="absolute -bottom-2 -right-2 p-4 bg-blue-600 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.4)] ring-1 ring-white/20">
                   <Trophy className="w-6 h-6 text-white" />
                </div>
             </div>
             
             <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                   <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic drop-shadow-2xl">{profile?.username}</h1>
                   {profile?.role === 'admin' && (
                     <span className="px-4 py-1.5 bg-purple-600 text-[10px] font-black rounded-xl tracking-[0.2em] uppercase shadow-xl ring-1 ring-white/20">FORGE ADMIN</span>
                   )}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{profile?.email}</p>
                </div>
             </div>

             <div className="flex gap-4">
                <button className="flex items-center justify-center p-5 bg-white/5 border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all shadow-xl hover:scale-105">
                   <Settings className="w-6 h-6 text-slate-300" />
                </button>
                <button 
                  onClick={logout}
                  className="flex items-center gap-3 px-10 py-5 bg-red-600/10 border border-red-500/10 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl"
                >
                   <LogOut className="w-5 h-5" />
                   <span>Security Exit</span>
                </button>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 md:mb-32">
          {[
            { label: 'Combat Level', value: profile?.combat_level?.toString() || '42', icon: Trophy, color: 'text-blue-400' },
            { label: 'Artifacts Found', value: profile?.artifacts_found !== undefined ? profile.artifacts_found.toLocaleString() : '1,284', icon: Award, color: 'text-purple-400' },
            { label: 'Grid Uptime', value: profile?.grid_uptime || '3,5h', icon: Gamepad2, color: 'text-indigo-400' },
            { label: 'Core Integrity', value: profile?.core_integrity || '100%', icon: Heart, color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/5 text-center transition-all hover:bg-white/10 hover:-translate-y-2 shadow-2xl relative group overflow-hidden">
               <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><stat.icon className="w-24 h-24" /></div>
               <stat.icon className={cn("w-8 h-8 mx-auto mb-6 transition-transform group-hover:scale-125", stat.color)} />
               <div className="text-4xl font-black italic tracking-tighter mb-2 drop-shadow-lg">{stat.value}</div>
               <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content Areas */}
          <div className="lg:col-span-2 space-y-12 min-h-[600px]">
             <div className="bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl h-full">
                <div className="flex border-b border-white/5 px-8 overflow-x-auto no-scrollbar bg-black/20">
                   {tabs.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "px-8 py-8 font-black text-[10px] tracking-[0.2em] uppercase transition-all whitespace-nowrap",
                          activeTab === tab.id ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-500 hover:text-white"
                        )}
                     >
                        {tab.label}
                     </button>
                   ))}
                </div>
                
                <motion.div 
                   key={activeTab}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ duration: 0.3 }}
                   className="h-full"
                >
                   {activeTab === 'favorites' && <FavoritesTab />}
                   {activeTab === 'wishlist' && <WishlistTab />}
                   {activeTab === 'lists' && <CustomListsTab />}
                   {activeTab === 'activity' && (
                     <div className="p-20 text-center text-slate-500 font-black uppercase tracking-[0.2em]">Live stream encrypted</div>
                   )}
                </motion.div>
             </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             <div className="bg-indigo-600 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-[0_20px_50px_rgba(79,70,229,0.3)]">
                <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-black mb-4">AI ANALYTICS</h3>
                <p className="text-white/80 font-medium mb-8 leading-relaxed">Let our AI analyze your profile to suggest games based on your achievements and playstyle.</p>
                <button className="w-full py-4 bg-black/20 hover:bg-black/30 rounded-2xl font-black text-sm tracking-widest transition-all">
                   RUN ANALYSIS
                </button>
             </div>

             <div className="bg-[#151515] rounded-[2.5rem] p-10 border border-white/5">
                <h3 className="text-xl font-black mb-8 border-b border-white/5 pb-4">ACHIEVEMENTS</h3>
                <div className="space-y-6">
                   {[1,2,3].map(i => (
                     <div key={i} className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                           <Award className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                           <p className="font-bold text-sm">Pathfinder Medal</p>
                           <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Unlocked Jan 22</p>
                        </div>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-8 py-3 text-xs font-bold text-gray-500 hover:text-indigo-400 transition-colors uppercase tracking-[0.2em]">
                   VIEW ALL BADGES
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
