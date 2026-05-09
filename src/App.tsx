import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabase/client';
import type { Database } from './supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

import Header from './components/Layout/Header';
import BottomNav from './components/Layout/BottomNav';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Create from './pages/Create';
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[#c9a050] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header user={user} />
        <main className="pb-20 min-h-screen">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/create" element={user ? <Create /> : <Navigate to="/login" />} />
              <Route path="/profile/:username?" element={<Profile />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/artist/:id" element={<ArtistDetail />} />
              <Route path="/ai-studio" element={<AIGenerator />} />
              <Route path="/artist-apply" element={user ? <ArtistOnboarding /> : <Navigate to="/login" />} />
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
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
  );
}

export default App;
