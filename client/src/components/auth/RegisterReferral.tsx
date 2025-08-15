
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const RegisterReferral = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Obter código de referência da URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  // Processar referência
  const processReferral = async () => {
    if (!referralCode.trim()) {
      showNotification({
        type: 'error',
        title: 'Código Inválido',
        message: 'Por favor, insira um código de referência válido'
      });
      return;
    }

    // Validar formato do código
    if (!referralCode.match(/^GW[A-Za-z0-9]{8}$/)) {
      showNotification({
        type: 'error',
        title: 'Formato Inválido',
        message: 'O código de referência deve começar com GW seguido de 8 caracteres'
      });
      return;
    }

    if (!user || !user.id) {
      showNotification({
        type: 'error',
        title: 'Erro',
        message: 'Usuário não autenticado. Faça login para continuar.'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Verificar se o código existe antes de registrar
      const { data: validationData, error: validationError } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (validationError || !validationData) {
        showNotification({
          type: 'error',
          title: 'Código Inválido',
          message: 'Este código de referência não existe.'
        });
        setIsProcessing(false);
        return;
      }

      // Verificar se está tentando usar o próprio código
      if (validationData.id === user.id) {
        showNotification({
          type: 'error',
          title: 'Operação Inválida',
          message: 'Você não pode usar seu próprio código de referência.'
        });
        setIsProcessing(false);
        return;
      }

      // Registrar referência
      const { data, error } = await supabase.rpc('register_referral', {
        p_user_id: user.id,
        p_referral_code: referralCode
      });

      if (error) throw error;

      if (!data || !data.success) {
        throw new Error((data && data.message) || 'Erro ao processar referência');
      }

      // Sucesso
      setIsSuccess(true);
      showNotification({
        type: 'success',
        title: 'Referência Registrada',
        message: 'Código de referência aplicado com sucesso!'
      });

      // Redirecionar após sucesso
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Erro ao processar referência:', err);
      showNotification({
        type: 'error',
        title: 'Erro',
        message: err.message || 'Erro ao processar referência. Tente novamente.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Pular processo
  const skipReferral = () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Código de Referência</h2>
      
      {isSuccess ? (
        <div className="text-center py-4">
          <div className="bg-green-900/30 p-4 rounded-lg mb-4">
            <h3 className="text-xl font-bold text-green-400 mb-2">Referência Registrada!</h3>
            <p>Seu código de referência foi aplicado com sucesso.</p>
          </div>
          <p className="mb-4">Redirecionando para o dashboard...</p>
        </div>
      ) : (
        <>
          <p className="mb-4">
            Você tem um código de referência? Insira-o abaixo para receber benefícios exclusivos!
          </p>
          
          <div className="mb-4">
            <label htmlFor="referralCode" className="block text-sm font-medium mb-1">
              Código de Referência
            </label>
            <input
              type="text"
              id="referralCode"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Ex: GW12345678"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={processReferral}
              disabled={isProcessing || !referralCode.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                'Aplicar Código'
              )}
            </button>
            
            <button
              onClick={skipReferral}
              className="bg-transparent border border-gray-600 hover:bg-gray-800 text-gray-300 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Pular
            </button>
          </div>
          
          <p className="mt-4 text-sm text-gray-400">
            Ao aplicar um código de referência, você ajuda quem te indicou e também recebe benefícios!
          </p>
        </>
      )}
    </div>
  );
};

export default RegisterReferral;
