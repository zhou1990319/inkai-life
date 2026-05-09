import { getSupabaseUrl, getSupabaseAnonKey } from '../supabase/client';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function requestLLMStream(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  options?: {
    model?: string;
    signal?: AbortSignal;
  }
) {
  const { model = 'qwen3.6-plus', signal } = options ?? {};

  const response = await fetch(
    `${getSupabaseUrl()}/functions/v1/ai-chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      },
      body: JSON.stringify({ messages, model, stream: true }),
      signal,
    }
  );
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const payload = trimmed.slice(6);
        if (payload === '[DONE]') return fullText;

        try {
          const json = JSON.parse(payload);
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
            onChunk(content);
          }
        } catch {
          // Ignore invalid JSON lines
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') return fullText;
    throw err;
  }

  return fullText;
}

export async function analyzeTattooMeaning(prompt: string): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are an expert in Chinese traditional tattoo symbolism and cultural meaning. Provide detailed analysis of tattoo designs including: 1) Cultural significance and symbolism, 2) Historical context, 3) Feng shui implications, 4) Placement recommendations. Respond in English.'
    },
    { role: 'user', content: `Analyze the cultural meaning and symbolism of this Chinese traditional tattoo design: "${prompt}"` }
  ];

  let result = '';
  await requestLLMStream(messages, (chunk) => { result += chunk; });
  return result;
}
