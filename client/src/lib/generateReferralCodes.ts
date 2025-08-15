
import { supabase } from './supabaseClient';

// Função para gerar um código de referência aleatório
function generateReferralCode(): string {
  const prefix = 'GW';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomCode = '';
  
  // Adicionar timestamp para garantir unicidade
  const timeStamp = Date.now().toString().slice(-6);
  const timeDigits = timeStamp.split('').map(Number);
  
  // Gerar 8 caracteres aleatórios
  for (let i = 0; i < 8; i++) {
    // Usar técnica mais robusta para aleatoriedade
    let randomValue;
    
    // Incorporar timestamp nos primeiros 6 caracteres para garantir unicidade
    if (i < timeDigits.length) {
      // Use o dígito do timestamp como base e adicione aleatoriedade
      randomValue = (timeDigits[i] + Math.floor(Math.random() * 10)) % characters.length;
    } else {
      // Para os caracteres restantes, use valores totalmente aleatórios
      randomValue = Math.floor(Math.random() * characters.length);
      
      // Garantir que não teremos valores repetidos em sequência
      if (i > 0 && randomCode[i-1] === characters.charAt(randomValue)) {
        randomValue = (randomValue + 1) % characters.length;
      }
    }
    
    randomCode += characters.charAt(randomValue);
  }
  
  // Garantir que pelo menos 2 caracteres são letras (para melhor legibilidade)
  let letterCount = 0;
  for (let i = 0; i < randomCode.length; i++) {
    if (/[A-Z]/.test(randomCode[i])) {
      letterCount++;
    }
  }
  
  // Se não tiver pelo menos 2 letras, forçar substituição de alguns dígitos
  if (letterCount < 2) {
    const positions = [
      Math.floor(Math.random() * 4),          // posição aleatória na primeira metade
      4 + Math.floor(Math.random() * 4)       // posição aleatória na segunda metade
    ];
    
    for (const pos of positions) {
      // Escolher uma letra aleatória
      const randomLetter = characters.charAt(Math.floor(Math.random() * 26)); // apenas letras
      // Substituir o caractere na posição escolhida
      randomCode = randomCode.substring(0, pos) + randomLetter + randomCode.substring(pos + 1);
    }
  }
  
  return `${prefix}${randomCode}`;
}

// Função para atualizar usuários sem código de referência
export async function updateUsersWithNullReferralCodes() {
  try {
    console.log('Iniciando atualização de códigos de referência...');
    
    // Buscar todos os usuários com referral_code = NULL
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .is('referral_code', null);
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`Encontrados ${users?.length || 0} usuários sem código de referência.`);
    
    // Para cada usuário, gerar e atualizar um código único
    if (users && users.length > 0) {
      let successCount = 0;
      let errorCount = 0;
      
      for (const user of users) {
        try {
          // Tentar até 3 vezes para garantir que consigamos um código único
          let attempt = 0;
          let success = false;
          
          while (attempt < 3 && !success) {
            const referralCode = generateReferralCode();
            
            // Verificar se o código já existe
            const { data: existingCode, error: checkError } = await supabase
              .from('users')
              .select('id')
              .eq('referral_code', referralCode)
              .single();
            
            if (checkError && checkError.code !== 'PGRST116') {
              // Se o erro não for "não encontrado", tente novamente
              attempt++;
              continue;
            }
            
            // Se o código não existir, atualize o usuário
            if (!existingCode) {
              const { error: updateError } = await supabase
                .from('users')
                .update({ referral_code: referralCode })
                .eq('id', user.id);
              
              if (updateError) {
                throw updateError;
              }
              
              success = true;
              successCount++;
              console.log(`Usuário ${user.id} atualizado com código ${referralCode}`);
            }
            
            attempt++;
          }
          
          if (!success) {
            errorCount++;
            console.error(`Não foi possível atualizar o usuário ${user.id} após 3 tentativas.`);
          }
        } catch (err) {
          errorCount++;
          console.error(`Erro ao atualizar usuário ${user.id}:`, err);
        }
      }
      
      console.log(`Atualização concluída: ${successCount} sucessos, ${errorCount} erros.`);
      return { success: successCount, errors: errorCount };
    } else {
      console.log('Nenhum usuário encontrado sem código de referência.');
      return { success: 0, errors: 0 };
    }
  } catch (error) {
    console.error('Erro ao executar a atualização de códigos de referência:', error);
    throw error;
  }
}

// Executar a função se este arquivo for executado diretamente
if (require.main === module) {
  updateUsersWithNullReferralCodes()
    .then(result => {
      console.log('Processo finalizado:', result);
    })
    .catch(err => {
      console.error('Falha no processo:', err);
    });
}
