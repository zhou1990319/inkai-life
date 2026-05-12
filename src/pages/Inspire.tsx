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
  prompts: { title: string; titleZh: string; text: string; textZh: string }[];
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
        title: 'Mountain & Mist', titleZh: '山水景观',
        text: 'Chinese ink wash tattoo, misty mountain landscape, flowing brushstrokes, minimalist composition, negative space, sumi-e style, black ink on skin, fine line detail, ethereal atmosphere',
        textZh: '中国水墨纹身，迷雾山水景观，流畅笔触，极简构图，留白空间，水墨风格，皮肤上的黑墨，细线细节，空灵气氛',
      },
      {
        title: 'Bamboo Grove', titleZh: '竹林',
        text: 'Traditional Chinese ink wash tattoo design, bamboo stalks with leaves, loose expressive brushwork, zen simplicity, vertical composition, black and grey ink wash effect, high contrast, tattoo line art',
        textZh: '传统中国水墨纹身设计，竹干与竹叶，洒脱表现力的笔触，禅意简约，竖向构图，黑白灰水墨效果，高对比，纹身线条艺术',
      },
      {
        title: 'Plum Blossom', titleZh: '梅花',
        text: 'Ink wash plum blossom tattoo, winter branches with delicate flowers, classical Chinese painting style, sparse elegant strokes, negative space composition, black ink fine lines, subtle grey wash shading',
        textZh: '水墨梅花纹身，冬日枝条与婉约花朵，古典中国画风格，稀疏优雅笔触，留白构图，黑墨细线，淡雅灰色渗染',
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
        title: 'Azure Dragon', titleZh: '青龙',
        text: 'Chinese traditional dragon tattoo, azure dragon ascending through clouds, detailed scales, flowing whiskers, pearl in claws, black and red ink, full back piece composition, traditional Chinese tattoo art style',
        textZh: '中国传统龙纹身，青龙穿云而上，精细鳞片，飘逸龙须，爪持宝珠，黑红墨色，满背构图，传统中国纹身艺术风格',
      },
      {
        title: 'Phoenix Rising', titleZh: '凤凰涅槃',
        text: 'Chinese phoenix tattoo design, Fenghuang bird spreading wings, vibrant feathers, rising from flames, symmetrical composition, traditional Chinese art style, bold black outlines, ornate detail work',
        textZh: '中国凤凰纹身设计，凤凰展翅，绚丽羽毛，浴火而升，对称构图，传统中国艺术风格，粗犷黑色轮廓，精美细节',
      },
      {
        title: 'Dragon & Phoenix Union', titleZh: '龙凤呈祥',
        text: 'Dragon and phoenix tattoo, yin yang composition, intertwining serpentine dragon and graceful phoenix, Chinese traditional symbolism, circular design, bold linework, black ink with red accents, chest piece layout',
        textZh: '龙凤纹身，阴阳构图，蛇行龙与优雅凤凰交织，中国传统象征，圆形设计，粗犷线条，黑墨红色点缀，胸部构图',
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
        title: 'Flying Apsara', titleZh: '飞天',
        text: 'Dunhuang flying apsara tattoo, celestial dancer with flowing ribbons and scarves, traditional cave mural art style, ornate jewelry, lotus flowers, rich detail, amber and ochre tones translated to black ink tattoo',
        textZh: '敦煌飞天纹身，天人与飘逸的飞带丝巾，传统石窟壁画艺术风格，华丽珠宝，莲花，丰富细节，琥珀赫色转化为黑墨纹身',
      },
      {
        title: 'Lotus Mandala', titleZh: '莲花曼茶罗',
        text: 'Dunhuang style lotus mandala tattoo, circular composition, layered petals, celestial clouds, geometric patterns, cave painting inspired design, fine line mandala tattoo, intricate dotwork shading',
        textZh: '敦煌风格莲花曼茶罗纹身，圆形构图，层叠花瓣，祥云，几何图案，石窟壁画灵感设计，细线曼茶罗纹身，精巧点彩渗染',
      },
      {
        title: 'Bodhisattva', titleZh: '菩萨',
        text: 'Dunhuang Bodhisattva tattoo design, serene face with halo, flowing robes, lotus throne, wall mural art style converted to tattoo, fine detail linework, ornamental borders, spiritual Buddhist art',
        textZh: '敦煌菩萨纹身设计，安祥面容与光环，飘逸衣袛，莲花座，壁画艺术风格转化为纹身，精细线条，装饰边框，精神佛教艺术',
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
        title: 'Qilin', titleZh: '麒麟',
        text: 'Chinese Qilin mythical creature tattoo, auspicious beast with dragon scales and deer antlers, flames emanating from hooves, traditional Chinese art style, bold black ink, side profile walking pose, detailed scale texture',
        textZh: '中国麒麟神兽纹身，吉祥之兽，龙鳞鹿角，四蹄生火，传统中国艺术风格，粗犷黑墨，侧面行走姿态，精细鳞片质感',
      },
      {
        title: 'Pixiu', titleZh: '豘犀',
        text: 'Pixiu wealth guardian tattoo, winged lion-dragon hybrid, fierce expression, curling tail, Chinese traditional decorative style, black ink detailed linework, protective symbol design, forearm sleeve concept',
        textZh: '豘犀招财守护纹身，有翅的狮龙混合体，威猛表情，卷曲尾巴，中国传统装饰风格，黑墨精细线条，护身符号设计，前臂套纹概念',
      },
      {
        title: 'White Tiger', titleZh: '白虎',
        text: 'Baihu white tiger of the west tattoo, fierce guardian spirit, striking pose, traditional Chinese four guardians style, intricate fur detail in black ink, powerful composition, back piece or shoulder design',
        textZh: '白虎西方守护纹身，凶猛守护神兽，威武姿态，传统中国四大守护风格，黑墨精细毛发细节，强有力构图，背部或肩部设计',
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
        title: 'Single Character Art', titleZh: '单字艺术',
        text: 'Chinese calligraphy tattoo art, single powerful character rendered in expressive brush calligraphy, ink splatter effect, dynamic brushstroke energy, black ink on skin, tattoo design with traditional seal script or running script style',
        textZh: '中国书法纹身艺术，单个力量感的汉字以表现力丰富的书法呈现，墨溅效果，动态笔触能量，皮肤上的黑墨，传统篆书或行书风格纹身设计',
      },
      {
        title: 'Poem Fragment', titleZh: '诗词片段',
        text: 'Chinese classical poem calligraphy tattoo, vertical text arrangement, flowing cursive script style, ink drip artistic effect, literary tattoo design, minimalist background, black ink calligraphy art',
        textZh: '中国古典诗词书法纹身，竖向文字排列，流畅草书风格，墨滴艺术效果，文学纹身设计，极简背景，黑墨书法艺术',
      },
      {
        title: 'Seal Script Dragon', titleZh: '篆书龙',
        text: 'Ancient seal script character merged with dragon form, the character strokes become dragon body, clever negative space design, black ink tattoo, unique concept combining calligraphy and mythology',
        textZh: '古代篆书字体与龙形融合，字笔化为龙身，巧妙的留白设计，黑墨纹身，书法与神话结合的独特概念',
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
        title: 'Monkey King', titleZh: '孙悟空',
        text: 'Peking Opera Monkey King face mask tattoo, Sun Wukong theatrical makeup pattern, bold geometric shapes, red and black primary colors translated to tattoo, fierce expression, symmetrical design, detailed line patterns',
        textZh: '京剧孙悟空脸谱纹身，孙悟空戏曲脸谱图案，大胆几何形状，红黑主色转化为纹身，威猛表情，对称设计，精细线条图案',
      },
      {
        title: 'Guan Yu', titleZh: '关羽',
        text: 'Chinese opera Guan Yu face paint tattoo design, red face symbolizing loyalty, intricate pattern lines, heroic expression, traditional Beijing opera style, detailed facial patterns, black ink fine line tattoo',
        textZh: '中国戏曲关羽脸谱纹身设计，红脸象征忠义，精巧图案线条，英勇表情，传统京剧风格，精细面部图案，黑墨细线纹身',
      },
      {
        title: 'Ghost Face', titleZh: '鬼脸',
        text: 'Chinese opera ghost face mask tattoo, white base with dark pattern overlay, mysterious otherworldly expression, theatrical geometric designs, black and grey ink, Halloween meets Chinese tradition fusion tattoo',
        textZh: '中国戏曲鬼脸面具纹身，白底暗色图案叠加，神秘超凡表情，戏剧化几何设计，黑白灰墨，中西方传统融合纹身',
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
        title: 'Koi Ascending', titleZh: '锦鲤跃龙门',
        text: 'Chinese koi fish tattoo, two koi swimming in yin yang circular composition, water waves and splashes, lotus flowers and lily pads, traditional Chinese style, black and grey realism with decorative line work, thigh or back piece',
        textZh: '中国锦鲤纹身，两条锦鲤在阴阳圆形构图中游动，水波浪花，莲花与荷叶，传统中国风格，黑白灰写实与装饰线条，大腿或背部纹身',
      },
      {
        title: 'Lotus in Bloom', titleZh: '盛开莲花',
        text: 'Traditional Chinese lotus flower tattoo, full bloom lotus rising from water, detailed petal layering, dragonfly accent, Buddhist symbolism, black ink fine line botanical tattoo, elegant feminine design',
        textZh: '传统中国莲花纹身，盛开莲花出水，精细花瓣层叠，蜓蜓点缀，佛教象征，黑墨细线植物纹身，优雅柔美设计',
      },
      {
        title: 'Koi Through Waves', titleZh: '锦鲤破浪',
        text: 'Dynamic koi fish breaking through crashing waves tattoo, Japanese-Chinese fusion style, powerful motion lines, foam and spray detail, bold black outlines, half sleeve composition concept',
        textZh: '动态锦鲤突破浪花纹身，日中融合风格，强有力动态线条，浪花飞溅细节，粗犷黑色轮廓，半袖构图概念',
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
        title: 'Cloud Totem', titleZh: '祥云图腾',
        text: 'Chinese auspicious cloud totem tattoo, stylized ruyi cloud patterns, repeating decorative motif, geometric precision, traditional Chinese textile pattern adapted for tattoo, black ink dotwork and linework combination',
        textZh: '中国吉祥云图腾纹身，风格化如意云图案，重复装饰图案，几何精确，传统中国织物图案改编为纹身，黑墨点彩与线条结合',
      },
      {
        title: 'Ming Dynasty Pattern', titleZh: '明代纹样',
        text: 'Ming dynasty decorative pattern tattoo, symmetrical floral and vine motifs, Chinese traditional embroidery patterns converted to tattoo design, intricate geometric repetition, fine line black ink, band or border design',
        textZh: '明代装饰图案纹身，对称花卉与藤葱图案，中国传统刺绣图案转化为纹身设计，精巧几何重复，细线黑墨，条带或边框设计',
      },
      {
        title: 'Tiger Totem', titleZh: '虎图腾',
        text: 'Abstract tiger totem tattoo, geometric tribal interpretation of Chinese tiger, bold black shapes and negative space, powerful simplified design, modern minimalist take on traditional Chinese tiger symbolism',
        textZh: '抽象虎图腾纹身，几何部落风格的中国虎，大胆黑色形状与留白，强有力简化设计，现代极简风格的传统中国虎象征',
      },
    ],
  },
];

export default function Inspire() {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';
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
                <span>{isZh ? t.styleZh : t.style}</span>
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
                <h2 className="text-[15px] font-bold text-white">{isZh ? template.styleZh : template.style}</h2>
                <span className="text-[#6B6B78] text-[11px]">{template.styleZh}</span>
              </div>
              {/* Decorative divider */}
              <div className="flex-1 h-px bg-gradient-to-r from-[#2A2A36] via-[#CFAF6E]/20 to-transparent ml-2" />
              <span className="text-[#6B6B78] text-[10px] bg-[#18181F] border border-[#2A2A36] px-2 py-0.5 rounded-full">
                {template.prompts.length} {isZh ? '个提示' : 'prompts'}
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
                          {isZh ? prompt.titleZh : prompt.title}
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
                        {isZh ? prompt.textZh : prompt.text}
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
              <p className="text-[#CFAF6E] font-semibold text-sm mb-1">{isZh ? '如何使用这些提示' : 'How to use these prompts'}</p>
              <p className="text-[#6B6B78] text-xs leading-relaxed">
                {isZh ? '复制任意提示并粘贴到' : 'Copy any prompt and paste it into the'}{' '}
                <strong className="text-[#B0B0B8]">AI Studio</strong>{' '}
                {isZh ? '文本输入框中。搭配参考图片进行图生图生成。自由调整关键词以匹配你的创意愿景。' : 'text input. Pair with a reference image for image-to-image generation. Tweak keywords freely to match your creative vision.'}
              </p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-[#CFAF6E]/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
