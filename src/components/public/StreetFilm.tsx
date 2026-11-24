import { useLayoutEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import './street-film.css';

const photos = [
  { file: 'cruzada', position: '66% 33%' },
  { file: 'campo', position: '53% 35%' },
  { file: 'oracao', position: '42% 34%' },
];

export function StreetFilm() {
  const scene = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const section = scene.current!;
    const frame = stage.current!;
    let request = 0;
    function paint() {
      request = 0;
      const distance = section.offsetHeight - frame.offsetHeight;
      const offset = parseFloat(getComputedStyle(frame).top) || 0;
      const progress = Math.min(1, Math.max(0, (offset - section.getBoundingClientRect().top) / Math.max(1, distance)));
      frame.style.setProperty('--shot-two', String(Math.min(1, Math.max(0, (progress - .20) * 6))));
      frame.style.setProperty('--shot-three', String(Math.min(1, Math.max(0, (progress - .67) * 6))));
      frame.style.setProperty('--film-progress', String(progress));
    }
    function schedule() { if (!request) request = requestAnimationFrame(paint); }
    paint();
    const resize = new ResizeObserver(schedule);
    resize.observe(section);
    resize.observe(frame);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('pageshow', schedule);
    return () => {
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('pageshow', schedule);
      cancelAnimationFrame(request);
    };
  }, []);
  return <section className="street-story mission-hero" id="movement-title" ref={scene} aria-labelledby="hero-title">
    <div className="street-stage" ref={stage}>
      <div className="mission-photos" aria-hidden="true">{photos.map(({ file, position }, i) =>
        <img key={file} src={'/acervo/' + file + '.webp'} alt="" fetchPriority={i === 0 ? 'high' : 'auto'} style={{ objectPosition: position }} />)}</div>
      <div className="street-shade" />
      <div className="street-layout"><div className="street-copy">
        <h1 id="hero-title" className="street-title"><span>Semeadores</span><em>de Fogo.</em></h1>
        <p className="street-description">Das ruas de São Paulo aos povoados do Nordeste, levamos o Evangelho de Jesus a quem encontramos pelo caminho.</p>
        <a className="street-cta" href="#missao">Conheça nossa missão <ArrowDown size={16} /></a>
      </div></div>
      <div className="street-progress" aria-hidden="true" />
    </div>
  </section>;
}
