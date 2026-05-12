import { motion } from 'framer-motion';
import { Scroll, Shield, Copyright, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Terms() {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-amber-500/20 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <Scroll className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">{t('legal.terms')}</h1>
            <p className="text-slate-400">Last updated: May 2025</p>
          </div>

          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">{isZh ? '用户协议 / User Agreement' : 'User Agreement'}</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {isZh
                  ? '使用 InkAI.life 即表示您同意这些条款。您必须年满 18 周岁才能使用我们的服务。您对上传和分享的所有内容负责。'
                  : 'By using InkAI.life, you agree to these terms. You must be at least 18 years old to use our services. You are responsible for all content you upload and share.'}
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Copyright className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">{isZh ? '版权与知识产权 / Copyright & IP' : 'Copyright & IP'}</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {isZh
                  ? 'AI 生成的设计仅供个人使用。商业用途需要 Premium 订阅。您保留原始上传内容的权利。请勿上传您不拥有的内容。'
                  : 'AI-generated designs are for personal use only. Commercial use requires a Premium subscription. You retain rights to your original uploads. Do not upload content you do not own.'}
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">{isZh ? '免责声明 / Disclaimer' : 'Disclaimer'}</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {isZh
                  ? 'InkAI.life 提供的 AI 生成纹身设计仅供参考。在纹身前请务必咨询专业纹身师。我们对任何纹身结果或皮肤反应不承担责任。'
                  : 'InkAI.life provides AI-generated tattoo designs for reference only. Always consult with a professional tattoo artist before getting inked. We are not responsible for any tattoo outcomes or skin reactions.'}
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-xl p-6 border border-amber-500/10">
              <h3 className="text-lg font-medium text-amber-400 mb-2">{isZh ? '联系我们 / Contact Us' : 'Contact Us'}</h3>
              <p className="text-slate-300">
                {isZh
                  ? '对这些条款有疑问？请联系 support@inkai.life'
                  : 'Questions about these terms? Contact us at support@inkai.life'}
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
