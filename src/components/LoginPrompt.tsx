import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

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
  const { t, language } = useLanguage();
  const isZh = language === 'zh';
  const navigate = useNavigate();

  const content = {
    post: {
      title: t('auth.login_to_post') || (isZh ? '登录以分享您的作品 / Sign in to share your work' : 'Sign in to share your work'),
      desc: t('auth.login_to_post_desc') || (isZh ? '加入我们的纹身爱好者社区 / Join our community of tattoo enthusiasts' : 'Join our community of tattoo enthusiasts'),
      icon: '✍️',
    },
    like: {
      title: t('auth.login_to_like') || (isZh ? '登录以点赞 / Sign in to like' : 'Sign in to like'),
      desc: t('auth.login_to_like_desc') || (isZh ? '为精彩作品表达赞赏 / Show your appreciation for amazing artwork' : 'Show your appreciation for amazing artwork'),
      icon: '❤️',
    },
    comment: {
      title: t('auth.login_to_comment') || (isZh ? '登录以评论 / Sign in to comment' : 'Sign in to comment'),
      desc: t('auth.login_to_comment_desc') || (isZh ? '分享您的想法 / Share your thoughts with the community' : 'Share your thoughts with the community'),
      icon: '💬',
    },
    generate: {
      title: t('auth.login_to_generate') || (isZh ? '登录以创建 / Sign in to create' : 'Sign in to create'),
      desc: t('auth.login_to_generate_desc') || (isZh ? '使用 AI 驱动的纹身设计工具 / Access AI-powered tattoo design tools' : 'Access AI-powered tattoo design tools'),
      icon: '✨',
    },
    save: {
      title: t('auth.login_to_save') || (isZh ? '登录以保存 / Sign in to save' : 'Sign in to save'),
      desc: t('auth.login_to_save_desc') || (isZh ? '收藏您喜爱的纹身设计 / Bookmark your favorite tattoo designs' : 'Bookmark your favorite tattoo designs'),
      icon: '🔖',
    },
    follow: {
      title: t('auth.login_to_follow') || (isZh ? '登录以关注 / Sign in to follow' : 'Sign in to follow'),
      desc: t('auth.login_to_follow_desc') || (isZh ? '与您喜爱的艺术家互动 / Connect with your favorite artists' : 'Connect with your favorite artists'),
      icon: '👤',
    },
    default: {
      title: title || t('auth.sign_in_required') || (isZh ? '需要登录 / Sign in required' : 'Sign in required'),
      desc: message || t('auth.sign_in_desc') || (isZh ? '请登录以继续 / Please sign in to continue' : 'Please sign in to continue'),
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
                  {t('common.cancel') || (isZh ? '以后再说 / Maybe later' : 'Maybe later')}
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
