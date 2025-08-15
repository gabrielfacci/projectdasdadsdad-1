
import { supabase } from './supabaseClient';

/**
 * Atualiza códigos de referência para usuários que não possuem
 */
export async function updateMissingReferralCodes() {
  try {
    console.log('Iniciando atualização de códigos de referência...');
    
    const { data, error } = await supabase.rpc('generate_missing_referral_codes');
    
    if (error) {
      console.error('Erro ao atualizar códigos de referência:', error);
      throw error;
    }
    
    console.log('Códigos de referência atualizados com sucesso:', data);
    return data;
  } catch (err) {
    console.error('Falha no processo de atualização de códigos:', err);
    throw err;
  }
}

/**
 * Função principal para executar atualizações no banco de dados
 * Esta função pode ser chamada de um endpoint ou via CLI
 */
export async function runDbUpdates() {
  try {
    // Atualizar códigos de referência ausentes
    const updatedUsers = await updateMissingReferralCodes();
    
    return {
      success: true,
      message: `Atualizações concluídas com sucesso. ${updatedUsers} usuários atualizados.`
    };
  } catch (err) {
    console.error('Erro durante a execução das atualizações:', err);
    return {
      success: false,
      message: `Erro durante a execução das atualizações: ${err.message}`
    };
  }
}

// Executa a função principal se este arquivo for executado diretamente
if (require.main === module) {
  runDbUpdates()
    .then(result => {
      console.log('Resultado das atualizações:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
      console.error('Erro fatal durante as atualizações:', err);
      process.exit(1);
    });
}
