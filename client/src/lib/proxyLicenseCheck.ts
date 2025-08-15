// Proxy para verificação de licenças através do backend próprio
export async function proxyLicenseCheck(userEmail: string) {
  console.log('🔄 PROXY: Verificando licenças através do backend próprio...');
  
  try {
    const response = await fetch('/api/license-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: userEmail })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('🔄 PROXY: Resposta recebida do backend:', data);
    
    return data;
  } catch (error: any) {
    console.error('🔄 PROXY: Erro ao verificar licenças via backend:', error);
    throw error;
  }
}