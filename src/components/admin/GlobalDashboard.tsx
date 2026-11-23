import React, { useEffect, useState } from 'react';
import {
  Users,
  MapPin,
  Flame,
  UserCheck,
  HeartHandshake,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { Region, EvangelismEvent, BimonthlyReport } from '../../types/index.ts';

interface GlobalDashboardProps {
  onOpenAIModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const GlobalDashboard: React.FC<GlobalDashboardProps> = ({
  onOpenAIModal,
  onNavigateTab,
}) => {
  const { currentUser, isAdmin, activeRegionFilter } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<EvangelismEvent[]>([]);
  const [reports, setReports] = useState<BimonthlyReport[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, eventsData, reportsData, regionsData] = await Promise.all([
          api.getDashboardStats(activeRegionFilter === 'all' ? undefined : activeRegionFilter),
          api.getEvangelisms(activeRegionFilter === 'all' ? undefined : activeRegionFilter),
          api.getReports(activeRegionFilter === 'all' ? undefined : activeRegionFilter),
          api.getRegions(),
        ]);
        setStats(statsData);
        setRecentEvents(eventsData.slice(0, 5));
        setReports(reportsData);
        setRegions(regionsData);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeRegionFilter]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-stone-500">Carregando indicadores em tempo real...</span>
        </div>
      </div>
    );
  }

  // Pending reports check
  const submittedPendingReview = reports.filter(r => r.status === 'submitted');
  const upcomingPlanned = recentEvents.filter(e => e.status === 'planned');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#141210] via-[#1f1816] to-[#450a0a] rounded-2xl p-6 sm:p-7 text-white border border-stone-800/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-900/70 text-red-100 border border-red-700/50">
              Supervisão Operacional
            </span>
            <span className="text-[11px] text-stone-400">
              Dados em tempo real
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Painel Geral de Supervisão Ministerial
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1.5 max-w-2xl leading-relaxed">
            Acompanhamento centralizado das regionais, evangelismos, relatórios bimestrais e
            inteligência estratégica dos Semeadores de Fogo.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenAIModal}
            className="px-4 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Diagnóstico IA dos Relatórios</span>
          </button>
        )}
      </div>

      {/* Administrative Alerts Banner */}
      {(submittedPendingReview.length > 0 || upcomingPlanned.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submittedPendingReview.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-900 uppercase">
                  Relatórios Bimestrais Aguardando Parecer
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Existem {submittedPendingReview.length} relatórios enviados aguardando análise e aprovação da Direção Global.
                </p>
                <button
                  onClick={() => onNavigateTab('reports')}
                  className="mt-2 text-xs font-bold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Revisar relatórios</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {upcomingPlanned.length > 0 && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-blue-900 uppercase">
                  Próximas Mobilizações Agendadas
                </h4>
                <p className="text-xs text-blue-800 mt-0.5">
                  {upcomingPlanned.length} ações evangelísticas programadas para os próximos dias no calendário.
                </p>
                <button
                  onClick={() => onNavigateTab('evangelisms')}
                  className="mt-2 text-xs font-bold text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver calendário</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Regionais Cadastradas & Ativas */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Regionais</span>
            <MapPin className="w-4 h-4 text-red-700" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            {stats?.totalRegions || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1 font-medium">
            <span className="text-emerald-700 font-bold">{stats?.activeRegions || 0} ativas</span>
            <span>• 1 em implantação</span>
          </div>
        </div>

        {/* Semeadores Registrados */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Semeadores</span>
            <Users className="w-4 h-4 text-stone-700" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            {stats?.totalMembers || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            Integrantes ativos nas equipes
          </div>
        </div>

        {/* Evangelismos Realizados */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Evangelismos</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            {stats?.completedEvents || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium flex items-center gap-1">
            <span className="text-red-700 font-bold">+{stats?.plannedEvents || 0}</span> previstos
          </div>
        </div>

        {/* Participantes Envolvidos */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Participantes</span>
            <TrendingUp className="w-4 h-4 text-stone-700" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            {stats?.totalParticipants || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            Mobilizações de campo
          </div>
        </div>

        {/* Pessoas Alcançadas */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Almas Alcançadas</span>
            <HeartHandshake className="w-4 h-4 text-red-700" />
          </div>
          <div className="text-2xl font-black text-red-700">
            {stats?.totalSoulsReached || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            Ouviram a mensagem e receberam oração
          </div>
        </div>

        {/* Relatórios Bimestrais Entregues */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Relatórios Entregues</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            {stats?.deliveredReports || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            {stats?.pendingReports || 0} pendentes no período
          </div>
        </div>
      </div>

      {/* Two Column Section: Regional Status & Recent Completed Evangelisms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regionais Overview Table */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm uppercase">Regionais em Supervisão</h3>
              <p className="text-xs text-stone-500">Frequência prevista vs situação da unidade</p>
            </div>
            <button
              onClick={() => onNavigateTab('regions')}
              className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {regions.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{r.name}</h4>
                  <p className="text-[11px] text-stone-500">{r.churchName} • {r.pastorResponsible}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    r.evangelismFrequency === 'weekly'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-stone-100 text-stone-700'
                  }`}>
                    {r.evangelismFrequency === 'weekly' ? 'Semanal' : 'Quinzenal'}
                  </span>
                  <span className="text-xs font-semibold text-stone-700 font-mono">
                    {r.membersCount} sem.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Evangelism Actions */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm uppercase">Atividades Recentes de Evangelismo</h3>
              <p className="text-xs text-stone-500">Últimas mobilizações de rua e resultados informados</p>
            </div>
            <button
              onClick={() => onNavigateTab('evangelisms')}
              className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
            >
              Ver agenda
            </button>
          </div>

          <div className="space-y-3">
            {recentEvents.map((ev) => (
              <div key={ev.id} className="p-3 rounded-lg bg-stone-50 border border-stone-200/70 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-stone-200 text-stone-800">
                      {ev.actionType}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      ev.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ev.status === 'completed' ? 'Realizado' : 'Planejado'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 line-clamp-1">{ev.title}</h4>
                  <p className="text-[11px] text-stone-500">{ev.location} • Líder: {ev.leaderName}</p>
                </div>

                {ev.status === 'completed' && (
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-red-700 block">
                      {ev.soulsReached || 0} almas
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {ev.authorizedContacts || 0} contatos
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
