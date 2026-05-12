import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, PlusCircle, Bell, User } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { NotificationService } from '../../services/community';
import { NotificationBadge } from '../../components/Community';
import type { Profile } from '../../supabase/types';
import { useLanguage } from '../../contexts/LanguageContext';

const navItems = [
  { path: '/', labelKey: 'nav.home', icon: Home },
  { path: '/explore', labelKey: 'nav.community', icon: Users },
  { path: '/create', labelKey: 'nav.post', icon: PlusCircle, requiresAuth: true },
  { path: '/notifications', labelKey: 'nav.alerts', icon: Bell, requiresAuth: true },
  { path: '/profile', labelKey: 'nav.me', icon: User, requiresAuth: true },
];

export default function BottomNav({ user }: { user: Profile | null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      NotificationService.getUnreadCount(user.id).then(setUnreadCount);
    } else {
      setUnreadCount(0);
    }
  }, [user, location]);

  // 处理需要登录的导航项
  const handleAuthNav = (path: string, requiresAuth: boolean) => {
    if (requiresAuth && !user) {
      // 未登录 -> 跳转到登录页并带上来源
      navigate('/login?redirect=' + encodeURIComponent(path));
      return false;
    }
    return true;
  };

  const getNavPath = (item: typeof navItems[0]) => {
    if (item.path === '/profile') {
      return user ? `/profile/${user.username}` : '/login';
    }
    return item.path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0B0E]/95 backdrop-blur-md border-t border-[#2A2A36] md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/notifications' && location.pathname.startsWith('/notifications')) ||
            (item.path === '/profile' && location.pathname.startsWith('/profile'));

          // 未登录且需要认证 -> 显示但点击跳转登录
          const needsAuth = item.requiresAuth && !user;

          const handleClick = (e: React.MouseEvent) => {
            if (needsAuth) {
              e.preventDefault();
              navigate('/login?redirect=' + encodeURIComponent(item.path));
            }
          };

          return (
            <Link
              key={item.path}
              to={needsAuth ? '#' : getNavPath(item)}
              onClick={handleClick}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
                isActive ? 'text-[#CFAF6E]' : 'text-[#6B6B78] hover:text-[#B0B0B8]'
              } ${needsAuth ? 'opacity-60' : ''}`}
            >
              {item.path === '/notifications' && unreadCount > 0 ? (
                <div className="relative">
                  <item.icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                  <NotificationBadge count={unreadCount} />
                </div>
              ) : item.path === '/create' ? (
                // 发布按钮 - 悬浮突出设计
                <div className="relative -mt-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9E2B25] to-[#CFAF6E] flex items-center justify-center shadow-lg shadow-[#9E2B25]/40 hover:shadow-[#9E2B25]/60 hover:scale-110 transition-all duration-200">
                    <item.icon size={24} strokeWidth={2} className="text-white" />
                  </div>
                </div>
              ) : (
                <item.icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              )}
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#CFAF6E]' : 'text-[#6B6B78]'}`}>
                {t(item.labelKey)}
              </span>
              {isActive && item.path !== '/create' && (
                <span className="absolute bottom-1 w-5 h-0.5 bg-[#CFAF6E] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
