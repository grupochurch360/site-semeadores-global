import React, { useState } from 'react';
import {
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
  Flame,
  Users,
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
      area: 'Capital & Metrópole',
      church: 'Igreja Central da Fé & Missões',
      coordinator: 'Pr. Marcos Oliveira',
      frequency: 'Semanal',
    },
    {
      name: 'Minas Gerais (BH)',
      area: 'Belo Horizonte',
      church: 'Comunidade da Graça Central',
      coordinator: 'Pr. Samuel Couto',
      frequency: 'Quinzenal',
    },
    {
      name: 'Rio de Janeiro (RJ)',
      area: 'Baixada & Centro',
      church: 'Igreja Vida Nova em Cristo',
      coordinator: 'Pra. Débora Santos',
      frequency: 'Semanal',
    },
    {
      name: 'Paraná (Curitiba)',
      area: 'Curitiba & Região',
      church: 'Igreja Manancial de Vida',
      coordinator: 'Pr. André Silveira',
      frequency: 'Quinzenal',
    },
    {
      name: 'Goiás (Goiânia)',
      area: 'Centro-Oeste',
      church: 'Igreja Renovação Apostólica',
      coordinator: 'Pr. Thiago Viana',
      frequency: 'Quinzenal',
    },
  ];

  const modules = [
    {
      number: '01',
      title: 'Evangelismo Sobrenatural',
      weeks: '3 semanas',
      desc: 'Pregação com autoridade nas ruas, oração por enfermos, milagres e palavras proféticas de sabedoria.',
    },
    {
      number: '02',
      title: 'Unção do Espírito',
      weeks: '3 semanas',
      desc: 'Consagração pessoal, vida de santidade e sensibilidade à voz do Espírito Santo no campo de batalha.',
    },
    {
      number: '03',
      title: 'Dons do Espírito',
      weeks: '3 semanas',
      desc: 'Discernimento de espíritos e ativação prática dos dons carismáticos durante abordagens evangelísticas.',
    },
    {
      number: '04',
      title: 'Paternidade Espiritual',
      weeks: '3 semanas',
      desc: 'Acolhimento contínuo, consolidação, discipulado de novos convertidos e maturidade pastoral.',
    },
  ];

  const navLinks = [
    { href: '#missao', label: 'Propósito' },
    { href: '#regionais', label: 'Regionais' },
    { href: '#ensino', label: 'Escola (4 Módulos)' },
    { href: '#cruzadas', label: 'Cruzadas' },
    { href: '#contato', label: 'Contato' },
  ];

  return (
    <div className="min-h-screen bg-[#FBFCFD] text-[#0B2946] selection:bg-[#0A3D69] selection:text-white">
      {/* Sticky Navy Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#061A2D]/95 backdrop-blur-md border-b border-[#16324F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          <a href="#" className="shrink-0" aria-label="Semeadores de Fogo Global - Início">
            <BrandLogo variant="white" size="sm" showSubtitle={true} />
          </a>

          <nav
            className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#DAE4ED]"
            aria-label="Navegação institucional"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-[#FFBD58] transition-colors py-1 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onEnterPortal}
              className="inline-flex items-center gap-1.5 px-3.5 lg:px-5 py-2 sm:py-2.5 bg-[#FFBD58] hover:bg-[#f5b042] text-[#061A2D] rounded-lg text-xs font-extrabold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-[#061A2D] shrink-0" />
              <span className="hidden sm:inline">Acessar Plataforma</span>
              <span className="sm:hidden">Entrar</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="p-2 rounded-lg border border-[#234364] bg-[#0B2946] text-white lg:hidden cursor-pointer"
              aria-label={mobileMenuOpen ? 'Fechar navegação' : 'Abrir navegação'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#16324F] bg-[#061A2D] px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-xs font-semibold text-[#DAE4ED] hover:bg-[#0B2946] hover:text-[#FFBD58]"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* First Fold: Official Navy Cover & Shield-Dove Emblem */}
      <section className="relative bg-[#061A2D] text-white overflow-hidden border-b-4 border-[#ED801F]">
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 78% 35%, rgba(237, 128, 31, 0.28), transparent 45%), radial-gradient(circle at 20% 80%, rgba(10, 61, 105, 0.6), transparent 50%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Core Statement & Next Step */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5">
                <span className="w-4 h-0.5 bg-[#ED801F] inline-block" />
                <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#FFBD58]">
                  Movimento Evangelístico & Governança Global
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.06] text-white max-w-2xl">
                Levando o fogo do Evangelho às ruas com{' '}
                <span className="text-[#FFBD58]">estrutura, unidade e missão.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#DAE4ED] leading-relaxed max-w-xl">
                Plataforma oficial dos Semeadores de Fogo Global. Articulamos polos regionais em
                todo o país, formamos novos evangelistas em 4 módulos práticos e acompanhamos cada
                vida alcançada com responsabilidade pastoral.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <button
                  onClick={onEnterPortal}
                  className="px-7 py-3.5 bg-[#FFBD58] hover:bg-[#f5b042] text-[#061A2D] font-extrabold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Portal de Gestão dos Líderes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#regionais"
                  className="px-6 py-3.5 bg-[#0B2946] hover:bg-[#103558] text-white font-semibold text-sm rounded-lg border border-[#264A6E] transition-colors flex items-center justify-center"
                >
                  Conhecer Regionais & Escola
                </a>
              </div>

              {/* Official Cover Period / Charter Callout */}
              <div className="pt-5 border-t border-[#1E3A56] grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#FFBD58] tabular-nums block">
                    5
                  </span>
                  <span className="text-[11px] text-[#B7C8D9] block mt-0.5">
                    Polos regionais em operação
                  </span>
                </div>
                <div className="border-l border-[#1E3A56] pl-4">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums block">
                    4
                  </span>
                  <span className="text-[11px] text-[#B7C8D9] block mt-0.5">
                    Módulos físicos de formação
                  </span>
                </div>
                <div className="border-l border-[#1E3A56] pl-4">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums block">
                    100%
                  </span>
                  <span className="text-[11px] text-[#B7C8D9] block mt-0.5">
                    Consolidação com LGPD
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Dominant Official Emblem & Charter Card */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
              <div className="w-full max-w-md rounded-2xl bg-[#0B2946]/90 border border-[#234567] p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex flex-col items-center text-center">
                  <img
                    src="/logo-semeadores.png"
                    alt="Brasão Oficial Semeadores de Fogo Global — Escudo e Pomba em Chama"
                    width={220}
                    height={204}
                    className="w-40 sm:w-52 h-auto object-contain drop-shadow-xl select-none"
                  />
                  <span className="mt-4 text-[10px] font-bold tracking-[0.22em] uppercase text-[#FFBD58]">
                    Semeadores de Fogo Global
                  </span>
                  <p className="text-xs text-[#B7C8D9] mt-1">
                    Diretrizes Estratégicas • 16 de Outubro de 2026
                  </p>
                </div>

                <div className="space-y-2.5 border-t border-[#1E3D5C] pt-5 text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#061A2D]/80 border-l-3 border-[#ED801F]">
                    <Flame className="w-4 h-4 text-[#ED801F] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Ritmo de Campo Definido</strong>
                      <span className="text-[#B7C8D9]">
                        Evangelismos semanais nos grandes centros e quinzenais nas igrejas em expansão.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-[#061A2D]/80 border-l-3 border-[#FFBD58]">
                    <HeartHandshake className="w-4 h-4 text-[#FFBD58] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Cuidado Pós-Ação</strong>
                      <span className="text-[#B7C8D9]">
                        Triagem de contatos autorizados e prestação de contas bimestral à Direção Global.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Manifesto Strip */}
        <div className="bg-[#041220] border-t border-[#16324F] py-3 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px] tracking-[0.16em] uppercase font-bold text-[#B7C8D9]">
            <span>ESTRUTURA · UNIDADE · MISSÃO</span>
            <span className="text-[#FFBD58]">
              SÃO PAULO · MINAS GERAIS · RIO DE JANEIRO · PARANÁ · GOIÁS
            </span>
          </div>
        </div>
      </section>

      {/* Section 1: Propósito e Fundamentos (Editorial Paper) */}
      <section id="missao" className="py-16 sm:py-22 bg-[#FBFCFD] border-b border-[#DCE5ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="section-kicker">01 · Fundamentos Ministeriais</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2946] tracking-tight mt-2">
              Ordem, unção e frutos que permanecem
            </h2>
            <p className="text-[#586E84] mt-3 text-sm sm:text-base leading-relaxed">
              Os Semeadores de Fogo Global não atuam apenas com mobilizações isoladas. Estruturamos
              uma jornada completa: formação bíblica da juventude, saída organizada às ruas e
              encaminhamento pastoral de cada pessoa acolhida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-xl bg-white border border-[#DCE5ED] border-l-4 border-l-[#ED801F]">
              <div className="w-10 h-10 rounded-lg bg-[#FFF9F2] border border-[#F5DDC3] text-[#ED801F] flex items-center justify-center mb-5">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2946] mb-2">Evangelismo nas Ruas</h3>
              <p className="text-[#586E84] text-sm leading-relaxed">
                Ações semanais e quinzenais em praças públicas, estações, portas de hospitais,
                universidades e impactos noturnos com oração por cura e reconciliação.
              </p>
            </div>

            <div className="p-7 rounded-xl bg-white border border-[#DCE5ED] border-l-4 border-l-[#0A3D69]">
              <div className="w-10 h-10 rounded-lg bg-[#EDF4F9] text-[#0A3D69] flex items-center justify-center mb-5">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2946] mb-2">Formação de 3 Meses</h3>
              <p className="text-[#586E84] text-sm leading-relaxed">
                Escola intensiva gratuita para jovens, com encontros mensais ao vivo via Zoom e
                estudo obrigatório dos 4 módulos físicos para alinhamento doutrinário.
              </p>
            </div>

            <div className="p-7 rounded-xl bg-white border border-[#DCE5ED] border-l-4 border-l-[#061A2D]">
              <div className="w-10 h-10 rounded-lg bg-[#061A2D] text-[#FFBD58] flex items-center justify-center mb-5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B2946] mb-2">Ministério de Consolidação</h3>
              <p className="text-[#586E84] text-sm leading-relaxed">
                Nenhum contato é esquecido. Equipes dedicadas acolhem, oram e realizam o
                encaminhamento às igrejas locais sob estrita conformidade com a LGPD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Onde Acontece — Regionais Ativas (Wash Surface) */}
      <section id="regionais" className="py-16 sm:py-22 bg-[#EDF4F9] border-b border-[#DCE5ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="section-kicker">02 · Presença Territorial</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2946] tracking-tight mt-2">
                Regionais Semeadores de Fogo
              </h2>
            </div>
            <p className="text-[#586E84] text-xs sm:text-sm max-w-md">
              Igrejas menores realizam evangelismos quinzenais; regionais maiores mantêm frequência
              semanal acompanhada pela Direção Global.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {regionals.map((r, idx) => (
              <article
                key={idx}
                className="bg-white p-6 rounded-xl border border-[#DCE5ED] hover:border-[#0A3D69] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0B2946]">
                      <MapPin className="w-3.5 h-3.5 text-[#ED801F] shrink-0" />
                      <span>{r.name}</span>
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded ${
                        r.frequency === 'Semanal'
                          ? 'text-[#A6540B] bg-[#FFF9F2] border border-[#F5DDC3]'
                          : 'text-[#0A3D69] bg-[#EDF4F9] border border-[#DCE5ED]'
                      }`}
                    >
                      {r.frequency}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#ED801F] mb-1">{r.area}</p>
                  <h3 className="font-bold text-[#0B2946] text-base mb-1">{r.church}</h3>
                  <p className="text-xs text-[#586E84]">Coordenação: {r.coordinator}</p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#DCE5ED] flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Polo credenciado</span>
                  </span>
                  <button
                    onClick={onEnterPortal}
                    className="text-xs font-bold text-[#0A3D69] hover:text-[#ED801F] cursor-pointer"
                  >
                    Painel regional →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Escola de Formação — 4 Módulos */}
      <section id="ensino" className="py-16 sm:py-22 bg-[#FBFCFD] border-b border-[#DCE5ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="section-kicker">03 · Capacitação Ministerial</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2946] tracking-tight mt-2">
              Escola de Formação — 4 Módulos Oficiais
            </h2>
            <p className="text-[#586E84] mt-3 text-sm sm:text-base leading-relaxed">
              Curso trimestral intensivo e gratuito para a juventude, unindo aulas mensais ao vivo
              via Zoom e o estudo dos quatro livros físicos obrigatórios.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((m) => (
              <div
                key={m.number}
                className="p-6 rounded-xl bg-white border border-[#DCE5ED] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold text-[#ED801F] tabular-nums leading-none">
                      {m.number}
                    </span>
                    <span className="text-[11px] font-semibold text-[#0A3D69] bg-[#EDF4F9] px-2 py-0.5 rounded">
                      {m.weeks}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#0B2946] text-sm mb-2">{m.title}</h3>
                  <p className="text-[#586E84] text-xs leading-relaxed">{m.desc}</p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#DCE5ED] text-[11px] text-[#586E84] flex items-center gap-1.5 font-semibold">
                  <BookOpen className="w-3.5 h-3.5 text-[#0A3D69]" />
                  <span>Livro físico obrigatório</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-[#061A2D] text-white rounded-xl p-6 sm:p-8 border-l-4 border-l-[#FFBD58] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-[#0A3D69] border border-[#234F7A] flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-[#FFBD58]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Treinamentos Mensais via Zoom</h3>
                <p className="text-xs text-[#B7C8D9] mt-1 max-w-xl leading-relaxed">
                  Encontros ao vivo para todas as regionais com ministração dos líderes e
                  acompanhamento de presença pelas coordenações locais.
                </p>
              </div>
            </div>
            <button
              onClick={onEnterPortal}
              className="px-5 py-2.5 bg-[#FFBD58] hover:bg-[#f5b042] text-[#061A2D] font-extrabold text-xs rounded-lg shrink-0 cursor-pointer transition-colors"
            >
              Acessar Portal da Liderança
            </button>
          </div>
        </div>
      </section>

      {/* Section 4: Grandes Mobilizações — Cruzada 2026 */}
      <section id="cruzadas" className="py-16 sm:py-20 bg-[#EDF4F9] border-b border-[#DCE5ED]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#061A2D] text-white rounded-2xl p-6 sm:p-10 border border-[#16324F] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="section-kicker">04 · Grandes Mobilizações</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Grande Cruzada de Fogo & Avivamento 2026
              </h2>
              <p className="text-[#DAE4ED] text-sm leading-relaxed max-w-2xl">
                Mobilização conjunta das regionais em São Paulo (Arena Multicultural & Praça da
                República), com alvará municipal, relógio de 24h de intercessão, 10.000 convites
                impressos e caravanas integradas.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2 max-w-md">
                <div className="p-3 rounded-lg bg-[#0B2946] border border-[#1E3F60]">
                  <span className="text-xl font-extrabold text-[#FFBD58] tabular-nums block">
                    120
                  </span>
                  <span className="text-[11px] text-[#B7C8D9]">Evangelistas</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0B2946] border border-[#1E3F60]">
                  <span className="text-xl font-extrabold text-white tabular-nums block">40</span>
                  <span className="text-[11px] text-[#B7C8D9]">Intercessores</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0B2946] border border-[#1E3F60]">
                  <span className="text-xl font-extrabold text-white tabular-nums block">25</span>
                  <span className="text-[11px] text-[#B7C8D9]">Ministros Louvor</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-xl bg-[#0B2946] border border-[#234567] space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-[#1E3F60] pb-3">
                <span className="text-xs font-bold text-[#FFBD58]">Agenda Oficial</span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-[#061A2D] text-[#DAE4ED] px-3 py-1 rounded font-semibold tabular-nums">
                  <Calendar className="w-3.5 h-3.5 text-[#ED801F]" />
                  11 a 13 Dez / 2026
                </span>
              </div>
              <div className="space-y-2 text-xs text-[#DAE4ED]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#ED801F] shrink-0" />
                  <span>Arena Multicultural & Praça da República — São Paulo/SP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-[#FFBD58] shrink-0" />
                  <span>Coordenação Geral: Lucas Moreira & Arthur</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-[#B7C8D9]">
                <span className="bg-[#061A2D] px-2.5 py-1 rounded border border-[#1E3F60]">
                  Logística & Alvará
                </span>
                <span className="bg-[#061A2D] px-2.5 py-1 rounded border border-[#1E3F60]">
                  Intercessão 24h
                </span>
                <span className="bg-[#061A2D] px-2.5 py-1 rounded border border-[#1E3F60]">
                  Caravanas MG & RJ
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Contato Institucional */}
      <section id="contato" className="py-14 sm:py-16 bg-white border-b border-[#DCE5ED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-kicker justify-center">05 · Comunicação Oficial</span>
          <h2 className="text-2xl font-extrabold text-[#0B2946] tracking-tight mt-2">
            Contato Institucional
          </h2>
          <p className="text-xs text-[#586E84] mt-2 mb-7">
            Canais diretos da secretaria executiva para alinhamento de igrejas e coordenações
            regionais.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-[#0B2946]">
            <a
              href="mailto:contato@semeadoresdefogo.org"
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#EDF4F9] border border-[#DCE5ED] hover:border-[#0A3D69] transition-colors"
            >
              <Mail className="w-4 h-4 text-[#ED801F]" />
              <span className="font-semibold">contato@semeadoresdefogo.org</span>
            </a>
            <a
              href="tel:+5511987654321"
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#EDF4F9] border border-[#DCE5ED] hover:border-[#0A3D69] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#ED801F]" />
              <span className="font-semibold tabular-nums">(11) 98765-4321</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#061A2D] text-[#B7C8D9] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <BrandLogo variant="white" size="sm" />
          <div className="text-xs text-[#B7C8D9] text-center md:text-right">
            <p className="font-semibold text-white">
              © 2026 Semeadores de Fogo Global · ESTRUTURA · UNIDADE · MISSÃO
            </p>
            <p className="mt-1 text-[#849BB3]">
              Arquitetura de Governança e Supervisão Ministerial estabelecida em 16/10/2026.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
