import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const legalLinks = [
    { label: isZh ? '\u670D\u52A1\u6761\u6B3E' : 'Terms of Service', path: '/terms' },
    { label: isZh ? '\u9690\u79C1\u653F\u7B56' : 'Privacy Policy', path: '/privacy' },
    { label: isZh ? '\u514D\u8D23\u58F0\u660E' : 'Disclaimer', path: '/disclaimer' },
    { label: isZh ? 'Cookie \u653F\u7B56' : 'Cookie Policy', path: '/cookies' },
  ];

  const socialLinks = [
    { icon: 'fa-brands fa-instagram', label: 'Instagram', url: '#' },
    { icon: 'fa-brands fa-tiktok', label: 'TikTok', url: '#' },
    { icon: 'fa-brands fa-twitter', label: 'Twitter', url: '#' },
    { icon: 'fa-brands fa-discord', label: 'Discord', url: '#' },
  ];

  return (
    <footer className="bg-[#0B0B0E] border-t border-[#2A2A36] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#18181F] border border-[#2A2A36] flex items-center justify-center">
              <span className="text-[#CFAF6E] font-bold text-sm">\u58A8</span>
            </div>
            <span className="text-white font-bold tracking-widest text-sm">InkAI.life</span>
          </div>

          {/* Legal links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {legalLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-[#6B6B78] hover:text-[#CFAF6E] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.url}
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 rounded-lg bg-[#18181F] border border-[#2A2A36] flex items-center justify-center text-[#6B6B78] hover:text-[#CFAF6E] hover:border-[#CFAF6E]/30 transition-all"
                aria-label={social.label}
              >
                <i className={`${social.icon} text-xs`} />
              </motion.a>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#2A2A36] text-center text-xs text-[#6B6B78] space-y-1">
          <p>{isZh ? '\u00A9 2024 InkAI.life \u00B7 \u4FDD\u7559\u6240\u6709\u6743\u5229' : '\u00A9 2024 InkAI.life \u00B7 All rights reserved'}</p>
          <p>{isZh ? 'AI \u751F\u6210\u7684\u8BBE\u8BA1\u4EC5\u4F9B\u53C2\u8003\u3002\u7EB9\u8EAB\u524D\u8BF7\u54A8\u8BE2\u4E13\u4E1A\u7EB9\u8EAB\u5E08\u3002' : 'AI-generated designs are for reference only. Consult a professional tattoo artist before getting inked.'}</p>
        </div>
      </div>
    </footer>
  );
}