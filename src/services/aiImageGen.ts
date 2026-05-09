import { supabase } from '../supabase/client';

export async function generateImage(
  prompt: string,
  model: 'qwen-image-2.0' | 'wan2.7-image' = 'qwen-image-2.0',
  size?: string,
  options: {
    images?: string[];
    n?: number;
    watermark?: boolean;
    thinking_mode?: boolean;
    seed?: number;
  } = {}
) {
  const n = options.n ?? 1;
  const { data, error } = await supabase.functions.invoke('ai-image-gen', {
    body: { prompt, model, size, n, ...options },
  });
  if (error) throw error;
  return data;
}

export function extractImageUrl(response: any): string | null {
  return response?.output?.choices?.[0]?.message?.content?.[0]?.image ?? null;
}

export function extractAllImageUrls(response: any): string[] {
  const content = response?.output?.choices?.[0]?.message?.content;
  if (!Array.isArray(content)) return [];
  return content.filter((c: any) => c.type === 'image').map((c: any) => c.image);
}

export async function compressImage(
  file: File,
  options?: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    quality?: number;
    outputFormat?: 'image/jpeg' | 'image/webp';
  }
): Promise<File> {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 8000,
    quality = 0.85,
    outputFormat = 'image/webp',
  } = options || {};

  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size <= maxBytes) {
    const img = await loadImage(file);
    if (img.width <= maxWidthOrHeight && img.height <= maxWidthOrHeight) {
      return file;
    }
  }

  const img = await loadImage(file);
  let { width, height } = img;

  if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
    const scale = Math.min(maxWidthOrHeight / width, maxWidthOrHeight / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  let currentQuality = quality;
  while (currentQuality > 0.1) {
    const blob = await canvasToBlob(canvas, outputFormat, currentQuality);
    if (blob.size <= maxBytes) {
      const ext = outputFormat === 'image/webp' ? 'webp' : 'jpg';
      return new File([blob], `compressed.${ext}`, { type: outputFormat });
    }
    currentQuality -= 0.1;
  }

  const blob = await canvasToBlob(canvas, outputFormat, 0.1);
  const ext = outputFormat === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], `compressed.${ext}`, { type: outputFormat });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
      type,
      quality
    );
  });
}
