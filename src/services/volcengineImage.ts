// 调用后端代理 API 生成图像
// 后端路由: /api/generate-image → 火山引擎即梦AI
// API Key 完全不暴露给客户端

import { supabase } from '../supabase/client';

// ========== 类型定义 ==========

export type VolcengineImageModel =
  | 'doubao-seedream-5-0-260128'
  | 'doubao-seedream-4-5-251128'
  | 'doubao-seedream-4-0-250828';

const DEFAULT_MODEL: VolcengineImageModel = 'doubao-seedream-4-0-250828';

export interface ImageGenerationOptions {
  prompt: string;
  model?: VolcengineImageModel;
  size?: string;
  n?: number;
  guidance_scale?: number;
  watermark?: boolean;
  image_url?: string;    // 图生图：参考图URL
}

export interface ImageGenerationResult {
  success: boolean;
  image_url?: string;
  image_urls?: string[];
  error?: string;
  raw?: unknown;
}

// ========== 主调用函数 ==========

/**
 * 通过后端代理调用火山引擎即梦AI生成图像
 * 后端路由: POST /api/generate-image
 * 支持文生图和图生图
 */
export async function generateImageWithVolcengine(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const {
    prompt,
    model = DEFAULT_MODEL,
    size = '1024x1024',
    n = 1,
    guidance_scale = 3.5,
    watermark = false,
    image_url,
  } = options;

  try {
    const body: Record<string, unknown> = {
      prompt,
      model,
      n,
      size,
      guidance_scale,
      watermark,
      response_format: 'url',
    };

    // 图生图模式：附加参考图
    if (image_url) {
      body.image_url = image_url;
    }

    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Volcengine] API error:', data);
      return {
        success: false,
        error: data.error?.message || data.error || `Server error: ${response.status}`,
        raw: data,
      };
    }

    // OpenAI兼容格式: { data: [{ url: "..." }, ...] }
    const urls = (data.data || [])
      .map((item: { url?: string }) => item.url)
      .filter(Boolean);

    if (urls.length === 0) {
      return {
        success: false,
        error: 'API返回为空，未生成图像',
        raw: data,
      };
    }

    return {
      success: true,
      image_url: urls[0],
      image_urls: urls,
      raw: data,
    };
  } catch (error) {
    console.error('[Volcengine] Request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败',
    };
  }
}

// ========== 纹身风格关键词映射表 ==========

/**
 * 纹身风格关键词映射 - 海外纹身圈通用术语
 * 每个风格包含精准的AI生成提示词
 */
export const TATTOO_STYLE_KEYWORDS: Record<string, string> = {
  // 第一排
  'oriental': 'oriental style, traditional chinese art, ink wash painting, chinese dragon, phoenix, mythological elements, elegant brushwork',
  'japanese': 'japanese tattoo, irezumi, traditional japanese art, bold outlines, cherry blossom, koi fish, samurai, wave, dragon',
  'american-traditional': 'american traditional tattoo, bold lines, vibrant primary colors, nautical themes, eagle, rose, dagger, classic sailor jerry style',
  'neo-traditional': 'neo-traditional tattoo, bold colors, detailed illustrations, modern interpretation, rich shading, decorative elements',

  // 第二排
  'blackwork': 'blackwork tattoo, dark aesthetic, high contrast, bold black ink, tribal influence, gothic elements, decorative patterns',
  'watercolor': 'watercolor tattoo style, ink wash effect, flowing watercolor splashes, artistic brush strokes, vibrant colors, painterly effect',
  'minimalist': 'minimalist tattoo, fine line work, delicate single line designs, subtle elegant, single needle technique, simple clean lines',
  'realism': 'realistic tattoo, photorealistic style, detailed shading, portrait tattoo, life-like rendering, high detail, hyperrealistic',
};

// ========== 纹身专用封装 ==========

/**
 * 获取纹身风格的完整提示词
 */
export function getTattooStylePrompt(styleId: string, customDescription?: string): string {
  const styleKeywords = TATTOO_STYLE_KEYWORDS[styleId] || TATTOO_STYLE_KEYWORDS['oriental'];

  const promptParts = [
    customDescription,
    styleKeywords,
    'tattoo design',
    'professional tattoo artist quality',
  ].filter(Boolean);

  return promptParts.join(', ');
}

/**
 * 获取图生图模式的纹身提示词
 */
export function getTattooStylePromptForImg2Img(styleId: string, customDescription?: string): string {
  const styleKeywords = TATTOO_STYLE_KEYWORDS[styleId] || TATTOO_STYLE_KEYWORDS['oriental'];

  const promptParts = [
    customDescription,
    'tattoo design inspired by the provided reference image',
    'preserve original shape, outline and structure',
    styleKeywords,
    'tattoo illustration',
    'fine line work',
    'high contrast',
  ].filter(Boolean);

  return promptParts.join(', ');
}

/**
 * 文生图模式 - 生成纹身设计
 * @param description 纹身描述/要求
 * @param styleId 风格ID
 */
export async function generateTattooDesign(
  description: string,
  styleId?: string,
  options?: Partial<ImageGenerationOptions>
): Promise<ImageGenerationResult> {
  const tattooPrompt = styleId
    ? getTattooStylePrompt(styleId, description)
    : getTattooStylePrompt('oriental', description);

  return generateImageWithVolcengine({
    prompt: tattooPrompt,
    size: '1024x1024',
    n: 1,
    ...options,
  });
}

/**
 * 图生图模式 - 以参考图为基础生成纹身设计
 * @param baseImageUrl 参考图的公开URL（Supabase Storage）
 * @param description 纹身描述/要求
 * @param styleId 风格ID
 */
export async function generateTattooFromImage(
  baseImageUrl: string,
  description: string,
  styleId?: string,
  options?: Partial<Omit<ImageGenerationOptions, 'model' | 'image_url'>>
): Promise<ImageGenerationResult> {
  const tattooPrompt = styleId
    ? getTattooStylePromptForImg2Img(styleId, description)
    : getTattooStylePromptForImg2Img('oriental', description);

  return generateImageWithVolcengine({
    prompt: tattooPrompt,
    model: 'doubao-seedream-4-0-250828', // 4.0模型支持图生图
    image_url: baseImageUrl,               // 关键：传入参考图URL
    size: '1024x1024',
    n: 1,
    guidance_scale: 3.5,
    ...options,
  });
}

// ========== 上传到 Supabase Storage ==========

export async function uploadGeneratedImage(
  imageUrl: string,
  fileName: string,
  bucket: string = 'tattoo-designs'
): Promise<string | null> {
  try {
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) throw new Error('下载图片失败');

    const blob = await imgResponse.blob();

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error('[Supabase] Upload error:', error);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  } catch (error) {
    console.error('[Upload] Failed:', error);
    return null;
  }
}

export async function generateAndUploadTattoo(
  description: string,
  userId: string
): Promise<string | null> {
  const result = await generateTattooDesign(description);
  if (!result.success || !result.image_url) {
    console.error('[Workflow] 生成失败:', result.error);
    return null;
  }

  const timestamp = Date.now();
  const fileName = `${userId}/${timestamp}-${description.slice(0, 20)}.png`;

  const publicUrl = await uploadGeneratedImage(result.image_url, fileName);
  return publicUrl;
}
