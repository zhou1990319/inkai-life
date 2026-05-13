import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, ArrowRight, Flame, Star } from 'lucide-react';
import { supabase } from '../supabase/client';
import { useLanguage } from '../contexts/LanguageContext';

// 纹身风格配置 - 新中式暗黑国风配色
const TATTOO_STYLES = [
  { id: 'chinese',            name: 'Chinese 中式',     icon: '🏯', tag: 'ChineseTattoo',     color: '#A62323' },
  { id: 'japanese',           name: 'Japanese 日式',     icon: '⛩️', tag: 'JapaneseTattoo',   color: '#C63333' },
  { id: 'american-traditional',name: 'Traditional',     icon: '🦅', tag: 'Traditional',      color: '#D4AF37' },
  { id: 'neo-traditional',    name: 'Neo-Traditional',  icon: '🎨', tag: 'NeoTraditional',   color: '#D4AF37' },
  { id: 'dark-blackwork',      name: 'Blackwork 暗黑',   icon: '🖤', tag: 'BlackAndGrey',     color: '#4A5568' },
  { id: 'watercolor',          name: 'Watercolor 水彩',  icon: '💧', tag: 'WatercolorTattoo', color: '#2A4D69' },
  { id: 'minimalist',          name: 'Minimalist 极简',   icon: '✒️', tag: 'FineLineTattoo',  color: '#6B7280' },
  { id: 'realism',             name: 'Realism 写实',      icon: '📸', tag: 'RealisticTattoo', color: '#2A4D69' },
  { id: 'tribal',             name: 'Tribal 部落',       icon: '🔥', tag: 'GeometricTattoo', color: '#A62323' },
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

// 科技感水墨云纹装饰组件
const InkCloudDecoration = ({ className = '' }: { className?: string }) => (
  <svg className={`absolute opacity-15 ${className}`} viewBox="0 0 200 100" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="inkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
        <stop offset="50%" stopColor="#2A4D69" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <path
      d="M20,50 Q40,20 70,50 T120,50 T170,50"
      stroke="url(#inkGradient)"
      strokeWidth="1"
      fill="none"
    />
    <path
      d="M10,70 Q35,40 60,70 T110,70 T160,70"
      stroke="#A62323"
      strokeWidth="0.5"
      fill="none"
      opacity="0.4"
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
    <div className="min-h-screen bg-ink-wash-bg">
      {/* ── Hero Banner - 科技感水墨风格 ── */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* 多层光晕背景 */}
        <div className="absolute inset-0">
          {/* 朱砂红光晕 */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zhusha-red/15 rounded-full blur-[140px] animate-pulse" />
          {/* 冷青蓝科技光晕 */}
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyber-cyan/10 rounded-full blur-[120px]" />
          {/* 鎏金点缀 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-liujin-gold/5 rounded-full blur-[100px]" />
        </div>
        
        {/* 科技感水墨纹装饰 */}
        <InkCloudDecoration className="top-24 left-8 w-72 h-36" />
        <InkCloudDecoration className="bottom-24 right-8 w-72 h-36" />
        <InkCloudDecoration className="top-1/3 right-1/4 w-48 h-24 opacity-10" />
        
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-xuan-black/60 via-transparent to-xuan-black" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* 印章风格 Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="w-24 h-24 mx-auto mb-10 rounded-2xl border-2 border-liujin-gold/50 bg-zhusha-red/15 flex items-center justify-center shadow-gold-glow relative overflow-hidden"
          >
            {/* 内部光效 */}
            <div className="absolute inset-0 bg-gradient-to-br from-liujin-gold/10 to-transparent" />
            <span className="text-5xl font-display font-bold text-liujin-gold relative z-10">墨</span>
          </motion.div>

          {/* 超大鎏金渐变标题 */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold mb-6 tracking-tight">
            <span className="text-liujin-gradient-animated">
              InkAI
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-liujin-gold/70 mb-4 font-display tracking-[0.3em] uppercase">
            {t('home.hero_subtitle')}
          </p>
          <p className="text-rice-paper/50 mb-14 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {t('home.hero_title')}
          </p>

          {/* CTA 按钮 */}
          <div className="flex flex-wrap gap-5 justify-center">
            <Link
              to="/ai-studio"
              className="group px-10 py-4 bg-gradient-to-r from-zhusha-red to-zhusha-red-dark text-white font-bold rounded-full hover:from-zhusha-red-light hover:to-zhusha-red transition-all flex items-center gap-3 text-base shadow-red-glow hover:shadow-red-glow-lg"
            >
              <Sparkles size={20} className="group-hover:animate-spin" />
              {t('home.get_started')}
            </Link>
            <Link
              to="/explore"
              className="px-10 py-4 border border-liujin-gold/35 text-liujin-gold font-semibold rounded-full hover:border-liujin-gold/60 hover:bg-liujin-gold/10 transition-all text-base backdrop-blur-sm hover:shadow-gold-glow-sm"
            >
              {t('home.view_examples')}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Popular Styles - 瀑布流风格卡片 ── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-display font-bold text-rice-paper flex items-center gap-3">
              <Flame className="text-zhusha-red" size={26} />
              {t('home.popular_styles') || 'Popular Tattoo Styles'}
            </h2>
            <Link
              to="/explore"
              className="text-liujin-gold hover:text-liujin-gold-light flex items-center gap-2 text-sm transition-colors"
            >
              {t('home.explore_all')} <ArrowRight size={16} />
            </Link>
          </div>
          
          {/* 风格网格 - 鎏金边框卡片 */}
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
                    bg-xuan-black-50/40 backdrop-blur-sm border border-liujin-gold/15 rounded-2xl p-4 text-center 
                    hover:border-liujin-gold/50 hover:bg-liujin-gold/5 hover:scale-105 hover:shadow-gold-glow-sm
                    transition-all duration-300 relative overflow-hidden
                  `}>
                    {/* Trending indicator */}
                    {TRENDING_STYLES.includes(style.tag) && (
                      <div className="absolute top-2 right-2">
                        <span className="text-[9px] px-2 py-0.5 bg-zhusha-red text-white rounded-full font-bold shadow-red-glow-sm">
                          HOT
                        </span>
                      </div>
                    )}
                    <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">{style.icon}</span>
                    <p className="text-rice-paper/80 font-medium text-xs leading-tight">{style.name}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Feature Banner - 科技感水墨 ── */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zhusha-red/20 via-xuan-black to-cyber-cyan/15 border border-liujin-gold/25 p-12 md:p-16"
          >
            {/* 鎏金装饰线 */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-liujin-gold/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-liujin-gold/30 to-transparent" />
            
            {/* 背景光晕 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-cyber-cyan/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-zhusha-red/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div>
                <p className="text-liujin-gold text-sm font-bold tracking-widest uppercase mb-3">{t('ai.title')}</p>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-rice-paper mb-4">
                  {t('home.feature_ai_title')}
                </h3>
                <p className="text-rice-paper/50 text-base max-w-lg leading-relaxed">
                  {t('home.feature_ai_desc')}
                </p>
              </div>
              <Link
                to="/ai-studio"
                className="px-10 py-4 bg-gradient-to-r from-zhusha-red to-zhusha-red-dark text-white font-bold rounded-full hover:from-zhusha-red-light hover:to-zhusha-red transition-all flex items-center gap-3 whitespace-nowrap text-base shadow-red-glow hover:shadow-red-glow-lg"
              >
                <Sparkles size={20} />
                {t('ai.generate')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Works - 瀑布流作品展示 ── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-display font-bold text-rice-paper flex items-center gap-3">
              <Star className="text-liujin-gold" size={26} />
              {t('home.feature_artist_title')}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-12 h-12 border-3 border-liujin-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="break-inside-avoid group relative bg-xuan-black-50/30 border border-liujin-gold/15 rounded-2xl overflow-hidden cursor-pointer hover:border-liujin-gold/40 hover:shadow-gold-glow-sm transition-all duration-300"
                >
                  <img src={post.image_url} alt={post.title} className="w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-xuan-black/95 via-xuan-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-white font-medium text-sm mb-2 leading-tight">{post.title}</h3>
                      <div className="flex items-center gap-4 text-rice-paper/60 text-xs">
                        <span className="flex items-center gap-1"><Heart size={12} className="text-zhusha-red" /> {post.likes_count}</span>
                        <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comments_count}</span>
                      </div>
                    </div>
                  </div>
                  {post.style?.length > 0 && (
                    <div className="absolute top-4 left-4 flex gap-1">
                      {post.style.slice(0, 1).map(s => (
                        <span key={s} className="px-3 py-1 bg-xuan-black/85 text-liujin-gold text-[10px] rounded-full border border-liujin-gold/25 backdrop-blur-sm">
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

      {/* ── Top Artists - 艺术家卡片 ── */}
      <section className="py-20 px-4 border-t border-liujin-gold/15">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-rice-paper mb-10 flex items-center gap-3">
            <Star className="text-liujin-gold" size={26} />
            {t('home.feature_community_title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {FEATURED_ARTISTS.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-xuan-black-50/30 backdrop-blur-sm border border-liujin-gold/15 rounded-3xl p-7 text-center hover:border-liujin-gold/40 hover:bg-liujin-gold/5 transition-all cursor-pointer group"
              >
                <div className="relative inline-block">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-18 h-18 rounded-full mx-auto mb-5 border-2 border-liujin-gold/25 group-hover:border-liujin-gold/50 transition-colors"
                    style={{ width: '72px', height: '72px' }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-liujin-gold rounded-full flex items-center justify-center shadow-gold-glow-sm">
                    <Star size={14} className="text-xuan-black" fill="currentColor" />
                  </div>
                </div>
                <h3 className="text-rice-paper font-semibold text-base">{artist.name}</h3>
                <p className="text-rice-paper/40 text-sm mt-1">{artist.works} {t('profile.posts').toLowerCase()}</p>
                <div className="flex items-center justify-center gap-1 mt-4 text-liujin-gold text-sm">
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
