import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, User, Crown, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabase/client';
import { NotificationService } from '../../services/community';
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
        NotificationService.getUnreadCount(session.user.id).then(setUnreadCount);
      } else {
        setUnreadCount(0);
      }
    };
    checkUserStatus();
  }, [location, user]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-xuan-black/90 backdrop-blur-xl border-b border-liujin-gold/20 shadow-glass">
      {/* 鎏金顶部分割线 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-liujin-gold/40 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          {/* Logo - 鎏金渐变 */}
          <Link to="/" className="flex items-center space-x-3 group cloud-pattern">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-liujin-gold to-liujin-gold-dark flex items-center justify-center shadow-gold-glow group-hover:shadow-gold-glow-lg transition-all duration-300 relative overflow-hidden">
              {/* 内部光效 */}
              <div className="absolute inset-0 bg-gradient-to-br from-liujin-gold-light/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xuan-black font-bold text-xl relative z-10">墨</span>
            </div>
            <span className="text-2xl font-display font-bold tracking-wider text-liujin-gradient">
              InkAI
            </span>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center space-x-2 text-sm font-medium backdrop-blur-md ${
                    isActive
                      ? 'bg-zhusha-red/15 text-liujin-gold border border-liujin-gold/40 shadow-gold-glow-sm'
                      : 'text-rice-paper/70 hover:text-liujin-gold hover:bg-white/5 hover:border-liujin-gold/30 border border-transparent'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} text-xs`} />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* 右侧操作区 */}
          <div className="hidden md:flex items-center space-x-4">
            {/* 语言切换 */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-xuan-black-50/50 backdrop-blur-md border border-liujin-gold/15 text-rice-paper/70 hover:text-liujin-gold hover:border-liujin-gold/35 transition-all text-sm"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLanguage.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-xuan-black/95 backdrop-blur-xl border border-liujin-gold/25 rounded-xl shadow-glass-lg overflow-hidden z-50"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => {
                          setLanguage(lang.id as Language);
                          setIsLangOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-zhusha-red/15 transition-colors ${
                          language === lang.id ? 'bg-liujin-gold/10 text-liujin-gold' : 'text-rice-paper/70'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <div>
                          <div className="text-sm font-medium">{lang.nativeName}</div>
                          <div className="text-xs text-rice-paper/40">{lang.name}</div>
                        </div>
                        {language === lang.id && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-liujin-gold shadow-gold-glow-sm" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isLangOpen && (
              <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
            )}

            {/* 会员按钮 */}
            <Link
              to="/pricing"
              className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                currentPlan === 'free'
                  ? 'bg-gradient-to-r from-liujin-gold to-liujin-gold-dark text-xuan-black hover:shadow-gold-glow'
                  : currentPlan === 'lifetime'
                  ? 'bg-gradient-to-r from-liujin-gold to-liujin-gold-dark text-xuan-black shadow-gold-glow-sm'
                  : 'bg-zhusha-red/20 text-liujin-gold border border-zhusha-red/40'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>
                {currentPlan === 'free' ? t('nav.upgrade') : currentPlan === 'monthly' ? t('pricing.monthly') : currentPlan === 'yearly' ? t('pricing.yearly') : 'VIP'}
              </span>
            </Link>

            {/* 申请成为艺术家按钮 */}
            {!isArtist && (
              <Link
                to="/artist-apply"
                className="px-5 py-2 bg-gradient-to-r from-zhusha-red to-zhusha-red-dark text-white text-sm font-bold rounded-full hover:from-zhusha-red-light hover:to-zhusha-red transition-all flex items-center gap-2 shadow-red-glow"
              >
                <i className="fa-solid fa-paint-brush text-xs" />
                <span>{t('nav.apply_artist')}</span>
              </Link>
            )}

            {/* 通知/登录 */}
            {user ? (
              <Link
                to="/notifications"
                className="relative p-2.5 text-rice-paper/50 hover:text-liujin-gold transition-colors rounded-xl hover:bg-white/5"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-zhusha-red text-white text-[10px] font-bold rounded-full shadow-red-glow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 bg-gradient-to-r from-zhusha-red to-zhusha-red-dark text-white text-sm font-bold rounded-full hover:from-zhusha-red-light hover:to-zhusha-red transition-all shadow-red-glow"
              >
                {t('nav.sign_in')}
              </Link>
            )}
            
            {/* 用户头像 */}
            {user && (
              <Link
                to={`/profile/${user.username}`}
                className="w-10 h-10 rounded-full bg-xuan-black-50/50 border border-liujin-gold/25 flex items-center justify-center hover:border-liujin-gold/50 transition-all overflow-hidden"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-rice-paper/50" />
                )}
              </Link>
            )}
          </div>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 text-rice-paper/70 hover:text-liujin-gold transition-colors rounded-xl hover:bg-white/5"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gradient-to-b from-xuan-black-50 to-xuan-black border-t border-liujin-gold/20"
          >
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-sm font-medium ${
                      isActive
                        ? 'text-liujin-gold bg-zhusha-red/15 border border-liujin-gold/30'
                        : 'text-rice-paper/70 hover:text-liujin-gold hover:bg-white/5'
                    }`}
                  >
                    <i className={`fa-solid ${item.icon} w-4 text-center`} />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                );
              })}
              
              {/* 语言切换 */}
              <div className="pt-4 pb-2 border-t border-liujin-gold/15">
                <div className="text-xs text-rice-paper/40 mb-3 px-4">Language / 语言</div>
                <div className="grid grid-cols-3 gap-2 px-4">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id as Language);
                        setIsMenuOpen(false);
                      }}
                      className={`px-3 py-2.5 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                        language === lang.id
                          ? 'bg-liujin-gold/15 text-liujin-gold border border-liujin-gold/35'
                          : 'bg-white/5 text-rice-paper/60 border border-liujin-gold/10'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="truncate">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="pt-4 border-t border-liujin-gold/15 flex gap-3">
                <Link
                  to="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 py-3 text-center bg-gradient-to-r from-liujin-gold to-liujin-gold-dark text-xuan-black text-sm font-bold rounded-xl shadow-gold-glow-sm"
                >
                  {t('nav.upgrade')}
                </Link>
                {!isArtist && (
                  <Link
                    to="/artist-apply"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 py-3 text-center bg-gradient-to-r from-zhusha-red to-zhusha-red-dark text-white text-sm font-bold rounded-xl shadow-red-glow"
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
