import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      localStorage.setItem('ghost-wallet-language', language);
      
      // Update user language in database if authenticated
      const user = JSON.parse(localStorage.getItem('ghost-wallet-user') || 'null');
      if (user?.email) {
        try {
          await fetch('/api/update-user-language', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: user.email,
              language: language
            })
          });
        } catch (error) {
          console.warn('Failed to update user language in database:', error);
        }
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const getLanguageOptions = () => [
    { 
      code: 'pt-BR', 
      name: 'Português', 
      flag: '🇧🇷',
      nativeName: 'Português (Brasil)'
    },
    { 
      code: 'en-US', 
      name: 'English', 
      flag: '🇺🇸',
      nativeName: 'English (US)'
    },
    { 
      code: 'es-ES', 
      name: 'Español', 
      flag: '🇪🇸',
      nativeName: 'Español (España)'
    }
  ];

  const getCurrentLanguage = () => {
    return getLanguageOptions().find(lang => lang.code === i18n.language) || getLanguageOptions()[0];
  };

  return {
    t,
    i18n,
    changeLanguage,
    getLanguageOptions,
    getCurrentLanguage,
    currentLanguage: i18n.language
  };
};

export default useTranslation;