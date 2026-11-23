import React, { useEffect, useState } from 'react';
import {
  Users,
  MapPin,
  Flame,
  HeartHandshake,
  FileSpreadsheet,
  Sparkles,
  AlertTriangle,
  Calendar,
  TrendingUp,
  ChevronRight,
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
  const { isAdmin, activeRegionFilter } = useAuth();
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
          <span className="text-xs font-semibold text-stone-500">
            Carregando indicadores em tempo real...
          </span>
        </div>
      </div>
    );
  }

  const submittedPendingReview = reports.filter((r) => r.status === 'submitted');
  const upcomingPlanned = recentEvents.filter((e) => e.status === 'planned');
  const visibleRegions =
    activeRegionFilter === 'all' ? regions : regions.filter((r) => r.id === activeRegionFilter);
  const implantationCount = visibleRegions.filter((r) => r.status === 'in_implantation').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Operational Command Banner */}
      <div className="bg-[#141210] rounded-2xl p-6 sm:p-7 text-white border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-900/70 text-red-100 border border-red-700/50">
              Supervisão Operacional
            </span>
            <span className="text-[11px] text-stone-400">Dados em tempo real</span>
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
            className="px-4 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Diagnóstico IA dos Relatórios</span>
          </button>
        )}
      </div>

      {/* Administrative Alerts */}
      {(submittedPendingReview.length > 0 || upcomingPlanned.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submittedPendingReview.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-950">
                  Relatórios bimestrais aguardando parecer
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Existem {submittedPendingReview.length} relatórios enviados aguardando análise e
                  aprovação da Direção Global.
                </p>
                <button
                  onClick={() => onNavigateTab('reports')}
                  className="mt-2 text-xs font-bold text-amber-950 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Revisar relatórios</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {upcomingPlanned.length > 0 && (
            <div className="p-4 rounded-2xl bg-sky-50/90 border border-sky-200 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-sky-950">
                  Próximas mobilizações agendadas
                </h4>
                <p className="text-xs text-sky-800 mt-0.5">
                  {upcomingPlanned.length} ação(ões) evangelística(s) programada(s) no calendário.
                </p>
                <button
                  onClick={() => onNavigateTab('evangelisms')}
                  className="mt-2 text-xs font-bold text-sky-950 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver agenda</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E7E2DA]">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Regionais</span>
            <MapPin className="w-4 h-4 text-red-700" />
          </div>
          <div className="text-2xl font-extrabold text-[#141210] tabular-nums">
            {stats?.totalRegions || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1.5 font-medium">
            <span className="text-emerald-700 font-semibold">{stats?.activeRegions || 0} ativas</span>
            {implantationCount > 0 && <span>• {implantationCount} em implantação</span>}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7E2DA]">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Semeadores</span>
            <Users className="w-4 h-4 text-stone-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#141210] tabular-nums">
            {stats?.totalMembers || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            Integrantes ativos nas equipes
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7E2DA]">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Evangelismos</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#141210] tabular-nums">
            {stats?.completedEvents || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium flex items-center gap-1">
            <span className="text-red-700 font-semibold">+{stats?.plannedEvents || 0}</span> previstos
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7E2DA]">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Participantes</span>
            <TrendingUp className="w-4 h-4 text-stone-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#141210] tabular-nums">
            {stats?.totalParticipants || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">Mobilizações de campo</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7E2DA]">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Almas alcançadas</span>
            <HeartHandshake className="w-4 h-4 text-red-700" />
          </div>
          <div className="text-2xl font-extrabold text-red-700 tabular-nums">
            {stats?.totalSoulsReached || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            Ouviram a mensagem e receberam oração
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7E2DA]">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Relatórios entregues</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-extrabold text-[#141210] tabular-nums">
            {stats?.deliveredReports || 0}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            {Math.max(0, stats?.pendingReports || 0)} pendentes no período
          </div>
        </div>
      </div>

      {/* Two Column Operational Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E7E2DA] p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 mb-3">
            <div>
              <h3 className="font-bold text-[#141210] text-sm">Regionais em supervisão</h3>
              <p className="text-xs text-stone-500">Frequência prevista e porte das equipes</p>
            </div>
            <button
              onClick={() => onNavigateTab('regions')}
              className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {visibleRegions.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#141210] truncate">{r.name}</h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    {r.churchName} • {r.pastorResponsible}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      r.evangelismFrequency === 'weekly'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {r.evangelismFrequency === 'weekly' ? 'Semanal' : 'Quinzenal'}
                  </span>
                  <span className="text-xs font-semibold text-stone-700 tabular-nums">
                    {r.membersCount} sem.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2DA] p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 mb-3">
            <div>
              <h3 className="font-bold text-[#141210] text-sm">Atividades recentes de evangelismo</h3>
              <p className="text-xs text-stone-500">Últimas mobilizações de rua e resultados</p>
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
              <div
                key={ev.id}
                className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white border border-[#E7E2DA] text-stone-700">
                      {ev.actionType}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        ev.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {ev.status === 'completed' ? 'Realizado' : 'Planejado'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#141210] line-clamp-1">{ev.title}</h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    {ev.location} • Líder: {ev.leaderName}
                  </p>
                </div>

                {ev.status === 'completed' && (
                  <div className="text-right shrink-0 tabular-nums">
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
