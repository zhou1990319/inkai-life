import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, Wand2, Image as ImageIcon, Loader2, Download, Share2, AlertCircle } from 'lucide-react';
import { generateImageWithVolcengine } from '../../services/volcengineImage';
import { persistGeneratedImage } from '../../services/storage';
import { analyzeTattooMeaning } from '../../services/aiChat';
import { useLanguage } from '../../contexts/LanguageContext';

// 海外纹身风格选项 - 2?列布局
const TATTOO_STYLES = [
  // 第一?  { id: 'oriental', name: 'Oriental', nameZh: '中式', keywords: 'oriental style, traditional chinese art, ink wash painting' },
  { id: 'japanese', name: 'Japanese', nameZh: '日式', keywords: 'japanese tattoo, irezumi, traditional japanese art, bold outlines' },
  { id: 'american-traditional', name: 'American Traditional', nameZh: '美式传统', keywords: 'american traditional tattoo, bold lines, vibrant colors, classic sailor jerry style' },
  { id: 'neo-traditional', name: 'Neo-Traditional', nameZh: '新传?, keywords: 'neo-traditional tattoo, bold colors, detailed illustrations, modern interpretation' },
  // 第二?  { id: 'blackwork', name: 'Dark & Blackwork', nameZh: '暗黑黑灰', keywords: 'blackwork tattoo, dark aesthetic, high contrast, bold black ink, gothic style' },
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

// 身体部位选项 - name: 英文(AI?, nameZh: 中文(UI显示)
const BODY_PARTS = [
  { id: 'arm', name: 'arm', nameZh: '手臂', icon: '💪' },
  { id: 'back', name: 'back', nameZh: '背部', icon: '👤' },
  { id: 'chest', name: 'chest', nameZh: '胸部', icon: '❤️' },
  { id: 'wrist', name: 'wrist', nameZh: '手腕', icon: '? },
  { id: 'collarbone', name: 'collarbone', nameZh: '锁骨', icon: '🦴' },
  { id: 'thigh', name: 'thigh', nameZh: '大腿', icon: '🦵' },
  { id: 'calf', name: 'calf', nameZh: '小腿', icon: '🦶' },
];

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [culturalMeaning, setCulturalMeaning] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useLanguage();
  const isZh = language === 'zh';

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      // 获取选中风格的关键词
      const styleKeywords = selectedStyle ? STYLE_KEYWORDS_MAP[selectedStyle] || '' : '';
      const bodyPartName = selectedBodyPart ? BODY_PARTS.find(b => b.id === selectedBodyPart)?.name : '';
      
      // 构建完整提示?      const fullPrompt = [
        prompt,
        styleKeywords,
        bodyPartName ? `${bodyPartName} placement` : '',
        'tattoo design',
        'professional tattoo artist quality',
      ].filter(Boolean).join(', ');

      const result = await generateImageWithVolcengine({
        prompt: fullPrompt,
        size: '1024x1024',
        n: 1,
        watermark: false,
      });

      if (result.success && result.image_url) {
        setGeneratedImage(result.image_url);
        analyzeMeaning(fullPrompt);
      } else {
        setError(result.error || (isZh ? '生成失败，请重试' : 'Generation failed, please try again'));
      }
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : (isZh ? '生成失败，请重试' : 'Generation failed, please try again'));
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeMeaning = async (fullPrompt: string) => {
    setIsAnalyzing(true);
    try {
      const meaning = await analyzeTattooMeaning(fullPrompt);
      setCulturalMeaning(meaning);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
    }
  };

  const handleSave = async () => {
    if (!generatedImage) return;
    try {
      await persistGeneratedImage(generatedImage);
      alert(isZh ? '已保存到您的作品集！' : 'Saved to your gallery!');
    } catch (error) {
      console.error('Save failed:', error);
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
            <Sparkles className="inline-block mr-3" />
            {t('ai.title')}
          </h1>
          <p className="text-slate-400 text-lg">{t('ai.subtitle')}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 border border-amber-500/20 rounded-2xl p-6"
          >
            <div className="mb-6">
              <label className="block text-amber-400 font-medium mb-2">{t('ai.prompt_placeholder')}</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={isZh ? '例如：一条雄伟的龙在樱花云中翱翔...' : 'e.g., A majestic dragon soaring through clouds with cherry blossoms...'}
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-amber-400 font-medium mb-3">{t('ai.style')}</label>
              <div className="grid grid-cols-4 gap-2">
                {TATTOO_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id === selectedStyle ? '' : style.id)}
                    className={`p-3 rounded-lg border transition-all text-sm ${
                      selectedStyle === style.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="font-medium">{t(`style.${style.id}`)}</div>
                    <div className="text-xs opacity-70">{style.nameZh}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-amber-400 font-medium mb-3">{t('ai.body_part')}</label>
              <div className="flex gap-2">
                {BODY_PARTS.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => setSelectedBodyPart(part.id === selectedBodyPart ? '' : part.id)}
                    className={`flex-1 p-3 rounded-lg border transition-all text-sm ${
                      selectedBodyPart === part.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-500/50'
                    }`}
                  >
                    <span className="mr-1">{part.icon}</span>
                    {t(`body.${part.id}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-amber-400 font-medium mb-2">{isZh ? '参考图（可选）' : 'Reference Image (Optional)'}</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-slate-600 rounded-xl hover:border-amber-500/50 transition-colors flex items-center justify-center gap-2 text-slate-400"
              >
                <Upload size={20} />
                {referenceImage ? referenceImage.name : t('ai.upload_image')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <><Loader2 className="animate-spin" /> {t('ai.generating')}</>
              ) : (
                <><Wand2 /> {t('ai.generate')}</>
              )}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 border border-amber-500/20 rounded-2xl p-6"
          >
            <AnimatePresence mode="wait">
              {generatedImage ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="relative rounded-xl overflow-hidden mb-4">
                    <img
                      src={generatedImage}
                      alt="Generated tattoo"
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button
                        onClick={handleSave}
                        className="p-3 bg-slate-900/80 text-amber-400 rounded-lg hover:bg-slate-900 transition-colors"
                      >
                        <Download size={20} />
                      </button>
                      <button className="p-3 bg-slate-900/80 text-amber-400 rounded-lg hover:bg-slate-900 transition-colors">
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>

                  {isAnalyzing ? (
                    <div className="flex items-center gap-2 text-amber-400">
                      <Loader2 className="animate-spin" size={16} />
                      {t('ai.analyzing')}
                    </div>
                  ) : culturalMeaning && (
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/20">
                      <h3 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                        <Sparkles size={16} />
                        {isZh ? '文化寓意' : 'Cultural Meaning'}
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{culturalMeaning}</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-slate-500 min-h-[400px]"
                >
                  <ImageIcon size={64} className="mb-4 opacity-50" />
                  <p>{isZh ? '您的纹身设计将显示在这里' : 'Your tattoo design will appear here'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
