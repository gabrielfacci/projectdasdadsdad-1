import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { licenseValidator } from "./licenseValidator";
import { updateUserLanguage } from "./api/update-user-language";

export async function registerRoutes(app: Express): Promise<Server> {
  // Verificação de licenças robusta para produção
  app.post('/api/license-check', async (req, res) => {
    try {
      const { email, forceRefresh } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email é obrigatório' 
        });
      }

      // Usar o sistema robusto de validação de licenças
      const result = await licenseValidator.validateLicense(email, forceRefresh === true);
      
      // Retornar resposta consistente
      res.status(result.success ? 200 : 502).json(result);

    } catch (error: any) {
      console.error('🔄 [Backend] Erro crítico no sistema de licenças:', error);
      
      res.status(500).json({
        success: false,
        hasActiveLicense: false,
        allowedBlockchains: [],
        activeLicense: null,
        verificationResults: [],
        message: 'Erro interno do servidor'
      });
    }
  });

  // Endpoint para limpar cache (admin)
  app.post('/api/license-clear-cache', async (req, res) => {
    try {
      const { email } = req.body;
      licenseValidator.clearCache(email);
      
      res.json({
        success: true,
        message: email ? `Cache limpo para ${email}` : 'Cache global limpo'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao limpar cache'
      });
    }
  });

  // Endpoint para estatísticas de cache (admin)
  app.get('/api/license-stats', async (req, res) => {
    try {
      const stats = licenseValidator.getCacheStats();
      res.json({
        success: true,
        stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas'
      });
    }
  });

  // Endpoint de debug para teste direto de licenças
  app.post('/api/debug-license', async (req, res) => {
    try {
      const { email, productCode } = req.body;
      
      if (!email || !productCode) {
        return res.status(400).json({
          success: false,
          message: 'Email e productCode são obrigatórios'
        });
      }

      // Teste direto no servidor externo
      const apiUrl = 'https://api.ghostwallet.cloud/verify_license.php';
      const payload = {
        email: email.toLowerCase().trim(),
        product_code: productCode
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'GhostWallet-Debug/1.0'
        },
        body: JSON.stringify(payload)
      });

      const textResponse = await response.text();

      res.json({
        success: true,
        debug: {
          email,
          productCode,
          httpStatus: response.status,
          rawResponse: textResponse,
          payload: payload
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro no debug',
        error: error.message
      });
    }
  });

  // Language API endpoint
  app.post('/api/update-user-language', updateUserLanguage);

  const httpServer = createServer(app);

  return httpServer;
}
