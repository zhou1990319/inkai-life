import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';

const artists = [
  { id: '1', name: 'Master Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen', style: 'Ink Wash', location: 'Shanghai', rating: 4.9 },
  { id: '2', name: 'Dragon Li', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li', style: 'Traditional', location: 'Beijing', rating: 4.8 },
  { id: '3', name: 'Ink Wang', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang', style: 'Calligraphy', location: 'Hangzhou', rating: 4.9 },
  { id: '4', name: 'Phoenix Zhang', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang', style: 'Dunhuang', location: 'Chengdu', rating: 4.7 },
];

export default function FeaturedArtists() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Artists</h2>
            <p className="text-orange-300 text-sm mt-1">Top tattoo masters from China</p>
          </div>
          <button className="text-[#c9a050] hover:text-[#d4af37] text-sm font-medium">View All</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {artists.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-[#141414] rounded-xl p-4 border border-[#2a2a2a] hover:border-[#c9a050]/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full border-2 border-[#c9a050]"
                />
                <div>
                  <h3 className="text-white font-medium text-sm">{artist.name}</h3>
                  <span className="text-[#c9a050] text-xs">{artist.style}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-orange-300">
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {artist.location}
                </span>
                <span className="flex items-center gap-1">
                  <Star size={12} className="text-[#c9a050]" /> {artist.rating}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
