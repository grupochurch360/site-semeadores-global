import React, { useEffect, useState } from 'react';
import { History, X, Search, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { AuditLog } from '../../types/index.ts';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getAuditLogs().then(setLogs).finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(l =>
    l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[85vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-stone-700" />
            <h3 className="font-bold text-base text-stone-900 uppercase">
              Logs de Auditoria & Segurança
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por usuário ou ação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden"
          />
        </div>

        <div className="divide-y divide-stone-100 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-xs text-stone-500">Carregando logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">Nenhum log registrado.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="py-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">{log.userName}</span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="text-stone-600">
                  <span className="px-1.5 py-0.5 rounded bg-stone-100 text-[10px] font-mono font-bold mr-2">
                    {log.action}
                  </span>
                  <span>{log.details}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-stone-200 text-stone-700 rounded-lg font-bold text-xs hover:bg-stone-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
