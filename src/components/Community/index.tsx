// ============================================
// InkAI 社区可复用组件库
// 暗黑国风配色 + 统一交互规范
// ============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Bookmark, Share2, MoreHorizontal,
  Send, ChevronDown, X, Loader2, UserPlus, UserCheck,
  Bell, Search, Image as ImageIcon, MapPin, Globe, Users,
  Eye, ThumbsUp, BookmarkCheck
} from 'lucide-react';
import { LikeService, SaveService, FollowService } from '../../services/community';
import type { Profile, PostWithAuthor } from '../../services/community';

// ============================================
// Avatar 组件
// ============================================
interface AvatarProps {
  user?: Profile | null;
  username?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

export function Avatar({ user, username, size = 'md', showBadge }: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const name = user?.display_name || user?.username || username || 'U';
  const seed = user?.username || username || name;
  const avatarUrl = user?.avatar_url;
  const fallbackUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

  return (
    <div className="relative flex-shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-[#2A2A36] transition-colors hover:border-[#CFAF6E]/40`}
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackUrl; }}
        />
      ) : (
        <img
          src={fallbackUrl}
          alt={name}
          className={`${sizeClasses[size]} rounded-full border-2 border-[#2A2A36]`}
        />
      )}
      {showBadge && user?.is_artist && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#CFAF6E] rounded-full border-2 border-[#0B0B0E]" />
      )}
    </div>
  );
}

// ============================================
// SkeletonCard 骨架屏
// ============================================
export function SkeletonCard({ aspectRatio = '1/1' }: { aspectRatio?: string }) {
  return (
    <div className="bg-[#18181F] rounded-xl border border-[#2A2A36] overflow-hidden">
      <div className="bg-[#1E1E27] animate-pulse" style={{ aspectRatio }} />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1E1E27] animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-20 bg-[#1E1E27] rounded animate-pulse" />
            <div className="h-2 w-12 bg-[#1E1E27] rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TagBadge 标签组件
// ============================================
interface TagBadgeProps {
  tag: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function TagBadge({ tag, count, active, onClick, size = 'sm' }: TagBadgeProps) {
  const baseClasses = size === 'sm'
    ? 'px-2.5 py-1 text-xs'
    : 'px-3 py-1.5 text-sm';

  return (
    <button
      onClick={onClick}
      className={`
        ${baseClasses} rounded-full font-medium transition-all duration-200
        flex items-center gap-1.5 whitespace-nowrap
        ${active
          ? 'bg-[#9E2B25] text-white border border-[#9E2B25]'
          : 'bg-[#18181F] text-[#B0B0B8] border border-[#2A2A36] hover:border-[#CFAF6E]/40 hover:text-[#CFAF6E]'
        }
      `}
    >
      #{tag}
      {count !== undefined && (
        <span className={`text-[10px] ${active ? 'text-white/70' : 'text-[#6B6B78]'}`}>
          {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </button>
  );
}

// ============================================
// LikeButton 点赞按钮
// ============================================
interface LikeButtonProps {
  postId: string;
  userId?: string;
  initialLiked?: boolean;
  initialCount?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
  onToggle?: (liked: boolean) => void;
}

export function LikeButton({
  postId,
  userId,
  initialLiked = false,
  initialCount = 0,
  size = 'md',
  showCount = true,
  onToggle,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!userId) return;
    if (loading) return;

    setLoading(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      await LikeService.toggleLike(userId, postId);
      onToggle?.(newLiked);
    } catch {
      setLiked(!newLiked);
      setCount(prev => newLiked ? prev - 1 : prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = size === 'sm' ? 'gap-1 text-xs' : 'gap-1.5 text-sm';

  return (
    <button
      onClick={handleToggle}
      disabled={!userId}
      className={`flex items-center ${sizeClasses} transition-colors duration-200 disabled:cursor-not-allowed ${liked ? 'text-[#9E2B25]' : 'text-[#6B6B78] hover:text-[#9E2B25]'}`}
    >
      <motion.div
        animate={liked ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${liked ? 'fill-current' : ''}`} />
      </motion.div>
      {showCount && <span>{count > 999 ? `${(count / 1000).toFixed(1)}k` : count}</span>}
    </button>
  );
}

// ============================================
// SaveButton 收藏按钮
// ============================================
interface SaveButtonProps {
  postId: string;
  userId?: string;
  initialSaved?: boolean;
  size?: 'sm' | 'md';
}

export function SaveButton({ postId, userId, initialSaved = false, size = 'md' }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!userId) return;
    if (loading) return;

    setLoading(true);
    const newSaved = !saved;
    setSaved(newSaved);

    try {
      await SaveService.toggleSave(userId, postId);
    } catch {
      setSaved(!newSaved);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={!userId}
      className={`transition-colors duration-200 disabled:cursor-not-allowed ${saved ? 'text-[#CFAF6E]' : 'text-[#6B6B78] hover:text-[#CFAF6E]'}`}
    >
      <motion.div
        animate={saved ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {saved
          ? <BookmarkCheck className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
          : <Bookmark className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
        }
      </motion.div>
    </button>
  );
}

// ============================================
// FollowButton 关注按钮
// ============================================
interface FollowButtonProps {
  targetUserId: string;
  currentUserId?: string;
  initialFollowing?: boolean;
  size?: 'sm' | 'md';
  onToggle?: (following: boolean) => void;
}

export function FollowButton({
  targetUserId,
  currentUserId,
  initialFollowing = false,
  size = 'sm',
  onToggle,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      FollowService.isFollowing(currentUserId, targetUserId).then(setFollowing);
    }
  }, [currentUserId, targetUserId]);

  const handleToggle = async () => {
    if (!currentUserId) return;
    if (loading) return;

    setLoading(true);
    const newFollowing = !following;
    setFollowing(newFollowing);

    try {
      await FollowService.toggleFollow(currentUserId, targetUserId);
      onToggle?.(newFollowing);
    } catch {
      setFollowing(!newFollowing);
    } finally {
      setLoading(false);
    }
  };

  if (currentUserId === targetUserId) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={!currentUserId || loading}
      className={`
        flex items-center gap-1.5 rounded-full font-medium transition-all duration-200
        disabled:cursor-not-allowed disabled:opacity-50
        ${following
          ? 'bg-[#18181F] text-[#B0B0B8] border border-[#2A2A36] hover:border-[#9E2B25]/50 hover:text-[#9E2B25] px-3 py-1 text-xs'
          : 'bg-[#9E2B25] text-white hover:bg-[#B8342D] px-3 py-1 text-xs'
        }
        ${size === 'md' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs'}
      `}
    >
      {following ? (
        <>
          <UserCheck className="w-3 h-3" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-3 h-3" />
          Follow
        </>
      )}
    </button>
  );
}

// ============================================
// PostCard 帖子卡片
// ============================================
interface PostCardProps {
  post: PostWithAuthor;
  currentUserId?: string;
  onImageClick?: (post: PostWithAuthor) => void;
}

export function PostCard({ post, currentUserId, onImageClick }: PostCardProps) {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageUrls = post.image_urls?.length ? post.image_urls : [post.image_url].filter(Boolean);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % imageUrls.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const handleCardClick = () => {
    if (onImageClick) {
      onImageClick(post);
    } else {
      navigate(`/post/${post.id}`);
    }
  };

  const displayName = post.author?.display_name || post.author?.username || 'Unknown';
  const username = post.author?.username || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#18181F] rounded-xl border border-[#2A2A36] overflow-hidden hover:border-[#9E2B25]/40 transition-all duration-300 group cursor-pointer"
    >
      {/* 作品图片区域 */}
      <div
        className="relative bg-[#1E1E27] overflow-hidden"
        style={{ aspectRatio: '1/1' }}
        onClick={handleCardClick}
      >
        <img
          src={imageUrls[currentImageIndex]}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* 多图指示器 */}
        {imageUrls.length > 1 && (
          <>
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
              {currentImageIndex + 1}/{imageUrls.length}
            </div>
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronDown className="w-4 h-4 text-white rotate-90" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronDown className="w-4 h-4 text-white -rotate-90" />
                </button>
              </>
            )}
          </>
        )}

        {/* AI生成标识 */}
        {post.is_ai_generated && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#9E2B25]/80 text-white text-[10px] rounded-full backdrop-blur-sm">
            AI Generated
          </div>
        )}
      </div>

      {/* 帖子信息 */}
      <div className="p-3 space-y-3">
        {/* 作者信息 */}
        <Link
          to={`/profile/${username}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 group/user"
        >
          <Avatar user={post.author} size="sm" showBadge />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate group-hover/user:text-[#CFAF6E] transition-colors">
              {displayName}
            </p>
          </div>
        </Link>

        {/* 标题 */}
        {post.title && (
          <p className="text-sm font-medium text-white/90 line-clamp-2">{post.title}</p>
        )}

        {/* 标签 */}
        {post.style && post.style.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.style.slice(0, 3).map(tag => (
              <Link
                key={tag}
                to={`/explore?tag=${encodeURIComponent(tag)}`}
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-0.5 bg-[#0B0B0E]/80 text-[#CFAF6E] text-[10px] rounded-full border border-[#CFAF6E]/25 hover:border-[#CFAF6E]/50 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* 互动栏 */}
        <div className="flex items-center justify-between pt-1 border-t border-[#2A2A36]/50">
          <div className="flex items-center gap-4">
            <LikeButton
              postId={post.id}
              userId={currentUserId}
              initialLiked={false}
              initialCount={post.likes_count || 0}
              size="sm"
            />
            <Link
              to={`/post/${post.id}#comments`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[#6B6B78] hover:text-white transition-colors text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count || 0}</span>
            </Link>
          </div>
          <SaveButton
            postId={post.id}
            userId={currentUserId}
            size="sm"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// CommentItem 评论项
// ============================================
interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    likes_count: number;
    author: Profile;
    replies?: Array<{
      id: string;
      content: string;
      created_at: string;
      likes_count: number;
      author: Profile;
    }>;
  };
  currentUserId?: string;
  onReply?: (commentId: string) => void;
}

export function CommentItem({ comment, currentUserId, onReply }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const replyRef = useRef<HTMLInputElement>(null);

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar user={comment.author} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">
              {comment.author.display_name || comment.author.username}
            </span>
            <span className="text-xs text-[#6B6B78]">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-[#B0B0B8] leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-[#9E2B25]' : 'text-[#6B6B78] hover:text-[#9E2B25]'}`}
            >
              <Heart className={`w-3 h-3 ${liked ? 'fill-current' : ''}`} />
              {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
            </button>
            {currentUserId && (
              <button
                onClick={() => {
                  onReply?.(comment.id);
                  replyRef.current?.focus();
                }}
                className="text-xs text-[#6B6B78] hover:text-[#CFAF6E] transition-colors"
              >
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 回复列表 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-10 space-y-3">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-[#CFAF6E] hover:text-[#E0C580] transition-colors"
          >
            {showReplies ? 'Hide' : `View ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
          </button>
          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {comment.replies.map(reply => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar user={reply.author} size="xs" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-white">
                          {reply.author.display_name || reply.author.username}
                        </span>
                        <span className="text-[10px] text-[#6B6B78]">{timeAgo(reply.created_at)}</span>
                      </div>
                      <p className="text-xs text-[#B0B0B8]">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ============================================
// CommentInput 评论输入框
// ============================================
interface CommentInputProps {
  userId: string;
  placeholder?: string;
  onSubmit: (content: string) => Promise<void>;
  autoFocus?: boolean;
}

export function CommentInput({ userId, placeholder = 'Add a comment...', onSubmit, autoFocus }: CommentInputProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={1}
          className="w-full bg-[#1E1E27] border border-[#2A2A36] rounded-xl px-4 py-3 text-sm text-white placeholder-[#6B6B78] resize-none focus:border-[#CFAF6E]/50 focus:outline-none transition-colors"
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
          }}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={!content.trim() || submitting}
        className="flex-shrink-0 p-3 rounded-xl bg-[#9E2B25] text-white hover:bg-[#B8342D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

// ============================================
// ImageUploader 图片上传器
// ============================================
interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  userId?: string;
}

export function ImageUploader({ images, onChange, maxImages = 9, userId }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !userId) return;
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large (max 10MB)`);
          continue;
        }
        const url = await uploadImage(file, 'tattoo-images', `posts/${userId}`);
        newUrls.push(url);
      }
      onChange([...images, ...newUrls]);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* 已上传图片预览 */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative aspect-square bg-[#1E1E27] rounded-xl overflow-hidden border border-[#2A2A36]">
              <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded backdrop-blur-sm">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${dragOver ? 'border-[#CFAF6E] bg-[#CFAF6E]/5' : 'border-[#2A2A36] hover:border-[#CFAF6E]/40'}
            ${uploading ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-[#CFAF6E] animate-spin" />
              <p className="text-sm text-[#6B6B78]">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8 text-[#6B6B78]" />
              <p className="text-sm text-[#B0B0B8]">
                Click or drag to upload images
              </p>
              <p className="text-xs text-[#6B6B78]">
                {images.length}/{maxImages} images · Max 10MB each
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// NotificationBadge 通知红点
// ============================================
interface NotificationBadgeProps {
  count: number;
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-[#9E2B25] text-white text-[10px] font-bold rounded-full shadow-lg">
      {count > 99 ? '99+' : count}
    </span>
  );
}

// ============================================
// EmptyState 空态组件
// ============================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-[#18181F] border border-[#2A2A36] flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#6B6B78] max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-[#9E2B25] text-white rounded-full font-medium hover:bg-[#B8342D] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ============================================
// VisibilitySelector 可见性选择器
// ============================================
interface VisibilitySelectorProps {
  value: 'public' | 'followers' | 'private';
  onChange: (value: 'public' | 'followers' | 'private') => void;
}

export function VisibilitySelector({ value, onChange }: VisibilitySelectorProps) {
  const options = [
    { value: 'public', label: 'Public', icon: Globe, desc: 'Anyone can see this post' },
    { value: 'followers', label: 'Followers Only', icon: Users, desc: 'Only your followers can see' },
    { value: 'private', label: 'Private', icon: X, desc: 'Only you can see' },
  ] as const;

  return (
    <div className="space-y-2">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
            ${value === option.value
              ? 'border-[#CFAF6E]/50 bg-[#CFAF6E]/5'
              : 'border-[#2A2A36] hover:border-[#2A2A36]/80'
            }
          `}
        >
          <option.icon className={`w-5 h-5 ${value === option.value ? 'text-[#CFAF6E]' : 'text-[#6B6B78]'}`} />
          <div>
            <p className={`text-sm font-medium ${value === option.value ? 'text-white' : 'text-[#B0B0B8]'}`}>
              {option.label}
            </p>
            <p className="text-xs text-[#6B6B78]">{option.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ============================================
// SearchBar 搜索栏
// ============================================
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, onSearch, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B78]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch(value)}
        placeholder={placeholder}
        className="w-full bg-[#18181F] border border-[#2A2A36] rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#6B6B78] focus:border-[#CFAF6E]/50 focus:outline-none transition-colors"
      />
    </div>
  );
}
