import { supabase } from '../supabase/client';

export async function uploadImage(file: File, bucket: string = 'tattoo-images'): Promise<{
  publicUrl: string;
  storagePath: string;
}> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storagePath = `uploads/${fileName}`;

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, Buffer.from(base64, 'base64'), { contentType: file.type });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(storagePath);

  return { publicUrl, storagePath };
}

export async function persistGeneratedImage(tempUrl: string, bucket: string = 'ai-generated'): Promise<string> {
  const response = await fetch(tempUrl);
  if (!response.ok) throw new Error('Failed to download image');

  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  uint8Array.forEach(byte => (binary += String.fromCharCode(byte)));
  const base64 = btoa(binary);

  const mimeType = response.headers.get('content-type') || 'image/png';
  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storagePath = `generated/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, Buffer.from(base64, 'base64'), { contentType: mimeType });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return publicUrl;
}
