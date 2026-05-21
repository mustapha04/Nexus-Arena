import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { gameService } from '../lib/api';
import { Game } from '../types';
import { Search as SearchIcon, Sliders, Filter, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GameCard from '../components/GameCard';
import { cn } from '../lib/utils';

const CATEGORIES = [
  'shooter', 'mmo', 'strategy', 'racing', 'sports', 'anime', 'battle-royale'
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  
  const [games, setGames] = React.useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = React.useState<Game[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState(query);
  const [showFilters, setShowFilters] = React.useState(false);

  React.useEffect(() => {
    gameService.getGames().then(data => {
      setGames(data);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    let result = [...games];
    
    if (searchTerm) {
      result = result.filter(g => 
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.short_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (category) {
      result = result.filter(g => g.genre.toLowerCase().includes(category.toLowerCase()));
    }
    
    setFilteredGames(result);
  }, [searchTerm, category, games]);

  const handleCategoryClick = (cat: string) => {
    if (category === cat) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="bg-transparent min-h-screen text-white pt-32 pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-none italic">
            DISCOVER YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              NEXT ADVENTURE
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium opacity-80">
            Search through thousands of free-to-play titles. Filter by genre, platform, or use our AI recommended lists.
          </p>
        </div>

        {/* Search Bar & Filters */}
        <div className="space-y-6 mb-16">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search games, genres, or vibes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl py-5 pl-16 pr-8 text-lg text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold placeholder:text-slate-600 shadow-xl"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border shadow-lg",
                showFilters ? "bg-blue-600 border-blue-500 text-white shadow-blue-500/20" : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
              )}
            >
              <Sliders className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
              >
                <div className="space-y-8">
                  <div>
                    <h3 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-6 flex items-center gap-2">
                      <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                      Browse Genres
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => handleCategoryClick(cat)}
                          className={cn(
                            "px-5 py-2.5 rounded-xl font-bold text-xs transition-all uppercase tracking-tight border",
                            category === cat 
                              ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                              : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                       <Sparkles className="w-3 h-3" />
                       <span>AI Engine Active</span>
                    </div>
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setSearchParams({});
                      }}
                      className="text-slate-500 hover:text-slate-300 font-black transition-colors flex items-center text-[10px] uppercase tracking-widest"
                    >
                      Reset All <X className="ml-2 w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="space-y-12">
          <div className="flex justify-between items-center border-b border-white/10 pb-6">
            <h2 className="text-2xl font-black">{filteredGames.length} RESULTS FOUND</h2>
            <div className="flex items-center space-x-2 text-gray-500 font-bold text-sm">
              <span>SORT:</span>
              <select className="bg-transparent border-none text-white focus:outline-none cursor-pointer hover:text-indigo-400 transition-colors font-black">
                <option>RELEVANCE</option>
                <option>ALPHABETICAL</option>
                <option>POPULARITY</option>
                <option>NEWEST</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {Array(8).fill(0).map((_, i) => (
                 <div key={i} className="aspect-video bg-white/5 rounded-2xl animate-pulse" />
               ))}
            </div>
          ) : filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredGames.map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (i % 12) * 0.05 }}
                >
                  <GameCard game={game} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
               <div className="inline-block p-12 bg-white/5 rounded-[3rem] mb-8">
                 <SearchIcon className="w-24 h-24 text-gray-700" />
               </div>
               <h3 className="text-3xl font-black mb-4 uppercase">No games matching your quest</h3>
               <p className="text-gray-500 max-w-sm mx-auto font-medium">Try broadening your search or choosing a different category to find hidden gems.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
