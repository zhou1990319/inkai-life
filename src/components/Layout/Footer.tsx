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
    <footer className="bg-[#0B0B0E] border-t border-[#2A2A36] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#18181F] border border-[#2A2A36] flex items-center justify-center">
              <span className="text-[#CFAF6E] font-bold text-sm">墨</span>
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
          <p>© 2024 InkAI.life · All rights reserved</p>
          <p>AI-generated designs are for reference only. Consult a professional tattoo artist before getting inked.</p>
        </div>
      </div>
    </footer>
  );
}
