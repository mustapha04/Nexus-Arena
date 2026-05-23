import React from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { FavoriteItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Gamepad2, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FavoritesTab() {
  const { user, isFirebaseReady } = useAuth();
  const [items, setItems] = React.useState<FavoriteItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isFirebaseReady || !db) return;
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'favorites'),
      where('user_id', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const raw = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FavoriteItem));
      const sorted = raw.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      setItems(sorted);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load favorites:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, isFirebaseReady]);

  if (loading) return (
     <div className="p-12 text-center animate-pulse text-slate-500 font-black uppercase tracking-widest">Accessing Arsenal...</div>
  );

  if (items.length === 0) return (
    <div className="p-12 text-center">
      <div className="p-8 bg-white/5 rounded-full inline-block mb-8 border border-white/5 shadow-inner">
        <Gamepad2 className="w-12 h-12 text-slate-700" />
      </div>
      <h3 className="text-xl font-black mb-4 uppercase italic tracking-tight">Arsenal Empty</h3>
      <p className="text-slate-500 mb-10 font-medium text-sm">You haven't marked any titles as favorite yet.</p>
      <Link to="/search" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl">
        <span>Initialize Search</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8">
      {items.map((item) => (
        <motion.div
           key={item.id}
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="group relative rounded-3xl overflow-hidden aspect-[16/9] border border-white/10"
        >
           <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
              <h4 className="text-lg font-black italic uppercase tracking-tight mb-2">{item.title}</h4>
              <div className="flex justify-between items-center">
                 <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 text-blue-400 fill-blue-400" />)}
                 </div>
                 <Link to={`/game/${item.game_id}`} className="px-4 py-2 bg-white/10 hover:bg-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                    Access Details
                 </Link>
              </div>
           </div>
        </motion.div>
      ))}
    </div>
  );
}
