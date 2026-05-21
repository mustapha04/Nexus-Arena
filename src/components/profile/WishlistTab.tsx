import React from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { WishlistItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bookmark, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function WishlistTab() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'wishlists'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WishlistItem)));
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  if (loading) return (
     <div className="p-12 text-center animate-pulse text-slate-500 font-black uppercase tracking-widest">Scanning Log...</div>
  );

  if (items.length === 0) return (
    <div className="p-12 text-center">
      <div className="p-8 bg-white/5 rounded-full inline-block mb-8 border border-white/5 shadow-inner">
        <Bookmark className="w-12 h-12 text-slate-700" />
      </div>
      <h3 className="text-xl font-black mb-4 uppercase italic tracking-tight">Log Empty</h3>
      <p className="text-slate-500 mb-10 font-medium text-sm">Your manifest has no pending acquisitions.</p>
      <Link to="/deals" className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl">
        <span>Scout Deals</span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );

  return (
    <div className="space-y-4 p-8">
      {items.map((item) => (
        <motion.div
           key={item.id}
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
           className="group flex gap-6 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all"
        >
           <img src={item.image} alt={item.title} className="w-24 h-24 rounded-xl object-cover shadow-lg" />
           <div className="flex-1 py-1">
              <h4 className="text-lg font-black italic uppercase tracking-tight mb-2">{item.title}</h4>
              <div className="flex items-center gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
                 <Zap className="w-4 h-4 text-yellow-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Pending Verification</span>
              </div>
           </div>
           <div className="flex items-center px-4">
              <Link to={`/game/${item.game_id}`} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-600 transition-all hover:scale-110">
                 <ChevronRight className="w-5 h-5 text-white" />
              </Link>
           </div>
        </motion.div>
      ))}
    </div>
  );
}
