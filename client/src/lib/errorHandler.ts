// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    // Check if it's an auth error
    if (event.reason && typeof event.reason === 'object') {
      if (event.reason.__isAuthError || event.reason.name === 'AuthSessionMissingError') {
        // Silenciar erros de sessão - são esperados quando usuário não está logado
        event.preventDefault();
        return;
      }
      
      if (event.reason.message && event.reason.message.includes('Failed to fetch')) {
        // Silenciar erros de conectividade - são esperados quando API externa está indisponível
        event.preventDefault();
        return;
      }
    }
    
    // Log outros erros importantes
    console.error('Unhandled promise rejection:', event.reason);
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    // Silenciar erros específicos conhecidos
    if (event.error && event.error.message) {
      if (event.error.message.includes('useAuth must be used within an AuthProvider')) {
        event.preventDefault();
        return;
      }
      
      if (event.error.message.includes('AuthSessionMissingError')) {
        event.preventDefault();
        return;
      }
    }
    
    console.error('Global error:', event.error);
  });
}