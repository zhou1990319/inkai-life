import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, ArrowRight, Flame, Star } from 'lucide-react';
import { supabase } from '../supabase/client';

const CATEGORIES = [
  { id: 'ink-wash', name: 'Ink Wash',  icon: '⛰️', desc: 'Traditional landscape' },
  { id: 'dragon',   name: 'Dragon',    icon: '🐉', desc: 'Power & prosperity' },
  { id: 'phoenix',  name: 'Phoenix',   icon: '🔥', desc: 'Rebirth & grace' },
  { id: 'koi',      name: 'Koi Fish',  icon: '🐟', desc: 'Luck & perseverance' },
  { id: 'lotus',    name: 'Lotus',     icon: '🪷', desc: 'Purity & enlightenment' },
  { id: 'tiger',    name: 'Tiger',     icon: '🐅', desc: 'Courage & strength' },
];

const FEATURED_ARTISTS = [
  { id: '1', name: 'Master Chen',  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen',   works: 128, rating: 4.9 },
  { id: '2', name: 'Ink Wizard',   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wizard', works: 96,  rating: 4.8 },
  { id: '3', name: 'Dragon Art',   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dragon', works: 156, rating: 5.0 },
  { id: '4', name: 'Lotus Ink',    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lotus',  works: 84,  rating: 4.7 },
];

interface Post {
  id: string;
  title: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
  style: string[];
  user: { username: string; avatar_url: string };
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    const { data } = await supabase
      .from('tattoo_posts')
      .select('*, user:profiles(username, avatar_url)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(16);
    if (data) setPosts(data as Post[]);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0B0B0E]">

      {/* ── Hero ── */}
      <section className="relative h-[72vh] flex items-center justify-center overflow-hidden">
        {/* background pattern */}
        <div className="absolute inset-0 bg-chinese-pattern opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0E]/30 via-[#0B0B0E]/60 to-[#0B0B0E]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="w-16 h-16 mx-auto mb-7 rounded-2xl bg-[#18181F] border border-[#2A2A36] flex items-center justify-center shadow-[0_0_40px_rgba(159,43,37,0.25)]"
          >
            <span className="text-3xl font-bold text-[#CFAF6E]">墨</span>
          </motion.div>

          {/* Wordmark */}
          <h1 className="text-5xl md:text-7xl font-bold mb-3 tracking-tight">
            <span className="text-white">InkAI</span>
            <span className="text-[#CFAF6E]">.life</span>
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-[#B0B0B8] mb-2 font-light tracking-widest">
            Where Ancient Art Meets Modern AI
          </p>
          <p className="text-[#6B6B78] mb-9 max-w-xl mx-auto text-sm leading-relaxed">
            Create stunning Chinese traditional tattoo designs with AI.
            Explore ink wash, dragons, koi fish, and more timeless symbols.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/ai-studio"
              className="px-7 py-3 bg-[#9E2B25] text-white font-bold rounded-full hover:bg-[#B8342D] transition-colors flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(159,43,37,0.4)]"
            >
              <Sparkles size={16} />
              Create Your Design
            </Link>
            <Link
              to="/explore"
              className="px-7 py-3 border border-[#2A2A36] text-[#B0B0B8] font-semibold rounded-full hover:border-[#CFAF6E]/40 hover:text-[#CFAF6E] transition-all text-sm"
            >
              Explore Community
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Categories ── */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="text-[#9E2B25]" size={18} />
              Popular Styles
            </h2>
            <Link
              to="/explore"
              className="text-[#CFAF6E] hover:text-[#E0C580] flex items-center gap-1 text-xs transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group cursor-pointer"
              >
                <div className="bg-[#18181F] border border-[#2A2A36] rounded-2xl p-4 text-center hover:border-[#9E2B25]/40 transition-all group-hover:bg-[#1E1E27]">
                  <span className="text-2xl mb-2 block">{cat.icon}</span>
                  <p className="text-white font-medium text-xs">{cat.name}</p>
                  <p className="text-[#6B6B78] text-[10px] mt-0.5">{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Feature Banner ── */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl bg-[#18181F] border border-[#2A2A36] p-8 md:p-10"
          >
            {/* Top gold accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CFAF6E]/50 to-transparent" />
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-[#9E2B25]/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-[#CFAF6E] text-xs font-semibold tracking-widest uppercase mb-1">AI Studio</p>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  AI-Powered Tattoo Design
                </h3>
                <p className="text-[#B0B0B8] text-sm max-w-md">
                  Describe your vision, choose a style, and let AI create your unique tattoo design in seconds.
                </p>
              </div>
              <Link
                to="/ai-studio"
                className="px-6 py-3 bg-[#9E2B25] text-white font-bold rounded-full hover:bg-[#B8342D] transition-colors flex items-center gap-2 whitespace-nowrap text-sm shadow-[0_0_16px_rgba(159,43,37,0.35)]"
              >
                <Sparkles size={16} />
                Try AI Generator
              </Link>
            </div>

            {/* Bottom gold accent */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#CFAF6E]/25 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ── Featured Works ── */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="text-[#CFAF6E]" size={18} />
              Featured Works
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#9E2B25] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="break-inside-avoid group relative bg-[#18181F] border border-[#2A2A36] rounded-xl overflow-hidden cursor-pointer hover:border-[#9E2B25]/40 transition-colors"
                >
                  <img src={post.image_url} alt={post.title} className="w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-medium text-xs mb-2 leading-tight">{post.title}</h3>
                      <div className="flex items-center gap-3 text-[#B0B0B8] text-[11px]">
                        <span className="flex items-center gap-1"><Heart size={11} className="text-[#9E2B25]" /> {post.likes_count}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={11} /> {post.comments_count}</span>
                      </div>
                    </div>
                  </div>
                  {post.style?.length > 0 && (
                    <div className="absolute top-2 left-2 flex gap-1">
                      {post.style.slice(0, 1).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-[#0B0B0E]/80 text-[#CFAF6E] text-[10px] rounded-full border border-[#CFAF6E]/25 backdrop-blur-sm">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Top Artists ── */}
      <section className="py-12 px-4 border-t border-[#2A2A36]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Star className="text-[#CFAF6E]" size={18} />
            Top Artists
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FEATURED_ARTISTS.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#18181F] border border-[#2A2A36] rounded-2xl p-4 text-center hover:border-[#CFAF6E]/25 transition-all cursor-pointer group"
              >
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-14 h-14 rounded-full mx-auto mb-3 border-2 border-[#2A2A36] group-hover:border-[#CFAF6E]/40 transition-colors"
                />
                <h3 className="text-white font-semibold text-sm">{artist.name}</h3>
                <p className="text-[#6B6B78] text-xs mt-0.5">{artist.works} works</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-[#CFAF6E] text-xs">
                  <Star size={12} fill="currentColor" /> {artist.rating}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
