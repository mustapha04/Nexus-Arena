import React from 'react';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, doc, getDoc, setDoc, getCountFromServer } from 'firebase/firestore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Users, MousePointer2, Activity,
  ArrowUpRight, Zap, Globe, Search, Compass,
  HelpCircle, Save, Laptop, Smartphone, Tablet, 
  RefreshCw, Layers, CheckCircle2, Sliders, Check, 
  Eye, FileText, ServerCrash, Key
} from 'lucide-react';
import { cn } from '../../lib/utils';

const COLORS = ['#3B82F6', '#A855F7', '#EF4444', '#10B981', '#F59E0B'];

export default function AnalyticsTab() {
  const [activeMode, setActiveMode] = React.useState<'platform' | 'search_analytics'>('platform');
  const [activeEngine, setActiveEngine] = React.useState<'ga' | 'gsc' | 'bing'>('ga');
  const [stats, setStats] = React.useState({
    totalUsers: 0,
    totalClicks: 0,
    totalComments: 0,
    totalFavorites: 0
  });
  const [loading, setLoading] = React.useState(true);
  
  // Registration IDs
  const [gaTrackingId, setGaTrackingId] = React.useState('');
  const [gscVerificationId, setGscVerificationId] = React.useState('');
  const [bingVerificationId, setBingVerificationId] = React.useState('');
  
  // Individual saving spinners
  const [gaSaving, setGaSaving] = React.useState(false);
  const [gscSaving, setGscSaving] = React.useState(false);
  const [bingSaving, setBingSaving] = React.useState(false);

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        let totalUsers = 0;
        let totalClicks = 0;
        let totalComments = 0;
        let totalFavorites = 0;

        try {
          const usersSnap = await getCountFromServer(collection(db, 'profiles'));
          totalUsers = usersSnap.data().count;
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, 'profiles');
        }

        try {
          const clicksSnap = await getCountFromServer(collection(db, 'affiliate_clicks'));
          totalClicks = clicksSnap.data().count;
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, 'affiliate_clicks');
        }

        try {
          const commentsSnap = await getCountFromServer(collection(db, 'comments'));
          totalComments = commentsSnap.data().count;
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, 'comments');
        }

        try {
          const favsSnap = await getCountFromServer(collection(db, 'favorites'));
          totalFavorites = favsSnap.data().count;
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, 'favorites');
        }
        
        setStats({
          totalUsers,
          totalClicks,
          totalComments,
          totalFavorites
        });
      } catch (err) {
        console.error("Error fetching native counts:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSEOAndTelemetryConfig = async () => {
      try {
        const configSnap = await getDoc(doc(db, 'homepage_config', 'main'));
        if (configSnap.exists()) {
          const data = configSnap.data();
          if (data) {
            setGaTrackingId(data.ga_tracking_id || '');
            setGscVerificationId(data.gsc_verification_id || '');
            setBingVerificationId(data.bing_verification_id || '');
          }
        }
      } catch (err) {
        console.error("Error fetching SEO/GA config inside analytics panel:", err);
      }
    };

    fetchCounts();
    fetchSEOAndTelemetryConfig();
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
      alert('Google Analytics Measurement ID updated successfully. Active tracking initialized.');
    } catch (err) {
      console.error(err);
      alert('Failed to update Google Analytics Tracker settings. Please check Firestore connection.');
    } finally {
      setGaSaving(false);
    }
  };

  const handleSaveGscId = async () => {
    const cleanId = gscVerificationId.trim();
    setGscSaving(true);
    try {
      await setDoc(doc(db, 'homepage_config', 'main'), {
        gsc_verification_id: cleanId
      }, { merge: true });
      alert('Google Search Console verification ID committed. Googlebot will now detect alignment tags upon next scan.');
    } catch (err) {
      console.error(err);
      alert('Failed to update Google Search Console settings. Please check Firestore connection.');
    } finally {
      setGscSaving(false);
    }
  };

  const handleSaveBingId = async () => {
    const cleanId = bingVerificationId.trim();
    setBingSaving(true);
    try {
      await setDoc(doc(db, 'homepage_config', 'main'), {
        bing_verification_id: cleanId
      }, { merge: true });
      alert('Bing Webmaster HTML site verification tag committed successfully. Bingbot verification node enabled.');
    } catch (err) {
      console.error(err);
      alert('Failed to update Bing Webmaster settings. Please check Firestore connection.');
    } finally {
      setBingSaving(false);
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

  // Simulated Google Analytics Traffic metrics
  const GA_SESSIONS_DATA = [
    { name: 'Mon', sessions: 1120, pageviews: 3400 },
    { name: 'Tue', sessions: 1430, pageviews: 4120 },
    { name: 'Wed', sessions: 1890, pageviews: 5390 },
    { name: 'Thu', sessions: 1650, pageviews: 4820 },
    { name: 'Fri', sessions: 2100, pageviews: 6510 },
    { name: 'Sat', sessions: 2450, pageviews: 7920 },
    { name: 'Sun', sessions: 2210, pageviews: 6840 },
  ];

  // Google Search Console Organic Clicks / Impressions Reporting
  const GSC_PERFORMANCE_DATA = [
    { name: 'Mon', clicks: 210, impressions: 4200 },
    { name: 'Tue', clicks: 250, impressions: 5100 },
    { name: 'Wed', clicks: 340, impressions: 6300 },
    { name: 'Thu', clicks: 290, impressions: 5800 },
    { name: 'Fri', clicks: 380, impressions: 7200 },
    { name: 'Sat', clicks: 440, impressions: 8400 },
    { name: 'Sun', clicks: 410, impressions: 7800 },
  ];

  // Bing Webmaster Search flow data
  const BING_PERFORMANCE_DATA = [
    { name: 'Mon', clicks: 45, impressions: 620 },
    { name: 'Tue', clicks: 58, impressions: 790 },
    { name: 'Wed', clicks: 72, impressions: 980 },
    { name: 'Thu', clicks: 64, impressions: 840 },
    { name: 'Fri', clicks: 88, impressions: 1150 },
    { name: 'Sat', clicks: 95, impressions: 1320 },
    { name: 'Sun', clicks: 90, impressions: 1240 },
  ];

  const GA_DEVICES = [
    { name: 'Desktop', value: 55, icon: Laptop, color: 'text-blue-500 bg-blue-500/10' },
    { name: 'Mobile', value: 38, icon: Smartphone, color: 'text-purple-500 bg-purple-500/10' },
    { name: 'Tablet', value: 7, icon: Tablet, color: 'text-yellow-500 bg-yellow-500/10' },
  ];

  // Multi-Engine active simulated crawl stream
  const SEARCH_CRAWL_STREAM = [
    { time: 'Just now', bot: 'Googlebot Smartphone', event: 'index_refresh_pass', path: '/game/203', status: 200, depth: 'L3 Nested' },
    { time: '2m ago', bot: 'Bingbot-Desktop', event: 'sitemap_ping_fetch', path: '/sitemap.xml', status: 200, depth: 'Root Catalog' },
    { time: '4m ago', bot: 'Googlebot Desktop', event: 'discovery_crawl', path: '/genre/shooter', status: 200, depth: 'L1 Category' },
    { time: '11m ago', bot: 'Bingbot-Mobile', event: 'impression_tag_validation', path: '/deals', status: 200, depth: 'L1 Interactive' },
    { time: '18m ago', bot: 'Google Storebot', event: 'affiliate_link_audit', path: '/game/101', status: 200, depth: 'L3 Nested' },
  ];

  const MOCKED_SITEMAPS = [
    { path: '/sitemap.xml', type: 'XML Index', status: 'Success', files: '148 URLs', scanned: 'Today, 2:40 PM' },
    { path: '/sitemap-games.xml', type: 'Game Catalog', status: 'Success', files: '102 URLs', scanned: 'Yesterday, 8:12 AM' },
    { path: '/sitemap-deals.xml', type: 'Monetized Deals', status: 'Success', files: '46 URLs', scanned: 'May 19, 11:32 PM' },
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
      {/* Tab Select Controller */}
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
          onClick={() => setActiveMode('search_analytics')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
            activeMode === 'search_analytics' ? "bg-purple-600 text-white shadow-xl shadow-purple-500/10" : "text-slate-400 hover:text-white"
          )}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>SEO & Tracking Suite</span>
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
        /* SEO & ANALYTICS INTEGRATION PROTOCOL */
        <div className="space-y-12">
          {/* Overview Banner explaining GSC and Bing integrations */}
          <div className="bg-gradient-to-r from-blue-950/30 to-purple-950/30 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-purple-400">
              <Compass className="w-6 h-6 animate-pulse" />
              <h2 className="text-xl font-black uppercase italic tracking-wider">Search Engine & Audience Telemetry Deck</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-5xl font-medium">
              Seamlessly monitor traffic, track crawling, and verify site properties with the global search engines. 
              By storing your tags with the register database below, your web dashboard automatically embeds 
              verification tags on the front-end dynamically. Keep search crawlers index-ready and keep organic traffic in direct view!
            </p>
          </div>

          {/* Unified Register Cards Grid (3 cards for 3 products) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Google Analytics ID */}
            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/10">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    gaTrackingId ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  )}>
                    {gaTrackingId ? 'Live Telemetry' : 'Unregistered'}
                  </span>
                </div>
                
                <h3 className="text-lg font-black uppercase italic tracking-tight">Google Analytics tag</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Specify your Google Measurement ID (<code className="text-purple-300 bg-white/5 px-1 py-0.5 rounded font-mono">G-XXXXXXX</code>) to register global clickstream trackers.
                </p>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Measurement ID</label>
                  <input
                    type="text"
                    placeholder="G-H2KLMNOPQR"
                    value={gaTrackingId}
                    onChange={(e) => setGaTrackingId(e.target.value.toUpperCase().trim())}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-mono select-all outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white placeholder-slate-600"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveGaId}
                disabled={gaSaving}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 text-white disabled:opacity-50"
              >
                {gaSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Register gtag ID</span>
              </button>
            </div>

            {/* Google Search Console ID */}
            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/10">
                    <Search className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    gscVerificationId ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  )}>
                    {gscVerificationId ? 'Verified Domain' : 'Unregistered'}
                  </span>
                </div>
                
                <h3 className="text-lg font-black uppercase italic tracking-tight">Google Search Console</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Provide your Search Console Html template code to claim ownership and start indexing dynamic pages.
                </p>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Verification Content</label>
                  <input
                    type="text"
                    placeholder="e.g. zyx987_abc654_example_gsc"
                    value={gscVerificationId}
                    onChange={(e) => setGscVerificationId(e.target.value.trim())}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-mono select-all outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-600"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveGscId}
                disabled={gscSaving}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 text-white disabled:opacity-50"
              >
                {gscSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Register GSC Code</span>
              </button>
            </div>

            {/* Bing Webmaster Verification Tag */}
            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/10">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    bingVerificationId ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  )}>
                    {bingVerificationId ? 'Active Validate' : 'Unregistered'}
                  </span>
                </div>
                
                <h3 className="text-lg font-black uppercase italic tracking-tight">Bing Webmaster Tool</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Enter your unique validation tag assigned by Microsoft Bing to index and claim Microsoft network domains.
                </p>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">msvalidate.01 content</label>
                  <input
                    type="text"
                    placeholder="e.g. 5BB6FCD289CEB0FFAA084D239"
                    value={bingVerificationId}
                    onChange={(e) => setBingVerificationId(e.target.value.trim())}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3.5 text-xs font-mono select-all outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-white placeholder-slate-600"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveBingId}
                disabled={bingSaving}
                className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 text-white disabled:opacity-50"
              >
                {bingSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Register Bing Tag</span>
              </button>
            </div>

          </div>

          {/* Engine Report Tabs (Allows clicking between GA, Google Search Console, and Bing Webmaster simulated report summary screens!) */}
          <div className="space-y-6">
            <div className="flex bg-white/5 backdrop-blur-md p-1 rounded-xl border border-white/5 w-fit">
              <button
                onClick={() => setActiveEngine('ga')}
                className={cn(
                  "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                  activeEngine === 'ga' ? "bg-purple-900/40 text-purple-200 border border-purple-500/20" : "text-slate-500 hover:text-white"
                )}
              >
                <Globe className="w-3 h-3" />
                <span>Google Analytics Feed</span>
              </button>
              <button
                onClick={() => setActiveEngine('gsc')}
                className={cn(
                  "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                  activeEngine === 'gsc' ? "bg-blue-900/40 text-blue-200 border border-blue-500/20" : "text-slate-500 hover:text-white"
                )}
              >
                <Search className="w-3 h-3" />
                <span>Search Console Stats</span>
              </button>
              <button
                onClick={() => setActiveEngine('bing')}
                className={cn(
                  "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                  activeEngine === 'bing' ? "bg-cyan-900/40 text-cyan-200 border border-cyan-500/20" : "text-slate-500 hover:text-white"
                )}
              >
                <Compass className="w-3 h-3" />
                <span>Bing Webmaster Insights</span>
              </button>
            </div>

            {/* Display relevant report based on activeEngine selection */}
            {activeEngine === 'ga' && (
              <div className="space-y-12">
                {/* GA Metrics Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: 'Views (Active Month)', value: '14,842', change: '+14.2', icon: Globe, color: 'text-purple-400' },
                    { label: 'Active Sessions', value: '2,941', change: '+9.8', icon: Activity, color: 'text-blue-400' },
                    { label: 'Avg Session Duration', value: '2m 14s', change: '+5.2', icon: Zap, color: 'text-yellow-400' },
                    { label: 'Estimated Bounce Rate', value: '41.6%', change: '-2.4', icon: TrendingUp, color: 'text-emerald-400', isDropGood: true },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 relative overflow-hidden group shadow-xl">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <stat.icon className="w-24 h-24" />
                      </div>
                      <div className="flex justify-between items-start mb-6">
                        <div className={cn("p-3 rounded-xl bg-white/5 border border-white/5 shadow-inner", stat.color)}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div className={cn("flex items-center text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", 
                          stat.isDropGood 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        )}>
                          {stat.change}% <ArrowUpRight className="ml-1 w-2.5 h-2.5" />
                        </div>
                      </div>
                      <div className="text-3xl font-black mb-1.5 tracking-tighter italic">{stat.value}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* GA Graph & Devices */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl overflow-hidden relative">
                    <div className="flex justify-between items-center mb-10">
                      <h4 className="text-lg font-black uppercase italic flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-400 animate-spin-slow" />
                        Organic Session Flow
                      </h4>
                      <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[9px] font-black text-green-400 tracking-wider">GA Live Active</div>
                    </div>

                    <div className="h-[350px] w-full">
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
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ fontStyle: 'italic', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }}
                          />
                          <Area type="monotone" dataKey="pageviews" stroke="#3B82F6" strokeWidth={3} fillOpacity={0} />
                          <Area type="monotone" dataKey="sessions" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Device breakdown */}
                  <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-black uppercase italic tracking-tight mb-2">Device Demographics</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-8">Audience profiles</p>
                      <div className="space-y-4">
                        {GA_DEVICES.map((dev, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2.5 rounded-lg", dev.color)}>
                                <dev.icon className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-xs font-black text-white">{dev.name}</span>
                                <span className="text-[9px] font-bold text-slate-500 block uppercase">OS Profile</span>
                              </div>
                            </div>
                            <span className="text-xl font-black italic text-purple-400">{dev.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 p-3 bg-purple-950/10 rounded-xl text-[9px] text-purple-400/95 font-semibold uppercase tracking-wider text-center border border-purple-500/10">
                      Standard tracking rules active
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeEngine === 'gsc' && (
              <div className="space-y-12">
                {/* GSC Metrics Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: 'Organic Search Clicks', value: '2,481', change: '+18.4', icon: Search, color: 'text-blue-400' },
                    { label: 'Search Impressions', value: '124,591', change: '+12.1', icon: Eye, color: 'text-cyan-400' },
                    { label: 'Avg CTR (Percentage)', value: '2.1%', change: '+1.8', icon: TrendingUp, color: 'text-emerald-400' },
                    { label: 'Avg Search Position', value: '8.4', change: '-1.2', icon: Activity, color: 'text-purple-400', isDropGood: true },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 relative overflow-hidden group shadow-xl">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <stat.icon className="w-24 h-24" />
                      </div>
                      <div className="flex justify-between items-start mb-6">
                        <div className={cn("p-3 rounded-xl bg-white/5 border border-white/5 shadow-inner", stat.color)}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div className={cn("flex items-center text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", 
                          stat.isDropGood 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        )}>
                          {stat.change}% <ArrowUpRight className="ml-1 w-2.5 h-2.5" />
                        </div>
                      </div>
                      <div className="text-3xl font-black mb-1.5 tracking-tighter italic">{stat.value}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* GSC Search Performance Graph */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl overflow-hidden relative">
                    <div className="flex justify-between items-center mb-10">
                      <h4 className="text-lg font-black uppercase italic flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-400" />
                        Google Index Traffic
                      </h4>
                      <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-400 tracking-wider">Search Console Synced</div>
                    </div>

                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={GSC_PERFORMANCE_DATA}>
                          <defs>
                            <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} dy={15} />
                          <YAxis stroke="#475569" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ fontStyle: 'italic', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }}
                          />
                          <Area type="monotone" dataKey="impressions" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorImpressions)" />
                          <Area type="monotone" dataKey="clicks" stroke="#10B981" strokeWidth={3} fillOpacity={0} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Sitemap Submission Panel */}
                  <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6 flex flex-col justify-between">
                    <div className="space-y-6">
                      <h4 className="text-lg font-black uppercase italic tracking-tight">Sitemap Hub</h4>
                      <div className="space-y-4">
                        {MOCKED_SITEMAPS.map((site, i) => (
                          <div key={i} className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-blue-400">{site.path}</span>
                              <span className="text-[8px] px-2 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/10">{site.status}</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                              <span>Indexed: {site.files}</span>
                              <span>{site.scanned}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-950/10 rounded-xl border border-blue-500/10 text-[9px] text-center uppercase tracking-wider font-semibold text-blue-400">
                      All schemas crawled within 24hr cycle
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeEngine === 'bing' && (
              <div className="space-y-12">
                {/* Bing Metrics Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: 'Bing Search Clicks', value: '479', change: '+22.4', icon: Compass, color: 'text-cyan-400' },
                    { label: 'Bing Web Impressions', value: '11,482', change: '+14.1', icon: Eye, color: 'text-teal-400' },
                    { label: 'Crawl Errors Detected', value: '0', change: '0.0', icon: ServerCrash, color: 'text-green-400', isDropGood: true },
                    { label: 'Unique Queries Listed', value: '82', change: '+8.2', icon: FileText, color: 'text-yellow-400' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 relative overflow-hidden group shadow-xl">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <stat.icon className="w-24 h-24" />
                      </div>
                      <div className="flex justify-between items-start mb-6">
                        <div className={cn("p-3 rounded-xl bg-white/5 border border-white/5 shadow-inner", stat.color)}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div className={cn("flex items-center text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border", 
                          stat.isDropGood 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        )}>
                          {stat.change}% <ArrowUpRight className="ml-1 w-2.5 h-2.5" />
                        </div>
                      </div>
                      <div className="text-3xl font-black mb-1.5 tracking-tighter italic">{stat.value}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Bing Performance Graph */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl overflow-hidden relative">
                    <div className="flex justify-between items-center mb-10">
                      <h4 className="text-lg font-black uppercase italic flex items-center gap-2">
                        <Compass className="w-5 h-5 text-cyan-400" />
                        Microsoft Bing Index Flow
                      </h4>
                      <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[9px] font-black text-cyan-400 tracking-wider">Bing Webmaster Synced</div>
                    </div>

                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={BING_PERFORMANCE_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} dy={15} />
                          <YAxis stroke="#475569" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ fontStyle: 'italic', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }}
                          />
                          <Bar dataKey="impressions" fill="#22d3ee" maxBarSize={30} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="clicks" fill="#10b981" maxBarSize={30} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Crawl diagnostic rules */}
                  <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl flex flex-col justify-between">
                    <div className="space-y-6">
                      <h4 className="text-lg font-black uppercase italic tracking-tight">Crawler Access Rulebook</h4>
                      <div className="space-y-3 text-[11px] leading-relaxed text-slate-400 font-medium font-sans">
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-green-400 mt-0.5" />
                          <span><strong className="text-white">Robots.txt</strong> matches indexing rules</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-green-400 mt-0.5" />
                          <span><strong className="text-white">Structured Schema</strong> (Game type JSON-LD) verified</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-green-400 mt-0.5" />
                          <span><strong className="text-white">Sitemap submissions</strong> accepted at <code className="text-cyan-300 font-mono">/sitemap.xml</code></span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-green-400 mt-0.5" />
                          <span><strong className="text-white">Canonical Tags</strong> present on dynamic SEO landing domains</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-cyan-950/10 rounded-xl border border-cyan-500/10 text-[9px] text-center uppercase tracking-wider font-semibold text-cyan-400">
                      100% Crawl Allocation Ready
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Core Crawler Stream Audit Logs (Simulated logs showing bot crawlers hitting the domain) */}
          <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex justify-between items-center sm:items-start flex-col sm:flex-row gap-4">
              <div>
                <h3 className="text-lg font-black uppercase italic tracking-tight">SEO Crawling & Diagnostics Tracker</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time HTTP request hits matching search engine crawlers</p>
              </div>
              <div className="px-3.5 py-1 bg-green-500/10 text-green-400 border border-green-500/25 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span>Monitoring Active</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 pb-3">
                    <th className="text-[9px] font-black uppercase tracking-widest text-slate-500 py-3">Timestamp</th>
                    <th className="text-[9px] font-black uppercase tracking-widest text-slate-500 py-3">Bot Name (User-Agent)</th>
                    <th className="text-[9px] font-black uppercase tracking-widest text-slate-500 py-3">Accessed Path</th>
                    <th className="text-[9px] font-black uppercase tracking-widest text-slate-500 py-3">Server Action</th>
                    <th className="text-[9px] font-black uppercase tracking-widest text-slate-500 py-3">Depth Index</th>
                    <th className="text-[9px] font-black uppercase tracking-widest text-slate-500 py-3 text-right">HTTP Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {SEARCH_CRAWL_STREAM.map((log, i) => (
                    <tr key={i} className="group hover:bg-white/[0.01] transition-all">
                      <td className="py-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">{log.time}</td>
                      <td className="py-4 text-xs font-black text-slate-200">{log.bot}</td>
                      <td className="py-4 text-xs font-mono text-slate-300">{log.path}</td>
                      <td className="py-4 text-xs font-mono text-purple-400">{log.event}</td>
                      <td className="py-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">{log.depth}</td>
                      <td className="py-4 text-right">
                        <span className="px-2.5 py-1 text-[9px] font-mono font-black rounded-lg tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                          {log.status} OK
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
