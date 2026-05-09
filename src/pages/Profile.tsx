import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type TattooPost = Database['public']['Tables']['tattoo_posts']['Row'];

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<TattooPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'works' | 'saved' | 'ai'>('works');

  useEffect(() => {
    fetchProfile();
  }, [username]);

  async function fetchProfile() {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileData) {
        setProfile(profileData);
        fetchUserPosts(profileData.id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserPosts(userId: string) {
    const { data } = await supabase
      .from('tattoo_posts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (data) setPosts(data);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-slate-400">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-3xl font-bold text-white">
              {profile.display_name?.[0] || profile.username[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">{profile.display_name || profile.username}</h1>
              <p className="text-slate-400 mb-2">@{profile.username}</p>
              {profile.bio && <p className="text-slate-300 mb-4">{profile.bio}</p>}
              {profile.is_artist && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                  <i className="fas fa-paint-brush" />
                  Tattoo Artist
                </span>
              )}
              <div className="flex gap-6 mt-4 text-sm">
                <span className="text-slate-300"><strong className="text-white">{profile.followers_count || 0}</strong> followers</span>
                <span className="text-slate-300"><strong className="text-white">{profile.following_count || 0}</strong> following</span>
              </div>
            </div>
            <button className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-full transition-colors">
              Follow
            </button>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-6">
          {(['works', 'saved', 'ai'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
            >
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-medium truncate">{post.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-300">
                    <span><i className="fas fa-heart mr-1" />{post.likes_count}</span>
                    <span><i className="fas fa-comment mr-1" />{post.comments_count}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
