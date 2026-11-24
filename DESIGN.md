# DESIGN.md — Sistema Visual Semeadores de Fogo Global

## 1. Direção editorial

A página inicial apresenta o ministério evangelístico da EMIGRA, sua presença no Brasil e o trabalho missionário no Nordeste. O brasão identifica o ministério e a chamada principal leva à seção Nossa missão.

## 2. Movimento e navegação

Três fotografias do acervo acompanham a rolagem no celular e no desktop. A montagem alterna cruzada, visita de campo e oração. A área administrativa tem entrada direta em `/admin`.

## 3. Paleta Oficial e Tokens (`src/index.css`)

| Token CSS | Hex | Origem & Função no Sistema |
| :--- | :--- | :--- |
| `--navy` | `#061A2D` | Azul-marinho profundo do escudo oficial — Hero público, Sidebar interna, cabeçalhos de tabela e blocos de alcance |
| `--ink` | `#0B2946` | Tinta editorial principal — títulos e textos de alta leitura sobre fundo claro |
| `--blue` | `#0A3D69` | Azul real do escudo — bordas de painéis analíticos, badges institucionais e links |
| `--orange` | `#ED801F` | Laranja-brasa da pomba-chama — kickers de seção, indicadores de ação, barras de progresso e foco de teclado |
| `--gold` | `#FFBD58` | Ouro quente da moldura do escudo — CTAs de destaque sobre `--navy` e números de alcance principal |
| `--paper` | `#FBFCFD` | Papel editorial claro — superfície principal das áreas internas e seções de leitura |
| `--wash` | `#EDF4F9` | Lavagem azul-gelo — painéis de apoio, filtros e cabeçalhos secundários |
| `--warm` | `#FFF9F2` | Lavagem âmbar suave (borda `#F5DDC3`) — alertas de revisão, pré-preenchimento e edição rápida |
| `--line` | `#DCE5ED` | Fio estrutural — divisórias de tabelas, contornos de cards e inputs |
| `--muted` | `#586E84` | Texto secundário, legendas e metadados |

## 4. Tipografia, Escala e Componentes
- **Fonte oficial:** `Montserrat` (`400` a `900`), compartilhada com o relatório A4.
- **Hierarquia:**
  - Hero Display: `clamp(2.65rem, 6.45vw, 7.25rem)` na composição horizontal como referência histórica. A abertura atual usa Barlow Condensed Bold local e Georgia itálica, com escalas responsivas em street-film.css.
  - Section Kicker (assinatura visual do relatório oficial): filete de `14px × 2px` em `#ED801F` seguido de rótulo `11px` em `#ED801F` (`font-bold`, `tracking-widest`).
  - Indicadores e Tabelas: `tabular-nums` obrigatório em contagens de ações, participantes, almas e contatos LGPD.
- **Acessibilidade e Performance:**
  - Imagens do brasão com `width` e `height` explícitos para reservar espaço antes do carregamento, versão compacta `/logo-semeadores-sm.png` (23 KB) na navegação e `/logo-semeadores.png` (253 KB) no hero.
  - Foco visível (`:focus-visible`) em `#ED801F` e respeito integral a `prefers-reduced-motion: reduce`.
