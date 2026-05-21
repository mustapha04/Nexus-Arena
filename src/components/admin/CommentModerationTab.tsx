import React from 'react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { Comment } from '../../types';
import { Trash2, ShieldAlert, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function CommentModerationTab() {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(
      collection(db, 'comments'), 
      orderBy('created_at', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this comment from existence?')) return;
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Vox Stream Moderation</h2>
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
           <ShieldAlert className="w-4 h-4" />
           <span>Live Override Enabled</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 hover:bg-white/10 transition-all group flex flex-col md:flex-row gap-8 items-start md:items-center shadow-2xl">
            <div className="flex items-center gap-4 min-w-[200px]">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-white/10 flex items-center justify-center font-black text-blue-400 flex-shrink-0">
                {comment.avatar_url ? (
                  <img src={comment.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  comment.username[0].toUpperCase()
                )}
              </div>
              <div>
                <div className="font-black text-sm italic">{comment.username}</div>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{new Date(comment.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                Target ID: {comment.game_id}
              </div>
              <p className="text-sm text-slate-300 font-medium leading-relaxed italic line-clamp-2 md:line-clamp-none">
                "{comment.content}"
              </p>
            </div>

            <div className="flex items-center gap-4">
               <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-center min-w-[80px]">
                  <div className="text-lg font-black italic">{comment.likes || 0}</div>
                  <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Likes</div>
               </div>
               <button 
                onClick={() => comment.id && handleDelete(comment.id)}
                className="p-5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-xl"
               >
                 <Trash2 className="w-6 h-6" />
               </button>
            </div>
          </div>
        ))}

        {!loading && comments.length === 0 && (
          <div className="py-24 text-center bg-white/5 rounded-[3rem] border border-white/10">
             <AlertCircle className="w-16 h-16 text-slate-700 mx-auto mb-6" />
             <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Vox Stream is clear. No moderation required.</p>
          </div>
        )}
      </div>
    </div>
  );
}
