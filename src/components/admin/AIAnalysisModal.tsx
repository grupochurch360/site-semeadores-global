import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { downloadReport, reportSections } from './reportContent';

export function AIAnalysisModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [period, setPeriod] = useState('5º Bimestre');
  const [revision, refresh] = useState(0);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof api.analyzeReports>
  > | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setResult(null);
    setError('');
    api
      .analyzeReports(period)
      .then((r) => {
        if (active) setResult(r);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [isOpen, period, revision]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Diagnóstico consolidado"
        className="flex h-dvh w-full max-w-3xl flex-col bg-white sm:h-[90dvh] sm:rounded-xl overflow-hidden"
      >
        <header className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-xl font-bold">Diagnóstico consolidado</h2>
          <button
            aria-label="Fechar diagnóstico"
            onClick={onClose}
            className="p-3"
          >
            ✕
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex-1 text-sm">
              Período
              <select
                className="mt-1 block w-full rounded border p-2"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="">Todos os bimestres</option>
                {[6, 5, 4, 3, 2, 1].map((n) => (
                  <option key={n}>{n}º Bimestre</option>
                ))}
              </select>
            </label>
            <button
              className="rounded border px-4 py-2"
              onClick={() => refresh((n) => n + 1)}
            >
              Atualizar
            </button>
          </div>
          {error && (
            <p role="alert" className="my-3 text-red-800">
              {error}
            </p>
          )}
          {!result && !error && (
            <p role="status" className="my-5">
              Gerando diagnóstico…
            </p>
          )}
          {result && (
            <>
              <p className="my-4 text-sm text-slate-600">
                {result.analyzedReportsCount} relatório(s) · {result.provider}
              </p>
              {reportSections(result.reportData).map((s, i) => (
                <section key={i} className="mb-5">
                  <h3 className="border-b border-slate-300 pb-2 text-lg font-bold">
                    {s.title}
                  </h3>
                  {s.rows.map(([label, text], j) => (
                    <div key={j} className="mt-3 break-words">
                      <h4 className="text-sm font-semibold">{label}</h4>
                      <p className="whitespace-pre-line text-sm leading-relaxed">
                        {text}
                      </p>
                    </div>
                  ))}
                </section>
              ))}
            </>
          )}
        </div>
        {result && (
          <footer className="border-t p-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
            <button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await downloadReport(result.reportData);
                } catch {
                  setError('Falha ao baixar o PDF. Tente novamente.');
                } finally {
                  setSaving(false);
                }
              }}
              className="w-full rounded-lg bg-[#071b2b] py-3 font-bold text-white"
            >
              {saving ? 'Preparando PDF…' : 'Baixar PDF'}
            </button>
          </footer>
        )}
      </section>
    </div>
  );
}
