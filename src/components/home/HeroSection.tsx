import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_#d97706_0%,_transparent_50%)]" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-amber-600/10 border border-amber-600/30 text-amber-400 text-sm">
            <Sparkles size={16} />
            <span>AI-Powered Chinese Traditional Tattoos</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ink Your Story with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Ancient Wisdom
            </span>
          </h1>
          
          <p className="text-lg text-stone-400 mb-8 max-w-2xl mx-auto">
            Transform your ideas into stunning Chinese traditional tattoo designs. 
            From ink wash landscapes to mythical beasts, create art that speaks your soul.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/ai-studio"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 font-semibold rounded-full hover:from-amber-500 hover:to-amber-600 transition-all group"
            >
              <Sparkles size={20} />
              Create Your Tattoo
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-stone-600 text-stone-300 font-semibold rounded-full hover:border-amber-500 hover:text-amber-400 transition-all"
            >
              Explore Gallery
            </Link>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-12 flex justify-center gap-8 text-stone-500 text-sm"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">50K+</p>
            <p>Designs Created</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">200+</p>
            <p>Artists</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">12</p>
            <p>Traditional Styles</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
