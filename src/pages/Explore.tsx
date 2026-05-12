// ============================================
// InkAI 社区首页 (Explore)
// 小红书式 UGC Feed 流，支持推荐/最新/热门/关注切换
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, Clock, Sparkles, Users, Bell } from 'lucide-react';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import {
  Avatar, TagBadge, PostCard, SkeletonCard,
  SearchBar, EmptyState, NotificationBadge
} from '../components/Community';
import {
  PostService, TagService, SearchService, NotificationService,
  type PostWithAuthor, FeedOptions
} from '../services/community';
import { useLanguage } from '../contexts/LanguageContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

const getSortOptions = (isZh: boolean) => [
  { id: 'recommend', label: isZh ? '为你推荐' : 'For You', icon: Sparkles },
  { id: 'latest', label: isZh ? '最新' : 'Latest', icon: Clock },
  { id: 'popular', label: isZh ? '热门' : 'Popular', icon: TrendingUp },
  { id: 'following', label: isZh ? '关注中' : 'Following', icon: Users },
] as const;

const PAGE_SIZE = 20;

export default function Explore() {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [trendingTags, setTrendingTags] = useState<Array<{ id: string; tag: string; posts_count: number }>>([]);
  const [activeSort, setActiveSort] = useState<string>('recommend');
  const [activeTag, setActiveTag] = useState<string | null>(searchParams.get('tag') || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 加载当前用户
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setCurrentUser(data);
            NotificationService.getUnreadCount(session.user.id).then(setUnreadCount);
          });
      }
    });
  }, []);

  // 加载热门标签
  useEffect(() => {
    TagService.getFeaturedTags().then(tags => {
      setTrendingTags(tags.map(t => ({ id: t.tag, tag: t.tag, posts_count: t.posts_count })));
    });
  }, []);

  // 加载帖子
  const loadPosts = useCallback(async (reset = false) => {
    const targetPage = reset ? 0 : page;

    if (reset) {
      setLoading(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }

    try {
      let data: PostWithAuthor[] = [];

      if (activeSort === 'following' && currentUser) {
        data = await PostService.getFollowingFeed(currentUser.id, targetPage, PAGE_SIZE);
      } else if (searchQuery) {
        data = await SearchService.searchPosts(searchQuery, targetPage, PAGE_SIZE);
      } else {
        const options: FeedOptions = {
          sortBy: activeSort as 'recommend' | 'latest' | 'popular',
          tag: activeTag || undefined,
          page: targetPage,
          pageSize: PAGE_SIZE,
        };
        data = await PostService.getFeed(options);
      }

      if (reset) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }

      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeSort, activeTag, searchQuery, currentUser, page]);

  // 初始加载 + 筛选变化时重置
  useEffect(() => {
    setPage(0);
    loadPosts(true);
  }, [activeSort, activeTag, searchQuery]);

  // 无限滚动
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading]);

  // 加载更多时重新请求
  useEffect(() => {
    if (page > 0 && !loading) {
      loadPosts(false);
    }
  }, [page]);

  const handleTagClick = (tag: string) => {
    setActiveTag(prev => prev === tag ? null : tag);
    setSearchParams(tag ? { tag } : {});
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0);
  };

  const handlePostClick = (post: PostWithAuthor) => {
    navigate(`/post/${post.id}`);
  };

  const handleSortChange = (sortId: string) => {
    setActiveSort(sortId);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0E]">
      {/* Sticky Header */}
      <div className="sticky top-16 z-40 bg-[#0B0B0E]/95 backdrop-blur-md border-b border-[#2A2A36]">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          {/* 标题栏 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#18181F] border border-[#2A2A36] flex items-center justify-center">
                <Users className="w-4 h-4 text-[#9E2B25]" />
              </div>
              <div>
                <h1 className="text-[17px] font-bold text-white leading-tight">{t('explore.title')}</h1>
                <p className="text-[#6B6B78] text-[11px]">{isZh ? '发现 · 分享 · 连接' : 'Discover · Share · Connect'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 通知入口 */}
              {currentUser && (
                <button
                  onClick={() => navigate('/notifications')}
                  className="relative p-2 rounded-xl bg-[#18181F] border border-[#2A2A36] text-[#B0B0B8] hover:text-[#CFAF6E] hover:border-[#CFAF6E]/40 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  <NotificationBadge count={unreadCount} />
                </button>
              )}
              {/* 创建帖子 */}
              {currentUser ? (
                <button
                  onClick={() => navigate('/create')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#9E2B25] text-white rounded-full text-sm font-medium hover:bg-[#B8342D] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('create.post')}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#9E2B25] text-white rounded-full text-sm font-medium hover:bg-[#B8342D] transition-colors"
                >
                  {t('auth.sign_up_link')}
                </button>
              )}
            </div>
          </div>

          {/* 搜索栏 */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder={t('explore.search_placeholder')}
          />

          {/* 排序切换 */}
          <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-0.5">
            {getSortOptions(isZh).map(option => (
              <button
                key={option.id}
                onClick={() => handleSortChange(option.id)}
                disabled={option.id === 'following' && !currentUser}
                className={`
                  flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all text-xs font-medium
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${activeSort === option.id
                    ? 'bg-[#9E2B25] text-white border border-[#9E2B25]'
                    : 'bg-[#18181F] text-[#B0B0B8] border border-[#2A2A36] hover:border-[#9E2B25]/40 hover:text-white'
                  }
                `}
              >
                <option.icon className="w-3 h-3" />
                {option.label}
              </button>
            ))}
          </div>

          {/* 热门标签 */}
          {trendingTags.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-0.5 -mx-4 px-4">
              {trendingTags.map(tag => (
                <TagBadge
                  key={tag.id}
                  tag={tag.tag}
                  count={tag.posts_count}
                  active={activeTag === tag.tag}
                  onClick={() => handleTagClick(tag.tag)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feed 流 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8 text-[#6B6B78]" />}
            title={searchQuery ? t('explore.no_results') : t('notifications.no_notifications')}
            description={searchQuery ? (isZh ? '试试不同的关键词或按标签浏览' : 'Try different keywords or browse by tags') : t('profile.no_posts')}
            action={!searchQuery && currentUser ? {
              label: t('create.post'),
              onClick: () => navigate('/create'),
            } : searchQuery ? {
              label: isZh ? '清除搜索' : 'Clear Search',
              onClick: () => { setSearchQuery(''); setActiveTag(null); },
            } : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <AnimatePresence mode="popLayout">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: (index % PAGE_SIZE) * 0.03 }}
                    layout
                  >
                    <PostCard
                      post={post}
                      currentUserId={currentUser?.id}
                      onImageClick={handlePostClick}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 加载更多触发器 */}
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {loadingMore && (
                <div className="w-8 h-8 border-2 border-[#9E2B25] border-t-transparent rounded-full animate-spin" />
              )}
              {!hasMore && posts.length > 0 && (
                <p className="text-[#6B6B78] text-sm">{t('explore.load_more')}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
