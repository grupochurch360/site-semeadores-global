import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { InstitutionalLanding } from './components/public/InstitutionalLanding.tsx';
import { GlobalDashboard } from './components/admin/GlobalDashboard.tsx';
import { RegionsModule } from './components/admin/RegionsModule.tsx';
import { EvangelismsModule } from './components/admin/EvangelismsModule.tsx';
import { ReportsModule } from './components/admin/ReportsModule.tsx';
import { LoginView } from './components/auth/LoginView.tsx';
import { AIAnalysisModal } from './components/admin/AIAnalysisModal.tsx';

function MainApp() {
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('admin');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);

  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold tracking-wider uppercase text-stone-300">
            Semeadores de Fogo Global
          </span>
        </div>
      </div>
    );
  }

  if (currentView === 'public') {
    return (
      <InstitutionalLanding onEnterPortal={() => setCurrentView('admin')} />
    );
  }

  if (!currentUser) {
    return (
      <LoginView onBackToPublic={() => setCurrentView('public')} />
    );
  }

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Global',
      subtitle: 'Indicadores consolidados e supervisão em tempo real',
    },
    regions: {
      title: 'Regionais Semeadores de Fogo',
      subtitle: 'Estrutura de polos, igrejas responsáveis e coordenadores',
    },
    evangelisms: {
      title: 'Ações Evangelísticas',
      subtitle: 'Planejamento e registro pós-ação de mobilizações de rua',
    },
    reports: {
      title: 'Relatórios Bimestrais',
      subtitle: 'Prestação de contas obrigatória das regionais e homologação',
    },
  };

  const currentMeta = tabTitles[currentTab] || {
    title: 'Painel de Gestão',
    subtitle: 'Semeadores de Fogo Global',
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        {/* Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onGoToPublicSite={() => setCurrentView('public')}
        />

        {/* Tab Viewport */}
        <main className="flex-1 pb-16">
          {currentTab === 'dashboard' && (
            <GlobalDashboard
              onOpenAIModal={() => setIsAIModalOpen(true)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'regions' && <RegionsModule />}

          {currentTab === 'evangelisms' && <EvangelismsModule />}

          {currentTab === 'reports' && (
            <ReportsModule onOpenAIAnalysis={() => setIsAIModalOpen(true)} />
          )}
        </main>
      </div>

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
