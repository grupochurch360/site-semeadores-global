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
  ArrowUpRight,
  ArrowUp,
  ChevronDown,
  Flame,

} from 'lucide-react';
import './publicChapters.css';
import './chapterMotion.css';
import { Documentary } from './Documentary';
import { StreetFilm } from './StreetFilm.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';

interface InstitutionalLandingProps {
  onEnterPortal: () => void;
}

export const InstitutionalLanding: React.FC<InstitutionalLandingProps> = ({ onEnterPortal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const page = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const root = page.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('chapter-in-view');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08 });
    root.querySelectorAll('.chapter-title, .chapter-still, .doc-opening, .doc-profile figure, .doc-gallery img, .doc-about h2, .doc-reels article').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);

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
    { href: '#ensino', label: 'Escola' },
    { href: '#cruzadas', label: 'Cruzadas' },
    { href: '#missoes-nordeste', label: 'Nordeste' },
    { href: '#sobre', label: 'Sobre' },
    { href: '#contato', label: 'Contato' },
  ];

  return (
    <div ref={page} className="movement-site min-h-screen bg-[#FBFCFD] text-[#0B2946] selection:bg-[#0A3D69] selection:text-white">
      {/* Sticky Navy Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#071923] border-b border-white/15 text-white">
        <div className="public-nav-inner mx-auto h-16 flex items-center justify-between gap-3">
          <a href="#" className="movement-brand shrink-0" aria-label="Semeadores de Fogo Global - Início">
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
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-[#d2af71]/70 hover:bg-white/10 text-[#ffe0a9] rounded-sm text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Portal da Liderança</span>
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

      <StreetFilm />

      {/* Field work and pastoral care */}
      <section id="missao" className="public-chapter chapter-purpose" aria-labelledby="purpose-title">
        <div className="chapter-wrap">
          <div className="purpose-opening">
            <div className="chapter-prose">
              <h2 id="purpose-title" className="chapter-title">A missão continua depois das ruas.</h2>
              <p>Formamos jovens para anunciar o Evangelho. Quando uma ação termina, o cuidado continua na igreja local, com oração, acolhimento e acompanhamento pastoral.</p>
            </div>
            <img className="chapter-still" width={1182} height={665} loading="lazy" decoding="async" src="/acolhimento.webp" alt="Ilustração de uma conversa de acolhimento à porta de uma igreja." />
          </div>
          <div className="purpose-disciplines">
            <article><Flame aria-hidden="true" /><h3>Evangelismo nas ruas</h3><p>Semanal ou quinzenalmente, as equipes saem para praças, estações, hospitais e universidades, inclusive à noite, para orar por cura e reconciliação.</p></article>
            <article><BookOpen aria-hidden="true" /><h3>Formação de evangelistas</h3><p>A escola gratuita reúne jovens por três meses, com estudo bíblico em quatro módulos e encontros mensais ao vivo.</p></article>
            <article><HeartHandshake aria-hidden="true" /><h3>Cuidado pastoral</h3><p>Com o consentimento de cada pessoa, as equipes de consolidação acompanham os contatos e fazem o encaminhamento às igrejas locais.</p></article>
          </div>
        </div>
      </section>

      <section id="regionais" className="public-chapter chapter-field" aria-labelledby="field-title">
        <div className="chapter-wrap field-directory">
          <div className="chapter-prose">
            <h2 id="field-title" className="chapter-title">Encontre sua regional.</h2>
            <p>Escolha um estado para conhecer a igreja responsável, a coordenação e o ritmo das ações de campo.</p>
          </div>
          <div className="field-locations">
            {regionals.map((r, index) => (
              <details key={r.name} name="regional-directory" open={index === 0}>
                <summary>
                  <span className="field-state">{r.name.split(' (')[0]}</span>
                  <span className="field-frequency">{r.frequency}</span>
                  <ChevronDown className="chapter-chevron" size={19} aria-hidden="true" />
                </summary>
                <div className="field-detail">
                  <p className="field-area"><MapPin size={14} aria-hidden="true" />{r.area}</p>
                  <h3>{r.church}</h3>
                  <p>Coordenação: {r.coordinator}</p>
                  <div className="field-links">
                    <span><CheckCircle2 size={15} aria-hidden="true" /> Polo credenciado</span>
                    <button type="button" onClick={onEnterPortal}>Painel regional <ArrowRight size={15} aria-hidden="true" /></button>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="ensino" className="public-chapter chapter-school" aria-labelledby="school-title">
        <div className="chapter-wrap school-layout">
          <div className="school-portrait">
            <img width={1182} height={665} loading="lazy" decoding="async" src="/formacao.webp" alt="Ilustração de formação bíblica em uma mesa de estudo." />
            <h2 id="school-title" className="chapter-title">Escola de formação.</h2>
          </div>
          <div className="school-course">
            <p className="school-intro">Quatro módulos em três meses. Uma formação bíblica gratuita para a juventude levar às ruas.</p>
            <ol className="course-list">
              {modules.map((m, index) => (
                <li key={m.number}>
                  <details name="school-curriculum" open={index === 0}>
                    <summary>
                      <span className="course-number" aria-hidden="true">{m.number}</span>
                      <span>{m.title}</span>
                      <ChevronDown className="chapter-chevron" size={17} aria-hidden="true" />
                    </summary>
                    <div className="course-detail"><p>{m.desc}</p><p>{m.weeks} · Livro físico obrigatório</p></div>
                  </details>
                </li>
              ))}
            </ol>
            <div className="school-live">
              <Video size={20} aria-hidden="true" />
              <div><h3>Encontros mensais via Zoom</h3><p>As regionais se reúnem ao vivo com os líderes. A coordenação local acompanha a presença.</p></div>
            </div>
            <button className="chapter-text-action" type="button" onClick={onEnterPortal}>Acessar Portal da Liderança <ArrowRight size={17} aria-hidden="true" /></button>
          </div>
        </div>
      </section>

      <section id="cruzadas" className="public-chapter chapter-rally" aria-labelledby="rally-title">
        <div className="chapter-wrap">
          <div className="rally-place"><span>São Paulo, SP</span><span>Dezembro de 2026</span></div>
          <div className="rally-bill">
            <h2 id="rally-title" className="chapter-title">Grande Cruzada de Fogo &amp; Avivamento</h2>
            <div className="rally-date">
              <div aria-hidden="true">11<span>–</span>13</div>
              <p>De 11 a 13 de dezembro de 2026</p>
            </div>
          </div>
          <div className="rally-details">
            <div><h3>Locais e coordenação</h3><p>Arena Multicultural e Praça da República. Coordenação geral de Lucas Moreira e Arthur.</p></div>
            <div><h3>Mobilização conjunta</h3><p>120 evangelistas, 40 intercessores e 25 ministros de louvor. Caravanas de Minas Gerais e Rio de Janeiro.</p></div>
            <div><h3>Preparação da cruzada</h3><p>24 horas de intercessão, 10.000 convites impressos e logística com alvará municipal.</p></div>
          </div>
        </div>
      </section>

      <Documentary />

      <section id="contato" className="public-chapter chapter-contact" aria-labelledby="contact-title">
        <div className="chapter-wrap contact-layout">
          <div className="chapter-prose"><h2 id="contact-title" className="chapter-title">Fale com a secretaria.</h2><p>Contato institucional para igrejas e coordenações regionais.</p></div>
          <div className="contact-channels">
            <a href="mailto:contato@semeadoresdefogo.org"><Mail size={22} aria-hidden="true" /><span>contato@semeadoresdefogo.org</span><ArrowUpRight size={18} aria-hidden="true" /></a>
            <a href="tel:+5511987654321"><Phone size={22} aria-hidden="true" /><span>(11) 98765-4321</span><ArrowUpRight size={18} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <footer className="chapter-footer">
        <div className="chapter-wrap footer-layout">
          <BrandLogo variant="white" size="sm" />
          <div><p>© 2026 Semeadores de Fogo Global</p><small>Governança e supervisão ministerial desde 16/10/2026.</small></div>
          <a href="#movement-title">Voltar ao início <ArrowUp size={16} aria-hidden="true" /></a>
        </div>
      </footer>
    </div>
  );
};
