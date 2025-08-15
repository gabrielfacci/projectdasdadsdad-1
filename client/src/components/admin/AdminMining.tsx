import React from 'react';
import { Activity, TrendingUp, Clock, Wallet } from 'lucide-react';
import SolanaChart from '../SolanaChart';

export default function AdminMining() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Activity className="w-6 h-6 text-primary ghost-logo" />
        </div>
        <div>
          <h1 className="text-2xl font-bold ghost-text">Mineração</h1>
          <p className="text-sm text-neutral-400">Status da mineração na plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card hover:bg-background-card/70 transition-all duration-300 group">
          <Activity className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <div className="stat-value">45.6K</div>
          <div className="stat-label">Hash Rate Total</div>
        </div>

        <div className="stat-card hover:bg-background-card/70 transition-all duration-300 group">
          <Clock className="w-6 h-6 text-secondary mb-3 group-hover:scale-110 transition-transform" />
          <div className="stat-value">1.2M</div>
          <div className="stat-label">Total de Tentativas</div>
        </div>

        <div className="stat-card hover:bg-background-card/70 transition-all duration-300 group">
          <Wallet className="w-6 h-6 text-success mb-3 group-hover:scale-110 transition-transform" />
          <div className="stat-value">789</div>
          <div className="stat-label">Carteiras Encontradas</div>
        </div>

        <div className="stat-card hover:bg-background-card/70 transition-all duration-300 group">
          <TrendingUp className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <div className="stat-value">0.065%</div>
          <div className="stat-label">Taxa de Sucesso</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="ghost-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold ghost-text">Performance da Rede</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">RPC Principal</span>
                <span className="text-sm ghost-text">98.7% Uptime</span>
              </div>
              <div className="h-2 bg-background-light rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '98.7%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">RPC Secundário</span>
                <span className="text-sm ghost-text">95.2% Uptime</span>
              </div>
              <div className="h-2 bg-background-light rounded-full overflow-hidden">
                <div className="h-full bg-secondary" style={{ width: '95.2%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">RPC Fallback</span>
                <span className="text-sm ghost-text">92.1% Uptime</span>
              </div>
              <div className="h-2 bg-background-light rounded-full overflow-hidden">
                <div className="h-full bg-success" style={{ width: '92.1%' }} />
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