import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

// Standalone <audio> singleton driven by AI tool calls. Sits at the App root
// and listens for window events dispatched by ChatAssistant when the
// chat-assistant edge function returns client_actions like {type:"play_music"}.
//
// This is intentionally separate from useAudioPlayer (which is mounted only
// on the /sounds page) — the AI needs to control music from anywhere in the
// app, not just the sounds page.
export const AiMusicBridge: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = 'none';
      el.loop = true;
      audioRef.current = el;
    }
    const audio = audioRef.current;

    const onPlay = (e: Event) => {
      const detail = (e as CustomEvent).detail as { url: string; name: string };
      if (!detail?.url) return;
      try {
        if (audio.src !== window.location.origin + detail.url) {
          audio.src = detail.url;
        }
        const promise = audio.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(() => {
            toast.error('Tap the play button once — browser blocked autoplay');
          });
        }
        toast.success(`Playing: ${detail.name}`);
      } catch {
        toast.error('Could not play track');
      }
    };

    const onStop = () => {
      try {
        audio.pause();
        audio.currentTime = 0;
        toast.success('Music stopped');
      } catch {
        // ignore
      }
    };

    window.addEventListener('ai:play-music', onPlay as EventListener);
    window.addEventListener('ai:stop-music', onStop as EventListener);

    return () => {
      window.removeEventListener('ai:play-music', onPlay as EventListener);
      window.removeEventListener('ai:stop-music', onStop as EventListener);
      try { audio.pause(); } catch { /* noop */ }
    };
  }, []);

  return null;
};
