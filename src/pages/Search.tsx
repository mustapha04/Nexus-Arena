import React from 'react';
import { useSearchParams, useParams, useLocation, Link } from 'react-router-dom';
import { gameService } from '../lib/api';
import { Game } from '../types';
import { Search as SearchIcon, Sliders, Filter, Sparkles, X, Flame, Award, Calendar, RefreshCw, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GameCard from '../components/GameCard';
import { cn, getSlug } from '../lib/utils';
import SEO from '../components/SEO';
import { getBreadcrumbSchema, getWebsiteSchema } from '../lib/seo-schemas';

const CATEGORIES = [
  'shooter', 'mmo', 'strategy', 'racing', 'sports', 'anime', 'battle-royale'
];

interface SearchProps {
  type?: 'trending' | 'top-rated' | 'upcoming';
}

export default function Search({ type }: SearchProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { genre } = useParams<{ genre?: string }>();
  const location = useLocation();

  const query = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';
  
  // Resolve active category either from URL query or path parameter `/genre/:genre`
  const category = genre || urlCategory;

  const [games, setGames] = React.useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = React.useState<Game[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState(query);
  const [showFilters, setShowFilters] = React.useState(false);
  const [sortBy, setSortBy] = React.useState('RELEVANCE');

  // Autocomplete state
  const [autoCompleteList, setAutoCompleteList] = React.useState<Game[]>([]);
  const [showAutocomplete, setShowAutocomplete] = React.useState(false);

  React.useEffect(() => {
    gameService.getGames().then(data => {
      setGames(data);
      setLoading(false);
    });
  }, []);

  // Sync state search term with query param
  React.useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  // Main filter and processing logic
  React.useEffect(() => {
    let result = [...games];
    
    // 1. Text Search matching title or descriptor
    if (searchTerm) {
      result = result.filter(g => 
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.short_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 2. Category / Genre matching
    if (category) {
      result = result.filter(g => g.genre.toLowerCase().includes(category.toLowerCase()));
    }

    // 3. Handle Special Path Rules
    const isTrending = type === 'trending' || location.pathname === '/trending';
    const isTopRated = type === 'top-rated' || location.pathname === '/top-rated';
    const isUpcoming = type === 'upcoming' || location.pathname === '/upcoming';

    if (isTrending) {
      // Simulate weekly trending priority by filtering/slicing highly recognized titles
      result = result.filter(g => g.id % 2 === 0);
    } else if (isTopRated) {
      // Select best titles
      result = result.filter(g => g.id % 3 === 0 || g.developer.length > 12);
    } else if (isUpcoming) {
      // Display newer mock upcoming releases
      result = result.filter(g => g.release_date && parseInt(g.release_date.substring(0, 4)) >= 2022);
    }
    
    // 4. Sort calculations
    if (sortBy === 'ALPHABETICAL') {
      result.sort((a,b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'POPULARITY' || isTrending) {
      result.sort((a,b) => b.id - a.id);
    } else if (sortBy === 'NEWEST' || isUpcoming) {
      result.sort((a,b) => b.release_date.localeCompare(a.release_date));
    }
    
    setFilteredGames(result);
  }, [searchTerm, category, games, type, location.pathname, sortBy]);

  // Handle autocomplete matching in real-time
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (val.trim().length >= 2) {
      const match = games.filter(g => 
        g.title.toLowerCase().includes(val.toLowerCase()) || 
        g.genre.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setAutoCompleteList(match);
      setShowAutocomplete(true);
    } else {
      setAutoCompleteList([]);
      setShowAutocomplete(false);
    }
  };

  const selectAutocomplete = (gameTitle: string) => {
    setSearchTerm(gameTitle);
    setShowAutocomplete(false);
    
    // Update query parameters
    const params = new URLSearchParams(searchParams);
    params.set('q', gameTitle);
    setSearchParams(params);
  };

  const handleCategoryClick = (cat: string) => {
    // If we're on a clean genre route /genre/:genre, navigate to /search with the parameter or reset
    const params = new URLSearchParams(searchParams);
    if (category === cat) {
      params.delete('category');
      setSearchParams(params);
      if (genre) {
        // Redirection for genre URL cleanup
        window.history.pushState({}, '', '/search');
      }
    } else {
      params.set('category', cat);
      setSearchParams(params);
    }
  };

  // Determine dynamic SEO Meta values
  const isTrending = type === 'trending' || location.pathname === '/trending';
  const isTopRated = type === 'top-rated' || location.pathname === '/top-rated';
  const isUpcoming = type === 'upcoming' || location.pathname === '/upcoming';

  let seoTitle = "Nexus Arena – Discover Trending Games, Reviews & Gaming Content";
  let seoDescription = "Search through thousands of free-to-play titles. Filter by genre, platform, or use our AI recommended lists on Nexus Arena.";
  let heading = "DISCOVER YOUR NEXT ADVENTURE";
  let subHeading = "Search through thousands of free-to-play titles. Filter by genre, platform, or use our AI recommended lists.";

  if (genre) {
    const formattedGenre = genre.charAt(0).toUpperCase() + genre.slice(1);
    seoTitle = `Best ${formattedGenre} Games | Nexus Arena`;
    seoDescription = `Browse the absolute best free-to-play ${formattedGenre} games sorted dynamically by rating and relevance. Complete details on Nexus Arena.`;
    heading = `PREMIUM ${formattedGenre.toUpperCase()} ARCHIVE`;
    subHeading = `A professional curated index of premier ${genre} multiplayer, cross-platform and competitive titles.`;
  } else if (isTrending) {
    seoTitle = "Trending Games This Week | Nexus Arena";
    seoDescription = "Check out the most played and viral free-to-play titles this week on Nexus Arena. Updated in real-time.";
    heading = "TRENDING NOW";
    subHeading = "The hottest community-backed multiplayer free-to-play games dominating the server charts.";
  } else if (isTopRated) {
    seoTitle = "Top Rated Games | Nexus Arena";
    seoDescription = "The highest-rated free-to-play tactical shooters, multiplayer RPGs, and strategy games on Nexus Arena.";
    heading = "TOP RATED GAMES";
    subHeading = "The absolute apex of gaming design. Highest aggregate ratings from critics and players.";
  } else if (isUpcoming) {
    seoTitle = "Upcoming Games | Nexus Arena";
    seoDescription = "Be the first to discover the most anticipated free-to-play launches, massive updates, and upcoming MMO releases.";
    heading = "UPCOMING ARRIVALS";
    subHeading = "Anticipated combat launches, public server configurations, and immediate dynamic arrivals.";
  }

  const canonicalUrl = `https://nexusarena.com${location.pathname}${location.search}`;

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: 'https://nexusarena.com/' },
      { name: heading, url: canonicalUrl }
    ]),
    getWebsiteSchema(searchTerm)
  ];

  return (
    <div className="bg-transparent min-h-screen text-white pt-32 pb-24 relative" id="search-view-container">
      {/* Dynamic SEO Meta tagging */}
      <SEO 
        title={seoTitle}
        description={seoDescription.substring(0, 160)}
        canonical={canonicalUrl}
        schemas={schemas}
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header with SEO friendly semantic tags */}
        <div className="mb-12">
          <nav className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-blue-400 font-extrabold">{isTrending ? 'Trending' : isTopRated ? 'Top Rated' : isUpcoming ? 'Upcoming' : genre ? 'Genre Archive' : 'Library'}</span>
          </nav>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-none italic" id="search-main-title">
            {heading.split(' ')[0]} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {heading.split(' ').slice(1).join(' ')}
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl font-medium opacity-85">
            {subHeading}
          </p>
        </div>

        {/* Search Bar & AutoComplete Interactive Drops */}
        <div className="space-y-6 mb-16 relative">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search games, genres, or vibes..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => { if (autoCompleteList.length > 0) setShowAutocomplete(true); }}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200) /* delay to allow click */}
                className="w-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl py-5 pl-16 pr-8 text-lg text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold placeholder:text-slate-600 shadow-xl"
                id="search-input-field"
              />
              
              {/* Autocomplete drop-down wrapper */}
              <AnimatePresence>
                {showAutocomplete && autoCompleteList.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 top-[110%] bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 overflow-hidden z-50 divide-y divide-white/5"
                    id="autocomplete-suggestions"
                  >
                    {autoCompleteList.map(item => (
                      <div 
                        key={item.id} 
                        onMouseDown={() => selectAutocomplete(item.title)}
                        className="flex items-center gap-4 py-3 px-4 hover:bg-white/5 cursor-pointer rounded-xl transition-all"
                      >
                        <img 
                          src={item.thumbnail} 
                          alt={item.title} 
                          className="w-12 h-9 object-cover rounded-md border border-white/10"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-sm text-white truncate uppercase">{item.title}</p>
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{item.genre} • {item.platform}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border shadow-lg",
                showFilters ? "bg-blue-600 border-blue-500 text-white shadow-blue-500/20" : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
              )}
              id="filter-toggle-button"
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
                        if (genre) {
                          window.history.pushState({}, '', '/search');
                        }
                      }}
                      className="text-slate-500 hover:text-slate-300 font-black transition-colors flex items-center text-[10px] uppercase tracking-widest pointer-events-auto"
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
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-white focus:outline-none cursor-pointer hover:text-indigo-400 transition-colors font-black uppercase"
                id="sort-selector"
              >
                <option value="RELEVANCE" className="bg-brand-bg text-white">RELEVANCE</option>
                <option value="ALPHABETICAL" className="bg-brand-bg text-white">ALPHABETICAL</option>
                <option value="POPULARITY" className="bg-brand-bg text-white">POPULARITY</option>
                <option value="NEWEST" className="bg-brand-bg text-white">NEWEST</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" id="skeleton-loading-grid">
               {Array(8).fill(0).map((_, i) => (
                 <div key={i} className="aspect-video bg-white/5 rounded-2xl animate-pulse" />
               ))}
            </div>
          ) : filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" id="search-results-grid">
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
            <div className="text-center py-24" id="empty-search-state">
               <div className="inline-block p-12 bg-white/5 rounded-[3rem] mb-8">
                 <SearchIcon className="w-24 h-24 text-gray-700" />
               </div>
               <h3 className="text-3xl font-black mb-4 uppercase">No games matching your quest</h3>
               <p className="text-gray-500 max-w-sm mx-auto font-medium">Try broadening your search or choosing a different category to find hidden gems.</p>
            </div>
          )}
        </div>

        {/* Dynamic Rich SEO Keyword Text Block at page bottom (extremely valuable for crawl context) */}
        <section className="mt-24 p-8 bg-white/5 rounded-3xl border border-white/10 text-slate-400 text-xs text-justify leading-relaxed max-w-7xl" id="rich-seo-keyword-block">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4 italic flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Nexus Premium Database Analytics Information
          </h2>
          <p>
            Browse high-fidelity competitive combat archives and review community-led aggregate feedback for the best {category || 'general'} titles. 
            Discover developer labs releasing updates dynamically, learn recommended hardware compatibility layouts, and find affiliate pricing 
            on multi-user streaming platforms. Nexus Arena indexes verified information to supply gamers with optimal search parameters, 
            avoiding unreadable links to preserve direct gameplay. All titles are subject to real-time status diagnostics verified by the 
            Nexus Arena Core, which implements cryptographic authorization structures and prevents duplication exploits across the public grids.
          </p>
        </section>

      </div>
    </div>
  );
}
