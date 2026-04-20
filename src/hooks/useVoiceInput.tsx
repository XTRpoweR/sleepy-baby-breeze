import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

// Map i18n language codes to BCP-47 SpeechRecognition locales
const LANG_MAP: Record<string, string> = {
  ar: 'ar-SA',
  en: 'en-US',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT',
  el: 'el-GR',
  fi: 'fi-FI',
  sv: 'sv-SE',
};

type SpeechRecognitionCtor = new () => any;

const getRecognitionCtor = (): SpeechRecognitionCtor | null => {
  if (typeof window === 'undefined') return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
};

export const useVoiceInput = (onFinalTranscript?: (text: string) => void) => {
  const { i18n, t } = useTranslation();
  const { toast } = useToast();

  const [isSupported] = useState<boolean>(() => !!getRecognitionCtor());
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const finalRef = useRef('');
  const onFinalRef = useRef(onFinalTranscript);

  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  const stop = useCallback(() => {
    const r = recognitionRef.current;
    if (r) {
      try {
        r.stop();
      } catch {
        // noop
      }
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      toast({ title: t('chat.voice.notSupported'), variant: 'destructive' });
      return;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // noop
      }
    }

    const recognition = new Ctor();
    const baseLang = (i18n.language || 'en').split('-')[0];
    recognition.lang = LANG_MAP[baseLang] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    finalRef.current = '';
    setInterimTranscript('');

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      if (final) finalRef.current += final;
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      const err = event?.error;
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        toast({
          title: t('chat.voice.permissionDenied'),
          variant: 'destructive',
        });
      } else if (err === 'no-speech') {
        // silent — common, no toast
      } else if (err !== 'aborted') {
        toast({ title: t('chat.voice.error'), variant: 'destructive' });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      const text = finalRef.current.trim();
      finalRef.current = '';
      recognitionRef.current = null;
      if (text && onFinalRef.current) onFinalRef.current(text);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setIsListening(false);
      toast({ title: t('chat.voice.error'), variant: 'destructive' });
    }
  }, [i18n.language, t, toast]);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  useEffect(() => {
    return () => {
      const r = recognitionRef.current;
      if (r) {
        try {
          r.abort();
        } catch {
          // noop
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    interimTranscript,
    start,
    stop,
    toggle,
  };
};
