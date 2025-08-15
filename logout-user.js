// Script para fazer logout do usuário atual
// Este arquivo pode ser executado para deslogar o usuário

const logout = () => {
  console.log('Fazendo logout do usuário atual...');
  
  // Limpar todos os dados do localStorage relacionados à autenticação
  const keysToRemove = [
    'ghost-wallet-user',
    'ghost-wallet-session', 
    'ghost-wallet-profile',
    'ghost-wallet-license-status',
    'ghost-wallet-blockchain-access',
    'supabase.auth.token',
    'sb-supabase-auth-token'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Removido: ${key}`);
  });
  
  // Limpar sessionStorage também
  sessionStorage.clear();
  console.log('SessionStorage limpo');
  
  console.log('Logout concluído! Recarregando página...');
  
  // Recarregar a página para garantir que o estado seja resetado
  window.location.reload();
};

// Executar logout
logout();