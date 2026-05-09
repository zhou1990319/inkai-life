import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase/client';
import type { Tables } from '../supabase/types';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'fa-layer-group' },
  { id: 'ink-wash', name: 'Ink Wash', icon: 'fa-brush' },
  { id: 'dragon-phoenix', name: 'Dragon & Phoenix', icon: 'fa-dragon' },
  { id: 'dunhuang', name: 'Dunhuang', icon: 'fa-palette' },
  { id: 'mythical', name: 'Mythical Beasts', icon: 'fa-horse' },
  { id: 'calligraphy', name: 'Calligraphy', icon: 'fa-pen-fancy' },
  { id: 'opera', name: 'Opera Masks', icon: 'fa-masks-theater' },
  { id: 'koi', name: 'Koi & Flowers', icon: 'fa-fish' },
];

export default function Explore() {
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
    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-4">Explore</h1>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#c41e3a] text-white'
                    : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
                }`}
              >
                <i className={`fas ${cat.icon}`} />
                <span className="text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#c41e3a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
              >
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-medium truncate">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-gray-300 text-sm">
                      <span><i className="fas fa-heart mr-1" /> {post.likes_count}</span>
                      <span><i className="fas fa-bookmark mr-1" /> {post.saves_count}</span>
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
