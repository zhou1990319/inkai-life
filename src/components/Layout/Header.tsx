import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Bell, User, Crown, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabase/client';
import { NotificationService } from '../../services/community';
import { NotificationBadge } from '../../components/Community';
import type { Profile } from '../../supabase/types';
import { useLanguage, LANGUAGES, type Language } from '../../contexts/LanguageContext';

export default function Header({ user }: { user: Profile | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isArtist, setIsArtist] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, currentLanguage, t } = useLanguage();

  // 导航项配置
  const navItems = [
    { path: '/', labelKey: 'nav.home', icon: 'fa-home' },
    { path: '/explore', labelKey: 'nav.community', icon: 'fa-users' },
    { path: '/inspire', labelKey: 'nav.inspire', icon: 'fa-lightbulb' },
    { path: '/explore', labelKey: 'nav.artists', icon: 'fa-paint-brush' },
  ];

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_artist, current_plan')
          .eq('id', session.user.id)
          .single();
        setIsArtist(data?.is_artist || false);
        setCurrentPlan(data?.current_plan || 'free');
        // 加载未读通知数
        NotificationService.getUnreadCount(session.user.id).then(setUnreadCount);
      } else {
        setUnreadCount(0);
      }
    };
    checkUserStatus();
  }, [location, user]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0E]/95 backdrop-blur-md border-b border-[#2A2A36]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#18181F] border border-[#2A2A36] flex items-center justify-center group-hover:border-[#CFAF6E]/50 transition-colors">
              <span className="text-[#CFAF6E] font-bold text-base leading-none">墨</span>
            </div>
            <span className="text-lg font-bold text-white tracking-widest">
              InkAI<span className="text-[#CFAF6E]">.life</span>
            </span>
          </Link>

          {/* PC Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm ${
                    isActive
                      ? 'text-[#CFAF6E] bg-[#CFAF6E]/8 border border-[#CFAF6E]/20'
                      : 'text-[#B0B0B8] hover:text-white hover:bg-[#18181F]'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} text-xs`} />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* PC Right */}
          <div className="hidden md:flex items-center space-x-3">
            {/* 语言选择器 */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181F] border border-[#2A2A36] text-[#B0B0B8] hover:text-white hover:border-[#CFAF6E]/50 transition-all text-sm"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLanguage.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* 语言下拉菜单 */}
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-[#18181F] border border-[#2A2A36] rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => {
                          setLanguage(lang.id as Language);
                          setIsLangOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-[#2A2A36] transition-colors ${
                          language === lang.id ? 'bg-[#CFAF6E]/10 text-[#CFAF6E]' : 'text-[#B0B0B8]'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <div>
                          <div className="text-sm font-medium">{lang.nativeName}</div>
                          <div className="text-xs text-[#6B6B78]">{lang.name}</div>
                        </div>
                        {language === lang.id && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-[#CFAF6E]" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 点击外部关闭下拉菜单 */}
            {isLangOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsLangOpen(false)}
              />
            )}

            {/* 会员按钮 */}
            <Link
              to="/pricing"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentPlan === 'free'
                  ? 'bg-[#CFAF6E] text-[#0B0B0E] hover:bg-[#E0C580]'
                  : currentPlan === 'lifetime'
                  ? 'bg-[#CFAF6E] text-[#0B0B0E]'
                  : 'bg-[#9E2B25]/20 text-[#CFAF6E] border border-[#9E2B25]/30'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>
                {currentPlan === 'free' ? t('nav.upgrade') : currentPlan === 'monthly' ? t('pricing.monthly') : currentPlan === 'yearly' ? t('pricing.yearly') : 'VIP'}
              </span>
            </Link>

            {!isArtist && (
              <Link
                to="/artist-apply"
                className="px-4 py-1.5 bg-[#9E2B25] text-white text-sm font-semibold rounded-full hover:bg-[#B8342D] transition-colors flex items-center gap-1.5"
              >
                <i className="fa-solid fa-paint-brush text-xs" />
                <span>{t('nav.apply_artist')}</span>
              </Link>
            )}

            {user ? (
              <Link
                to="/notifications"
                className="relative p-2 text-[#6B6B78] hover:text-[#CFAF6E] transition-colors"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center px-1 bg-[#9E2B25] text-white text-[10px] font-bold rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 bg-[#9E2B25] text-white text-sm font-semibold rounded-full hover:bg-[#B8342D] transition-colors"
              >
                {t('nav.sign_in')}
              </Link>
            )}
            {user && (
              <Link
                to={`/profile/${user.username}`}
                className="w-8 h-8 rounded-full bg-[#18181F] border border-[#2A2A36] flex items-center justify-center hover:border-[#CFAF6E]/40 transition-colors overflow-hidden"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-[#B0B0B8]" />
                )}
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[#B0B0B8] hover:text-[#CFAF6E] transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0B0B0E] border-t border-[#2A2A36]"
          >
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                      isActive
                        ? 'text-[#CFAF6E] bg-[#CFAF6E]/8 border border-[#CFAF6E]/15'
                        : 'text-[#B0B0B8] hover:text-white hover:bg-[#18181F]'
                    }`}
                  >
                    <i className={`fa-solid ${item.icon} w-4 text-center`} />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                );
              })}
              {/* 移动端语言选择 */}
              <div className="pt-3 pb-1 border-t border-[#2A2A36]">
                <div className="text-xs text-[#6B6B78] mb-2 px-4">Language / 语言</div>
                <div className="grid grid-cols-3 gap-2 px-4">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id as Language);
                        setIsMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                        language === lang.id
                          ? 'bg-[#CFAF6E]/20 text-[#CFAF6E] border border-[#CFAF6E]/30'
                          : 'bg-[#18181F] text-[#B0B0B8] border border-[#2A2A36]'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="truncate">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#2A2A36] flex gap-2">
                <Link
                  to="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 py-2.5 text-center bg-[#CFAF6E] text-[#0B0B0E] text-sm font-bold rounded-xl"
                >
                  {t('nav.upgrade')}
                </Link>
                {!isArtist && (
                  <Link
                    to="/artist-apply"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 py-2.5 text-center bg-[#9E2B25] text-white text-sm font-semibold rounded-xl"
                  >
                    {t('nav.apply_artist')}
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
