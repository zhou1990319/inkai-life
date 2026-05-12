import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, ArrowRight, Flame, Star } from 'lucide-react';
import { supabase } from '../supabase/client';
import { useLanguage } from '../contexts/LanguageContext';

// 纹身风格配置 - 点击跳转到社区筛选
const TATTOO_STYLES = [
  { id: 'chinese',            name: 'Chinese 中式',     icon: '🏯', tag: 'ChineseTattoo',     color: '#C41E3A' },
  { id: 'japanese',           name: 'Japanese 日式',     icon: '⛩️', tag: 'JapaneseTattoo',   color: '#DC2626' },
  { id: 'american-traditional',name: 'Traditional',     icon: '🦅', tag: 'Traditional',      color: '#D4AF37' },
  { id: 'neo-traditional',    name: 'Neo-Traditional',  icon: '🎨', tag: 'NeoTraditional',   color: '#D97706' },
  { id: 'dark-blackwork',      name: 'Blackwork 暗黑',   icon: '🖤', tag: 'BlackAndGrey',     color: '#4B5563' },
  { id: 'watercolor',          name: 'Watercolor 水彩',  icon: '💧', tag: 'WatercolorTattoo', color: '#0891B2' },
  { id: 'minimalist',          name: 'Minimalist 极简',   icon: '✒️', tag: 'FineLineTattoo',  color: '#6B7280' },
  { id: 'realism',             name: 'Realism 写实',      icon: '📸', tag: 'RealisticTattoo', color: '#7C3AED' },
  { id: 'tribal',             name: 'Tribal 部落',       icon: '🔥', tag: 'GeometricTattoo', color: '#B45309' },
];

// 推荐热门风格
const TRENDING_STYLES = ['JapaneseTattoo', 'Traditional', 'BlackAndGrey', 'FineLineTattoo'];

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

// 传统云纹背景装饰组件
const CloudDecoration = ({ className = '' }: { className?: string }) => (
  <svg className={`absolute opacity-10 ${className}`} viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice">
    <path
      d="M20,50 Q40,20 70,50 T120,50 T170,50"
      stroke="#D4AF37"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M10,70 Q35,40 60,70 T110,70 T160,70"
      stroke="#C41E3A"
      strokeWidth="0.5"
      fill="none"
      opacity="0.5"
    />
  </svg>
);

export default function Home() {
  const { t } = useLanguage();
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
    <div className="min-h-screen bg-gradient-to-b from-ink-black via-china-red-950/20 to-ink-black">

      {/* ── Hero ── */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* 红色光晕背景 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-china-red-600/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-imperial-gold-500/10 rounded-full blur-[100px]" />
        </div>
        
        {/* 传统纹样装饰 */}
        <CloudDecoration className="top-20 left-10 w-64 h-32" />
        <CloudDecoration className="bottom-20 right-10 w-64 h-32" />
        
        <div className="absolute inset-0 bg-gradient-to-b from-ink-black/50 via-transparent to-ink-black" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* Logo mark - 印章风格 */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="w-20 h-20 mx-auto mb-8 rounded-2xl border-2 border-imperial-gold-500/60 bg-china-red-500/20 flex items-center justify-center shadow-gold-lg"
          >
            <span className="text-4xl font-display font-bold text-imperial-gold-400">墨</span>
          </motion.div>

          {/* Wordmark - 超大金色渐变标题 */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-imperial-gold-300 via-imperial-gold-500 to-imperial-gold-300 bg-clip-text text-transparent animate-glow">
              InkAI
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-imperial-gold-400/80 mb-3 font-display tracking-[0.3em] uppercase">
            {t('home.hero_subtitle')}
          </p>
          <p className="text-rice-paper/60 mb-12 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {t('home.hero_title')}
          </p>

          {/* CTAs - 奢华按钮 */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/ai-studio"
              className="group px-8 py-4 bg-gradient-to-r from-china-red-600 to-china-red-700 text-white font-bold rounded-full hover:from-china-red-500 hover:to-china-red-600 transition-all flex items-center gap-3 text-base shadow-red-glow hover:shadow-lg"
            >
              <Sparkles size={20} className="group-hover:animate-spin" />
              {t('home.get_started')}
            </Link>
            <Link
              to="/explore"
              className="px-8 py-4 border border-imperial-gold-500/40 text-imperial-gold-400 font-semibold rounded-full hover:border-imperial-gold-500 hover:bg-imperial-gold-500/10 transition-all text-base backdrop-blur-sm"
            >
              {t('home.view_examples')}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Popular Styles ── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-rice-paper flex items-center gap-3">
              <Flame className="text-china-red-500" size={24} />
              {t('home.popular_styles') || 'Popular Tattoo Styles'}
            </h2>
            <Link
              to="/explore"
              className="text-imperial-gold-400 hover:text-imperial-gold-300 flex items-center gap-2 text-sm transition-colors"
            >
              {t('home.explore_all')} <ArrowRight size={16} />
            </Link>
          </div>
          
          {/* 风格网格 - 金色边框卡片 */}
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {TATTOO_STYLES.map((style, i) => (
              <motion.div
                key={style.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/explore?tag=${style.tag}`} className="block group">
                  <div className={`
                    bg-white/5 backdrop-blur-sm border border-imperial-gold-500/20 rounded-2xl p-4 text-center 
                    hover:border-imperial-gold-500/60 hover:bg-imperial-gold-500/10 hover:scale-105 hover:shadow-gold
                    transition-all duration-300 relative overflow-hidden
                  `}>
                    {/* Trending indicator */}
                    {TRENDING_STYLES.includes(style.tag) && (
                      <div className="absolute top-2 right-2">
                        <span className="text-[9px] px-2 py-0.5 bg-china-red-500 text-white rounded-full font-bold">
                          HOT
                        </span>
                      </div>
                    )}
                    <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">{style.icon}</span>
                    <p className="text-rice-paper font-medium text-xs leading-tight">{style.name}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Feature Banner ── */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-china-red-900/40 to-ink-black border border-imperial-gold-500/30 p-10 md:p-14"
          >
            {/* 金色装饰线 */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-imperial-gold-500 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-imperial-gold-500/50 to-transparent" />
            
            {/* 背景光晕 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-china-red-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <p className="text-imperial-gold-400 text-sm font-bold tracking-widest uppercase mb-2">{t('ai.title')}</p>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-rice-paper mb-3">
                  {t('home.feature_ai_title')}
                </h3>
                <p className="text-rice-paper/60 text-base max-w-lg">
                  {t('home.feature_ai_desc')}
                </p>
              </div>
              <Link
                to="/ai-studio"
                className="px-8 py-4 bg-gradient-to-r from-china-red-600 to-china-red-700 text-white font-bold rounded-full hover:from-china-red-500 hover:to-china-red-600 transition-all flex items-center gap-3 whitespace-nowrap text-base shadow-red-glow"
              >
                <Sparkles size={20} />
                {t('ai.generate')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Works ── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-rice-paper flex items-center gap-3">
              <Star className="text-imperial-gold-400" size={24} />
              {t('home.feature_artist_title')}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-3 border-imperial-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="break-inside-avoid group relative bg-white/5 border border-imperial-gold-500/20 rounded-2xl overflow-hidden cursor-pointer hover:border-imperial-gold-500/50 hover:shadow-gold transition-all duration-300"
                >
                  <img src={post.image_url} alt={post.title} className="w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-medium text-sm mb-2 leading-tight">{post.title}</h3>
                      <div className="flex items-center gap-4 text-rice-paper/70 text-xs">
                        <span className="flex items-center gap-1"><Heart size={12} className="text-china-red-500" /> {post.likes_count}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comments_count}</span>
                      </div>
                    </div>
                  </div>
                  {post.style?.length > 0 && (
                    <div className="absolute top-3 left-3 flex gap-1">
                      {post.style.slice(0, 1).map(s => (
                        <span key={s} className="px-3 py-1 bg-ink-black/80 text-imperial-gold-400 text-[10px] rounded-full border border-imperial-gold-500/30 backdrop-blur-sm">
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
      <section className="py-16 px-4 border-t border-imperial-gold-500/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-rice-paper mb-8 flex items-center gap-3">
            <Star className="text-imperial-gold-400" size={24} />
            {t('home.feature_community_title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURED_ARTISTS.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-imperial-gold-500/20 rounded-3xl p-6 text-center hover:border-imperial-gold-500/50 hover:bg-imperial-gold-500/5 transition-all cursor-pointer group"
              >
                <div className="relative inline-block">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-imperial-gold-500/30 group-hover:border-imperial-gold-500/60 transition-colors"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-imperial-gold-500 rounded-full flex items-center justify-center">
                    <Star size={12} className="text-ink-black" fill="currentColor" />
                  </div>
                </div>
                <h3 className="text-rice-paper font-semibold text-base">{artist.name}</h3>
                <p className="text-rice-paper/50 text-sm mt-1">{artist.works} {t('profile.posts').toLowerCase()}</p>
                <div className="flex items-center justify-center gap-1 mt-3 text-imperial-gold-400 text-sm">
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
