import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const legalLinks = [
  { label: 'Terms of Service', path: '/terms' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Disclaimer', path: '/disclaimer' },
  { label: 'Cookie Policy', path: '/cookies' },
];

const socialLinks = [
  { icon: 'fa-brands fa-instagram', label: 'Instagram', url: '#' },
  { icon: 'fa-brands fa-tiktok', label: 'TikTok', url: '#' },
  { icon: 'fa-brands fa-twitter', label: 'Twitter', url: '#' },
  { icon: 'fa-brands fa-discord', label: 'Discord', url: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c41e3a] to-[#8b0000] flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="text-white font-bold">InkAI.life</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {legalLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-400 hover:text-[#c9a050] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.url}
                whileHover={{ scale: 1.1 }}
                className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center text-gray-400 hover:text-[#c9a050] hover:bg-[#2a2a2a] transition-colors"
                aria-label={social.label}
              >
                <i className={social.icon} />
              </motion.a>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#1a1a1a] text-center text-xs text-gray-500">
          <p>漏 2024 InkAI.life. All rights reserved.</p>
          <p className="mt-1">
            AI-generated designs are for reference only. Consult professional tattoo artists before getting inked.
          </p>
        </div>
      </div>
    </footer>
  );
}
