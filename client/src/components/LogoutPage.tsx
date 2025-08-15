import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      console.log('Fazendo logout do usuário atual...');
      
      try {
        // Usar a função de logout do contexto
        await signOut();
        
        // Limpar dados adicionais do localStorage
        const keysToRemove = [
          'ghost-wallet-license-status',
          'ghost-wallet-blockchain-access',
          'utmify_data',
          'ghost-wallet-onboarding'
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Limpar sessionStorage
        sessionStorage.clear();
        
        console.log('Logout concluído com sucesso!');
        
        // Redirecionar para a página de login após um breve delay
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1000);
        
      } catch (error) {
        console.error('Erro durante logout:', error);
        
        // Fallback: limpar manualmente se a função normal falhar
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/auth';
      }
    };

    performLogout();
  }, [signOut]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold ghost-text mb-2">Fazendo logout...</h2>
        <p className="text-muted-foreground">Você será redirecionado em instantes.</p>
      </div>
    </div>
  );
}