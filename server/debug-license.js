// Script de debug para testar diretamente o servidor de licenças
import fetch from 'cross-fetch';

async function testAllLicenses(email) {
  console.log(`\n🔍 TESTANDO LICENÇAS PARA: ${email}`);
  console.log('=' .repeat(60));
  
  const productCodes = ['PPPBC295', 'PPPBC293', 'PPPBC229'];
  const apiUrl = 'https://api.ghostwallet.cloud/verify_license.php';
  
  for (const productCode of productCodes) {
    try {
      console.log(`\n📋 Testando ${productCode}...`);
      
      const payload = {
        email: email.toLowerCase().trim(),
        product_code: productCode
      };
      
      console.log('Payload enviado:', JSON.stringify(payload));
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'GhostWallet-Debug/1.0'
        },
        body: JSON.stringify(payload)
      });
      
      console.log(`Status HTTP: ${response.status}`);
      
      const textResponse = await response.text();
      console.log(`Resposta bruta: "${textResponse}"`);
      
      try {
        const jsonResponse = JSON.parse(textResponse);
        console.log(`Status licença: ${jsonResponse.license_status}`);
        console.log(`✅ ${productCode}: ${jsonResponse.license_status === 'active' ? 'ATIVA' : 'INATIVA'}`);
      } catch (parseError) {
        console.log(`❌ Erro ao interpretar JSON: ${parseError.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro na requisição ${productCode}: ${error.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(60));
}

// Testar com o email do usuário
const email = process.argv[2] || 'daniellima271290@gmail.com';
testAllLicenses(email);