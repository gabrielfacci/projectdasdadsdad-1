import { syncLicenseStatus } from './licenseCheck';
import { supabase } from './supabaseClient';

let syncInterval: number | null = null;
const LICENSE_SYNC_INTERVAL = 60000; // 1 minuto
const SYNC_CHECK_DEBUG = true; // Habilitar logs detalhados de sincronização

export async function startLicenseSync(userEmail: string | null, onLicenseChange?: (hasLicense: boolean) => void) {
  if (!userEmail) {
    console.error('[GhostWallet][LicenseSync] Tentativa de iniciar sincronização sem email de usuário');
    return;
  }

  // Limpar intervalo anterior, se existir
  if (syncInterval) {
    if (SYNC_CHECK_DEBUG) console.log('[GhostWallet][LicenseSync] Limpando intervalo anterior de sincronização');
    clearInterval(syncInterval);
  }

  // Função para atualizar perfil do usuário com status de licença
  const updateUserProfile = async (userId: string, hasLicense: boolean) => {
    try {
      const { data, error } = await supabase
        .rpc('update_user_license_status_v4', {
          p_user_id: userId,
          p_has_license: hasLicense
        });

      if (error) {
        console.error('[GhostWallet][LicenseSync] Erro ao atualizar perfil do usuário:', error);
        return false;
      }

      if (SYNC_CHECK_DEBUG) console.log('[GhostWallet][LicenseSync] Perfil do usuário atualizado com sucesso:', hasLicense);
      return true;
    } catch (err) {
      console.error('[GhostWallet][LicenseSync] Exceção ao atualizar perfil:', err);
      return false;
    }
  };

  // Função para verificar licença e processar mudanças
  const checkLicense = async (forceUpdate = false) => {
    try {
      console.log('[GhostWallet][LicenseSync] Verificando licença para:', userEmail);

      // Obter ID do usuário
      const { data: userIdResult, error: userIdError } = await supabase
        .rpc('get_user_id_by_email_rpc', { p_email: userEmail });

      if (userIdError || !userIdResult?.id) {
        console.error('[GhostWallet][LicenseSync] Erro ao obter ID do usuário:', userIdError);
        return;
      }

      // Verificar licenças com o servidor externo e banco de dados
      const licenses = await syncLicenseStatus(userEmail);
      const hasLicense = licenses.some(license => license.status === 'active');

      // Verificar se o status mudou
      const storedStatus = localStorage.getItem('ghost-wallet-license-status');
      let previousStatus = false;

      if (storedStatus) {
        try {
          const parsed = JSON.parse(storedStatus);
          previousStatus = parsed.hasLicense === true;
        } catch (e) {
          console.error('[GhostWallet][LicenseSync] Erro ao ler status anterior:', e);
        }
      }

      // Atualizar status no localStorage
      localStorage.setItem('ghost-wallet-license-status', JSON.stringify({
        hasLicense,
        checkedAt: new Date().toISOString()
      }));

      // Se o status mudou ou foi solicitada uma atualização forçada
      if (forceUpdate || previousStatus !== hasLicense) {
        console.log('[GhostWallet][LicenseSync] Status de licença alterado:', 
          previousStatus, '->', hasLicense, forceUpdate ? '(forçado)' : '');

        // Atualizar perfil do usuário no banco de dados
        await updateUserProfile(userIdResult.id, hasLicense);

        // Notificar componentes sobre a mudança
        if (onLicenseChange) {
          onLicenseChange(hasLicense);
        }

        return {
          changed: true,
          hasLicense
        };
      }

      if (SYNC_CHECK_DEBUG) console.log('[GhostWallet][LicenseSync] Status não alterado:', hasLicense);

      return {
        changed: false,
        hasLicense
      };
    } catch (err) {
      console.error('[GhostWallet][LicenseSync] Erro na verificação de licença:', err);
      return {
        changed: false,
        hasLicense: false,
        error: err
      };
    }
  };

  // Primeira verificação imediata
  console.log('[GhostWallet][LicenseSync] Iniciando sincronização inicial para:', userEmail);
  const initialCheck = await checkLicense(true);

  // Iniciar verificação contínua no intervalo definido
  syncInterval = window.setInterval(async () => {
    try {
      await checkLicense();
    } catch (err) {
      console.error('[GhostWallet][LicenseSync] Erro no intervalo de verificação:', err);
    }
  }, LICENSE_SYNC_INTERVAL);

  console.log('[GhostWallet][LicenseSync] Sincronização configurada com sucesso. Intervalo:', LICENSE_SYNC_INTERVAL, 'ms');

  // Retornar função de limpeza
  return {
    stopSync: () => {
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('[GhostWallet][LicenseSync] Sincronização de licença interrompida');
      }
    },
    forceCheck: async () => {
      console.log('[GhostWallet][LicenseSync] Verificação forçada de licença');
      return await checkLicense(true);
    },
    initialStatus: initialCheck.hasLicense
  };
}