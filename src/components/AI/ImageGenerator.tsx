import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, Wand2, Image as ImageIcon, Loader2, Download, Share2, AlertCircle } from 'lucide-react';
import { generateImageWithVolcengine } from '../../services/volcengineImage';
import { persistGeneratedImage } from '../../services/storage';
import { analyzeTattooMeaning } from '../../services/aiChat';

const CHINESE_STYLES = [
  { id: 'ink-landscape', name: 'Ink Landscape', icon: '⛰️' },
  { id: 'dragon-phoenix', name: 'Dragon & Phoenix', icon: '🐉' },
  { id: 'dunhuang', name: 'Dunhuang Flying', icon: '🧚' },
  { id: 'mythical', name: 'Mythical Beasts', icon: '🦁' },
  { id: 'calligraphy', name: 'Calligraphy', icon: '✒️' },
  { id: 'opera-mask', name: 'Opera Mask', icon: '🎭' },
  { id: 'totem', name: 'Traditional Totem', icon: '🔮' },
  { id: 'koi-flower', name: 'Koi & Flowers', icon: '🌸' },
  { id: 'taoist', name: 'Taoist Symbols', icon: '☯️' },
  { id: 'ancient-figure', name: 'Ancient Figure', icon: '👤' },
  { id: 'border', name: 'Chinese Border', icon: '⬜' },
];

const BODY_PARTS = [
  { id: 'arm', name: 'Arm', icon: '💪' },
  { id: 'back', name: 'Back', icon: '👤' },
  { id: 'chest', name: 'Chest', icon: '❤️' },
  { id: 'wrist', name: 'Wrist', icon: '⌚' },
  { id: 'collarbone', name: 'Collarbone', icon: '🦴' },
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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const styleName = selectedStyle ? CHINESE_STYLES.find(s => s.id === selectedStyle)?.name : '';
      const bodyPartName = selectedBodyPart ? BODY_PARTS.find(b => b.id === selectedBodyPart)?.name : '';
      const fullPrompt = [
        prompt,
        styleName ? `${styleName} style` : '',
        bodyPartName ? `designed for ${bodyPartName} placement` : '',
        'Chinese traditional tattoo design',
        'ink wash painting style',
        'elegant, detailed',
        'black and gold tones',
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
        setError(result.error || '生成失败，请重试');
      }
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : '生成失败，请重试');
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
      alert('Saved to your gallery!');
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
            AI Tattoo Generator
          </h1>
          <p className="text-slate-400 text-lg">Create unique Chinese traditional tattoo designs with AI</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 border border-amber-500/20 rounded-2xl p-6"
          >
            <div className="mb-6">
              <label className="block text-amber-400 font-medium mb-2">Describe your tattoo idea</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A majestic dragon soaring through clouds with cherry blossoms..."
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-amber-400 font-medium mb-3">Chinese Style</label>
              <div className="grid grid-cols-3 gap-2">
                {CHINESE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id === selectedStyle ? '' : style.id)}
                    className={`p-3 rounded-lg border transition-all text-sm ${
                      selectedStyle === style.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-500/50'
                    }`}
                  >
                    <span className="mr-1">{style.icon}</span>
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-amber-400 font-medium mb-3">Body Placement</label>
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
                    {part.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-amber-400 font-medium mb-2">Reference Image (Optional)</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-slate-600 rounded-xl hover:border-amber-500/50 transition-colors flex items-center justify-center gap-2 text-slate-400"
              >
                <Upload size={20} />
                {referenceImage ? referenceImage.name : 'Upload reference image'}
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
                <><Loader2 className="animate-spin" /> Generating...</>
              ) : (
                <><Wand2 /> Generate Tattoo</>
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
                      Analyzing cultural meaning...
                    </div>
                  ) : culturalMeaning && (
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/20">
                      <h3 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                        <Sparkles size={16} />
                        Cultural Meaning
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
                  <p>Your tattoo design will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
