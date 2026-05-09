const MEOO_AI_BASE_URL = 'https://api.meoo.host';
const MEOO_PROJECT_SERVICE_AK = Deno.env.get('MEOO_PROJECT_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AUTH_HEADERS = {
  'Authorization': `Bearer ${MEOO_PROJECT_SERVICE_AK}`,
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt, model = 'qwen-image-2.0', size, images = [], n, ...restParams } = body;

    if (typeof n !== 'number' || n < 1 || n > 4) {
      return new Response(
        JSON.stringify({ error: 'Parameter "n" is required and must be an integer between 1 and 4' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const defaultSize = model === 'qwen-image-2.0' ? '1024*1536' : '2K';
    const finalSize = size || defaultSize;

    const content: Array<{ text?: string; image?: string }> = [];
    for (const img of images) {
      content.push({ image: img });
    }
    content.push({ text: prompt });

    const requestBody: Record<string, unknown> = {
      model,
      input: { messages: [{ role: 'user', content }] },
      parameters: { size: finalSize, n, ...restParams },
    };

    const response = await fetch(
      `${MEOO_AI_BASE_URL}/meoo-ai/api/v1/services/aigc/image-generation/generation`,
      { method: 'POST', headers: AUTH_HEADERS, body: JSON.stringify(requestBody) }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return new Response(errorBody, {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
