import React from 'react';
import { Gift, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function AdminReferrals() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Gift className="w-6 h-6 text-primary ghost-logo" />
        </div>
        <div>
          <h1 className="text-2xl font-bold ghost-text">Referências</h1>
          <p className="text-sm text-neutral-400">Sistema de referências da plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card hover:bg-background-card/70 transition-all duration-300 group">
          <Users className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <div className="stat-value">1,234</div>
          <div className="stat-label">Total de Referências</div>
        </div>

        <div className="stat-card hover:bg-background-card/70 transition-all duration-300 group">
          <Gift className="w-6 h-6 text-secondary mb-3 group-hover:scale-110 transition-transform" />
          <div className="stat-value">567</div>
          <div className="stat-label">Referências Ativas</div>
        </div>

        <div className="stat-card hover:bg-background-card/70 transition-all duration-300 group">
          <DollarSign className="w-6 h-6 text-success mb-3 group-hover:scale-110 transition-transform" />
          <div className="stat-value">123.45 SOL</div>
          <div className="stat-label">Total em Comissões</div>
        </div>

        <div className="stat-card hover:bg-background-card/70 transition-all duration-300 group">
          <TrendingUp className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
          <div className="stat-value">45.9%</div>
          <div className="stat-label">Taxa de Conversão</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="ghost-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold ghost-text">Desempenho do Sistema</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">Taxa de Conversão</span>
                <span className="text-sm ghost-text">45.9%</span>
              </div>
              <div className="h-2 bg-background-light rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '45.9%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">Retenção</span>
                <span className="text-sm ghost-text">78.3%</span>
              </div>
              <div className="h-2 bg-background-light rounded-full overflow-hidden">
                <div className="h-full bg-secondary" style={{ width: '78.3%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">Satisfação</span>
                <span className="text-sm ghost-text">92.7%</span>
              </div>
              <div className="h-2 bg-background-light rounded-full overflow-hidden">
                <div className="h-full bg-success" style={{ width: '92.7%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="ghost-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Gift className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold ghost-text">Top Referrals</h2>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-background-light/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">User {i}</div>
                    <div className="text-sm text-neutral-400">{50 - i * 5} referências</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium ghost-text">{(10 - i * 1.5).toFixed(2)} SOL</div>
                  <div className="text-sm text-neutral-400">Ganhos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}