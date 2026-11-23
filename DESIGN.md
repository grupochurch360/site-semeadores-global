# DESIGN.md — Sistema Visual Semeadores de Fogo Global

## 1. Ideia Visual Central (Fundamentada nos Ativos Oficiais)
> **"A arquitetura visual nasce diretamente do brasão oficial (escudo azul-marinho e dourado com a pomba-chama âmbar) e da folha de estilo do relatório oficial A4 (`templates/relatorio-ia/modelo-relatorio-semeadores.html`), unindo presença editorial de movimento no site público com clareza documental nas ferramentas internas de uso semanal."**

Durante a inspeção do repositório, verificou-se que o protótipo anterior havia deduzido uma paleta vermelha/preta apenas pelo nome "Semeadores de Fogo" e usava um ícone genérico no lugar do logotipo. Já o pacote oficial em `templates/relatorio-ia/modelo-relatorio-semeadores.html` contém o **brasão oficial incorporado em alta resolução** e os tokens cromáticos oficiais da organização (`--navy`, `--ink`, `--blue`, `--orange`, `--gold`, `--paper`, `--line`, `--muted`, `--wash`, `--warm`).

## 2. Três Decisões Adaptadas da Referência (Dunamis Movement) com Expressão Própria
1. **Abertura de presença memorável + navegação em cápsula de alto contraste:**
   - *No Dunamis:* barra flutuante de alto contraste, tipografia monumental na primeira dobra e faixa de assinatura contínua na base do hero.
   - *No Semeadores:* cabeçalho estruturado em azul-marinho profundo (`#061A2D`) com CTA em ouro (`#FFBD58`), primeira dobra em `#061A2D` ancorada pelo **Brasão Oficial do Escudo e Pomba-Chama** (`/logo-semeadores.png`, otimizado de 1,39 MB para 253 KB sem perda visual) e faixa institucional `ESTRUTURA · UNIDADE · MISSÃO`.
2. **Mudança de ritmo na rolagem (Manifesto → Iniciativas → Ação):**
   - *No Dunamis:* passagem nítida entre a afirmação de visão e a organização das frentes (Schools, Connect, Events).
   - *No Semeadores:* transição do hero escuro (`#061A2D`) para o papel editorial claro (`#FBFCFD` e `#EDF4F9`), usando o marcador oficial de seção (filete horizontal `#ED801F` + kicker em caixa alta espaçada) para guiar a leitura pelas 4 frentes reais: **Fundamentos de Campo**, **5 Regionais Ativas**, **Escola de Formação (4 Módulos + Zoom)** e **Grande Cruzada 2026**.
3. **Caminhos claros de próximo passo:**
   - *No Dunamis:* botões diretos para entrar na comunidade ou acessar uma escola específica.
   - *No Semeadores:* ações com destino real para cada público — entrada direta no **Portal da Liderança** (no topo, no hero e na seção de ensino), consulta rápida das **Regionais e Frequências** e canais clicáveis de **Contato Institucional** (`mailto:` e `tel:`).

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
  - Hero Display: `clamp(2.25rem, 4.5vw, 3.75rem)`, `font-extrabold`, `tracking-tight`, `line-height: 1.08`.
  - Section Kicker (assinatura visual do relatório oficial): filete de `14px × 2px` em `#ED801F` seguido de rótulo `11px` em `#ED801F` (`font-bold`, `tracking-widest`).
  - Indicadores e Tabelas: `tabular-nums` obrigatório em contagens de ações, participantes, almas e contatos LGPD.
- **Acessibilidade e Performance:**
  - Imagens do brasão com `width` e `height` explícitos para zero deslocamento de layout (CLS = 0), versão compacta `/logo-semeadores-sm.png` (23 KB) na navegação e `/logo-semeadores.png` (253 KB) no hero.
  - Foco visível (`:focus-visible`) em `#ED801F` e respeito integral a `prefers-reduced-motion: reduce`.
