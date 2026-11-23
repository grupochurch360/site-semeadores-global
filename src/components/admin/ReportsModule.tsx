import React, { useEffect, useState } from 'react';
import {
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Printer,
  MessageSquare,
  Search,
  X,
  RotateCcw,
  Pencil,
  Save,
  Check,
  Loader2,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { BimonthlyReport, ReportStatus, Region } from '../../types/index.ts';

interface ReportsModuleProps {
  onOpenAIAnalysis: () => void;
}

type EditorTab = 'metrics' | 'narrative' | 'planning';

const STATUS_META: Record<string, { label: string; badgeClass: string }> = {
  draft: { label: 'Rascunho', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200' },
  submitted: { label: 'Enviado', badgeClass: 'bg-sky-50 text-sky-800 border-sky-200' },
  in_review: { label: 'Em Análise', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  approved: { label: 'Aprovado', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  returned: { label: 'Devolvido', badgeClass: 'bg-red-50 text-red-800 border-red-200' },
};

const BIMESTER_OPTIONS = [
  '1º Bimestre (Jan/Fev 2026)',
  '2º Bimestre (Mar/Abr 2026)',
  '3º Bimestre (Mai/Jun 2026)',
  '4º Bimestre (Jul/Ago 2026)',
  '5º Bimestre (Set/Out 2026)',
  '6º Bimestre (Nov/Dez 2026)',
];

function safeInt(value: string): number {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ onOpenAIAnalysis }) => {
  const { isAdmin, activeRegionFilter } = useAuth();
  const [reports, setReports] = useState<BimonthlyReport[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Feedback states (replaces browser alert)
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Inline Quick-Edit state
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickForm, setQuickForm] = useState<{
    evangelismsCount: number;
    totalParticipantsSum: number;
    totalSoulsReached: number;
    authorizedContactsCount: number;
    status: ReportStatus;
  } | null>(null);

  // Selected report for modal editing / reviewing / printing
  const [selectedReport, setSelectedReport] = useState<BimonthlyReport | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editorTab, setEditorTab] = useState<EditorTab>('metrics');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewDecision, setReviewDecision] = useState<ReportStatus>('approved');

  const [reportForm, setReportForm] = useState<Partial<BimonthlyReport>>({
    regionId: activeRegionFilter === 'all' ? 'reg-sp' : activeRegionFilter,
    period: '5º Bimestre (Set/Out 2026)',
    year: 2026,
    churchResponsible: '',
    pastorResponsible: '',
    evangelismsCount: 0,
    evangelismFrequencyActual: '',
    locationsReached: [],
    totalParticipantsSum: 0,
    activitiesDescription: '',
    totalSoulsReached: 0,
    authorizedContactsCount: 0,
    referredToConsolidationCount: 0,
    activeFollowUpsCount: 0,
    testimoniesSummary: '',
    strengths: '',
    challenges: '',
    regionalNeeds: '',
    proposedImprovements: '',
    nextPeriodPlanning: '',
    attachments: [],
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((curr) => (curr === msg ? null : curr)), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsData, regionsData] = await Promise.all([
        api.getReports(activeRegionFilter === 'all' ? undefined : activeRegionFilter),
        api.getRegions(),
      ]);
      setReports(reportsData);
      setRegions(regionsData);
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRegionFilter]);

  const handlePreFillFromEvangelisms = async (explicitRegionId?: string) => {
    const targetRegId = explicitRegionId || reportForm.regionId || regions[0]?.id || 'reg-sp';
    try {
      setSyncing(true);
      setSyncNotice(null);
      const events = await api.getEvangelisms(targetRegId);
      const completed = events.filter((e) => e.status === 'completed');

      const locs: string[] = [];
      let totalParts = 0;
      let totalSouls = 0;
      let totalContacts = 0;

      for (const ev of completed) {
        if (ev.location && !locs.includes(ev.location)) locs.push(ev.location);
        totalParts += ev.actualParticipants || 0;
        totalSouls += ev.soulsReached || 0;
        totalContacts += ev.authorizedContacts || 0;
      }

      const reg = regions.find((r) => r.id === targetRegId);

      setReportForm((prev) => ({
        ...prev,
        regionId: targetRegId,
        churchResponsible: reg?.churchName || prev.churchResponsible || '',
        pastorResponsible: reg?.pastorResponsible || prev.pastorResponsible || '',
        evangelismsCount: completed.length,
        evangelismFrequencyActual: `${completed.length} evangelismos realizados no bimestre`,
        locationsReached: locs,
        totalParticipantsSum: totalParts,
        totalSoulsReached: totalSouls,
        authorizedContactsCount: totalContacts,
        referredToConsolidationCount: totalContacts,
        activeFollowUpsCount: Math.round(totalContacts * 0.75),
      }));
      setSyncNotice(
        `Dados sincronizados: ${completed.length} ações, ${totalSouls} almas e ${totalContacts} contatos.`
      );
    } catch (err) {
      console.error('Erro ao pré-preencher dados:', err);
      setEditorError('Não foi possível sincronizar os evangelismos do banco.');
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenCreate = () => {
    const regId = activeRegionFilter === 'all' ? regions[0]?.id || 'reg-sp' : activeRegionFilter;
    const reg = regions.find((r) => r.id === regId);

    setEditorError(null);
    setSyncNotice(null);
    setEditorTab('metrics');
    setSelectedReport(null);
    setReportForm({
      regionId: regId,
      period: '5º Bimestre (Set/Out 2026)',
      year: 2026,
      churchResponsible: reg?.churchName || '',
      pastorResponsible: reg?.pastorResponsible || '',
      evangelismsCount: 0,
      evangelismFrequencyActual: '',
      locationsReached: [],
      totalParticipantsSum: 0,
      activitiesDescription: '',
      totalSoulsReached: 0,
      authorizedContactsCount: 0,
      referredToConsolidationCount: 0,
      activeFollowUpsCount: 0,
      testimoniesSummary: '',
      strengths: '',
      challenges: '',
      regionalNeeds: '',
      proposedImprovements: '',
      nextPeriodPlanning: '',
      attachments: [],
    });
    setIsEditorOpen(true);
    void handlePreFillFromEvangelisms(regId);
  };

  const handleOpenViewOrEdit = (report: BimonthlyReport) => {
    setEditorError(null);
    setSyncNotice(null);
    setEditorTab('metrics');
    setSelectedReport(report);
    setReportForm({ ...report });
    setIsEditorOpen(true);
  };

  const handleRegionChange = (newRegionId: string) => {
    const reg = regions.find((r) => r.id === newRegionId);
    setReportForm((prev) => ({
      ...prev,
      regionId: newRegionId,
      churchResponsible: reg?.churchName || prev.churchResponsible || '',
      pastorResponsible: reg?.pastorResponsible || prev.pastorResponsible || '',
    }));
  };

  const handleSaveReport = async (submitNow: boolean = false) => {
    if (!reportForm.period?.trim()) {
      setEditorError('Selecione o bimestre de referência.');
      return;
    }

    try {
      setSaving(true);
      setEditorError(null);

      const payload: Partial<BimonthlyReport> = {
        regionId: reportForm.regionId,
        period: reportForm.period,
        year: reportForm.year || 2026,
        churchResponsible: reportForm.churchResponsible || '',
        pastorResponsible: reportForm.pastorResponsible || '',
        evangelismsCount: reportForm.evangelismsCount ?? 0,
        evangelismFrequencyActual: reportForm.evangelismFrequencyActual || '',
        locationsReached: reportForm.locationsReached || [],
        totalParticipantsSum: reportForm.totalParticipantsSum ?? 0,
        activitiesDescription: reportForm.activitiesDescription || '',
        totalSoulsReached: reportForm.totalSoulsReached ?? 0,
        authorizedContactsCount: reportForm.authorizedContactsCount ?? 0,
        referredToConsolidationCount: reportForm.referredToConsolidationCount ?? 0,
        activeFollowUpsCount: reportForm.activeFollowUpsCount ?? 0,
        testimoniesSummary: reportForm.testimoniesSummary || '',
        strengths: reportForm.strengths || '',
        challenges: reportForm.challenges || '',
        regionalNeeds: reportForm.regionalNeeds || '',
        proposedImprovements: reportForm.proposedImprovements || '',
        nextPeriodPlanning: reportForm.nextPeriodPlanning || '',
        status: submitNow ? 'submitted' : reportForm.status || (selectedReport ? selectedReport.status : 'draft'),
      };

      if (selectedReport) {
        await api.updateReport(selectedReport.id, payload);
        showToast(submitNow ? 'Relatório enviado para Direção Global!' : 'Alterações salvas com sucesso!');
      } else {
        const created = await api.createReport(payload);
        if (submitNow) {
          await api.updateReport(created.id, { status: 'submitted' });
        }
        showToast(submitNow ? 'Novo relatório criado e enviado!' : 'Rascunho criado com sucesso!');
      }

      setIsEditorOpen(false);
      await loadData();
    } catch (err: any) {
      setEditorError(err?.message || 'Erro ao salvar relatório');
    } finally {
      setSaving(false);
    }
  };

  const startQuickEdit = (rep: BimonthlyReport) => {
    setQuickEditId(rep.id);
    setQuickForm({
      evangelismsCount: rep.evangelismsCount || 0,
      totalParticipantsSum: rep.totalParticipantsSum || 0,
      totalSoulsReached: rep.totalSoulsReached || 0,
      authorizedContactsCount: rep.authorizedContactsCount || 0,
      status: rep.status,
    });
  };

  const saveQuickEdit = async (rep: BimonthlyReport) => {
    if (!quickForm) return;
    try {
      setSaving(true);
      await api.updateReport(rep.id, {
        evangelismsCount: quickForm.evangelismsCount,
        totalParticipantsSum: quickForm.totalParticipantsSum,
        totalSoulsReached: quickForm.totalSoulsReached,
        authorizedContactsCount: quickForm.authorizedContactsCount,
        ...(isAdmin ? { status: quickForm.status } : {}),
      });
      setQuickEditId(null);
      setQuickForm(null);
      showToast(`Métricas de ${rep.period} atualizadas!`);
      await loadData();
    } catch (err: any) {
      showToast(err?.message || 'Erro ao atualizar métricas');
    } finally {
      setSaving(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      setSaving(true);
      await api.updateReport(selectedReport.id, {
        reviewComment,
        newStatus: reviewDecision,
      });
      setIsReviewModalOpen(false);
      setReviewComment('');
      showToast('Parecer oficial registrado!');
      await loadData();
    } catch (err: any) {
      setEditorError(err?.message || 'Erro ao emitir parecer da liderança');
    } finally {
      setSaving(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const regName = regions.find((rg) => rg.id === r.regionId)?.name || '';
    const matchesSearch =
      r.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.coordinatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      regName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.regionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalSoulsAll = filteredReports.reduce((acc, r) => acc + (r.totalSoulsReached || 0), 0);
  const approvedCount = filteredReports.filter((r) => r.status === 'approved').length;
  const pendingReviewCount = filteredReports.filter((r) => r.status === 'submitted' || r.status === 'in_review').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[#141210] text-white px-4 py-3 rounded-xl shadow-xl border border-stone-700 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#DCE5ED]">
        <div>
          <span className="section-kicker">
            Prestação de Contas Ministerial
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B2946] tracking-tight mt-1">
            Relatórios Bimestrais das Regionais
          </h2>
          <p className="text-xs text-[#586E84] mt-1 max-w-2xl">
            Edite números diretamente no card com Edição Rápida ou abra o formulário completo para relatos e planejamento.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={onOpenAIAnalysis}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#061A2D] hover:bg-[#0A3D69] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFBD58]" />
              <span>Analisar com IA</span>
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#ED801F] hover:bg-[#d86f12] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Relatório</span>
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#DCE5ED] p-4">
          <span className="text-[11px] font-medium text-[#586E84] block">Relatórios filtrados</span>
          <span className="text-2xl font-extrabold text-[#0B2946] tabular-nums mt-1 block">
            {filteredReports.length}
          </span>
        </div>
        <div className="bg-[#061A2D] rounded-xl border border-[#16324F] p-4">
          <span className="text-[11px] font-medium text-[#B7C8D9] block">Almas alcançadas</span>
          <span className="text-2xl font-extrabold text-[#FFBD58] tabular-nums mt-1 block">
            {totalSoulsAll.toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-[#DCE5ED] p-4">
          <span className="text-[11px] font-medium text-[#586E84] block">Aguardando parecer</span>
          <span className="text-2xl font-extrabold text-[#ED801F] tabular-nums mt-1 block">
            {pendingReviewCount}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-[#DCE5ED] p-4">
          <span className="text-[11px] font-medium text-[#586E84] block">Aprovados</span>
          <span className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-1 block">
            {approvedCount}
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por bimestre, coordenador ou regional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 text-xs bg-white border border-stone-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30 focus:border-red-600"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs py-2.5 px-3.5 bg-white border border-stone-200/90 rounded-xl text-stone-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-red-600/30 w-full sm:w-auto cursor-pointer"
        >
          <option value="all">Todos os Status</option>
          <option value="draft">Rascunho</option>
          <option value="submitted">Enviado</option>
          <option value="in_review">Em Análise</option>
          <option value="approved">Aprovado</option>
          <option value="returned">Devolvido p/ Correção</option>
        </select>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-stone-500 flex flex-col items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-red-700" />
          <span>Carregando relatórios bimestrais...</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="py-14 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200/80 space-y-2">
          <FileText className="w-7 h-7 text-stone-300 mx-auto" />
          <p className="font-semibold text-stone-700">Nenhum relatório encontrado para o filtro atual.</p>
          <button
            onClick={handleOpenCreate}
            className="px-3.5 py-1.5 bg-red-700 text-white rounded-lg text-xs font-semibold hover:bg-red-800 cursor-pointer"
          >
            Criar novo relatório
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((rep) => {
            const reg = regions.find((r) => r.id === rep.regionId);
            const statusConfig = STATUS_META[rep.status] || {
              label: rep.status,
              badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
            };
            const isQuickEditing = quickEditId === rep.id && quickForm !== null;

            return (
              <div
                key={rep.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 hover:border-stone-300 transition-colors space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusConfig.badgeClass}`}
                      >
                        {statusConfig.label}
                      </span>
                      <span className="text-sm font-bold text-[#141210]">{rep.period}</span>
                      {reg && (
                        <span className="text-xs font-medium text-stone-500">
                          • {reg.name}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      <strong className="text-stone-800">Atividades:</strong>{' '}
                      {rep.activitiesDescription || 'Sem descrição inserida.'}
                    </p>

                    {/* Metrics Strip or Inline Quick-Edit */}
                    {isQuickEditing && quickForm ? (
                      <div className="mt-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-red-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-red-800 flex items-center gap-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Edição Rápida de Métricas
                          </span>
                          <span className="text-[10px] text-stone-500">
                            Altera os dados imediatamente no banco
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                          <div>
                            <label className="block text-[10px] font-semibold text-stone-600 mb-1">Ações</label>
                            <input
                              type="number"
                              min={0}
                              value={quickForm.evangelismsCount}
                              onChange={(e) =>
                                setQuickForm({ ...quickForm, evangelismsCount: safeInt(e.target.value) })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-bold tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-stone-600 mb-1">Participantes</label>
                            <input
                              type="number"
                              min={0}
                              value={quickForm.totalParticipantsSum}
                              onChange={(e) =>
                                setQuickForm({ ...quickForm, totalParticipantsSum: safeInt(e.target.value) })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-bold tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-stone-600 mb-1">Almas</label>
                            <input
                              type="number"
                              min={0}
                              value={quickForm.totalSoulsReached}
                              onChange={(e) =>
                                setQuickForm({ ...quickForm, totalSoulsReached: safeInt(e.target.value) })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-bold text-red-700 tabular-nums"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-stone-600 mb-1">Contatos LGPD</label>
                            <input
                              type="number"
                              min={0}
                              value={quickForm.authorizedContactsCount}
                              onChange={(e) =>
                                setQuickForm({ ...quickForm, authorizedContactsCount: safeInt(e.target.value) })
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-bold text-emerald-700 tabular-nums"
                            />
                          </div>
                          {isAdmin && (
                            <div>
                              <label className="block text-[10px] font-semibold text-stone-600 mb-1">Status</label>
                              <select
                                value={quickForm.status}
                                onChange={(e) =>
                                  setQuickForm({ ...quickForm, status: e.target.value as ReportStatus })
                                }
                                className="w-full px-2 py-1.5 bg-white border border-stone-300 rounded-lg font-semibold"
                              >
                                <option value="draft">Rascunho</option>
                                <option value="submitted">Enviado</option>
                                <option value="in_review">Em Análise</option>
                                <option value="approved">Aprovado</option>
                                <option value="returned">Devolvido</option>
                              </select>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setQuickEditId(null);
                              setQuickForm(null);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => saveQuickEdit(rep)}
                            className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                          >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            <span>Salvar Alterações</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-stone-500 pt-1">
                        <span className="tabular-nums">
                          Ações: <strong className="text-stone-900">{rep.evangelismsCount}</strong>
                        </span>
                        <span className="tabular-nums">
                          Participantes: <strong className="text-stone-900">{rep.totalParticipantsSum}</strong>
                        </span>
                        <span className="tabular-nums">
                          Almas: <strong className="text-[#ED801F]">{rep.totalSoulsReached}</strong>
                        </span>
                        <span className="tabular-nums">
                          Contatos LGPD: <strong className="text-emerald-700">{rep.authorizedContactsCount}</strong>
                        </span>
                        <span>
                          Coord.: <strong className="text-[#0B2946]">{rep.coordinatorName}</strong>
                        </span>
                      </div>
                    )}

                    {rep.reviews && rep.reviews.length > 0 && (
                      <div className="mt-2 text-xs bg-[#EDF4F9]/70 border border-[#DCE5ED] p-2.5 rounded-xl flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-[#0A3D69] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#0B2946]">
                            {rep.reviews[rep.reviews.length - 1].authorName}:{' '}
                          </span>
                          <span className="text-[#586E84] italic">
                            "{rep.reviews[rep.reviews.length - 1].comment}"
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#DCE5ED]">
                    <div className="flex items-center gap-2">
                      {!isQuickEditing && (
                        <button
                          onClick={() => startQuickEdit(rep)}
                          className="px-3 py-1.5 bg-[#FFF9F2] hover:bg-[#f5ebd9] text-[#A6540B] border border-[#F5DDC3] rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                          title="Editar números e status diretamente"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edição Rápida</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenViewOrEdit(rep)}
                        className="px-3 py-1.5 bg-[#EDF4F9] hover:bg-[#DCE5ED] text-[#0B2946] rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Editar Completo
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setSelectedReport(rep);
                            setReviewDecision('approved');
                            setIsReviewModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-[#061A2D] hover:bg-[#0A3D69] text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Avaliar
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedReport(rep);
                        setIsPrintModalOpen(true);
                      }}
                      className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Visualizar / Imprimir PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Streamlined 3-Tab Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="font-bold text-base text-[#141210]">
                  {selectedReport ? `Editar Relatório — ${reportForm.period}` : 'Novo Relatório Bimestral'}
                </h3>
                <p className="text-xs text-stone-500">
                  Alterações são salvas diretamente no banco e refletidas na IA
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={syncing}
                  onClick={() => handlePreFillFromEvangelisms(reportForm.regionId)}
                  className="px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-100 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  title="Puxa contagens reais de evangelismos já cadastrados no banco"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Sincronizando...' : 'Puxar dos Evangelismos'}</span>
                </button>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="px-6 pt-3 border-b border-stone-200 bg-[#FAF8F5] flex items-center gap-2 shrink-0">
              {[
                { id: 'metrics' as EditorTab, label: '1. Identificação & Métricas' },
                { id: 'narrative' as EditorTab, label: '2. Relatos & Avaliação' },
                { id: 'planning' as EditorTab, label: '3. Melhorias & Próximo Bimestre' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEditorTab(tab.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-colors cursor-pointer ${
                    editorTab === tab.id
                      ? 'border-red-700 text-red-800 bg-white'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {editorError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{editorError}</span>
                </div>
              )}

              {syncNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncNotice}</span>
                </div>
              )}

              {editorTab === 'metrics' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Regional *</label>
                      <select
                        value={reportForm.regionId || 'reg-sp'}
                        disabled={Boolean(selectedReport)}
                        onChange={(e) => handleRegionChange(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white disabled:bg-stone-100"
                      >
                        {regions.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Bimestre de Referência *</label>
                      <select
                        value={reportForm.period || '5º Bimestre (Set/Out 2026)'}
                        onChange={(e) => setReportForm({ ...reportForm, period: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                      >
                        {BIMESTER_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Igreja Responsável</label>
                      <input
                        type="text"
                        value={reportForm.churchResponsible || ''}
                        onChange={(e) => setReportForm({ ...reportForm, churchResponsible: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Pastor Responsável</label>
                      <input
                        type="text"
                        value={reportForm.pastorResponsible || ''}
                        onChange={(e) => setReportForm({ ...reportForm, pastorResponsible: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-stone-200/80 space-y-4">
                    <h4 className="text-xs font-bold text-[#141210]">Métricas de Campo & Consolidação</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Evangelismos Realizados</label>
                        <input
                          type="number"
                          min={0}
                          value={reportForm.evangelismsCount ?? 0}
                          onChange={(e) =>
                            setReportForm({ ...reportForm, evangelismsCount: safeInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-bold tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Soma de Participantes</label>
                        <input
                          type="number"
                          min={0}
                          value={reportForm.totalParticipantsSum ?? 0}
                          onChange={(e) =>
                            setReportForm({ ...reportForm, totalParticipantsSum: safeInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-bold tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Pessoas Alcançadas</label>
                        <input
                          type="number"
                          min={0}
                          value={reportForm.totalSoulsReached ?? 0}
                          onChange={(e) =>
                            setReportForm({ ...reportForm, totalSoulsReached: safeInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-bold text-red-700 tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Contatos LGPD</label>
                        <input
                          type="number"
                          min={0}
                          value={reportForm.authorizedContactsCount ?? 0}
                          onChange={(e) =>
                            setReportForm({ ...reportForm, authorizedContactsCount: safeInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-bold text-emerald-700 tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Encaminhados à Igreja</label>
                        <input
                          type="number"
                          min={0}
                          value={reportForm.activeFollowUpsCount ?? 0}
                          onChange={(e) =>
                            setReportForm({ ...reportForm, activeFollowUpsCount: safeInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Frequência Informada</label>
                        <input
                          type="text"
                          placeholder="Semanal ou Quinzenal"
                          value={reportForm.evangelismFrequencyActual || ''}
                          onChange={(e) =>
                            setReportForm({ ...reportForm, evangelismFrequencyActual: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block font-semibold text-stone-700 mb-1">
                        Locais Alcançados (separados por vírgula)
                      </label>
                      <input
                        type="text"
                        placeholder="Praça da Sé, Avenida Paulista, Hospital das Clínicas"
                        value={(reportForm.locationsReached || []).join(', ')}
                        onChange={(e) =>
                          setReportForm({
                            ...reportForm,
                            locationsReached: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editorTab === 'narrative' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Descrição Detalhada das Atividades
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Relato consolidado dos locais alcançados, mobilização das equipes e dinâmicas de ação..."
                      value={reportForm.activitiesDescription || ''}
                      onChange={(e) => setReportForm({ ...reportForm, activitiesDescription: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Resumo de Testemunhos Autorizados
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Relatos de curas, libertações, famílias reconciliadas e acolhimento..."
                      value={reportForm.testimoniesSummary || ''}
                      onChange={(e) => setReportForm({ ...reportForm, testimoniesSummary: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Principais Pontos Fortes</label>
                      <textarea
                        rows={3}
                        placeholder="Engajamento, comunhão dos jovens, ousadia..."
                        value={reportForm.strengths || ''}
                        onChange={(e) => setReportForm({ ...reportForm, strengths: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Principais Dificuldades</label>
                      <textarea
                        rows={3}
                        placeholder="Transporte, caixas de som, falta de impressos..."
                        value={reportForm.challenges || ''}
                        onChange={(e) => setReportForm({ ...reportForm, challenges: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editorTab === 'planning' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Necessidades da Regional</label>
                    <textarea
                      rows={3}
                      placeholder="Envio dos 4 módulos físicos de estudo, camisetas oficiais, apoio pastoral..."
                      value={reportForm.regionalNeeds || ''}
                      onChange={(e) => setReportForm({ ...reportForm, regionalNeeds: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Melhorias Propostas</label>
                    <textarea
                      rows={3}
                      placeholder="Padronização de triagem, reforço logístico, treinamento de equipe..."
                      value={reportForm.proposedImprovements || ''}
                      onChange={(e) => setReportForm({ ...reportForm, proposedImprovements: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Planejamento para o Próximo Bimestre
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Expansão para novos bairros, vigília de oração, cruzada regional..."
                      value={reportForm.nextPeriodPlanning || ''}
                      onChange={(e) => setReportForm({ ...reportForm, nextPeriodPlanning: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white"
                    />
                  </div>

                  {isAdmin && selectedReport && (
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Status do Relatório</label>
                      <select
                        value={reportForm.status || selectedReport.status}
                        onChange={(e) =>
                          setReportForm({ ...reportForm, status: e.target.value as ReportStatus })
                        }
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-semibold"
                      >
                        <option value="draft">Rascunho</option>
                        <option value="submitted">Enviado</option>
                        <option value="in_review">Em Análise</option>
                        <option value="approved">Aprovado</option>
                        <option value="returned">Devolvido para Correção</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions footer */}
            <div className="px-6 py-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 border border-stone-200 text-stone-700 rounded-xl font-semibold text-xs hover:bg-stone-50 cursor-pointer"
              >
                Fechar
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveReport(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-800 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{selectedReport ? 'Salvar Alterações' : 'Salvar como Rascunho'}</span>
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveReport(true)}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar para Direção Global</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-[#141210]">Parecer da Direção Global</h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Decisão do Relatório *</label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-semibold"
                >
                  <option value="approved">Aprovar Relatório Oficialmente</option>
                  <option value="returned">Devolver para Correção / Complementação</option>
                  <option value="in_review">Manter Em Análise</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Parecer e Orientações Ministeriais *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Insira as observações, elogios ou solicitações de ajuste da Direção Global..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-xl font-semibold cursor-pointer"
                >
                  {saving ? 'Salvando...' : 'Registrar Parecer Oficial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF / Print Preview Modal */}
      {isPrintModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 print:p-0 print:shadow-none">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 no-print">
              <span className="text-xs font-semibold text-stone-500">Visualização de Exportação</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 font-sans">
              <div className="text-center pb-4 border-b-2 border-[#141210]">
                <h1 className="text-xl font-black uppercase text-[#141210]">SEMEADORES DE FOGO GLOBAL</h1>
                <p className="text-xs font-bold text-red-700 tracking-widest uppercase">
                  Relatório Bimestral de Prestação de Contas Ministerial
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Período: {selectedReport.period} • Ano: {selectedReport.year} • Status:{' '}
                  {STATUS_META[selectedReport.status]?.label || selectedReport.status}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-b border-stone-200 pb-4">
                <div>
                  <span className="text-stone-500 block">Regional Responsável:</span>
                  <span className="font-bold text-[#141210]">
                    {regions.find((r) => r.id === selectedReport.regionId)?.name || selectedReport.regionId}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Coordenador:</span>
                  <span className="font-bold text-[#141210]">{selectedReport.coordinatorName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Igreja / Pastor:</span>
                  <span className="font-bold text-[#141210]">
                    {selectedReport.churchResponsible} ({selectedReport.pastorResponsible})
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Frequência das Ações:</span>
                  <span className="font-bold text-[#141210]">{selectedReport.evangelismFrequencyActual}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center bg-[#FAF8F5] p-3.5 rounded-xl border border-stone-200 text-xs">
                <div>
                  <span className="text-stone-500 block text-[10px]">Ações Realizadas</span>
                  <span className="font-extrabold text-base text-[#141210] tabular-nums">
                    {selectedReport.evangelismsCount}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Participantes</span>
                  <span className="font-extrabold text-base text-[#141210] tabular-nums">
                    {selectedReport.totalParticipantsSum}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Almas Alcançadas</span>
                  <span className="font-extrabold text-base text-red-700 tabular-nums">
                    {selectedReport.totalSoulsReached}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Contatos LGPD</span>
                  <span className="font-extrabold text-base text-emerald-700 tabular-nums">
                    {selectedReport.authorizedContactsCount}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <h4 className="font-bold uppercase text-[#141210] border-b border-stone-200 pb-1 mb-1">
                    Atividades Desenvolvidas
                  </h4>
                  <p className="text-stone-700">{selectedReport.activitiesDescription}</p>
                </div>

                <div>
                  <h4 className="font-bold uppercase text-[#141210] border-b border-stone-200 pb-1 mb-1">
                    Testemunhos Registrados
                  </h4>
                  <p className="text-stone-700">
                    {selectedReport.testimoniesSummary || 'Nenhum testemunho registrado no período.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold uppercase text-[#141210] border-b border-stone-200 pb-1 mb-1">
                      Pontos Fortes
                    </h4>
                    <p className="text-stone-700">{selectedReport.strengths}</p>
                  </div>
                  <div>
                    <h4 className="font-bold uppercase text-[#141210] border-b border-stone-200 pb-1 mb-1">
                      Dificuldades Encontradas
                    </h4>
                    <p className="text-stone-700">{selectedReport.challenges}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold uppercase text-[#141210] border-b border-stone-200 pb-1 mb-1">
                    Necessidades da Regional & Planejamento
                  </h4>
                  <p className="text-stone-700">{selectedReport.regionalNeeds}</p>
                  {selectedReport.nextPeriodPlanning && (
                    <p className="text-stone-700 mt-1">
                      <strong>Próximo bimestre:</strong> {selectedReport.nextPeriodPlanning}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-stone-300 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-t border-stone-400 pt-1 w-48 mx-auto font-bold">
                    {selectedReport.coordinatorName}
                  </div>
                  <span className="text-stone-500 text-[10px]">Coordenação Regional</span>
                </div>
                <div>
                  <div className="border-t border-stone-400 pt-1 w-48 mx-auto font-bold">
                    Direção Global Semeadores de Fogo
                  </div>
                  <span className="text-stone-500 text-[10px]">Supervisão & Homologação</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
