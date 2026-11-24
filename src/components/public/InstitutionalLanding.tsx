import React, { useState } from 'react';
import { Menu, X, ArrowUp, ArrowUpRight, Mail, Phone } from 'lucide-react';
import './publicChapters.css';
import './chapterMotion.css';
import { Documentary } from './Documentary';
import { StreetFilm } from './StreetFilm.tsx';
import { BrandLogo } from '../common/BrandLogo.tsx';

export function InstitutionalLanding() {
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

  const navLinks = [
    { href: '#missao', label: 'Nossa missão' },
    { href: '#missoes-nordeste', label: 'Missões Nordeste' },
    { href: '#sobre', label: 'Sobre nós' },
    { href: '#contato', label: 'Contato' },
  ];
  return (
    <div ref={page} className="movement-site min-h-screen bg-[#FBFCFD] text-[#0B2946] selection:bg-[#0A3D69] selection:text-white">
      {/* Sticky Navy Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#071923] border-b border-white/15 text-white">
        <div className="public-nav-inner mx-auto h-16 flex items-center justify-between gap-3">
          <a href="#" className="movement-brand shrink-0" aria-label="Semeadores de Fogo Global - Início">
            <BrandLogo variant="white" size="sm" showSubtitle={false} />
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

      <section id="missao" className="public-chapter chapter-purpose" aria-labelledby="purpose-title">
        <div className="chapter-wrap purpose-opening">
          <div className="chapter-prose">
            <h2 id="purpose-title" className="chapter-title">Ganhar almas para Jesus.</h2>
            <p>O Semeadores de Fogo é o ministério evangelístico da EMIGRA. Em São Paulo, Minas Gerais e Rio de Janeiro, nossos grupos vão às ruas para compartilhar o Evangelho, orar com as pessoas e ouvir suas histórias.</p>
            <p>Queremos alcançar os quatro cantos do Brasil e fortalecer as igrejas da EMIGRA para que sejam referências em evangelismo onde vivem e servem.</p>
          </div>
          <img className="chapter-still" src="/acervo/encontro.webp" alt="Comunidade reunida durante uma ação dos Semeadores de Fogo" loading="lazy" />
        </div>
      </section>
      <Documentary />

      <section id="contato" className="public-chapter chapter-contact" aria-labelledby="contact-title">
        <div className="chapter-wrap contact-layout">
          <div className="chapter-prose"><h2 id="contact-title" className="chapter-title">Fale com os Semeadores.</h2><p>Quer conhecer o ministério ou conversar sobre uma missão na sua comunidade? Entre em contato.</p></div>
          <div className="contact-channels">
            <a href="mailto:contato@semeadoresdefogo.org"><Mail size={22} aria-hidden="true" /><span>contato@semeadoresdefogo.org</span><ArrowUpRight size={18} aria-hidden="true" /></a>
            <a href="tel:+5511987654321"><Phone size={22} aria-hidden="true" /><span>(11) 98765-4321</span><ArrowUpRight size={18} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <footer className="chapter-footer">
        <div className="chapter-wrap footer-layout">
          <BrandLogo variant="white" size="sm" showSubtitle={false} />
          <div><p>© 2026 Semeadores de Fogo Global</p></div>
          <a href="#movement-title">Voltar ao início <ArrowUp size={16} aria-hidden="true" /></a>
        </div>
      </footer>
    </div>
  );
};
