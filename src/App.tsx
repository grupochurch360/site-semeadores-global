import React, { useLayoutEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { BrandLogo } from './components/common/BrandLogo';
import { GlobalDashboard } from './components/admin/GlobalDashboard.tsx';
import { RegionsModule } from './components/admin/RegionsModule.tsx';
import { EvangelismsModule } from './components/admin/EvangelismsModule.tsx';
import { ReportsModule } from './components/admin/ReportsModule.tsx';
import { LoginView } from './components/auth/LoginView.tsx';
import { AIAnalysisModal } from './components/admin/AIAnalysisModal.tsx';

import { OwnerSettings } from './components/admin/OwnerSettings';

type View = 'public' | 'admin' | 'owner';

function viewFromUrl(): View {
  if (/^\/(?:admin\/config|config-admin)\/?$/.test(window.location.pathname)) return 'owner';
  return /^\/manutencao\/?$/.test(window.location.pathname) ? 'public' : 'admin';
}

function MainApp() {
  const [currentView, setCurrentView] = useState<View>(viewFromUrl);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);

  const { currentUser, isLoading } = useAuth();

  useLayoutEffect(() => {
    const onPopState = () => setCurrentView(viewFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useLayoutEffect(() => {
    if (isLoading) return;
    const targetId = currentView === 'public' && window.location.hash.slice(1);
    const target = targetId && document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentView, isLoading]);

  function navigateTo(view: View) {
    const url = new URL(window.location.href);
    url.pathname = view === 'public' ? '/manutencao' : '/';
    url.searchParams.delete('view');
    url.hash = '';
    window.history.pushState(null, '', url);
    setCurrentView(view);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#061A2D] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FFBD58] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold tracking-wider uppercase text-[#DAE4ED]">
            Semeadores de Fogo Global
          </span>
        </div>
      </div>
    );
  }

  if (currentView === 'public') {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#071923] px-6 text-white">
        <section className="w-full max-w-xl border-l-2 border-amber-400 pl-7">
          <BrandLogo variant="white" showSubtitle={false} />
          <h1 className="mt-10 text-4xl font-bold">Site em manutenção</h1>
          <p className="mt-3 text-slate-200">Estamos preparando a apresentação dos Semeadores de Fogo.</p>
          <a href="/" className="mt-8 inline-block rounded bg-amber-300 px-5 py-3 font-semibold text-slate-950">Acessar painel</a>
        </section>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <LoginView ownerOnly={currentView==='owner'} onBackToPublic={() => navigateTo('public')} />
    );
  }

  if(currentView==='owner') return <OwnerSettings/>;

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
    <div className="min-h-screen bg-[#FBFCFD] flex">
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
          onGoToPublicSite={() => navigateTo('public')}
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
