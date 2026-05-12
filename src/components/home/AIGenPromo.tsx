import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AIGenPromo() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const tags = isZh
    ? ['\u9F99', '\u51E4\u51F0', '\u9526\u9CA4', '\u6C34\u58A8']
    : ['Dragon', 'Phoenix', 'Koi', 'Ink'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600/20 via-slate-900 to-slate-950 border border-amber-500/30 p-8 mb-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">{isZh ? 'AI \u9A71\u52A8' : 'AI Powered'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {isZh ? '\u521B\u4F5C\u4F60\u7684\u4E13\u5C5E\u7EB9\u8EAB' : 'Create Your Unique Tattoo'}
          </h2>
          <p className="text-slate-400 mb-4">
            {isZh
              ? '\u7528\u6211\u4EEC\u7684 AI \u751F\u6210\u5668\u5C06\u4F60\u7684\u60F3\u6CD5\u8F6C\u5316\u4E3A\u60CA\u8273\u7684\u4E2D\u5F0F\u4F20\u7EDF\u7EB9\u8EAB\u8BBE\u8BA1'
              : 'Transform your ideas into stunning Chinese traditional tattoo designs with our AI generator'}
          </p>
          <div className="flex gap-3">
            <Link
              to="/ai-studio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-full transition-colors"
            >
              {isZh ? '\u8BD5\u8BD5 AI \u751F\u6210\u5668' : 'Try AI Generator'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-800/50 text-slate-300 text-sm rounded-full border border-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}