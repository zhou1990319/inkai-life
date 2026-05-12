import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Wand2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { generateImageWithVolcengine, generateTattooFromImage } from '../services/volcengineImage';
import { uploadImage } from '../services/storage';

// 海外纹身风格选项 - 2行4列布局
const TATTOO_STYLES = [
  // 第一排
  { id: 'oriental', name: 'Oriental', nameZh: '中式', keywords: 'oriental style, traditional chinese art, ink wash painting, chinese dragon, phoenix' },
  { id: 'japanese', name: 'Japanese', nameZh: '日式', keywords: 'japanese tattoo, irezumi, traditional japanese art, bold outlines, cherry blossom, koi fish' },
  { id: 'american-traditional', name: 'American Traditional', nameZh: '美式传统', keywords: 'american traditional tattoo, bold lines, vibrant colors, nautical themes, eagle, rose' },
  { id: 'neo-traditional', name: 'Neo-Traditional', nameZh: '新传统', keywords: 'neo-traditional tattoo, bold colors, detailed illustrations, modern interpretation' },
  // 第二排
  { id: 'blackwork', name: 'Dark & Blackwork', nameZh: '暗黑黑灰', keywords: 'blackwork tattoo, dark aesthetic, high contrast, bold black ink, tribal influence' },
  { id: 'watercolor', name: 'Watercolor', nameZh: '水彩', keywords: 'watercolor tattoo style, ink wash effect, flowing colors, artistic brush strokes' },
  { id: 'minimalist', name: 'Minimalist', nameZh: '极简线条', keywords: 'minimalist tattoo, fine line work, delicate designs, single needle technique' },
  { id: 'realism', name: 'Realism', nameZh: '写实', keywords: 'realistic tattoo, photorealistic style, detailed shading, portrait tattoo' },
];

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

const bodyParts = [
  { id: 'arm', name: 'Arm' },
  { id: 'back', name: 'Back' },
  { id: 'chest', name: 'Chest' },
  { id: 'wrist', name: 'Wrist' },
  { id: 'collarbone', name: 'Collarbone' },
];

/**
 * 图片压缩函数 - 使用 Canvas 压缩到合理大小
 * 如果压缩失败，直接使用原文件（浏览器原生 base64）
 */
async function compressImage(file: File): Promise<{ base64: string; size: number; method: string }> {
  const originalSize = file.size;
  console.log(`[上传] 原始文件: ${file.name}, 大小: ${(originalSize / 1024).toFixed(1)}KB, 类型: ${file.type}`);

  // 方法1：尝试 Canvas 压缩
  try {
    const result = await compressWithCanvas(file);
    const compressedSize = Math.round(result.base64.length * 0.75);
    console.log(`[上传] Canvas压缩成功: ${(compressedSize / 1024).toFixed(1)}KB (压缩率: ${(compressedSize / originalSize * 100).toFixed(0)}%)`);
    return { base64: result.base64, size: compressedSize, method: 'canvas' };
  } catch (err) {
    console.warn(`[上传] Canvas压缩失败: ${err}, 尝试备选方案`);
  }

  // 方法2：备选 - 直接使用 FileReader base64（不做压缩）
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

/**
 * Canvas 压缩核心逻辑
 */
function compressWithCanvas(file: File): Promise<{ base64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          // 逐步缩小直到满足大小限制
          // 目标：base64 < 3MB (足够上传)
          const MAX_BASE64 = 3 * 1024 * 1024;

          let quality = 0.8;
          let canvas: HTMLCanvasElement;
          let ctx: CanvasRenderingContext2D;

          // 最多尝试 10 种尺寸组合
          for (let scale = 1; scale >= 0.2; scale -= 0.2) {
            const w = Math.round(width * scale);
            const h = Math.round(height * scale);

            canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            ctx = canvas.getContext('2d');
            if (!ctx) continue;

            ctx.drawImage(img, 0, 0, w, h);

            // 逐步降低质量
            for (let q = quality; q >= 0.2; q -= 0.1) {
              const base64 = canvas.toDataURL('image/jpeg', q).split(',')[1];
              if (base64.length <= MAX_BASE64) {
                console.log(`[Canvas] 尺寸: ${w}x${h}, 质量: ${q.toFixed(1)}, 大小: ${(base64.length * 0.75 / 1024).toFixed(0)}KB`);
                resolve({ base64 });
                return;
              }
            }
          }

          // 最后尝试：极小尺寸 + 最低质量
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

export default function AIGenerator() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('oriental');
  const [selectedBodyPart, setSelectedBodyPart] = useState('arm');
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt && mode === 'text') return;
    setLoading(true);
    setError(null);
    try {
      // 获取选中风格的关键词
      const styleKeywords = selectedStyle ? STYLE_KEYWORDS_MAP[selectedStyle] || '' : '';
      const bodyPartName = selectedBodyPart ? bodyParts.find(b => b.id === selectedBodyPart)?.name : '';
      let fullPrompt: string;
      let result;

      if (mode === 'text') {
        // 文生图：使用用户描述 + 风格关键词
        fullPrompt = `${prompt}, ${styleKeywords}, ${bodyPartName ? `${bodyPartName} placement` : ''}, tattoo design, professional tattoo artist quality`;

        result = await generateImageWithVolcengine({
          prompt: fullPrompt,
          size: '1024x1024',
          n: 1,
          watermark: false,
        });
      } else {
        // 图生图：以原图为基础，融入纹身风格
        fullPrompt = `${prompt}, tattoo design inspired by the provided reference image, keep the original shape/outline/structure, ${styleKeywords}, tattoo illustration, fine line work, high contrast`;

        result = await generateImageWithVolcengine({
          prompt: fullPrompt,
          image_url: uploadedImage!,
          size: '1024x1024',
          n: 1,
          watermark: false,
        });
      }

      if (result.success && result.image_url) {
        setGeneratedImage(result.image_url);
      } else {
        setError(result.error || '生成失败，请重试');
      }
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      // 压缩图片（带备用方案，压缩失败则用原图）
      const { base64: compressedBase64, method } = await compressImage(file);
      console.log(`[上传] 压缩方式: ${method}`);

      // 通过服务端 API 上传（使用 JPEG 格式）
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
      setError(err instanceof Error ? err.message : '图片上传失败，请重试');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-4">
            AI Tattoo Generator
          </h1>
          <p className="text-slate-400 text-lg">
            Create stunning Chinese traditional tattoo designs with AI
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 border border-amber-500/20 rounded-2xl p-6"
          >
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setMode('text')}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  mode === 'text'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Wand2 className="w-5 h-5" />
                Text to Tattoo
              </button>
              <button
                onClick={() => setMode('image')}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  mode === 'image'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                Image to Tattoo
              </button>
            </div>

            {mode === 'image' && (
              <div className="mb-6">
                <label className="block w-full h-32 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 transition-colors">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded" className="h-full object-contain" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-slate-400">Upload reference image</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-amber-400 mb-2 font-medium">Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your tattoo idea..."
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-amber-400 mb-3 font-medium">Style</label>
              <div className="grid grid-cols-4 gap-2">
                {TATTOO_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-lg text-sm transition-all ${
                      selectedStyle === style.id
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="font-medium">{style.name}</div>
                    <div className="text-xs opacity-70">{style.nameZh}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-amber-400 mb-3 font-medium">Body Part</label>
              <div className="flex gap-2">
                {bodyParts.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => setSelectedBodyPart(part.id)}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                      selectedBodyPart === part.id
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {part.name}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || (!prompt && mode === 'text') || (mode === 'image' && !uploadedImage)}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-amber-400 hover:to-amber-500 transition-all"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {loading ? 'Generating...' : 'Generate Tattoo'}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 border border-amber-500/20 rounded-2xl p-6 flex flex-col"
          >
            <h3 className="text-amber-400 font-medium mb-4">Preview</h3>
            <div className="flex-1 bg-slate-950 rounded-xl flex items-center justify-center min-h-[400px]">
              {generatedImage ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={generatedImage}
                  alt="Generated tattoo"
                  className="max-w-full max-h-full rounded-lg"
                />
              ) : (
                <div className="text-center text-slate-500">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Your tattoo design will appear here</p>
                </div>
              )}
            </div>
            {generatedImage && (
              <div className="mt-4 flex gap-3">
                <button className="flex-1 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                  Download HD
                </button>
                <button className="flex-1 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                  Share
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
