import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function FeaturedArtists() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const artists = [
    { id: '1', name: isZh ? '\u9648\u5927\u5E08' : 'Master Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen', style: isZh ? '\u6C34\u58A8' : 'Ink Wash', location: isZh ? '\u4E0A\u6D77' : 'Shanghai', rating: 4.9 },
    { id: '2', name: isZh ? '\u9F99\u674E' : 'Dragon Li', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li', style: isZh ? '\u4F20\u7EDF' : 'Traditional', location: isZh ? '\u5317\u4EAC' : 'Beijing', rating: 4.8 },
    { id: '3', name: isZh ? '\u58A8\u738B' : 'Ink Wang', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang', style: isZh ? '\u4E66\u6CD5' : 'Calligraphy', location: isZh ? '\u676D\u5DDE' : 'Hangzhou', rating: 4.9 },
    { id: '4', name: isZh ? '\u51E4\u51F0\u5F20' : 'Phoenix Zhang', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang', style: isZh ? '\u6566\u714C' : 'Dunhuang', location: isZh ? '\u6210\u90FD' : 'Chengdu', rating: 4.7 },
  ];

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">{isZh ? '\u63A8\u8350\u827A\u672F\u5BB6' : 'Featured Artists'}</h2>
            <p className="text-stone-400 text-sm mt-1">{isZh ? '\u6765\u81EA\u4E2D\u56FD\u7684\u9876\u5C16\u7EB9\u8EAB\u5927\u5E08' : 'Top tattoo masters from China'}</p>
          </div>
          <button className="text-amber-400 hover:text-amber-300 text-sm font-medium">{isZh ? '\u67E5\u770B\u5168\u90E8' : 'View All'}</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {artists.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-stone-900/50 rounded-xl p-4 border border-stone-700/50 hover:border-amber-600/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full border-2 border-amber-600"
                />
                <div>
                  <h3 className="text-white font-medium text-sm">{artist.name}</h3>
                  <span className="text-amber-400 text-xs">{artist.style}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {artist.location}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={12} className="text-amber-500" /> {artist.rating}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}