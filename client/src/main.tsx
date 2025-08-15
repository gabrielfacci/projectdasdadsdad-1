
// Primeiro, desregistrar qualquer service worker existente
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Service worker desregistrado com sucesso');
    }
    // Recarregar a página após desregistrar os service workers
    if (registrations.length > 0) {
      window.location.reload();
    }
  });
}

// Restante do código do main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill globals
import { Buffer } from 'buffer';
import process from 'process';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}

window.global = window;
window.Buffer = Buffer;
window.process = process;

// Add global error handlers to prevent unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Check if it's an auth error or connection error - these are expected
  if (event.reason && typeof event.reason === 'object') {
    if (event.reason.__isAuthError || 
        event.reason.name === 'AuthSessionMissingError' ||
        (event.reason.message && event.reason.message.includes('Failed to fetch'))) {
      // Silenciar erros esperados
      event.preventDefault();
      return;
    }
  }
  
  // Log outros erros importantes
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  // Silenciar erros específicos conhecidos
  if (event.error && event.error.message) {
    if (event.error.message.includes('useAuth must be used within an AuthProvider') ||
        event.error.message.includes('AuthSessionMissingError')) {
      event.preventDefault();
      return;
    }
  }
  
  console.error('Global error:', event.error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
