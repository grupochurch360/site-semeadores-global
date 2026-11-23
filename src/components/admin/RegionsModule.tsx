import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Plus,
  Building2,
  Users,
  Clock,
  Phone,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { Region, RegionalFrequency, RegionalStatus } from '../../types/index.ts';

export const RegionsModule: React.FC = () => {
  const { canManageRegions } = useAuth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [formData, setFormData] = useState<Partial<Region>>({
    name: '',
    state: 'SP',
    city: '',
    churchName: '',
    pastorResponsible: '',
    coordinatorName: '',
    coordinatorEmail: '',
    coordinatorPhone: '',
    evangelismFrequency: 'weekly',
    status: 'active',
    notes: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((curr) => (curr === msg ? null : curr)), 3500);
  };

  const loadRegions = async () => {
    try {
      setLoading(true);
      const data = await api.getRegions();
      setRegions(data);
    } catch (err) {
      console.error('Erro ao buscar regionais:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegions();
  }, []);

  const handleOpenCreate = () => {
    setFormError(null);
    setSelectedRegion(null);
    setFormData({
      name: '',
      state: 'SP',
      city: '',
      churchName: '',
      pastorResponsible: '',
      coordinatorName: '',
      coordinatorEmail: '',
      coordinatorPhone: '',
      evangelismFrequency: 'weekly',
      status: 'active',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (region: Region) => {
    setFormError(null);
    setSelectedRegion(region);
    setFormData(region);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFormError(null);
      if (selectedRegion) {
        await api.updateRegion(selectedRegion.id, formData);
        showToast('Regional atualizada com sucesso!');
      } else {
        await api.createRegion(formData);
        showToast('Nova regional cadastrada com sucesso!');
      }
      setIsModalOpen(false);
      await loadRegions();
    } catch (err: any) {
      setFormError(err?.message || 'Erro ao salvar regional');
    } finally {
      setSaving(false);
    }
  };

  const filteredRegions = regions.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.churchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.coordinatorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = filteredRegions.filter((r) => r.status === 'active').length;
  const weeklyCount = filteredRegions.filter((r) => r.evangelismFrequency === 'weekly').length;
  const totalMembers = filteredRegions.reduce((acc, r) => acc + (r.membersCount || 0), 0);

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
            Estrutura Territorial
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B2946] tracking-tight mt-1">
            Gestão das Regionais
          </h2>
          <p className="text-xs text-[#586E84] mt-1">
            Cadastro, frequência evangelística oficial e supervisão de cada polo ministerial.
          </p>
        </div>

        {canManageRegions && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#061A2D] hover:bg-[#0A3D69] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#FFBD58]" />
            <span>Cadastrar Nova Regional</span>
          </button>
        )}
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[#E7E2DA] p-4">
          <span className="text-[11px] font-medium text-stone-500 block">Regionais listadas</span>
          <span className="text-2xl font-extrabold text-[#141210] tabular-nums mt-1 block">
            {filteredRegions.length}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-[#E7E2DA] p-4">
          <span className="text-[11px] font-medium text-stone-500 block">Em plena atividade</span>
          <span className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-1 block">
            {activeCount}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-[#E7E2DA] p-4">
          <span className="text-[11px] font-medium text-stone-500 block">Frequência semanal</span>
          <span className="text-2xl font-extrabold text-red-700 tabular-nums mt-1 block">
            {weeklyCount}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-[#E7E2DA] p-4">
          <span className="text-[11px] font-medium text-stone-500 block">Semeadores nas equipes</span>
          <span className="text-2xl font-extrabold text-[#141210] tabular-nums mt-1 block">
            {totalMembers}
          </span>
        </div>
      </div>

      {/* Strategic Rule Notice */}
      <div className="p-4 rounded-2xl bg-white border border-[#E7E2DA] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-stone-700">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-red-700 shrink-0" />
          <span>
            <strong>Regra Ministerial (16/10/2026):</strong> Igrejas menores realizam evangelismos{' '}
            <strong>quinzenais</strong>; regionais maiores mantêm ações <strong>semanais</strong>.
          </span>
        </div>
        <span className="text-[11px] font-semibold text-stone-500 bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E7E2DA] shrink-0">
          Configurável pela Direção Global
        </span>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, cidade, igreja ou coordenador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 text-xs bg-white border border-[#E7E2DA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs py-2.5 px-3.5 bg-white border border-[#E7E2DA] rounded-xl text-stone-700 font-medium focus:outline-hidden w-full sm:w-auto cursor-pointer"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativa</option>
          <option value="in_implantation">Em Implantação</option>
          <option value="paused">Pausada</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-stone-500 flex flex-col items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-red-700" />
          <span>Carregando regionais...</span>
        </div>
      ) : filteredRegions.length === 0 ? (
        <div className="py-14 text-center text-xs text-stone-500 bg-white rounded-2xl border border-[#E7E2DA]">
          Nenhuma regional encontrada para o filtro informado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRegions.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-[#E7E2DA] p-5 hover:border-stone-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      r.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : r.status === 'in_implantation'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {r.status === 'active'
                      ? 'Ativa'
                      : r.status === 'in_implantation'
                      ? 'Em Implantação'
                      : 'Pausada'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      r.evangelismFrequency === 'weekly'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {r.evangelismFrequency === 'weekly' ? 'Semanal' : 'Quinzenal'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#141210] mb-1">{r.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    {r.city} - {r.state}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600 py-3 border-y border-stone-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{r.churchName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>Pr. Responsável: {r.pastorResponsible}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{r.coordinatorPhone || 'Não informado'}</span>
                  </div>
                </div>

                {r.notes && (
                  <p className="text-[11px] text-stone-500 italic line-clamp-2 mb-4">"{r.notes}"</p>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="font-bold text-[#141210] tabular-nums">
                  {r.membersCount} semeadores
                </span>
                {canManageRegions && (
                  <button
                    onClick={() => handleOpenEdit(r)}
                    className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
                  >
                    Gerenciar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2DA] mb-4">
              <h3 className="font-bold text-base text-[#141210]">
                {selectedRegion ? 'Editar Regional' : 'Cadastrar Nova Regional'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nome da Regional *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Regional Minas Gerais (Belo Horizonte)"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Cidade *</label>
                  <input
                    type="text"
                    required
                    placeholder="Belo Horizonte"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Estado (UF) *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="MG"
                    value={formData.state || ''}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Igreja Responsável *</label>
                <input
                  type="text"
                  required
                  placeholder="Comunidade da Graça Central"
                  value={formData.churchName || ''}
                  onChange={(e) => setFormData({ ...formData, churchName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Pastor Responsável</label>
                  <input
                    type="text"
                    placeholder="Pr. Samuel Couto"
                    value={formData.pastorResponsible || ''}
                    onChange={(e) => setFormData({ ...formData, pastorResponsible: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Coordenador de Evangelismo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Pr. Samuel Couto"
                    value={formData.coordinatorName || ''}
                    onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Telefone de Contato</label>
                  <input
                    type="text"
                    placeholder="(31) 98234-5678"
                    value={formData.coordinatorPhone || ''}
                    onChange={(e) => setFormData({ ...formData, coordinatorPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">E-mail Institucional</label>
                  <input
                    type="email"
                    placeholder="contato.mg@semeadoresdefogo.org"
                    value={formData.coordinatorEmail || ''}
                    onChange={(e) => setFormData({ ...formData, coordinatorEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Frequência Estabelecida</label>
                  <select
                    value={formData.evangelismFrequency || 'weekly'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        evangelismFrequency: e.target.value as RegionalFrequency,
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl bg-white"
                  >
                    <option value="weekly">Semanal (Regionais maiores)</option>
                    <option value="biweekly">Quinzenal (Igrejas menores)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Situação da Regional</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as RegionalStatus })
                    }
                    className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl bg-white"
                  >
                    <option value="active">Ativa</option>
                    <option value="in_implantation">Em Implantação</option>
                    <option value="paused">Pausada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Observações Operacionais</label>
                <textarea
                  rows={2}
                  placeholder="Informações sobre porte da igreja, bairros de atuação, etc."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E7E2DA] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600/30"
                />
              </div>

              <div className="pt-3 border-t border-[#E7E2DA] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E7E2DA] text-stone-700 rounded-xl font-semibold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-xl font-semibold text-xs cursor-pointer"
                >
                  {saving ? 'Salvando...' : 'Salvar Regional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
