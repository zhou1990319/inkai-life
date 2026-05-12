// ============================================
// InkAI 动态详情页 (PostDetail)
// 全屏作品图 + 作者信息 + 互动 + 评论
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Bookmark, Share2, MessageCircle, ArrowLeft,
  ChevronLeft, ChevronRight, MapPin, Flag, MoreHorizontal,
  Loader2, Eye
} from 'lucide-react';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import {
  Avatar, LikeButton, SaveButton, FollowButton,
  CommentItem, CommentInput, EmptyState
} from '../components/Community';
import {
  PostService, CommentService, ReportService,
  type PostWithAuthor, type CommentWithAuthor
} from '../services/community';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

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
  }, []);

  // 加载帖子
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    PostService.getPostById(id).then(data => {
      setPost(data);
      setLoading(false);
    });

    // 增加浏览数
    PostService.incrementViews(id).catch(() => {});
  }, [id]);

  // 加载评论
  useEffect(() => {
    if (!id) return;
    CommentService.getComments(id).then(setComments);
  }, [id]);

  // 点击外部关闭举报菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (reportRef.current && !reportRef.current.contains(e.target as Node)) {
        setShowReportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const imageUrls = post?.image_urls?.length
    ? post.image_urls
    : post?.image_url
    ? [post.image_url]
    : [];

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % imageUrls.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevImage();
    if (e.key === 'ArrowRight') handleNextImage();
  };

  const handleSubmitComment = async (content: string) => {
    if (!currentUser || !id) return;
    setSubmittingComment(true);
    try {
      await CommentService.createComment({
        userId: currentUser.id,
        postId: id,
        content,
        parentId: replyingTo || undefined,
      });
      setReplyingTo(null);
      // 刷新评论
      CommentService.getComments(id).then(setComments);
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleReport = async (reason: string) => {
    if (!id) return;
    await ReportService.reportPost({
      postId: id,
      reporterId: currentUser?.id,
      reason,
    });
    setShowReportMenu(false);
    alert('Thank you for your report. We will review it shortly.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#9E2B25] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center">
        <EmptyState
          icon={<MessageCircle className="w-8 h-8 text-[#6B6B78]" />}
          title="Post not found"
          description="This post may have been deleted or doesn't exist"
          action={{ label: 'Back to Community', onClick: () => navigate('/explore') }}
        />
      </div>
    );
  }

  const displayName = post.author?.display_name || post.author?.username || 'Unknown';
  const username = post.author?.username || '';

  return (
    <div
      className="min-h-screen bg-[#0B0B0E]"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* 顶部导航 */}
      <div className="sticky top-16 z-50 bg-[#0B0B0E]/95 backdrop-blur-md border-b border-[#2A2A36]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#B0B0B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex items-center gap-2">
            {/* 分享 */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-[#18181F] border border-[#2A2A36] text-[#B0B0B8] hover:text-[#CFAF6E] hover:border-[#CFAF6E]/40 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {/* 更多选项 */}
            <div className="relative" ref={reportRef}>
              <button
                onClick={() => setShowReportMenu(!showReportMenu)}
                className="p-2 rounded-xl bg-[#18181F] border border-[#2A2A36] text-[#B0B0B8] hover:text-white hover:border-[#2A2A36]/80 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showReportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-[#18181F] border border-[#2A2A36] rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <button
                      onClick={() => handleReport('spam')}
                      className="w-full px-4 py-2.5 text-left text-sm text-[#B0B0B8] hover:bg-[#1E1E27] hover:text-white transition-colors"
                    >
                      Report as Spam
                    </button>
                    <button
                      onClick={() => handleReport('inappropriate')}
                      className="w-full px-4 py-2.5 text-left text-sm text-[#B0B0B8] hover:bg-[#1E1E27] hover:text-white transition-colors"
                    >
                      Inappropriate Content
                    </button>
                    <button
                      onClick={() => handleReport('copyright')}
                      className="w-full px-4 py-2.5 text-left text-sm text-[#B0B0B8] hover:bg-[#1E1E27] hover:text-white transition-colors"
                    >
                      Copyright Issue
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr,440px] gap-6">
          {/* 左侧：作品图片 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#18181F] rounded-2xl border border-[#2A2A36] overflow-hidden"
          >
            <div className="relative bg-black flex items-center justify-center" style={{ minHeight: '60vh' }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={imageUrls[currentImageIndex]}
                  alt={post.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </AnimatePresence>

              {/* 多图导航 */}
              {imageUrls.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {imageUrls.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-[#CFAF6E] w-6' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 作品信息 */}
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {post.style && post.style.map(tag => (
                  <Link
                    key={tag}
                    to={`/explore?tag=${encodeURIComponent(tag)}`}
                    className="px-2.5 py-1 bg-[#0B0B0E] text-[#CFAF6E] text-xs rounded-full border border-[#CFAF6E]/25 hover:border-[#CFAF6E]/50 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
                {post.is_ai_generated && (
                  <span className="px-2.5 py-1 bg-[#9E2B25]/20 text-[#9E2B25] text-xs rounded-full border border-[#9E2B25]/30">
                    AI Generated
                  </span>
                )}
                {post.location && (
                  <span className="flex items-center gap-1 text-[#6B6B78] text-xs">
                    <MapPin className="w-3 h-3" />
                    {post.location}
                  </span>
                )}
              </div>

              {post.description && (
                <p className="text-[#B0B0B8] text-sm leading-relaxed">{post.description}</p>
              )}

              {/* 浏览数 */}
              <div className="flex items-center gap-1 text-[#6B6B78] text-xs">
                <Eye className="w-3 h-3" />
                {post.views_count || 0} views
              </div>
            </div>
          </motion.div>

          {/* 右侧：作者信息 + 互动 + 评论 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* 作者信息卡片 */}
            <div className="bg-[#18181F] rounded-2xl border border-[#2A2A36] p-5 space-y-4">
              <Link to={`/profile/${username}`} className="flex items-center gap-3 group">
                <Avatar user={post.author} size="lg" showBadge />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold group-hover:text-[#CFAF6E] transition-colors truncate">
                      {displayName}
                    </p>
                    {post.author?.artist_verified && (
                      <span className="flex-shrink-0 w-4 h-4 bg-[#CFAF6E] rounded-full flex items-center justify-center">
                        <span className="text-[#0B0B0E] text-[8px] font-bold">✓</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[#6B6B78] text-xs">@{username}</p>
                  {post.author?.bio && (
                    <p className="text-[#B0B0B8] text-xs mt-1 line-clamp-2">{post.author.bio}</p>
                  )}
                </div>
              </Link>

              {/* 粉丝/关注数 */}
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-white font-semibold">{post.author?.followers_count || 0}</span>
                  <span className="text-[#6B6B78] ml-1">Followers</span>
                </div>
                <div>
                  <span className="text-white font-semibold">{post.author?.following_count || 0}</span>
                  <span className="text-[#6B6B78] ml-1">Following</span>
                </div>
              </div>

              {/* 关注按钮 */}
              <FollowButton
                targetUserId={post.user_id}
                currentUserId={currentUser?.id || ''}
              />
            </div>

            {/* 互动栏 */}
            <div className="bg-[#18181F] rounded-2xl border border-[#2A2A36] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">This Post</h3>
              </div>
              <div className="flex items-center gap-3">
                <LikeButton
                  postId={post.id}
                  userId={currentUser?.id}
                  initialCount={post.likes_count || 0}
                />
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-1.5 text-[#6B6B78] hover:text-white transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments_count || 0}</span>
                </button>
                <SaveButton
                  postId={post.id}
                  userId={currentUser?.id}
                />
              </div>
            </div>

            {/* 评论区 */}
            <div id="comments" className="bg-[#18181F] rounded-2xl border border-[#2A2A36] p-5 space-y-4">
              <h3 className="text-white font-semibold">
                Comments
                <span className="text-[#6B6B78] font-normal ml-2 text-sm">({comments.length})</span>
              </h3>

              {/* 评论列表 */}
              <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin">
                {comments.length === 0 ? (
                  <p className="text-[#6B6B78] text-sm text-center py-8">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="space-y-3">
                      <CommentItem
                        comment={comment}
                        currentUserId={currentUser?.id}
                        onReply={(commentId) => {
                          setReplyingTo(commentId);
                          document.getElementById('comment-input')?.focus();
                        }}
                      />
                      {replyingTo === comment.id && (
                        <div className="ml-10">
                          <CommentInput
                            userId={currentUser?.id || ''}
                            placeholder={`Reply to @${comment.author.username}...`}
                            onSubmit={handleSubmitComment}
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* 评论输入 */}
              {currentUser ? (
                <div id="comment-input">
                  <CommentInput
                    userId={currentUser.id}
                    onSubmit={handleSubmitComment}
                  />
                </div>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <p className="text-[#6B6B78] text-sm">Sign in to leave a comment</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2 bg-[#9E2B25] text-white rounded-full text-sm font-medium hover:bg-[#B8342D] transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
