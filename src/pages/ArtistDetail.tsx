import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase/client';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Heart, MessageCircle, MapPin, Globe, CheckCircle,
  MessageSquare, X, Send, ShoppingBag, Image,
  User, ChevronLeft, ExternalLink, Copy
} from 'lucide-react';

interface Profile {
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
  description?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  product_link: string;
  price: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface Conversation {
  id: string;
  user_id: string;
  artist_id: string;
  last_message: string;
  last_message_at: string;
}

export default function ArtistDetail() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'works' | 'products' | 'about'>('works');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();
    fetchArtist();
  }, [id]);

  useEffect(() => {
    if (showChat && conversation?.id) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [showChat, conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user);
  };

  const fetchArtist = async () => {
    if (!id) return;
    setLoading(true);

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setFollowersCount(profileData.followers_count || 0);
      await Promise.all([
        fetchPortfolio(id),
        fetchProducts(id),
        checkFollowStatus(id)
      ]);
    }
    setLoading(false);
  };

  const fetchPortfolio = async (artistId: string) => {
    // Fetch from artist_portfolios
    const { data: artistPortfolio } = await supabase
      .from('artist_portfolios')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    // Fetch from tattoo_posts (community posts)
    const { data: communityPosts } = await supabase
      .from('tattoo_posts')
      .select('*')
      .eq('user_id', artistId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20);

    // Merge and dedupe
    const combined = [
      ...(artistPortfolio || []).map(p => ({
        id: p.id,
        title: p.title,
        image_url: p.image_url,
        style: p.style || [],
        price_range: p.price_range,
        description: p.description
      })),
      ...(communityPosts || []).map(p => ({
        id: p.id,
        title: p.title || 'Untitled',
        image_url: p.thumbnail_url || p.image_url,
        style: p.style || [],
        price_range: null,
        description: p.description
      }))
    ];

    // Remove duplicates by image_url
    const seen = new Set();
    const unique = combined.filter(p => {
      if (seen.has(p.image_url)) return false;
      seen.add(p.image_url);
      return true;
    });

    setPortfolio(unique);
  };

  const fetchProducts = async (artistId: string) => {
    const { data } = await supabase
      .from('artist_products')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });

    if (data) setProducts(data);
  };

  const checkFollowStatus = async (artistId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', session.user.id)
      .eq('following_id', artistId)
      .single();

    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate('/login');
      return;
    }

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', session.user.id)
        .eq('following_id', id);
      setFollowersCount(prev => prev - 1);
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: session.user.id, following_id: id });
      setFollowersCount(prev => prev + 1);
    }
    setIsFollowing(!isFollowing);
  };

  const startConversation = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate('/login');
      return;
    }

    if (session.user.id === id) {
      alert('You cannot message yourself');
      return;
    }

    // Check if conversation exists
    let { data: existingConv } = await supabase
      .from('artist_conversations')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('artist_id', id)
      .single();

    if (!existingConv) {
      const { data: newConv } = await supabase
        .from('artist_conversations')
        .insert({ user_id: session.user.id, artist_id: id! })
        .select()
        .single();
      existingConv = newConv;
    }

    setConversation(existingConv);
    setShowChat(true);
  };

  const fetchMessages = async () => {
    if (!conversation?.id) return;

    const { data } = await supabase
      .from('artist_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);

    // Mark as read
    await supabase
      .from('artist_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversation.id)
      .neq('sender_id', currentUser?.id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation?.id) return;

    await supabase
      .from('artist_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: currentUser!.id,
        content: newMessage.trim()
      });

    setNewMessage('');
    fetchMessages();
  };

  const copyProductLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
        <div className="text-stone-400">Artist not found</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 pb-24">
      {/* Header */}
      <div className="bg-stone-900/80 border-b border-stone-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-stone-800 rounded-full">
              <ChevronLeft className="w-5 h-5 text-stone-400" />
            </button>
            <span className="text-stone-400 text-sm">{t('artist.portfolio')}</span>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                alt={profile.display_name}
                className="w-24 h-24 rounded-full border-2 border-amber-500/50 object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">{profile.display_name}</h1>
                {profile.artist_verified && (
                  <CheckCircle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <p className="text-stone-400 mb-3">@{profile.username}</p>

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div>
                  <span className="text-xl font-bold text-white">{portfolio.length}</span>
                  <span className="text-stone-500 ml-1">{t('artist.portfolio')}</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">{followersCount}</span>
                  <span className="text-stone-500 ml-1">{t('profile.followers')}</span>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-stone-400">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-1 text-amber-500 hover:text-amber-400">
                    <Globe className="w-4 h-4" /> Website
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            {!isOwnProfile && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    isFollowing
                      ? 'bg-stone-800 text-stone-300 border border-stone-700'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950'
                  }`}
                >
                  {isFollowing ? t('profile.following') : t('profile.follow')}
                </button>
                <button
                  onClick={startConversation}
                  className="px-6 py-2 rounded-full font-medium bg-stone-800 text-white border border-stone-700 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('artist.book_appointment')}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-stone-900/50 rounded-xl p-1 mb-6">
          {[
            { id: 'works', label: 'Works', icon: Image, count: portfolio.length },
            { id: 'products', label: 'Products', icon: ShoppingBag, count: products.length },
            { id: 'about', label: 'About', icon: User, count: null },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-stone-950 font-medium'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== null && (
                <span className={`text-xs px-1.5 rounded ${
                  activeTab === tab.id ? 'bg-stone-950/30' : 'bg-stone-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'works' && (
            <motion.div
              key="works"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {portfolio.length === 0 ? (
                <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-12 text-center">
                  <Image className="w-12 h-12 text-stone-600 mx-auto mb-4" />
                  <p className="text-stone-400">{t('profile.no_posts')} yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {portfolio.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-stone-900 cursor-pointer"
                    >
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400/1a1a1a/666?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-medium text-sm">{item.title}</h3>
                          {item.price_range && (
                            <p className="text-amber-500 text-xs mt-1">{item.price_range}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {products.length === 0 ? (
                <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-12 text-center">
                  <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto mb-4" />
                  <p className="text-stone-400">{t('profile.no_posts')} listed</p>
                  {isOwnProfile && (
                    <p className="text-stone-500 text-sm mt-2">Add products from your artist dashboard</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-stone-900/80 border border-stone-800 rounded-xl overflow-hidden"
                    >
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-white font-medium mb-1">{product.name}</h3>
                        {product.description && (
                          <p className="text-stone-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          {product.price && (
                            <span className="text-amber-500 font-bold">{product.price}</span>
                          )}
                          {product.product_link && (
                            <a
                              href={product.product_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Product
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">{t('artist.specialties')}</h3>
              {profile.bio ? (
                <p className="text-stone-300 leading-relaxed">{profile.bio}</p>
              ) : (
                <p className="text-stone-500">No bio provided</p>
              )}

              {/* Application Info */}
              <div className="mt-6 pt-6 border-t border-stone-800">
                <h4 className="text-sm font-medium text-stone-400 mb-3">Verified Information</h4>
                <div className="space-y-2">
                  {profile.location && (
                    <div className="flex items-center gap-2 text-stone-300">
                      <MapPin className="w-4 h-4 text-stone-500" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-stone-500" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer"
                         className="text-amber-500 hover:text-amber-400">
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Drawer */}
      <AnimatePresence>
        {showChat && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-stone-900 border-l border-stone-800 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <img
                    src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                    alt={profile.display_name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="text-white font-medium">{profile.display_name}</h3>
                    <p className="text-stone-500 text-xs">Usually responds within 24h</p>
                  </div>
                </div>
                <button onClick={() => setShowChat(false)} className="p-2 hover:bg-stone-800 rounded-full">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                    <p className="text-stone-400">Start the conversation!</p>
                    <p className="text-stone-500 text-sm mt-1">Ask about availability, pricing, or book a session</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        msg.sender_id === currentUser?.id
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-800 text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender_id === currentUser?.id ? 'text-stone-700' : 'text-stone-500'
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-stone-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 bg-stone-800 border border-stone-700 rounded-full px-4 py-3 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-amber-500 rounded-full hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5 text-stone-950" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
