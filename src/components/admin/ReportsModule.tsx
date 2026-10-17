import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Printer,
  MessageSquare,
  FileText,
  Search,
  Filter,
  X,
  RotateCcw,
  CheckCheck,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { BimonthlyReport, ReportStatus, Region, EvangelismEvent } from '../../types/index.ts';

interface ReportsModuleProps {
  onOpenAIAnalysis: () => void;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ onOpenAIAnalysis }) => {
  const { currentUser, isAdmin, isCoordinator, canSubmitReports, activeRegionFilter } = useAuth();
  const [reports, setReports] = useState<BimonthlyReport[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected report for viewing or editing
  const [selectedReport, setSelectedReport] = useState<BimonthlyReport | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Review modal state (Admin approval/correction)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewDecision, setReviewDecision] = useState<ReportStatus>('approved');

  // Form State for Bimonthly Report (5 Sections)
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

  // Handle auto-prefill from completed evangelisms
  const handlePreFillFromEvangelisms = async () => {
    try {
      const targetRegId = reportForm.regionId || 'reg-sp';
      const events = await api.getEvangelisms(targetRegId);
      const completed = events.filter(e => e.status === 'completed');

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

      const reg = regions.find(r => r.id === targetRegId);

      setReportForm((prev) => ({
        ...prev,
        churchResponsible: reg?.churchName || prev.churchResponsible,
        pastorResponsible: reg?.pastorResponsible || prev.pastorResponsible,
        evangelismsCount: completed.length,
        evangelismFrequencyActual: `${completed.length} evangelismos realizados no bimestre`,
        locationsReached: locs,
        totalParticipantsSum: totalParts,
        totalSoulsReached: totalSouls,
        authorizedContactsCount: totalContacts,
        referredToConsolidationCount: totalContacts,
        activeFollowUpsCount: Math.round(totalContacts * 0.75),
      }));
    } catch (err) {
      console.error('Erro ao pré-preencher dados:', err);
    }
  };

  const handleOpenCreate = () => {
    const regId = activeRegionFilter === 'all' ? (regions[0]?.id || 'reg-sp') : activeRegionFilter;
    const reg = regions.find(r => r.id === regId);

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
    setSelectedReport(null);
    setIsEditorOpen(true);
    // Run pre-fill automatically
    setTimeout(handlePreFillFromEvangelisms, 100);
  };

  const handleOpenViewOrEdit = (report: BimonthlyReport) => {
    setSelectedReport(report);
    setReportForm(report);
    setIsEditorOpen(true);
  };

  const handleSaveReport = async (submitNow: boolean = false) => {
    try {
      const payload: Partial<BimonthlyReport> = {
        ...reportForm,
        status: submitNow ? 'submitted' : (selectedReport ? selectedReport.status : 'draft'),
        submissionDate: submitNow ? new Date().toISOString() : undefined,
      };

      if (selectedReport) {
        await api.updateReport(selectedReport.id, payload);
      } else {
        await api.createReport(payload);
      }

      setIsEditorOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar relatório');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      await api.updateReport(selectedReport.id, {
        reviewComment,
        newStatus: reviewDecision,
      });
      setIsReviewModalOpen(false);
      setReviewComment('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao emitir parecer da liderança');
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.coordinatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.regionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-red-700 text-xs font-bold uppercase tracking-wider">
              Prestação de Contas Ministerial
            </span>
            <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full uppercase">
              Módulo Fundamental
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase mt-0.5">
            Relatórios Bimestrais das Regionais
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Registro obrigatório de atividades, almas alcançadas, desafios locais e parecer da Direção Global.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={onOpenAIAnalysis}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Analisar com IA</span>
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Relatório</span>
          </button>
        </div>
      </div>

      {/* Approval Flow Visualizer */}
      <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
          Fluxo Ministerial de Prestação de Contas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
            <span className="font-bold text-stone-600 block">1. Rascunho</span>
            <span className="text-[10px] text-stone-400">Preenchimento local</span>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
            <span className="font-bold text-blue-800 block">2. Enviado</span>
            <span className="text-[10px] text-blue-600">Submetido pela regional</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <span className="font-bold text-amber-800 block">3. Em Análise</span>
            <span className="text-[10px] text-amber-600">Direção Global avalia</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="font-bold text-emerald-800 block">4. Aprovado</span>
            <span className="text-[10px] text-emerald-600">Homologado ou Devolvido</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por bimestre, coordenador ou regional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs py-2 px-3 bg-white border border-stone-200 rounded-lg text-stone-700 focus:outline-hidden w-full sm:w-auto"
        >
          <option value="all">Todos os Status</option>
          <option value="draft">Rascunho</option>
          <option value="submitted">Enviado</option>
          <option value="in_review">Em Análise</option>
          <option value="approved">Aprovado</option>
          <option value="returned">Devolvido p/ Correção</option>
        </select>
      </div>

      {/* Reports Table / Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-stone-500">Carregando relatórios bimestrais...</div>
      ) : filteredReports.length === 0 ? (
        <div className="py-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
          Nenhum relatório encontrado para o filtro atual.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((rep) => {
            const reg = regions.find(r => r.id === rep.regionId);
            const statusConfig = {
              draft: { label: 'Rascunho', color: 'bg-stone-100 text-stone-700 border-stone-200' },
              submitted: { label: 'Enviado', color: 'bg-blue-50 text-blue-800 border-blue-200' },
              in_review: { label: 'Em Análise', color: 'bg-amber-50 text-amber-800 border-amber-200' },
              approved: { label: 'Aprovado', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
              returned: { label: 'Devolvido', color: 'bg-red-50 text-red-800 border-red-200' },
            }[rep.status] || { label: rep.status, color: 'bg-stone-100 text-stone-700 border-stone-200' };

            return (
              <div
                key={rep.id}
                className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs hover:border-red-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <span className="text-xs font-bold text-stone-900">
                      {rep.period}
                    </span>
                    {reg && (
                      <span className="text-xs text-stone-500">
                        • {reg.name}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2">
                    <strong>Atividades:</strong> {rep.activitiesDescription || 'Sem descrição inserida.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-500">
                    <span>Ações: <strong>{rep.evangelismsCount}</strong></span>
                    <span>Almas: <strong className="text-red-700">{rep.totalSoulsReached}</strong></span>
                    <span>Contatos LGPD: <strong className="text-emerald-700">{rep.authorizedContactsCount}</strong></span>
                    <span>Envio: {rep.submissionDate ? new Date(rep.submissionDate).toLocaleDateString('pt-BR') : 'Não enviado'}</span>
                  </div>

                  {rep.reviews && rep.reviews.length > 0 && (
                    <div className="mt-2 text-xs bg-stone-50 border border-stone-200/80 p-2.5 rounded-lg flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-stone-800">{rep.reviews[rep.reviews.length - 1].authorName}: </span>
                        <span className="text-stone-600 italic">"{rep.reviews[rep.reviews.length - 1].comment}"</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenViewOrEdit(rep)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md text-xs font-semibold cursor-pointer"
                    >
                      Ver / Editar
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setSelectedReport(rep);
                          setReviewDecision('approved');
                          setIsReviewModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer"
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
            );
          })}
        </div>
      )}

      {/* Editor Modal: 5 SECTIONS */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-base text-stone-900 uppercase">
                  {selectedReport ? `Relatório — ${reportForm.period}` : 'Novo Relatório Bimestral'}
                </h3>
                <p className="text-xs text-stone-500">Formulário Oficial de Prestação de Contas</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreFillFromEvangelisms}
                  className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded text-xs font-bold hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
                  title="Puxa contagens reais de evangelismos e contatos já cadastrados no banco"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Pré-Preencher do Banco</span>
                </button>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* SEÇÃO 1 — IDENTIFICAÇÃO */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-red-800 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Seção 1 — Identificação</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Regional *</label>
                  <select
                    value={reportForm.regionId || 'reg-sp'}
                    onChange={(e) => setReportForm({ ...reportForm, regionId: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                  >
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Bimestre de Referência *</label>
                  <select
                    value={reportForm.period || '5º Bimestre (Set/Out 2026)'}
                    onChange={(e) => setReportForm({ ...reportForm, period: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                  >
                    <option value="1º Bimestre (Jan/Fev 2026)">1º Bimestre (Jan/Fev 2026)</option>
                    <option value="2º Bimestre (Mar/Abr 2026)">2º Bimestre (Mar/Abr 2026)</option>
                    <option value="3º Bimestre (Mai/Jun 2026)">3º Bimestre (Mai/Jun 2026)</option>
                    <option value="4º Bimestre (Jul/Ago 2026)">4º Bimestre (Jul/Ago 2026)</option>
                    <option value="5º Bimestre (Set/Out 2026)">5º Bimestre (Set/Out 2026)</option>
                    <option value="6º Bimestre (Nov/Dez 2026)">6º Bimestre (Nov/Dez 2026)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Pastor / Igreja</label>
                  <input
                    type="text"
                    value={reportForm.churchResponsible || ''}
                    onChange={(e) => setReportForm({ ...reportForm, churchResponsible: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 2 — ATIVIDADES */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-red-800 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Seção 2 — Atividades Evangelísticas</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Evangelismos Realizados</label>
                  <input
                    type="number"
                    min={0}
                    value={reportForm.evangelismsCount || 0}
                    onChange={(e) => setReportForm({ ...reportForm, evangelismsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Soma de Participantes</label>
                  <input
                    type="number"
                    min={0}
                    value={reportForm.totalParticipantsSum || 0}
                    onChange={(e) => setReportForm({ ...reportForm, totalParticipantsSum: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Frequência Informada</label>
                  <input
                    type="text"
                    placeholder="Semanal (8 ações) ou Quinzenal (4 ações)"
                    value={reportForm.evangelismFrequencyActual || ''}
                    onChange={(e) => setReportForm({ ...reportForm, evangelismFrequencyActual: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-stone-700 mb-1">Descrição Detalhada das Atividades *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Relato consolidado dos locais alcançados, mobilização das equipes e dinâmicas de ação..."
                  value={reportForm.activitiesDescription || ''}
                  onChange={(e) => setReportForm({ ...reportForm, activitiesDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                />
              </div>
            </div>

            {/* SEÇÃO 3 — RESULTADOS */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-red-800 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Seção 3 — Resultados & Consolidação</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Pessoas Alcançadas</label>
                  <input
                    type="number"
                    min={0}
                    value={reportForm.totalSoulsReached || 0}
                    onChange={(e) => setReportForm({ ...reportForm, totalSoulsReached: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white font-bold text-red-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Contatos com Consentimento LGPD</label>
                  <input
                    type="number"
                    min={0}
                    value={reportForm.authorizedContactsCount || 0}
                    onChange={(e) => setReportForm({ ...reportForm, authorizedContactsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Encaminhados à Igreja</label>
                  <input
                    type="number"
                    min={0}
                    value={reportForm.activeFollowUpsCount || 0}
                    onChange={(e) => setReportForm({ ...reportForm, activeFollowUpsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-stone-700 mb-1">Resumo de Testemunhos Autorizados</label>
                <textarea
                  rows={2}
                  placeholder="Relatos de curas, libertações, famílias reconciliadas e acolhimento nas células/cultos..."
                  value={reportForm.testimoniesSummary || ''}
                  onChange={(e) => setReportForm({ ...reportForm, testimoniesSummary: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                />
              </div>
            </div>

            {/* SEÇÃO 4 — AVALIAÇÃO CRÍTICA */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-red-800 text-white flex items-center justify-center text-[10px]">4</span>
                <span>Seção 4 — Avaliação, Dificuldades e Necessidades</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Principais Pontos Fortes *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Engajamento, comunhão dos jovens, ousadia espiritual..."
                    value={reportForm.strengths || ''}
                    onChange={(e) => setReportForm({ ...reportForm, strengths: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Principais Dificuldades *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Transporte para bairros periféricos, caixas de som, falta de panfletos..."
                    value={reportForm.challenges || ''}
                    onChange={(e) => setReportForm({ ...reportForm, challenges: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Necessidades da Regional *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Envio dos 4 módulos físicos de estudo, camisetas oficiais, apoio pastoral..."
                    value={reportForm.regionalNeeds || ''}
                    onChange={(e) => setReportForm({ ...reportForm, regionalNeeds: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Melhorias e Planejamento Próximo Bimestre</label>
                  <textarea
                    rows={2}
                    placeholder="Expansão para novos bairros, vigília de oração, cruzada regional..."
                    value={reportForm.proposedImprovements || ''}
                    onChange={(e) => setReportForm({ ...reportForm, proposedImprovements: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 5 — ANEXOS */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-red-800 text-white flex items-center justify-center text-[10px]">5</span>
                <span>Seção 5 — Anexos & Registros</span>
              </h4>
              <p className="text-stone-500 text-[11px]">
                Fotografias, listas de presença e documentos oficiais anexados pelas regionais.
              </p>
              <div className="p-3 bg-white border border-dashed border-stone-300 rounded-lg text-center text-stone-500">
                <span>Arquivos e fotos integrados automaticamente aos evangelismos da regional.</span>
              </div>
            </div>

            {/* Actions footer */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 border border-stone-200 text-stone-700 rounded-lg font-bold text-xs"
              >
                Fechar
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveReport(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Salvar como Rascunho
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveReport(true)}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar para Direção Global</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal: Global Admin Feedback */}
      {isReviewModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900 uppercase">
                Parecer da Direção Global
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Decisão do Relatório *</label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white font-bold"
                >
                  <option value="approved">Aprovar Relatório Oficialmente</option>
                  <option value="returned">Devolver para Correção / Complementação</option>
                  <option value="in_review">Manter Em Análise</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Parecer e Orientações Ministeriais *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Insira as observações, elogios ou solicitações de ajuste da Direção Global..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold uppercase tracking-wider"
                >
                  Registrar Parecer Oficial
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
              <span className="text-xs font-bold text-stone-500 uppercase">Visualização de Exportação</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 rounded-md text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="space-y-6 font-sans">
              <div className="text-center pb-4 border-b-2 border-stone-900">
                <h1 className="text-xl font-black uppercase text-stone-900">
                  SEMEADORES DE FOGO GLOBAL
                </h1>
                <p className="text-xs font-bold text-red-700 tracking-widest uppercase">
                  Relatório Bimestral de Prestação de Contas Ministerial
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Período: {selectedReport.period} • Ano: {selectedReport.year} • Status: {selectedReport.status.toUpperCase()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-b border-stone-200 pb-4">
                <div>
                  <span className="text-stone-500 block">Regional Responsável:</span>
                  <span className="font-bold text-stone-900">{selectedReport.regionId}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Coordenador:</span>
                  <span className="font-bold text-stone-900">{selectedReport.coordinatorName}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Igreja / Pastor:</span>
                  <span className="font-bold text-stone-900">{selectedReport.churchResponsible} ({selectedReport.pastorResponsible})</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Frequência das Ações:</span>
                  <span className="font-bold text-stone-900">{selectedReport.evangelismFrequencyActual}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center bg-stone-50 p-3 rounded-lg border border-stone-200 text-xs">
                <div>
                  <span className="text-stone-500 block text-[10px]">Ações Realizadas</span>
                  <span className="font-extrabold text-base text-stone-900">{selectedReport.evangelismsCount}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Participantes</span>
                  <span className="font-extrabold text-base text-stone-900">{selectedReport.totalParticipantsSum}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Almas Alcançadas</span>
                  <span className="font-extrabold text-base text-red-700">{selectedReport.totalSoulsReached}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Contatos LGPD</span>
                  <span className="font-extrabold text-base text-emerald-700">{selectedReport.authorizedContactsCount}</span>
                </div>
              </div>

              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <h4 className="font-bold uppercase text-stone-900 border-b border-stone-200 pb-1 mb-1">
                    Atividades Desenvolvidas
                  </h4>
                  <p className="text-stone-700">{selectedReport.activitiesDescription}</p>
                </div>

                <div>
                  <h4 className="font-bold uppercase text-stone-900 border-b border-stone-200 pb-1 mb-1">
                    Testemunhos Registrados
                  </h4>
                  <p className="text-stone-700">{selectedReport.testimoniesSummary || 'Nenhum testemunho registrado no período.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold uppercase text-stone-900 border-b border-stone-200 pb-1 mb-1">
                      Pontos Fortes
                    </h4>
                    <p className="text-stone-700">{selectedReport.strengths}</p>
                  </div>
                  <div>
                    <h4 className="font-bold uppercase text-stone-900 border-b border-stone-200 pb-1 mb-1">
                      Dificuldades Encontradas
                    </h4>
                    <p className="text-stone-700">{selectedReport.challenges}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold uppercase text-stone-900 border-b border-stone-200 pb-1 mb-1">
                    Necessidades da Regional & Propostas
                  </h4>
                  <p className="text-stone-700">{selectedReport.regionalNeeds}</p>
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
