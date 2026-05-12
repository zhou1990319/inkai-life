import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabase/client';
import type { Database } from './supabase/types';
import { LanguageProvider } from './contexts/LanguageContext';

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

function App() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(data);
      }
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => setUser(data));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
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
    <LanguageProvider>
      <HashRouter>
        <div className="min-h-screen bg-[#0B0B0E] text-white">
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
                element={user ? <Create /> : <Navigate to="/login" />}
              />

              {/* 灵感模板库 */}
              <Route path="/inspire" element={<Inspire />} />

              {/* 通知中心（需登录） */}
              <Route
                path="/notifications"
                element={user ? <Notifications /> : <Navigate to="/login" />}
              />

              {/* AI 工作室（需登录） */}
              <Route path="/ai-studio" element={<AIGenerator user={user} />} />

              {/* 艺术家主页 */}
              <Route path="/artist/:id" element={<ArtistDetail />} />

              {/* 艺术家申请（需登录） */}
              <Route
                path="/artist-apply"
                element={user ? <ArtistOnboarding /> : <Navigate to="/login" />}
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
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        <BottomNav user={user} />
      </div>
      </HashRouter>
    </LanguageProvider>
  );
}

export default App;
