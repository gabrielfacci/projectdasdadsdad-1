import React, { useState } from 'react';
import { Users, Search, Filter, MoreVertical, Ban, Eye, Trash, Check } from 'lucide-react';

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const users = [
    {
      id: 1,
      email: 'user1@example.com',
      name: 'User One',
      status: 'active',
      wallets: 5,
      lastActive: '2024-03-13T10:30:00Z'
    },
    // Add more mock users here
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Users className="w-6 h-6 text-primary ghost-logo" />
        </div>
        <div>
          <h1 className="text-2xl font-bold ghost-text">Usuários</h1>
          <p className="text-sm text-neutral-400">Gerenciar usuários da plataforma</p>
        </div>
      </div>

      <div className="ghost-card p-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background-light/50 rounded-lg pl-10 pr-4 py-2 text-sm border border-neutral-700/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <button className="btn bg-background-light hover:bg-background-light/80">
              <Filter className="w-5 h-5" />
              <span>Filtrar</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700/20">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-neutral-400">Usuário</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-neutral-400">Status</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-neutral-400 hidden sm:table-cell">Carteiras</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-neutral-400 hidden sm:table-cell">Última Atividade</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-neutral-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-neutral-700/10 hover:bg-background-light/20">
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <div>
                      <div className="font-medium text-sm sm:text-base">{user.name}</div>
                      <div className="text-xs sm:text-sm text-neutral-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                    }`}>
                      {user.status === 'active' ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Ativo
                        </>
                      ) : (
                        <>
                          <Ban className="w-3 h-3 mr-1" />
                          Bloqueado
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">{user.wallets}</td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">
                    {new Date(user.lastActive).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-background-light rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-primary" />
                      </button>
                      <button className="p-2 hover:bg-background-light rounded-lg transition-colors">
                        <Ban className="w-4 h-4 text-danger" />
                      </button>
                      <button className="p-2 hover:bg-background-light rounded-lg transition-colors">
                        <Trash className="w-4 h-4 text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}