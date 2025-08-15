/**
 * Captures UTM parameters from URL and stores them in localStorage
 */
export function captureUTMs(): void {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

    const utmData = utmParams.reduce((acc, key) => {
      const value = urlParams.get(key);
      if (value) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    if (Object.keys(utmData).length > 0) {
      console.log('[GhostWallet][UTM] Parâmetros UTM capturados:', utmData);
      localStorage.setItem('utmify_data', JSON.stringify(utmData));
    }
  } catch (error) {
    console.error('[GhostWallet][UTM] Erro ao capturar UTMs:', error);
  }
}

/**
 * Appends UTM parameters from localStorage to a given link
 * This function reads UTM data stored by UTMify and adds them to checkout links
 */
export function generateUTMUrl(url: string): string {
  if (!url) return '';

  try {
    const storedUtmData = localStorage.getItem('utmify_data');
    const urlObj = new URL(url);

    if (storedUtmData) {
      const data = JSON.parse(storedUtmData);
      Object.entries(data).forEach(([key, value]) => {
        urlObj.searchParams.append(key, value as string);
      });
    } else {
      // Default UTM parameters if none stored
      const defaultParams = {
        utm_source: 'ghostwallet',
        utm_medium: 'app',
        utm_campaign: 'upgrade'
      };

      Object.entries(defaultParams).forEach(([key, value]) => {
        urlObj.searchParams.append(key, value);
      });
    }

    return urlObj.toString();
  } catch (error) {
    console.error('[GhostWallet][UTM] Error generating UTM URL:', error);
    return url;
  }
}