import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabase/client';
import { Heart, MessageCircle, Share2, MapPin, Globe, CheckCircle } from 'lucide-react';

interface Artist {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  is_artist: boolean;
  artist_verified: boolean;
  location: string;
  website: string;
  followers_count: number;
}

interface Portfolio {
  id: string;
  title: string;
  image_url: string;
  style: string[];
  price_range: string;
}

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchArtist();
  }, [id]);

  async function fetchArtist() {
    if (!id) return;
    const { data: artistData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (artistData) {
      setArtist(artistData);
      fetchPortfolio(artistData.id);
    }
    setLoading(false);
  }

  async function fetchPortfolio(artistId: string) {
    const { data } = await supabase
      .from('artist_portfolios')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });
    if (data) setPortfolio(data);
  }

  if (loading) return <div className="text-center py-20 text-[#d4c4b0]">Loading...</div>;
  if (!artist) return <div className="text-center py-20 text-[#d4c4b0]">Artist not found</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl p-8 mb-8 border border-[#2a2a2a]">
          <div className="flex items-start gap-6">
            <img
              src={artist.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.username}`}
              alt={artist.display_name}
              className="w-24 h-24 rounded-full border-2 border-[#c9a050]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[#f5f0e8]">{artist.display_name}</h1>
                {artist.artist_verified && <CheckCircle className="w-5 h-5 text-[#c9a050]" />}
              </div>
              <p className="text-[#d4c4b0] mb-4">@{artist.username}</p>
              <p className="text-[#a09080] mb-4">{artist.bio || 'No bio yet'}</p>
              <div className="flex items-center gap-6 text-sm text-[#a09080]">
                {artist.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {artist.location}
                  </span>
                )}
                {artist.website && (
                  <a href={artist.website} className="flex items-center gap-1 text-[#c9a050] hover:underline">
                    <Globe className="w-4 h-4" /> Website
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  isFollowing
                    ? 'bg-[#2a2a2a] text-[#d4c4b0] border border-[#3a3a3a]'
                    : 'bg-gradient-to-r from-[#c9a050] to-[#d4af37] text-[#0a0a0a]'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="px-6 py-2 rounded-full border border-[#c9a050] text-[#c9a050] hover:bg-[#c9a050]/10 transition-all">
                Book Now
              </button>
            </div>
          </div>
          <div className="flex gap-8 mt-6 pt-6 border-t border-[#2a2a2a]">
            <div className="text-center">
              <p className="text-xl font-bold text-[#f5f0e8]">{portfolio.length}</p>
              <p className="text-sm text-[#a09080]">Works</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#f5f0e8]">{artist.followers_count || 0}</p>
              <p className="text-sm text-[#a09080]">Followers</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-[#f5f0e8] mb-6">Portfolio</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {portfolio.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="group relative aspect-square rounded-xl overflow-hidden bg-[#1a1a1a] cursor-pointer"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-medium text-sm">{item.title}</h3>
                  {item.price_range && (
                    <p className="text-[#c9a050] text-xs mt-1">{item.price_range}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
