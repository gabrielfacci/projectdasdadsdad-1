// Script de teste para verificar conectividade com API externa
export async function testExternalAPI(userEmail: string) {
  console.log('🧪 TESTE DE CONECTIVIDADE: Iniciando teste da API externa...');
  
  try {
    const startTime = Date.now();
    
    const response = await fetch('/api/license-check', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: userEmail })
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('🧪 RESULTADO DO TESTE:', {
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (response.ok) {
      const data = await response.json();
      console.log('🧪 DADOS RECEBIDOS:', JSON.stringify(data, null, 2));
      return { success: true, data, responseTime };
    } else {
      console.log('🧪 ERRO HTTP:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}`, responseTime };
    }
    
  } catch (error: any) {
    console.error('🧪 ERRO DE REDE:', error);
    return { success: false, error: error?.message || 'Erro desconhecido' };
  }
}

// Executar teste automaticamente no carregamento
if (typeof window !== 'undefined') {
  (window as any).testLicenseAPI = testExternalAPI;
}