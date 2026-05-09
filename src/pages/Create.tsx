import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { supabase } from '../supabase/client';

const styles = [
  'Ink Wash', 'Dragon', 'Phoenix', 'Dunhuang', 'Mythical',
  'Calligraphy', 'Opera Mask', 'Totem', 'Koi', 'Taoist'
];

export default function Create() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleSubmit = async () => {
    if (!title || !image) return;
    setLoading(true);
    // Upload and create post logic here
    setLoading(false);
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
            <Sparkles className="text-[#c41e3a]" />
            Create Post
          </h1>

          <div className="mb-6">
            <label className="block text-gray-400 mb-2">Upload Image</label>
            <div className="relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full aspect-square object-cover rounded-xl"
                />
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-[#2a2a2a] rounded-xl cursor-pointer hover:border-[#c41e3a] transition-colors">
                  <Upload className="w-12 h-12 text-gray-500 mb-2" />
                  <span className="text-gray-500">Click to upload</span>
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

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your work a title"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:border-[#c41e3a] focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your tattoo..."
              rows={3}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white focus:border-[#c41e3a] focus:outline-none resize-none"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 mb-2">Style Tags</label>
            <div className="flex flex-wrap gap-2">
              {styles.map(style => (
                <button
                  key={style}
                  onClick={() => toggleStyle(style)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedStyles.includes(style)
                      ? 'bg-[#c41e3a] text-white'
                      : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:border-[#c41e3a]'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !title || !image}
            className="w-full py-4 bg-[#c41e3a] text-white font-semibold rounded-xl hover:bg-[#a01830] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
