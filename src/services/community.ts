// ============================================
// InkAI 社区服务层
// 封装所有社区相关的数据操作
// ============================================

import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import { uploadImage } from '../services/storage';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Post = Database['public']['Tables']['tattoo_posts']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];

// ============================================
// 帖子相关
// ============================================

export interface PostWithAuthor extends Post {
  author: Profile;
}

export interface FeedOptions {
  sortBy?: 'recommend' | 'latest' | 'popular';
  tag?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
}

export const PostService = {
  // 获取 Feed 流
  async getFeed(options: FeedOptions = {}): Promise<PostWithAuthor[]> {
    const { sortBy = 'recommend', tag, userId, page = 0, pageSize = 20 } = options;

    let query = supabase
      .from('tattoo_posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('visibility', 'public');

    // 标签过滤
    if (tag) {
      query = query.contains('style', [tag]);
    }

    // 用户过滤
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // 排序
    if (sortBy === 'latest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'popular') {
      query = query.order('likes_count', { ascending: false });
    } else {
      // 推荐：综合热度排序
      query = query.order('likes_count', { ascending: false });
    }

    query = query.range(page * pageSize, (page + 1) * pageSize - 1);

    const { data, error } = await query;
    if (error) throw error;
    return (data as unknown as PostWithAuthor[]) || [];
  },

  // 获取关注用户动态
  async getFollowingFeed(userId: string, page = 0, pageSize = 20): Promise<PostWithAuthor[]> {
    const { data: followingIds } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (!followingIds?.length) return [];

    const { data, error } = await supabase
      .from('tattoo_posts')
      .select(`*, author:profiles(*)`)
      .in('user_id', followingIds.map(f => f.following_id))
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) throw error;
    return (data as unknown as PostWithAuthor[]) || [];
  },

  // 获取单个帖子详情
  async getPostById(postId: string): Promise<PostWithAuthor | null> {
    const { data, error } = await supabase
      .from('tattoo_posts')
      .select(`*, author:profiles(*)`)
      .eq('id', postId)
      .single();

    if (error) return null;
    return data as unknown as PostWithAuthor;
  },

  // 创建帖子
  async createPost(params: {
    userId: string;
    title: string;
    description?: string;
    imageUrls: string[];
    style?: string[];
    bodyPart?: string;
    visibility?: 'public' | 'followers' | 'private';
    location?: string;
    isAiGenerated?: boolean;
    aiPrompt?: string;
  }): Promise<Post> {
    const { data, error } = await supabase
      .from('tattoo_posts')
      .insert({
        user_id: params.userId,
        title: params.title,
        description: params.description || null,
        image_url: params.imageUrls[0] || '',
        image_urls: params.imageUrls,
        style: params.style || [],
        body_part: params.bodyPart || null,
        visibility: params.visibility || 'public',
        location: params.location || null,
        is_ai_generated: params.isAiGenerated || false,
        ai_prompt: params.aiPrompt || null,
        likes_count: 0,
        comments_count: 0,
        saves_count: 0,
        views_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 删除帖子
  async deletePost(postId: string): Promise<void> {
    const { error } = await supabase
      .from('tattoo_posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  },

  // 更新帖子
  async updatePost(postId: string, updates: Partial<Post>): Promise<Post> {
    const { data, error } = await supabase
      .from('tattoo_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 增加浏览数
  async incrementViews(postId: string): Promise<void> {
    await supabase.rpc('increment_views', { post_id: postId }).catch(() => {
      // 如果 RPC 不存在，直接用 UPDATE
      supabase
        .from('tattoo_posts')
        .update({ views_count: supabase.rpc('increment', { x: 1 }) as unknown as number })
        .eq('id', postId);
    });
  },
};

// ============================================
// 点赞相关
// ============================================

export const LikeService = {
  async isLiked(userId: string, postId: string): Promise<boolean> {
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();
    return !!data;
  },

  async toggleLike(userId: string, postId: string): Promise<boolean> {
    const isCurrentlyLiked = await this.isLiked(userId, postId);

    if (isCurrentlyLiked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);
      // 减少计数
      await supabase
        .from('tattoo_posts')
        .update({ likes_count: supabase.rpc('decrement', { x: 1 }) as unknown as number })
        .eq('id', postId);
      return false;
    } else {
      await supabase
        .from('post_likes')
        .insert({ user_id: userId, post_id: postId });
      // 增加计数
      await supabase
        .from('tattoo_posts')
        .update({ likes_count: supabase.rpc('increment', { x: 1 }) as unknown as number })
        .eq('id', postId);

      // 发送通知
      const { data: post } = await supabase
        .from('tattoo_posts')
        .select('user_id, title')
        .eq('id', postId)
        .single();

      if (post && post.user_id !== userId) {
        await NotificationService.create({
          userId: post.user_id,
          actorId: userId,
          type: 'like',
          message: 'liked your post',
          postId,
        });
      }

      return true;
    }
  },
};

// ============================================
// 收藏相关
// ============================================

export const SaveService = {
  async isSaved(userId: string, postId: string): Promise<boolean> {
    const { data } = await supabase
      .from('post_saves')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();
    return !!data;
  },

  async toggleSave(userId: string, postId: string): Promise<boolean> {
    const isCurrentlySaved = await this.isSaved(userId, postId);

    if (isCurrentlySaved) {
      await supabase
        .from('post_saves')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);
      // 减少计数
      await supabase
        .from('tattoo_posts')
        .update({ saves_count: supabase.rpc('decrement', { x: 1 }) as unknown as number })
        .eq('id', postId);
      return false;
    } else {
      await supabase
        .from('post_saves')
        .insert({ user_id: userId, post_id: postId });
      // 增加计数
      await supabase
        .from('tattoo_posts')
        .update({ saves_count: supabase.rpc('increment', { x: 1 }) as unknown as number })
        .eq('id', postId);
      return true;
    }
  },

  async getSavedPosts(userId: string, page = 0, pageSize = 20): Promise<PostWithAuthor[]> {
    const { data, error } = await supabase
      .from('post_saves')
      .select(`post:tattoo_posts(*, author:profiles(*))`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) throw error;
    return (data?.map(d => d.post as unknown as PostWithAuthor).filter(Boolean)) || [];
  },
};

// ============================================
// 关注相关
// ============================================

export const FollowService = {
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) return false;
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    return !!data;
  },

  async toggleFollow(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) return false;

    const isCurrentlyFollowing = await this.isFollowing(followerId, followingId);

    if (isCurrentlyFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);
      return false;
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId });

      // 发送通知
      await NotificationService.create({
        userId: followingId,
        actorId: followerId,
        type: 'follow',
        message: 'started following you',
      });

      return true;
    }
  },

  async getFollowers(userId: string, page = 0, pageSize = 20): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('follows')
      .select(`follower:profiles!follows_follower_id_fkey(*)`)
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) throw error;
    return (data?.map(d => d.follower as unknown as Profile).filter(Boolean)) || [];
  },

  async getFollowing(userId: string, page = 0, pageSize = 20): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('follows')
      .select(`following:profiles!follows_following_id_fkey(*)`)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) throw error;
    return (data?.map(d => d.following as unknown as Profile).filter(Boolean)) || [];
  },
};

// ============================================
// 评论相关
// ============================================

export interface CommentWithAuthor extends Comment {
  author: Profile;
  replies?: CommentWithAuthor[];
}

export const CommentService = {
  async getComments(postId: string, page = 0, pageSize = 20): Promise<CommentWithAuthor[]> {
    // 获取顶级评论（不含 parent_id）
    const { data, error } = await supabase
      .from('comments')
      .select(`*, author:profiles(*)`)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) throw error;

    // 获取每条评论的回复
    const commentsWithReplies = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select(`*, author:profiles(*)`)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true });

        return {
          ...(comment as unknown as CommentWithAuthor),
          replies: (replies || []).map(r => r as unknown as CommentWithAuthor),
        };
      })
    );

    return commentsWithReplies;
  },

  async createComment(params: {
    userId: string;
    postId: string;
    content: string;
    parentId?: string;
  }): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: params.userId,
        post_id: params.postId,
        content: params.content,
        parent_id: params.parentId || null,
        likes_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    // 发送通知（回复评论时通知被回复者）
    if (params.parentId) {
      const { data: parentComment } = await supabase
        .from('comments')
        .select('user_id, content')
        .eq('id', params.parentId)
        .single();

      if (parentComment && parentComment.user_id !== params.userId) {
        await NotificationService.create({
          userId: parentComment.user_id,
          actorId: params.userId,
          type: 'comment',
          message: `replied to your comment: "${parentComment.content.slice(0, 30)}..."`,
          postId: params.postId,
        });
      }
    } else {
      // 新评论通知帖子作者
      const { data: post } = await supabase
        .from('tattoo_posts')
        .select('user_id, title')
        .eq('id', params.postId)
        .single();

      if (post && post.user_id !== params.userId) {
        await NotificationService.create({
          userId: post.user_id,
          actorId: params.userId,
          type: 'comment',
          message: `commented on your post: "${params.content.slice(0, 30)}..."`,
          postId: params.postId,
        });
      }
    }

    return data;
  },

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    if (error) throw error;
  },
};

// ============================================
// 通知相关
// ============================================

type NotificationType = 'like' | 'comment' | 'follow' | 'mention';

interface CreateNotificationParams {
  userId: string;
  actorId: string;
  type: NotificationType;
  message: string;
  postId?: string;
}

export const NotificationService = {
  async create(params: CreateNotificationParams): Promise<void> {
    // 检查通知设置
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', params.userId)
      .single();

    const typeMap: Record<NotificationType, keyof typeof settings | null> = {
      like: settings?.likes_notifications ? 'likes_notifications' : null,
      comment: settings?.comments_notifications ? 'comments_notifications' : null,
      follow: settings?.follows_notifications ? 'follows_notifications' : null,
      mention: settings?.mentions_notifications ? 'mentions_notifications' : null,
    };

    const settingKey = typeMap[params.type];
    if (settingKey && settings && !settings[settingKey]) return;

    await supabase.from('notifications').insert({
      user_id: params.userId,
      actor_id: params.actorId,
      type: params.type,
      message: params.message,
      post_id: params.postId || null,
      is_read: false,
    });
  },

  async getNotifications(userId: string, page = 0, pageSize = 30): Promise<Array<Database['public']['Tables']['notifications']['Row'] & { actor: Profile }>> {
    const { data, error } = await supabase
      .from('notifications')
      .select(`*, actor:profiles(*)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) throw error;
    return (data as unknown as Array<Database['public']['Tables']['notifications']['Row'] & { actor: Profile }>) || [];
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) return 0;
    return count || 0;
  },

  async markAllAsRead(userId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  },

  async markAsRead(notificationId: string): Promise<void> {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  },
};

// ============================================
// 搜索相关
// ============================================

export const SearchService = {
  async searchPosts(query: string, page = 0, pageSize = 20): Promise<PostWithAuthor[]> {
    const { data, error } = await supabase
      .from('tattoo_posts')
      .select(`*, author:profiles(*)`)
      .eq('visibility', 'public')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('likes_count', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) throw error;
    return (data as unknown as PostWithAuthor[]) || [];
  },

  async searchUsers(query: string, page = 0, pageSize = 20): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) throw error;
    return data || [];
  },

  async searchByTag(tag: string, page = 0, pageSize = 20): Promise<PostWithAuthor[]> {
    return PostService.getFeed({ tag, sortBy: 'popular', page, pageSize });
  },
};

// ============================================
// 标签相关
// ============================================

export const TagService = {
  async getTrendingTags(limit = 10): Promise<Array<Database['public']['Tables']['post_tags']['Row']>> {
    const { data, error } = await supabase
      .from('post_tags')
      .select('*')
      .order('posts_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getFeaturedTags(): Promise<Array<Database['public']['Tables']['post_tags']['Row']>> {
    const { data, error } = await supabase
      .from('post_tags')
      .select('*')
      .eq('is_featured', true)
      .order('posts_count', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getOrCreateTag(tag: string): Promise<string> {
    const cleanTag = tag.replace(/^#/, '').trim().toLowerCase();

    const { data: existing } = await supabase
      .from('post_tags')
      .select('id')
      .eq('tag', cleanTag)
      .single();

    if (existing) return existing.id;

    const { data: newTag } = await supabase
      .from('post_tags')
      .insert({ tag: cleanTag, description: null, posts_count: 0 })
      .select('id')
      .single();

    return newTag?.id || '';
  },
};

// ============================================
// 举报相关
// ============================================

export const ReportService = {
  async reportPost(params: {
    postId: string;
    reporterId?: string;
    reason: string;
    description?: string;
  }): Promise<void> {
    await supabase.from('post_reports').insert({
      post_id: params.postId,
      reporter_id: params.reporterId || null,
      reason: params.reason,
      description: params.description || null,
    });
  },
};

// ============================================
// 用户资料相关（扩展）
// ============================================

export const ProfileService = {
  async getUserByUsername(username: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    if (error) return null;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const avatarUrl = await uploadImage(file, 'tattoo-images', `avatars/${userId}`);
    await this.updateProfile(userId, { avatar_url: avatarUrl });
    return avatarUrl;
  },
};
