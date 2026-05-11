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
  } = options;

  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model, size, n, guidance_scale, watermark }),
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

// ========== 纹身专用封装 ==========

export async function generateTattooDesign(
  description: string,
  options?: Partial<ImageGenerationOptions>
): Promise<ImageGenerationResult> {
  const tattooPrompt = [
    description,
    'Chinese traditional tattoo style',
    'fine line work',
    'black ink illustration',
    'high contrast',
    'tattoo design sketch',
  ].join(', ');

  return generateImageWithVolcengine({
    prompt: tattooPrompt,
    size: '1024x1024',
    n: 1,
    ...options,
  });
}

export async function generateTattooFromImage(
  baseImageUrl: string,
  description: string,
  options?: Partial<Omit<ImageGenerationOptions, 'model'>>,
): Promise<ImageGenerationResult> {
  const prompt = [
    description,
    'transform into Chinese traditional tattoo style',
    'black ink tattoo design',
    'maintain original composition and structure',
  ].join(', ');

  return generateImageWithVolcengine({
    prompt,
    model: 'doubao-seedream-4-0-250828',
    size: '1024x1024',
    n: 1,
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
