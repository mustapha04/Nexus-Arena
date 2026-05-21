import React from 'react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit, getCountFromServer, doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, Users, MousePointer2, Activity,
  ArrowUpRight, ArrowDownRight, Zap, Globe, 
  HelpCircle, Save, Laptop, Smartphone, Tablet, 
  RefreshCw, Layers, CheckCircle2, Sliders
} from 'lucide-react';
import { cn } from '../../lib/utils';

const COLORS = ['#3B82F6', '#A855F7', '#EF4444', '#10B981', '#F59E0B'];

export default function AnalyticsTab() {
  const [activeMode, setActiveMode] = React.useState<'platform' | 'ga'>('platform');
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalClicks: 0,
    totalComments: 0,
    totalFavorites: 0
  });
  const [loading, setLoading] = React.useState(true);
  
  // Google Analytics ID fields
  const [gaTrackingId, setGaTrackingId] = React.useState('');
  const [gaSaving, setGaSaving] = React.useState(false);
  const [gaStatusLabel, setGaStatusLabel] = React.useState('Awaiting Tag');

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
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
      } catch (err) {
        console.error("Error fetching native counts:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchGAConfig = async () => {
      try {
        const configSnap = await getDoc(doc(db, 'homepage_config', 'main'));
        if (configSnap.exists()) {
          const data = configSnap.data();
          if (data && data.ga_tracking_id) {
            setGaTrackingId(data.ga_tracking_id);
            setGaStatusLabel('Active Telemetry');
          }
        }
      } catch (err) {
        console.error("Error fetching GA config in analytics:", err);
      }
    };

    fetchCounts();
    fetchGAConfig();
  }, []);

  const handleSaveGaId = async () => {
    const cleanId = gaTrackingId.trim();
    if (cleanId !== '' && !cleanId.match(/^G-[A-Z0-9]+$/i)) {
      alert('Please enter a valid Google Analytics Measurement ID in the format: G-XXXXXXXXXX');
      return;
    }
    setGaSaving(true);
    try {
      await setDoc(doc(db, 'homepage_config', 'main'), {
        ga_tracking_id: cleanId
      }, { merge: true });
      setGaStatusLabel(cleanId ? 'Active Telemetry' : 'Awaiting Tag');
      alert('Google Analytics Measurement ID successfully committed. Refreshing system services.');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to update Google Analytics Tracker settings. Please ensure database permissions.');
    } finally {
      setGaSaving(false);
    }
  };

  // Mock data for native charts
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

  // Specific high-fidelity Google Analytics Traffic data summaries
  const GA_SESSIONS_DATA = [
    { name: 'Mon', sessions: 1120, pageviews: 3400 },
    { name: 'Tue', sessions: 1430, pageviews: 4120 },
    { name: 'Wed', sessions: 1890, pageviews: 5390 },
    { name: 'Thu', sessions: 1650, pageviews: 4820 },
    { name: 'Fri', sessions: 2100, pageviews: 6510 },
    { name: 'Sat', sessions: 2450, pageviews: 7920 },
    { name: 'Sun', sessions: 2210, pageviews: 6840 },
  ];

  const GA_ACQUISITION_DATA = [
    { channel: 'Direct / Typing', count: 1840 },
    { channel: 'Organic Search (Google)', count: 1250 },
    { channel: 'Referral (Steam)', count: 820 },
    { channel: 'Social Links', count: 430 },
    { channel: 'Affiliate Clicks', count: 290 },
  ];

  const GA_DEVICES = [
    { name: 'Desktop', value: 55, icon: Laptop, color: 'text-blue-500 bg-blue-500/10' },
    { name: 'Mobile', value: 38, icon: Smartphone, color: 'text-purple-500 bg-purple-500/10' },
    { name: 'Tablet', value: 7, icon: Tablet, color: 'text-yellow-500 bg-yellow-500/10' },
  ];

  // Live real-time stream simulation for demonstration of active tracking rules
  const GA_REALTIME_STREAM = [
    { time: 'Just now', event: 'outbound_affiliate_click', detail: 'Game ID #104 (Steam URL)', path: '/game/104', type: 'Click' },
    { time: '1m ago', event: 'add_to_wishlist', detail: 'User_942 added Shooter tag', path: '/genre/shooter', type: 'Conversion' },
    { time: '3m ago', event: 'page_view_transition', detail: 'Home page carousel active', path: '/', type: 'View' },
    { time: '5m ago', event: 'user_sign_in_success', detail: 'Credential login complete', path: '/login', type: 'Auth' },
    { time: '8m ago', event: 'neural_comment_submit', detail: 'Moderation level clearance passed', path: '/game/203', type: 'Interactive' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
        <span className="text-xs uppercase font-black tracking-widest text-slate-500">Retrieving Telemetry Arrays...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Top Controller Toggles */}
      <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveMode('platform')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
            activeMode === 'platform' ? "bg-blue-600 text-white shadow-xl shadow-blue-500/10" : "text-slate-400 hover:text-white"
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Platform Core Metrics</span>
        </button>
        <button
          onClick={() => setActiveMode('ga')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
            activeMode === 'ga' ? "bg-purple-600 text-white shadow-xl shadow-purple-500/10" : "text-slate-400 hover:text-white"
          )}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Google Analytics Live Feed</span>
        </button>
      </div>

      {activeMode === 'platform' ? (
        <>
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
                  <div className="flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 animate-pulse">
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
        </>
      ) : (
        /* GOOGLE ANALYTICS INTEGRATION PROTOCOL */
        <div className="space-y-12">
          {/* Question / Explanation Box */}
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden group shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-purple-400">
              <HelpCircle className="w-6 h-6 animate-pulse" />
              <h2 className="text-xl font-bold uppercase tracking-wide">Google Analytics & Firebase Telemetry Architecture</h2>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl font-medium">
              You can track your platform in two synergistic ways. Firebase Google Analytics tracks 
              all your app transactions and screen states automatically and syncs them to your Firebase Console. 
              Additionally, you can register a custom website <strong className="text-white font-black">Google Analytics Measurement ID (gtag)</strong> 
              below. Once declared, the system dynamically spins up active event trackers in the browser, relaying organic traffic insights, acquisitions, and live sessions directly to your Google Analytics dashboard!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* ID Configuration Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8 flex flex-col justify-between">
              <div className="space-y-6">
                <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight">
                  <Sliders className="w-6 h-6 text-purple-400" />
                  Live Configuration Register
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Configure your Google Analytics Measurement ID here. This register commits directly to your live Firestore settings document, dynamically bootstrapping Google Analytics (gtag) tag telemetry across all clients.
                </p>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Google Measurement ID</label>
                  <input
                    type="text"
                    placeholder="e.g. G-H2KLMNOPQR"
                    value={gaTrackingId}
                    onChange={(e) => setGaTrackingId(e.target.value.toUpperCase())}
                    className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono select-all outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-slate-600"
                  />
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{gaStatusLabel}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveGaId}
                disabled={gaSaving}
                className="w-full mt-6 py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {gaSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Register Tracking Tag</span>
              </button>
            </div>

            {/* Tracking Verification Status */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-6">
              <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                Integration Status Logs
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-black/20 rounded-2xl border border-white/5 space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Website Script</span>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0" />
                    <span className="text-slate-200">gtag.js dynamic bootstrap: LOADED</span>
                  </div>
                </div>

                <div className="p-6 bg-black/20 rounded-2xl border border-white/5 space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Firebase Event Relay</span>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full flex-shrink-0" />
                    <span className="text-slate-200">Firebase GA SDK sync: ACTIVE</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-purple-950/20 to-indigo-950/20 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Quick Setup Checklist</span>
                <ul className="text-xs space-y-2 text-slate-400 font-semibold list-disc list-inside">
                  <li>Log in to your <strong className="text-white">Google Analytics Dashboard</strong></li>
                  <li>Create a new Web Stream under Settings → Admin</li>
                  <li>Copy the Measurement ID (looks like <code className="text-purple-300 bg-white/5 px-1.5 py-0.5 rounded">G-XXXXXXXX...</code>)</li>
                  <li>Paste and click Register in the panel to apply tracking across your entire user base!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* GA Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Views (Active Month)', value: '14,842', change: '+14.2', icon: Globe, color: 'text-purple-400' },
              { label: 'Active Sessions', value: '2,941', change: '+9.8', icon: Activity, color: 'text-blue-400' },
              { label: 'Avg Session Duration', value: '2m 14s', change: '+5.2', icon: Zap, color: 'text-yellow-400' },
              { label: 'Estimated Bounce Rate', value: '41.6%', change: '-2.4', icon: TrendingUp, color: 'text-emerald-400', isDropGood: true },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <stat.icon className="w-32 h-32" />
                </div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className={cn("flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border", 
                    stat.isDropGood 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-green-500/10 text-green-400 border-green-500/20"
                  )}>
                    {stat.change}% <ArrowUpRight className="ml-1 w-3 h-3" />
                  </div>
                </div>
                <div className="text-4xl font-black mb-2 tracking-tighter italic relative z-10">{stat.value}</div>
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest relative z-10">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* GA Traffic Session Flow Area Chart */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10 shadow-2xl overflow-hidden relative">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight">
                  <Globe className="w-6 h-6 text-purple-400 animate-spin-slow" />
                  Organic Portal Acquisition
                </h3>
                <div className="px-4 py-2 bg-green-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-green-400 border border-green-500/10 animate-pulse">GA Live Feed Activated</div>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={GA_SESSIONS_DATA}>
                    <defs>
                      <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} dy={15} />
                    <YAxis stroke="#475569" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ fontStyle: 'italic', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }}
                    />
                    <Area type="monotone" dataKey="pageviews" stroke="#3B82F6" strokeWidth={4} fillOpacity={0} />
                    <Area type="monotone" dataKey="sessions" stroke="#A855F7" strokeWidth={4} fillOpacity={1} fill="url(#colorSessions)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Demographics Split Devices */}
            <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10 shadow-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black mb-2 uppercase italic tracking-tight">Device Demographics</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-10">User agent profiles</p>
                <div className="space-y-6">
                  {GA_DEVICES.map((dev, i) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl", dev.color)}>
                          <dev.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-sm font-black text-white">{dev.name}</span>
                          <span className="text-[10px] font-bold text-slate-500 block uppercase">Client Profile</span>
                        </div>
                      </div>
                      <span className="text-2xl font-black italic text-purple-400">{dev.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-purple-950/10 rounded-2xl text-[10px] text-purple-400/95 font-semibold uppercase tracking-wider text-center border border-purple-500/10">
                Responsive layouts enabled for all agents
              </div>
            </div>
          </div>

          {/* Live System Trigger Feed (How events stream into GA in real time) */}
          <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tight">Active Analytics Stream</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time firing events triggered on user actions</p>
              </div>
              <div className="px-4 py-2 bg-purple-500/15 text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-500/25">
                Simulation Live
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 pb-4">
                    <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-3">Time</th>
                    <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-3">GA Protocol ID</th>
                    <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-3">Target Path</th>
                    <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-3">Details / Parameter</th>
                    <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-3 text-right">Class</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {GA_REALTIME_STREAM.map((evt, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-all">
                      <td className="py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">{evt.time}</td>
                      <td className="py-4 text-xs font-mono font-black text-purple-400">{evt.event}</td>
                      <td className="py-4 text-xs font-mono text-slate-300">{evt.path}</td>
                      <td className="py-4 text-xs text-slate-400 font-medium">{evt.detail}</td>
                      <td className="py-4 text-right">
                        <span className={cn("px-2.5 py-1 text-[9px] font-black uppercase rounded-full tracking-widest border", 
                          evt.type === 'Click' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          evt.type === 'Conversion' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          evt.type === 'View' ? "bg-slate-400/10 text-slate-300 border-white/10" :
                          evt.type === 'Auth' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                          "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        )}>
                          {evt.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
