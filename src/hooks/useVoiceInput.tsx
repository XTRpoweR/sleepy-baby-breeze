import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

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

const VOICE_LANG_KEY = 'voice_input_lang';

const getRecognitionCtor = (): any => {
  if (typeof window === 'undefined') return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
};

const detectLang = (i18nLang: string): string => {
  // 1. user-stored override
  try {
    const stored = localStorage.getItem(VOICE_LANG_KEY);
    if (stored) return stored;
  } catch {
    // noop
  }
  // 2. i18n language
  const base = (i18nLang || '').split('-')[0];
  if (LANG_MAP[base]) return LANG_MAP[base];
  // 3. browser language fallback (catches Arabic users even if app is in English)
  const navLang = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
  const navBase = navLang.split('-')[0];
  if (LANG_MAP[navBase]) return LANG_MAP[navBase];
  return 'en-US';
};

export const useVoiceInput = (onFinalTranscript?: (text: string) => void) => {
  const { i18n, t } = useTranslation();
  const { toast } = useToast();

  const [isSupported] = useState<boolean>(() => !!getRecognitionCtor());
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [language, setLanguageState] = useState<string>(() => detectLang(i18n.language));

  const recognitionRef = useRef<any>(null);
  const finalRef = useRef('');
  const onFinalRef = useRef(onFinalTranscript);
  const userStoppedRef = useRef(false);
  const langRef = useRef(language);

  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  useEffect(() => {
    langRef.current = language;
  }, [language]);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(VOICE_LANG_KEY, lang);
    } catch {
      // noop
    }
  }, []);

  const buildRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return null;
    const recognition = new Ctor();
    recognition.lang = langRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    return recognition;
  }, []);

  const stop = useCallback(() => {
    userStoppedRef.current = true;
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
        recognitionRef.current.abort();
      } catch {
        // noop
      }
      recognitionRef.current = null;
    }

    const recognition = buildRecognition();
    if (!recognition) return;

    finalRef.current = '';
    userStoppedRef.current = false;
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
      if (final) {
        finalRef.current += final;
        // emit incrementally so user sees text being added
        if (onFinalRef.current) onFinalRef.current(final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      const err = event?.error;
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        userStoppedRef.current = true;
        toast({
          title: t('chat.voice.permissionDenied'),
          variant: 'destructive',
        });
      } else if (err === 'no-speech' || err === 'aborted' || err === 'audio-capture') {
        // no toast — handled by onend restart logic
      } else if (err === 'language-not-supported') {
        userStoppedRef.current = true;
        toast({ title: t('chat.voice.error'), variant: 'destructive' });
      } else {
        // network or other — don't toast every blip
        // eslint-disable-next-line no-console
        console.warn('SpeechRecognition error:', err);
      }
    };

    recognition.onend = () => {
      setInterimTranscript('');
      // Auto-restart if user didn't explicitly stop (handles silence + browser auto-end)
      if (!userStoppedRef.current) {
        try {
          const next = buildRecognition();
          if (!next) {
            setIsListening(false);
            recognitionRef.current = null;
            return;
          }
          // re-attach handlers
          next.onstart = recognition.onstart;
          next.onresult = recognition.onresult;
          next.onerror = recognition.onerror;
          next.onend = recognition.onend;
          recognitionRef.current = next;
          next.start();
          return;
        } catch {
          // fall through to clean stop
        }
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setIsListening(false);
      toast({ title: t('chat.voice.error'), variant: 'destructive' });
    }
  }, [buildRecognition, t, toast]);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  useEffect(() => {
    return () => {
      userStoppedRef.current = true;
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
    language,
    setLanguage,
    availableLanguages: LANG_MAP,
  };
};
