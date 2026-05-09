import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Sparkles, X, Check } from 'lucide-react';
import { supabase } from '../supabase/client';
import { uploadImage } from '../services/storage';
import { useNavigate } from 'react-router-dom';

const styles = [
  { id: 'ink-wash', name: 'Ink Wash', icon: '水墨' },
  { id: 'dragon', name: 'Dragon', icon: '龙' },
  { id: 'phoenix', name: 'Phoenix', icon: '凤' },
  { id: 'dunhuang', name: 'Dunhuang', icon: '敦煌' },
  { id: 'mythical', name: 'Mythical Beasts', icon: '神兽' },
  { id: 'calligraphy', name: 'Calligraphy', icon: '书法' },
  { id: 'opera', name: 'Opera Mask', icon: '脸谱' },
  { id: 'totem', name: 'Totem', icon: '图腾' },
  { id: 'koi', name: 'Koi Fish', icon: '锦鲤' },
  { id: 'lotus', name: 'Lotus', icon: '荷花' },
];

const bodyParts = [
  { id: 'arm', name: 'Arm' },
  { id: 'back', name: 'Back' },
  { id: 'chest', name: 'Chest' },
  { id: 'wrist', name: 'Wrist' },
  { id: 'ankle', name: 'Ankle' },
  { id: 'shoulder', name: 'Shoulder' },
];

export default function Create() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUser(data);
      }
    };
    getUser();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setError(null);
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId)
        ? prev.filter(s => s !== styleId)
        : [...prev, styleId]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!image) {
      setError('Please upload an image');
      return;
    }
    if (!user?.id) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Upload image to Supabase storage
      const { publicUrl } = await uploadImage(image, 'tattoo-images');

      // 2. Create post in database
      const { data: post, error: postError } = await supabase
        .from('tattoo_posts')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          image_url: publicUrl,
          user_id: user.id,
          style: selectedStyles.length > 0 ? selectedStyles : null,
          body_part: selectedBodyPart || null,
          is_public: true,
          likes_count: 0,
          comments_count: 0,
          saves_count: 0,
          views_count: 0,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Success! Navigate to the post
      alert('Post published successfully!');
      navigate(`/post/${post.id}`);
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-24">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141414] rounded-2xl p-6 border border-[#2a2a2a]"
        >
          <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="text-amber-500" />
            Create Post
          </h1>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-gray-400 mb-2">Upload Image *</label>
            <div className="relative">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                  <button
                    onClick={() => {
                      setImage(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-[#2a2a2a] rounded-xl cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all">
                  <Upload className="w-12 h-12 text-gray-500 mb-2" />
                  <span className="text-gray-500 text-sm">Click to upload</span>
                  <span className="text-gray-600 text-xs mt-1">Max 10MB</span>
                </label>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your work a title"
              maxLength={100}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
            />
            <span className="text-gray-600 text-xs mt-1">{title.length}/100</span>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your tattoo design, inspiration, story..."
              rows={4}
              maxLength={500}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:outline-none resize-none"
            />
            <span className="text-gray-600 text-xs">{description.length}/500</span>
          </div>

          {/* Style Tags */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-3">Style Tags</label>
            <div className="flex flex-wrap gap-2">
              {styles.map(style => (
                <button
                  key={style.id}
                  onClick={() => toggleStyle(style.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-1 ${
                    selectedStyles.includes(style.id)
                      ? 'bg-amber-500 text-black'
                      : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:border-amber-500/50'
                  }`}
                >
                  {selectedStyles.includes(style.id) && <Check className="w-3 h-3" />}
                  <span>{style.name}</span>
                  <span className="text-xs opacity-60">{style.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Body Part */}
          <div className="mb-6">
            <label className="block text-gray-400 mb-3">Body Placement (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {bodyParts.map(part => (
                <button
                  key={part.id}
                  onClick={() => setSelectedBodyPart(part.id === selectedBodyPart ? '' : part.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    selectedBodyPart === part.id
                      ? 'bg-amber-500 text-black'
                      : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:border-amber-500/50'
                  }`}
                >
                  {part.name}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !image}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                />
                Publishing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Publish Post
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
