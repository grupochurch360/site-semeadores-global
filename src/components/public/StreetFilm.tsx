import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ArrowDown, ArrowUpRight, Play, X } from 'lucide-react';
import './street-film.css';

const chapters = [
  { name: 'Evangelismo', destination: '#missao', headline: ['O Evangelho', 'nas ruas.'], description: 'Igrejas locais se unem para levar o Evangelho às ruas e acolher quem encontram pelo caminho.' },
  { name: 'Formação', destination: '#ensino', headline: ['Da formação', 'ao campo.'], description: 'Quatro módulos de formação bíblica preparam jovens evangelistas para a prática nas ruas.' },
  { name: 'Regionais', destination: '#regionais', headline: ['Uma missão.', 'Cinco regionais.'], description: 'São Paulo, Minas Gerais, Rio de Janeiro, Paraná e Goiás. Encontre a igreja que coordena as ações perto de você.' },
];
const motionQuery = '(min-width: 900px) and (min-height: 560px) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

export function StreetFilm() {
  const screening = useRef<HTMLDialogElement>(null);
  const feature = useRef<HTMLVideoElement>(null);
  function showFilm() {
    screening.current?.showModal();
    const player = feature.current;
    if (!player) return;
    player.src = matchMedia('(orientation: portrait)').matches ? '/acervo/filme-vertical.mp4' : '/acervo/filme-wide.mp4';
    void player.play().catch(() => {});
  }
  function closeFilm() {
    const player = feature.current;
    if (player) { player.pause(); player.removeAttribute('src'); player.load(); }
  }
  const scene = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const section = scene.current!;
    const frame = stage.current!;
    const player = video.current!;
    const policy = matchMedia(motionQuery);
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let controller: AbortController | undefined;
    let blobUrl = '';
    let tick = 0;
    let active = false;
    let displayedBeat = 0;
    let previousProgress = -1;
    function update() {
      tick = 0;
      if (!active || !section.classList.contains('film-ready')) return;
      const top = parseFloat(getComputedStyle(frame).top);
      const travel = section.offsetHeight - frame.offsetHeight;
      if (travel <= 0) return;
      const progress = Math.min(1, Math.max(0, (top - section.getBoundingClientRect().top) / travel));
      if (progress !== previousProgress) {
        frame.style.setProperty('--film-progress', String(progress));
        previousProgress = progress;
      }
      const time = progress * Math.max(0, player.duration - 1 / 24);
      if (!player.seeking && Math.abs(player.currentTime - time) > 1 / 48) player.currentTime = time;
      // Cut the type with the decoded shot, including on reverse scrubs.
      if (!player.seeking) {
        const next = Math.min(2, Math.floor(3 * player.currentTime / player.duration));
        if (next !== displayedBeat) { displayedBeat = next; setBeat(next); }
      }
    }
    function schedule() { if (active && !tick) tick = requestAnimationFrame(update); }
    function stop() {
      active = false;
      controller?.abort();
      controller = undefined;
      cancelAnimationFrame(tick);
      tick = 0;
      displayedBeat = 0;
      previousProgress = -1;
      if (player.hasAttribute('src')) { player.removeAttribute('src'); player.load(); }
      if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = ''; }
    }
    function fallback() { stop(); setReady(false); setBeat(0); }
    function begin() {
      if (!policy.matches || !Number.isFinite(player.duration)) return;
      // A delayed film must never move a visitor away from a chosen section.
      if (section.getBoundingClientRect().top < -24 || location.hash.length > 1) return;
      active = true;
      setReady(true);
      schedule();
    }
    async function configure() {
      fallback();
      if (!policy.matches || connection?.saveData || location.hash.length > 1) return;
      const request = new AbortController();
      controller = request;
      try {
        const response = await fetch('/ruas-cena.mp4', { signal: request.signal });
        if (!response.ok) return;
        const blob = await response.blob();
        if (request.signal.aborted) return;
        blobUrl = URL.createObjectURL(blob);
        player.src = blobUrl;
      } catch { /* The poster, chapter links and CTA remain available offline. */ }
    }
    player.addEventListener('loadeddata', begin);
    player.addEventListener('seeked', schedule);
    player.addEventListener('error', fallback);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    policy.addEventListener('change', configure);
    void configure();
    return () => {
      player.removeEventListener('loadeddata', begin);
      player.removeEventListener('seeked', schedule);
      player.removeEventListener('error', fallback);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      policy.removeEventListener('change', configure);
      stop();
    };
  }, []);

  function selectChapter(event: MouseEvent<HTMLAnchorElement>, index: number) {
    if (!ready || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const section = scene.current!;
    const frame = stage.current!;
    const start = window.scrollY + section.getBoundingClientRect().top - parseFloat(getComputedStyle(frame).top);
    window.scrollTo({ top: start + (section.offsetHeight - frame.offsetHeight) * [0, .5, .91][index], behavior: 'instant' });
  }

  const chapter = chapters[beat];
  return (
    <section id="movement-title" ref={scene} className={'street-story' + (ready ? ' film-ready' : '')} aria-label="Semeadores de Fogo nas ruas">
      <div className="street-stage" ref={stage}>
        <picture className="street-poster">
          <source media="(max-width: 699px)" srcSet="/ruas-mobile.webp" />
          <img src="/ruas-amanhecer.webp" width="1672" height="941" fetchPriority="high" alt="" />
        </picture>
        <div className="street-cutaway" aria-hidden="true" /><video ref={video} className="street-screen" preload="auto" muted playsInline aria-hidden="true" />
        <div className="street-shade" />
        <div className="street-layout">
          <div className="street-copy">
            <h1 className="sr-only">Semeadores de Fogo Global. O Evangelho nas ruas.</h1>
            <div key={beat} className="street-words">
              <p className="street-title" aria-hidden="true"><span>{chapter.headline[0]}</span><em>{chapter.headline[1]}</em></p>
              <p className="street-description">{chapter.description}</p>
            </div>
            <div className="street-actions"><button type="button" className="screening-trigger" onClick={showFilm}><Play size={15} fill="currentColor" /> Assistir ao filme</button><a href="#regionais" className="street-cta">Encontre sua regional <ArrowUpRight size={18} aria-hidden="true" /></a></div>
          </div>
        </div>
        <nav className="street-sequence" aria-label={ready ? 'Cenas do movimento' : 'Explore o movimento'}>
          {chapters.map((item, i) => (
            <a key={item.name} href={item.destination} onClick={(e) => selectChapter(e, i)}
               className={beat === i ? 'is-current' : ''} aria-current={ready && beat === i ? 'step' : undefined}>
              <span className="street-counter" aria-hidden="true">0{i + 1}</span>
              <span>{item.name}</span>
            </a>
          ))}
          <a className="street-skip" href="#missao" aria-label="Seguir para o propósito"><ArrowDown size={18} aria-hidden="true" /></a>
        </nav>
        <div className="street-progress" aria-hidden="true" />
      </div>
      <dialog className="mission-screening" ref={screening} onClose={closeFilm} aria-label="Filme Missões Nordeste">
        <button type="button" className="screening-close" aria-label="Fechar filme" onClick={() => screening.current?.close()}><X /></button>
        <video ref={feature} playsInline controls preload="none" aria-label="Missões Nordeste. A equipe caminha pelo sertão, a comunidade se reúne, Robson prega e ora com uma participante." />
      </dialog>
    </section>
  );
}
