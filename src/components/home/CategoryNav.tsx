import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export default function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const categories = [
    { id: 'all', name: isZh ? '\u5168\u90E8' : 'All', icon: '\u2726' },
    { id: 'ink-wash', name: isZh ? '\u6C34\u58A8' : 'Ink Wash', icon: '\u26F0\uFE0F' },
    { id: 'dragon', name: isZh ? '\u9F99' : 'Dragon', icon: '\uD83D\uDC09' },
    { id: 'phoenix', name: isZh ? '\u51E4\u51F0' : 'Phoenix', icon: '\uD83D\uDD25' },
    { id: 'dunhuang', name: isZh ? '\u6566\u714C' : 'Dunhuang', icon: '\uD83E\uDDDA' },
    { id: 'mythical', name: isZh ? '\u795E\u517D' : 'Mythical', icon: '\uD83E\uDD81' },
    { id: 'calligraphy', name: isZh ? '\u4E66\u6CD5' : 'Calligraphy', icon: '\u270F\uFE0F' },
    { id: 'koi', name: isZh ? '\u9526\u9CA4' : 'Koi', icon: '\uD83D\uDC1F' },
  ];

  return (
    <div className="sticky top-16 z-30 bg-stone-950/95 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-2">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-600 text-stone-950 font-medium'
                  : 'bg-stone-900 text-stone-400 hover:text-amber-400 hover:bg-stone-800'
              }}
            >
              <span>{cat.icon}</span>
              <span className="text-sm">{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
