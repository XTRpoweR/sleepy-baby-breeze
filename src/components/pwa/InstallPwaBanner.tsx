import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Download, Smartphone, Share, Plus, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Web event fired by Chromium-based browsers before showing the native install prompt.
// We intercept it, stash it, and re-trigger when the user clicks our button.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'pwa-install-dismissed-at';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari exposes this flag when launched from Home Screen.
    (window.navigator as any).standalone === true
  );
};

const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

const recentlyDismissed = (): boolean => {
  try {
    const v = localStorage.getItem(DISMISS_KEY);
    if (!v) return false;
    return Date.now() - parseInt(v, 10) < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
};

/**
 * Floating "Install App" banner that:
 *   • Captures the Android/Desktop install prompt and re-fires on click.
 *   • Shows an iOS-specific instructions modal (since Safari doesn't expose
 *     a programmatic install API).
 *   • Hides itself after install, in standalone mode, or for 7 days
 *     after the user clicks "Later".
 *   • Only shown to authenticated users so visitors don't get nagged.
 */
export const InstallPwaBanner: React.FC = () => {
  const { user } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosOpen, setIosOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (isStandalone()) return;
    if (recentlyDismissed()) return;

    // Chromium-based browsers (Android Chrome, Edge, desktop Chrome).
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall as any);

    // iOS Safari never fires beforeinstallprompt, so show the banner on iOS
    // immediately (a tick later to avoid layout thrash on first paint).
    if (isIOS()) {
      const t = setTimeout(() => setVisible(true), 1500);
      return () => {
        clearTimeout(t);
        window.removeEventListener('beforeinstallprompt', onBeforeInstall as any);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall as any);
    };
  }, [user]);

  // Once installed, the appinstalled event fires — hide the banner.
  useEffect(() => {
    const onInstalled = () => setVisible(false);
    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, []);

  const handleInstall = async () => {
    if (isIOS()) {
      setIosOpen(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === 'accepted') {
      setVisible(false);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!user || !visible) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl p-4 flex items-start gap-3">
          <div className="bg-white/20 rounded-xl p-2 flex-shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight">
              ثبّت SleepyBabyy على شاشتك الرئيسية
            </p>
            <p className="text-xs text-white/85 mt-1 leading-snug">
              للوصول السريع والإشعارات الفورية — مثل أي تطبيق.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-white text-purple-700 hover:bg-white/90 h-8 px-3 text-xs font-semibold"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                ثبّت الآن
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-white/90 hover:bg-white/10 hover:text-white h-8 px-2 text-xs"
              >
                لاحقاً
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white p-1 -m-1"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* iOS install instructions */}
      <Dialog open={iosOpen} onOpenChange={setIosOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-purple-600" />
              التثبيت على iPhone / iPad
            </DialogTitle>
            <DialogDescription>
              متصفح Safari على iPhone يحتاج خطوة واحدة منك لإضافة التطبيق إلى الشاشة الرئيسية.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="bg-purple-100 text-purple-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm flex-shrink-0">
                1
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium mb-1 flex items-center gap-1.5">
                  اضغط زر المشاركة <Share className="h-4 w-4 inline" />
                </p>
                <p className="text-muted-foreground text-xs">
                  في الأسفل (iPhone) أو الأعلى (iPad).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="bg-purple-100 text-purple-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm flex-shrink-0">
                2
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium mb-1 flex items-center gap-1.5">
                  اختر «Add to Home Screen» <Plus className="h-4 w-4 inline" />
                </p>
                <p className="text-muted-foreground text-xs">
                  انزل في القائمة قليلاً لتجدها.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="bg-purple-100 text-purple-700 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm flex-shrink-0">
                3
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium mb-1">اضغط «Add»</p>
                <p className="text-muted-foreground text-xs">
                  ستجد أيقونة SleepyBabyy على شاشتك الرئيسية مثل أي تطبيق.
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
              💡 بعد التثبيت، افتح التطبيق من الأيقونة وفعّل الإشعارات — ستصلك التذكيرات حتى لو لم تكن داخل الموقع.
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                handleDismiss();
                setIosOpen(false);
              }}
              size="sm"
            >
              فهمت
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
