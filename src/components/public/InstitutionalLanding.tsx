import React, { useState } from 'react';
import {
  Flame,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  BookOpen,
  HeartHandshake,
  CheckCircle2,
  Video,
  Lock,
  Menu,
  X,
  Calendar,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface InstitutionalLandingProps {
  onEnterPortal: () => void;
}

export const InstitutionalLanding: React.FC<InstitutionalLandingProps> = ({ onEnterPortal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const regionals = [
    {
      name: 'São Paulo (SP)',
      church: 'Igreja Central da Fé & Missões',
      coordinator: 'Pr. Marcos Oliveira',
      frequency: 'Semanal',
    },
    {
      name: 'Minas Gerais (BH)',
      church: 'Comunidade da Graça Central',
      coordinator: 'Pr. Samuel Couto',
      frequency: 'Quinzenal',
    },
    {
      name: 'Rio de Janeiro (RJ)',
      church: 'Igreja Vida Nova em Cristo',
      coordinator: 'Pra. Débora Santos',
      frequency: 'Semanal',
    },
    {
      name: 'Paraná (Curitiba)',
      church: 'Igreja Manancial de Vida',
      coordinator: 'Pr. André Silveira',
      frequency: 'Quinzenal',
    },
    {
      name: 'Goiás (Goiânia)',
      church: 'Igreja Renovação Apostólica',
      coordinator: 'Pr. Thiago Viana',
      frequency: 'Quinzenal',
    },
  ];

  const modules = [
    {
      number: '1',
      title: 'Evangelismo Sobrenatural',
      desc: 'Pregação com autoridade nas ruas, oração por enfermos, milagres e palavras proféticas de sabedoria.',
    },
    {
      number: '2',
      title: 'Unção do Espírito',
      desc: 'Consagração pessoal, vida de santidade e sensibilidade à voz do Espírito Santo no campo de batalha.',
    },
    {
      number: '3',
      title: 'Dons do Espírito',
      desc: 'Discernimento de espíritos e ativação prática dos dons carismáticos durante abordagens evangelísticas.',
    },
    {
      number: '4',
      title: 'Paternidade Espiritual',
      desc: 'Acolhimento contínuo, consolidação, discipulado de novos convertidos e maturidade pastoral.',
    },
  ];

  const navLinks = [
    { href: '#missao', label: 'Missão' },
    { href: '#regionais', label: 'Regionais' },
    { href: '#ensino', label: 'Ensino' },
    { href: '#cruzadas', label: 'Cruzadas' },
    { href: '#contato', label: 'Contato' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141210] selection:bg-red-800 selection:text-white">
      {/* Public Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/92 backdrop-blur-md border-b border-[#E7E2DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          <a href="#" className="shrink-0" aria-label="Semeadores de Fogo - Início">
            <BrandLogo variant="dark" size="sm" showSubtitle={true} />
          </a>

          <nav className="hidden md:flex items-center gap-4 lg:gap-7 text-xs font-semibold text-stone-700" aria-label="Navegação institucional">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-red-700 transition-colors py-1 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onEnterPortal}
              className="inline-flex items-center gap-1.5 px-3.5 lg:px-5 py-2 sm:py-2.5 bg-[#141210] hover:bg-red-800 text-white rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="hidden sm:inline">Acessar Plataforma</span>
              <span className="sm:hidden">Entrar</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="p-2 rounded-lg border border-[#E7E2DA] bg-white text-stone-700 md:hidden cursor-pointer"
              aria-label={mobileMenuOpen ? 'Fechar navegação' : 'Abrir navegação'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E7E2DA] bg-white px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:bg-[#FAF8F5] hover:text-red-700"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Editorial Asymmetric Hero */}
      <section className="border-b border-[#E7E2DA] py-14 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E7E2DA] text-xs font-semibold text-red-800">
              <Flame className="w-3.5 h-3.5 text-red-700 shrink-0" />
              <span>Movimento Evangelístico & Formação Ministerial</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-[#141210] tracking-tight leading-[1.12] max-w-2xl">
              Levando o evangelho às ruas com ordem, unção e cuidado pastoral.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
              Plataforma oficial de coordenação dos Semeadores de Fogo Global. Estruturamos ações
              evangelísticas regulares, capacitamos equipes e acompanhamos cada pessoa alcançada em
              todas as regionais.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onEnterPortal}
                className="px-6 py-3.5 bg-red-700 hover:bg-red-800 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Portal de Gestão dos Líderes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#missao"
                className="px-6 py-3.5 bg-white hover:bg-stone-100 text-[#141210] font-semibold text-sm rounded-xl border border-[#E7E2DA] transition-colors flex items-center justify-center"
              >
                Conhecer a Visão
              </a>
            </div>

            <div className="pt-4 border-t border-[#E7E2DA] flex flex-wrap gap-x-8 gap-y-2 text-xs text-stone-600">
              <span>
                <strong className="text-[#141210] font-bold">5 regionais</strong> em operação
              </span>
              <span>
                <strong className="text-[#141210] font-bold">4 módulos</strong> de formação
              </span>
              <span>
                <strong className="text-[#141210] font-bold">Consolidação</strong> sob conformidade LGPD
              </span>
            </div>
          </div>

          {/* Structured Ministerial Charter Panel */}
          <div className="lg:col-span-5">
            <div className="bg-[#141210] text-white rounded-2xl p-6 sm:p-8 border border-stone-800 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div>
                  <span className="text-[11px] font-semibold text-amber-300">
                    Diretrizes Oficiais
                  </span>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    Frentes de Atuação Global
                  </h2>
                </div>
                <span className="text-[11px] text-stone-400 tabular-nums">16/10/2026</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5 text-sm font-bold text-white">
                    <Flame className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Evangelismo nas Ruas</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                    Ações semanais e quinzenais em praças, estações, hospitais e universidades com
                    registro estruturado de resultados.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5 text-sm font-bold text-white">
                    <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Formação Intensiva de 3 Meses</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                    Escola gratuita com encontros mensais ao vivo via Zoom e estudo dos 4 módulos
                    físicos oficiais.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5 text-sm font-bold text-white">
                    <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Consolidação & Prestação de Contas</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                    Acolhimento pastoral pós-ação, encaminhamento às igrejas locais e relatórios
                    bimestrais homologados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Missão e Visão */}
      <section id="missao" className="py-16 sm:py-20 bg-white border-b border-[#E7E2DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-red-700 text-xs font-bold tracking-wide">
              Fundamentos Ministeriais
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141210] tracking-tight mt-1">
              Ordem, unção e frutos que permanecem
            </h2>
            <p className="text-stone-600 mt-3 text-sm sm:text-base leading-relaxed">
              Os Semeadores de Fogo Global não atuam apenas com ações esporádicas. Construímos uma
              estrutura sólida que capacita a juventude, sustenta ações com intercessão contínua e
              garante a consolidação pastoral de cada pessoa alcançada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA]">
              <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-5">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#141210] mb-2">Evangelismo nas Ruas</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Ações semanais e quinzenais em praças públicas, estações, portas de hospitais,
                universidades e impactos noturnos com oração por cura e reconciliação.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA]">
              <div className="w-11 h-11 rounded-xl bg-[#141210] text-amber-300 flex items-center justify-center mb-5">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#141210] mb-2">Formação de 3 Meses</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Escola intensiva gratuita para jovens, com encontros mensais via Zoom e estudo
                obrigatório dos 4 módulos físicos para alinhamento doutrinário.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA]">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#141210] mb-2">Ministério de Consolidação</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Nenhum contato é esquecido. Equipes dedicadas acolhem, oram e realizam o encaminhamento
                às igrejas locais sob estrita conformidade com a LGPD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Regionais Ativas */}
      <section id="regionais" className="py-16 sm:py-20 bg-[#FAF8F5] border-b border-[#E7E2DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-red-700 text-xs font-bold tracking-wide">
                Presença em Expansão
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141210] tracking-tight mt-1">
                Regionais Semeadores de Fogo
              </h2>
            </div>
            <p className="text-stone-600 text-xs sm:text-sm max-w-md">
              Igrejas menores realizam evangelismos quinzenais; regionais maiores mantêm frequência semanal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {regionals.map((r, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-[#E7E2DA] hover:border-red-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#141210]">
                      <MapPin className="w-3.5 h-3.5 text-red-700 shrink-0" />
                      <span>{r.name}</span>
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        r.frequency === 'Semanal'
                          ? 'text-red-800 bg-red-50 border-red-200'
                          : 'text-stone-700 bg-stone-100 border-stone-200'
                      }`}
                    >
                      {r.frequency}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#141210] text-base mb-1">{r.church}</h3>
                  <p className="text-xs text-stone-500">Coordenação: {r.coordinator}</p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Em plena atividade</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ensino e Formação */}
      <section id="ensino" className="py-16 sm:py-20 bg-white border-b border-[#E7E2DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-red-700 text-xs font-bold tracking-wide">
              Capacitação Ministerial
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141210] tracking-tight mt-1">
              Escola de Formação — 4 Módulos
            </h2>
            <p className="text-stone-600 mt-3 text-sm sm:text-base leading-relaxed">
              Curso trimestral estruturado para formar jovens evangelistas com profundidade bíblica e prática de campo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((m) => (
              <div
                key={m.number}
                className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E7E2DA] flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-[#141210] text-amber-300 font-extrabold flex items-center justify-center text-xs mb-4 tabular-nums">
                    0{m.number}
                  </div>
                  <h3 className="font-bold text-[#141210] text-sm mb-2">{m.title}</h3>
                  <p className="text-stone-600 text-xs leading-relaxed">{m.desc}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#E7E2DA] text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                  <span>Módulo físico obrigatório</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-[#141210] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-700 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Treinamentos Mensais via Zoom</h3>
                <p className="text-xs text-stone-300 mt-1 max-w-xl leading-relaxed">
                  Aulas ao vivo para os matriculados com ministração dos líderes e envio de links oficiais pelas coordenações.
                </p>
              </div>
            </div>
            <button
              onClick={onEnterPortal}
              className="px-5 py-2.5 bg-white text-[#141210] hover:bg-stone-100 font-semibold text-xs rounded-xl shrink-0 cursor-pointer transition-colors"
            >
              Acessar Portal da Liderança
            </button>
          </div>
        </div>
      </section>

      {/* Cruzadas e Eventos */}
      <section id="cruzadas" className="py-16 sm:py-20 bg-[#FAF8F5] border-b border-[#E7E2DA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-[#E7E2DA] p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-3">
              <span className="text-red-700 text-xs font-bold tracking-wide">
                Grandes Mobilizações
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141210] tracking-tight">
                Cruzadas Evangelísticas & Intercâmbios
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                Planejamento centralizado de grandes eventos em praças e arenas, com coordenação de
                intercessão, louvor, logística de caravanas e checklist operacional reutilizável.
              </p>
            </div>

            <div className="md:col-span-5 p-5 rounded-xl bg-[#141210] text-white space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-amber-300">Em Preparação</span>
                <span className="inline-flex items-center gap-1 text-[11px] bg-white/10 text-stone-200 px-2.5 py-0.5 rounded-full">
                  <Calendar className="w-3 h-3" />
                  Dezembro / 2026
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                Grande Cruzada de Fogo & Avivamento 2026
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Mobilização conjunta das regionais com alvará municipal, intercessão 24h,
                10.000 convites padronizados e evangelismo em massa.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-stone-300">
                <span className="bg-white/10 px-2.5 py-1 rounded-md">Logística & Som</span>
                <span className="bg-white/10 px-2.5 py-1 rounded-md">Intercessão 24h</span>
                <span className="bg-white/10 px-2.5 py-1 rounded-md">Caravanas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-14 sm:py-16 bg-white border-b border-[#E7E2DA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-red-700 text-xs font-bold tracking-wide">
            Comunicação Oficial
          </span>
          <h2 className="text-2xl font-extrabold text-[#141210] tracking-tight mt-1">
            Contato Institucional
          </h2>
          <p className="text-xs text-stone-500 mt-2 mb-7">
            *Dados institucionais em processo de validação pela liderança global.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-stone-700">
            <a
              href="mailto:contato@semeadoresdefogo.org"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] hover:border-red-300 transition-colors"
            >
              <Mail className="w-4 h-4 text-red-700" />
              <span className="font-medium">contato@semeadoresdefogo.org</span>
            </a>
            <a
              href="tel:+5511987654321"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E2DA] hover:border-red-300 transition-colors"
            >
              <Phone className="w-4 h-4 text-red-700" />
              <span className="font-medium">(11) 98765-4321</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#141210] text-stone-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <BrandLogo variant="white" size="sm" />
          <div className="text-xs text-stone-400 text-center md:text-right">
            <p>© 2026 Semeadores de Fogo Global. Todos os direitos reservados.</p>
            <p className="mt-1 text-stone-500">
              Arquitetura de Gestão e Supervisão Ministerial desenhada em 16/10/2026.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
