import React, { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { LeadershipMeeting } from '../../types/index.ts';

export const MeetingsModule: React.FC = () => {
  const [meetings, setMeetings] = useState<LeadershipMeeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getMeetings().then(setMeetings).finally(() => setLoading(false));
  }, []);

  const meeting = meetings[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-red-700 text-xs font-bold uppercase tracking-wider">
            Governança & Alinhamento
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase mt-0.5">
            Reuniões Bimestrais de Alinhamento
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Rotina estabelecida na reunião de 16/10/2026 para sincronização dos coordenadores regionais.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-stone-500">Carregando reuniões...</div>
      ) : !meeting ? (
        <div className="py-12 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
          Nenhuma reunião registrada.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800">
                  Próxima Convocação Oficial
                </span>
                <h3 className="text-lg font-bold text-stone-900">{meeting.title}</h3>
              </div>
              <div className="text-right text-xs text-stone-500">
                <span className="flex items-center gap-1 font-bold text-stone-800">
                  <Calendar className="w-3.5 h-3.5 text-red-700" />
                  {new Date(meeting.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span>Coordenação: {meeting.coordinator}</span>
              </div>
            </div>

            {/* Pauta */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
                Pauta Oficial da Reunião
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-700 bg-stone-50 p-4 rounded-lg border border-stone-200/80">
                {meeting.agenda.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-700 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Participantes Convocados */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
                Líderes Convocados
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {meeting.attendees.map((person, idx) => (
                  <span key={idx} className="px-3 py-1 bg-stone-100 text-stone-800 rounded-md font-medium border border-stone-200">
                    {person}
                  </span>
                ))}
              </div>
            </div>

            {/* Encaminhamentos e Tarefas com Responsáveis */}
            <div className="pt-3 border-t border-stone-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
                Encaminhamentos & Prazos
              </h4>
              <div className="space-y-2">
                {meeting.actionItems.map((act) => (
                  <div key={act.id} className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-stone-900 block">{act.task}</span>
                      <span className="text-[11px] text-stone-500">
                        Responsável: <strong>{act.assignee}</strong> • Prazo: {act.deadline}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Pendente
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
