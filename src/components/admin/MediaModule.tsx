import React, { useEffect, useState } from 'react';
import {
  Film,
  Download,
  FileCheck,
  Image,
  Shirt,
  FileText,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { MediaAsset } from '../../types/index.ts';

export const MediaModule: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterCat, setFilterCat] = useState<string>('all');

  useEffect(() => {
    api.getMediaAssets().then(setAssets).finally(() => setLoading(false));
  }, []);

  const filteredAssets = filterCat === 'all'
    ? assets
    : assets.filter(a => a.category === filterCat);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-red-700 text-xs font-bold uppercase tracking-wider">
            Padronização Visual & Mídia
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 uppercase mt-0.5">
            Biblioteca de Materiais Oficiais
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Logotipo oficial preservado, manuais de aplicação, gabaritos de camisetas, bonés e panfletos para as regionais.
          </p>
        </div>
      </div>

      {/* Brand Preservation Directive Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold uppercase text-[11px]">Diretriz Ministerial de Identidade</h4>
          <p className="leading-relaxed">
            O símbolo oficial dos Semeadores de Fogo (relacionado à pomba e ao fogo) deve ser preservado rigorosamente conforme os arquivos fornecidos pela liderança. Não é permitida a alteração, redesenho ou despadronização nas regionais.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: 'all', label: 'Todos os Materiais' },
          { id: 'identidade', label: 'Identidade & Logotipo' },
          { id: 'vestuario', label: 'Camisetas & Bonés' },
          { id: 'panfletos', label: 'Panfletos Evangelísticos' },
          { id: 'redes_sociais', label: 'Redes Sociais' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCat(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              filterCat === tab.id
                ? 'bg-red-800 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Media Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs hover:border-red-300 transition-all flex flex-col justify-between"
          >
            <div className="h-44 bg-stone-100 overflow-hidden relative">
              <img
                src={asset.previewUrl}
                alt={asset.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-900/90 text-white backdrop-blur-xs">
                {asset.fileFormat}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 block">
                  {asset.category}
                </span>
                <h3 className="font-bold text-stone-900 text-sm mt-0.5">{asset.title}</h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {asset.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-400 font-mono text-[11px]">{asset.fileSize}</span>
                <button
                  onClick={() => alert(`Iniciando download do pacote oficial: ${asset.title}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-stone-300" />
                  <span>Baixar Arquivo</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
