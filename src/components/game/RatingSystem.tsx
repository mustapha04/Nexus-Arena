import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, query, where, 
  onSnapshot, doc, setDoc, deleteDoc
} from 'firebase/firestore';
import { Rating } from '../../types';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface Props {
  gameId: string;
}

export default function RatingSystem({ gameId }: Props) {
  const { user } = useAuth();
  const [ratings, setRatings] = React.useState<Rating[]>([]);
  const [userRating, setUserRating] = React.useState<number | null>(null);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  React.useEffect(() => {
    const q = query(
      collection(db, 'ratings'),
      where('game_id', '==', gameId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Rating[];
      setRatings(data);
      
      const current = data.find(r => r.user_id === user?.uid);
      if (current) setUserRating(current.rating);
    });

    return unsubscribe;
  }, [gameId, user]);

  const handleRate = async (value: number) => {
    if (!user) return;
    
    const ratingId = `${user.uid}_${gameId}`;
    const ratingRef = doc(db, 'ratings', ratingId);

    try {
      if (userRating === value) {
        await deleteDoc(ratingRef);
        setUserRating(null);
      } else {
        await setDoc(ratingRef, {
          user_id: user.uid,
          game_id: gameId,
          rating: value,
          created_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const avgRating = ratings.length > 0 
    ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1)
    : '0';

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/5 rounded-3xl">
      <div className="text-4xl font-black italic tracking-tighter mb-1">{avgRating}</div>
      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-4">Nexus Core Rating</div>
      
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            onClick={() => handleRate(star)}
            className="p-1 transition-transform hover:scale-125 active:scale-95"
          >
            <Star 
              className={cn(
                "w-6 h-6 transition-all duration-300",
                (hoverRating || userRating || 0) >= star 
                  ? "text-yellow-500 fill-yellow-500 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" 
                  : "text-slate-600"
              )}
            />
          </button>
        ))}
      </div>
      <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">
        {user ? 'Click to calibrate' : 'Auth required to score'}
      </p>
    </div>
  );
}
