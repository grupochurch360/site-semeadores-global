# Instruções de Projeto — Semeadores de Fogo Global

Este documento define as regras permanentes de engenharia e o fluxo de trabalho para agentes operando neste repositório no Google Antigravity / VS Code.

## Fluxo Obrigatório de Desenvolvimento

Toda tarefa de desenvolvimento deve seguir rigorosamente as etapas abaixo:

**Interpretar → Planejar → Aprovar → Implementar → Testar → Revisar**

1. **Interpretar:** Ler e investigar o código existente, tipos, rotas e componentes relacionados antes de propor qualquer alteração.
2. **Planejar:** Definir um plano objetivo de implementação, identificando arquivos impactados, riscos, migrações necessárias e critérios de teste.
3. **Aprovar:** Solicitar aprovação explícita do usuário antes de executar mudanças estruturais, alterações de esquema/banco de dados, migrações em dados reais ou deploys.
4. **Implementar:** Executar o plano de forma incremental, priorizando soluções simples, seguras, modulares e reutilizáveis, preservando todas as funcionalidades existentes.
5. **Testar:** Exigir e executar testes automatizados (`npm test`, `npm run lint` e testes E2E/Playwright quando aplicável) antes de considerar qualquer implementação concluída.
6. **Revisar:** Verificar aderência aos requisitos, segurança, isolamento de dados entre regionais/igrejas e qualidade do diff final.

## Uso Automático de Skills (Superpowers)

O projeto utiliza o plugin oficial **Superpowers** instalado no Antigravity. Acione automaticamente as skills adequadas para cada etapa:

- `using-superpowers` — Identificar e acionar as skills necessárias no início de cada tarefa.
- `brainstorming` — Interpretar requisitos ambíguos e definir soluções de arquitetura/produto.
- `writing-plans` — Estruturar planos de implementação antes de alterar código.
- `executing-plans` — Executar planos aprovados passo a passo.
- `test-driven-development` — Desenvolver novas funcionalidades e correções guiadas por testes.
- `systematic-debugging` — Investigar causas raiz de bugs antes de aplicar correções.
- `verification-before-completion` — Validar build, lint, testes e comportamento real antes de encerrar.
- `requesting-code-review` — Revisar alterações antes de consolidar entregas.
- `using-git-worktrees` — Isolar alterações relevantes em branches/worktrees dedicados.
- `writing-skills` — Criar ou ajustar skills locais apenas quando necessário.

**Regra de não duplicação:** Não duplique em `.agents/skills/` skills já fornecidas pelo plugin Superpowers. Crie skills locais em `.agents/skills/` apenas para fluxos específicos do projeto não cobertos pelo plugin.

## Diretrizes Técnicas e de Segurança

- **Isolamento de Branches:** Para mudanças relevantes (novas features, refatorações, migrações), trabalhe em branches isoladas (ou git worktrees) a partir de `main`.
- **Preservação:** Nunca remova ou quebre funcionalidades existentes, histórico Git ou configurações de ambiente sem solicitação explícita.
- **Segurança & Multi-tenancy:** Qualquer rota ou funcionalidade envolvendo usuários, regionais/igrejas, relatórios bimestrais ou contatos de consolidação (dados sensíveis religiosos sob LGPD) deve validar autenticação, papel (`RoleType`) e escopo (`regionId`) no servidor.
- **Integridade da IA (Gemini) e Modelo Oficial de Relatório (REGRA OBRIGATÓRIA):**
  - A análise de relatórios via Gemini é estritamente uma ferramenta de apoio analítico e síntese administrativa baseada nos dados reais do banco. Nunca inventar métricas nem gerar interpretações espirituais/proféticas.
  - **Formato Obrigatório (independentemente do modelo — `gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.5-flash` ou fallback):** Toda geração de relatório por IA DEVE produzir um objeto JSON válido compatível com `templates/relatorio-ia/dados-exemplo.json` (textos simples, sem Markdown) e renderizar o HTML oficial em `templates/relatorio-ia/modelo-relatorio-semeadores.html` via `server/reportTemplate.ts`.
  - **Atualização Automática com Novos Dados:** Toda vez que houver novos dados (novos relatórios, edições ou novas regionais), o relatório entregue pela IA DEVE ser regerado/atualizado com os dados mais recentes do banco (validado por `dataFingerprint`, nunca servindo relatório defasado).
- **Comandos de Verificação:**
  - `npm run lint` (`tsc --noEmit`)
  - `npm test` (`node --test src/utils/metrics.test.ts`)
  - `npm run build` (`vite build`)
