
import { updateUsersWithNullReferralCodes } from './generateReferralCodes';

// Função principal que executa a atualização
async function main() {
  try {
    console.log('Iniciando processo de atualização de códigos de referência...');
    const result = await updateUsersWithNullReferralCodes();
    console.log('Processo concluído com sucesso!');
    console.log(`Total de usuários atualizados: ${result.success}`);
    console.log(`Total de erros: ${result.errors}`);
  } catch (error) {
    console.error('Erro durante o processo de atualização:', error);
  }
}

// Executar a função principal
main();
