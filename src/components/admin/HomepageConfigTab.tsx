import React from 'react';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Layout, Palette, Image as ImageIcon, Sparkles, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export default function HomepageConfigTab() {
  const [config, setConfig] = React.useState<any>({
    hero_banners: [],
    featured_games: [],
    trending_sections: [],
    announcements: []
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'homepage_config', 'main'), (doc) => {
      if (doc.exists()) {
        setConfig(doc.data());
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'homepage_config', 'main'), config);
      alert('Forge configuration updated successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Forge Layout Architect</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-500 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {saving ? <Sparkles className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Commit Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Banner Management */}
        <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
           <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight">
              <ImageIcon className="w-6 h-6 text-blue-400" />
              Hero Protocol
           </h3>
           
           <div className="space-y-6">
              {[0, 1].map((idx) => (
                <div key={idx} className="p-8 bg-black/20 border border-white/5 rounded-3xl space-y-4">
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center justify-between">
                      Slot 0{idx + 1} Visual Array
                      <span className="text-blue-500">Active</span>
                   </div>
                   <input
                     type="text"
                     placeholder="Image URL"
                     value={config.hero_banners?.[idx]?.image || ''}
                     onChange={(e) => {
                        const newBanners = [...(config.hero_banners || [])];
                        newBanners[idx] = { ...newBanners[idx], image: e.target.value };
                        setConfig({ ...config, hero_banners: newBanners });
                     }}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                   />
                   <input
                     type="text"
                     placeholder="Call to Action Text"
                     value={config.hero_banners?.[idx]?.title || ''}
                     onChange={(e) => {
                        const newBanners = [...(config.hero_banners || [])];
                        newBanners[idx] = { ...newBanners[idx], title: e.target.value };
                        setConfig({ ...config, hero_banners: newBanners });
                     }}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                   />
                </div>
              ))}
           </div>
        </div>

        {/* Featured Content */}
        <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
           <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Prioritized Data
           </h3>

           <div className="space-y-8">
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Featured Game IDs (Max 4)</label>
                 <textarea
                   rows={3}
                   placeholder="Enter game IDs separated by commas..."
                   value={config.featured_games?.join(', ') || ''}
                   onChange={(e) => setConfig({ ...config, featured_games: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                   className="w-full bg-black/20 border border-white/10 rounded-3xl p-6 text-sm outline-none focus:ring-1 focus:ring-yellow-500 transition-all resize-none"
                 />
              </div>

              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Platform Announcements</label>
                 <div className="space-y-4">
                    {(config.announcements || []).map((ann: string, i: number) => (
                       <div key={i} className="flex gap-4">
                          <input
                            type="text"
                            value={ann}
                            onChange={(e) => {
                               const newAnn = [...config.announcements];
                               newAnn[i] = e.target.value;
                               setConfig({ ...config, announcements: newAnn });
                            }}
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none"
                          />
                       </div>
                    ))}
                    <button 
                      onClick={() => setConfig({ ...config, announcements: [...(config.announcements || []), ''] })}
                      className="text-xs font-bold text-blue-500 hover:underline"
                    >
                       + Add Intelligence Bulletin
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
