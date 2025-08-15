// src/lib/pixel.ts

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}

export const initFacebookPixel = () => {
  if (typeof window === 'undefined') return;

  if (!window.fbq) {
    !(function (f: any, b, e, v, n?, t?, s?) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', '648297454492788'); // Seu ID do Pixel
  }
};

export const trackPageView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

export const trackCompleteRegistration = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration');
  }
};

export const trackCompleteOnboarding = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', 'CompleteOnboarding');
  }
};
