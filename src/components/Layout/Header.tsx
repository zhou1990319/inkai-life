import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, User, Crown, Globe } from 'lucide-react';
import { supabase } from '../../supabase/client';
import type { Profile } from '../../supabase/types';
import { useLanguage, LANGUAGES, type Language } from '../../contexts/LanguageContext';

export default function Header({ user }: { user: Profile | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isArtist, setIsArtist] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, currentLanguage, t } = useLanguage();

  const navItems = [
    { path: '/', labelKey: 'nav.home' },
    { path: '/explore', labelKey: 'nav.community' },
    { path: '/inspire', labelKey: 'nav.inspire' },
    { path: '/blog', labelKey: 'nav.blog' },
    { path: '/pricing', labelKey: 'nav.pricing' },
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
      }
    };
    checkUserStatus();
  }, [location, user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
      isScrolled ? 'border-b border-gray-200 shadow-sm' : ''
    }`}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center">
              <span className="text-white font-bold text-xl">墨</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight text-black">
              InkAI
            </span>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-black'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* 右侧操作区 */}
          <div className="hidden md:flex items-center space-x-6">
            {/* 语言切换 */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLanguage.flag}</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id as Language);
                        setIsLangOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-sm ${
                        language === lang.id ? 'text-black font-medium' : 'text-gray-500'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isLangOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
            )}

            {/* 会员按钮 */}
            {currentPlan === 'free' && (
              <Link
                to="/pricing"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium hover:shadow-[0_0_0_2px_#D4AF37] transition-all"
              >
                <Crown className="w-4 h-4" />
                <span>{t('nav.upgrade')}</span>
              </Link>
            )}

            {/* 通知/登录 */}
            {user ? (
              <Link
                to="/notifications"
                className="relative p-2 text-gray-500 hover:text-black transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-black text-white text-[10px] font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 bg-black text-white text-sm font-medium hover:shadow-[0_0_0_2px_#D4AF37] transition-all"
              >
                {t('nav.sign_in')}
              </Link>
            )}
            
            {/* 用户头像 */}
            {user && (
              <Link
                to={`/profile/${user.username}`}
                className="w-10 h-10 bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </Link>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-black transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 移动端菜单 - 仅显示语言切换和额外操作 */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <nav className="px-6 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-3 text-sm font-medium transition-colors ${
                    isActive ? 'text-black' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}

            {/* 语言切换 - 网格布局 */}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <div className="text-xs text-gray-400 mb-3">Language</div>
              <div className="grid grid-cols-4 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setLanguage(lang.id as Language);
                      setIsMenuOpen(false);
                    }}
                    className={`px-2 py-2 text-xs text-center transition-colors rounded ${
                      language === lang.id
                        ? 'bg-black text-white'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {lang.flag}
                  </button>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
              {currentPlan === 'free' && (
                <Link
                  to="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-3 text-center bg-black text-white text-sm font-medium"
                >
                  {t('nav.upgrade')}
                </Link>
              )}
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-3 text-center border border-black text-black text-sm font-medium"
                >
                  {t('nav.sign_in')}
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
