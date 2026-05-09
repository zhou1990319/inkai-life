import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Bookmark, Share2, MessageCircle, User } from 'lucide-react';
import { supabase } from '../supabase/client';

interface Post {
  id: string;
  title: string;
  description: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
  style: string[];
  user: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string;
  };
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  async function fetchPost() {
    if (!id) return;
    const { data } = await supabase
      .from('tattoo_posts')
      .select('*, user:profiles!user_id(id, username, avatar_url)')
      .eq('id', id)
      .single();
    if (data) setPost(data as Post);
    fetchComments();
    setLoading(false);
  }

  async function fetchComments() {
    if (!id) return;
    const { data } = await supabase
      .from('comments')
      .select('*, user:profiles!user_id(username, avatar_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: false });
    if (data) setComments(data as Comment[]);
  }

  async function handleLike() {
    setLiked(!liked);
  }

  async function handleSave() {
    setSaved(!saved);
  }

  async function handleComment() {
    if (!newComment.trim() || !id) return;
    setNewComment('');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#c9a050]">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#141414] rounded-2xl overflow-hidden"
          >
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full aspect-[3/4] object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <img
                src={post.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.username}`}
                alt={post.user.username}
                className="w-12 h-12 rounded-full border-2 border-[#c9a050]"
              />
              <div>
                <Link to={`/profile/${post.user.username}`} className="text-white font-medium hover:text-[#c9a050]">
                  {post.user.username}
                </Link>
                <p className="text-gray-400 text-sm">Tattoo Artist</p>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{post.title}</h1>
              <p className="text-gray-300">{post.description}</p>
            </div>

            {post.style && post.style.length > 0 && (
              <div className="flex gap-2">
                {post.style.map((s) => (
                  <span key={s} className="px-3 py-1 bg-[#c9a050]/20 text-[#c9a050] rounded-full text-sm">
                    {s}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 py-4 border-t border-b border-[#2a2a2a]">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  liked ? 'text-red-500' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Heart className={liked ? 'fill-current' : ''} size={20} />
                <span>{post.likes_count + (liked ? 1 : 0)}</span>
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  saved ? 'text-[#c9a050]' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Bookmark className={saved ? 'fill-current' : ''} size={20} />
                <span>Save</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-400 hover:text-white transition-colors">
                <Share2 size={20} />
                <span>Share</span>
              </button>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <MessageCircle size={18} />
                Comments ({comments.length})
              </h3>
              <div className="space-y-4 mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.username}`}
                      alt={comment.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-[#c9a050] text-sm font-medium">{comment.user.username}</p>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-4 py-2 text-white placeholder-gray-500 focus:border-[#c9a050] focus:outline-none"
                />
                <button
                  onClick={handleComment}
                  className="px-6 py-2 bg-[#c9a050] text-black font-medium rounded-full hover:bg-[#d4af37] transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
