// Script para logout completo
console.log('[GhostWallet] Iniciando logout completo...');

// Limpar localStorage
localStorage.clear();
console.log('[GhostWallet] localStorage limpo');

// Limpar sessionStorage  
sessionStorage.clear();
console.log('[GhostWallet] sessionStorage limpo');

// Forçar reload da página para reinicializar o app
setTimeout(() => {
  window.location.href = '/auth';
}, 500);

console.log('[GhostWallet] Logout completo - redirecionando para /auth');