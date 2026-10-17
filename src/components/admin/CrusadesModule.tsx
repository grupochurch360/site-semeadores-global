import React, { useEffect, useState } from 'react';
import {
  CalendarCheck2,
  MapPin,
  Users,
  CheckSquare,
  Clock,
  Sparkles,
  Plus,
  Flame,
  Shield,
  Music,
  Truck,
  Building
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { CrusadeEvent, CrusadeChecklistItem } from '../../types/index.ts';

export const CrusadesModule: React.FC = () => {
  const [crusades, setCrusades] = useState<CrusadeEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getCrusades().then(setCrusades).finally(() => setLoading(false));
  }, []);

  const handleToggleChecklist = (crusadeId: string, itemId: string) => {
    setCrusades(prev => prev.map(c => {
      if (c.id !== crusadeId) return c;
      const updatedList = c.checklist.map(item => {
        if (item.id === itemId) return { ...item, completed: !item.completed };
        return item;
      });
      return { ...c, checklist: updatedList };
    }));
  };

  const crusade = crusades[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-red-700 text-xs font-bold uppercase tracking-wider">
            Grandes Mobilizações & Intercâmbios
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase mt-0.5">
            Cruzadas Evangelísticas & Eventos
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Coordenação de palco, som, caravanas regionais e checklist operacional padronizado.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-stone-500">Carregando cruzadas...</div>
      ) : !crusade ? (
        <div className="py-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
          Nenhuma cruzada cadastrada no momento.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Crusade Banner */}
          <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-red-950 rounded-2xl p-6 text-white border border-stone-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-700 text-white">
                Mobilização Global Programada
              </span>
              <span className="text-xs font-mono text-stone-300">
                Data Prevista: {crusade.startDate} a {crusade.endDate}
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-white">{crusade.title}</h3>
              <p className="text-xs text-stone-300 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{crusade.venue} — {crusade.city} / {crusade.state}</span>
                <span>• Coordenação: {crusade.coordinator}</span>
              </p>
            </div>

            {/* Teams Counts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stone-800 text-xs">
              <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Intercessão 24h</span>
                <span className="text-lg font-black text-amber-400">{crusade.intercessionTeamCount} intercessores</span>
              </div>
              <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Ministério de Louvor</span>
                <span className="text-lg font-black text-blue-400">{crusade.worshipTeamCount} ministros</span>
              </div>
              <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Semeadores de Campo</span>
                <span className="text-lg font-black text-red-400">{crusade.evangelismTeamCount} evangelistas</span>
              </div>
              <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Orçamento Estimado</span>
                <span className="text-lg font-black text-emerald-400">R$ {crusade.budgetEstimate.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* Operational Checklist (Section 12 Reusable Standard) */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-bold text-stone-900 text-sm uppercase">
                  Checklist Operacional Padrão dos Semeadores
                </h3>
                <p className="text-xs text-stone-500">
                  Modelo reutilizável para realização de cruzadas em todas as regionais
                </p>
              </div>
              <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
                {crusade.checklist.filter(i => i.completed).length} / {crusade.checklist.length} concluídos
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {crusade.checklist.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist(crusade.id, item.id)}
                      className="mt-0.5 rounded text-red-700 focus:ring-red-600"
                    />
                    <div>
                      <span className={`font-semibold block ${item.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                        {item.task}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Categoria: <strong>{item.category}</strong> • Responsável: {item.assignee}
                      </span>
                    </div>
                  </label>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    item.completed ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {item.completed ? 'Pronto' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
