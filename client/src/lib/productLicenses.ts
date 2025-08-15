// Mapeamento de códigos de produto para blockchains liberadas
export interface ProductLicense {
  code: string;
  name: string;
  blockchains: string[];
  description: string;
}

export const PRODUCT_LICENSES: Record<string, ProductLicense> = {
  // Códigos específicos conhecidos - SISTEMA DE 3 TIERS
  'PPPBC295': {
    code: 'PPPBC295',
    name: 'Enterprise All Access',
    blockchains: ['solana', 'bitcoin', 'ethereum', 'bsc', 'cardano', 'polkadot'],
    description: 'Licença Enterprise com acesso a TODAS as blockchains'
  },
  'PPPBC293': {
    code: 'PPPBC293', 
    name: 'Premium Mining License',
    blockchains: ['solana', 'bitcoin', 'ethereum'],
    description: 'Licença Premium para Solana, Bitcoin e Ethereum'
  },
  'PPPBC229': {
    code: 'PPPBC229',
    name: 'Basic Solana License',
    blockchains: ['solana'],
    description: 'Licença Basic apenas para Solana'
  },
  'PPPBC230': {
    code: 'PPPBC230',
    name: 'Bitcoin Mining License',
    blockchains: ['bitcoin'],
    description: 'Licença para mineração na blockchain Bitcoin'
  },
  'PPPBC231': {
    code: 'PPPBC231',
    name: 'Ethereum Mining License',
    blockchains: ['ethereum'],
    description: 'Licença para mineração na blockchain Ethereum'
  },
  'PPPBC232': {
    code: 'PPPBC232',
    name: 'BSC Mining License',
    blockchains: ['bsc'],
    description: 'Licença para mineração na blockchain BSC'
  },
  'PPPBC233': {
    code: 'PPPBC233',
    name: 'Cardano Mining License',
    blockchains: ['cardano'],
    description: 'Licença para mineração na blockchain Cardano'
  },
  'PPPBC234': {
    code: 'PPPBC234',
    name: 'Polkadot Mining License',
    blockchains: ['polkadot'],
    description: 'Licença para mineração na blockchain Polkadot'
  },
  'PPPBAHKJ': {
    code: 'PPPBAHKJ',
    name: 'Turbo Mode License',
    blockchains: [],
    description: 'Licença para ativação do modo turbo - acelera operações de mineração'
  },
  'PPPBC299': {
    code: 'PPPBC299',
    name: 'Premium All Access',
    blockchains: ['solana', 'bitcoin', 'ethereum', 'bsc', 'cardano', 'polkadot'],
    description: 'Licença premium com acesso a todas as blockchains'
  },
  // Códigos adicionais que podem existir
  'PPBC229': {
    code: 'PPBC229',
    name: 'Solana License Alt',
    blockchains: ['solana'],
    description: 'Licença alternativa para Solana'
  },
  'PPBC230': {
    code: 'PPBC230',
    name: 'Bitcoin License Alt',
    blockchains: ['bitcoin'],
    description: 'Licença alternativa para Bitcoin'
  },
  'BC229': {
    code: 'BC229',
    name: 'Basic Solana',
    blockchains: ['solana'],
    description: 'Licença básica para Solana'
  },
  'BC230': {
    code: 'BC230',
    name: 'Basic Bitcoin',
    blockchains: ['bitcoin'],
    description: 'Licença básica para Bitcoin'
  },
  // Mapeamentos baseados no plano (fallback)
  'premium': {
    code: 'premium',
    name: 'Premium Plan',
    blockchains: ['solana', 'bitcoin', 'ethereum', 'bsc', 'cardano', 'polkadot'],
    description: 'Plano premium com acesso completo'
  },
  'basic': {
    code: 'basic',
    name: 'Basic Plan',
    blockchains: ['solana'],
    description: 'Plano básico com acesso limitado'
  },
  'standard': {
    code: 'standard',
    name: 'Standard Plan',
    blockchains: ['solana', 'bitcoin'],
    description: 'Plano padrão com acesso moderado'
  },
  'pro': {
    code: 'pro',
    name: 'Pro Plan',
    blockchains: ['solana', 'bitcoin', 'ethereum'],
    description: 'Plano profissional com acesso expandido'
  }
};

// Função para obter blockchains liberadas baseado nas licenças (códigos de produto + planos)
export function getAuthorizedBlockchains(productCodes: string[], planNames: string[] = []): string[] {
  const authorizedBlockchains = new Set<string>();
  
  // Processar códigos de produto específicos
  productCodes.forEach(code => {
    if (code && code.trim()) {
      const license = PRODUCT_LICENSES[code];
      if (license) {
        license.blockchains.forEach(blockchain => {
          authorizedBlockchains.add(blockchain);
        });
      }
    }
  });
  
  // SEMPRE processar planos também
  planNames.forEach(plan => {
    if (plan && plan.trim()) {
      const planKey = plan.toLowerCase().trim();
      const license = PRODUCT_LICENSES[planKey];
      if (license) {
        license.blockchains.forEach(blockchain => {
          authorizedBlockchains.add(blockchain);
        });
      }
    }
  });
  
  return Array.from(authorizedBlockchains);
}

// Função para verificar se um usuário tem acesso a uma blockchain específica
export function hasBlockchainAccess(productCodes: string[], blockchain: string, planNames: string[] = []): boolean {
  const authorizedBlockchains = getAuthorizedBlockchains(productCodes, planNames);
  return authorizedBlockchains.includes(blockchain);
}