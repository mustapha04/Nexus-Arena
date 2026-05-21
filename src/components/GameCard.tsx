import React from 'react';
import { Game } from '../types';
import { Link } from 'react-router-dom';
import { Star, Monitor, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 transition-all hover:bg-white/10 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] ring-1 ring-transparent hover:ring-blue-500/20"
    >
      <Link to={`/game/${game.id}`} className="block">
        <div className="relative aspect-video overflow-hidden p-3 pb-0">
          <img
            src={game.thumbnail}
            alt={game.title}
            className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-6 left-6">
            <span className="px-2 py-0.5 bg-blue-500/80 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-tighter shadow-lg">
              {game.genre}
            </span>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-sm font-black text-white group-hover:text-blue-300 transition-colors line-clamp-1 uppercase tracking-tight">
              {game.title}
            </h4>
            <span className="text-[9px] text-green-400 font-black">FREE</span>
          </div>
          
          <div className="text-[10px] text-slate-500 font-medium mb-4">
            {game.platform} • {game.genre}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <p className="text-slate-400 text-[10px] line-clamp-1 flex-1 pr-4 italic opacity-0 group-hover:opacity-100 transition-opacity">
              {game.short_description}
            </p>
            
            <div className="flex items-center text-blue-400 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
              Details <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
