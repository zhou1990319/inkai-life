import { motion } from 'framer-motion';
import { Scroll, Shield, Copyright, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Terms() {
  const { t } = useLanguage();
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
                <h2 className="text-xl font-semibold text-white">User Agreement</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                By using InkAI.life, you agree to these terms. You must be at least 18 years old 
                to use our services. You are responsible for all content you upload and share.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Copyright className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">Copyright & IP</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                AI-generated designs are for personal use only. Commercial use requires a Premium 
                subscription. You retain rights to your original uploads. Do not upload content 
                you do not own.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">Disclaimer</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                InkAI.life provides AI-generated tattoo designs for reference only. Always consult 
                with a professional tattoo artist before getting inked. We are not responsible for 
                any tattoo outcomes or skin reactions.
              </p>
            </section>

            <section className="bg-slate-800/50 rounded-xl p-6 border border-amber-500/10">
              <h3 className="text-lg font-medium text-amber-400 mb-2">Contact Us</h3>
              <p className="text-slate-300">
                Questions about these terms? Contact us at support@inkai.life
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
