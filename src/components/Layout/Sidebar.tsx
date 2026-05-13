import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Users, Sparkles, BookOpen, Bookmark, Settings, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Sidebar() {
  const location = useLocation();
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const menuItems = [
    { icon: Home,     label: isZh ? '\u9996\u9875' : 'Home',      path: '/' },
    { icon: Users,    label: isZh ? '\u793E\u533A' : 'Community', path: '/explore' },
    { icon: BookOpen, label: isZh ? '\u53D1\u5E03' : 'Post',   path: '/create' },
    { icon: Sparkles, label: isZh ? 'AI \u5DE5\u4F5C\u5BA4' : 'AI Studio', path: '/ai-studio' },
    { icon: Bookmark, label: isZh ? '\u6536\u85CF' : 'Saved',     path: '/explore' },
  ];

  const bottomItems = [
    { icon: User,     label: isZh ? '\u4E2A\u4EBA\u8D44\u6599' : 'Profile',  path: '/profile' },
    { icon: Settings, label: isZh ? '\u8BBE\u7F6E' : 'Settings', path: '/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0B0B0E] border-r border-[#2A2A36] z-50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#2A2A36]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#18181F] border border-[#2A2A36] flex items-center justify-center group-hover:border-[#CFAF6E]/40 transition-colors">
              <span className="text-[#CFAF6E] font-bold text-base">\u58A8</span>
            </div>
            <span className="text-white font-bold tracking-widest text-sm">
              InkAI<span className="text-[#CFAF6E]">.life</span>
            </span>
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${
                  isActive
                    ? 'text-[#CFAF6E] bg-[#CFAF6E]/8 border border-[#CFAF6E]/15'
                    : 'text-[#B0B0B8] hover:text-white hover:bg-[#18181F]'
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#CFAF6E] rounded-r-full"
                  />
                )}
                <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 py-4 border-t border-[#2A2A36] space-y-0.5">
          {bottomItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[#6B6B78] hover:text-white hover:bg-[#18181F] transition-all text-sm"
            >
              <item.icon size={16} strokeWidth={1.5} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
