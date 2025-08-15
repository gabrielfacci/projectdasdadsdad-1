import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';
import { getAuthorizedBlockchains, hasBlockchainAccess } from './productLicenses';

interface License {
  id: string;
  user_email: string;
  license_key: string;
  status: 'active' | 'inactive' | 'expired';
  plan: string;
  product_code?: string;
  created_at: string;
  expires_at: string;
}

interface ExternalLicenseResponse {
  success: boolean;
  licenses?: Array<{
    license_key: string;
    status: 'active' | 'inactive' | 'expired';
    product_code: string;
    plan: string;
    expires_at: string;
  }>;
  features?: {
    blockchains?: string[];
  };
  message?: string;
}

// Verificação local de licença
export async function syncLicenseStatus(user: User | null | string): Promise<License[]> {
  try {
    // Aceita tanto um objeto User quanto um email como string
    const userEmail = typeof user === 'string' ? user : user?.email;
    
    if (!userEmail) {
      console.log('[GhostWallet][LicenseCheck] Usuário não autenticado para sincronizar licença');
      return [];
    }

    // Evitar logs excessivos - aumentado para 30 segundos
    const debugFrequency = 30000; // 30 segundos
    const lastLog = parseInt(localStorage.getItem('last-license-log') || '0');
    const now = Date.now();
    
    if (now - lastLog > debugFrequency) {
      console.log('[GhostWallet][LicenseCheck] Verificando licença para:', userEmail);
      localStorage.setItem('last-license-log', now.toString());
    }

    // **VERIFICAÇÃO REAL FORÇADA**: Sempre fazer verificação no servidor externo

    // VERIFICAÇÃO PRINCIPAL: Usar a função RPC validate_all_licenses_rpc para verificar todas as licenças
    try {
      // Primeiro verificar licença no servidor externo através do proxy
      try {
        
        const response = await fetch('/api/license-check', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: userEmail })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Verificar nova estrutura da API (com 3 verificações de produto)
          if (data && data.success) {
            if (data.hasActiveLicense && data.activeLicense) {
              // Only log when license is found (reduce spam)
              if (now - lastLog > debugFrequency) {
                console.log('[GhostWallet][LicenseCheck] ✅ Licença ATIVA encontrada!', data.activeLicense.productCode);
              }
              
              // Atualizar no Supabase
              const { data: userIdResult } = await supabase
                .rpc('get_user_id_by_email_rpc', { p_email: userEmail });

              if (userIdResult?.id) {
                await supabase.rpc('update_user_license_status_v4', {
                  p_user_id: userIdResult.id,
                  p_has_license: true
                });
              }

              // Salvar informações específicas da licença no localStorage
              const licenseData = {
                hasLicense: true,
                productCode: data.activeLicense.productCode,
                allowedBlockchains: data.allowedBlockchains,
                verificationResults: data.verificationResults,
                checkedAt: new Date().toISOString()
              };
              
              localStorage.setItem('ghost-wallet-license-status', JSON.stringify(licenseData));
              
              // Criar licenças no formato esperado pelo sistema
              const mappedLicenses = [{
                id: `external-${data.activeLicense.productCode}`,
                user_email: userEmail,
                license_key: data.activeLicense.productCode,
                status: 'active' as const,
                plan: data.activeLicense.productCode === 'PPPBC295' ? 'ENTERPRISE' : 
                      data.activeLicense.productCode === 'PPPBC293' ? 'PREMIUM' : 'BASIC',
                product_code: data.activeLicense.productCode,
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
              }];
              
              console.log('[GhostWallet][LicenseCheck] Licenças mapeadas:', mappedLicenses);
              
              // Retornar licença ativa
              return mappedLicenses;
            } else {
              // Only log no license found occasionally to reduce spam
              if (now - lastLog > debugFrequency) {
                console.log('[GhostWallet][LicenseCheck] ❌ Nenhuma licença ativa encontrada');
              }
            }
          } else {
            console.warn('[GhostWallet][LicenseCheck] Resposta do servidor externo não tem formato esperado:', data);
          }
        } else {
          console.error('[GhostWallet][LicenseCheck] Servidor externo retornou erro:', response.status, response.statusText);
        }
      } catch (error: any) {
        // Diagnóstico detalhado do erro da API externa
        console.warn('[GhostWallet][LicenseCheck] 🔴 ERRO PROXY/API EXTERNA:', {
          erro: error?.message || 'Desconhecido',
          tipo: error?.name || 'NetworkError',
          causa: error?.cause || 'N/A'
        });
        console.log('[GhostWallet][LicenseCheck] ⬇️ Usando fallback local devido ao erro no proxy/API externa');
      }

      // Continuar com verificação no Supabase
      const { data: licenseResult, error: rpcError } = await supabase
        .rpc('validate_all_licenses_rpc', { p_email: userEmail });
        
      if (rpcError) {
        console.error('[GhostWallet][LicenseCheck] Erro na verificação principal via RPC:', rpcError);
        // Continua para o fallback
      } else if (licenseResult?.licenses && licenseResult.licenses.length > 0) {
        const hasActiveLicense = licenseResult.licenses.some((license: any) => license.status === 'active');
        
        // Salvar status no localStorage para uso futuro
        localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
          hasLicense: hasActiveLicense,
          checkedAt: new Date().toISOString()
        }));
        
        console.log('[GhostWallet][LicenseCheck] Licenças encontradas via RPC principal:', licenseResult.licenses);
        console.log('[GhostWallet][LicenseCheck] Status da licença: ', hasActiveLicense ? 'ATIVA ✓' : 'INATIVA ✗');
        
        return licenseResult.licenses;
      } else {
        console.log('[GhostWallet][LicenseCheck] Nenhuma licença encontrada via RPC principal');
      }
    } catch (primaryRpcError) {
      console.error('[GhostWallet][LicenseCheck] Exceção na verificação principal:', primaryRpcError);
      // Continua para o fallback
    }
      
    // FALLBACK 1: Verificar diretamente na tabela de licenças
    try {
      console.log('[GhostWallet][LicenseCheck] Tentando fallback 1: consulta direta à tabela...');
      
      // Obtém o ID do usuário pelo email usando RPC ao invés de query direta
      // Esta abordagem pode ser mais confiável com permissões restritas
      const { data: userIdResult, error: userIdError } = await supabase
        .rpc('get_user_id_by_email_rpc', { p_email: userEmail });
        
      if (userIdError || !userIdResult?.id) {
        console.error('[GhostWallet][LicenseCheck] Erro ao obter ID do usuário:', userIdError);
        // Continua para o próximo fallback
      } else if (userIdResult.id) {
        // Agora busca as licenças usando o user_id
        const { data: existingLicenses, error } = await supabase
          .from('licenses')
          .select('*')
          .eq('user_id', userIdResult.id);
          
        if (error) {
          console.error('[GhostWallet][LicenseCheck] Erro no fallback 1:', error);
          // Continua para o próximo fallback
        } else if (existingLicenses && existingLicenses.length > 0) {
        const hasActiveLicense = existingLicenses.some((license: any) => license.status === 'active');
        
        // Salvar status no localStorage para uso futuro
        localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
          hasLicense: hasActiveLicense,
          checkedAt: new Date().toISOString()
        }));
        
        console.log('[GhostWallet][LicenseCheck] Licenças encontradas via fallback 1:', existingLicenses);
        console.log('[GhostWallet][LicenseCheck] Status da licença: ', hasActiveLicense ? 'ATIVA ✓' : 'INATIVA ✗');
        
        return existingLicenses;
      } else {
          console.log('[GhostWallet][LicenseCheck] Nenhuma licença encontrada via fallback 1');
        }
      } else {
        console.log('[GhostWallet][LicenseCheck] Usuário não encontrado no fallback 1');
      }
    } catch (fallback1Error) {
      console.error('[GhostWallet][LicenseCheck] Exceção no fallback 1:', fallback1Error);
      // Continua para o próximo fallback
    }

    // FALLBACK 2: Tentar outra chamada RPC (tentar novamente)
    try {
      console.log('[GhostWallet][LicenseCheck] Tentando fallback 2: RPC secundário...');
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('validate_all_licenses_rpc', { p_email: userEmail });
        
      if (rpcError) {
        console.error('[GhostWallet][LicenseCheck] Erro no fallback 2:', rpcError);
        // Continua para fallback 3
      } else if (rpcResult?.licenses && rpcResult.licenses.length > 0) {
        const hasActiveLicense = rpcResult.licenses.some((license: any) => license.status === 'active');
        
        // Salvar status no localStorage para uso futuro
        localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
          hasLicense: hasActiveLicense,
          checkedAt: new Date().toISOString()
        }));
        
        console.log('[GhostWallet][LicenseCheck] Licenças encontradas via fallback 2:', rpcResult.licenses);
        console.log('[GhostWallet][LicenseCheck] Status da licença: ', hasActiveLicense ? 'ATIVA ✓' : 'INATIVA ✗');
        
        return rpcResult.licenses;
      } else {
        console.log('[GhostWallet][LicenseCheck] Nenhuma licença encontrada via fallback 2');
      }
    } catch (fallback2Error) {
      console.error('[GhostWallet][LicenseCheck] Exceção no fallback 2:', fallback2Error);
      // Continua para fallback 3
    }
    
    // FALLBACK 3: Consulta direta usando a nova função
    try {
      console.log('[GhostWallet][LicenseCheck] Tentando fallback 3: consulta direta por email...');
      
      // Usar a nova função que consulta diretamente por email
      const { data: directLicenses, error: directError } = await supabase
        .rpc('get_user_licenses_by_email', { p_email: userEmail });
        
      if (directError) {
        console.error('[GhostWallet][LicenseCheck] Erro no fallback 3:', directError);
        // Continua para a licença temporária
      } else if (directLicenses && directLicenses.length > 0) {
        console.log('[GhostWallet][LicenseCheck] Licenças encontradas via consulta direta:', directLicenses);
        
        // Mapear para o formato esperado de licenças
        const licenses = directLicenses.map((license: any) => ({
          id: license.id,
          user_email: userEmail,
          license_key: license.license_key,
          status: license.license_status,
          plan: license.product_code,
          created_at: license.created_at,
          expires_at: license.expires_at
        }));
        
        const hasActiveLicense = licenses.some((license: any) => license.status === 'active');
        
        // Salvar status no localStorage para uso futuro
        localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
          hasLicense: hasActiveLicense,
          checkedAt: new Date().toISOString()
        }));
        
        console.log('[GhostWallet][LicenseCheck] Status da licença (fallback 3): ', hasActiveLicense ? 'ATIVA ✓' : 'INATIVA ✗');
        
        return licenses;
      } else {
        console.log('[GhostWallet][LicenseCheck] Nenhuma licença encontrada via fallback 3');
      }
    } catch (fallback3Error) {
      console.error('[GhostWallet][LicenseCheck] Exceção no fallback 3:', fallback3Error);
      // Continua para a licença temporária
    }

    // Se chegamos aqui, não encontramos nenhuma licença - criar licença gratuita temporária
    console.log('[GhostWallet][LicenseCheck] Nenhuma licença encontrada em todas as verificações. Gerando licença FREE temporária');

    // Cria uma licença temporária em memória
    const tempLicense: License = {
      id: 'temporary',
      user_email: userEmail,
      license_key: `GW-FREE-${Date.now().toString(36).toUpperCase()}`,
      status: 'inactive' as const, // Usuário sem licença paga = inativa
      plan: 'free',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
    };

    // Salvar status no localStorage para uso futuro
    localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
      hasLicense: false,
      checkedAt: new Date().toISOString()
    }));

    // Atualiza o status da licença no perfil do usuário (se possível)
    try {
      console.log('[GhostWallet][LicenseCheck] Atualizando perfil do usuário com licença FREE...');
      const { data: userIdResult, error: userIdError } = await supabase
        .rpc('get_user_id_by_email_rpc', { p_email: userEmail });
        
      if (userIdError) {
        console.error('[GhostWallet][LicenseCheck] Erro ao obter ID do usuário:', userIdError);
      } else if (userIdResult?.id) {
        const { error: updateError } = await supabase
          .rpc('update_user_license_status_v4', {
            p_user_id: userIdResult.id,
            p_has_license: false // Licença FREE é considerada não ativa
          });
          
        if (updateError) {
          console.error('[GhostWallet][LicenseCheck] Erro ao atualizar status no perfil:', updateError);
        } else {
          console.log('[GhostWallet][LicenseCheck] Perfil atualizado com status de licença FREE');
        }
      }
    } catch (profileUpdateError) {
      console.error('[GhostWallet][LicenseCheck] Exceção ao atualizar perfil:', profileUpdateError);
    }
    
    // Retorna a licença temporária
    console.log('[GhostWallet][LicenseCheck] Retornando licença temporária FREE');
    return [tempLicense];

  } catch (error) {
    console.error('[GhostWallet][LicenseCheck] Erro fatal ao sincronizar licença:', error);
    // Em caso de erro não tratado, retorna array vazio indicando sem licenças
    
    // Salvar status no localStorage como sem licença em caso de erro
    localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
      hasLicense: false,
      checkedAt: new Date().toISOString(),
      error: true
    }));
    
    return [];
  }
}

export async function checkLicenseValid(user: User | null): Promise<boolean> {
  try {
    if (!user) {
      return false;
    }

    const licenses = await syncLicenseStatus(user);
    return licenses.some(license => 
      license.status === 'active' && new Date(license.expires_at) > new Date()
    );
  } catch (error) {
    console.error('[GhostWallet] Erro ao verificar validade da licença:', error);
    return false;
  }
}

export async function getLicensePlan(user: User | null): Promise<string> {
  try {
    if (!user) {
      return 'none';
    }

    const licenses = await syncLicenseStatus(user);
    const activeLicense = licenses.find(license => 
      license.status === 'active' && new Date(license.expires_at) > new Date()
    );

    return activeLicense?.plan || 'free';
  } catch (error) {
    console.error('[GhostWallet] Erro ao obter plano da licença:', error);
    return 'free';
  }
}

// Interface para o status da verificação de licenças em lote
export interface LicenseCheckStatus {
  batch_id: string;
  total_users: number;
  processed_users: number;
  success_count: number;
  error_count: number;
  status: string;
  error_details?: any[];
}

/**
 * Inicia uma verificação de licenças em lote para todos os usuários
 * @returns O ID do lote de verificação
 */
export async function startLicenseCheck(): Promise<string> {
  try {
    // Gerar um ID de lote único
    const batchId = `batch_${Date.now().toString(36)}`;
    
    // Iniciar o processo em background
    const { data, error } = await supabase.rpc('start_license_check', {
      batch_id: batchId
    });
    
    if (error) throw new Error(`Erro ao iniciar verificação: ${error.message}`);
    
    console.log('[LicenseCheck] Verificação iniciada com ID:', batchId);
    return batchId;
  } catch (error) {
    console.error('[LicenseCheck] Erro ao iniciar verificação:', error);
    throw error;
  }
}

/**
 * Obtém o status atual de uma verificação de licenças em lote
 * @param batchId O ID do lote de verificação
 * @returns Informações sobre o status atual do lote
 */
export async function getDeploymentStatus(batchId: string): Promise<LicenseCheckStatus> {
  try {
    const { data, error } = await supabase
      .from('license_check_batches')
      .select('*')
      .eq('batch_id', batchId)
      .single();
    
    if (error) {
      console.error('[LicenseCheck] Erro ao buscar status:', error);
      throw new Error(`Erro ao buscar status: ${error.message}`);
    }
    
    // Buscar detalhes de erros, se houver
    let errorDetails = [];
    if (data.error_count > 0) {
      const { data: errors, error: errorsError } = await supabase
        .from('license_check_errors')
        .select('*')
        .eq('batch_id', batchId);
      
      if (!errorsError && errors) {
        errorDetails = errors;
      }
    }
    
    return {
      batch_id: data.batch_id,
      total_users: data.total_users,
      processed_users: data.processed_users,
      success_count: data.success_count,
      error_count: data.error_count,
      status: data.status,
      error_details: errorDetails
    };
  } catch (error) {
    console.error('[LicenseCheck] Erro ao obter status:', error);
    throw error;
  }
}