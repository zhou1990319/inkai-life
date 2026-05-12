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
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-china-red-900 via-china-red-800 to-ink-black backdrop-blur-xl border-b border-imperial-gold-500/30 shadow-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-imperial-gold-400 to-imperial-gold-600 flex items-center justify-center shadow-gold group-hover:shadow-gold-lg transition-all duration-300">
              <span className="text-ink-black font-bold text-xl">墨</span>
            </div>
            <span className="text-2xl font-display font-bold tracking-wider bg-gradient-to-r from-imperial-gold-300 via-imperial-gold-500 to-imperial-gold-300 bg-clip-text text-transparent">
              InkAI
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center space-x-2 text-sm font-medium backdrop-blur-md ${
                    isActive
                      ? 'bg-china-red-500/20 text-imperial-gold-400 border border-imperial-gold-500/50 shadow-gold'
                      : 'text-rice-paper/80 hover:text-imperial-gold-400 hover:bg-white/5 hover:border-imperial-gold-500/30 border border-transparent'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} text-xs`} />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-imperial-gold-500/20 text-rice-paper/80 hover:text-imperial-gold-400 hover:border-imperial-gold-500/40 transition-all text-sm"
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
                    className="absolute right-0 mt-2 w-48 bg-ink-black/95 backdrop-blur-xl border border-imperial-gold-500/30 rounded-xl shadow-gold-lg overflow-hidden z-50"
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => {
                          setLanguage(lang.id as Language);
                          setIsLangOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-china-red-500/20 transition-colors ${
                          language === lang.id ? 'bg-imperial-gold-500/20 text-imperial-gold-400' : 'text-rice-paper/80'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <div>
                          <div className="text-sm font-medium">{lang.nativeName}</div>
                          <div className="text-xs text-rice-paper/50">{lang.name}</div>
                        </div>
                        {language === lang.id && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-imperial-gold-500" />
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

            <Link
              to="/pricing"
              className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-gold hover:shadow-gold-lg ${
                currentPlan === 'free'
                  ? 'bg-gradient-to-r from-imperial-gold-500 to-imperial-gold-600 text-ink-black hover:from-imperial-gold-400 hover:to-imperial-gold-500'
                  : currentPlan === 'lifetime'
                  ? 'bg-gradient-to-r from-imperial-gold-500 to-imperial-gold-600 text-ink-black'
                  : 'bg-china-red-500/30 text-imperial-gold-400 border border-china-red-500/50'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>
                {currentPlan === 'free' ? t('nav.upgrade') : currentPlan === 'monthly' ? t('pricing.monthly') : currentPlan === 'yearly' ? t('pricing.yearly') : 'VIP'}
              </span>
            </Link>

            {!isArtist && (
              <Link
                to="/artist-apply"
                className="px-5 py-2 bg-gradient-to-r from-china-red-600 to-china-red-700 text-white text-sm font-bold rounded-full hover:from-china-red-500 hover:to-china-red-600 transition-all flex items-center gap-2 shadow-red-glow"
              >
                <i className="fa-solid fa-paint-brush text-xs" />
                <span>{t('nav.apply_artist')}</span>
              </Link>
            )}

            {user ? (
              <Link
                to="/notifications"
                className="relative p-2.5 text-rice-paper/60 hover:text-imperial-gold-400 transition-colors rounded-xl hover:bg-white/5"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-china-red-500 text-white text-[10px] font-bold rounded-full shadow-red-glow">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 bg-gradient-to-r from-china-red-600 to-china-red-700 text-white text-sm font-bold rounded-full hover:from-china-red-500 hover:to-china-red-600 transition-all shadow-red-glow"
              >
                {t('nav.sign_in')}
              </Link>
            )}
            {user && (
              <Link
                to={`/profile/${user.username}`}
                className="w-10 h-10 rounded-full bg-white/5 border border-imperial-gold-500/30 flex items-center justify-center hover:border-imperial-gold-500/60 transition-all overflow-hidden"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-rice-paper/60" />
                )}
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 text-rice-paper/80 hover:text-imperial-gold-400 transition-colors rounded-xl hover:bg-white/5"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gradient-to-b from-china-red-900 to-ink-black border-t border-imperial-gold-500/30"
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
                        ? 'text-imperial-gold-400 bg-china-red-500/20 border border-imperial-gold-500/30'
                        : 'text-rice-paper/80 hover:text-imperial-gold-400 hover:bg-white/5'
                    }`}
                  >
                    <i className={`fa-solid ${item.icon} w-4 text-center`} />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                );
              })}
              <div className="pt-4 pb-2 border-t border-imperial-gold-500/20">
                <div className="text-xs text-rice-paper/50 mb-3 px-4">Language / 语言</div>
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
                          ? 'bg-imperial-gold-500/20 text-imperial-gold-400 border border-imperial-gold-500/40'
                          : 'bg-white/5 text-rice-paper/70 border border-imperial-gold-500/10'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="truncate">{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-imperial-gold-500/20 flex gap-3">
                <Link
                  to="/pricing"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 py-3 text-center bg-gradient-to-r from-imperial-gold-500 to-imperial-gold-600 text-ink-black text-sm font-bold rounded-xl shadow-gold"
                >
                  {t('nav.upgrade')}
                </Link>
                {!isArtist && (
                  <Link
                    to="/artist-apply"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 py-3 text-center bg-gradient-to-r from-china-red-600 to-china-red-700 text-white text-sm font-bold rounded-xl shadow-red-glow"
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
