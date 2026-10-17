import React, { useState } from 'react';
import {
  Flame,
  Shield,
  MapPin,
  GraduationCap,
  CalendarCheck2,
  Phone,
  Mail,
  ArrowRight,
  BookOpen,
  Users,
  HeartHandshake,
  CheckCircle2,
  Video,
  Lock,
  ChevronDown
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface InstitutionalLandingProps {
  onEnterPortal: () => void;
}

export const InstitutionalLanding: React.FC<InstitutionalLandingProps> = ({ onEnterPortal }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const regionals = [
    { name: 'São Paulo (SP)', church: 'Igreja Central da Fé & Missões', coordinator: 'Pr. Marcos Oliveira', frequency: 'Semanal' },
    { name: 'Minas Gerais (BH)', church: 'Comunidade da Graça Central', coordinator: 'Pr. Samuel Couto', frequency: 'Quinzenal' },
    { name: 'Rio de Janeiro (RJ)', church: 'Igreja Vida Nova em Cristo', coordinator: 'Pra. Débora Santos', frequency: 'Semanal' },
    { name: 'Paraná (Curitiba)', church: 'Igreja Manancial de Vida', coordinator: 'Pr. André Silveira', frequency: 'Quinzenal' },
    { name: 'Goiás (Goiânia)', church: 'Igreja Renovação Apostólica', coordinator: 'Pr. Thiago Viana', frequency: 'Quinzenal' },
  ];

  const modules = [
    { number: '1', title: 'Evangelismo Sobrenatural', desc: 'Pregação com autoridade nas ruas, oração por enfermos, milagres e palavras proféticas de sabedoria.' },
    { number: '2', title: 'Unção do Espírito', desc: 'Consagração pessoal, vida de santidade e sensibilidade à voz do Espírito Santo no campo de batalha.' },
    { number: '3', title: 'Dons do Espírito', desc: 'Discernimento de espíritos e ativação prática dos dons carismáticos durante abordagens evangelísticas.' },
    { number: '4', title: 'Paternidade Espiritual', desc: 'Acolhimento contínuo, consolidação, discipulado de novos convertidos e maturidade pastoral.' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-red-800 selection:text-white">
      {/* Public Institutional Top Navigation */}
      <nav className="sticky top-0 z-40 bg-stone-950 text-white border-b border-stone-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <BrandLogo variant="white" size="md" />

          <div className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-stone-300">
            <a href="#missao" className="hover:text-red-400 transition-colors">Missão</a>
            <a href="#regionais" className="hover:text-red-400 transition-colors">Regionais</a>
            <a href="#ensino" className="hover:text-red-400 transition-colors">Ensino & Formação</a>
            <a href="#cruzadas" className="hover:text-red-400 transition-colors">Cruzadas</a>
            <a href="#contato" className="hover:text-red-400 transition-colors">Contato</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterPortal}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-red-900/40 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Acessar Plataforma</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white py-24 sm:py-32 border-b border-stone-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-xs font-semibold tracking-wider uppercase mb-8">
            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Movimento Evangelístico & Formação Sobrenatural</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-tight mb-6">
            Levando o Fogo do <span className="text-red-500">Evangelho</span> às Ruas e às Nações
          </h1>

          <p className="text-lg sm:text-xl text-stone-300 font-normal max-w-3xl mx-auto mb-10 leading-relaxed">
            Plataforma oficial de coordenação ministerial dos Semeadores de Fogo Global.
            Padronizando processos, formando semeadores, acompanhando os frutos da colheita e
            expandindo regionais pelo Brasil e pelo mundo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterPortal}
              className="w-full sm:w-auto px-8 py-4 bg-red-700 hover:bg-red-800 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Portal de Gestão dos Líderes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#missao"
              className="w-full sm:w-auto px-8 py-4 bg-stone-800/80 hover:bg-stone-800 text-stone-200 font-semibold text-sm uppercase tracking-wider rounded-xl border border-stone-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>Conhecer a Visão</span>
            </a>
          </div>

          {/* Meeting Date Reference badge */}
          <div className="mt-14 inline-block px-4 py-1.5 rounded-md bg-stone-900/90 border border-stone-800 text-[11px] text-stone-400 font-mono">
            Diretrizes Estratégicas Estabelecidas em 16 de Outubro de 2026
          </div>
        </div>
      </section>

      {/* Missão e Visão */}
      <section id="missao" className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-red-700 text-xs font-bold uppercase tracking-widest">
              Fundamentos Ministeriais
            </span>
            <h2 className="text-3xl font-extrabold text-stone-950 mt-2 uppercase">
              Ordem, Unção e Frutos que Permanecem
            </h2>
            <p className="text-stone-600 mt-4 text-sm sm:text-base leading-relaxed">
              Os Semeadores de Fogo Global não atuam apenas com ações esporádicas. Construímos uma
              estrutura sólida que capacita a juventude, sustenta ações com intercessão contínua e
              garante a consolidação pastoral de cada pessoa alcançada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-6">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-3">Evangelismo nas Ruas</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Ações semanais e quinzenais em praças públicas, estações, portas de hospitais,
                universidades e impactos noturnos com oração por cura e reconciliação.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-stone-900 text-red-500 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-3">Formação de 3 Meses</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Escola intensiva gratuita para jovens, com encontros mensais via Zoom e estudo
                obrigatório dos 4 módulos físicos para alinhamento doutrinário.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-red-800 text-white flex items-center justify-center mb-6">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-3">Ministério de Consolidação</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Nenhum contato é esquecido. Equipes dedicadas acolhem, oram e realizam o encaminhamento
                às igrejas locais sob estrita conformidade com a LGPD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Regionais Ativas */}
      <section id="regionais" className="py-20 bg-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-red-700 text-xs font-bold uppercase tracking-widest">
                Presença em Expansão
              </span>
              <h2 className="text-3xl font-extrabold text-stone-950 mt-1 uppercase">
                Regionais Semeadores de Fogo
              </h2>
            </div>
            <p className="text-stone-600 text-xs sm:text-sm max-w-md mt-2 md:mt-0">
              *Igrejas menores realizam evangelismos quinzenais; regionais maiores mantêm frequência semanal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regionals.map((r, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs hover:border-red-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-stone-100 text-stone-700">
                    {r.name}
                  </span>
                  <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                    {r.frequency}
                  </span>
                </div>
                <h4 className="font-bold text-stone-900 text-base mb-1">{r.church}</h4>
                <p className="text-xs text-stone-500 mb-4">Liderança: {r.coordinator}</p>
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Em plena atividade</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ensino e Formação */}
      <section id="ensino" className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-red-700 text-xs font-bold uppercase tracking-widest">
              Capacitação Ministerial
            </span>
            <h2 className="text-3xl font-extrabold text-stone-950 mt-2 uppercase">
              Escola de Formação — 4 Módulos
            </h2>
            <p className="text-stone-600 mt-3 text-sm leading-relaxed">
              Curso trimestral estruturado para formar jovens evangelistas com profundidade bíblica e unção prática.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((m) => (
              <div key={m.number} className="p-6 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-red-800 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                    M{m.number}
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm mb-2">{m.title}</h4>
                  <p className="text-stone-600 text-xs leading-relaxed">{m.desc}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-stone-200/80 text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                  <span>Livro físico obrigatório</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-stone-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-700 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Treinamentos Mensais via Zoom</h4>
                <p className="text-xs text-stone-300 mt-0.5">
                  Aulas ao vivo para todos os matriculados com ministração dos líderes e envio de links oficiais.
                </p>
              </div>
            </div>
            <button
              onClick={onEnterPortal}
              className="px-6 py-2.5 bg-white text-stone-900 hover:bg-stone-100 font-bold text-xs uppercase tracking-wider rounded-lg shrink-0 cursor-pointer"
            >
              Acessar Módulo de Ensino
            </button>
          </div>
        </div>
      </section>

      {/* Cruzadas e Eventos */}
      <section id="cruzadas" className="py-20 bg-stone-950 text-white border-b border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-red-400 text-xs font-bold uppercase tracking-widest">
            Grandes Mobilizações
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2 uppercase">
            Cruzadas Evangelísticas & Intercâmbios
          </h2>
          <p className="text-stone-300 mt-4 text-sm leading-relaxed">
            Planejamento centralizado de grandes eventos em praças e arenas, com coordenação de
            intercessão, louvor, logística de caravanas e checklist operacional reutilizável.
          </p>

          <div className="mt-10 p-6 rounded-xl bg-stone-900 border border-stone-800 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-red-400">Em Preparação</span>
                <h4 className="text-lg font-bold text-white">Grande Cruzada de Fogo & Avivamento 2026</h4>
              </div>
              <span className="text-xs bg-red-950 text-red-300 border border-red-800 px-3 py-1 rounded-md font-mono">
                Dezembro / 2026
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Mobilização conjunta de todas as regionais com alvará municipal, equipe de intercessão 24h,
              10.000 convites padronizados e evangelismo em massa.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] text-stone-300">
              <span className="bg-stone-800 px-2.5 py-1 rounded">Logística & Som</span>
              <span className="bg-stone-800 px-2.5 py-1 rounded">Intercessão Contínua</span>
              <span className="bg-stone-800 px-2.5 py-1 rounded">Alojamento de Caravanas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contato e Rodapé */}
      <section id="contato" className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <span className="text-red-700 text-xs font-bold uppercase tracking-widest">
            Comunicação Oficial
          </span>
          <h2 className="text-2xl font-extrabold text-stone-950 mt-1 uppercase">
            Contato Institucional
          </h2>
          <p className="text-xs text-stone-500 mt-2 mb-8">
            *Dados institucionais em processo de validação pela liderança global.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-stone-700">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-700" />
              <span>contato@semeadoresdefogo.org</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-red-700" />
              <span>(11) 98765-4321</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <BrandLogo variant="white" size="sm" />
          <div className="text-xs text-stone-500 text-center md:text-right">
            <p>© 2026 Semeadores de Fogo Global. Todos os direitos reservados.</p>
            <p className="mt-1">Arquitetura de Gestão e Supervisão Ministerial desenhada em 16/10/2026.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
