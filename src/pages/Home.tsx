import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '../supabase/client';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface Post {
  id: string;
  title: string;
  image_url: string;
  style: string[];
  user: { username: string; avatar_url: string };
}

const SAMPLE_WORKS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600', title: 'Dragon Design', style: '中式' },
  { id: '2', url: 'https://images.unsplash.com/photo-1590246815117-7f5c071e7c2c?w=600', title: 'Floral Pattern', style: '日式' },
  { id: '3', url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600', title: 'Geometric Art', style: '极简' },
  { id: '4', url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600', title: 'Typography Art', style: '美式' },
  { id: '5', url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600', title: 'Traditional Style', style: '黑灰' },
  { id: '6', url: 'https://images.unsplash.com/photo-1590246815117-7f5c071e7c2c?w=600', title: 'Modern Abstract', style: '水彩' },
  { id: '7', url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600', title: 'Minimalist Line', style: '极简' },
  { id: '8', url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600', title: 'Oriental Art', style: '中式' },
];

const STYLE_TAGS = [
  { id: 'all', label: '全部' },
  { id: 'chinese', label: '中式' },
  { id: 'japanese', label: '日式' },
  { id: 'american', label: '美式' },
  { id: 'blackgray', label: '黑灰' },
  { id: 'watercolor', label: '水彩' },
  { id: 'minimalist', label: '极简' },
  { id: 'geometric', label: '几何' },
  { id: 'lettering', label: '花体' },
];

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data } = await supabase
      .from('tattoo_posts')
      .select('*, user:profiles(username, avatar_url)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(8);
    if (data) setPosts(data as Post[]);
  }

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    if (!user) {
      navigate('/login?redirect=/ai-studio');
      return;
    }
    
    setIsGenerating(true);
    navigate('/ai-studio', { state: { initialPrompt: prompt, style: selectedStyle } });
  };

  const displayWorks = posts.length > 0 
    ? posts.map(p => ({ id: p.id, url: p.image_url, title: p.title, style: p.style?.[0] || 'Custom' }))
    : SAMPLE_WORKS;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Compact Single Screen */}
      <section className="pt-20 pb-4 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Title */}
          <div className="text-center mb-4">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold text-black tracking-tight leading-tight">
              AI Tattoo Design Generator
            </h1>
            <p className="text-base sm:text-lg text-gray-500 mt-2 max-w-xl mx-auto">
              Create unique tattoos in seconds
            </p>
          </div>

          {/* Input + CTA */}
          <div className="max-w-2xl mx-auto mb-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Describe your tattoo idea..."
                  className="w-full px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors text-sm sm:text-base"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="px-6 sm:px-8 py-3 sm:py-3.5 bg-black text-white font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Generating...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trust Points - Horizontal */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-gray-500 mb-4">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-black" />
              Free to start
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-black" />
              No signup required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-black" />
              10+ styles
            </span>
          </div>
        </div>
      </section>

      {/* Style Tags - Horizontal Scroll */}
      <section className="border-y border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide py-3 px-4 sm:px-6 gap-2 snap-x">
            {STYLE_TAGS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedStyle(tag.id)}
                className={`flex-shrink-0 px-4 py-1.5 text-sm font-medium transition-all snap-start ${
                  selectedStyle === tag.id
                    ? 'bg-black text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Works - Compact Grid */}
      <section className="py-4 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Works Grid - 2 cols mobile, 3 tablet, 4 desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {displayWorks.slice(0, 8).map((work) => (
              <Link
                key={work.id}
                to={`/post/${work.id}`}
                className="group relative aspect-square overflow-hidden bg-gray-100"
              >
                <img
                  src={work.url}
                  alt={work.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
                  <p className="text-sm font-medium text-center">{work.title}</p>
                  {work.style && (
                    <span className="text-xs text-gray-300 mt-1">{work.style}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* View More Link */}
          <div className="mt-4 text-center">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
            >
              View More <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
