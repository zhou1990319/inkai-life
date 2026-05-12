// ============================================
// InkAI 发布帖子页面 (Create)
// 支持多图上传、文字描述、标签、权限设置
// ============================================

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ImagePlus, X, Sparkles, ChevronDown, ChevronUp,
  Globe, Users, Lock, MapPin, Loader2, Eye, Check
} from 'lucide-react';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';
import { ImageUploader, VisibilitySelector } from '../components/Community';
import { PostService, TagService } from '../services/community';
import { useLanguage } from '../contexts/LanguageContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

const PRESET_STYLES = [
  'BlackAndGrey', 'Traditional', 'WatercolorTattoo', 'JapaneseTattoo',
  'ChineseTattoo', 'Minimalist', 'GeometricTattoo', 'RealisticTattoo',
  'DragonTattoo', 'ScriptTattoo', 'FloralTattoo', 'SkullTattoo',
  'AnimalTattoo', 'NeoTraditional', 'FineLineTattoo'
];

const BODY_PARTS = [
  'Arm', 'Back', 'Chest', 'Wrist', 'Ankle', 'Shoulder',
  'Leg', 'Neck', 'Finger', 'Ribs', 'Forearm', 'Calf'
];

const POST_TYPES = [
  { id: 'handwork', label: 'Handwork', desc: 'Traditional hand-drawn design', icon: '✋' },
  { id: 'finished', label: 'Finished Work', desc: 'Completed tattoo on skin', icon: '🎨' },
  { id: 'ai_generated', label: 'AI Generated', desc: 'Created with AI tools', icon: '✨' },
  { id: 'daily', label: 'Daily Share', desc: 'Behind the scenes /日常', icon: '📸' },
];

export default function Create() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [postType, setPostType] = useState<string>('finished');
  const [location, setLocation] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查登录
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setCurrentUser(data);
            } else {
              navigate('/login');
            }
          });
      } else {
        navigate('/login');
      }
    });
  }, []);

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const addCustomTag = () => {
    const tag = customTag.trim().replace(/^#/, '').toLowerCase();
    if (tag && !selectedStyles.includes(tag)) {
      setSelectedStyles(prev => [...prev, tag]);
    }
    setCustomTag('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your post');
      return;
    }
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }
    if (!currentUser) {
      setError('Please login first');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const isAiGenerated = postType === 'ai_generated';

      const post = await PostService.createPost({
        userId: currentUser.id,
        title: title.trim(),
        description: description.trim() || undefined,
        imageUrls: images,
        style: selectedStyles,
        bodyPart: selectedBodyPart || undefined,
        visibility,
        location: location.trim() || undefined,
        isAiGenerated,
      });

      // 创建标签关联
      for (const tag of selectedStyles) {
        const tagId = await TagService.getOrCreateTag(tag);
        await supabase.from('post_tag_relations').insert({
          post_id: post.id,
          tag_id: tagId,
        });
      }

      alert('Post published successfully! 🎉');
      navigate(`/post/${post.id}`);
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(err.message || 'Failed to publish post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0E]">
      {/* 顶部导航 */}
      <div className="sticky top-16 z-40 bg-[#0B0B0E]/95 backdrop-blur-md border-b border-[#2A2A36]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-[#B0B0B8] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <h1 className="text-white font-semibold">{t('create.title')}</h1>
          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim() || images.length === 0}
            className="px-4 py-1.5 bg-[#9E2B25] text-white rounded-full text-sm font-medium hover:bg-[#B8342D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {t('create.posting')}...
              </>
            ) : t('create.post')}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-[#9E2B25]/10 border border-[#9E2B25]/30 rounded-xl text-[#9E2B25] text-sm flex items-center gap-2"
          >
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {/* 图片上传 */}
        <div className="bg-[#18181F] rounded-2xl border border-[#2A2A36] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">{t('create.select_images')}</h2>
            {images.length > 0 && (
              <span className="text-[#6B6B78] text-xs">{images.length}/9</span>
            )}
          </div>
          <ImageUploader
            images={images}
            onChange={setImages}
            maxImages={9}
            userId={currentUser?.id}
          />
        </div>

        {/* 标题 */}
        <div className="bg-[#18181F] rounded-2xl border border-[#2A2A36] p-5 space-y-3">
          <h2 className="text-white font-semibold">{t('create.title')} *</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your work a compelling title..."
            maxLength={100}
            className="w-full bg-[#1E1E27] border border-[#2A2A36] rounded-xl px-4 py-3 text-white placeholder-[#6B6B78] focus:border-[#CFAF6E]/50 focus:outline-none transition-colors text-sm"
          />
          <div className="flex items-center justify-between">
            <span className="text-[#6B6B78] text-xs">{title.length}/100</span>
          </div>
        </div>

        {/* 描述 */}
        <div className="bg-[#18181F] rounded-2xl border border-[#2A2A36] p-5 space-y-3">
          <h2 className="text-white font-semibold">Description</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell the story behind your work — inspiration, meaning, process..."
            rows={4}
            maxLength={500}
            className="w-full bg-[#1E1E27] border border-[#2A2A36] rounded-xl px-4 py-3 text-white placeholder-[#6B6B78] focus:border-[#CFAF6E]/50 focus:outline-none transition-colors resize-none text-sm"
          />
          <div className="flex justify-end">
            <span className="text-[#6B6B78] text-xs">{description.length}/500</span>
          </div>
        </div>

        {/* 作品类型 */}
        <div className="bg-[#18181F] rounded-2xl border border-[#2A2A36] p-5 space-y-3">
          <h2 className="text-white font-semibold">{t('create.post_type')}</h2>
          <div className="grid grid-cols-2 gap-2">
            {POST_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setPostType(type.id)}
                className={`
                  p-3 rounded-xl border transition-all text-left
                  ${postType === type.id
                    ? 'border-[#CFAF6E]/50 bg-[#CFAF6E]/5'
                    : 'border-[#2A2A36] hover:border-[#2A2A36]/80'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{type.icon}</span>
                  <span className={`text-sm font-medium ${postType === type.id ? 'text-white' : 'text-[#B0B0B8]'}`}>
                    {type.label}
                  </span>
                </div>
                <p className="text-[#6B6B78] text-[10px]">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 风格标签 */}
        <div className="bg-[#18181F] rounded-2xl border border-[#2A2A36] p-5 space-y-3">
          <h2 className="text-white font-semibold">{t('create.tags')}</h2>
          <div className="flex flex-wrap gap-2">
            {PRESET_STYLES.map(style => (
              <button
                key={style}
                onClick={() => toggleStyle(style)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1
                  ${selectedStyles.includes(style)
                    ? 'bg-[#9E2B25] text-white border border-[#9E2B25]'
                    : 'bg-[#1E1E27] text-[#B0B0B8] border border-[#2A2A36] hover:border-[#9E2B25]/40'
                  }
                `}
              >
                {selectedStyles.includes(style) && <Check className="w-3 h-3" />}
                {style}
              </button>
            ))}
          </div>
          {/* 自定义标签 */}
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              placeholder="Add custom tag..."
              className="flex-1 bg-[#1E1E27] border border-[#2A2A36] rounded-xl px-3 py-2 text-sm text-white placeholder-[#6B6B78] focus:border-[#CFAF6E]/50 focus:outline-none transition-colors"
            />
            <button
              onClick={addCustomTag}
              className="px-4 py-2 bg-[#1E1E27] border border-[#2A2A36] rounded-xl text-[#B0B0B8] hover:text-[#CFAF6E] hover:border-[#CFAF6E]/40 transition-colors text-sm"
            >
              Add
            </button>
          </div>
        </div>

        {/* 高级选项 */}
        <div className="bg-[#18181F] rounded-2xl border border-[#2A2A36] overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-5 flex items-center justify-between text-left"
          >
            <h2 className="text-white font-semibold">Options</h2>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-[#6B6B78]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6B6B78]" />
            )}
          </button>

          {showAdvanced && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              className="px-5 pb-5 space-y-5 overflow-hidden"
            >
              {/* 身体部位 */}
              <div className="space-y-3">
                <h3 className="text-[#B0B0B8] text-sm">Body Placement</h3>
                <div className="flex flex-wrap gap-2">
                  {BODY_PARTS.map(part => (
                    <button
                      key={part}
                      onClick={() => setSelectedBodyPart(prev => prev === part ? '' : part)}
                      className={`
                        px-3 py-1.5 rounded-full text-xs transition-all
                        ${selectedBodyPart === part
                          ? 'bg-[#CFAF6E] text-[#0B0B0E] font-medium'
                          : 'bg-[#1E1E27] text-[#B0B0B8] border border-[#2A2A36] hover:border-[#2A2A36]/80'
                        }
                      `}
                    >
                      {part}
                    </button>
                  ))}
                </div>
              </div>

              {/* 可见性 */}
              <div className="space-y-3">
                <h3 className="text-[#B0B0B8] text-sm">Who Can See This</h3>
                <VisibilitySelector value={visibility} onChange={setVisibility} />
              </div>

              {/* 位置 */}
              <div className="space-y-3">
                <h3 className="text-[#B0B0B8] text-sm">Location (Optional)</h3>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B78]" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Los Angeles, CA"
                    className="w-full bg-[#1E1E27] border border-[#2A2A36] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#6B6B78] focus:border-[#CFAF6E]/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 预览区块 */}
        <div className="bg-[#18181F] rounded-2xl border border-[#2A2A36] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#6B6B78]" />
            <h2 className="text-white font-semibold">Preview</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedStyles.map(tag => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-[#0B0B0E] text-[#CFAF6E] text-xs rounded-full border border-[#CFAF6E]/25"
              >
                #{tag}
              </span>
            ))}
            {images.length > 0 && (
              <span className="px-2.5 py-1 bg-[#0B0B0E] text-[#9E2B25] text-xs rounded-full border border-[#9E2B25]/25">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </span>
            )}
            <span className={`px-2.5 py-1 bg-[#0B0B0E] text-xs rounded-full border border-[#2A2A36] flex items-center gap-1 ${
              visibility === 'public' ? 'text-white' : visibility === 'followers' ? 'text-[#CFAF6E]' : 'text-[#6B6B78]'
            }`}>
              {visibility === 'public' && <Globe className="w-3 h-3" />}
              {visibility === 'followers' && <Users className="w-3 h-3" />}
              {visibility === 'private' && <Lock className="w-3 h-3" />}
              {visibility === 'public' ? 'Public' : visibility === 'followers' ? 'Followers' : 'Private'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
