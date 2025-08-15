import React from 'react';
import { Ghost, Users, Activity, Gift, TrendingUp, Wallet } from 'lucide-react';
import SolanaChart from '../SolanaChart';

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#6C63FF]/20 flex items-center justify-center">
          <Ghost className="w-6 h-6 text-[#6C63FF] ghost-logo" />
        </div>
        <div>
          <h1 className="text-2xl font-bold ghost-text">Dashboard</h1>
          <p className="text-sm text-neutral-400">Visão geral da plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
        <div className="stat-card hover:bg-background-card/70 transition-all duration-300 group">
          <Users className="w-6 h-6 text-[#6C63FF] mb-3 group-hover:scale-110 transition-transform" />
          <div className="stat-value text-base sm:text-lg">1,234</div>
          <div className="stat-label">Usuários Ativos</div>
        </div>

        <div className="stat-card hover:bg-background-card/70 transition-all duration-300 group">
          <Activity className="w-6 h-6 text-secondary mb-3 group-hover:scale-110 transition-transform" />
          <div className="stat-value text-base sm:text-lg">45.6K</div>
          <div className="stat-label">Hash Rate Total</div>
        </div>

        <div className="stat-card hover:bg-background-card/70 transition-all duration-300 group">
          <Wallet className="w-6 h-6 text-success mb-3 group-hover:scale-110 transition-transform" />
          <div className="stat-value text-base sm:text-lg">789</div>
          <div className="stat-label">Carteiras Encontradas</div>
        </div>

        <div className="stat-card hover:bg-background-card/70 transition-all duration-300 group">
          <Gift className="w-6 h-6 text-[#6C63FF] mb-3 group-hover:scale-110 transition-transform" />
          <div className="stat-value text-base sm:text-lg">123</div>
          <div className="stat-label">Referências Ativas</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <div className="ghost-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-[#6C63FF]" />
            <h2 className="text-lg font-semibold ghost-text">Atividade da Plataforma</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">Taxa de Sucesso</span>
                <span className="text-sm ghost-text">12.34%</span>
              </div>
              <div className="h-2 bg-neutral-700/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#6C63FF]" style={{ width: '12.34%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">Uso de CPU</span>
                <span className="text-sm ghost-text">78.9%</span>
              </div>
              <div className="h-2 bg-neutral-700/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#9370DB]" style={{ width: '78.9%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">Memória</span>
                <span className="text-sm ghost-text">45.6%</span>
              </div>
              <div className="h-2 bg-neutral-700/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#4CAF50]" style={{ width: '45.6%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="ghost-card p-6">
          <SolanaChart />
        </div>
      </div>
    </div>
  );
}