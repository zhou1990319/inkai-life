// ============================================
// InkAI 通知中心 (Notifications)
// 点赞/评论/关注/@通知，未读红点，时间线
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell, Heart, MessageCircle, UserPlus, AtSign,
  CheckCheck, Loader2, Eye, ArrowLeft
} from 'lucide-react';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import { Avatar, EmptyState } from '../components/Community';
import { NotificationService } from '../services/community';
import { useLanguage } from '../contexts/LanguageContext';

type Notification = Database['public']['Tables']['notifications']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type NotificationType = 'like' | 'comment' | 'follow' | 'mention';

const NOTIFICATION_CONFIG: Record<NotificationType, {
  icon: typeof Heart;
  iconBg: string;
  iconColor: string;
}> = {
  like: { icon: Heart, iconBg: 'bg-[#9E2B25]/20', iconColor: 'text-[#9E2B25]' },
  comment: { icon: MessageCircle, iconBg: 'bg-[#CFAF6E]/20', iconColor: 'text-[#CFAF6E]' },
  follow: { icon: UserPlus, iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
  mention: { icon: AtSign, iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400' },
};

export default function Notifications() {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [notifications, setNotifications] = useState<Array<Notification & { actor: Profile }>>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const PAGE_SIZE = 30;

  // 检查登录
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (!data) navigate('/login');
            setCurrentUser(data);
          });
      } else {
        navigate('/login');
      }
    });
  }, []);

  // 加载通知
  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    NotificationService.getNotifications(currentUser.id, 0, PAGE_SIZE)
      .then(data => {
        setNotifications(data);
        setHasMore(data.length === PAGE_SIZE);
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const loadMore = async () => {
    if (!currentUser || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const data = await NotificationService.getNotifications(currentUser.id, nextPage, PAGE_SIZE);
    setNotifications(prev => [...prev, ...data]);
    setHasMore(data.length === PAGE_SIZE);
    setPage(nextPage);
    setLoadingMore(false);
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    setMarkingAllRead(true);
    await NotificationService.markAllAsRead(currentUser.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setMarkingAllRead(false);
  };

  const markAsRead = async (notificationId: string) => {
    await NotificationService.markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return isZh ? '刚刚' : 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return isZh ? `${minutes}分钟前` : `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return isZh ? `${hours}小时前` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return isZh ? `${days}天前` : `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification & { actor: Profile }) => {
    markAsRead(notification.id);
    if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    } else if (notification.actor_id) {
      navigate(`/profile/${notification.actor.username}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#0B0B0E]">
      {/* 顶部导航 */}
      <div className="sticky top-16 z-40 bg-[#0B0B0E]/95 backdrop-blur-md border-b border-[#2A2A36]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-[#B0B0B8] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-white font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#CFAF6E]" />
              {t('notifications.title')}
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#9E2B25] text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[#CFAF6E] text-sm hover:bg-[#CFAF6E]/10 rounded-lg transition-colors disabled:opacity-50"
            >
              {markingAllRead ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
              {t('notifications.mark_all_read')}
            </button>
          )}
        </div>
      </div>

      {/* 通知列表 */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#9E2B25] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-8 h-8 text-[#6B6B78]" />}
            title={t('notifications.no_notifications')}
            description={isZh ? '当有人点赞、评论或关注你时，你会在这里看到' : "When someone likes, comments, or follows you, you'll see it here"}
          />
        ) : (
          <div className="space-y-1">
            {notifications.map((notification, index) => {
              const config = NOTIFICATION_CONFIG[notification.type as NotificationType] || NOTIFICATION_CONFIG.like;
              const Icon = config.icon;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all
                    ${!notification.is_read
                      ? 'bg-[#18181F] border border-[#9E2B25]/20 hover:border-[#9E2B25]/30'
                      : 'hover:bg-[#18181F]/50'
                    }
                  `}
                >
                  {/* 未读指示器 */}
                  {!notification.is_read && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#9E2B25] rounded-full" />
                  )}

                  {/* 头像 */}
                  <Link
                    to={`/profile/${notification.actor?.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="relative flex-shrink-0"
                  >
                    <Avatar user={notification.actor} size="md" showBadge />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${config.iconBg} rounded-full flex items-center justify-center`}>
                      <Icon className={`w-2.5 h-2.5 ${config.iconColor}`} />
                    </div>
                  </Link>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">
                      <Link
                        to={`/profile/${notification.actor?.username}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-white hover:text-[#CFAF6E] transition-colors"
                      >
                        {notification.actor?.display_name || notification.actor?.username || (isZh ? '某人' : 'Someone')}
                      </Link>
                      {' '}
                      <span className="text-[#B0B0B8]">{notification.message}</span>
                    </p>
                    <p className="text-[#6B6B78] text-xs mt-1">{timeAgo(notification.created_at || '')}</p>
                  </div>

                  {/* 查看按钮 */}
                  {notification.post_id && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-[#1E1E27]">
                      <Eye className="w-4 h-4 text-[#6B6B78] m-auto mt-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* 加载更多 */}
            {hasMore && (
              <div className="flex justify-center py-6">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 bg-[#18181F] border border-[#2A2A36] text-[#B0B0B8] rounded-full text-sm font-medium hover:border-[#CFAF6E]/40 hover:text-[#CFAF6E] transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('common.loading')}...
                    </div>
                  ) : t('explore.load_more')}
                </button>
              </div>
            )}

            {!hasMore && notifications.length > 0 && (
              <p className="text-center text-[#6B6B78] text-sm py-6">
                {isZh ? '已全部查看！' : "You're all caught up!"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
