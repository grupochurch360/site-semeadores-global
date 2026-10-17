import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { InstitutionalLanding } from './components/public/InstitutionalLanding.tsx';
import { GlobalDashboard } from './components/admin/GlobalDashboard.tsx';
import { RegionsModule } from './components/admin/RegionsModule.tsx';
import { EvangelismsModule } from './components/admin/EvangelismsModule.tsx';
import { ReportsModule } from './components/admin/ReportsModule.tsx';
import { ConsolidationModule } from './components/admin/ConsolidationModule.tsx';
import { TeachingModule } from './components/admin/TeachingModule.tsx';
import { CrusadesModule } from './components/admin/CrusadesModule.tsx';
import { DepartmentsModule } from './components/admin/DepartmentsModule.tsx';
import { MeetingsModule } from './components/admin/MeetingsModule.tsx';
import { MediaModule } from './components/admin/MediaModule.tsx';
import { LegalFinancialModule } from './components/admin/LegalFinancialModule.tsx';
import { AIAnalysisModal } from './components/admin/AIAnalysisModal.tsx';
import { AuditModal } from './components/admin/AuditModal.tsx';

function MainApp() {
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('admin');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

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

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard Global',
      subtitle: 'Indicadores consolidados e supervisão em tempo real',
    },
    indicators: {
      title: 'Indicadores & Metas',
      subtitle: 'Frequência de ações semanais e quinzenais por regional',
    },
    regions: {
      title: 'Regionais Semeadores de Fogo',
      subtitle: 'Estrutura de polos, igrejas responsáveis e coordenadores',
    },
    evangelisms: {
      title: 'Ações Evangelísticas',
      subtitle: 'Planejamento e registro pós-ação de mobilizações de rua',
    },
    consolidation: {
      title: 'Ministério de Consolidação',
      subtitle: 'Acolhimento contínuo sob conformidade estrita com a LGPD',
    },
    crusades: {
      title: 'Cruzadas & Grandes Eventos',
      subtitle: 'Checklist operacional, intercâmbios e infraestrutura',
    },
    courses: {
      title: 'Cursos & Ensino',
      subtitle: 'Escola trimestral, aulas mensais via Zoom e 4 módulos',
    },
    certificates: {
      title: 'Alunos & Certificados',
      subtitle: 'Acompanhamento pedagógico e emissão de certificados digitais',
    },
    reports: {
      title: 'Relatórios Bimestrais',
      subtitle: 'Prestação de contas obrigatória das regionais e homologação',
    },
    departments: {
      title: 'Departamentos & Tarefas',
      subtitle: '10 departamentos oficiais e painel Kanban de execução',
    },
    meetings: {
      title: 'Reuniões de Alinhamento',
      subtitle: 'Encontros bimestrais de liderança, pautas e encaminhamentos',
    },
    media: {
      title: 'Mídia & Identidade Oficial',
      subtitle: 'Gabaritos vetoriais, camisetas, bonés e panfletos padronizados',
    },
    financial_legal: {
      title: 'Financeiro & Jurídico',
      subtitle: 'Custos de cruzadas, diretrizes de viagens e registro INPI',
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
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
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

          {currentTab === 'indicators' && (
            <GlobalDashboard
              onOpenAIModal={() => setIsAIModalOpen(true)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'regions' && <RegionsModule />}

          {currentTab === 'evangelisms' && <EvangelismsModule />}

          {currentTab === 'consolidation' && <ConsolidationModule />}

          {currentTab === 'crusades' && <CrusadesModule />}

          {currentTab === 'courses' && <TeachingModule />}

          {currentTab === 'certificates' && <TeachingModule />}

          {currentTab === 'reports' && (
            <ReportsModule onOpenAIAnalysis={() => setIsAIModalOpen(true)} />
          )}

          {currentTab === 'departments' && <DepartmentsModule />}

          {currentTab === 'meetings' && <MeetingsModule />}

          {currentTab === 'media' && <MediaModule />}

          {currentTab === 'financial_legal' && <LegalFinancialModule />}
        </main>
      </div>

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />

      {/* Audit Modal */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
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
