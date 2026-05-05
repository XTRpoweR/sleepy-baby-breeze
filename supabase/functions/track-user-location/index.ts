import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    // Extract IP (first one from x-forwarded-for)
    const fwd = req.headers.get('x-forwarded-for') || '';
    const ip = fwd.split(',')[0].trim() || req.headers.get('cf-connecting-ip') || '';

    if (!ip || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.')) {
      return new Response(JSON.stringify({ ok: true, skipped: 'no_public_ip' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Skip if recently updated (within 24h)
    const { data: existing } = await admin
      .from('user_locations')
      .select('updated_at, last_ip')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing && existing.last_ip === ip) {
      const ageMs = Date.now() - new Date(existing.updated_at).getTime();
      if (ageMs < 24 * 60 * 60 * 1000) {
        return new Response(JSON.stringify({ ok: true, cached: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Lookup geo
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'SleepyBabyy/1.0' },
    });
    if (!geoRes.ok) {
      return new Response(JSON.stringify({ ok: false, error: 'geo_lookup_failed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const geo = await geoRes.json();

    if (geo.error) {
      return new Response(JSON.stringify({ ok: false, error: geo.reason || 'geo_error' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = {
      user_id: userId,
      country: geo.country_name || null,
      country_code: geo.country_code || null,
      city: geo.city || null,
      region: geo.region || null,
      timezone: geo.timezone || null,
      last_ip: ip,
      updated_at: new Date().toISOString(),
    };

    const { error: upErr } = await admin
      .from('user_locations')
      .upsert(payload, { onConflict: 'user_id' });

    if (upErr) {
      console.error('upsert error', upErr);
      return new Response(JSON.stringify({ ok: false, error: upErr.message }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, country: payload.country, city: payload.city }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('track-user-location error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
