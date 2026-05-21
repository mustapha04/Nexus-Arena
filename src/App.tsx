import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import GameDetails from './pages/GameDetails';
import Deals from './pages/Deals';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const location = useLocation();
  const { isFirebaseReady } = useAuth();

  // Dynamic Google Analytics, Google Search Console, and Bing Webmaster injector
  React.useEffect(() => {
    if (isFirebaseReady) {
      const loadTelemetryAndSEO = async () => {
        try {
          const { db } = await import('./lib/firebase');
          const { doc, getDoc } = await import('firebase/firestore');
          const docSnap = await getDoc(doc(db, 'homepage_config', 'main'));
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data) {
              // 1. Google Analytics
              if (data.ga_tracking_id) {
                const trackingId = data.ga_tracking_id;
                
                if (!document.getElementById('ga-gtag-script')) {
                  const script1 = document.createElement('script');
                  script1.id = 'ga-gtag-script';
                  script1.async = true;
                  script1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
                  document.head.appendChild(script1);

                  const script2 = document.createElement('script');
                  script2.id = 'ga-gtag-init-script';
                  script2.innerHTML = `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){window.dataLayer.push(arguments);}
                    window.gtag = gtag;
                    gtag('js', new Date());
                    gtag('config', '${trackingId}', {
                      page_path: window.location.pathname,
                    });
                  `;
                  document.head.appendChild(script2);
                }
              }

              // 2. Google Search Console Meta Verification
              if (data.gsc_verification_id) {
                let metaGSC = document.getElementById('gsc-verification-meta') as HTMLMetaElement;
                if (!metaGSC) {
                  metaGSC = document.createElement('meta');
                  metaGSC.id = 'gsc-verification-meta';
                  metaGSC.name = 'google-site-verification';
                  document.head.appendChild(metaGSC);
                }
                metaGSC.content = data.gsc_verification_id;
              }

              // 3. Bing Webmaster Tools Meta Verification
              if (data.bing_verification_id) {
                let metaBing = document.getElementById('bing-verification-meta') as HTMLMetaElement;
                if (!metaBing) {
                  metaBing = document.createElement('meta');
                  metaBing.id = 'bing-verification-meta';
                  metaBing.name = 'msvalidate.01';
                  document.head.appendChild(metaBing);
                }
                metaBing.content = data.bing_verification_id;
              }
            }
          }
        } catch (e) {
          console.error("Failed to dynamically initialize Telemetry and SEO tags:", e);
        }
      };
      loadTelemetryAndSEO();
    }
  }, [isFirebaseReady]);

  // Route tracker
  React.useEffect(() => {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: document.title,
      });
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-x-hidden">
      {/* Mesh Background Decorative Elements */}
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] mesh-bg-blue rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] mesh-bg-purple rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      <div className="relative z-10">
        <Navbar />
        <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/game/:id" element={<GameDetails />} />
              <Route path="/games/:slug" element={<GameDetails />} />
              <Route path="/genre/:genre" element={<Search />} />
              <Route path="/trending" element={<Search type="trending" />} />
              <Route path="/top-rated" element={<Search type="top-rated" />} />
              <Route path="/upcoming" element={<Search type="upcoming" />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
