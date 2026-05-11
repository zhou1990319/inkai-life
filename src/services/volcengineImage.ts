// 火山引擎即梦AI图像生成服务（Ark OpenAI兼容接口）
// 文档: https://www.volcengine.com/docs/82379/1541523

import { supabase } from '../supabase/client';

// ========== 配置 ==========
// 由 webpack.DefinePlugin 从 .env.production 注入
// 如注入失败则使用空字符串(构建时会报警告)
const ARK_API_KEY: string = (process as any).env.ARK_API_KEY || '';
const ARK_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

if (!ARK_API_KEY) {
  console.error('[Volcengine] 缺少 ARK_API_KEY！请在 .env.production 中配置。');
}

// 支持的模型
export type VolcengineImageModel = 'doubao-seedream-5-0-260128' | 'doubao-seedream-4-5-251128' | 'doubao-seedream-4-0-250828';

// 默认模型（最新版本）
const DEFAULT_MODEL: VolcengineImageModel = 'doubao-seedream-5-0-260128';

export interface ImageGenerationOptions {
  prompt: string;
  model?: VolcengineImageModel;
  size?: string;       // e.g. "1024x1024", "768x1344", "1344x768"
  n?: number;          // 生成数量 1-4
  guidance_scale?: number; // 引导系数 1.0-10.0
  watermark?: boolean;      // 是否添加水印
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
 * 调用火山引擎即梦AI生成图像（Ark OpenAI兼容接口）
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
    const payload = {
      model,
      prompt,
      n,
      size,
      guidance_scale,
      watermark,
      response_format: 'url',
    };

    const response = await fetch(ARK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Volcengine] API error:', data);
      return {
        success: false,
        error: data.error?.message || `API error: ${response.status}`,
        raw: data,
      };
    }

    // OpenAI兼容格式: { data: [{ url: "..." }, ...] }
    const urls = (data.data || [])
      .map((item: { url?: string; b64_json?: string }) => item.url)
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

/**
 * 生成国风纹身设计图
 * 自动优化prompt，适配纹身风格
 */
export async function generateTattooDesign(
  description: string,
  options?: Partial<ImageGenerationOptions>
): Promise<ImageGenerationResult> {
  // 自动增强纹身风格prompt
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

/**
 * 图生图模式 - 以参考图为基础生成纹身设计
 */
export async function generateTattooFromImage(
  baseImageUrl: string,
  description: string,
  options?: Partial<Omit<ImageGenerationOptions, 'model'>>
): Promise<ImageGenerationResult> {
  const prompt = [
    description,
    'transform into Chinese traditional tattoo style',
    'black ink tattoo design',
    'maintain original composition and structure',
  ].join(', ');

  return generateImageWithVolcengine({
    prompt,
    model: 'doubao-seedream-4-0-250828', // 4.0模型支持图生图
    size: '1024x1024',
    n: 1,
    ...options,
  });
}

// ========== 上传到 Supabase Storage ==========

/**
 * 将生成的图片上传到 Supabase Storage
 * 返回公开访问URL
 */
export async function uploadGeneratedImage(
  imageUrl: string,
  fileName: string,
  bucket: string = 'tattoo-designs'
): Promise<string | null> {
  try {
    // 1. 下载图片
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) throw new Error('下载图片失败');

    const blob = await imgResponse.blob();

    // 2. 上传到 Supabase
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

    // 3. 获取公开URL
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  } catch (error) {
    console.error('[Upload] Failed:', error);
    return null;
  }
}

// ========== 完整工作流 ==========

/**
 * 一键生成纹身设计图并上传到 Supabase
 * 返回最终可访问的图片URL
 */
export async function generateAndUploadTattoo(
  description: string,
  userId: string
): Promise<string | null> {
  // 1. 生成图片
  const result = await generateTattooDesign(description);
  if (!result.success || !result.image_url) {
    console.error('[Workflow] 生成失败:', result.error);
    return null;
  }

  // 2. 生成文件名
  const timestamp = Date.now();
  const fileName = `${userId}/${timestamp}-${description.slice(0, 20)}.png`;

  // 3. 上传到 Supabase
  const publicUrl = await uploadGeneratedImage(result.image_url, fileName);
  return publicUrl;
}
