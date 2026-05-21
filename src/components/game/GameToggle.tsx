import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, query, where, 
  onSnapshot, doc, setDoc, deleteDoc, limit
} from 'firebase/firestore';
import { Heart, Bookmark } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Game } from '../../types';

interface Props {
  game: Game;
  type: 'favorite' | 'wishlist';
}

export default function GameToggle({ game, type }: Props) {
  const { user } = useAuth();
  const [isActive, setIsActive] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const collectionName = type === 'favorite' ? 'favorites' : 'wishlists';
  const Icon = type === 'favorite' ? Heart : Bookmark;

  React.useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, collectionName),
      where('user_id', '==', user.uid),
      where('game_id', '==', String(game.id)),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIsActive(!snapshot.empty);
      setLoading(false);
    });

    return unsubscribe;
  }, [game.id, user, collectionName]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
        alert('Please log in to save games.');
        return;
    }

    const docId = `${user.uid}_${game.id}`;
    const docRef = doc(db, collectionName, docId);

    try {
      if (isActive) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          user_id: user.uid,
          game_id: String(game.id),
          title: game.title,
          image: game.thumbnail,
          created_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
     <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
  );

  return (
    <button 
      onClick={handleToggle}
      className={cn(
        "p-5 backdrop-blur-md border rounded-2xl transition-all hover:scale-110 active:scale-90 group",
        isActive 
          ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
          : "bg-white/5 border-white/10 hover:bg-white/10"
      )}
    >
      <Icon 
        className={cn(
          "w-6 h-6 transition-colors",
          isActive 
            ? (type === 'favorite' ? "fill-red-500 text-red-500" : "fill-blue-500 text-blue-500") 
            : "text-white group-hover:text-blue-400"
        )} 
      />
    </button>
  );
}
