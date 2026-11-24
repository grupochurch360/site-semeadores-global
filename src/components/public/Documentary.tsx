import { useState } from 'react';
import { Play, ArrowUpRight } from 'lucide-react';
import './documentary.css';

const films = ['rKOehvuTLr8', '3bfH8Xlzoi8', '4UD9PV1Hwgc'];
function Photo({ name, alt }: { name: string; alt: string }) {
  return <img src={'/acervo/' + name + '.webp'} alt={alt} loading="lazy" decoding="async" />;
}
export function Documentary() {
  const [playing, setPlaying] = useState('');
  return <>
    <section className="doc-chapter doc-film" id="missoes-nordeste" aria-labelledby="doc-title">
      <div className="doc-wrap"><div className="mission-sequence"><header className="doc-opening"><div><h2 id="doc-title">Missões <em>Nordeste</em></h2><p>Veja a missão em campo pelos registros em vídeo.</p></div><Photo name="campo" alt="Robson Martins e a equipe caminhando pelo sertão" /><span className="mission-shot congregation" aria-hidden="true" /><span className="mission-shot prayer" aria-hidden="true" /></header></div>
      <div className="doc-reels">{films.map((id, i) => <article key={id}><div className="doc-screen">
        {playing === id ? <iframe title={'Missões Nordeste — vídeo ' + (i+1)} src={'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&playsinline=1'} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /> :
        <button type="button" onClick={() => setPlaying(id)} aria-label={'Reproduzir vídeo ' + (i+1) + ' de Missões Nordeste'}><img src={'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'} loading="lazy" alt="" /><span><Play fill="currentColor" size={24}/></span></button>}</div>
        <a href={'https://www.youtube.com/shorts/' + id} target="_blank" rel="noreferrer">Vídeo 0{i+1} no YouTube <ArrowUpRight size={17}/></a></article>)}</div></div>
    </section>
    <section id="sobre" className="doc-chapter doc-about" aria-labelledby="doc-about-title"><div className="doc-wrap">
      <h2 id="doc-about-title">Sobre os <em>Semeadores de Fogo</em></h2><p className="doc-intro">Evangelismo sobrenatural, cruzadas evangelísticas e missões no Nordeste.</p>
      <div className="doc-profile"><figure><Photo name="robson" alt="Apóstolo Robson Martins sorrindo ao microfone" /></figure><div><h3>Apóstolo<br/><em>Robson Martins</em></h3>
      <p>Apóstolo Robson Martins é casado com a Pastora Monique Moura e pai de Elisa e Noemi. É fundador e presidente do Instituto de Restauração Escola de Fogo, em Nova Iguaçu (RJ), e da MGRA — Ministério Global de Restauração e Avivamento.</p>
      <p>Reconhecido por seu ministério apostólico e profético, tornou-se uma referência na pregação do Evangelho do Reino, no ensino bíblico, na formação de líderes e no avivamento no Brasil. Sua trajetória ministerial é marcada pela excelência no servir, pela integridade na liderança e pelo compromisso de despertar pessoas para viverem o propósito de Deus.</p>
      <p>Com uma mensagem voltada à restauração de vidas, ao amadurecimento espiritual e ao despertar de vocações, tem dedicado sua vida à formação de uma geração comprometida com o avivamento.</p>
      <p>Por meio da MGRA, presente em diversas regiões do Brasil e no exterior, desenvolve um trabalho de expansão do Reino de Deus, mobilizando igrejas e formando líderes para viverem a realidade do poder sobrenatural de Deus, fundamentados na oração, na santidade e no cumprimento da missão do Evangelho.</p></div></div>
      <div className="doc-gallery">{[['oracao','Robson em oração com uma participante'],['cruzada','Pregação durante uma cruzada evangelística'],['encontro','Comunidade reunida na quadra'],['cestas','Crianças com cestas de alimentos'],['familias','Participantes reunidos após a distribuição de alimentos']].map(([name,alt])=><Photo key={name} name={name} alt={alt}/>)}</div>
    </div></section></>;
}

