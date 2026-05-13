// ============================================
// InkAI 社区首页 (Explore) - 高级设计重构
// 瀑布流网格 + 顶部固定标签 + 高信息密度
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, Clock, Sparkles, Users, Bell, Search, X } from 'lucide-react';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import {
  Avatar, TagBadge, PostCard, SkeletonCard,
  EmptyState, NotificationBadge
} from '../components/Community';
import {
  PostService, TagService, SearchService, NotificationService,
  type PostWithAuthor, FeedOptions
} from '../services/community';
import { useLanguage } from '../contexts/LanguageContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

// 主标签选项
const getMainTabs = (isZh: boolean) => [
  { id: 'recommend', label: isZh ? '为你推荐' : 'For You', icon: Sparkles },
  { id: 'latest', label: isZh ? '最新' : 'Latest', icon: Clock },
  { id: 'popular', label: isZh ? '热门' : 'Hot', icon: TrendingUp },
  { id: 'following', label: isZh ? '关注' : 'Following', icon: Users },
] as const;

// 风格标签预设
const getStyleTags = (isZh: boolean) => isZh
  ? ['全部', '中式', '日式', '美式', '黑灰', '彩色', '几何', '写实', '图腾']
  : ['All', 'Chinese', 'Japanese', 'American', 'Black & Grey', 'Color', 'Geometric', 'Realistic', 'Tribal'];

const PAGE_SIZE = 24;

export default function Explore() {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 状态管理
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [trendingTags, setTrendingTags] = useState<Array<{ id: string; tag: string; posts_count: number }>>([]);
  const [activeTab, setActiveTab] = useState<string>('recommend');
  const [activeStyleTag, setActiveStyleTag] = useState<string>(isZh ? '全部' : 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const mainTabsRef = useRef<HTMLDivElement>(null);
  const styleTagsRef = useRef<HTMLDivElement>(null);

  // 监听滚动，添加阴影效果
  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

      if (activeTab === 'following' && currentUser) {
        data = await PostService.getFollowingFeed(currentUser.id, targetPage, PAGE_SIZE);
      } else if (searchQuery) {
        data = await SearchService.searchPosts(searchQuery, targetPage, PAGE_SIZE);
      } else {
        const options: FeedOptions = {
          sortBy: activeTab as 'recommend' | 'latest' | 'popular',
          tag: activeStyleTag !== (isZh ? '全部' : 'All') ? activeStyleTag : undefined,
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
  }, [activeTab, activeStyleTag, searchQuery, currentUser, page, isZh]);

  // 初始加载 + 筛选变化时重置
  useEffect(() => {
    setPage(0);
    loadPosts(true);
  }, [activeTab, activeStyleTag, searchQuery]);

  // 无限滚动
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
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

  const handleStyleTagClick = (tag: string) => {
    setActiveStyleTag(tag);
    setSearchParams(tag !== (isZh ? '全部' : 'All') ? { tag } : {});
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(0);
  };

  const handlePostClick = (post: PostWithAuthor) => {
    navigate(`/post/${post.id}`);
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'following' && !currentUser) {
      navigate('/login');
      return;
    }
    setActiveTab(tabId);
    setPage(0);
  };

  const mainTabs = getMainTabs(isZh);
  const styleTags = getStyleTags(isZh);

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部固定导航区域 */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
          headerScrolled ? 'shadow-sm' : ''
        }`}
        style={{ paddingTop: '64px' }} // 为 Header 留出空间
      >
        <div className="max-w-7xl mx-auto">
          {/* 搜索框 - 紧凑设计 */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative max-w-2xl mx-auto">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                isSearchFocused ? 'text-black' : 'text-gray-400'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                placeholder={isZh ? '搜索纹身设计、艺术家...' : 'Search tattoo designs, artists...'}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  <X className="w-3 h-3 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* 主标签切换 - 固定顶部 */}
          <div
            ref={mainTabsRef}
            className="px-4 py-2 border-b border-gray-100 bg-white"
          >
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isDisabled = tab.id === 'following' && !currentUser;

                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && handleTabChange(tab.id)}
                    disabled={isDisabled}
                    className={`
                      relative flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium
                      transition-all duration-200
                      ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      ${isActive
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-black rounded-full -z-10"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 风格标签 - 横向滚动 */}
          <div
            ref={styleTagsRef}
            className="px-4 py-2 border-b border-gray-100 bg-white/95 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              {styleTags.map((tag) => {
                const isActive = activeStyleTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => handleStyleTagClick(tag)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
                      transition-all duration-200 border
                      ${isActive
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {tag}
                  </button>
                );
              })}
              {trendingTags.slice(0, 5).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleStyleTagClick(tag.tag)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
                    transition-all duration-200 border
                    ${activeStyleTag === tag.tag
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  #{tag.tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 占位空间，防止内容被固定头部遮挡 */}
      <div className="h-[152px]" />

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* 标题栏 + 操作按钮 */}
        <div className="flex items-center justify-between py-4 px-2">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">
              {searchQuery
                ? (isZh ? `"${searchQuery}" 的搜索结果` : `Results for "${searchQuery}"`)
                : activeStyleTag !== (isZh ? '全部' : 'All')
                ? activeStyleTag
                : mainTabs.find(t => t.id === activeTab)?.label
              }
            </h1>
            <span className="text-sm text-gray-400">
              {posts.length > 0 && `${posts.length}+`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 通知入口 */}
            {currentUser && (
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
              >
                <Bell className="w-4 h-4" />
                <NotificationBadge count={unreadCount} />
              </button>
            )}

            {/* 创建帖子按钮 */}
            {currentUser ? (
              <button
                onClick={() => navigate('/create')}
                className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('create.post')}</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {t('auth.sign_up_link')}
              </button>
            )}
          </div>
        </div>

        {/* 作品网格 - 瀑布流布局 */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-2">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} aspectRatio="3/4" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8 text-gray-400" />}
            title={searchQuery ? t('explore.no_results') : t('notifications.no_notifications')}
            description={searchQuery
              ? (isZh ? '试试不同的关键词或按标签浏览' : 'Try different keywords or browse by tags')
              : t('profile.no_posts')
            }
            action={!searchQuery && currentUser ? {
              label: t('create.post'),
              onClick: () => navigate('/create'),
            } : searchQuery ? {
              label: isZh ? '清除搜索' : 'Clear Search',
              onClick: () => { setSearchQuery(''); setActiveStyleTag(isZh ? '全部' : 'All'); },
            } : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-2">
              <AnimatePresence mode="popLayout">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min((index % PAGE_SIZE) * 0.02, 0.5),
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    layout
                  >
                    <PostCard
                      post={post}
                      currentUserId={currentUser?.id}
                      onImageClick={handlePostClick}
                      compact
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 加载更多触发器 */}
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {loadingMore && (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                  <span className="text-sm">{isZh ? '加载更多...' : 'Loading more...'}</span>
                </div>
              )}
              {!hasMore && posts.length > 0 && (
                <p className="text-gray-400 text-sm">
                  {isZh ? '已经到底了' : 'No more posts'}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
