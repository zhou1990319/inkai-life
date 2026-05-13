import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Palette, Share2, ArrowRight } from 'lucide-react';
import { supabase } from '../supabase/client';
import { useLanguage } from '../contexts/LanguageContext';

interface Post {
  id: string;
  title: string;
  image_url: string;
  style: string[];
  user: { username: string; avatar_url: string };
}

const getFeatures = (t: (key: string) => string) => [
  {
    icon: Sparkles,
    title: t('home.feature_1_title'),
    desc: t('home.feature_1_desc'),
  },
  {
    icon: Palette,
    title: t('home.feature_2_title'),
    desc: t('home.feature_2_desc'),
  },
  {
    icon: Share2,
    title: t('home.feature_3_title'),
    desc: t('home.feature_3_desc'),
  },
];

const SAMPLE_WORKS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600', title: '龙纹设计' },
  { id: '2', url: 'https://images.unsplash.com/photo-1590246815117-7f5c071e7c2c?w=600', title: '花卉图案' },
  { id: '3', url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600', title: '几何图形' },
  { id: '4', url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600', title: '文字艺术' },
  { id: '5', url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600', title: '传统纹样' },
  { id: '6', url: 'https://images.unsplash.com/photo-1590246815117-7f5c071e7c2c?w=600', title: '现代抽象' },
];

export default function Home() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data } = await supabase
      .from('tattoo_posts')
      .select('*, user:profiles(username, avatar_url)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(6);
    if (data) setPosts(data as Post[]);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-40 px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold text-black mb-8 tracking-tight">
            InkAI
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 mb-6 max-w-2xl mx-auto">
            {t('home.hero_subtitle')}
          </p>
          <p className="text-gray-400 mb-16 max-w-xl mx-auto">
            {t('home.hero_description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/ai-studio"
              className="px-10 py-4 bg-black text-white font-medium hover:shadow-[0_0_0_2px_#D4AF37] transition-all"
            >
              {t('home.get_started')}
            </Link>
            <Link
              to="/explore"
              className="px-10 py-4 border border-black text-black font-medium hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
            >
              {t('home.view_examples')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-semibold text-black mb-4">
              {t('home.features_title')}
            </h2>
            <p className="text-gray-500">{t('home.features_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {getFeatures(t).map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-black flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Works Section */}
      <section className="py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold text-black mb-2">
                {t('home.featured_works')}
              </h2>
              <p className="text-gray-500">{t('home.featured_works_subtitle')}</p>
            </div>
            <Link
              to="/explore"
              className="hidden md:flex items-center gap-2 text-black hover:text-[#D4AF37] transition-colors"
            >
              {t('home.view_all')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Works Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {(posts.length > 0 ? posts : SAMPLE_WORKS.map(w => ({ 
              id: w.id, 
              title: w.title, 
              image_url: w.url,
              style: [],
              user: { username: 'artist', avatar_url: '' }
            }))).map((post, index) => (
              <Link
                key={post.id}
                to={`/post/${post.id}`}
                className="group block"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-lg font-medium text-black group-hover:text-[#D4AF37] transition-colors">
                  {post.title}
                </h3>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-black hover:text-[#D4AF37] transition-colors"
            >
              {t('home.view_all')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-black">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">
            {t('home.cta_title')}
          </h2>
          <p className="text-gray-400 mb-12 max-w-xl mx-auto">
            {t('home.cta_description')}
          </p>
          <Link
            to="/register"
            className="inline-block px-12 py-4 bg-white text-black font-medium hover:shadow-[0_0_0_2px_#D4AF37] transition-all"
          >
            {t('home.free_signup')}
          </Link>
        </div>
      </section>
    </div>
  );
}
