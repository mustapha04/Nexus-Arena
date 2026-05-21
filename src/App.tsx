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
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const location = useLocation();

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
