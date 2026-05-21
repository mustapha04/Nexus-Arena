import React from 'react';
import { gameService } from '../lib/api';
import { Game } from '../types';
import { Play, TrendingUp, Zap, Swords, Trophy, Sparkles, Gamepad2, ChevronRight, Star } from 'lucide-react';
import { motion } from 'motion/react';
import GameCard from '../components/GameCard';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const [trending, setTrending] = React.useState<Game[]>([]);
  const [shooters, setShooters] = React.useState<Game[]>([]);
  const [mmos, setMmos] = React.useState<Game[]>([]);
  const [featuredGames, setFeaturedGames] = React.useState<Game[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [config, setConfig] = React.useState<any>(null);

  React.useEffect(() => {
    const loadGames = async () => {
      try {
        const [allGames, configSnap] = await Promise.all([
          gameService.getGames(),
          getDoc(doc(db, 'homepage_config', 'main'))
        ]);
        
        let homeConfig = null;
        if (configSnap.exists()) {
          homeConfig = configSnap.data();
          setConfig(homeConfig);
        }

        setTrending(allGames.slice(0, 8));
        setShooters(allGames.filter(g => g.genre.toLowerCase().includes('shooter')).slice(0, 4));
        setMmos(allGames.filter(g => g.genre.toLowerCase().includes('mmo')).slice(0, 4));

        if (homeConfig?.featured_games?.length > 0) {
          const featured = allGames.filter(g => homeConfig.featured_games.includes(String(g.id)));
          setFeaturedGames(featured);
        }
      } catch (error) {
        console.error("Failed to load games", error);
      } finally {
        setLoading(false);
      }
    };
    loadGames();
  }, []);

  const heroData = config?.hero_banners?.[0] || {
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000",
    title: "CHRONOS FALL",
    description: "Experience the next generation of tactical MMO combat. Free to play on all platforms starting today."
  };

  return (
    <div className="bg-transparent min-h-screen text-white">
      {/* Cinematic Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroData.image} 
            alt="Gaming Hero" 
            className="w-full h-full object-cover opacity-50 scale-105 transition-transform duration-[10s] hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-blue-500/80 text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                {config?.announcements?.[0] || "Trending Now"}
              </span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-blue-400 fill-blue-400" />)}
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-4 leading-tight tracking-tighter italic uppercase text-white shadow-black drop-shadow-2xl">
               {config?.hero_banners?.[0] ? heroData.title : 'CHRONOS FALL'}
            </h1>
            
            <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-lg font-medium opacity-90">
              {heroData.description || "Experience the next generation of tactical MMO combat. Free to play on all platforms starting today."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to="/search" className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-400 hover:scale-105 active:scale-95 shadow-xl shadow-white/5">
                <Play className="w-4 h-4 fill-current" />
                <span>Play Free Now</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
        
        {/* Featured Section */}
        {(featuredGames.length > 0 || trending.length > 0) && (
          <section>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-black tracking-tight uppercase">
                    {featuredGames.length > 0 ? "Admirals Choice" : "Featured Arrivals"}
                  </h2>
                </div>
                <p className="text-slate-400 text-sm font-medium">Curated free-to-play gems direct from the forge.</p>
              </div>
              <Link to="/search" className="text-blue-400 hover:text-blue-300 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center">
                See Nexus Grid <ChevronRight className="ml-2 w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <div key={i} className="aspect-video bg-white/5 rounded-2xl animate-pulse" />
                ))
              ) : (
                (featuredGames.length > 0 ? featuredGames : trending).map((game, i) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <GameCard game={game} />
                  </motion.div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Feature/Category Split Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative group overflow-hidden rounded-[2rem] p-1 bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <div className="relative h-full bg-[#0F0F0F] rounded-[1.8rem] p-12 overflow-hidden">
               <Swords className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:text-indigo-500/10 transition-colors" />
               <h3 className="text-3xl font-black mb-6">ELITE SHOOTERS</h3>
               <p className="text-gray-400 mb-8 max-w-md">Precision, speed, and strategy. Dive into the most intense combat experiences available today.</p>
               <div className="grid grid-cols-2 gap-4">
                  {shooters.map(game => (
                    <Link key={game.id} to={`/game/${game.id}`} className="block relative group/item">
                      <img src={game.thumbnail} className="rounded-xl opacity-60 group-hover/item:opacity-100 transition-opacity" />
                    </Link>
                  ))}
               </div>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-[2rem] p-1 bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <div className="relative h-full bg-[#0F0F0F] rounded-[1.8rem] p-12 overflow-hidden">
               <Trophy className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:text-purple-500/10 transition-colors" />
               <h3 className="text-3xl font-black mb-6">LEGENDARY MMOs</h3>
               <p className="text-gray-400 mb-8 max-w-md">Massive worlds, infinite possibilities. Forge your legend in the biggest online communities.</p>
               <div className="grid grid-cols-2 gap-4">
                  {mmos.map(game => (
                    <Link key={game.id} to={`/game/${game.id}`} className="block relative group/item">
                      <img src={game.thumbnail} className="rounded-xl opacity-60 group-hover/item:opacity-100 transition-opacity" />
                    </Link>
                  ))}
               </div>
            </div>
          </div>
        </section>

        {/* AI Discovery Banner */}
        <section className="relative rounded-[3rem] overflow-hidden p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <div className="relative bg-[#0F0F0F] rounded-[2.8rem] px-8 py-16 md:p-20 flex flex-col md:flex-row items-center justify-between text-center md:text-left space-y-12 md:space-y-0">
            <div className="max-w-xl">
              <div className="flex items-center justify-center md:justify-start space-x-2 text-indigo-400 font-bold mb-4">
                <Sparkles className="w-5 h-5 fill-current" />
                <span className="uppercase tracking-widest text-sm">Powered by Gemini AI</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6">SMART DISCOVERY</h2>
              <p className="text-lg text-gray-400 mb-8">Not sure what to play? Our AI reviews thousands of games to find your perfect match based on your playstyle.</p>
              <Link to="/profile" className="inline-block px-12 py-5 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-colors">
                GET RECOMMENDATIONS
              </Link>
            </div>
            <div className="relative w-64 h-64">
               <div className="absolute inset-0 bg-indigo-500/20 blur-[50px] rounded-full animate-pulse" />
               <div className="absolute inset-4 bg-purple-500/20 blur-md rounded-full" />
               <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-full h-full border-4 border-dashed border-indigo-500/30 rounded-full flex items-center justify-center"
               >
                 <Gamepad2 className="w-24 h-24 text-indigo-500" />
               </motion.div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
