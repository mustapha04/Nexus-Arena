import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, TrendingUp, BarChart3, 
  Settings, ShieldAlert, MessageSquare,
  ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  AreaChart, Area
} from 'recharts';
import { Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

// Mock Analytics Data
const TRAFFIC_DATA = [
  { name: 'Mon', visits: 4000, active: 2400 },
  { name: 'Tue', visits: 3000, active: 1398 },
  { name: 'Wed', visits: 2000, active: 9800 },
  { name: 'Thu', visits: 2780, active: 3908 },
  { name: 'Fri', visits: 1890, active: 4800 },
  { name: 'Sat', visits: 2390, active: 3800 },
  { name: 'Sun', visits: 3490, active: 4300 },
];

const REVENUE_DATA = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

import AnalyticsTab from '../components/admin/AnalyticsTab';
import UserManagementTab from '../components/admin/UserManagementTab';
import AffiliateManagementTab from '../components/admin/AffiliateManagementTab';
import CommentModerationTab from '../components/admin/CommentModerationTab';
import HomepageConfigTab from '../components/admin/HomepageConfigTab';

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'analytics' | 'users' | 'affiliate' | 'comments' | 'content'>('analytics');

  if (loading) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || profile?.role !== 'admin') {
     return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: 'analytics', label: 'Network Stats', icon: BarChart3 },
    { id: 'users', label: 'Personnel', icon: Users },
    { id: 'affiliate', label: 'Monetization', icon: TrendingUp },
    { id: 'comments', label: 'Moderation', icon: MessageSquare },
    { id: 'content', label: 'Layout Forge', icon: Settings },
  ] as const;

  return (
    <div className="bg-transparent min-h-screen text-white pt-32 pb-24 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto relative z-10">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
           <div>
              <div className="flex items-center gap-2 text-blue-400 font-black mb-3">
                 <ShieldAlert className="w-5 h-5" />
                 <span className="uppercase tracking-[0.2em] text-[10px]">Command Level 7 Access</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic drop-shadow-2xl">Forge Terminal</h1>
           </div>
           
           <div className="flex bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10 overflow-x-auto max-w-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap",
                    activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:text-white"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Tab Content */}
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4 }}
        >
           {activeTab === 'analytics' && <AnalyticsTab />}
           {activeTab === 'users' && <UserManagementTab />}
           {activeTab === 'affiliate' && <AffiliateManagementTab />}
           {activeTab === 'comments' && <CommentModerationTab />}
           {activeTab === 'content' && <HomepageConfigTab />}
        </motion.div>
      </div>
    </div>
  );
}
