# DESIGN.md — Sistema Visual Semeadores de Fogo Global

## 1. Diagnóstico do Estado Anterior
A inspeção do site publicado/local revelou:
- **Site público** com fundo escuro pontilhado genérico, excesso de caixa alta (`uppercase`) e palavra única destacada em vermelho no título, além de quebra apertada do logotipo e botão de acesso no cabeçalho mobile (`390px`).
- **Área interna** funcional, porém com inconsistências entre módulos (`RegionsModule` e `EvangelismsModule` ainda usando `alert()` nativo, cabeçalho de calendário fixo em "Outubro de 2026" e indicador de implantação estático no Dashboard).
- **Falta de coesão** entre o site público, o portal administrativo e o documento oficial A4 em papel claro editorial.

## 2. Direção Visual Adotada: Editorial Ministerial & Consola Operacional
Unificar toda a experiência em torno da mesma linguagem editorial do documento oficial da plataforma: **superfície clara em alabastro quente (`#FAF8F5`)**, **tinta carvão profunda (`#141210`)** e **acento carmesim ministerial (`#B91C1C`)**, combinando leitura acolhedora e clara no site público com alta legibilidade, densidade equilibrada e previsibilidade nas ferramentas internas.

### Paleta de Cores e Funções
| Token | Hex | Função |
| :--- | :--- | :--- |
| `--bg-canvas` | `#FAF8F5` | Fundo principal da aplicação e seções alternadas do site público |
| `--bg-surface` | `#FFFFFF` | Cartões, tabelas, formulários, modais e barra superior |
| `--ink-primary` | `#141210` | Textos principais, títulos, barra lateral e blocos de destaque |
| `--ink-muted` | `#57534E` | Textos secundários, descrições e metadados |
| `--border-hairline` | `#E7E2DA` | Divisórias e contornos leves substituindo sombras pesadas |
| `--accent-crimson` | `#B91C1C` | Ações primárias, links ativos, indicadores de almas alcançadas |
| `--accent-ember` | `#B45309` | Alertas de revisão pendente e módulo de inteligência por IA |
| `--status-success` | `#047857` | Aprovações, ações concluídas e consentimento LGPD |

### Tipografia e Hierarquia
- **Família única:** `Montserrat` (pesos `400`, `500`, `600`, `700`, `800`), consistente com o template oficial de impressão A4.
- **Títulos em sentence case** com tracking firme (`tracking-tight`), reservando caixa alta discreta apenas para micro-etiquetas de status (`10px–11px`).
- **Números tabulares (`tabular-nums`)** em todos os KPIs, tabelas, contagens e métricas de edição rápida.
- **Comprimento de linha** limitado a `max-w-2xl` / `max-w-3xl` em textos corridos para leitura confortável.

### Espaçamento, Grids e Responsividade
- Container principal `max-w-7xl` com respiro `px-4 sm:px-6 lg:px-8`.
- Breakpoints testados em **390px (celular)**, **768px (tablet)** e **1440px (desktop)**.
- Cabeçalho público mobile compacto (`whitespace-nowrap` no botão principal e ocultação segura de subtítulo em telas estreitas) para eliminar quebras em múltiplas linhas e rolagem horizontal.

### Componentes, Interação e Acessibilidade
- **Bordas e raios:** `rounded-xl` (`12px`) para controles/inputs e `rounded-2xl` (`16px`) para cartões, painéis e modais, com bordas `border-[#E7E2DA]`.
- **Feedback sem `alert()` nativo:** banners inline de erro em modais e notificações toast no canto inferior direito para confirmações.
- **Acessibilidade:** `:focus-visible` com contorno carmesim de alto contraste e suporte completo a `@media (prefers-reduced-motion: reduce)`.
