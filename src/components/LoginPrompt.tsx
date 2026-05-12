import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  action?: 'post' | 'like' | 'comment' | 'generate' | 'save' | 'follow' | 'default';
}

export default function LoginPrompt({ 
  isOpen, 
  onClose, 
  title, 
  message,
  action = 'default' 
}: LoginPromptProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const content = {
    post: {
      title: t('auth.login_to_post') || 'Sign in to share your work',
      desc: t('auth.login_to_post_desc') || 'Join our community of tattoo enthusiasts',
      icon: '✍️',
    },
    like: {
      title: t('auth.login_to_like') || 'Sign in to like',
      desc: t('auth.login_to_like_desc') || 'Show your appreciation for amazing artwork',
      icon: '❤️',
    },
    comment: {
      title: t('auth.login_to_comment') || 'Sign in to comment',
      desc: t('auth.login_to_comment_desc') || 'Share your thoughts with the community',
      icon: '💬',
    },
    generate: {
      title: t('auth.login_to_generate') || 'Sign in to create',
      desc: t('auth.login_to_generate_desc') || 'Access AI-powered tattoo design tools',
      icon: '✨',
    },
    save: {
      title: t('auth.login_to_save') || 'Sign in to save',
      desc: t('auth.login_to_save_desc') || 'Bookmark your favorite tattoo designs',
      icon: '🔖',
    },
    follow: {
      title: t('auth.login_to_follow') || 'Sign in to follow',
      desc: t('auth.login_to_follow_desc') || 'Connect with your favorite artists',
      icon: '👤',
    },
    default: {
      title: title || t('auth.sign_in_required') || 'Sign in required',
      desc: message || t('auth.sign_in_desc') || 'Please sign in to continue',
      icon: '🔐',
    },
  };

  const current = content[action];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-[101]"
          >
            <div className="bg-[#18181F] border border-[#2A2A36] rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl">
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-[#9E2B25] to-[#18181F] px-6 py-8 text-center">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 text-white/60 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
                
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-3xl">{current.icon}</span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{current.title}</h3>
                <p className="text-white/70 text-sm">{current.desc}</p>
              </div>

              {/* Actions */}
              <div className="p-6 space-y-3">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#9E2B25] text-white font-semibold rounded-xl hover:bg-[#B8342D] transition-colors"
                >
                  <LogIn size={18} />
                  {t('auth.sign_in')}
                </Link>
                
                <Link
                  to="/register"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#18181F] border border-[#2A2A36] text-white font-medium rounded-xl hover:bg-[#2A2A36] transition-colors"
                >
                  <UserPlus size={18} />
                  {t('auth.sign_up')}
                </Link>

                {/* Skip */}
                <button
                  onClick={onClose}
                  className="w-full py-2 text-[#6B6B78] text-sm hover:text-white transition-colors"
                >
                  {t('common.cancel') || 'Maybe later'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for managing login prompt
import { useState } from 'react';

export function useLoginPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<'post' | 'like' | 'comment' | 'generate' | 'save' | 'follow' | 'default'>('default');

  const openPrompt = (type: typeof action = 'default') => {
    setAction(type);
    setIsOpen(true);
  };

  const closePrompt = () => setIsOpen(false);

  return { isOpen, action, openPrompt, closePrompt };
}
