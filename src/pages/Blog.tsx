import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Share2, Twitter, Facebook, Linkedin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// 博客文章数据
const blogPosts = [
  {
    slug: 'ai-tattoo-generator-guide',
    title: 'How AI is Revolutionizing Tattoo Design: A Complete Guide',
    excerpt: 'Discover how AI technology is transforming the tattoo industry and learn how to create unique tattoo designs with artificial intelligence.',
    date: '2026-05-13',
    readTime: '8 min read',
    category: 'AI Technology',
    featured: true,
    image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&q=80'
  },
  {
    slug: 'top-tattoo-styles-2026',
    title: 'Top 10 Trending Tattoo Styles in 2026',
    excerpt: 'Explore the most popular tattoo styles dominating the industry this year, from minimalist designs to intricate Japanese traditional art.',
    date: '2026-05-10',
    readTime: '6 min read',
    category: 'Tattoo Trends',
    featured: false,
    image: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&q=80'
  },
  {
    slug: 'beginners-guide-tattoo-care',
    title: 'Complete Tattoo Aftercare Guide for Beginners',
    excerpt: 'Learn essential tips for caring for your new tattoo to ensure proper healing and vibrant colors that last a lifetime.',
    date: '2026-05-08',
    readTime: '5 min read',
    category: 'Tattoo Care',
    featured: false,
    image: 'https://images.unsplash.com/photo-1590246814883-57c511e76d2c?w=800&q=80'
  }
];

// SEO 文章内容
const seoArticleContent = {
  slug: 'ai-tattoo-generator-guide',
  title: 'How AI is Revolutionizing Tattoo Design: A Complete Guide',
  date: '2026-05-13',
  readTime: '8 min read',
  category: 'AI Technology',
  author: 'InkAI Team',
  content: `
Are you ready to explore the cutting-edge intersection of body art and artificial intelligence? Dive into the world of AI tattoo generators, where the future of custom tattoos is being reimagined. This guide will take you through the transformative journey of tattoo design, powered by AI technology, and introduce you to InkAI, a platform that's changing the game.

## What is an AI Tattoo Generator?

An AI tattoo generator is a software tool that harnesses the power of artificial intelligence to create unique and personalized tattoo designs. This technology uses complex algorithms and machine learning to understand and interpret design preferences, generating AI art that is both innovative and tailored to individual tastes. By leveraging AI, the process of tattoo design has become more accessible and customizable, allowing for a wider range of creativity and personal expression in the world of body art.

## How AI is Changing the Tattoo Design Industry

AI has introduced a seismic shift in the tattoo industry, and here's how:

1. **Personalization**: With AI tattoo generators, each design can be uniquely tailored to the wearer, ensuring a level of personalization that was previously unattainable. The AI can learn from your preferences and generate custom tattoos that resonate with your style and personality.

2. **Efficiency**: The process of designing a tattoo has been streamlined. Traditionally, it could take hours or even days to perfect a design. With AI, the design process is expedited, saving time for both artists and clients.

3. **Innovation**: AI art opens up new realms of creativity that humans may not have explored. The AI can combine elements from various styles and cultures to create truly unique designs.

4. **Experimentation**: Artists and clients can freely experiment with different ideas without the fear of committing to a permanent design. This allows for a more relaxed and exploratory design process.

## Features and Advantages of InkAI

InkAI stands out in the realm of AI tattoo generators due to its unique features and advantages:

1. **User-Friendly Interface**: Our platform is designed to be intuitive and easy to use, making it accessible to both tech-savvy individuals and those who are new to AI technology.

2. **Diverse Style Options**: InkAI offers a wide range of styles, from traditional to modern, ensuring that there's something for everyone.

3. **High-Quality Designs**: Our AI-generated designs are of the highest quality, ensuring that your custom tattoos are not only unique but also visually stunning.

4. **Quick Turnaround**: Get your designs faster with InkAI's efficient AI algorithms, which can produce concepts in a matter of minutes.

## How to Get Started with an AI Tattoo Generator

Using an AI tattoo generator like InkAI is simple:

1. **Choose Your Style**: Begin by selecting the style or theme you're interested in for your tattoo.

2. **Input Preferences**: Input your preferences, such as color schemes, symbols, or specific elements you want to include.

3. **Generate Designs**: Let the AI do the work. It will generate a series of designs based on your input.

4. **Review and Refine**: Browse through the designs and select the ones that resonate with you. You can also refine your preferences and generate new concepts.

5. **Finalize Your Design**: Once you're satisfied with your design, you can proceed to have it professionally tattooed.

## Common Questions (FAQ)

**Q: Is AI-generated tattoo design reliable?**

A: Absolutely. AI technology has advanced to a point where it can generate high-quality, unique designs that are on par with human artists.

**Q: Can I modify the AI-generated designs?**

A: Yes, you can work with a tattoo artist to make adjustments to the AI-generated designs to ensure they are perfect for your vision.

**Q: Are AI tattoos expensive?**

A: AI technology can actually reduce costs by streamlining the design process. However, the cost will depend on the complexity of the design and the tattoo artist's rates.

## Conclusion

The integration of AI into tattoo design is not just a trend—it's a revolution. It's an opportunity for self-expression that is more accessible, efficient, and innovative than ever before. If you're ready to join the revolution and create a custom tattoo that truly speaks to your unique identity, it's time to try InkAI.
`
};

export default function Blog() {
  const { t, language } = useLanguage();
  const isZh = language === 'zh';
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const currentPost = selectedPost === seoArticleContent.slug ? seoArticleContent : null;

  // SEO Meta tags
  useEffect(() => {
    if (currentPost) {
      document.title = `${currentPost.title} | InkAI Blog`;
      document.meta = document.querySelector('meta[name="description"]') || document.createElement('meta');
      document.querySelector('meta[name="description"]')?.setAttribute(
        'content',
        'Discover how AI technology is revolutionizing tattoo design. Learn about AI tattoo generators and how InkAI helps you create unique custom tattoos.'
      );
    } else {
      document.title = 'Blog | Tattoo Tips, Trends & AI Tattoo Guides | InkAI';
      document.querySelector('meta[name="description"]')?.setAttribute(
        'content',
        'Explore the latest tattoo trends, AI technology insights, and expert guides on InkAI Blog. Learn about tattoo design, aftercare, and more.'
      );
    }
  }, [currentPost]);

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentPost?.title || 'InkAI Blog');
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  // Render article content
  const renderContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4">
            {paragraph.replace('## ', '')}
          </h2>
        );
      }
      if (paragraph.startsWith('**Q:') || paragraph.startsWith('**')) {
        const boldMatch = paragraph.match(/\*\*(.*?)\*\*/);
        if (boldMatch) {
          return (
            <p key={index} className="text-[#B0B0B8] mb-4 leading-relaxed">
              <strong className="text-white">{boldMatch[1]}</strong>
              {paragraph.replace(`**${boldMatch[1]}**`, '')}
            </p>
          );
        }
      }
      if (paragraph.match(/^\d+\./)) {
        const items = paragraph.split('\n').filter(item => item.match(/^\d+\./));
        return (
          <ul key={index} className="list-decimal list-inside text-[#B0B0B8] mb-4 space-y-2">
            {items.map((item, i) => (
              <li key={i} className="leading-relaxed">{item.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ul>
        );
      }
      if (paragraph.trim()) {
        return (
          <p key={index} className="text-[#B0B0B8] mb-4 leading-relaxed">
            {paragraph}
          </p>
        );
      }
      return null;
    });
  };

  // Article Detail View
  if (currentPost) {
    return (
      <div className="min-h-screen bg-[#0B0B0E]">
        {/* Hero */}
        <div className="relative bg-gradient-to-b from-[#18181F] to-[#0B0B0E] py-16">
          <div className="max-w-4xl mx-auto px-4">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-2 text-[#CFAF6E] hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              {isZh ? '返回博客' : 'Back to Blog'}
            </button>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-block px-3 py-1 bg-[#9E2B25]/20 text-[#9E2B25] text-sm rounded-full mb-4">
                {currentPost.category}
              </span>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {currentPost.title}
              </h1>
              
              <div className="flex items-center gap-6 text-[#6B6B78] mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{currentPost.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{currentPost.readTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>By {currentPost.author}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert max-w-none"
          >
            {renderContent(currentPost.content)}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 p-8 bg-gradient-to-r from-[#9E2B25]/20 to-[#CFAF6E]/20 rounded-2xl border border-[#2A2A36] text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              {isZh ? '准备好开始了吗？' : 'Ready to Get Started?'}
            </h3>
            <p className="text-[#B0B0B8] mb-6">
              {isZh 
                ? '加入 InkAI，开始用 AI 创造独特的纹身设计！'
                : 'Join InkAI and start creating unique tattoo designs with AI!'}
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-[#9E2B25] text-white font-bold rounded-xl hover:bg-[#B8342D] transition-colors"
            >
              {isZh ? '免费开始' : 'Start Free'}
            </Link>
          </motion.div>

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-[#2A2A36]">
            <div className="flex items-center gap-4">
              <span className="text-[#6B6B78] flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                {isZh ? '分享这篇文章' : 'Share this article'}
              </span>
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 bg-[#1D9BF0]/20 text-[#1D9BF0] rounded-lg hover:bg-[#1D9BF0]/30 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 bg-[#1877F2]/20 text-[#1877F2] rounded-lg hover:bg-[#1877F2]/30 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-2 bg-[#0A66C2]/20 text-[#0A66C2] rounded-lg hover:bg-[#0A66C2]/30 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Blog List View
  return (
    <div className="min-h-screen bg-[#0B0B0E]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#18181F] to-[#0B0B0E] py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            {isZh ? 'InkAI 博客' : 'InkAI Blog'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[#B0B0B8] max-w-2xl mx-auto"
          >
            {isZh 
              ? '探索纹身趋势、AI 技术指南和专业建议'
              : 'Explore tattoo trends, AI technology insights, and expert advice'}
          </motion.p>
        </div>
      </div>

      {/* Featured Post */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setSelectedPost(seoArticleContent.slug)}
            className="w-full text-left group"
          >
            <div className="grid md:grid-cols-2 gap-8 bg-[#18181F] rounded-2xl overflow-hidden border border-[#2A2A36] hover:border-[#CFAF6E] transition-colors">
              <div className="aspect-video md:aspect-auto bg-gradient-to-br from-[#9E2B25]/30 to-[#CFAF6E]/30 flex items-center justify-center">
                <div className="text-[#CFAF6E] text-6xl">✦</div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 bg-[#9E2B25]/20 text-[#9E2B25] text-sm rounded-full mb-4 w-fit">
                  {seoArticleContent.category}
                </span>
                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-[#CFAF6E] transition-colors">
                  {seoArticleContent.title}
                </h2>
                <p className="text-[#B0B0B8] mb-6 line-clamp-3">
                  {seoArticleContent.excerpt || 'Discover how AI technology is transforming the tattoo industry...'}
                </p>
                <div className="flex items-center gap-4 text-sm text-[#6B6B78]">
                  <span>{seoArticleContent.date}</span>
                  <span>•</span>
                  <span>{seoArticleContent.readTime}</span>
                </div>
              </div>
            </div>
          </button>
        </motion.div>

        {/* More Posts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-white mb-8">
            {isZh ? '更多文章' : 'More Articles'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.filter(p => p.slug !== seoArticleContent.slug).map((post, index) => (
              <motion.button
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => setSelectedPost(post.slug)}
                className="text-left bg-[#18181F] rounded-xl overflow-hidden border border-[#2A2A36] hover:border-[#CFAF6E] transition-colors group"
              >
                <div className="aspect-video bg-gradient-to-br from-[#2A2A36] to-[#18181F] flex items-center justify-center">
                  <div className="text-[#CFAF6E]/50 text-4xl">✦</div>
                </div>
                <div className="p-6">
                  <span className="inline-block px-2 py-1 bg-[#9E2B25]/10 text-[#9E2B25] text-xs rounded mb-3">
                    {post.category}
                  </span>
                  <h3 className="font-bold text-white mb-2 group-hover:text-[#CFAF6E] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-[#6B6B78] line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#6B6B78]">
                    <Calendar className="w-3 h-3" />
                    <span>{post.date}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 p-8 bg-gradient-to-r from-[#9E2B25]/10 to-[#CFAF6E]/10 rounded-2xl border border-[#2A2A36] text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            {isZh ? '订阅我们的更新' : 'Subscribe to Our Updates'}
          </h3>
          <p className="text-[#B0B0B8] mb-6 max-w-md mx-auto">
            {isZh 
              ? '获取最新的纹身趋势、AI 技术和独家优惠'
              : 'Get the latest tattoo trends, AI technology updates, and exclusive offers'}
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-[#9E2B25] text-white font-bold rounded-xl hover:bg-[#B8342D] transition-colors"
          >
            {isZh ? '免费订阅' : 'Subscribe Free'}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
