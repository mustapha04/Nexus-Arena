import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { gameService } from '../lib/api';
import { Game } from '../types';
import { 
  Play, ExternalLink, Shield, Cpu, HardDrive, 
  Layers, Clock, Calendar, Sparkles, Youtube, 
  Heart, MessageSquare, Star, Share2, Info, Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

import CommentSection from '../components/game/CommentSection';
import RatingSystem from '../components/game/RatingSystem';
import GameToggle from '../components/game/GameToggle';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { AffiliateLink } from '../types';
import { useAuth } from '../context/AuthContext';

export default function GameDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [game, setGame] = React.useState<Game | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [aiSummary, setAiSummary] = React.useState<string | null>(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'requirements'>('overview');
  const [affiliateLinks, setAffiliateLinks] = React.useState<AffiliateLink[]>([]);

  React.useEffect(() => {
    if (id) {
      gameService.getGameDetails(id).then(data => {
        setGame(data);
        setLoading(false);
        // Automatically fetch AI summary
        getAiSummary(data.title, data.short_description);
        // Track view
        gameService.trackView(String(id));
      }).catch(() => setLoading(false));

      // Fetch affiliate links
      const fetchAffiliate = async () => {
        const q = query(collection(db, 'affiliate_links'), where('game_id', '==', id));
        const snap = await getDocs(q);
        setAffiliateLinks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AffiliateLink)));
      };
      fetchAffiliate();
    }
  }, [id]);

  const handleAffiliateClick = async (link: AffiliateLink) => {
    try {
      await gameService.trackClick(link.game_id, link.platform, user?.uid);
      window.open(link.affiliate_url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error(e);
      window.open(link.affiliate_url, '_blank', 'noopener,noreferrer');
    }
  };

  const getAiSummary = async (title: string, desc: string) => {
    setAiLoading(true);
    try {
      const res = await gameService.summarizeGame(title, desc);
      setAiSummary(res.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
    </div>
  );

  if (!game) return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-black mb-4 uppercase italic">Game not found</h1>
      <Link to="/" className="text-blue-400 hover:underline font-bold">Go back home</Link>
    </div>
  );

  return (
    <div className="bg-transparent min-h-screen text-white pb-24 relative overflow-hidden">
      {/* Hero Banner */}
      <div className="relative h-[70vh] w-full">
        <div className="absolute inset-0">
          <img 
            src={game.thumbnail || null} 
            alt={game.title} 
            className="w-full h-full object-cover opacity-30 fixed scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-bg via-transparent to-transparent md:block hidden" />
        </div>

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-12 md:pb-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end gap-12"
          >
            <div className="relative group">
              <div className="p-1 bg-gradient-to-br from-blue-500 to-purple-500 rounded-[2rem] shadow-2xl transition-transform group-hover:scale-105">
                <img 
                  src={game.thumbnail || null} 
                  alt={game.title} 
                  className="w-64 md:w-80 rounded-[1.8rem] border border-white/10"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -top-4 -left-4 bg-blue-600 px-4 py-2 rounded-xl text-xs font-black tracking-widest shadow-xl uppercase italic ring-1 ring-white/20">
                {game.genre}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                <span className="text-blue-400 font-black tracking-widest text-[10px] uppercase">Nexus Verified Title</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-none italic uppercase drop-shadow-2xl">
                {game.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 items-center">
                <a 
                  href={game.game_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-400 hover:scale-105 active:scale-95 shadow-2xl"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Gratis</span>
                </a>
                
                {affiliateLinks.map(link => (
                  <button
                    key={link.id}
                    onClick={() => handleAffiliateClick(link)}
                    className="flex items-center gap-3 px-10 py-5 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-2xl"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Get on {link.platform}</span>
                  </button>
                ))}

                <GameToggle game={game} type="favorite" />
                <GameToggle game={game} type="wishlist" />

                <button className="p-5 bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 rounded-2xl transition-all hover:scale-105">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12 -mt-10 relative z-20">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* AI Insights Card */}
          <div className="relative rounded-3xl overflow-hidden p-1 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 transition-all hover:shadow-[0_0_50px_rgba(59,130,246,0.2)] group">
            <div className="bg-black/60 backdrop-blur-2xl rounded-[1.4rem] p-8 md:p-12 relative overflow-hidden">
               <Sparkles className="absolute -right-8 -top-8 w-48 h-48 text-blue-500/10 rotate-12 transition-transform group-hover:scale-110" />
               <div className="flex items-center gap-3 mb-8">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-black tracking-tight uppercase italic">Intelligence Report</h3>
               </div>
               
               <AnimatePresence mode="wait">
                 {aiLoading ? (
                   <div className="space-y-4">
                     <div className="h-4 bg-white/5 rounded-full w-full animate-pulse" />
                     <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse" />
                     <div className="h-4 bg-white/5 rounded-full w-4/6 animate-pulse" />
                   </div>
                 ) : (
                   <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose prose-invert max-w-none prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-blue-400 prose-p:text-lg"
                   >
                     <ReactMarkdown>{aiSummary || "No insights available for this title yet."}</ReactMarkdown>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>

          {/* Description & Requirements Tabs */}
          <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="flex border-b border-white/5 bg-black/20">
              <button 
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "px-8 py-6 font-black text-xs tracking-widest uppercase transition-all flex-1 md:flex-none",
                  activeTab === 'overview' ? "bg-white/10 text-blue-400 border-b-2 border-blue-500" : "text-slate-500 hover:text-white"
                )}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('requirements')}
                className={cn(
                  "px-8 py-6 font-black text-xs tracking-widest uppercase transition-all flex-1 md:flex-none",
                  activeTab === 'requirements' ? "bg-white/10 text-blue-400 border-b-2 border-blue-500" : "text-slate-500 hover:text-white"
                )}
              >
                Hardware Labs
              </button>
            </div>

            <div className="p-8 md:p-12">
              {activeTab === 'overview' ? (
                <div>
                  <h4 className="text-lg font-black mb-8 flex items-center gap-3 uppercase italic">
                    <Info className="w-5 h-5 text-blue-400" />
                    Archive Details
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-lg mb-10 font-medium">
                    {game.short_description}
                  </p>
                  
                  {game.screenshots && game.screenshots.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
                      {game.screenshots.map(shot => (
                        <div key={shot.id} className="group overflow-hidden rounded-2xl border border-white/10">
                          <img 
                            src={shot.image || null} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {game.minimum_system_requirements ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { label: 'OS CORE', icon: Monitor, value: game.minimum_system_requirements.os },
                        { label: 'PROCESSOR Unit', icon: Cpu, value: game.minimum_system_requirements.processor },
                        { label: 'MEMORY Allocation', icon: Layers, value: game.minimum_system_requirements.memory },
                        { label: 'GRAPHICS Module', icon: HardDrive, value: game.minimum_system_requirements.graphics }
                      ].map((req, i) => (
                        <div key={i} className="flex items-start gap-4 p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="p-3 bg-blue-500/10 rounded-xl"><req.icon className="w-5 h-5 text-blue-400" /></div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">{req.label}</p>
                            <p className="font-bold text-sm text-slate-200">{req.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Standard cross-platform support detected.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 md:p-12 shadow-2xl">
            <CommentSection gameId={String(game.id)} />
          </div>
        </div>

        {/* Right Column: Sidebar info */}
        <div className="space-y-8">
          <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 space-y-8 shadow-2xl">
            <h3 className="text-xs font-black tracking-widest text-slate-500 uppercase flex items-center gap-2">
              <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
              Mission Data
            </h3>
            
            <div className="space-y-6">
               {[
                 { label: 'Deployment', value: game.release_date },
                 { label: 'Command Authority', value: game.publisher },
                 { label: 'Foundry', value: game.developer },
                 { label: 'Tech Stack', icon: Monitor, value: game.platform }
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5">
                   <span className="text-slate-500 uppercase text-[10px] font-black tracking-tighter">{item.label}</span>
                   <div className="flex items-center gap-2">
                     {item.icon && <item.icon className="w-3 h-3 text-blue-400" />}
                     <span className="font-bold text-sm text-slate-200">{item.value}</span>
                   </div>
                 </div>
               ))}
            </div>

            <div className="pt-4">
              <a 
                href={game.game_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Visit Forge</span>
              </a>
            </div>
          </div>

          {/* Rating Metrics */}
          <RatingSystem gameId={String(game.id)} />
        </div>
      </div>
    </div>
  );
}
