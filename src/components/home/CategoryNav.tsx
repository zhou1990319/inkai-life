import { motion } from 'framer-motion';

const categories = [
  { id: 'all', name: 'All', icon: '✦' },
  { id: 'ink-wash', name: 'Ink Wash', icon: '⛰️' },
  { id: 'dragon', name: 'Dragon', icon: '🐉' },
  { id: 'phoenix', name: 'Phoenix', icon: '🔥' },
  { id: 'dunhuang', name: 'Dunhuang', icon: '🧚' },
  { id: 'mythical', name: 'Mythical', icon: '🦁' },
  { id: 'calligraphy', name: 'Calligraphy', icon: '✒️' },
  { id: 'koi', name: 'Koi', icon: '🐟' },
];

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export default function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <div className="sticky top-16 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1a1a1a]">
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
                  ? 'bg-[#c9a050] text-[#0a0a0a] font-medium'
                  : 'bg-[#1a1a1a] text-orange-300 hover:text-white hover:bg-[#2a2a2a]'
              }`}
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
