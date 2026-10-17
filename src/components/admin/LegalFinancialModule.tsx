import React, { useEffect, useState } from 'react';
import {
  Coins,
  ShieldCheck,
  Scale,
  FileText,
  Building,
  CheckCircle2,
  Clock,
  Globe,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { LegalFinancialRecord } from '../../types/index.ts';

export const LegalFinancialModule: React.FC = () => {
  const [records, setRecords] = useState<LegalFinancialRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getLegalRecords().then(setRecords).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-red-700 text-xs font-bold uppercase tracking-wider">
            Conformidade & Patrimônio
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase mt-0.5">
            Administração Financeira & Jurídica
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Controle orçamentário de cruzadas, diretrizes de custeio de viagens, pesquisa INPI e ativos digitais.
          </p>
        </div>
      </div>

      {/* Guidelines Notice from Meeting */}
      <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-700 flex items-start gap-3">
        <Scale className="w-5 h-5 text-stone-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold uppercase text-[11px] text-stone-900">Diretriz da Reunião de 16/10/2026</h4>
          <p className="leading-relaxed">
            O ministério utilizará conta bancária e personalidade jurídica próprias. Conforme deliberação da liderança, não há integração ou transação bancária direta nesta fase antes da conclusão formal da assessoria jurídica.
          </p>
        </div>
      </div>

      {/* Records Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {records.map((rec) => (
          <div key={rec.id} className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                  {rec.category.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {rec.status}
                </span>
              </div>

              <h3 className="font-bold text-stone-900 text-sm leading-snug">{rec.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{rec.details}</p>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Responsável: <strong>{rec.responsiblePerson}</strong></span>
              <span className="font-mono text-[10px]">{rec.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
