import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Sparkles, BookOpen } from 'lucide-react';

interface PromptTemplate {
  id: string;
  style: string;
  styleZh: string;
  icon: string;
  color: string;
  prompts: { title: string; text: string }[];
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'ink-wash',
    style: 'Ink Wash',
    styleZh: '水墨',
    icon: '水',
    color: 'from-slate-600 to-slate-800',
    prompts: [
      {
        title: 'Mountain & Mist',
        text: 'Chinese ink wash tattoo, misty mountain landscape, flowing brushstrokes, minimalist composition, negative space, sumi-e style, black ink on skin, fine line detail, ethereal atmosphere',
      },
      {
        title: 'Bamboo Grove',
        text: 'Traditional Chinese ink wash tattoo design, bamboo stalks with leaves, loose expressive brushwork, zen simplicity, vertical composition, black and grey ink wash effect, high contrast, tattoo line art',
      },
      {
        title: 'Plum Blossom',
        text: 'Ink wash plum blossom tattoo, winter branches with delicate flowers, classical Chinese painting style, sparse elegant strokes, negative space composition, black ink fine lines, subtle grey wash shading',
      },
    ],
  },
  {
    id: 'dragon',
    style: 'Dragon & Phoenix',
    styleZh: '龙凤',
    icon: '龙',
    color: 'from-red-800 to-orange-900',
    prompts: [
      {
        title: 'Azure Dragon',
        text: 'Chinese traditional dragon tattoo, azure dragon ascending through clouds, detailed scales, flowing whiskers, pearl in claws, black and red ink, full back piece composition, traditional Chinese tattoo art style',
      },
      {
        title: 'Phoenix Rising',
        text: 'Chinese phoenix tattoo design, Fenghuang bird spreading wings, vibrant feathers, rising from flames, symmetrical composition, traditional Chinese art style, bold black outlines, ornate detail work',
      },
      {
        title: 'Dragon Phoenix Union',
        text: 'Dragon and phoenix tattoo, yin yang composition, intertwining serpentine dragon and graceful phoenix, Chinese traditional symbolism, circular design, bold linework, black ink with red accents, chest piece layout',
      },
    ],
  },
  {
    id: 'dunhuang',
    style: 'Dunhuang',
    styleZh: '敦煌',
    icon: '敦',
    color: 'from-amber-700 to-yellow-900',
    prompts: [
      {
        title: 'Flying Apsara',
        text: 'Dunhuang flying apsara tattoo, celestial dancer with flowing ribbons and scarves, traditional cave mural art style, ornate jewelry, lotus flowers, rich detail, amber and ochre tones translated to black ink tattoo',
      },
      {
        title: 'Lotus Mandala',
        text: 'Dunhuang style lotus mandala tattoo, circular composition, layered petals, celestial clouds, geometric patterns, cave painting inspired design, fine line mandala tattoo, intricate dotwork shading',
      },
      {
        title: 'Bodhisattva',
        text: 'Dunhuang Bodhisattva tattoo design, serene face with halo, flowing robes, lotus throne, wall mural art style converted to tattoo, fine detail linework, ornamental borders, spiritual Buddhist art',
      },
    ],
  },
  {
    id: 'mythical',
    style: 'Mythical Beasts',
    styleZh: '神兽',
    icon: '兽',
    color: 'from-emerald-800 to-teal-900',
    prompts: [
      {
        title: 'Qilin',
        text: 'Chinese Qilin mythical creature tattoo, auspicious beast with dragon scales and deer antlers, flames emanating from hooves, traditional Chinese art style, bold black ink, side profile walking pose, detailed scale texture',
      },
      {
        title: 'Pixiu',
        text: 'Pixiu wealth guardian tattoo, winged lion-dragon hybrid, fierce expression, curling tail, Chinese traditional decorative style, black ink detailed linework, protective symbol design, forearm sleeve concept',
      },
      {
        title: 'White Tiger',
        text: 'Baihu white tiger of the west tattoo, fierce guardian spirit, striking pose, traditional Chinese four guardians style, intricate fur detail in black ink, powerful composition, back piece or shoulder design',
      },
    ],
  },
  {
    id: 'calligraphy',
    style: 'Calligraphy',
    styleZh: '书法',
    icon: '墨',
    color: 'from-zinc-700 to-neutral-900',
    prompts: [
      {
        title: 'Single Character Art',
        text: 'Chinese calligraphy tattoo art, single powerful character rendered in expressive brush calligraphy, ink splatter effect, dynamic brushstroke energy, black ink on skin, tattoo design with traditional seal script or running script style',
      },
      {
        title: 'Poem Fragment',
        text: 'Chinese classical poem calligraphy tattoo, vertical text arrangement, flowing cursive script style, ink drip artistic effect, literary tattoo design, minimalist background, black ink calligraphy art',
      },
      {
        title: 'Seal Script Dragon',
        text: 'Ancient seal script character merged with dragon form, the character strokes become dragon body, clever negative space design, black ink tattoo, unique concept combining calligraphy and mythology',
      },
    ],
  },
  {
    id: 'opera',
    style: 'Opera Mask',
    styleZh: '脸谱',
    icon: '谱',
    color: 'from-rose-800 to-pink-900',
    prompts: [
      {
        title: 'Monkey King',
        text: 'Peking Opera Monkey King face mask tattoo, Sun Wukong theatrical makeup pattern, bold geometric shapes, red and black primary colors translated to tattoo, fierce expression, symmetrical design, detailed line patterns',
      },
      {
        title: 'Guan Yu',
        text: 'Chinese opera Guan Yu face paint tattoo design, red face symbolizing loyalty, intricate pattern lines, heroic expression, traditional Beijing opera style, detailed facial patterns, black ink fine line tattoo',
      },
      {
        title: 'Ghost Face',
        text: 'Chinese opera ghost face mask tattoo, white base with dark pattern overlay, mysterious otherworldly expression, theatrical geometric designs, black and grey ink, Halloween meets Chinese tradition fusion tattoo',
      },
    ],
  },
  {
    id: 'koi',
    style: 'Koi & Lotus',
    styleZh: '锦鲤荷花',
    icon: '鲤',
    color: 'from-blue-800 to-cyan-900',
    prompts: [
      {
        title: 'Koi Ascending',
        text: 'Chinese koi fish tattoo, two koi swimming in yin yang circular composition, water waves and splashes, lotus flowers and lily pads, traditional Chinese style, black and grey realism with decorative line work, thigh or back piece',
      },
      {
        title: 'Lotus in Bloom',
        text: 'Traditional Chinese lotus flower tattoo, full bloom lotus rising from water, detailed petal layering, dragonfly accent, Buddhist symbolism, black ink fine line botanical tattoo, elegant feminine design',
      },
      {
        title: 'Koi Through Waves',
        text: 'Dynamic koi fish breaking through crashing waves tattoo, Japanese-Chinese fusion style, powerful motion lines, foam and spray detail, bold black outlines, half sleeve composition concept',
      },
    ],
  },
  {
    id: 'totem',
    style: 'Totem & Pattern',
    styleZh: '图腾纹样',
    icon: '纹',
    color: 'from-violet-800 to-purple-900',
    prompts: [
      {
        title: 'Cloud Totem',
        text: 'Chinese auspicious cloud totem tattoo, stylized ruyi cloud patterns, repeating decorative motif, geometric precision, traditional Chinese textile pattern adapted for tattoo, black ink dotwork and linework combination',
      },
      {
        title: 'Ming Dynasty Pattern',
        text: 'Ming dynasty decorative pattern tattoo, symmetrical floral and vine motifs, Chinese traditional embroidery patterns converted to tattoo design, intricate geometric repetition, fine line black ink, band or border design',
      },
      {
        title: 'Tiger Totem',
        text: 'Abstract tiger totem tattoo, geometric tribal interpretation of Chinese tiger, bold black shapes and negative space, powerful simplified design, modern minimalist take on traditional Chinese tiger symbolism',
      },
    ],
  },
];

export default function Inspire() {
  const [activeStyle, setActiveStyle] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates =
    activeStyle === 'all'
      ? PROMPT_TEMPLATES
      : PROMPT_TEMPLATES.filter((t) => t.id === activeStyle);

  const handleCopy = (promptText: string, promptId: string) => {
    navigator.clipboard.writeText(promptText).then(() => {
      setCopiedId(promptId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-24">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Inspire</h1>
              <p className="text-gray-500 text-xs">Chinese tattoo AI prompt library — copy & use directly</p>
            </div>
          </div>
          {/* Style filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setActiveStyle('all')}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                activeStyle === 'all'
                  ? 'bg-amber-500 text-black font-semibold'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
              }`}
            >
              All Styles
            </button>
            {PROMPT_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveStyle(t.id)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeStyle === t.id
                    ? 'bg-amber-500 text-black font-semibold'
                    : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
                }`}
              >
                <span className="text-xs">{t.icon}</span>
                <span>{t.style}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prompt Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {filteredTemplates.map((template, tIdx) => (
          <motion.section
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: tIdx * 0.06 }}
          >
            {/* Style Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center text-white font-bold text-lg`}
              >
                {template.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{template.style}</h2>
                <span className="text-gray-500 text-sm">{template.styleZh}</span>
              </div>
              <span className="ml-auto text-xs text-gray-600 bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                {template.prompts.length} prompts
              </span>
            </div>

            {/* Prompt Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {template.prompts.map((prompt, pIdx) => {
                const cardId = `${template.id}-${pIdx}`;
                const isCopied = copiedId === cardId;
                return (
                  <motion.div
                    key={pIdx}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: tIdx * 0.06 + pIdx * 0.04 }}
                    className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 hover:border-amber-500/40 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {prompt.title}
                      </h3>
                      <button
                        onClick={() => handleCopy(prompt.text, cardId)}
                        className={`flex-shrink-0 ml-2 p-1.5 rounded-lg transition-all ${
                          isCopied
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-[#2a2a2a] text-gray-500 hover:bg-amber-500/20 hover:text-amber-400 group-hover:text-amber-400'
                        }`}
                        title="Copy prompt"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-4">
                      {prompt.text}
                    </p>
                    <button
                      onClick={() => handleCopy(prompt.text, cardId)}
                      className={`mt-3 w-full py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isCopied
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-[#1a1a1a] text-gray-500 hover:bg-amber-500/10 hover:text-amber-400 border border-transparent hover:border-amber-500/30'
                      }`}
                    >
                      {isCopied ? '✓ Copied!' : 'Copy Prompt'}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        ))}
      </div>

      {/* Bottom tip */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="rounded-xl bg-[#141414] border border-amber-500/20 p-4 flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-amber-400 font-semibold text-sm">How to use</p>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
              Copy any prompt above and paste it into the <strong className="text-gray-400">AI Studio</strong> text box.
              Combine with your own reference image for best results. Feel free to tweak keywords to match your vision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
