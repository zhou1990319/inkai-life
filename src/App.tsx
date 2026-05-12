import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabase/client';
import type { Database } from './supabase/types';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPrompt from './components/LoginPrompt';

type Profile = Database['public']['Tables']['profiles']['Row'];

import Header from './components/Layout/Header';
import BottomNav from './components/Layout/BottomNav';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Create from './pages/Create';
import Inspire from './pages/Inspire';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import ArtistDetail from './pages/ArtistDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AIGenerator from './pages/AIGenerator';
import ArtistOnboarding from './pages/ArtistOnboarding';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Disclaimer from './pages/Disclaimer';
import Pricing from './pages/Pricing';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

// 内容包装器，处理登录提示
function AppContent() {
  const { user, loading } = useAuth();
  const [loginPrompt, setLoginPrompt] = useState(false);

  // 监听需要登录的事件
  useEffect(() => {
    const handleRequireLogin = () => setLoginPrompt(true);
    window.addEventListener('requireLogin', handleRequireLogin);
    return () => window.removeEventListener('requireLogin', handleRequireLogin);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#CFAF6E] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <Header user={user} />
      <main className="pb-20 min-h-screen">
        <AnimatePresence mode="wait">
          <Routes>
            {/* 首页 */}
            <Route path="/" element={<Home />} />

            {/* 社区 */}
            <Route path="/explore" element={<Explore />} />

            {/* 帖子详情 */}
            <Route path="/post/:id" element={<PostDetail />} />

            {/* 用户主页 */}
            <Route path="/profile/:username?" element={<Profile />} />

            {/* 发布帖子（需登录） */}
            <Route
              path="/create"
              element={user ? <Create /> : <Navigate to="/login?redirect=/create" />}
            />

            {/* 灵感模板库 */}
            <Route path="/inspire" element={<Inspire />} />

            {/* 通知中心（需登录） */}
            <Route
              path="/notifications"
              element={user ? <Notifications /> : <Navigate to="/login?redirect=/notifications" />}
            />

            {/* AI 工作室（需登录） */}
            <Route path="/ai-studio" element={<AIGenerator user={user} />} />

            {/* 艺术家主页 */}
            <Route path="/artist/:id" element={<ArtistDetail />} />

            {/* 艺术家申请（需登录） */}
            <Route
              path="/artist-apply"
              element={user ? <ArtistOnboarding /> : <Navigate to="/login?redirect=/artist-apply" />}
            />

            {/* 定价 */}
            <Route path="/pricing" element={<Pricing user={user} />} />

            {/* 认证 */}
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

              {/* 法律 */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />

              {/* 设置 */}
              <Route path="/settings" element={<Settings />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <BottomNav user={user} />
      <LoginPrompt isOpen={loginPrompt} onClose={() => setLoginPrompt(false)} />
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <div className="min-h-screen bg-[#0B0B0E] text-white">
            <AppContent />
          </div>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
