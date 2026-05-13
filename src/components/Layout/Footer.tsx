import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const legalLinks = [
    { label: isZh ? '服务条款' : 'Terms', path: '/terms' },
    { label: isZh ? '隐私政策' : 'Privacy', path: '/privacy' },
    { label: isZh ? '免责声明' : 'Disclaimer', path: '/disclaimer' },
  ];

  const socialLinks = [
    { label: 'Instagram', url: '#' },
    { label: 'Twitter', url: '#' },
    { label: 'Discord', url: '#' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center">
              <span className="text-white font-bold text-xl">墨</span>
            </div>
            <span className="text-xl font-semibold text-black">
              InkAI.life
            </span>
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-8 text-sm">
            {legalLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-500 hover:text-black transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6 text-sm">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                className="text-gray-500 hover:text-black transition-colors"
                aria-label={social.label}
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm">
            {isZh 
              ? '© 2026 InkAI.life · 保留所有权利' 
              : '© 2026 InkAI.life · All rights reserved'}
          </p>
        </div>
      </div>
    </footer>
  );
}
