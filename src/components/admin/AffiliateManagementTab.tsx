import React from 'react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, orderBy, addDoc } from 'firebase/firestore';
import { AffiliateLink } from '../../types';
import { Plus, Trash2, ExternalLink, Hash, Globe, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function AffiliateManagementTab() {
  const [links, setLinks] = React.useState<AffiliateLink[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [newLink, setNewLink] = React.useState({
    game_id: '',
    platform: 'Steam',
    affiliate_url: ''
  });

  React.useEffect(() => {
    const q = query(collection(db, 'affiliate_links'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AffiliateLink)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.game_id || !newLink.affiliate_url) return;

    try {
      await addDoc(collection(db, 'affiliate_links'), {
        ...newLink,
        clicks: 0,
        created_at: new Date().toISOString()
      });
      setNewLink({ game_id: '', platform: 'Steam', affiliate_url: '' });
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Strike this affiliate link from the archive?')) return;
    try {
      await deleteDoc(doc(db, 'affiliate_links', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Monetization Matrix</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="px-8 py-4 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-500 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Link</span>
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAdd} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-blue-500/20 p-8 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6 items-end shadow-2xl">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Game Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. 521 (Valorant)"
                  value={newLink.game_id}
                  onChange={(e) => setNewLink({ ...newLink, game_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Source Platform</label>
                <select
                  value={newLink.platform}
                  onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="Steam">Steam</option>
                  <option value="Epic Games">Epic Games</option>
                  <option value="Official">Official Site</option>
                  <option value="Amazon">Amazon</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <div className="flex justify-between items-end gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Redirect Endpoint URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newLink.affiliate_url}
                      onChange={(e) => setNewLink({ ...newLink, affiliate_url: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button type="submit" className="p-3 bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors">
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {links.map((link) => (
          <div key={link.id} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 hover:bg-white/10 transition-all group shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Globe className="w-24 h-24" />
             </div>
             
             <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-blue-400">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => link.id && handleDelete(link.id)}
                  className="p-3 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
             </div>

             <div className="mb-6 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Target ID: {link.game_id}</span>
                </div>
                <h4 className="text-xl font-black italic uppercase tracking-tight mb-2">{link.platform}</h4>
                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-6 break-all line-clamp-1 opacity-50">
                   {link.affiliate_url}
                </div>
             </div>

             <div className="flex justify-between items-center pt-6 border-t border-white/5 relative z-10">
                <div>
                   <div className="text-2xl font-black italic tracking-tighter text-white">{link.clicks || 0}</div>
                   <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Total Conversions</div>
                </div>
                <a 
                  href={link.affiliate_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-blue-600 transition-all hover:scale-110 active:scale-95"
                >
                   <ExternalLink className="w-4 h-4" />
                </a>
             </div>
          </div>
        ))}

        {!loading && links.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white/5 rounded-[3rem] border border-white/10">
             <Globe className="w-16 h-16 text-slate-700 mx-auto mb-6" />
             <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">No active nodes in the monetization network</p>
          </div>
        )}
      </div>
    </div>
  );
}
