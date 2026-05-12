import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PromptTemplate {
  id: string;
  style: string;
  styleZh: string;
  icon: string;
  accent: string;    // tailwind bg for the icon badge
  prompts: { title: string; text: string }[];
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'ink-wash',
    style: 'Ink Wash',
    styleZh: '水墨',
    icon: '水',
    accent: 'bg-[#1E2530] border-[#2A3A50]',
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
    accent: 'bg-[#25181A] border-[#3A2020]',
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
        title: 'Dragon & Phoenix Union',
        text: 'Dragon and phoenix tattoo, yin yang composition, intertwining serpentine dragon and graceful phoenix, Chinese traditional symbolism, circular design, bold linework, black ink with red accents, chest piece layout',
      },
    ],
  },
  {
    id: 'dunhuang',
    style: 'Dunhuang',
    styleZh: '敦煌',
    icon: '敦',
    accent: 'bg-[#201C10] border-[#342E18]',
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
    accent: 'bg-[#161E1A] border-[#223028]',
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
    accent: 'bg-[#1A1A1A] border-[#2A2A2A]',
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
    accent: 'bg-[#22141A] border-[#381E28]',
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
    accent: 'bg-[#141E22] border-[#1E303A]',
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
    accent: 'bg-[#1A1422] border-[#2A1E38]',
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
  const { t } = useLanguage();
  const [activeStyle, setActiveStyle] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates =
    activeStyle === 'all'
      ? PROMPT_TEMPLATES
      : PROMPT_TEMPLATES.filter((t) => t.id === activeStyle);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0B0E]">

      {/* Sticky header */}
      <div className="sticky top-16 z-40 bg-[#0B0B0E]/95 backdrop-blur-md border-b border-[#2A2A36]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Title row */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#18181F] border border-[#2A2A36] flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-[#CFAF6E]" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-white leading-tight">{t('inspire.title')}</h1>
              <p className="text-[#6B6B78] text-[11px] tracking-wide">
                {t('inspire.subtitle')}
              </p>
            </div>
          </div>

          {/* Style filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setActiveStyle('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeStyle === 'all'
                  ? 'bg-[#CFAF6E] text-[#0B0B0E] font-bold'
                  : 'bg-[#18181F] text-[#B0B0B8] border border-[#2A2A36] hover:border-[#CFAF6E]/30 hover:text-white'
              }`}
            >
              {t('home.features_title')}
            </button>
            {PROMPT_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveStyle(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeStyle === t.id
                    ? 'bg-[#CFAF6E] text-[#0B0B0E] font-bold'
                    : 'bg-[#18181F] text-[#B0B0B8] border border-[#2A2A36] hover:border-[#CFAF6E]/30 hover:text-white'
                }`}
              >
                <span className="text-[10px]">{t.icon}</span>
                <span>{t.style}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {filteredTemplates.map((template, tIdx) => (
          <motion.section
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: tIdx * 0.06 }}
          >
            {/* Style heading */}
            <div className="flex items-center gap-3 mb-5">
              {/* Chinese char badge */}
              <div className={`w-10 h-10 rounded-xl ${template.accent} border flex items-center justify-center`}>
                <span className="text-[#CFAF6E] font-bold text-lg leading-none">{template.icon}</span>
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-white">{template.style}</h2>
                <span className="text-[#6B6B78] text-[11px]">{template.styleZh}</span>
              </div>
              {/* Decorative divider */}
              <div className="flex-1 h-px bg-gradient-to-r from-[#2A2A36] via-[#CFAF6E]/20 to-transparent ml-2" />
              <span className="text-[#6B6B78] text-[10px] bg-[#18181F] border border-[#2A2A36] px-2 py-0.5 rounded-full">
                {template.prompts.length} prompts
              </span>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {template.prompts.map((prompt, pIdx) => {
                const cardId = `${template.id}-${pIdx}`;
                const isCopied = copiedId === cardId;

                return (
                  <motion.div
                    key={pIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: tIdx * 0.06 + pIdx * 0.04 }}
                    className="group relative bg-[#18181F] border border-[#2A2A36] rounded-xl overflow-hidden hover:border-[#CFAF6E]/30 transition-colors"
                  >
                    {/* Top gold line accent */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[#CFAF6E]/30 to-transparent" />

                    <div className="p-4">
                      {/* Card header */}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#CFAF6E] flex-shrink-0" />
                          {prompt.title}
                        </h3>
                        <button
                          onClick={() => handleCopy(prompt.text, cardId)}
                          className={`flex-shrink-0 ml-2 p-1.5 rounded-lg transition-all ${
                            isCopied
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-[#0B0B0E] text-[#6B6B78] hover:text-[#CFAF6E] hover:bg-[#CFAF6E]/8'
                          }`}
                          title={t('inspire.copy_prompt')}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Prompt text */}
                      <p className="text-[#B0B0B8] text-[11.5px] leading-relaxed line-clamp-4 font-mono tracking-tight">
                        {prompt.text}
                      </p>

                      {/* Copy button */}
                      <button
                        onClick={() => handleCopy(prompt.text, cardId)}
                        className={`mt-3.5 w-full py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                          isCopied
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : 'bg-[#0B0B0E] text-[#CFAF6E] border border-[#2A2A36] hover:border-[#CFAF6E]/40 hover:bg-[#CFAF6E]/5'
                        }`}
                      >
                        {isCopied ? `${t('inspire.copied')}!` : t('inspire.copy_prompt')}
                      </button>
                    </div>

                    {/* Bottom gold line accent */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[#CFAF6E]/15 to-transparent" />
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        ))}

        {/* Usage tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative rounded-2xl bg-[#18181F] border border-[#2A2A36] overflow-hidden"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-[#CFAF6E]/40 to-transparent" />
          <div className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#CFAF6E]/10 border border-[#CFAF6E]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">💡</span>
            </div>
            <div>
              <p className="text-[#CFAF6E] font-semibold text-sm mb-1">How to use these prompts</p>
              <p className="text-[#6B6B78] text-xs leading-relaxed">
                Copy any prompt and paste it into the{' '}
                <strong className="text-[#B0B0B8]">AI Studio</strong>{' '}
                text input. Pair with a reference image for image-to-image generation.
                Tweak keywords freely to match your creative vision.
              </p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-[#CFAF6E]/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
