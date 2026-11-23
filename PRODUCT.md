# PRODUCT.md — Semeadores de Fogo Global

## 1. Propósito do Produto
Plataforma oficial de apresentação institucional e gestão ministerial dos **Semeadores de Fogo Global**, criada para padronizar a atuação evangelística das regionais, acompanhar ações de campo, formar novos evangelistas e consolidar relatórios bimestrais para tomada de decisão da liderança global.

## 2. Públicos e Tarefas Principais

| Público | Área | Principais Tarefas |
| :--- | :--- | :--- |
| **Visitantes e Igrejas Interessadas** | Site Público (`/`) | Entender a missão, conhecer as regionais ativas, os 4 módulos da escola de formação, grandes cruzadas e canais oficiais de contato; acessar o portal de liderança. |
| **Coordenação Regional** | Portal Interno (escopo isolado por `regionId`) | Gerenciar ações evangelísticas da própria regional (planejar e registrar resultados), preencher/editar/enviar relatórios bimestrais e consultar indicadores locais. |
| **Direção Global (`global_admin`)** | Portal Interno (visão global + filtro regional) | Supervisionar todas as regionais, cadastrar/editar polos regionais, avaliar e homologar relatórios bimestrais, gerar relatórios consolidados oficiais em A4 com IA (Gemini + fallback analítico local). |

## 3. Arquitetura e Stack Atual
- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), ícones `lucide-react`, fonte `Montserrat`.
- **Backend / API:** Express 4 (`server/app.ts`) com suporte local (`tsx server.ts`) e serverless na Vercel (`api/index.ts`, `vercel.json`).
- **Persistência:** Camada unificada em `server/storage.ts` com PostgreSQL/Supabase (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`) ou JSON local (`data/database.json` via `server/db.ts`).
- **Autenticação e Segurança:** Token HMAC-SHA256 (`server/auth.ts`), senhas com `scrypt`, rate limiting no login (`server/rateLimit.ts`), validação Zod (`server/schemas.ts`) e isolamento multi-tenant por `regionId` no servidor.
- **Inteligência Artificial (Relatório Oficial A4):** Rota `POST /api/ai/analyze-reports` com `@google/genai`, fallback automático para motor analítico local (`server/reportTemplate.ts`), reconciliação numérica obrigatória com os dados reais do banco e renderização HTML oficial (`templates/relatorio-ia/modelo-relatorio-semeadores.html`).

## 4. Telas e Módulos Ativos
1. **Site Institucional Público** (`InstitutionalLanding.tsx`)
2. **Autenticação do Portal** (`LoginView.tsx`)
3. **Dashboard Global** (`GlobalDashboard.tsx`)
4. **Regionais** (`RegionsModule.tsx`)
5. **Evangelismos** (`EvangelismsModule.tsx`)
6. **Relatórios Bimestrais** (`ReportsModule.tsx`)
7. **Relatório Oficial Consolidado por IA** (`AIAnalysisModal.tsx`)

## 5. Contratos e Fluxos Preservados
- Rotas `/api/auth/*`, `/api/dashboard/stats`, `/api/regions`, `/api/evangelisms`, `/api/reports` e `/api/ai/*` mantidas sem alteração de contrato.
- Rótulos críticos de navegação e testes E2E preservados (`Portal da Liderança`, `E-mail Ministerial`, `Senha`, `Entrar no Portal`, `Voltar ao Site Público`, `Dashboard Global`, `Regionais`, `Evangelismos`, `Relatórios Bimestrais`).
