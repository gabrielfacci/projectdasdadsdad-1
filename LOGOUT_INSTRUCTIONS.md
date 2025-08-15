# Instruções para Logout do Usuário

## ✅ Logout Implementado

O logout foi implementado com sucesso na aplicação GhostWallet. 

## Como Executar o Logout

**Método 1: URL com parâmetro force-logout**
- Acesse a aplicação com: `?force-logout=true` no final da URL
- Exemplo: `https://sua-aplicacao.replit.app/?force-logout=true`
- O logout será executado automaticamente

**Método 2: Rota /logout**
- Acesse diretamente: `/logout` na aplicação
- O componente LogoutPage executará o logout automaticamente

**Método 3: Manual via console**
- Abra o console do navegador (F12)
- Execute o script que está no arquivo `logout-user.js`

## O que Acontece no Logout

1. Remove todos os dados do localStorage relacionados ao usuário:
   - ghost-wallet-user
   - ghost-wallet-session
   - ghost-wallet-profile
   - ghost-wallet-license-status
   - ghost-wallet-blockchain-access
   - supabase.auth.token
   - sb-supabase-auth-token
   - utmify_data
   - ghost-wallet-onboarding

2. Limpa o sessionStorage completamente

3. Redireciona para a página de autenticação (`/auth`)

## Status Atual

- ✅ Componente LogoutPage criado
- ✅ Rotas de logout adicionadas em todas as seções
- ✅ Logout automático implementado no App.tsx
- ✅ Função de logout disponível no AuthContext

O usuário atual (`teste50@gmail.com`) pode ser deslogado usando qualquer um dos métodos acima.