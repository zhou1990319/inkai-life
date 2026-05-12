import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, PlusCircle, Bell, User } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { NotificationService } from '../../services/community';
import { NotificationBadge } from '../../components/Community';
import type { Profile } from '../../supabase/types';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/explore', label: 'Community', icon: Users },
  { path: '/create', label: 'Post', icon: PlusCircle },
  { path: '/notifications', label: 'Alerts', icon: Bell },
  { path: '/profile', label: 'Me', icon: User },
];

export default function BottomNav({ user }: { user: Profile | null }) {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      NotificationService.getUnreadCount(user.id).then(setUnreadCount);
    } else {
      setUnreadCount(0);
    }
  }, [user, location]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0B0E]/95 backdrop-blur-md border-t border-[#2A2A36] md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          // 隐藏通知入口如果未登录
          if (item.path === '/notifications' && !user) return null;
          // 通知路径使用特殊匹配
          const isActive = location.pathname === item.path ||
            (item.path === '/notifications' && location.pathname.startsWith('/notifications')) ||
            (item.path === '/profile' && location.pathname.startsWith('/profile'));

          return (
            <Link
              key={item.path}
              to={item.path === '/profile' ? (user ? `/profile/${user.username}` : '/login') : item.path}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
                isActive ? 'text-[#CFAF6E]' : 'text-[#6B6B78] hover:text-[#B0B0B8]'
              }`}
            >
              {item.path === '/notifications' && unreadCount > 0 ? (
                <div className="relative">
                  <item.icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                  <NotificationBadge count={unreadCount} />
                </div>
              ) : item.path === '/create' ? (
                <div className="relative -mt-4">
                  <div className="w-11 h-11 rounded-full bg-[#9E2B25] flex items-center justify-center shadow-lg shadow-[#9E2B25]/30">
                    <item.icon size={22} strokeWidth={2} className="text-white" />
                  </div>
                </div>
              ) : (
                <item.icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              )}
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#CFAF6E]' : 'text-[#6B6B78]'}`}>
                {item.label}
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
