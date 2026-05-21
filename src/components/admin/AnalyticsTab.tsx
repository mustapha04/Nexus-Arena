import React from 'react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Users, MousePointer2, Activity,
  ArrowUpRight, ArrowDownRight, Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

const COLORS = ['#3B82F6', '#A855F7', '#EF4444', '#10B981', '#F59E0B'];

export default function AnalyticsTab() {
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalClicks: 0,
    totalComments: 0,
    totalFavorites: 0
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCounts = async () => {
      const usersSnap = await getCountFromServer(collection(db, 'profiles'));
      const clicksSnap = await getCountFromServer(collection(db, 'affiliate_clicks'));
      const commentsSnap = await getCountFromServer(collection(db, 'comments'));
      const favsSnap = await getCountFromServer(collection(db, 'favorites'));
      
      setStats({
        totalUsers: usersSnap.data().count,
        totalClicks: clicksSnap.data().count,
        totalComments: commentsSnap.data().count,
        totalFavorites: favsSnap.data().count
      });
      setLoading(false);
    };

    fetchCounts();
  }, []);

  // Mock data for charts (in real app, use game_stats collection data)
  const PERFORMANCE_DATA = [
    { name: 'Mon', clicks: 400, views: 2400 },
    { name: 'Tue', clicks: 300, views: 1398 },
    { name: 'Wed', clicks: 200, views: 9800 },
    { name: 'Thu', clicks: 278, views: 3908 },
    { name: 'Fri', clicks: 189, views: 4800 },
    { name: 'Sat', clicks: 239, views: 3800 },
    { name: 'Sun', clicks: 349, views: 4300 },
  ];

  const CATEGORY_DATA = [
    { name: 'Shooter', value: 400 },
    { name: 'MMO', value: 300 },
    { name: 'Strategy', value: 300 },
    { name: 'Sports', value: 200 },
  ];

  return (
    <div className="space-y-12">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Identified', value: stats.totalUsers, change: '+5.4', icon: Users, color: 'text-blue-500' },
          { label: 'Affiliate Flux', value: stats.totalClicks, change: '+22.1', icon: MousePointer2, color: 'text-purple-500' },
          { label: 'Neural Commits', value: stats.totalComments, change: '+12.8', icon: Activity, color: 'text-green-500' },
          { label: 'Forge Hearts', value: stats.totalFavorites, change: '+18.4', icon: Zap, color: 'text-yellow-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-32 h-32" />
             </div>
             <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                   {stat.change}% <ArrowUpRight className="ml-1 w-3 h-3" />
                </div>
             </div>
             <div className="text-4xl font-black mb-2 tracking-tighter italic relative z-10">{stat.value.toLocaleString()}</div>
             <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest relative z-10">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Performance Chart */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10 shadow-2xl overflow-hidden relative">
           <div className="flex justify-between items-center mb-12">
              <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight">
                 <TrendingUp className="w-6 h-6 text-blue-400" />
                 Growth Matrix
              </h3>
              <div className="px-4 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 border border-white/5">Realtime Feed</div>
           </div>
           
           <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={PERFORMANCE_DATA}>
                    <defs>
                       <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} dy={15} />
                    <YAxis stroke="#475569" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ fontStyle: 'italic', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }}
                    />
                    <Area type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
                    <Area type="monotone" dataKey="clicks" stroke="#A855F7" strokeWidth={4} fillOpacity={0} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Categories Pie */}
        <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10 shadow-2xl flex flex-col items-center justify-center">
           <h3 className="text-xl font-black mb-10 w-full uppercase italic tracking-tight text-left">Sector Distribution</h3>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={CATEGORY_DATA}
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                       {CATEGORY_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '10px' }}
                    />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="grid grid-cols-2 gap-4 w-full mt-8">
              {CATEGORY_DATA.map((cat, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{cat.name}</span>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
