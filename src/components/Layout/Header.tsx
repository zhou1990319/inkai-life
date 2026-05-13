import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { supabase } from '../../supabase/client';
import type { Profile } from '../../supabase/types';
import { useLanguage, LANGUAGES, type Language } from '../../contexts/LanguageContext';

export default function Header({ user }: { user: Profile | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, currentLanguage, t } = useLanguage();

  // 简化的导航项
  const navItems = [
    { path: '/', labelKey: 'nav.home' },
    { path: '/explore', labelKey: 'nav.community' },
    { path: '/pricing', labelKey: 'nav.pricing' },
  ];

  // 点击外部关闭语言菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.lang-menu')) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo - 更紧凑 */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <span className="text-white font-bold text-sm">墨</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-black">
              InkAI
            </span>
          </Link>

          {/* Desktop Navigation - 极简 */}
          <nav className="hidden md:flex items-center gap-6">
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

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative lang-menu">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-black transition-colors text-sm"
              >
                <Globe className="w-4 h-4" />
                <span className="text-base">{currentLanguage.flag}</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-gray-200 shadow-lg z-50 py-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id as Language);
                        setIsLangOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm ${
                        language === lang.id ? 'text-black font-medium' : 'text-gray-500'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login / User */}
            {user ? (
              <Link
                to={`/profile/${user.username}`}
                className="w-8 h-8 bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-medium text-gray-600">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {t('nav.sign_in')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-500 hover:text-black transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-black' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}

            {/* Mobile Language Switcher */}
            <div className="pt-3 border-t border-gray-100 mt-3">
              <div className="text-xs text-gray-400 mb-2">Language</div>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setLanguage(lang.id as Language);
                      setIsMenuOpen(false);
                    }}
                    className={`px-3 py-1.5 text-sm transition-colors ${
                      language === lang.id
                        ? 'bg-black text-white'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-1">{lang.flag}</span>
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Auth */}
            {!user && (
              <div className="pt-3 border-t border-gray-100 mt-3">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-2.5 text-center bg-black text-white text-sm font-medium"
                >
                  {t('nav.sign_in')}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
