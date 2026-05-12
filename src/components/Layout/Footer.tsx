import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const legalLinks = [
    { label: isZh ? '服务条款' : 'Terms of Service', path: '/terms' },
    { label: isZh ? '隐私政策' : 'Privacy Policy', path: '/privacy' },
    { label: isZh ? '免责声明' : 'Disclaimer', path: '/disclaimer' },
  ];

  const socialLinks = [
    { icon: 'fa-brands fa-instagram', label: 'Instagram', url: '#' },
    { icon: 'fa-brands fa-tiktok', label: 'TikTok', url: '#' },
    { icon: 'fa-brands fa-twitter', label: 'Twitter', url: '#' },
    { icon: 'fa-brands fa-discord', label: 'Discord', url: '#' },
  ];

  // 中国传统纹样SVG - 云纹装饰
  const CloudPattern = () => (
    <svg className="absolute top-0 left-0 w-full h-4 opacity-30" viewBox="0 0 1200 20" preserveAspectRatio="none">
      <path
        d="M0,10 Q50,0 100,10 T200,10 T300,10 T400,10 T500,10 T600,10 T700,10 T800,10 T900,10 T1000,10 T1100,10 T1200,10"
        stroke="url(#goldGradient)"
        strokeWidth="1"
        fill="none"
      />
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
          <stop offset="50%" stopColor="#D4AF37" stopOpacity="1" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );

  return (
    <footer className="relative bg-gradient-to-b from-china-red-900 via-ink-black to-ink-black pt-1 mt-auto">
      {/* 金色分隔线 - 云纹装饰 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-imperial-gold-500 to-transparent" />
      <CloudPattern />

      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        {/* 主内容区 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          {/* Brand - 带印章效果 */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* 印章外框 */}
              <div className="w-14 h-14 rounded-lg border-2 border-imperial-gold-500/60 flex items-center justify-center bg-china-red-500/20 shadow-gold">
                <span className="text-imperial-gold-400 font-bold text-2xl font-display">墨</span>
              </div>
              {/* 印章装饰点 */}
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-imperial-gold-500/40" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-imperial-gold-500/30" />
            </div>
            <div>
              <span className="text-xl font-display font-bold tracking-widest bg-gradient-to-r from-imperial-gold-300 to-imperial-gold-500 bg-clip-text text-transparent">
                InkAI.life
              </span>
              <p className="text-rice-paper/50 text-xs mt-1 tracking-wider">
                {isZh ? 'AI 纹身设计平台' : 'AI Tattoo Design Platform'}
              </p>
            </div>
          </div>

          {/* Legal links - 毛玻璃效果 */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            {legalLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-rice-paper/60 hover:text-imperial-gold-400 transition-colors duration-300 px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social icons - 金色边框 */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.url}
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 rounded-xl bg-white/5 border border-imperial-gold-500/30 flex items-center justify-center text-rice-paper/60 hover:text-imperial-gold-400 hover:border-imperial-gold-500/60 hover:bg-imperial-gold-500/10 transition-all duration-300"
                aria-label={social.label}
              >
                <i className={`${social.icon} text-sm`} />
              </motion.a>
            ))}
          </div>
        </div>

        {/* 中间装饰分隔 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-imperial-gold-500/30" />
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-imperial-gold-500/60" />
            <span className="w-2 h-2 rounded-full bg-imperial-gold-500/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-imperial-gold-500/60" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-imperial-gold-500/30" />
        </div>

        {/* 底部版权信息 */}
        <div className="text-center space-y-3">
          <p className="text-rice-paper/40 text-xs tracking-wider">
            {isZh ? '© 2026 InkAI.life · 保留所有权利' : '© 2026 InkAI.life · All rights reserved'}
          </p>
          <p className="text-rice-paper/30 text-xs max-w-2xl mx-auto leading-relaxed">
            {isZh 
              ? 'AI 生成的设计仅供参考。纹身前请咨询专业纹身师。传承东方美学，融合现代科技。' 
              : 'AI-generated designs are for reference only. Consult a professional tattoo artist before getting inked.'}
          </p>
        </div>

        {/* 底部装饰纹样 */}
        <div className="mt-8 flex justify-center">
          <svg className="w-32 h-6 opacity-20" viewBox="0 0 120 24">
            <path
              d="M10,12 Q30,2 50,12 T90,12 T110,12"
              stroke="#D4AF37"
              strokeWidth="1"
              fill="none"
            />
            <circle cx="60" cy="12" r="3" fill="#D4AF37" opacity="0.5" />
            <circle cx="30" cy="12" r="2" fill="#D4AF37" opacity="0.3" />
            <circle cx="90" cy="12" r="2" fill="#D4AF37" opacity="0.3" />
          </svg>
        </div>
      </div>
    </footer>
  );
}
