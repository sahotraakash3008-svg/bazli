import React, { useState, useEffect } from 'react';
import { Download, Bell, X, Sparkles, Smartphone, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../utils/translations';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallBanner: React.FC = () => {
  const { language, t } = useLanguage();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('bazli_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [notificationStatus, setNotificationStatus] = useState<string>('default');
  const [showPushToast, setShowPushToast] = useState<boolean>(false);

  useEffect(() => {
    // Check if running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration info:', err);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      // Fallback instructions if native prompt isn't directly dispatchable (iOS or already prompted)
      alert(
        language === 'hi'
          ? 'Bazli ऐप को अपनी होम स्क्रीन पर जोड़ने के लिए ब्राउज़र मेनू (तीन डॉट्स या शेयर बटन) पर टैप करें और "Add to Home screen" चुनें।'
          : 'To install Bazli on your device, tap your browser menu (or Share button on iOS Safari) and select "Add to Home Screen".'
      );
      return;
    }

    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  const handleEnablePushNotifications = async () => {
    if (!('Notification' in window)) {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में पुश नोटिफिकेशन समर्थित नहीं है।'
          : 'Push notifications are not supported in this browser.'
      );
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);

      if (permission === 'granted') {
        setShowPushToast(true);
        setTimeout(() => setShowPushToast(false), 4500);

        // Show sample notification immediately to test
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification('Bazli 10-Min Delivery ⚡', {
            body: language === 'hi'
              ? 'डिलीवरी राइडर आपके घर से सिर्फ 2 मिनट की दूरी पर है! (OTP: 4821)'
              : 'Rider is 2 minutes away from your doorstep! (Doorstep OTP: 4821)',
            icon: '/icon.svg',
            badge: '/icon.svg',
            ...( { vibrate: [200, 100, 200] } as any )
          });
        } else {
          new Notification('Bazli 10-Min Delivery ⚡', {
            body: language === 'hi'
              ? 'डिलीवरी राइडर आपके घर से सिर्फ 2 मिनट की दूरी पर है!'
              : 'Rider is 2 minutes away from your doorstep!',
            icon: '/icon.svg'
          });
        }
      }
    } catch (err) {
      console.warn('Notification permission error:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('bazli_pwa_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  if (isDismissed || isInstalled) return null;

  return (
    <>
      {/* Push Notification Toast confirmation */}
      {showPushToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-emerald-900 border-2 border-emerald-400 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-extrabold text-white">
              {language === 'hi' ? '🔔 पुश नोटिफिकेशन सक्रिय!' : '🔔 Push Notifications Active!'}
            </p>
            <p className="text-emerald-200 mt-0.5">
              {language === 'hi'
                ? 'अब आपको "2 मिनट दूर" और लाइव OTP अलर्ट तुरंत मिलेंगे।'
                : 'You will now receive instant "2 mins away" and Doorstep OTP alerts.'}
            </p>
          </div>
        </div>
      )}

      {/* Subtle, non-intrusive Install & Alert Banner for Mobile & Desktop */}
      <div className="w-full bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-blue-500/15 border-b border-amber-500/20 px-3 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-100 mr-1.5">
                {language === 'hi' ? 'बज़ली ऐप इंस्टॉल करें' : 'Install Bazli App'}
              </span>
              <span className="text-slate-400 hidden sm:inline text-[11px]">
                {language === 'hi'
                  ? '• 1-टैप ऑर्डर, लाइव GPS मैप और सुपरफास्ट 10-मिनट डिलीवरी'
                  : '• 1-tap ordering, real-time GPS tracking & 10-min instant delivery'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Push notification enable button */}
            {notificationStatus !== 'granted' && (
              <button
                onClick={handleEnablePushNotifications}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Enable instant order & OTP alerts"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">
                  {language === 'hi' ? 'अलर्ट चालू करें' : 'Get Alerts'}
                </span>
              </button>
            )}

            {/* Install Button */}
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-[11px] font-black shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}</span>
            </button>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800/60 transition-colors cursor-pointer"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
