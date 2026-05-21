import React from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, orderBy, addDoc } from 'firebase/firestore';
import { GameList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { List, Plus, Trash2, Edit3, Layers, LayoutGrid, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function CustomListsTab() {
  const { user } = useAuth();
  const [lists, setLists] = React.useState<GameList[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [newList, setNewList] = React.useState({ title: '', description: '' });

  React.useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'lists'),
      where('user_id', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const raw = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameList));
      const sorted = raw.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      setLists(sorted);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newList.title.trim()) return;

    try {
      await addDoc(collection(db, 'lists'), {
        user_id: user.uid,
        title: newList.title,
        description: newList.description,
        games: [],
        created_at: new Date().toISOString()
      });
      setNewList({ title: '', description: '' });
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this collection and its records?')) return;
    try {
      await deleteDoc(doc(db, 'lists', id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
     <div className="p-12 text-center animate-pulse text-slate-500 font-black uppercase tracking-widest">Reconstructing Collections...</div>
  );

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3">
          <LayoutGrid className="w-6 h-6 text-blue-400" />
          Nexus Archives
        </h3>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl"
        >
          <Plus className="w-4 h-4" />
          <span>New Catalog</span>
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
            <form onSubmit={handleCreate} className="bg-white/5 border border-blue-500/20 rounded-3xl p-8 mb-8 space-y-4">
              <input
                type="text"
                placeholder="Collection Title (e.g. Master Shooters)"
                value={newList.title}
                onChange={(e) => setNewList({ ...newList, title: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <textarea
                placeholder="Description of the archive..."
                value={newList.description}
                onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setShowAdd(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-500">Abort</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500">Finalize</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {lists.map((list) => (
          <div key={list.id} className="group bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 transition-all shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Layers className="w-24 h-24" />
             </div>
             
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h4 className="text-xl font-black italic uppercase tracking-tight mb-1">{list.title}</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                     {list.games.length} Targets Tracked
                   </p>
                </div>
                <div className="flex gap-2">
                   <button className="p-3 text-slate-500 hover:text-white transition-colors"><Edit3 className="w-4 h-4" /></button>
                   <button onClick={() => handleDelete(list.id)} className="p-3 text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
             </div>

             <p className="text-sm text-slate-400 leading-relaxed font-medium mb-8 min-h-[48px] line-clamp-2">
                {list.description || "No classification provided for this archive."}
             </p>

             <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl group-hover:bg-blue-600 transition-all text-[10px] font-black uppercase tracking-widest">
                Access Archive Targets
             </button>
          </div>
        ))}

        {!loading && lists.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white/5 rounded-[3rem] border border-white/10">
             <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-6" />
             <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">No custom lists detected in your profile.</p>
          </div>
        )}
      </div>
    </div>
  );
}
