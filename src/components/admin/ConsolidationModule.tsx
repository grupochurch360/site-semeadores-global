import React, { useEffect, useState } from 'react';
import {
  Users2,
  Plus,
  ShieldCheck,
  Search,
  Filter,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  UserCheck,
  Building,
  Clock,
  HeartHandshake,
  Lock,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { ConsolidationContact, ConsolidationStatus, Region } from '../../types/index.ts';

export const ConsolidationModule: React.FC = () => {
  const { currentUser, isAdmin, activeRegionFilter } = useAuth();
  const [contacts, setContacts] = useState<ConsolidationContact[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Contact Creation Modal
  const [isNewContactOpen, setIsNewContactOpen] = useState<boolean>(false);
  const [newContactForm, setNewContactForm] = useState<Partial<ConsolidationContact>>({
    fullName: '',
    phone: '',
    email: '',
    neighborhood: '',
    consentGranted: false,
    sensitiveReligiousConsentGranted: false,
    prayerRequests: '',
    regionId: activeRegionFilter === 'all' ? 'reg-sp' : activeRegionFilter,
    status: 'novo',
  });

  // Log interaction Drawer / Modal
  const [selectedContact, setSelectedContact] = useState<ConsolidationContact | null>(null);
  const [interactionForm, setInteractionForm] = useState<{
    type: 'ligacao' | 'whatsapp' | 'visita' | 'culto';
    notes: string;
    newStatus: ConsolidationStatus;
  }>({
    type: 'whatsapp',
    notes: '',
    newStatus: 'em_acompanhamento',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [contactsData, regionsData] = await Promise.all([
        api.getConsolidationContacts(activeRegionFilter === 'all' ? undefined : activeRegionFilter),
        api.getRegions(),
      ]);
      setContacts(contactsData);
      setRegions(regionsData);
    } catch (err) {
      console.error('Erro ao buscar contatos da consolidação:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRegionFilter]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactForm.consentGranted || !newContactForm.sensitiveReligiousConsentGranted) {
      alert('Conforme a LGPD, os dois termos de consentimento e acolhimento espiritual são estritamente obrigatórios.');
      return;
    }

    try {
      await api.createConsolidationContact({
        ...newContactForm,
        regionId: newContactForm.regionId || (activeRegionFilter !== 'all' ? activeRegionFilter : 'reg-sp'),
      });
      setIsNewContactOpen(false);
      setNewContactForm({
        fullName: '',
        phone: '',
        email: '',
        neighborhood: '',
        consentGranted: false,
        sensitiveReligiousConsentGranted: false,
        prayerRequests: '',
        regionId: activeRegionFilter === 'all' ? 'reg-sp' : activeRegionFilter,
        status: 'novo',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar contato');
    }
  };

  const handleLogInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;

    try {
      await api.logFollowUp(
        selectedContact.id,
        interactionForm.type,
        interactionForm.notes,
        interactionForm.newStatus
      );
      setInteractionForm({ type: 'whatsapp', notes: '', newStatus: 'em_acompanhamento' });
      setSelectedContact(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar acompanhamento');
    }
  };

  const statusMap: Record<ConsolidationStatus, { label: string; color: string }> = {
    novo: { label: 'Novo Contato', color: 'bg-stone-100 text-stone-800 border-stone-200' },
    aguardando_contato: { label: 'Aguardando 1º Contato', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    em_acompanhamento: { label: 'Em Acompanhamento', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    encaminhado_igreja: { label: 'Encaminhado à Igreja', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    concluido: { label: 'Acompanhamento Concluído', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    sem_interesse: { label: 'Sem Interesse', color: 'bg-stone-200 text-stone-600 border-stone-300' },
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.prayerRequests && c.prayerRequests.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate quick metrics
  const total = contacts.length;
  const inFollowUp = contacts.filter(c => c.status === 'em_acompanhamento').length;
  const referred = contacts.filter(c => c.status === 'encaminhado_igreja' || c.status === 'concluido').length;
  const pending = contacts.filter(c => c.status === 'aguardando_contato' || c.status === 'novo').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-red-700 text-xs font-bold uppercase tracking-wider">
              Discipulado & Acolhimento
            </span>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>LGPD Rigorosa</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase mt-0.5">
            Ministério de Consolidação
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Nenhum contato alcançado em campo é esquecido. Gestão segura de discipulado e encaminhamento local.
          </p>
        </div>

        <button
          onClick={() => setIsNewContactOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Contato com Termo</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold text-stone-500 uppercase">Total Cadastrado</span>
          <div className="text-2xl font-black text-stone-900 mt-1">{total}</div>
          <span className="text-[11px] text-stone-400">Contatos autorizados</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold text-amber-700 uppercase">Aguardando Contato</span>
          <div className="text-2xl font-black text-amber-800 mt-1">{pending}</div>
          <span className="text-[11px] text-amber-600">Ações pendentes</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold text-blue-700 uppercase">Em Acompanhamento</span>
          <div className="text-2xl font-black text-blue-800 mt-1">{inFollowUp}</div>
          <span className="text-[11px] text-blue-600">Recebendo oração/visita</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold text-emerald-700 uppercase">Encaminhados à Igreja</span>
          <div className="text-2xl font-black text-emerald-800 mt-1">{referred}</div>
          <span className="text-[11px] text-emerald-600">Integrados à comunidade</span>
        </div>
      </div>

      {/* LGPD Security Reminder */}
      <div className="p-3 bg-stone-100 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
        <Lock className="w-4 h-4 text-stone-500 shrink-0" />
        <span>
          <strong>Proteção de Dados:</strong> Conforme a LGPD (Lei 13.709/2018), informações de convicção religiosa são dados sensíveis. O acesso é restrito exclusivamente aos líderes de consolidação e à direção ministerial.
        </span>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou motivo de oração..."
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
          <option value="novo">Novo Contato</option>
          <option value="aguardando_contato">Aguardando Contato</option>
          <option value="em_acompanhamento">Em Acompanhamento</option>
          <option value="encaminhado_igreja">Encaminhado à Igreja</option>
          <option value="concluido">Acompanhamento Concluído</option>
          <option value="sem_interesse">Sem Interesse</option>
        </select>
      </div>

      {/* Contacts List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-stone-500">Carregando contatos de consolidação...</div>
      ) : filteredContacts.length === 0 ? (
        <div className="py-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
          Nenhum contato encontrado.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContacts.map((contact) => {
            const st = statusMap[contact.status] || { label: contact.status, color: 'bg-stone-100 text-stone-700' };
            const reg = regions.find(r => r.id === contact.regionId);

            return (
              <div
                key={contact.id}
                className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs hover:border-red-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${st.color}`}>
                      {st.label}
                    </span>
                    <span className="text-xs font-bold text-stone-900">{contact.fullName}</span>
                    {reg && (
                      <span className="text-[11px] text-stone-400">
                        • {reg.name.split('(')[0]}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      {contact.phone}
                    </span>
                    {contact.neighborhood && (
                      <span className="text-stone-500">{contact.neighborhood}</span>
                    )}
                    <span className="text-stone-500">
                      Responsável: <strong>{contact.assignedLeaderName}</strong>
                    </span>
                  </div>

                  {contact.prayerRequests && (
                    <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-md border border-stone-200/60">
                      <strong>Motivos de Oração:</strong> {contact.prayerRequests}
                    </p>
                  )}

                  {contact.interactions && contact.interactions.length > 0 && (
                    <div className="text-[11px] text-stone-500">
                      Último contato em {new Date(contact.interactions[contact.interactions.length - 1].date).toLocaleDateString('pt-BR')}: "{contact.interactions[contact.interactions.length - 1].notes}"
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                  <button
                    onClick={() => {
                      setSelectedContact(contact);
                      setInteractionForm({
                        type: 'whatsapp',
                        notes: '',
                        newStatus: contact.status,
                      });
                    }}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Registrar Contato</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Cadastro de Contato com LGPD */}
      {isNewContactOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900 uppercase">
                Cadastrar Contato de Evangelismo
              </h3>
              <button
                onClick={() => setIsNewContactOpen(false)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome da pessoa evangelizada"
                  value={newContactForm.fullName || ''}
                  onChange={(e) => setNewContactForm({ ...newContactForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98888-7777"
                    value={newContactForm.phone || ''}
                    onChange={(e) => setNewContactForm({ ...newContactForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Bairro / Cidade</label>
                  <input
                    type="text"
                    placeholder="Centro, São Paulo"
                    value={newContactForm.neighborhood || ''}
                    onChange={(e) => setNewContactForm({ ...newContactForm, neighborhood: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Motivo de Oração / Pedidos</label>
                <textarea
                  rows={2}
                  placeholder="Saúde, família, libertação, emprego..."
                  value={newContactForm.prayerRequests || ''}
                  onChange={(e) => setNewContactForm({ ...newContactForm, prayerRequests: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Strict LGPD Consent Checkboxes */}
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-900 block">
                  Termos Obrigatórios de Consentimento LGPD
                </span>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={newContactForm.consentGranted || false}
                    onChange={(e) => setNewContactForm({ ...newContactForm, consentGranted: e.target.checked })}
                    className="mt-0.5 rounded text-red-700 focus:ring-red-600"
                  />
                  <span className="text-[11px] text-stone-700">
                    O titular autorizou expressamente o contato telefônico e por mensagens para fins de acolhimento cristão.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={newContactForm.sensitiveReligiousConsentGranted || false}
                    onChange={(e) => setNewContactForm({ ...newContactForm, sensitiveReligiousConsentGranted: e.target.checked })}
                    className="mt-0.5 rounded text-red-700 focus:ring-red-600"
                  />
                  <span className="text-[11px] text-stone-700">
                    Consentimento específico para tratamento de dados sobre pedidos de oração e fé (Dado Pessoal Sensível - Art. 11 LGPD).
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewContactOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold uppercase tracking-wider"
                >
                  Salvar Contato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Interação de Acompanhamento */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-bold text-base text-stone-900 uppercase">
                  Registrar Acompanhamento
                </h3>
                <p className="text-xs text-stone-500">{selectedContact.fullName} ({selectedContact.phone})</p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogInteraction} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tipo de Interação *</label>
                  <select
                    value={interactionForm.type}
                    onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white"
                  >
                    <option value="whatsapp">Mensagem WhatsApp</option>
                    <option value="ligacao">Ligação Telefônica</option>
                    <option value="visita">Visita Pessoal</option>
                    <option value="culto">Presença em Culto/Célula</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Novo Status *</label>
                  <select
                    value={interactionForm.newStatus}
                    onChange={(e) => setInteractionForm({ ...interactionForm, newStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white font-bold"
                  >
                    <option value="em_acompanhamento">Em Acompanhamento</option>
                    <option value="encaminhado_igreja">Encaminhado à Igreja</option>
                    <option value="concluido">Acompanhamento Concluído</option>
                    <option value="sem_interesse">Sem Interesse em Continuar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Relato do Contato / Oração Realizada *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva a conversa, recepção da pessoa e próximos passos acordados..."
                  value={interactionForm.notes}
                  onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedContact(null)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold uppercase tracking-wider"
                >
                  Salvar Histórico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
