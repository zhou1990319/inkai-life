import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase/client';
import type { Tables } from '../supabase/types';

const CATEGORIES = [
  { id: 'all',           name: 'All',              icon: 'fa-layer-group' },
  { id: 'ink-wash',      name: 'Ink Wash',          icon: 'fa-brush' },
  { id: 'dragon-phoenix',name: 'Dragon & Phoenix',  icon: 'fa-dragon' },
  { id: 'dunhuang',      name: 'Dunhuang',          icon: 'fa-palette' },
  { id: 'mythical',      name: 'Mythical Beasts',   icon: 'fa-horse' },
  { id: 'calligraphy',   name: 'Calligraphy',       icon: 'fa-pen-fancy' },
  { id: 'opera',         name: 'Opera Masks',       icon: 'fa-masks-theater' },
  { id: 'koi',           name: 'Koi & Flowers',     icon: 'fa-fish' },
];

export default function Community() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [posts, setPosts] = useState<Tables<'tattoo_posts'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  async function fetchPosts() {
    setLoading(true);
    let query = supabase
      .from('tattoo_posts')
      .select('*, profiles:user_id(username, avatar_url)')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (activeCategory !== 'all') {
      query = query.contains('style', [activeCategory]);
    }

    const { data, error } = await query.limit(20);
    if (!error && data) setPosts(data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0B0B0E]">

      {/* Sticky header */}
      <div className="sticky top-16 z-40 bg-[#0B0B0E]/95 backdrop-blur-md border-b border-[#2A2A36]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Title row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#18181F] border border-[#2A2A36] flex items-center justify-center">
              <i className="fas fa-users text-[#9E2B25] text-sm" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-white leading-tight">Community</h1>
              <p className="text-[#6B6B78] text-[11px] tracking-wide">Share · Like · Follow · Inspire</p>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all text-xs font-medium ${
                  activeCategory === cat.id
                    ? 'bg-[#9E2B25] text-white border border-[#9E2B25]'
                    : 'bg-[#18181F] text-[#B0B0B8] border border-[#2A2A36] hover:border-[#9E2B25]/40 hover:text-white'
                }`}
              >
                <i className={`fas ${cat.icon} text-[10px]`} />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#9E2B25] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-4xl">🖋️</span>
            <p className="text-[#6B6B78] text-sm">No posts yet — be the first to share.</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="break-inside-avoid group relative rounded-xl overflow-hidden bg-[#18181F] border border-[#2A2A36] hover:border-[#9E2B25]/40 transition-colors cursor-pointer"
              >
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-semibold text-sm truncate leading-tight mb-1.5">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[#B0B0B8] text-xs">
                      <span><i className="fas fa-heart mr-1 text-[#9E2B25]" />{post.likes_count}</span>
                      <span><i className="fas fa-bookmark mr-1 text-[#CFAF6E]" />{post.saves_count}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
