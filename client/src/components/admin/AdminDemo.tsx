import React, { useState } from 'react';
import { Ghost, RotateCcw, Save, AlertCircle, Check, Hash } from 'lucide-react';
import { useMining } from '../../context/MiningContext';

const DEFAULT_FIND_AFTER = 15;

export default function AdminDemo() {
  const { demoMode, setDemoMode, demoSettings, setDemoSettings } = useMining();
  const [findAfterAttempts, setFindAfterAttempts] = useState(
    Number(demoSettings?.findAfterAttempts) || DEFAULT_FIND_AFTER
  );

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      const attempts = parseInt(findAfterAttempts.toString());
      if (attempts < 1) {
        throw new Error('O número de tentativas deve ser maior que 0');
      }

      // Save settings to localStorage
      const newSettings = { ...demoSettings, findAfterAttempts: attempts };
      localStorage.setItem('demo_settings', JSON.stringify(newSettings));
      setDemoSettings(newSettings);
      setSuccess('Configurações salvas com sucesso!');
      setError(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setSuccess(null);
    }
  };

  const handleReset = () => {
    try {
      // Reset all demo data
      const defaultSettings = { ...demoSettings, findAfterAttempts: DEFAULT_FIND_AFTER };
      localStorage.setItem('demo_settings', JSON.stringify(defaultSettings));
      setDemoSettings(defaultSettings);
      setFindAfterAttempts(DEFAULT_FIND_AFTER);

      setSuccess('Dados do modo demonstração resetados com sucesso!');
      setError(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Erro ao resetar dados. Tente novamente.');
      setSuccess(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Ghost className="w-6 h-6 text-primary ghost-logo" />
        </div>
        <div>
          <h1 className="text-2xl font-bold ghost-text">Modo Demonstração</h1>
          <p className="text-sm text-neutral-400">Controle do modo demonstrativo</p>
        </div>
      </div>

      <div className="ghost-card p-4 sm:p-6 max-w-xl mx-auto">
        <div className="space-y-6">
          <div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-300">
                  <Hash className="w-4 h-4 text-primary" />
                  Encontrar carteira a cada X tentativas
                </label>
                <input
                  type="number"
                  value={findAfterAttempts || ''}
                  onChange={(e) => setFindAfterAttempts(parseInt(e.target.value) || 0)}
                  className="w-full bg-background-light/50 rounded-lg px-4 py-3 text-sm border border-neutral-700/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  min="1"
                  placeholder="Ex: 15"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Define após quantas tentativas uma carteira será encontrada
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background-light/30 rounded-lg">
                <div className="flex-1">
                  <input
                    type="checkbox"
                    checked={demoMode}
                    onChange={(e) => setDemoMode(e.target.checked)}
                    className="sr-only peer"
                    id="demo-mode"
                  />
                  <label 
                    htmlFor="demo-mode"
                    className="relative flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-10 h-6 bg-neutral-700/30 rounded-full peer-checked:bg-[#6C63FF]/20 transition-all">
                      <div className="absolute left-1 top-1 bg-neutral-400 w-4 h-4 rounded-full transition-all peer-checked:bg-[#6C63FF] peer-checked:left-5"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Ativar Modo Demonstração</p>
                      <p className="text-xs text-neutral-400">Simula encontrar carteiras automaticamente</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-danger bg-danger/10 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-success bg-success/10 rounded-lg p-3">
              <Check className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleReset} className="btn bg-danger hover:bg-danger/90 flex-1">
              <RotateCcw className="w-5 h-5" />
              <span>Resetar Dados</span>
            </button>

            <button onClick={handleSave} className="btn btn-primary flex-1">
              <Save className="w-5 h-5" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}