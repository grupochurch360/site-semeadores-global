import React, { useEffect, useState } from 'react';
import {
  Plus,
  Calendar,
  List,
  MapPin,
  Users,
  Search,
  FileCheck,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { EvangelismEvent, EvangelismType, Region } from '../../types/index.ts';

function safeInt(value: string): number {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

export const EvangelismsModule: React.FC = () => {
  const { activeRegionFilter } = useAuth();
  const [events, setEvents] = useState<EvangelismEvent[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EvangelismEvent | null>(null);

  const [planForm, setPlanForm] = useState<Partial<EvangelismEvent>>({
    title: '',
    regionId: activeRegionFilter === 'all' ? 'reg-sp' : activeRegionFilter,
    scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    location: '',
    address: '',
    actionType: 'rua',
    plannedParticipants: 15,
    observations: '',
  });

  const [completeForm, setCompleteForm] = useState<Partial<EvangelismEvent>>({
    actualParticipants: 15,
    soulsReached: 30,
    authorizedContacts: 10,
    generalReport: '',
    positives: '',
    challenges: '',
    testimonies: [''],
    suggestions: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((curr) => (curr === msg ? null : curr)), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, regionsData] = await Promise.all([
        api.getEvangelisms(activeRegionFilter === 'all' ? undefined : activeRegionFilter),
        api.getRegions(),
      ]);
      setEvents(eventsData);
      setRegions(regionsData);
    } catch (err) {
      console.error('Erro ao buscar evangelismos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRegionFilter]);

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setModalError(null);
      await api.createEvangelism({
        ...planForm,
        regionId: planForm.regionId || (activeRegionFilter !== 'all' ? activeRegionFilter : 'reg-sp'),
      });
      setIsPlanModalOpen(false);
      showToast('Evangelismo agendado com sucesso!');
      await loadData();
    } catch (err: any) {
      setModalError(err?.message || 'Erro ao agendar evangelismo');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenComplete = (event: EvangelismEvent) => {
    setModalError(null);
    setSelectedEvent(event);
    setCompleteForm({
      actualParticipants: event.actualParticipants || event.plannedParticipants,
      soulsReached: event.soulsReached || 20,
      authorizedContacts: event.authorizedContacts || 8,
      generalReport: event.generalReport || '',
      positives: event.positives || '',
      challenges: event.challenges || '',
      testimonies: event.testimonies && event.testimonies.length > 0 ? event.testimonies : [''],
      suggestions: event.suggestions || '',
    });
    setIsCompleteModalOpen(true);
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      setSaving(true);
      setModalError(null);
      await api.updateEvangelism(selectedEvent.id, {
        ...completeForm,
        status: 'completed',
        completedAt: new Date().toISOString(),
        testimonies: completeForm.testimonies?.filter((t) => t.trim().length > 0) || [],
      });
      setIsCompleteModalOpen(false);
      showToast('Resultados registrados e sincronizados!');
      await loadData();
    } catch (err: any) {
      setModalError(err?.message || 'Erro ao registrar resultados do evangelismo');
    } finally {
      setSaving(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.leaderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || ev.actionType === filterType;
    return matchesSearch && matchesType;
  });

  const completedEvents = filteredEvents.filter((e) => e.status === 'completed');
  const plannedCount = filteredEvents.filter((e) => e.status !== 'completed').length;
  const totalSouls = completedEvents.reduce((acc, e) => acc + (e.soulsReached || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[#141210] text-white px-4 py-3 rounded-xl shadow-xl border border-stone-700 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#DCE5ED]">
        <div>
          <span className="section-kicker">
            Ações de Campo & Rua
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B2946] tracking-tight mt-1">
            Módulo de Evangelismos
          </h2>
          <p className="text-xs text-[#586E84] mt-1">
            Planejamento, mobilização e consolidação dos testemunhos e almas alcançadas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-white p-1 rounded-xl border border-[#DCE5ED]">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list' ? 'bg-[#061A2D] text-white' : 'text-[#586E84]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'calendar' ? 'bg-[#061A2D] text-white' : 'text-[#586E84]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          <button
            onClick={() => {
              setModalError(null);
              setIsPlanModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#ED801F] hover:bg-[#d86f12] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Evangelismo</span>
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#E7E2DA] p-4">
          <span className="text-[11px] font-medium text-stone-500 block">Ações listadas</span>
          <span className="text-2xl font-extrabold text-[#141210] tabular-nums mt-1 block">
            {filteredEvents.length}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-[#E7E2DA] p-4">
          <span className="text-[11px] font-medium text-stone-500 block">Concluídas</span>
          <span className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-1 block">
            {completedEvents.length}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-[#E7E2DA] p-4">
          <span className="text-[11px] font-medium text-stone-500 block">Planejadas</span>
          <span className="text-2xl font-extrabold text-sky-700 tabular-nums mt-1 block">
            {plannedCount}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-[#E7E2DA] p-4">
          <span className="text-[11px] font-medium text-stone-500 block">Almas alcançadas</span>
          <span className="text-2xl font-extrabold text-red-700 tabular-nums mt-1 block">
            {totalSouls.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, ponto de ação, endereço ou líder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 text-xs bg-white border border-[#E7E2DA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs py-2.5 px-3.5 bg-white border border-[#E7E2DA] rounded-xl text-stone-700 font-medium focus:outline-hidden w-full sm:w-auto cursor-pointer"
        >
          <option value="all">Todos os Tipos de Ação</option>
          <option value="rua">Rua & Calçadão</option>
          <option value="praca">Praça Pública</option>
          <option value="hospital">Hospitalar & Enfermarias</option>
          <option value="escola_universidade">Escola / Universidade</option>
          <option value="presidio">Presídio</option>
          <option value="impacto_noturno">Impacto Noturno</option>
          <option value="casa_em_casa">Casa em Casa</option>
        </select>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 text-center text-xs text-stone-500 flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-red-700" />
              <span>Carregando ações evangelísticas...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-14 text-center text-xs text-stone-500 bg-white rounded-2xl border border-[#E7E2DA]">
              Nenhum evangelismo cadastrado para os filtros selecionados.
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const reg = regions.find((r) => r.id === ev.regionId);
              const isDone = ev.status === 'completed';
              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-2xl border border-[#E7E2DA] p-5 hover:border-stone-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-sky-50 text-sky-800 border-sky-200'
                        }`}
                      >
                        {isDone ? 'Ação Concluída' : 'Planejada / Confirmada'}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {ev.actionType}
                      </span>
                      {reg && (
                        <span className="text-xs font-medium text-stone-500">
                          • {reg.name.split('(')[0].trim()}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#141210]">{ev.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          {new Date(ev.scheduledDate).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{ev.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        <span>Líder: {ev.leaderName}</span>
                      </div>
                    </div>

                    {isDone && ev.generalReport && (
                      <p className="text-xs text-stone-600 bg-[#FAF8F5] p-3 rounded-xl border border-[#E7E2DA] leading-relaxed">
                        <strong className="text-stone-800">Relato da Ação:</strong> {ev.generalReport}
                      </p>
                    )}
                  </div>

                  <div className="md:text-right shrink-0 flex flex-col md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                    {isDone ? (
                      <div className="flex md:flex-col gap-4 md:gap-1 text-xs tabular-nums">
                        <div>
                          <span className="text-stone-500 text-[11px]">Almas Alcançadas: </span>
                          <span className="font-extrabold text-red-700 text-sm">
                            {ev.soulsReached || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500 text-[11px]">Contatos LGPD: </span>
                          <span className="font-bold text-emerald-700">
                            {ev.authorizedContacts || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500 text-[11px]">Semeadores: </span>
                          <span className="font-bold text-[#141210]">
                            {ev.actualParticipants || 0}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenComplete(ev)}
                        className="px-4 py-2 bg-[#141210] hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Preencher Resultados</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Calendar / Agenda View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-[#E7E2DA] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
            <h3 className="font-bold text-[#141210] text-sm">
              Agenda de Mobilizações Evangelísticas
            </h3>
            <span className="text-xs text-stone-500 font-medium">Horário Oficial de Brasília</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full tabular-nums">
                    {new Date(ev.scheduledDate).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-stone-500">
                    {ev.actionType}
                  </span>
                </div>
                <h4 className="font-bold text-[#141210] text-xs line-clamp-1">{ev.title}</h4>
                <p className="text-[11px] text-stone-500 truncate">{ev.location}</p>
                <div className="pt-2 border-t border-[#E7E2DA] flex items-center justify-between text-[11px]">
                  <span className="text-stone-600 tabular-nums">
                    Previstos: {ev.plannedParticipants}
                  </span>
                  <span
                    className={
                      ev.status === 'completed'
                        ? 'text-emerald-700 font-bold'
                        : 'text-sky-700 font-bold'
                    }
                  >
                    {ev.status === 'completed' ? 'Realizado' : 'A realizar'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Agendar Evangelismo */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA] mb-4">
              <h3 className="font-bold text-base text-[#141210]">Agendar Novo Evangelismo</h3>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlanSubmit} className="space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Regional Responsável *
                </label>
                <select
                  value={planForm.regionId || 'reg-sp'}
                  onChange={(e) => setPlanForm({ ...planForm, regionId: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl bg-white"
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Título da Mobilização *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Impacto Profético & Evangelismo Sobrenatural"
                  value={planForm.title || ''}
                  onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Data e Horário *</label>
                  <input
                    type="datetime-local"
                    required
                    value={planForm.scheduledDate || ''}
                    onChange={(e) => setPlanForm({ ...planForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tipo de Ação</label>
                  <select
                    value={planForm.actionType || 'rua'}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, actionType: e.target.value as EvangelismType })
                    }
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl bg-white"
                  >
                    <option value="rua">Rua & Calçadão</option>
                    <option value="praca">Praça Pública</option>
                    <option value="hospital">Hospitalar & Enfermarias</option>
                    <option value="escola_universidade">Escola / Universidade</option>
                    <option value="presidio">Presídio</option>
                    <option value="impacto_noturno">Impacto Noturno</option>
                    <option value="casa_em_casa">Casa em Casa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Local / Ponto de Encontro *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Praça da Sé, Vão do Masp, Portão 3 do Ibirapuera"
                  value={planForm.location || ''}
                  onChange={(e) => setPlanForm({ ...planForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro e referência"
                  value={planForm.address || ''}
                  onChange={(e) => setPlanForm({ ...planForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Previsão de Participantes
                </label>
                <input
                  type="number"
                  min={1}
                  value={planForm.plannedParticipants ?? 15}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, plannedParticipants: safeInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Orientações para os Semeadores
                </label>
                <textarea
                  rows={2}
                  placeholder="Uso obrigatório de camiseta oficial, tênis confortável, garrafa d'água..."
                  value={planForm.observations || ''}
                  onChange={(e) => setPlanForm({ ...planForm, observations: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-[#E7E2DA] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 border border-[#E7E2DA] text-stone-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-xl font-semibold cursor-pointer"
                >
                  {saving ? 'Agendando...' : 'Agendar Ação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Preencher Resultados Pós-Ação */}
      {isCompleteModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA] mb-4">
              <div>
                <h3 className="font-bold text-base text-[#141210]">
                  Registrar Resultados do Evangelismo
                </h3>
                <p className="text-xs text-stone-500">{selectedEvent.title}</p>
              </div>
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Participantes Efetivos *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={completeForm.actualParticipants ?? 0}
                    onChange={(e) =>
                      setCompleteForm({
                        ...completeForm,
                        actualParticipants: safeInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Pessoas Alcançadas *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={completeForm.soulsReached ?? 0}
                    onChange={(e) =>
                      setCompleteForm({ ...completeForm, soulsReached: safeInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Contatos LGPD *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={completeForm.authorizedContacts ?? 0}
                    onChange={(e) =>
                      setCompleteForm({
                        ...completeForm,
                        authorizedContacts: safeInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Relato Geral da Ação *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva como foi a mobilização, aceitação do público e atuação dos semeadores..."
                  value={completeForm.generalReport || ''}
                  onChange={(e) =>
                    setCompleteForm({ ...completeForm, generalReport: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Pontos Fortes *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Unção, louvor, receptividade dos jovens..."
                    value={completeForm.positives || ''}
                    onChange={(e) => setCompleteForm({ ...completeForm, positives: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Dificuldades Encontradas *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Chuva, ruído de trânsito, falta de panfletos..."
                    value={completeForm.challenges || ''}
                    onChange={(e) =>
                      setCompleteForm({ ...completeForm, challenges: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Testemunho Marcante (Autorizado)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Oração por cura de dor nas costas, reconciliação de família..."
                  value={completeForm.testimonies?.[0] || ''}
                  onChange={(e) =>
                    setCompleteForm({ ...completeForm, testimonies: [e.target.value] })
                  }
                  className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Sugestões para Próximas Ações
                </label>
                <input
                  type="text"
                  placeholder="Levar mais água, som portátil com bateria maior..."
                  value={completeForm.suggestions || ''}
                  onChange={(e) =>
                    setCompleteForm({ ...completeForm, suggestions: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-[#E7E2DA] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 border border-[#E7E2DA] text-stone-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-semibold cursor-pointer"
                >
                  {saving ? 'Salvando...' : 'Salvar e Concluir Ação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
