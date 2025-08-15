import { useEffect } from 'react';

export default function ForceLogout() {
  useEffect(() => {
    console.log('Executando logout forçado...');
    
    // Limpar todos os dados do localStorage
    const keysToRemove = [
      'ghost-wallet-user',
      'ghost-wallet-session', 
      'ghost-wallet-profile',
      'ghost-wallet-license-status',
      'ghost-wallet-blockchain-access',
      'supabase.auth.token',
      'sb-supabase-auth-token',
      'utmify_data',
      'ghost-wallet-onboarding'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removido: ${key}`);
    });
    
    // Limpar sessionStorage
    sessionStorage.clear();
    console.log('SessionStorage limpo');
    
    // Forçar recarga da página para resetar o estado da aplicação
    setTimeout(() => {
      console.log('Logout concluído, recarregando página...');
      window.location.reload();
    }, 500);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      fontSize: '18px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>🔄</div>
        <div>Fazendo logout...</div>
      </div>
    </div>
  );
}