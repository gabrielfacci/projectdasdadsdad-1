import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LicenseDebugger() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLicenseAPI = async () => {
    if (!user?.email) {
      setTestResult({ error: 'Usuário não logado' });
      return;
    }

    setLoading(true);
    try {
      console.log('Testando API de licenças para:', user.email);
      
      const response = await fetch('https://api.ghostwallet.cloud/check_license.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'GhostWallet/1.0'
        },
        body: JSON.stringify({ email: user.email })
      });

      const responseText = await response.text();
      console.log('Resposta como texto:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = { parseError: 'Erro ao fazer parse do JSON', rawResponse: responseText };
      }

      const result = {
        email: user.email,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data: data,
        hasLicenses: data?.licenses ? data.licenses.length > 0 : false,
        activeLicenses: data?.licenses ? data.licenses.filter((l: any) => l.status === 'active') : []
      };

      setTestResult(result);
      console.log('Resultado do teste:', result);
    } catch (error: any) {
      const errorDetails = {
        email: user.email,
        error: error?.message || 'Erro desconhecido',
        errorType: error?.name || 'UnknownError',
        timestamp: new Date().toISOString(),
        fullError: error
      };
      
      setTestResult(errorDetails);
      console.error('Erro no teste:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceActiveLicense = () => {
    localStorage.setItem('force_license', 'true');
    setTestResult({ message: 'Licença forçada como ativa! Recarregue a página.' });
  };

  const clearForceFlag = () => {
    localStorage.removeItem('force_license');
    localStorage.removeItem('forcar_licenca_ativa');
    localStorage.removeItem('debug_licencas');
    setTestResult({ message: 'Flags de teste removidas! Recarregue a página.' });
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: 'white', 
      border: '2px solid #333', 
      padding: '15px', 
      borderRadius: '8px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <h3>Debug Licenças</h3>
      <p>Usuário: {user?.email || 'N/A'}</p>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button 
          onClick={testLicenseAPI}
          disabled={loading}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '6px 10px',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '11px'
          }}
        >
          {loading ? 'Testando...' : 'Testar API'}
        </button>
        
        <button 
          onClick={forceActiveLicense}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '6px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Forçar Licença
        </button>
        
        <button 
          onClick={clearForceFlag}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '6px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Limpar Flags
        </button>
      </div>

      {testResult && (
        <div style={{ marginTop: '10px', fontSize: '11px' }}>
          <strong>Resultado:</strong>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '8px', 
            borderRadius: '4px', 
            overflow: 'auto',
            maxHeight: '150px'
          }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}