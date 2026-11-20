import React, { useState } from 'react';
import {
  Sparkles,
  X,
  RefreshCw,
  Download,
  ExternalLink,
  AlertCircle,
  FileCheck2,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../../services/api.ts';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    id: string;
    provider: string;
    html: string;
    analysis: string;
    analyzedReportsCount: number;
    dataFingerprint: string;
    timestamp: string;
  } | null>(null);
  const [targetPeriod, setTargetPeriod] = useState<string>('5º Bimestre');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await api.analyzeReports(targetPeriod);
      setAnalysisResult(res);
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar relatório oficial por IA');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (!analysisResult?.html) return;
    const blob = new Blob([analysisResult.html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadHtml = () => {
    if (!analysisResult?.html) return;
    const blob = new Blob([analysisResult.html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = (targetPeriod || 'consolidado').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.href = url;
    a.download = `relatorio-semeadores-${slug}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (analysisResult?.analysis) {
      navigator.clipboard.writeText(analysisResult.analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl max-h-[94vh] flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-800 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 uppercase">
                Relatório Oficial Consolidado por IA
              </h3>
              <p className="text-xs text-stone-500">
                Modelo oficial Semeadores de Fogo — atualizado automaticamente com os dados mais recentes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice of Strict Ministerial Integrity */}
        <div className="p-3 rounded-lg bg-stone-100 border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5 shrink-0">
          <AlertCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Regra Oficial:</strong> Todo relatório gerado segue o layout padrão A4 da plataforma (independentemente do modelo Gemini utilizado) e é sempre atualizado a partir dos dados reais mais recentes no banco.
          </p>
        </div>

        {/* Parameters Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-stone-700">Período de Análise:</span>
            <select
              value={targetPeriod}
              onChange={(e) => setTargetPeriod(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-md font-semibold text-stone-800 focus:outline-hidden"
            >
              <option value="5º Bimestre">5º Bimestre (Set/Out 2026)</option>
              <option value="4º Bimestre">4º Bimestre (Jul/Ago 2026)</option>
              <option value="">Todos os Bimestres Cadastrados</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gerando Relatório Atualizado...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>{analysisResult ? 'Atualizar Relatório com Novos Dados' : 'Gerar Relatório Oficial'}</span>
              </>
            )}
          </button>
        </div>

        {/* Results Area */}
        {analysisResult ? (
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 shrink-0">
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <FileCheck2 className="w-4 h-4 text-emerald-700" />
                <span>
                  Modelo: <strong>{analysisResult.provider}</strong> • {analysisResult.analyzedReportsCount} relatórios • Base{' '}
                  <code className="bg-stone-100 px-1 rounded text-[10px]">{analysisResult.dataFingerprint}</code>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenInNewTab}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir / Salvar PDF</span>
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar HTML</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[420px] border border-stone-200 rounded-xl overflow-hidden bg-stone-100">
              <iframe
                title="Prévia do Relatório Oficial Semeadores de Fogo"
                srcDoc={analysisResult.html}
                className="w-full h-full min-h-[420px] bg-white"
              />
            </div>
          </div>
        ) : (
          <div className="py-14 text-center text-stone-500 text-xs space-y-2">
            <p className="font-semibold text-stone-700">
              Clique em "Gerar Relatório Oficial" para montar o documento A4 atualizado.
            </p>
            <p>
              Sempre que novos relatórios regionais forem enviados ou editados, basta clicar novamente para atualizar o documento com os novos dados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
