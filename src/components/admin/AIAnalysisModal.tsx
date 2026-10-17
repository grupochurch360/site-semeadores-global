import React, { useState } from 'react';
import {
  Sparkles,
  X,
  RefreshCw,
  Copy,
  Check,
  Building,
  Brain,
  AlertCircle,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { api } from '../../services/api.ts';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [targetPeriod, setTargetPeriod] = useState<string>('5º Bimestre');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await api.analyzeReports(targetPeriod);
      setAnalysisResult(res);
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar análise de relatórios');
    } finally {
      setLoading(false);
    }
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
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-800 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900 uppercase">
                Inteligência Analítica de Relatórios
              </h3>
              <p className="text-xs text-stone-500">
                Diagnóstico administrativo bimestral assistido por IA (Gemini 3.8 Flash)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice of Strict Ministerial Integrity */}
        <div className="p-3 rounded-lg bg-stone-100 border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Diretriz do Ministério:</strong> A IA é uma ferramenta de organização, síntese de gargalos e leitura de indicadores. Ela <strong>não substitui</strong> a direção espiritual, oração ou o discernimento pastoral da liderança global. Os dados analisados são agregados do banco de dados oficial.
          </p>
        </div>

        {/* Parameters Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
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
                <span>Processando Diagnóstico...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Gerar Síntese Executiva</span>
              </>
            )}
          </button>
        </div>

        {/* Results Area */}
        {analysisResult ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-stone-500">
                Motor: <strong className="text-stone-800">{analysisResult.provider}</strong> • Relatórios processados: <strong>{analysisResult.analyzedReportsCount}</strong>
              </span>

              <button
                onClick={handleCopy}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Síntese'}</span>
              </button>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-5 rounded-xl text-xs leading-relaxed text-stone-800 space-y-3 font-sans whitespace-pre-wrap">
              {analysisResult.analysis}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-stone-200 p-8 space-y-3">
            <Brain className="w-8 h-8 text-stone-400 mx-auto" />
            <p className="max-w-md mx-auto text-stone-600">
              Clique em <strong>"Gerar Síntese Executiva"</strong> para tabular automaticamente os relatórios das regionais de SP, MG e RJ, detectar gargalos em comum (como caixas de som e material impresso) e preparar a pauta da próxima reunião de alinhamento global.
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-stone-200 text-stone-700 rounded-lg font-bold text-xs hover:bg-stone-50 cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
