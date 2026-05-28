import React from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, orderBy, addDoc } from 'firebase/firestore';
import { AffiliateLink, Game } from '../../types';
import { gameService } from '../../lib/api';
import { Plus, Trash2, ExternalLink, Hash, Globe, ShoppingCart, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function AffiliateManagementTab() {
  const [links, setLinks] = React.useState<AffiliateLink[]>([]);
  const [games, setGames] = React.useState<Game[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [targetType, setTargetType] = React.useState<'all' | 'specific'>('all');
  const [platformType, setPlatformType] = React.useState<'all' | 'specific'>('all');
  const [newLink, setNewLink] = React.useState({
    game_id: 'all',
    platform: 'All',
    affiliate_url: '',
    is_active: true
  });

  React.useEffect(() => {
    gameService.getGames()
      .then(allGames => {
        setGames(allGames);
      })
      .catch(err => {
        console.error("Failed to load games list for admin affiliate configuration", err);
      });
  }, []);

  React.useEffect(() => {
    const q = query(collection(db, 'affiliate_links'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AffiliateLink)));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'affiliate_links');
    });
    return unsubscribe;
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.game_id || !newLink.affiliate_url) return;

    try {
      await addDoc(collection(db, 'affiliate_links'), {
        game_id: newLink.game_id,
        platform: newLink.platform,
        affiliate_url: newLink.affiliate_url,
        is_active: newLink.is_active,
        clicks: 0,
        created_at: new Date().toISOString()
      });
      setNewLink({ game_id: 'all', platform: 'All', affiliate_url: '', is_active: true });
      setTargetType('all');
      setPlatformType('all');
      setShowAdd(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'affiliate_links');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean | undefined) => {
    const isCurrentlyActive = currentStatus !== false;
    try {
      await setDoc(doc(db, 'affiliate_links', id), { is_active: !isCurrentlyActive }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `affiliate_links/${id}`);
    }
  };

  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(doc(db, 'affiliate_links', deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `affiliate_links/${deleteTargetId}`);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const getGameTitle = (gameId: string) => {
    if (gameId === 'all') return 'All Games Across Matrix';
    const matchedGame = games.find(g => String(g.id) === gameId);
    return matchedGame ? `${matchedGame.title}` : `Game ID: ${gameId}`;
  };

  const getPlatformName = (platformName: string) => {
    if (platformName === 'All') return 'All Platforms / Global Redirect';
    return platformName;
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
            <form onSubmit={handleAdd} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-blue-500/20 p-8 mb-8 space-y-6 shadow-2xl">
              <h3 className="text-lg font-black uppercase italic tracking-wider text-blue-400 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Launch Affiliate Node
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Game Target Configuration */}
                <div className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Target Game Range</label>
                  <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetType('all');
                        setNewLink(prev => ({ ...prev, game_id: 'all' }));
                      }}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        targetType === 'all' 
                          ? "bg-blue-600 text-white shadow" 
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      All Games
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetType('specific');
                        setNewLink(prev => ({ ...prev, game_id: games[0]?.id ? String(games[0].id) : '' }));
                      }}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        targetType === 'specific' 
                          ? "bg-blue-600 text-white shadow" 
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      Specific Game
                    </button>
                  </div>

                  {targetType === 'specific' && (
                    <div className="pt-2 animate-fadeIn">
                      <select
                        value={newLink.game_id}
                        onChange={(e) => setNewLink({ ...newLink, game_id: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 outline-none text-white [&>option]:bg-slate-950 [&>option]:text-white"
                        required
                      >
                        <option value="">-- Select Target Game --</option>
                        {games.map(g => (
                          <option key={g.id} value={String(g.id)}>
                            {g.title} (ID: {g.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Platform Target Configuration */}
                <div className="space-y-3 bg-white/5 p-5 rounded-2xl border border-white/5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Target Platform Range</label>
                  <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setPlatformType('all');
                        setNewLink(prev => ({ ...prev, platform: 'All' }));
                      }}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        platformType === 'all' 
                          ? "bg-blue-600 text-white shadow" 
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      All Platforms
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPlatformType('specific');
                        setNewLink(prev => ({ ...prev, platform: 'Steam' }));
                      }}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        platformType === 'specific' 
                          ? "bg-blue-600 text-white shadow" 
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      Specific Platform
                    </button>
                  </div>

                  {platformType === 'specific' && (
                    <div className="pt-2 animate-fadeIn">
                      <select
                        value={newLink.platform}
                        onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 outline-none text-white [&>option]:bg-slate-950 [&>option]:text-white"
                        required
                      >
                        <option value="Steam">Steam</option>
                        <option value="Epic Games">Epic Games</option>
                        <option value="Official">Official Site</option>
                        <option value="Amazon">Amazon</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* URL and Submit Action */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center pt-2">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block">Redirect Endpoint URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newLink.affiliate_url}
                    onChange={(e) => setNewLink({ ...newLink, affiliate_url: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-white"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setNewLink(prev => ({ ...prev, is_active: !prev.is_active }))}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500",
                        newLink.is_active ? "bg-blue-600" : "bg-slate-700"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          newLink.is_active ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Override Active</span>
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
        {links.map((link) => {
          const isTargetedForDelete = deleteTargetId === link.id;
          return (
            <div key={link.id} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 hover:bg-white/10 transition-all group shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Globe className="w-24 h-24" />
               </div>
                
               <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-blue-400">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <button
                      onClick={() => link.id && handleToggleActive(link.id, link.is_active)}
                      className={cn(
                        "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full transition-all border",
                        link.is_active !== false 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                      )}
                    >
                      {link.is_active !== false ? "● Active Override" : "○ Inactive (Direct)"}
                    </button>
                  </div>
                  <button 
                    onClick={() => link.id && handleDelete(link.id)}
                    className="p-3 text-slate-400 hover:text-red-400 transition-colors relative z-20 hover:scale-110 active:scale-95 cursor-pointer opacity-70 group-hover:opacity-100"
                    title="Delete Affiliate Link"
                  >
                    <Trash2 className="w-5 h-5 pointer-events-none" />
                  </button>
               </div>
  
               <div className="mb-6 relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                      Target: {link.game_id === 'all' ? 'All Games' : getGameTitle(link.game_id)}
                    </span>
                  </div>
                  <h4 className="text-xl font-black italic uppercase tracking-tight mb-2">
                    {getPlatformName(link.platform)}
                  </h4>
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
          );
        })}

        {!loading && links.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white/5 rounded-[3rem] border border-white/10">
             <Globe className="w-16 h-16 text-slate-700 mx-auto mb-6" />
             <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">No active nodes in the monetization network</p>
          </div>
        )}
      </div>

      {/* Premium Custom Confirmation Drawer / Modal */}
      <AnimatePresence>
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative space-y-6"
            >
              <h3 className="text-xl font-black uppercase italic tracking-wider text-red-500 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500 animate-pulse" />
                Confirm Deletion
              </h3>
              <p className="text-sm text-slate-400 tracking-wide font-medium leading-relaxed">
                Are you sure you want to permanently strike this affiliate node from the archive? This operation is irreversible.
              </p>
              
              {(() => {
                const targetLink = links.find(l => l.id === deleteTargetId);
                if (!targetLink) return null;
                return (
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-5 text-xs space-y-2.5">
                    <div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-0.5">Target Game</span>
                      <span className="text-white font-bold">{getGameTitle(targetLink.game_id)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-0.5">Platform Node</span>
                      <span className="text-white font-bold">{getPlatformName(targetLink.platform)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-0.5">Redirect URL</span>
                      <span className="text-blue-400 font-mono break-all font-semibold block">{targetLink.affiliate_url}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-xl font-black text-xs uppercase tracking-widest text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-500 active:scale-95 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all cursor-pointer shadow-lg shadow-red-600/30"
                >
                  Strike Node
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
