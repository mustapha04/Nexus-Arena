import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, query, where, orderBy, 
  onSnapshot, addDoc, serverTimestamp, 
  updateDoc, doc, deleteDoc, arrayUnion, arrayRemove,
  increment
} from 'firebase/firestore';
import { Comment } from '../../types';
import { MessageSquare, Heart, Trash2, Send, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface Props {
  gameId: string;
}

export default function CommentSection({ gameId }: Props) {
  const { user, profile, isFirebaseReady } = useAuth();
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isFirebaseReady || !db) return;

    const q = query(
      collection(db, 'comments'),
      where('game_id', '==', gameId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      const sorted = data.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      setComments(sorted);
      setLoading(false);
    }, (error) => {
      console.error("Failed to load comments", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [gameId, isFirebaseReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !newComment.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        user_id: user.uid,
        username: profile.username,
        avatar_url: profile.avatar_url,
        game_id: gameId,
        content: newComment,
        likes: 0,
        liked_by: [],
        created_at: new Date().toISOString()
      });
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (commentId: string, likedBy: string[]) => {
    if (!user) return;
    const isLiked = likedBy?.includes(user.uid);
    const commentRef = doc(db, 'comments', commentId);

    try {
      await updateDoc(commentRef, {
        liked_by: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likes: increment(isLiked ? -1 : 1)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteDoc(doc(db, 'comments', commentId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black uppercase italic italic flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-400" />
          Neural Comm-Link ({comments.length})
        </h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:opacity-100 opacity-0 transition-opacity" />
          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Inject your thoughts into the archive..."
              className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 disabled:opacity-50 transition-all"
              >
                <Send className="w-3 h-3" />
                Transmit
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-4">Authorization Required for uplink</p>
          <button className="text-blue-400 font-bold hover:underline">Log in to leave a comment</button>
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="group/item flex gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-white/10 overflow-hidden flex-shrink-0">
                {comment.avatar_url ? (
                  <img src={comment.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-blue-400">
                    {comment.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-black text-sm italic mr-3">{comment.username}</span>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {(user?.uid === comment.user_id || profile?.role === 'admin') && (
                    <button 
                      onClick={() => comment.id && handleDelete(comment.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover/item:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed font-medium mb-4">
                  {comment.content}
                </p>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => comment.id && handleLike(comment.id, comment.liked_by || [])}
                    className={cn(
                      "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                      comment.liked_by?.includes(user?.uid || '') ? "text-red-400" : "text-slate-500 hover:text-white"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", comment.liked_by?.includes(user?.uid || '') && "fill-red-400")} />
                    <span>{comment.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-colors">
                     <CornerDownRight className="w-4 h-4" />
                     <span>Reply</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && comments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 font-black text-xs uppercase tracking-[0.2em]">Silence in the archives...</p>
          </div>
        )}
      </div>
    </div>
  );
}
