import React from 'react';
import { gameService } from '../lib/api';
import { Deal } from '../types';
import { Tag, TrendingDown, Clock, ShoppingCart, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Deals() {
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    gameService.getDeals({ pageSize: 20 }).then(data => {
      setDeals(data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-transparent min-h-screen text-white pt-32 pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
              <span className="text-blue-400 font-black tracking-widest text-[10px] uppercase">Flash Deals Live</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-none italic">
              LEVEL UP YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                SAVINGS
              </span>
            </h1>
            <p className="text-slate-400 text-lg font-medium opacity-80">
              We track the biggest discounts across Steam, Epic, GOG, and more. Stop paying full price for your passion.
            </p>
          </div>
          <div className="p-8 bg-blue-600/90 backdrop-blur-md border border-white/10 rounded-[2.5rem] flex items-center gap-8 shadow-2xl">
             <div className="text-center">
                <div className="text-3xl font-black italic tracking-tighter">85%</div>
                <div className="text-[9px] opacity-70 font-black uppercase tracking-widest">Max Savings</div>
             </div>
             <div className="h-10 w-[1px] bg-white/20" />
             <div className="text-center">
                <div className="text-3xl font-black italic tracking-tighter">200+</div>
                <div className="text-[9px] opacity-70 font-black uppercase tracking-widest">Live Drops</div>
             </div>
          </div>
        </div>

        {/* Featured Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
             Array(8).fill(0).map((_, i) => (
               <div key={i} className="aspect-[4/5] bg-white/5 rounded-3xl animate-pulse" />
             ))
          ) : (
            deals.map((deal, i) => (
              <motion.div
                key={deal.dealID}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="group bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden hover:bg-white/10 hover:border-blue-500/30 transition-all shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden p-2">
                  <img src={deal.thumb} alt={deal.title} className="w-full h-full object-cover rounded-2xl transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 right-4 bg-blue-500 text-white font-black px-3 py-1.5 rounded-xl text-xs shadow-xl italic tracking-tighter">
                    -{Math.round(parseFloat(deal.savings))}%
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-sm font-black mb-4 line-clamp-1 group-hover:text-blue-300 transition-colors uppercase tracking-tight">
                    {deal.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex flex-col">
                        <span className="text-slate-500 text-[10px] line-through font-bold">${deal.normalPrice}</span>
                        <span className="text-2xl font-black text-white italic tracking-tighter">${deal.salePrice}</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-blue-400">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest italic">Lowest Price</span>
                     </div>
                  </div>

                  <a 
                    href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black font-black rounded-xl text-xs uppercase tracking-widest hover:bg-blue-400 transition-all shadow-xl"
                  >
                    <span>Get Deal</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* AI Deal Finder Banner */}
        <div className="mt-32 p-1 rounded-[3rem] bg-gradient-to-r from-red-500 via-indigo-600 to-purple-500">
           <div className="bg-[#0A0A0A] rounded-[2.8rem] px-8 py-16 md:p-20 flex flex-col items-center text-center">
              <div className="p-4 bg-indigo-600/20 rounded-2xl mb-8">
                 <Sparkles className="w-12 h-12 text-indigo-400" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 max-w-2xl leading-tight">THE AI-POWERED <br /> BARGAIN HUNTER</h2>
              <p className="text-gray-400 text-lg max-w-2xl mb-12">Our algorithm analyzes price histories to ensure you're actually getting a deal, and not just a marketing trick. We only show the highest quality drops.</p>
              <div className="flex space-x-4">
                 <button className="px-12 py-5 bg-white text-black rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center space-x-3">
                   <Clock className="w-5 h-5" />
                   <span>SET PRICE ALERTS</span>
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
