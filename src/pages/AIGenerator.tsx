import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Wand2, Image as ImageIcon, AlertCircle, Lock, Crown, Zap, Download, Share2 } from 'lucide-react';
import { generateImageWithVolcengine } from '../services/volcengineImage';
import { useMembership, getPlanDescription } from '../hooks/useMembership';
import { useLanguage } from '../contexts/LanguageContext';
import type { Database } from '../supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AIGeneratorProps {
  user: Profile | null;
}

// 海外纹身风格选项 - 卡片式布局
function getTattooStyles(isZh: boolean) {
  return [
    { id: 'oriental', name: isZh ? '中式' : 'Oriental', nameZh: '中式', keywords: 'oriental style, traditional chinese art, ink wash painting, chinese dragon, phoenix', icon: '🏯' },
    { id: 'japanese', name: isZh ? '日式' : 'Japanese', nameZh: '日式', keywords: 'japanese tattoo, irezumi, traditional japanese art, bold outlines, cherry blossom, koi fish', icon: '⛩️' },
    { id: 'american-traditional', name: isZh ? '美式传统' : 'American Traditional', nameZh: '美式传统', keywords: 'american traditional tattoo, bold lines, vibrant colors, nautical themes, eagle, rose', icon: '🦅' },
    { id: 'neo-traditional', name: isZh ? '新传统' : 'Neo-Traditional', nameZh: '新传统', keywords: 'neo-traditional tattoo, bold colors, detailed illustrations, modern interpretation', icon: '🎨' },
    { id: 'blackwork', name: isZh ? '暗黑黑灰' : 'Dark & Blackwork', nameZh: '暗黑黑灰', keywords: 'blackwork tattoo, dark aesthetic, high contrast, bold black ink, tribal influence', icon: '🖤' },
    { id: 'watercolor', name: isZh ? '水彩' : 'Watercolor', nameZh: '水彩', keywords: 'watercolor tattoo style, ink wash effect, flowing colors, artistic brush strokes', icon: '💧' },
    { id: 'minimalist', name: isZh ? '极简线条' : 'Minimalist', nameZh: '极简线条', keywords: 'minimalist tattoo, fine line work, delicate designs, single needle technique', icon: '✒️' },
    { id: 'realism', name: isZh ? '写实' : 'Realism', nameZh: '写实', keywords: 'realistic tattoo, photorealistic style, detailed shading, portrait tattoo', icon: '📸' },
  ];
}

// 风格关键词映射表
const STYLE_KEYWORDS_MAP: Record<string, string> = {
  'oriental': 'oriental style, traditional chinese art, ink wash painting, chinese dragon, phoenix, mythological elements',
  'japanese': 'japanese tattoo, irezumi style, traditional japanese art, bold outlines, cherry blossom, koi fish, samurai',
  'american-traditional': 'american traditional tattoo, bold lines, vibrant colors, nautical themes, eagle, rose, classic tattoo design',
  'neo-traditional': 'neo-traditional tattoo, bold colors, detailed illustrations, modern twist on classic designs, rich shading',
  'blackwork': 'blackwork tattoo, dark aesthetic, high contrast, bold black ink, tribal influence, gothic elements',
  'watercolor': 'watercolor tattoo style, ink wash effect, flowing watercolor splashes, artistic brush strokes, colorful',
  'minimalist': 'minimalist tattoo, fine line work, delicate single line designs, subtle, elegant, single needle technique',
  'realism': 'realistic tattoo, photorealistic style, detailed shading, portrait tattoo, life-like rendering, high detail',
};

// 身体部位选项
const bodyParts = [
  { id: 'arm', name: 'arm', nameZh: '手臂' },
  { id: 'back', name: 'back', nameZh: '背部' },
  { id: 'chest', name: 'chest', nameZh: '胸部' },
  { id: 'wrist', name: 'wrist', nameZh: '手腕' },
  { id: 'collarbone', name: 'collarbone', nameZh: '锁骨' },
  { id: 'thigh', name: 'thigh', nameZh: '大腿' },
  { id: 'calf', name: 'calf', nameZh: '小腿' },
];

function LoginRequiredOverlay({ onLogin, onUpgrade, t }: { onLogin: () => void; onUpgrade: () => void; t: (key: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-ink-black/95 backdrop-blur-xl rounded-3xl"
    >
      <div className="text-center p-10 max-w-md">
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-imperial-gold-500/20 flex items-center justify-center border border-imperial-gold-500/30">
          <Lock className="w-12 h-12 text-imperial-gold-400" />
        </div>
        <h3 className="text-3xl font-display font-bold text-rice-paper mb-4">{t('nav.sign_in')}</h3>
        <p className="text-rice-paper/60 mb-8 text-base">
          {t('ai.sign_in_to_generate')}
        </p>
        <div className="space-y-4">
          <button
            onClick={onLogin}
            className="w-full py-4 px-6 bg-gradient-to-r from-china-red-600 to-china-red-700 text-white font-bold rounded-2xl hover:from-china-red-500 hover:to-china-red-600 transition-all shadow-red-glow"
          >
            {t('nav.sign_in')}
          </button>
          <button
            onClick={onUpgrade}
            className="w-full py-4 px-6 bg-white/5 border border-imperial-gold-500/30 text-imperial-gold-400 font-bold rounded-2xl hover:bg-imperial-gold-500/10 transition-all flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5" />
            {t('nav.upgrade')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function MembershipStatusBar({ user, membership, t, isZh }: { user: Profile; membership: ReturnType<typeof useMembership>; t: (key: string) => string; isZh: boolean }) {
  const { currentPlan, benefits, message } = membership;
  const isFree = currentPlan === 'free';

  return (
    <div className="mb-8 p-5 bg-white/5 backdrop-blur-sm border border-imperial-gold-500/20 rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isFree ? (
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-rice-paper/50" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-imperial-gold-500/20 flex items-center justify-center border border-imperial-gold-500/30">
              <Crown className="w-6 h-6 text-imperial-gold-400" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <span className={`font-bold text-lg ${isFree ? 'text-rice-paper/70' : 'text-imperial-gold-400'}`}>
                {user.display_name || user.username}
              </span>
              {isFree ? (
                <span className="text-xs px-3 py-1 bg-white/10 text-rice-paper/50 rounded-full">{t('pricing.free')}</span>
              ) : (
                <span className="text-xs px-3 py-1 bg-imperial-gold-500/20 text-imperial-gold-400 rounded-full border border-imperial-gold-500/30">
                  {getPlanDescription(currentPlan)}
                </span>
              )}
            </div>
            <p className={`text-sm mt-1 ${isFree ? 'text-imperial-gold-400' : 'text-rice-paper/50'}`}>
              {message || (benefits.isUnlimited ? (isZh ? '无限次生成！' : 'Unlimited generations!') : (isZh ? `最大分辨率: ${benefits.maxResolution}` : `Max resolution: ${benefits.maxResolution}`))}
            </p>
          </div>
        </div>
        {isFree && (
          <a
            href="#/pricing"
            className="px-6 py-3 bg-gradient-to-r from-imperial-gold-500 to-imperial-gold-600 text-ink-black text-sm font-bold rounded-xl hover:from-imperial-gold-400 hover:to-imperial-gold-500 transition-all shadow-gold"
          >
            {t('nav.upgrade')}
          </a>
        )}
      </div>
    </div>
  );
}

async function compressImage(file: File): Promise<{ base64: string; size: number; method: string }> {
  const originalSize = file.size;
  console.log(`[上传] 原始文件: ${file.name}, 大小: ${(originalSize / 1024).toFixed(1)}KB, 类型: ${file.type}`);

  try {
    const result = await compressWithCanvas(file);
    const compressedSize = Math.round(result.base64.length * 0.75);
    console.log(`[上传] Canvas压缩成功: ${(compressedSize / 1024).toFixed(1)}KB (压缩率: ${(compressedSize / originalSize * 100).toFixed(0)}%)`);
    return { base64: result.base64, size: compressedSize, method: 'canvas' };
  } catch (err) {
    console.warn(`[上传] Canvas压缩失败: ${err}, 尝试备选方案`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      console.log(`[上传] 使用原始文件上传: ${(base64.length * 0.75 / 1024).toFixed(1)}KB`);
      resolve({ base64, size: file.size, method: 'original' });
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

function compressWithCanvas(file: File): Promise<{ base64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;
          const MAX_BASE64 = 3 * 1024 * 1024;
          let quality = 0.8;
          let canvas: HTMLCanvasElement;
          let ctx: CanvasRenderingContext2D;

          for (let scale = 1; scale >= 0.2; scale -= 0.2) {
            const w = Math.round(width * scale);
            const h = Math.round(height * scale);
            canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            ctx = canvas.getContext('2d');
            if (!ctx) continue;
            ctx.drawImage(img, 0, 0, w, h);

            for (let q = quality; q >= 0.2; q -= 0.1) {
              const base64 = canvas.toDataURL('image/jpeg', q).split(',')[1];
              if (base64.length <= MAX_BASE64) {
                console.log(`[Canvas] 尺寸: ${w}x${h}, 质量: ${q.toFixed(1)}, 大小: ${(base64.length * 0.75 / 1024).toFixed(0)}KB`);
                resolve({ base64 });
                return;
              }
            }
          }

          canvas = document.createElement('canvas');
          canvas.width = 200;
          canvas.height = 200;
          ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 200, 200);
            const base64 = canvas.toDataURL('image/jpeg', 0.3).split(',')[1];
            resolve({ base64 });
            return;
          }
          reject(new Error('Canvas 处理失败'));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('FileReader 失败'));
    reader.readAsDataURL(file);
  });
}

export default function AIGenerator({ user }: AIGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('oriental');
  const [selectedBodyPart, setSelectedBodyPart] = useState('arm');
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const isZh = language === 'zh';

  const membership = useMembership(user);
  const { canGenerate, benefits, recordGeneration, getResolution } = membership;

  const handleLogin = () => {
    window.location.hash = '#/login';
  };

  const handleUpgrade = () => {
    window.location.hash = '#/pricing';
  };

  const handleGenerate = async () => {
    if (!user) return;
    if (!canGenerate) {
      setError(isZh ? '今日生成次数已用完，请明天再来或升级会员！' : 'Daily generation limit reached. Please try again tomorrow or upgrade!');
      return;
    }
    if (!prompt && mode === 'text') return;

    setLoading(true);
    setError(null);
    try {
      const styleKeywords = selectedStyle ? STYLE_KEYWORDS_MAP[selectedStyle] || '' : '';
      const bodyPartName = selectedBodyPart ? bodyParts.find(b => b.id === selectedBodyPart)?.name : '';
      const resolution = getResolution('1024x1024');
      const watermark = benefits.watermark;
      let fullPrompt: string;
      let result;

      if (mode === 'text') {
        fullPrompt = `${prompt}, ${styleKeywords}, ${bodyPartName ? `${bodyPartName} placement` : ''}, tattoo design, professional tattoo artist quality`;
        result = await generateImageWithVolcengine({
          prompt: fullPrompt,
          size: resolution,
          n: 1,
          watermark: watermark,
        });
      } else {
        fullPrompt = `${prompt}, tattoo design inspired by the provided reference image, keep the original shape/outline/structure, ${styleKeywords}, tattoo illustration, fine line work, high contrast`;
        result = await generateImageWithVolcengine({
          prompt: fullPrompt,
          image_url: uploadedImage!,
          size: resolution,
          n: 1,
          watermark: watermark,
        });
      }

      if (result.success && result.image_url) {
        setGeneratedImage(result.image_url);
        recordGeneration(result.image_url, resolution);
      } else {
        setError(result.error || (isZh ? '生成失败，请重试' : 'Generation failed, please try again'));
      }
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : (isZh ? '生成失败，请重试' : 'Generation failed, please try again'));
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const { base64: compressedBase64, method } = await compressImage(file);
      console.log(`[上传] 压缩方式: ${method}`);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: 'tattoo-images',
          fileName: file.name.replace(/\.[^.]+$/, '.jpg'),
          fileData: compressedBase64,
          contentType: method === 'original' ? file.type : 'image/jpeg',
        }),
      });

      const text = await response.text();
      let result: { success?: boolean; error?: string; publicUrl?: string };
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(`服务器响应异常: ${text.substring(0, 100)}`);
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || `上传失败 (${response.status})`);
      }

      setUploadedImage(result.publicUrl!);
      console.log('[上传] 成功:', result.publicUrl);
    } catch (err) {
      console.error('[上传] 失败:', err);
      setError(err instanceof Error ? err.message : (isZh ? '图片上传失败，请重试' : 'Image upload failed, please try again'));
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-black via-china-red-950/20 to-ink-black py-12">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold text-imperial-gold-400 mb-4">
            {t('ai.title')}
          </h1>
          <p className="text-rice-paper/60 text-xl">
            {t('ai.subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 左侧控制面板 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-imperial-gold-500/20 rounded-3xl p-8 relative"
          >
            {!user && <LoginRequiredOverlay onLogin={handleLogin} onUpgrade={handleUpgrade} t={t} />}
            {user && <MembershipStatusBar user={user} membership={membership} t={t} isZh={isZh} />}

            {/* 模式切换 - 毛玻璃卡片 */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setMode('text')}
                className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold ${
                  mode === 'text'
                    ? 'bg-gradient-to-r from-china-red-600 to-china-red-700 text-white shadow-red-glow'
                    : 'bg-white/5 text-rice-paper/70 hover:bg-white/10 border border-imperial-gold-500/20'
                }`}
              >
                <Wand2 className="w-5 h-5" />
                {t('ai.generate')}
              </button>
              <button
                onClick={() => setMode('image')}
                className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold ${
                  mode === 'image'
                    ? 'bg-gradient-to-r from-china-red-600 to-china-red-700 text-white shadow-red-glow'
                    : 'bg-white/5 text-rice-paper/70 hover:bg-white/10 border border-imperial-gold-500/20'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                {t('ai.share')}
              </button>
            </div>

            {/* 图片上传 */}
            {mode === 'image' && (
              <div className="mb-8">
                <label className="block w-full h-40 border-2 border-dashed border-imperial-gold-500/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-imperial-gold-500/60 hover:bg-imperial-gold-500/5 transition-all">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded" className="h-full object-contain rounded-xl" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-imperial-gold-400/50 mb-3" />
                      <span className="text-rice-paper/50">{isZh ? '上传参考图片' : 'Upload reference image'}</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            )}

            {/* 提示词输入 */}
            <div className="mb-8">
              <label className="block text-imperial-gold-400 mb-3 font-bold text-lg">{t('ai.prompt_placeholder').split('...')[0]}</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('ai.prompt_placeholder')}
                className="w-full h-40 bg-white/5 border border-imperial-gold-500/20 rounded-2xl p-5 text-rice-paper placeholder-rice-paper/30 focus:border-imperial-gold-500/50 focus:outline-none resize-none"
              />
            </div>

            {/* 风格选择 - 卡片式布局 */}
            <div className="mb-8">
              <label className="block text-imperial-gold-400 mb-4 font-bold text-lg">{t('ai.style')}</label>
              <div className="grid grid-cols-4 gap-3">
                {getTattooStyles(isZh).map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-2xl text-sm transition-all ${
                      selectedStyle === style.id
                        ? 'bg-gradient-to-br from-china-red-600 to-china-red-700 text-white shadow-red-glow'
                        : 'bg-white/5 text-rice-paper/70 hover:bg-white/10 border border-imperial-gold-500/20'
                    }`}
                  >
                    <div className="text-2xl mb-2">{style.icon}</div>
                    <div className="font-bold">{t(`style.${style.id}`)}</div>
                    <div className="text-xs opacity-70">{style.nameZh}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 身体部位选择 */}
            <div className="mb-8">
              <label className="block text-imperial-gold-400 mb-4 font-bold text-lg">{t('ai.body_part')}</label>
              <div className="flex flex-wrap gap-2">
                {bodyParts.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => setSelectedBodyPart(part.id)}
                    className={`px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                      selectedBodyPart === part.id
                        ? 'bg-gradient-to-r from-imperial-gold-500 to-imperial-gold-600 text-ink-black shadow-gold'
                        : 'bg-white/5 text-rice-paper/70 hover:bg-white/10 border border-imperial-gold-500/20'
                    }`}
                  >
                    {t(`body.${part.id}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* 水印提示 */}
            {user && benefits.watermark && (
              <div className="mb-6 p-4 bg-white/5 border border-imperial-gold-500/20 rounded-xl flex items-center gap-3 text-rice-paper/50 text-sm">
                <AlertCircle className="w-5 h-5 text-imperial-gold-400" />
                {t('pricing.watermark')}. <a href="#/pricing" className="text-imperial-gold-400 hover:underline font-bold">{t('pricing.upgrade')} to remove</a>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="mb-6 p-4 bg-china-red-500/20 border border-china-red-500/40 rounded-xl flex items-center gap-3 text-china-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* 生成按钮 - 中国红渐变大尺寸 */}
            <button
              onClick={handleGenerate}
              disabled={loading || !user || (!canGenerate) || (!prompt && mode === 'text') || (mode === 'image' && !uploadedImage)}
              className="w-full py-5 bg-gradient-to-r from-china-red-600 to-china-red-700 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:from-china-red-500 hover:to-china-red-600 transition-all shadow-red-glow hover:shadow-lg"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
              {!user ? t('ai.sign_in_to_generate') : loading ? t('ai.generating') : t('ai.generate')}
            </button>
          </motion.div>

          {/* 右侧结果展示 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-imperial-gold-500/20 rounded-3xl p-8 flex flex-col"
          >
            <h3 className="text-imperial-gold-400 font-bold text-xl mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {t('ai.preview')}
            </h3>
            <div className="flex-1 bg-ink-black/50 rounded-2xl border border-imperial-gold-500/20 flex items-center justify-center min-h-[500px]">
              {generatedImage ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={generatedImage}
                  alt="Generated tattoo"
                  className="max-w-full max-h-full rounded-xl"
                />
              ) : (
                <div className="text-center text-rice-paper/30">
                  <ImageIcon className="w-24 h-24 mx-auto mb-6 opacity-30" />
                  <p className="text-lg">{t('ai.your_design')}</p>
                </div>
              )}
            </div>
            {generatedImage && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(generatedImage);
                      const blob = await response.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `tattoo-${Date.now()}.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error('Download failed:', err);
                    }
                  }}
                  className="flex-1 py-4 bg-white/5 border border-imperial-gold-500/30 text-rice-paper rounded-xl hover:bg-imperial-gold-500/10 transition-all flex items-center justify-center gap-2 font-bold"
                >
                  <Download className="w-5 h-5" />
                  {t('ai.download')}
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: isZh ? '我的纹身设计' : 'My Tattoo Design',
                          text: isZh ? '看看我生成的纹身设计' : 'Check out my tattoo design',
                          url: generatedImage,
                        });
                      } else {
                        await navigator.clipboard.writeText(generatedImage);
                        alert(isZh ? '图片链接已复制到剪贴板' : 'Image link copied to clipboard');
                      }
                    } catch (err) {
                      console.error('Share failed:', err);
                    }
                  }}
                  className="flex-1 py-4 bg-white/5 border border-imperial-gold-500/30 text-rice-paper rounded-xl hover:bg-imperial-gold-500/10 transition-all flex items-center justify-center gap-2 font-bold"
                >
                  <Share2 className="w-5 h-5" />
                  {t('ai.share')}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
