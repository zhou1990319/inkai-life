import { supabase } from '../supabase/client';

// ========== 浏览器兼容的工具函数 ==========

/**
 * 将 Base64 字符串转换为 Uint8Array（浏览器兼容）
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * 将文件转换为 Uint8Array（浏览器兼容）
 */
async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// ========== 上传函数 ==========

/**
 * 上传图片到 Supabase Storage
 * @param file 文件对象（来自 input[type=file]）
 * @param bucket Storage bucket 名称
 * @param folder 文件夹路径（可选，默认 'uploads'）
 */
export async function uploadImage(
  file: File,
  bucket: string = 'tattoo-images',
  folder: string = 'uploads'
): Promise<{
  publicUrl: string;
  storagePath: string;
}> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  // 移除开头的斜杠，确保路径格式正确
  const cleanFolder = folder.replace(/^\/+/, '');
  const storagePath = `${cleanFolder}/${fileName}`;

  // 使用浏览器兼容的方式获取文件数据
  const uint8Array = await fileToUint8Array(file);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, uint8Array, { contentType: file.type });

  if (uploadError) {
    console.error('[Storage] Upload error:', uploadError);
    throw new Error(`上传失败: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return { publicUrl, storagePath };
}

/**
 * 持久化 AI 生成的图片（从临时 URL 下载后上传）
 */
export async function persistGeneratedImage(
  tempUrl: string,
  bucket: string = 'ai-generated'
): Promise<string> {
  const response = await fetch(tempUrl);
  if (!response.ok) throw new Error('下载图片失败');

  const uint8Array = new Uint8Array(await response.arrayBuffer());
  const mimeType = response.headers.get('content-type') || 'image/png';
  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storagePath = `generated/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, uint8Array, { contentType: mimeType });

  if (uploadError) {
    console.error('[Storage] Persist error:', uploadError);
    throw new Error(`保存失败: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return publicUrl;
}
