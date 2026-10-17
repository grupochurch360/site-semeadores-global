import React, { useEffect, useState } from 'react';
import {
  Flame,
  Plus,
  Calendar,
  List,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  HeartHandshake,
  UserCheck,
  Search,
  Filter,
  FileCheck,
  X,
  Camera,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { EvangelismEvent, EvangelismType, EvangelismStatus, Region } from '../../types/index.ts';

export const EvangelismsModule: React.FC = () => {
  const { currentUser, isAdmin, activeRegionFilter } = useAuth();
  const [events, setEvents] = useState<EvangelismEvent[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EvangelismEvent | null>(null);

  // Form for Planning
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

  // Form for Completion / Post-action
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
      await api.createEvangelism({
        ...planForm,
        regionId: planForm.regionId || (activeRegionFilter !== 'all' ? activeRegionFilter : 'reg-sp'),
      });
      setIsPlanModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao agendar evangelismo');
    }
  };

  const handleOpenComplete = (event: EvangelismEvent) => {
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
      await api.updateEvangelism(selectedEvent.id, {
        ...completeForm,
        status: 'completed',
        completedAt: new Date().toISOString(),
        testimonies: completeForm.testimonies?.filter(t => t.trim().length > 0) || [],
      });
      setIsCompleteModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar resultados do evangelismo');
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-red-700 text-xs font-bold uppercase tracking-wider">
            Ações de Campo & Rua
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase">
            Módulo de Evangelismos
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Planejamento, mobilização, execução e consolidação dos testemunhos e almas alcançadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-stone-100 p-1 rounded-lg border border-stone-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-white shadow-2xs text-stone-900 font-bold' : 'text-stone-500'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 ${
                viewMode === 'calendar' ? 'bg-white shadow-2xs text-stone-900 font-bold' : 'text-stone-500'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Mês</span>
            </button>
          </div>

          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Evangelismo</span>
          </button>
        </div>
      </div>

      {/* Search & Type Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, ponto de ação, endereço ou líder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs py-2 px-3 bg-white border border-stone-200 rounded-lg text-stone-700 focus:outline-hidden w-full sm:w-auto"
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
            <div className="py-12 text-center text-xs text-stone-500">Carregando ações evangelísticas...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
              Nenhum evangelismo cadastrado para os filtros selecionados.
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const reg = regions.find(r => r.id === ev.regionId);
              const isDone = ev.status === 'completed';
              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs hover:border-red-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}>
                        {isDone ? 'Ação Concluída' : 'Planejada / Confirmada'}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {ev.actionType}
                      </span>
                      {reg && (
                        <span className="text-[11px] font-semibold text-stone-500">
                          {reg.name.split('(')[0]}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-stone-900">{ev.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{new Date(ev.scheduledDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
                      <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200/60 leading-relaxed">
                        <strong>Relato da Ação:</strong> {ev.generalReport}
                      </p>
                    )}
                  </div>

                  {/* Results or Action Button */}
                  <div className="md:text-right shrink-0 flex flex-col md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                    {isDone ? (
                      <div className="flex md:flex-col gap-4 md:gap-1 text-xs">
                        <div>
                          <span className="text-stone-500 text-[11px]">Almas Alcançadas: </span>
                          <span className="font-extrabold text-red-700 text-sm">{ev.soulsReached || 0}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 text-[11px]">Contatos LGPD: </span>
                          <span className="font-bold text-emerald-700">{ev.authorizedContacts || 0}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 text-[11px]">Semeadores: </span>
                          <span className="font-bold text-stone-800">{ev.actualParticipants || 0}</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenComplete(ev)}
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
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

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
            <h3 className="font-bold text-stone-900 text-sm uppercase">
              Calendário Mensal de Mobilizações — Outubro de 2026
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              Horário Oficial de Brasília
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                    {new Date(ev.scheduledDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-stone-500">
                    {ev.actionType}
                  </span>
                </div>
                <h4 className="font-bold text-stone-900 text-xs line-clamp-1">{ev.title}</h4>
                <p className="text-[11px] text-stone-500 truncate">{ev.location}</p>
                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-stone-600">Previstos: {ev.plannedParticipants}</span>
                  <span className={ev.status === 'completed' ? 'text-emerald-700 font-bold' : 'text-blue-700 font-bold'}>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-bold text-base text-stone-900 uppercase">
                Agendar Novo Evangelismo
              </h3>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlanSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Regional Responsável *</label>
                <select
                  value={planForm.regionId || 'reg-sp'}
                  onChange={(e) => setPlanForm({ ...planForm, regionId: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Título da Mobilização *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Impacto Profético & Evangelismo Sobrenatural"
                  value={planForm.title || ''}
                  onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Data e Horário *</label>
                  <input
                    type="datetime-local"
                    required
                    value={planForm.scheduledDate || ''}
                    onChange={(e) => setPlanForm({ ...planForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tipo de Ação</label>
                  <select
                    value={planForm.actionType || 'rua'}
                    onChange={(e) => setPlanForm({ ...planForm, actionType: e.target.value as EvangelismType })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
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
                <label className="block font-bold text-stone-700 mb-1">Local / Ponto de Encontro *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Praça da Sé, Vão do Masp, Portão 3 do Ibirapuera"
                  value={planForm.location || ''}
                  onChange={(e) => setPlanForm({ ...planForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro e referência"
                  value={planForm.address || ''}
                  onChange={(e) => setPlanForm({ ...planForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Previsão de Participantes</label>
                <input
                  type="number"
                  min={1}
                  value={planForm.plannedParticipants || 15}
                  onChange={(e) => setPlanForm({ ...planForm, plannedParticipants: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Orientações para os Semeadores</label>
                <textarea
                  rows={2}
                  placeholder="Uso obrigatório de camiseta oficial, tênis confortável, garrafa d'água..."
                  value={planForm.observations || ''}
                  onChange={(e) => setPlanForm({ ...planForm, observations: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold uppercase tracking-wider"
                >
                  Agendar Ação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Preencher Resultados Pós-Ação */}
      {isCompleteModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div>
                <h3 className="font-bold text-base text-stone-900 uppercase">
                  Registrar Resultados do Evangelismo
                </h3>
                <p className="text-xs text-stone-500">{selectedEvent.title}</p>
              </div>
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Participantes Efetivos *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={completeForm.actualParticipants || 0}
                    onChange={(e) => setCompleteForm({ ...completeForm, actualParticipants: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Pessoas Alcançadas *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={completeForm.soulsReached || 0}
                    onChange={(e) => setCompleteForm({ ...completeForm, soulsReached: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Contatos com Consentimento LGPD *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={completeForm.authorizedContacts || 0}
                    onChange={(e) => setCompleteForm({ ...completeForm, authorizedContacts: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Relato Geral da Ação *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva como foi a mobilização, aceitação do público e atuação dos semeadores..."
                  value={completeForm.generalReport || ''}
                  onChange={(e) => setCompleteForm({ ...completeForm, generalReport: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Pontos Fortes *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Unção, louvor, receptividade dos jovens..."
                    value={completeForm.positives || ''}
                    onChange={(e) => setCompleteForm({ ...completeForm, positives: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Dificuldades Encontradas *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Chuva, ruído de trânsito, falta de panfletos..."
                    value={completeForm.challenges || ''}
                    onChange={(e) => setCompleteForm({ ...completeForm, challenges: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Testemunho Marcante (Autorizado)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Oração por cura de dor nas costas, reconciliação de família..."
                  value={completeForm.testimonies?.[0] || ''}
                  onChange={(e) => setCompleteForm({ ...completeForm, testimonies: [e.target.value] })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Sugestões para Próximas Ações</label>
                <input
                  type="text"
                  placeholder="Levar mais água, som portátil com bateria maior..."
                  value={completeForm.suggestions || ''}
                  onChange={(e) => setCompleteForm({ ...completeForm, suggestions: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold uppercase tracking-wider"
                >
                  Salvar e Concluir Ação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
