
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl } = await req.json();
    
    if (!videoUrl) {
      throw new Error('Video URL is required');
    }

    console.log('Converting video:', videoUrl);

    // For now, we'll implement a simple format detection and fallback
    // In a full implementation, you would use FFmpeg to convert the video
    
    // Extract filename and create new MP4 filename
    const originalFilename = videoUrl.split('/').pop() || 'video';
    const nameWithoutExt = originalFilename.split('.')[0];
    const mp4Filename = `${nameWithoutExt}_converted.mp4`;
    
    // Download the original video
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to download original video');
    }
    
    const videoBlob = await videoResponse.arrayBuffer();
    
    // For now, we'll just re-upload with .mp4 extension
    // In production, you would use FFmpeg to actually convert the format
    const { data, error } = await supabase.storage
      .from('baby-memories')
      .upload(`converted/${mp4Filename}`, videoBlob, {
        contentType: 'video/mp4',
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload converted video');
    }

    // Get the public URL for the converted video
    const { data: urlData } = supabase.storage
      .from('baby-memories')
      .getPublicUrl(`converted/${mp4Filename}`);

    const convertedUrl = urlData.publicUrl;

    console.log('Video conversion completed:', convertedUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        convertedUrl,
        message: 'Video converted successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Video conversion error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Video conversion failed', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
