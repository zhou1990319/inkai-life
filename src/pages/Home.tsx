import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, ArrowRight, Flame, Star } from 'lucide-react';
import { supabase } from '../supabase/client';

const CATEGORIES = [
  { id: 'ink-wash', name: 'Ink Wash', icon: '⛰️', desc: 'Traditional landscape' },
  { id: 'dragon', name: 'Dragon', icon: '🐉', desc: 'Power & prosperity' },
  { id: 'phoenix', name: 'Phoenix', icon: '🔥', desc: 'Rebirth & grace' },
  { id: 'koi', name: 'Koi Fish', icon: '🐟', desc: 'Luck & perseverance' },
  { id: 'lotus', name: 'Lotus', icon: '🪷', desc: 'Purity & enlightenment' },
  { id: 'tiger', name: 'Tiger', icon: '🐅', desc: 'Courage & strength' },
];

const FEATURED_ARTISTS = [
  { id: '1', name: 'Master Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen', works: 128, rating: 4.9 },
  { id: '2', name: 'Ink Wizard', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wizard', works: 96, rating: 4.8 },
  { id: '3', name: 'Dragon Art', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dragon', works: 156, rating: 5.0 },
  { id: '4', name: 'Lotus Ink', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lotus', works: 84, rating: 4.7 },
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

  useEffect(() => {
    fetchPosts();
  }, []);

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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-[#0a0a0a] to-[#0a0a0a]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a050' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center"
          >
            <span className="text-4xl font-bold text-white">墨</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-red-500 bg-clip-text text-transparent">
              InkAI.life
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-amber-200/80 mb-2 font-light tracking-wider">
            Where Ancient Art Meets Modern AI
          </p>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Create stunning Chinese traditional tattoo designs with AI. 
            Explore ink wash, dragons, koi fish, and more timeless symbols.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/ai-studio"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-full hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-2"
            >
              <Sparkles size={20} />
              Create Your Design
            </Link>
            <Link
              to="/explore"
              className="px-8 py-4 border border-amber-500/50 text-amber-400 font-semibold rounded-full hover:bg-amber-500/10 transition-all"
            >
              Explore Gallery
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Flame className="text-amber-500" size={24} />
              Popular Styles
            </h2>
            <Link to="/explore" className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-sm">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group cursor-pointer"
              >
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-4 text-center hover:border-amber-500/50 transition-all">
                  <span className="text-3xl mb-2 block">{cat.icon}</span>
                  <p className="text-white font-medium text-sm">{cat.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Feature Banner */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900/40 via-red-900/30 to-amber-900/40 border border-amber-500/20 p-8 md:p-12"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  AI-Powered Tattoo Design
                </h3>
                <p className="text-gray-300">
                  Describe your vision, choose a style, and let AI create your unique tattoo design in seconds.
                </p>
              </div>
              <Link
                to="/ai-studio"
                className="px-6 py-3 bg-amber-500 text-black font-bold rounded-full hover:bg-amber-400 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles size={18} />
                Try AI Generator
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Works */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Star className="text-amber-500" size={24} />
              Featured Works
            </h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="break-inside-avoid group relative bg-gray-900 rounded-xl overflow-hidden cursor-pointer"
                >
                  <img src={post.image_url} alt={post.title} className="w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-medium text-sm mb-2">{post.title}</h3>
                      <div className="flex items-center gap-3 text-white/80 text-xs">
                        <span className="flex items-center gap-1"><Heart size={14} /> {post.likes_count}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={14} /> {post.comments_count}</span>
                      </div>
                    </div>
                  </div>
                  {post.style?.length > 0 && (
                    <div className="absolute top-2 left-2 flex gap-1">
                      {post.style.slice(0, 2).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-amber-500/90 text-black text-xs rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Star className="text-amber-500" size={24} />
            Top Artists
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURED_ARTISTS.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center hover:border-amber-500/30 transition-all cursor-pointer"
              >
                <img src={artist.avatar} alt={artist.name} className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-amber-500/50" />
                <h3 className="text-white font-semibold">{artist.name}</h3>
                <p className="text-gray-500 text-sm">{artist.works} works</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-amber-400 text-sm">
                  <Star size={14} fill="currentColor" /> {artist.rating}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
