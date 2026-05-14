import { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
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

const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const Create = lazy(() => import('./pages/Create'));
const Inspire = lazy(() => import('./pages/Inspire'));
const Profile = lazy(() => import('./pages/Profile'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const ArtistDetail = lazy(() => import('./pages/ArtistDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AIGenerator = lazy(() => import('./pages/AIGenerator'));
const ArtistOnboarding = lazy(() => import('./pages/ArtistOnboarding'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const Pricing = lazy(() => import('./pages/Pricing'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/PaymentCancel'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Blog = lazy(() => import('./pages/Blog'));

function AppContent() {
  const { user, loading } = useAuth();
  const [loginPrompt, setLoginPrompt] = useState(false);

  useEffect(() => {
    const handleRequireLogin = () => setLoginPrompt(true);
    window.addEventListener('requireLogin', handleRequireLogin);
    return () => window.removeEventListener('requireLogin', handleRequireLogin);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-black border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <Header user={user} />
      <main className="pb-20 min-h-screen">
        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" /></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/community" element={<Navigate to="/explore" replace />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/profile/:username?" element={<Profile />} />
              <Route path="/create" element={user ? <Create /> : <Navigate to="/login?redirect=/create" />} />
              <Route path="/inspire" element={<Inspire />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login?redirect=/notifications" />} />
              <Route path="/ai-studio" element={user ? <AIGenerator user={user} /> : <Navigate to="/login?redirect=/ai-studio" />} />
              <Route path="/artist/:id" element={<ArtistDetail />} />
              <Route path="/artist-apply" element={user ? <ArtistOnboarding /> : <Navigate to="/login?redirect=/artist-apply" />} />
              <Route path="/pricing" element={<Pricing user={user} />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login?redirect=/settings" />} />
              <Route path="*" element={<div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center"><div className="text-center"><h1 className="text-6xl font-bold text-[#CFAF6E] mb-4">404</h1><p className="text-stone-400 mb-6">Page not found</p><Link to="/" className="text-[#CFAF6E] hover:underline">Go Home</Link></div></div>} />
            </Routes>
          </Suspense>
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
          <div className="min-h-screen bg-white text-black">
            <AppContent />
          </div>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
