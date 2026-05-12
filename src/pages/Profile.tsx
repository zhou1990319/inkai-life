// ============================================
// InkAI 用户个人主页 (Profile)
// 瀑布流作品 + 收藏 + 关注/粉丝列表
// ============================================

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings, Edit3, Grid3X3, Bookmark, Heart,
  Users, MapPin, Globe, Loader2, ChevronDown, X
} from 'lucide-react';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import {
  Avatar, FollowButton, PostCard, EmptyState, SkeletonCard
} from '../components/Community';
import {
  PostService, SaveService, FollowService,
  type PostWithAuthor, ProfileService
} from '../services/community';
import type { Profile } from '../services/community';

type DbProfile = Database['public']['Tables']['profiles']['Row'];

type TabType = 'posts' | 'saved' | 'followers' | 'following';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<DbProfile | null>(null);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostWithAuthor[]>([]);
  const [followers, setFollowers] = useState<DbProfile[]>([]);
  const [following, setFollowing] = useState<DbProfile[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showFollowModal, setShowFollowModal] = useState<'followers' | 'following' | null>(null);

  const PAGE_SIZE = 20;
  const isOwnProfile = currentUser?.username === username;

  // 加载当前用户
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setCurrentUser(data));
      }
    });
  }, [username]);

  // 加载目标用户资料
  useEffect(() => {
    if (!username) return;
    setLoading(true);

    ProfileService.getUserByUsername(username).then(data => {
      setProfile(data);
      setLoading(false);
    });
  }, [username]);

  // 加载帖子
  useEffect(() => {
    if (!profile) return;
    setPage(0);

    PostService.getFeed({ userId: profile.id, sortBy: 'latest', page: 0, pageSize: PAGE_SIZE })
      .then(data => { setPosts(data); setHasMore(data.length === PAGE_SIZE); });
  }, [profile]);

  // Tab 切换
  useEffect(() => {
    if (!profile || !currentUser) return;
    setPage(0);

    const loadData = async () => {
      if (activeTab === 'posts') {
        const data = await PostService.getFeed({ userId: profile.id, sortBy: 'latest', page: 0, pageSize: PAGE_SIZE });
        setPosts(data);
        setHasMore(data.length === PAGE_SIZE);
      } else if (activeTab === 'saved' && isOwnProfile) {
        const data = await SaveService.getSavedPosts(currentUser.id, 0, PAGE_SIZE);
        setSavedPosts(data);
        setHasMore(data.length === PAGE_SIZE);
      } else if (activeTab === 'followers') {
        const data = await FollowService.getFollowers(profile.id, 0, PAGE_SIZE);
        setFollowers(data);
        setHasMore(data.length === PAGE_SIZE);
      } else if (activeTab === 'following') {
        const data = await FollowService.getFollowing(profile.id, 0, PAGE_SIZE);
        setFollowing(data);
        setHasMore(data.length === PAGE_SIZE);
      }
    };

    loadData();
  }, [activeTab, profile, currentUser]);

  const displayName = profile?.display_name || profile?.username || 'Unknown';
  const isArtist = profile?.is_artist || false;
  const isVerified = profile?.artist_verified || false;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#9E2B25] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center">
        <EmptyState
          icon={<Users className="w-8 h-8 text-[#6B6B78]" />}
          title="User not found"
          description="This profile doesn't exist or may have been removed"
          action={{ label: 'Back to Community', onClick: () => navigate('/explore') }}
        />
      </div>
    );
  }

  const TABS: { id: TabType; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'posts', label: 'Posts', icon: Grid3X3, count: profile?.followers_count || 0 },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'followers', label: 'Followers', icon: Users, count: profile?.followers_count || 0 },
    { id: 'following', label: 'Following', icon: Heart, count: profile?.following_count || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0E]">
      {/* 个人资料头部 */}
      <div className="bg-[#18181F] border-b border-[#2A2A36]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-6"
          >
            {/* 头像 */}
            <div className="relative">
              <Avatar user={profile} size="xl" showBadge />
              {isOwnProfile && (
                <button
                  onClick={() => {/* TODO: 上传头像 */}}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <Edit3 className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            {/* 资料信息 */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                {isVerified && (
                  <span className="px-2 py-0.5 bg-[#CFAF6E]/20 text-[#CFAF6E] text-xs font-medium rounded-full border border-[#CFAF6E]/30">
                    Verified Artist
                  </span>
                )}
                {isArtist && !isVerified && (
                  <span className="px-2 py-0.5 bg-[#9E2B25]/20 text-[#9E2B25] text-xs font-medium rounded-full border border-[#9E2B25]/30">
                    Tattoo Artist
                  </span>
                )}
              </div>

              <p className="text-[#6B6B78] text-sm">@{profile.username}</p>

              {profile.bio && (
                <p className="text-[#B0B0B8] text-sm leading-relaxed max-w-lg">{profile.bio}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-[#6B6B78]">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-[#CFAF6E] transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </a>
                )}
              </div>

              {/* 统计数据 */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setShowFollowModal('followers')}
                  className="hover:opacity-80 transition-opacity"
                >
                  <span className="text-white font-semibold">{profile.followers_count || 0}</span>
                  <span className="text-[#6B6B78] ml-1">Followers</span>
                </button>
                <button
                  onClick={() => setShowFollowModal('following')}
                  className="hover:opacity-80 transition-opacity"
                >
                  <span className="text-white font-semibold">{profile.following_count || 0}</span>
                  <span className="text-[#6B6B78] ml-1">Following</span>
                </button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => navigate('/settings')}
                  className="p-2.5 rounded-xl bg-[#18181F] border border-[#2A2A36] text-[#B0B0B8] hover:text-[#CFAF6E] hover:border-[#CFAF6E]/40 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              ) : (
                <FollowButton
                  targetUserId={profile.id}
                  currentUserId={currentUser?.id || ''}
                  size="md"
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="sticky top-16 z-40 bg-[#0B0B0E]/95 backdrop-blur-md border-b border-[#2A2A36]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-thin">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={tab.id === 'saved' && !isOwnProfile}
                className={`
                  flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${activeTab === tab.id
                    ? 'text-white border-[#9E2B25]'
                    : 'text-[#6B6B78] border-transparent hover:text-[#B0B0B8]'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* 帖子列表 */}
        {activeTab === 'posts' && (
          posts.length === 0 ? (
            <EmptyState
              icon={<Grid3X3 className="w-8 h-8 text-[#6B6B78]" />}
              title="No posts yet"
              description={isOwnProfile ? 'Share your first tattoo work!' : 'This user has not posted anything yet'}
              action={isOwnProfile ? {
                label: 'Create Post',
                onClick: () => navigate('/create'),
              } : undefined}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser?.id}
                  onImageClick={(p) => navigate(`/post/${p.id}`)}
                />
              ))}
            </div>
          )
        )}

        {/* 收藏列表 */}
        {activeTab === 'saved' && (
          isOwnProfile ? (
            savedPosts.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="w-8 h-8 text-[#6B6B78]" />}
                title="No saved posts"
                description="Save posts you love to view them later"
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {savedPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUser?.id}
                    onImageClick={(p) => navigate(`/post/${p.id}`)}
                  />
                ))}
              </div>
            )
          ) : (
            <EmptyState
              icon={<Bookmark className="w-8 h-8 text-[#6B6B78]" />}
              title="Private collection"
              description="This user's saved posts are private"
            />
          )
        )}

        {/* 关注者 / 正在关注 */}
        {(activeTab === 'followers' || activeTab === 'following') && (
          <div className="space-y-2">
            {(activeTab === 'followers' ? followers : following).length === 0 ? (
              <EmptyState
                icon={<Users className="w-8 h-8 text-[#6B6B78]" />}
                title={activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              />
            ) : (
              (activeTab === 'followers' ? followers : following).map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 bg-[#18181F] rounded-xl border border-[#2A2A36] hover:border-[#2A2A36]/80 transition-colors"
                >
                  <Link to={`/profile/${user.username}`}>
                    <Avatar user={user} size="md" showBadge />
                  </Link>
                  <Link to={`/profile/${user.username}`} className="flex-1 min-w-0 group">
                    <p className="text-white font-medium group-hover:text-[#CFAF6E] transition-colors truncate">
                      {user.display_name || user.username}
                    </p>
                    <p className="text-[#6B6B78] text-xs truncate">@{user.username}</p>
                  </Link>
                  {isOwnProfile && (
                    <FollowButton
                      targetUserId={user.id}
                      currentUserId={currentUser?.id || ''}
                      size="sm"
                    />
                  )}
                  {!isOwnProfile && currentUser && (
                    <FollowButton
                      targetUserId={user.id}
                      currentUserId={currentUser.id}
                      size="sm"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 加载更多 */}
        {hasMore && (
          <div className="flex justify-center py-8">
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={loadingMore}
              className="px-6 py-2.5 bg-[#18181F] border border-[#2A2A36] text-[#B0B0B8] rounded-full text-sm font-medium hover:border-[#CFAF6E]/40 hover:text-[#CFAF6E] transition-colors disabled:opacity-50"
            >
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </div>
              ) : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {/* 关注者/正在关注弹窗 */}
      <AnimatePresence>
        {showFollowModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowFollowModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-[#18181F] rounded-t-2xl sm:rounded-2xl border border-[#2A2A36] max-h-[70vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-[#2A2A36]">
                <h3 className="text-white font-semibold">
                  {showFollowModal === 'followers' ? 'Followers' : 'Following'}
                </h3>
                <button
                  onClick={() => setShowFollowModal(null)}
                  className="p-1 text-[#6B6B78] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[60vh] p-4 space-y-2">
                {(showFollowModal === 'followers' ? followers : following).map(user => (
                  <Link
                    key={user.id}
                    to={`/profile/${user.username}`}
                    onClick={() => setShowFollowModal(null)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#1E1E27] transition-colors"
                  >
                    <Avatar user={user} size="sm" showBadge />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {user.display_name || user.username}
                      </p>
                      <p className="text-[#6B6B78] text-xs truncate">@{user.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
