import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, PlusCircle, Bell, User } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { NotificationService } from '../../services/community';
import { NotificationBadge } from '../../components/Community';
import type { Profile } from '../../supabase/types';
import { useLanguage } from '../../contexts/LanguageContext';

const navItems = [
  { path: '/', labelKey: 'nav.home', icon: Home },
  { path: '/explore', labelKey: 'nav.community', icon: Compass },
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

  const getNavPath = (item: typeof navItems[0]) => {
    if (item.path === '/profile') {
      return user ? `/profile/${user.username}` : '/login';
    }
    return item.path;
  };

  const handleClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    const needsAuth = item.requiresAuth && !user;
    if (needsAuth) {
      e.preventDefault();
      navigate('/login?redirect=' + encodeURIComponent(item.path));
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 md:hidden safe-area-bottom">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/notifications' && location.pathname.startsWith('/notifications')) ||
            (item.path === '/profile' && location.pathname.startsWith('/profile'));

          const needsAuth = item.requiresAuth && !user;

          return (
            <Link
              key={item.path}
              to={needsAuth ? '#' : getNavPath(item)}
              onClick={(e) => handleClick(e, item)}
              className={`relative flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
                needsAuth ? 'opacity-40' : ''
              }`}
            >
              {item.path === '/create' ? (
                <div className="relative -mt-5">
                  <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                    <item.icon size={22} strokeWidth={2} className="text-white" />
                  </div>
                </div>
              ) : item.path === '/notifications' && unreadCount > 0 ? (
                <div className="relative">
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 2 : 1.5}
                    className={isActive ? 'text-black' : 'text-gray-400'}
                  />
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] flex items-center justify-center px-0.5 bg-black text-white text-[9px] font-bold rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </div>
              ) : (
                <item.icon
                  size={22}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={isActive ? 'text-black' : 'text-gray-400'}
                />
              )}
              <span
                className={`text-[10px] ${
                  isActive ? 'text-black font-medium' : 'text-gray-400'
                }`}
              >
                {t(item.labelKey)}
              </span>
              {isActive && item.path !== '/create' && (
                <span className="absolute bottom-0.5 w-4 h-0.5 bg-black rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
