import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 1. SECURITATE REALĂ: Verificăm cine apelează AI-ul
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const userId = user.id;

    const body = await req.json();
    const { text, tone } = body;
    
    if (!text) {
      return new NextResponse('Missing text field', { status: 400 });
    }

    // 2. DATABASE CHECK: Fetch custom client settings for limits and keys
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('client_settings')
      .select('*')
      .eq('profile_id', userId)
      .single();

    if (settingsError || !settings) {
      return new NextResponse('Settings record not found', { status: 404 });
    }

    // 3. BYOK LOGIC (Bring Your Own Key)
    let apiKeyToUse = process.env.GROQ_API_KEY; 
    let usingCustomKey = false;

    if (settings.custom_ai_api_key) {
      apiKeyToUse = settings.custom_ai_api_key;
      usingCustomKey = true;
    } else {
      if (settings.ai_quota_used >= settings.ai_quota_max) {
        return NextResponse.json({ 
          error: 'Monthly platform AI limit reached. Add your own Groq API key in Brand Settings for unlimited access.' 
        }, { status: 403 });
      }
    }

    // 4. AI ENGINE COMPLETION CALL
    const systemPrompt = `You are an expert B2B SaaS copywriter. Improve the following dunning email to sound ${tone || 'professional'}. Make it highly effective for recovering failed payments. Preserve the {invoice_url} placeholder EXACTLY as it is. Output ONLY the improved text, no intro, no quotes, no extra formatting.`;
    
    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeyToUse}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json({ error: 'Failed to communicate with AI core engine.' }, { status: 500 });
    }

    const aiData = await aiResponse.json();
    const improvedText = aiData.choices[0].message.content.trim();

    // 5. QUOTA ACCOUNTING
    if (!usingCustomKey) {
      await supabaseAdmin
        .from('client_settings')
        .update({ ai_quota_used: settings.ai_quota_used + 1 })
        .eq('profile_id', userId);
    }

    return NextResponse.json({ result: improvedText });
  } catch (error: any) {
    return new NextResponse('Internal Server Processing Error', { status: 500 });
  }
}