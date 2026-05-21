import React from 'react';
import { Gamepad2, Twitter, Github, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative z-10">
      <div className="bg-black/20 border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-6 group">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black text-white tracking-widest uppercase">
                  NEXUS<span className="text-blue-400">ARENA</span>
                </span>
              </Link>
              <p className="text-slate-400 leading-relaxed text-sm">
                The ultimate gaming portal powered by AI. Discover free-to-play gems, track the best deals, and join a community of elite gamers.
              </p>
            </div>

            <div>
              <h3 className="text-slate-100 text-xs font-black mb-6 tracking-widest uppercase">PLATFORM</h3>
              <ul className="space-y-4 text-sm">
                <li><Link to="/search?category=mmo" className="text-slate-400 hover:text-blue-400 transition-colors">MMO Games</Link></li>
                <li><Link to="/search?category=shooter" className="text-slate-400 hover:text-blue-400 transition-colors">Shooter</Link></li>
                <li><Link to="/search?category=racing" className="text-slate-400 hover:text-blue-400 transition-colors">Racing</Link></li>
                <li><Link to="/search?category=strategy" className="text-slate-400 hover:text-blue-400 transition-colors">Strategy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-100 text-xs font-black mb-6 tracking-widest uppercase">RESOURCES</h3>
              <ul className="space-y-4 text-sm">
                <li><Link to="/deals" className="text-slate-400 hover:text-blue-400 transition-colors">Game Deals</Link></li>
                <li><Link to="/search" className="text-slate-400 hover:text-blue-400 transition-colors">Browse All</Link></li>
                <li><Link to="/admin-login" className="text-slate-400 hover:text-blue-400 transition-colors">Admin Portal</Link></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-slate-100 text-xs font-black mb-6 tracking-widest uppercase">CONNECT</h3>
              <div className="flex space-x-4 mb-6">
                <a href="#" className="p-3 bg-white/5 hover:bg-blue-600 rounded-full text-slate-400 hover:text-white transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="p-3 bg-white/5 hover:bg-blue-600 rounded-full text-slate-400 hover:text-white transition-all">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="p-3 bg-white/5 hover:bg-blue-600 rounded-full text-slate-400 hover:text-white transition-all">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="email" 
                  placeholder="Stay updated"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-10 bg-black/40 border-t border-white/5 flex items-center justify-between px-8 text-[10px] text-slate-500">
        <div className="flex items-center gap-6 uppercase tracking-wider font-medium">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            Server Status: Online
          </div>
          <div className="hidden sm:block">Active Connections: 42,912</div>
          <div className="hidden sm:block">Region: EU-WEST-2</div>
        </div>
        <div className="flex gap-4">
          <span className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-blue-400 cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
