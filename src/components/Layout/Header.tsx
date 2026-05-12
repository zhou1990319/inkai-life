import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Bell, User, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabase/client';

const navItems = [
  { path: '/', label: 'Home', icon: 'fa-home' },
  { path: '/explore', label: 'Community', icon: 'fa-users' },
  { path: '/create', label: 'Inspire', icon: 'fa-lightbulb' },
  { path: '/artists', label: 'Artists', icon: 'fa-paint-brush' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isArtist, setIsArtist] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const location = useLocation();

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
  }, [location]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-amber-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-red-700 flex items-center justify-center">
              <span className="text-stone-100 font-bold text-lg">墨</span>
            </div>
            <span className="text-xl font-bold text-stone-100 tracking-wider">
              InkAI<span className="text-amber-500">.life</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                  location.pathname === item.path
                    ? 'text-amber-400 bg-amber-900/20 border border-amber-600/30'
                    : 'text-stone-300 hover:text-amber-400 hover:bg-stone-800/50'
                }`}
              >
                <i className={`fa-solid ${item.icon}`} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {/* 会员入口 */}
            <Link
              to="/pricing"
              className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all ${
                currentPlan === 'free'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 hover:from-amber-400 hover:to-orange-400'
                  : currentPlan === 'lifetime'
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950'
                  : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>
                {currentPlan === 'free' ? '升级' : currentPlan === 'monthly' ? '月卡' : currentPlan === 'yearly' ? '年卡' : 'VIP'}
              </span>
            </Link>

            {!isArtist && (
              <Link
                to="/artist-apply"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-semibold rounded-full hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-2"
              >
                <i className="fa-solid fa-paint-brush text-sm" />
                <span>Become Artist</span>
              </Link>
            )}
            <button className="p-2 text-stone-400 hover:text-amber-400 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-stone-400 hover:text-amber-400 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-red-700 flex items-center justify-center hover:ring-2 hover:ring-amber-500/50 transition-all"
            >
              <User className="w-5 h-5 text-stone-100" />
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-stone-300 hover:text-amber-400"
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
            className="md:hidden bg-stone-900 border-t border-amber-700/30"
          >
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? 'text-amber-400 bg-amber-900/20 border border-amber-600/30'
                      : 'text-stone-300 hover:text-amber-400 hover:bg-stone-800/50'
                  }`}
                >
                  <span className="flex items-center space-x-3">
                    <i className={`fa-solid ${item.icon}`} />
                    <span>{item.label}</span>
                  </span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
