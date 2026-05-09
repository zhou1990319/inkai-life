import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AIGenPromo() {
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
            <span className="text-amber-400 text-sm font-medium">AI Powered</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Create Your Unique Tattoo
          </h2>
          <p className="text-slate-400 mb-4">
            Transform your ideas into stunning Chinese traditional tattoo designs with our AI generator
          </p>
          <div className="flex gap-3">
            <Link
              to="/ai-studio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-full transition-colors"
            >
              Try AI Generator
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          {['Dragon', 'Phoenix', 'Koi', 'Ink'].map((tag) => (
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
