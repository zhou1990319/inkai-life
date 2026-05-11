import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Upload, Wand2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { generateImageWithVolcengine, generateTattooFromImage } from '../services/volcengineImage';
import { uploadImage } from '../services/storage';

const styles = [
  { id: 'ink-wash', name: 'Ink Wash', icon: '水墨' },
  { id: 'dragon-phoenix', name: 'Dragon & Phoenix', icon: '龙凤' },
  { id: 'dunhuang', name: 'Dunhuang', icon: '敦煌' },
  { id: 'mythical', name: 'Mythical Beasts', icon: '神兽' },
  { id: 'calligraphy', name: 'Calligraphy', icon: '书法' },
  { id: 'opera', name: 'Opera Mask', icon: '脸谱' },
  { id: 'totem', name: 'Totem', icon: '图腾' },
  { id: 'koi', name: 'Koi & Flowers', icon: '锦鲤' },
];

const bodyParts = [
  { id: 'arm', name: 'Arm' },
  { id: 'back', name: 'Back' },
  { id: 'chest', name: 'Chest' },
  { id: 'wrist', name: 'Wrist' },
  { id: 'collarbone', name: 'Collarbone' },
];

/**
 * 使用 Canvas 压缩图片到合理大小
 * @param file 原始图片文件
 * @param maxWidth 最大宽度（像素）
 * @param quality 压缩质量 0-1
 * @returns base64 编码的压缩后图片
 */
function compressImage(file: File, maxWidth: number = 600, quality: number = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 计算压缩后的尺寸
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // 使用 Canvas 绘制
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // 强制转换为 JPEG 格式以支持有效压缩
        // PNG 不支持 quality 参数，JPEG 才能压缩
        let outputType = 'image/jpeg';
        let currentQuality = quality;
        let compressedBase64 = canvas.toDataURL(outputType, currentQuality).split(',')[1];

        // 如果压缩后仍然很大（>2MB base64），继续降低质量和尺寸
        while (compressedBase64.length > 2 * 1024 * 1024 && currentQuality > 0.1) {
          currentQuality -= 0.1;
          if (width > 300) {
            width = Math.round(width * 0.8);
            height = Math.round(height * 0.8);
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
          }
          compressedBase64 = canvas.toDataURL(outputType, currentQuality).split(',')[1];
        }

        console.log(`[compressImage] 压缩完成: ${img.width}x${img.height} -> ${width}x${height}, 质量: ${currentQuality}`);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

export default function AIGenerator() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('ink-wash');
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
      const fullPrompt = mode === 'text'
        ? `Chinese traditional tattoo design, ${selectedStyle} style, ${selectedBodyPart} placement, ${prompt}, black ink on skin, elegant composition`
        : `Transform this image into Chinese traditional tattoo style, ${selectedStyle}, ${selectedBodyPart} placement, ${prompt}`;

      let result;
      if (mode === 'text') {
        result = await generateImageWithVolcengine({
          prompt: fullPrompt,
          size: '1024x1024',
          n: 1,
          watermark: false,
        });
      } else {
        result = await generateTattooFromImage(uploadedImage!, fullPrompt);
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
      // 压缩图片：600px宽度，质量0.6，自动递归压缩直到小于2MB
      const compressedBase64 = await compressImage(file);

      // 通过服务端 API 上传（绕过 RLS 限制）
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: 'tattoo-images',
          fileName: file.name,
          fileData: compressedBase64,
          contentType: file.type,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '上传失败');
      }

      setUploadedImage(result.publicUrl);
    } catch (err) {
      console.error('[AIGenerator] Upload failed:', err);
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
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-lg text-sm transition-all ${
                      selectedStyle === style.id
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {style.name}
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
