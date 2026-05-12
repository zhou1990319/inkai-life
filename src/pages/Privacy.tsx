import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Cookie } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Privacy() {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Shield className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">{t('legal.privacy')}</h1>
          <p className="text-stone-400">Last updated: May 8, 2026</p>
        </motion.div>

        <div className="space-y-8">
          <Section icon={Database} title={isZh ? '数据收集 / Data Collection' : 'Data Collection'}>
            <p className="text-stone-300 mb-4">
              {isZh ? '我们收集您直接提供给我们的信息，包括：' : 'We collect information you provide directly to us, including:'}
            </p>
            <ul className="list-disc list-inside text-stone-400 space-y-2">
              <li>{isZh ? '账户信息（用户名、邮箱）' : 'Account information (username, email)'}</li>
              <li>{isZh ? '个人资料（头像、简介、位置）' : 'Profile data (avatar, bio, location)'}</li>
              <li>{isZh ? '您创建的内容（帖子、评论、AI 生成内容）' : 'Content you create (posts, comments, AI generations)'}</li>
              <li>{isZh ? '使用数据和交互记录' : 'Usage data and interactions'}</li>
            </ul>
          </Section>

          <Section icon={Eye} title={isZh ? '数据使用 / How We Use Your Data' : 'How We Use Your Data'}>
            <p className="text-stone-300 mb-4">
              {isZh ? '您的数据帮助我们提供和改善服务：' : 'Your data helps us provide and improve our services:'}
            </p>
            <ul className="list-disc list-inside text-stone-400 space-y-2">
              <li>{isZh ? '个性化您的体验' : 'Personalize your experience'}</li>
              <li>{isZh ? '处理 AI 纹身生成' : 'Process AI tattoo generations'}</li>
              <li>{isZh ? '连接您与纹身艺术家' : 'Connect you with tattoo artists'}</li>
              <li>{isZh ? '发送通知和更新' : 'Send notifications and updates'}</li>
            </ul>
          </Section>

          <Section icon={Lock} title={isZh ? '数据安全 / Data Security' : 'Data Security'}>
            <p className="text-stone-300">
              {isZh
                ? '我们采用行业标准的安全措施来保护您的数据。所有数据在传输和存储时均经过加密。我们绝不会将您的个人信息出售给第三方。'
                : 'We implement industry-standard security measures to protect your data. All data is encrypted in transit and at rest. We never sell your personal information to third parties.'}
            </p>
          </Section>

          <Section icon={Cookie} title={isZh ? 'Cookie 政策 / Cookie Policy' : 'Cookie Policy'}>
            <p className="text-stone-300 mb-4">
              {isZh ? '我们使用 Cookie 来增强您的浏览体验：' : 'We use cookies to enhance your browsing experience:'}
            </p>
            <ul className="list-disc list-inside text-stone-400 space-y-2">
              <li>{isZh ? '网站功能必需的 Cookie' : 'Essential cookies for site functionality'}</li>
              <li>{isZh ? '用于了解使用情况的分析 Cookie' : 'Analytics cookies to understand usage'}</li>
              <li>{isZh ? '用于记住您设置的偏好 Cookie' : 'Preference cookies to remember your settings'}</li>
            </ul>
          </Section>

          <div className="bg-stone-900/50 rounded-xl p-6 border border-stone-700/50">
            <h3 className="text-white font-semibold mb-2">{isZh ? '联系我们 / Contact Us' : 'Contact Us'}</h3>
            <p className="text-stone-300">
              {isZh ? '如果您对本隐私政策有任何疑问，请联系我们：' : 'If you have questions about this Privacy Policy, please contact us at'}
              <a href="mailto:privacy@inkai.life" className="text-amber-400 ml-1 hover:underline">
                privacy@inkai.life
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-stone-900/50 rounded-xl p-6 border border-stone-700/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6 text-amber-400" />
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}
