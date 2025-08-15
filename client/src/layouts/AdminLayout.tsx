import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Ghost, Users, Settings, LayoutDashboard, LogOut, Activity, Gift, Menu, ChevronLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminSettings from '../components/admin/AdminSettings';
import AdminMining from '../components/admin/AdminMining';
import AdminReferrals from '../components/admin/AdminReferrals';
import AdminDemo from '../components/admin/AdminDemo';

export default function AdminLayout() {
  const { user, profile, signOut, toggleAdminMode } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = React.useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Handle clicks outside sidebar on mobile
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen]);

  // Handle window resize
  const handleResize = React.useCallback(() => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    if (!mobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, []);

  React.useEffect(() => { 
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Protect admin routes
  if (!user || user.role !== 'admin' || !profile?.adminMode) {
    return <Navigate to="/" replace />;
  }

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Usuários', icon: Users, path: '/admin/users' },
    { name: 'Mineração', icon: Activity, path: '/admin/mining' },
    { name: 'Referências', icon: Gift, path: '/admin/referrals' },
    { name: 'Demonstração', icon: Ghost, path: '/admin/demo' },
    { name: 'Configurações', icon: Settings, path: '/admin/settings' }
  ];

  return (
    <div className="min-h-screen bg-gradient-radial">
      {/* Sidebar */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      )}
      <aside ref={sidebarRef} className={`
        fixed top-0 left-0 h-full w-64 bg-background-card/95 backdrop-blur-md border-r border-neutral-700/20 z-50 overflow-y-auto
        transition-transform duration-300 ease-in-out transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 p-4 border-b border-neutral-700/20 relative">
          <Ghost className="w-8 h-8 text-[#6C63FF] ghost-logo" />
          <div>
            <h1 className="text-lg font-bold ghost-text">Ghost Wallet</h1>
            <p className="text-xs text-neutral-400">Painel Administrativo</p>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                location.pathname === item.path
                  ? 'bg-[#6C63FF]/20 text-[#6C63FF]'
                  : 'hover:bg-background-light/50 text-neutral-400 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-700/20">
          <button
            onClick={toggleAdminMode}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-all mb-2 focus:outline-none"
          >
            <Lock className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar para Usuário</span>
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:text-danger hover:bg-danger/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`min-h-screen transition-all duration-300 lg:ml-64 ${isMobile && sidebarOpen ? 'overflow-hidden' : ''}`}>
        <div className="sticky top-0 z-40 bg-background-card/95 backdrop-blur-md border-b border-neutral-700/20 p-4 transition-all duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors lg:hidden ${
                sidebarOpen ? 'hidden' : 'block'
              }`}
            >
              <Menu className="w-6 h-6" />
            </button>
            {isMobile && !sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-lg font-bold ghost-text">Ghost Wallet</h1>
            <p className="text-xs text-neutral-400">Painel Administrativo</p>
          </div>
        </div>

        <div className="p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/mining" element={<AdminMining />} />
            <Route path="/referrals" element={<AdminReferrals />} />
            <Route path="/demo" element={<AdminDemo />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}