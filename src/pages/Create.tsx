// ============================================
// InkAI 发布帖子页面 (Create)
// 支持多图上传、文字描述、标签、权限设�?
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

const BODY_PARTS_ZH: Record<string, string> = {
  'Arm': '手臂', 'Back': '背部', 'Chest': '胸部', 'Wrist': '手腕',
  'Ankle': '脚踝', 'Shoulder': '肩膀', 'Leg': '腿部', 'Neck': '颈部',
  'Finger': '手指', 'Ribs': '肋骨', 'Forearm': '前臂', 'Calf': '小腿'
};

const getPostTypes = (isZh: boolean) => [
  { id: 'handwork', label: isZh ? '手绘�? : 'Handwork', desc: isZh ? '传统手绘设计' : 'Traditional hand-drawn design', icon: '�? },
  { id: 'finished', label: isZh ? '成品作品' : 'Finished Work', desc: isZh ? '皮肤上的完成纹身' : 'Completed tattoo on skin', icon: '🎨' },
  { id: 'ai_generated', label: isZh ? 'AI 生成' : 'AI Generated', desc: isZh ? '使用 AI 工具创作' : 'Created with AI tools', icon: '�? },
  { id: 'daily', label: isZh ? '日常分享' : 'Daily Share', desc: isZh ? '幕后花絮 / 日常' : 'Behind the scenes / daily', icon: '📸' },
];

export default function Create() {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';
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

  const POST_TYPES = getPostTypes(isZh);

  // 检查登�?
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
      setError(isZh ? '请输入帖子标�? : 'Please enter a title for your post');
      return;
    }
    if (images.length === 0) {
      setError(isZh ? '请至少上传一张图�? : 'Please upload at least one image');
      return;
    }
    if (!currentUser) {
      setError(isZh ? '请先登录' : 'Please login first');
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

      alert(isZh ? '帖子发布成功！�? : 'Post published successfully! 🎉');
      navigate(`/post/${post.id}`);
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(err.message || (isZh ? '发布失败，请重试�? : 'Failed to publish post. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-black transition-colors"
          >
            {isZh ? '取消' : 'Cancel'}
          </button>
          <h1 className="text-white font-semibold">{t('create.title')}</h1>
          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim() || images.length === 0}
            className="px-4 py-1.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
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
            className="p-4 bg-black/10 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2"
          >
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {/* 图片上传 */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">{t('create.select_images')}</h2>
            {images.length > 0 && (
              <span className="text-gray-400 text-xs">{images.length}/9</span>
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
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-white font-semibold">{t('create.title')} *</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isZh ? '给你的作品起一个吸引人的标�?..' : 'Give your work a compelling title...'}
            maxLength={100}
            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:border-gray-400 focus:outline-none transition-colors text-sm"
          />
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">{title.length}/100</span>
          </div>
        </div>

        {/* 描述 */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-white font-semibold">{isZh ? '描述' : 'Description'}</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isZh ? '讲述作品背后的故�?�?灵感、含义、创作过�?..' : 'Tell the story behind your work �?inspiration, meaning, process...'}
            rows={4}
            maxLength={500}
            className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:border-gray-400 focus:outline-none transition-colors resize-none text-sm"
          />
          <div className="flex justify-end">
            <span className="text-gray-400 text-xs">{description.length}/500</span>
          </div>
        </div>

        {/* 作品类型 */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-white font-semibold">{t('create.post_type')}</h2>
          <div className="grid grid-cols-2 gap-2">
            {POST_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setPostType(type.id)}
                className={`
                  p-3 rounded-xl border transition-all text-left
                  ${postType === type.id
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-200/80'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{type.icon}</span>
                  <span className={`text-sm font-medium ${postType === type.id ? 'text-white' : 'text-gray-500'}`}>
                    {type.label}
                  </span>
                </div>
                <p className="text-gray-400 text-[10px]">{type.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 风格标签 */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-white font-semibold">{t('create.tags')}</h2>
          <div className="flex flex-wrap gap-2">
            {PRESET_STYLES.map(style => (
              <button
                key={style}
                onClick={() => toggleStyle(style)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1
                  ${selectedStyles.includes(style)
                    ? 'bg-black text-white border border-[#9E2B25]'
                    : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {selectedStyles.includes(style) && <Check className="w-3 h-3" />}
                {style}
              </button>
            ))}
          </div>
          {/* 自定义标�?*/}
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              placeholder={isZh ? '添加自定义标�?..' : 'Add custom tag...'}
              className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-black placeholder-gray-500 focus:border-gray-400 focus:outline-none transition-colors"
            />
            <button
              onClick={addCustomTag}
              className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:text-amber-600 hover:border-amber-200 transition-colors text-sm"
            >
              {isZh ? '添加' : 'Add'}
            </button>
          </div>
        </div>

        {/* 高级选项 */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-5 flex items-center justify-between text-left"
          >
            <h2 className="text-white font-semibold">{isZh ? '更多选项' : 'Options'}</h2>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
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
                <h3 className="text-gray-500 text-sm">{isZh ? '纹身位置' : 'Body Placement'}</h3>
                <div className="flex flex-wrap gap-2">
                  {BODY_PARTS.map(part => (
                    <button
                      key={part}
                      onClick={() => setSelectedBodyPart(prev => prev === part ? '' : part)}
                      className={`
                        px-3 py-1.5 rounded-full text-xs transition-all
                        ${selectedBodyPart === part
                          ? 'bg-amber-600 text-[#0B0B0E] font-medium'
                          : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-gray-200/80'
                        }
                      `}
                    >
                      {isZh ? BODY_PARTS_ZH[part] : part}
                    </button>
                  ))}
                </div>
              </div>

              {/* 可见�?*/}
              <div className="space-y-3">
                <h3 className="text-gray-500 text-sm">{isZh ? '谁可以看' : 'Who Can See This'}</h3>
                <VisibilitySelector value={visibility} onChange={setVisibility} />
              </div>

              {/* 位置 */}
              <div className="space-y-3">
                <h3 className="text-gray-500 text-sm">{isZh ? '位置（可选）' : 'Location (Optional)'}</h3>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={isZh ? '例如：北京，中国' : 'e.g. Los Angeles, CA'}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-black placeholder-gray-500 focus:border-gray-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 预览区块 */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <h2 className="text-white font-semibold">{isZh ? '预览' : 'Preview'}</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedStyles.map(tag => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-white text-amber-600 text-xs rounded-full border border-amber-200"
              >
                #{tag}
              </span>
            ))}
            {images.length > 0 && (
              <span className="px-2.5 py-1 bg-white text-red-600 text-xs rounded-full border border-[#9E2B25]/25">
                {images.length} {images.length === 1 ? (isZh ? '张图�? : 'image') : (isZh ? '张图�? : 'images')}
              </span>
            )}
            <span className={`px-2.5 py-1 bg-white text-xs rounded-full border border-gray-200 flex items-center gap-1 ${
              visibility === 'public' ? 'text-white' : visibility === 'followers' ? 'text-amber-600' : 'text-gray-400'
            }`}>
              {visibility === 'public' && <Globe className="w-3 h-3" />}
              {visibility === 'followers' && <Users className="w-3 h-3" />}
              {visibility === 'private' && <Lock className="w-3 h-3" />}
              {visibility === 'public' ? (isZh ? '公开' : 'Public') : visibility === 'followers' ? (isZh ? '关注�? : 'Followers') : (isZh ? '私密' : 'Private')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

