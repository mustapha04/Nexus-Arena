import React from 'react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { UserProfile } from '../../types';
import { Search, Shield, Ban, UserCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function UserManagementTab() {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'profiles'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleToggleBan = async (user: UserProfile) => {
    if (!window.confirm(`${user.isBanned ? 'Unban' : 'Ban'} user ${user.username}?`)) return;
    try {
      await updateDoc(doc(db, 'profiles', user.id), {
        isBanned: !user.isBanned
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRole = async (user: UserProfile) => {
    if (!window.confirm(`Change ${user.username} role to ${user.role === 'admin' ? 'user' : 'admin'}?`)) return;
    try {
      await updateDoc(doc(db, 'profiles', user.id), {
        role: user.role === 'admin' ? 'user' : 'admin'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Identified Personnel</h2>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search credentials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
          />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Personnel</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Authority</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Joined</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group/row">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-white/10 overflow-hidden shadow-inner flex-shrink-0">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-blue-400">
                                {user.username[0].toUpperCase()}
                            </div>
                        )}
                      </div>
                      <div>
                        <div className="font-black text-sm italic">{user.username}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {user.isBanned ? (
                      <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                        Suspended
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        user.role === 'admin' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}>
                        {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleToggleRole(user)}
                        title="Toggle Admin Role"
                        className="p-3 bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 border border-white/5 rounded-xl transition-all"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleBan(user)}
                        title={user.isBanned ? "Lift Suspension" : "Suspend Access"}
                        className={cn(
                            "p-3 border rounded-xl transition-all",
                            user.isBanned 
                                ? "bg-green-500/20 text-green-400 border-green-500/20 hover:bg-green-500/30" 
                                : "bg-red-500/20 text-red-400 border-red-500/20 hover:bg-red-500/30"
                        )}
                      >
                        {user.isBanned ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && (
            <div className="p-12 text-center text-slate-500 font-black uppercase tracking-[0.2em] animate-pulse">
                Syncing with Database...
            </div>
        )}
      </div>
    </div>
  );
}
