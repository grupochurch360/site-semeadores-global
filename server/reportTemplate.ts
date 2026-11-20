import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import type { BimonthlyReport, Region } from '../src/types/index.ts';

export const RegionalEntrySchema = z.object({
  nome: z.string().min(1),
  local: z.string(),
  coordenador: z.string(),
  acoes: z.number().nullable(),
  participacoes: z.number().nullable(),
  almas: z.number().nullable(),
  contatos: z.number().nullable(),
  frequencia: z.string(),
  status: z.string(),
  diagnostico: z.string(),
  forte: z.string(),
  relato: z.string(),
  atencao: z.string(),
  proximos: z.string(),
});

export const StructuredReportSchema = z.object({
  periodo: z.string().min(1),
  meses: z.string(),
  ano: z.string(),
  intervalo: z.string(),
  introducao: z.string().min(1),
  leituraExecutiva: z.object({
    titulo: z.string().min(1),
    texto: z.string().min(1),
  }),
  leituraMetas: z.object({
    titulo: z.string().min(1),
    texto: z.string().min(1),
  }),
  regionais: z.array(RegionalEntrySchema),
  gargalos: z.array(
    z.object({
      titulo: z.string().min(1),
      regional: z.string().min(1),
      texto: z.string().min(1),
    })
  ),
  recomendacoes: z.array(
    z.object({
      titulo: z.string().min(1),
      escopo: z.string().min(1),
      prioridade: z.string().optional(),
      texto: z.string().min(1),
    })
  ),
  demais: z.object({
    titulo: z.string().min(1),
    status: z.string().min(1),
    texto: z.string().min(1),
    recomendacao: z.string().min(1),
  }),
});

export type StructuredReportData = z.infer<typeof StructuredReportSchema>;

const TEMPLATE_PATH = path.resolve(
  process.cwd(),
  'templates',
  'relatorio-ia',
  'modelo-relatorio-semeadores.html'
);

let cachedTemplateHtml: string | null = null;

function getTemplateHtml(): string {
  if (!cachedTemplateHtml) {
    cachedTemplateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  }
  return cachedTemplateHtml;
}

export function renderOfficialReportHtml(reportData: StructuredReportData): string {
  const validated = StructuredReportSchema.parse(reportData);
  const template = getTemplateHtml();
  const safeJson = JSON.stringify(validated).replace(/</g, '\\u003c');
  const pattern = /<script id="report-data" type="application\/json">[\s\S]*?<\/script>/;
  if (!pattern.test(template)) {
    throw new Error('Template oficial inválido: tag <script id="report-data"> não encontrada.');
  }
  return template.replace(
    pattern,
    `<script id="report-data" type="application/json">${safeJson}</script>`
  );
}

export function computeDataFingerprint(reports: BimonthlyReport[], regions: Region[]): string {
  const payload = JSON.stringify({
    reports: reports.map((r) => ({
      id: r.id,
      updatedAt: r.updatedAt,
      status: r.status,
      evangelismsCount: r.evangelismsCount,
      totalParticipantsSum: r.totalParticipantsSum,
      totalSoulsReached: r.totalSoulsReached,
      authorizedContactsCount: r.authorizedContactsCount,
      strengths: r.strengths,
      challenges: r.challenges,
      regionalNeeds: r.regionalNeeds,
      proposedImprovements: r.proposedImprovements,
      nextPeriodPlanning: r.nextPeriodPlanning,
    })),
    regions: regions.map((rg) => ({
      id: rg.id,
      name: rg.name,
      status: rg.status,
      evangelismFrequency: rg.evangelismFrequency,
      membersCount: rg.membersCount,
    })),
  });
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

export function parsePeriodMetadata(targetPeriod?: string): {
  periodo: string;
  meses: string;
  ano: string;
  intervalo: string;
} {
  const nowYear = String(new Date().getFullYear());
  if (!targetPeriod) {
    return {
      periodo: `Consolidado Geral (${nowYear})`,
      meses: 'Todos os Bimestres',
      ano: nowYear,
      intervalo: `01/01/${nowYear} a 31/12/${nowYear}`,
    };
  }

  const yearMatch = targetPeriod.match(/(20\d{2})/);
  const ano = yearMatch ? yearMatch[1] : '2026';
  const bimMatch = targetPeriod.match(/([1-6])\s*[º°o]?/i);
  const bimMap: Record<string, { meses: string; start: string; end: string }> = {
    '1': { meses: 'Janeiro / Fevereiro', start: '01/01', end: '28/02' },
    '2': { meses: 'Março / Abril', start: '01/03', end: '30/04' },
    '3': { meses: 'Maio / Junho', start: '01/05', end: '30/06' },
    '4': { meses: 'Julho / Agosto', start: '01/07', end: '31/08' },
    '5': { meses: 'Setembro / Outubro', start: '01/09', end: '31/10' },
    '6': { meses: 'Novembro / Dezembro', start: '01/11', end: '31/12' },
  };
  if (bimMatch && bimMap[bimMatch[1]]) {
    const info = bimMap[bimMatch[1]];
    return {
      periodo: `${bimMatch[1]}º Bimestre de ${ano}`,
      meses: info.meses,
      ano,
      intervalo: `${info.start}/${ano} a ${info.end}/${ano}`,
    };
  }
  return {
    periodo: targetPeriod,
    meses: targetPeriod,
    ano,
    intervalo: `Ano ${ano}`,
  };
}

export function buildStructuredReportPrompt(
  summaryPayload: unknown[],
  missingRegions: string[],
  periodMeta: { periodo: string; meses: string; ano: string; intervalo: string }
): string {
  return `Você é o assistente de inteligência e governança administrativa da liderança dos SEMEADORES DE FOGO GLOBAL.
Sua obrigação é produzir EXCLUSIVAMENTE um objeto JSON válido (sem blocos de código Markdown, sem \`\`\`json, sem comentários fora do JSON) seguindo EXATAMENTE o esquema oficial do modelo de relatório da plataforma.

REGRAS OBRIGATÓRIAS:
1. Retorne SOMENTE JSON puro e válido.
2. Todos os campos de texto devem ser TEXTO SIMPLES (sem Markdown, sem #, sem **asteriscos**, sem tabelas Markdown).
3. Baseie-se ESTRITAMENTE nos dados reais fornecidos abaixo. Nunca invente números, fatos ou nomes. Use null quando uma quantidade for desconhecida.
4. NÃO insira uma linha "Total" dentro do array "regionais" (o template calcula os totais automaticamente).
5. Não gere interpretações espirituais, profecias ou revelações sobrenaturais. Você é uma ferramenta de síntese administrativa.
6. Recomendação não representa aprovação nem gasto já realizado. Ausência de relatório não equivale a zero atividade.

ESQUEMA JSON OBRIGATÓRIO:
{
  "periodo": "${periodMeta.periodo}",
  "meses": "${periodMeta.meses}",
  "ano": "${periodMeta.ano}",
  "intervalo": "${periodMeta.intervalo}",
  "introducao": "string dirigida à Liderança Global resumindo o escopo real analisado",
  "leituraExecutiva": {
    "titulo": "título curto e objetivo",
    "texto": "síntese executiva dos resultados e necessidades"
  },
  "leituraMetas": {
    "titulo": "título curto sobre metas e constância",
    "texto": "análise das frequências semanal vs quinzenal e encaminhamentos"
  },
  "regionais": [
    {
      "nome": "Nome da Regional (ex: São Paulo)",
      "local": "Cidade / Região",
      "coordenador": "Nome do coordenador",
      "acoes": 0,
      "participacoes": 0,
      "almas": 0,
      "contatos": 0,
      "frequencia": "Semanal ou Quinzenal",
      "status": "Relatório submetido / Aprovado / Rascunho",
      "diagnostico": "Diagnóstico curto baseado nos dados",
      "forte": "Principal ponto forte",
      "relato": "Resumo objetivo das atividades e locais",
      "atencao": "Pontos de atenção, gargalos e necessidades",
      "proximos": "Próximos passos declarados pela regional"
    }
  ],
  "gargalos": [
    { "titulo": "Título do gargalo", "regional": "Regional de origem", "texto": "Descrição objetiva" }
  ],
  "recomendacoes": [
    { "titulo": "Título da recomendação", "escopo": "Regional ou Global", "prioridade": "Prioridade máxima (opcional)", "texto": "Encaminhamento prático" }
  ],
  "demais": {
    "titulo": "Demais regionais globais",
    "status": "Sem dados no conjunto analisado",
    "texto": "Explicação objetiva listando as regionais sem relatório neste período: ${missingRegions.join(', ') || 'nenhuma pendente'}",
    "recomendacao": "Encaminhamento para coleta dos relatórios pendentes"
  }
}

DADOS REAIS DOS RELATÓRIOS SUBMETIDOS NO BANCO DE DADOS:
${JSON.stringify(summaryPayload, null, 2)}

REGIONAIS CADASTRADAS SEM RELATÓRIO NESTE PERÍODO:
${JSON.stringify(missingRegions)}`;
}

export function extractJsonFromModelText(rawText: string): unknown {
  const trimmed = rawText.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Resposta da IA não contém objeto JSON válido');
  }
  return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
}

export function buildFallbackStructuredReport(
  filteredReports: BimonthlyReport[],
  allRegions: Region[],
  periodMeta: { periodo: string; meses: string; ano: string; intervalo: string }
): StructuredReportData {
  const reportedRegionIds = new Set(filteredReports.map((r) => r.regionId));
  const missingRegions = allRegions.filter((rg) => !reportedRegionIds.has(rg.id)).map((rg) => rg.name);

  const regionais = filteredReports.map((r) => {
    const reg = allRegions.find((rg) => rg.id === r.regionId);
    const freqLabel = reg?.evangelismFrequency === 'weekly' ? 'Semanal' : 'Quinzenal';
    const statusLabelMap: Record<string, string> = {
      draft: 'Rascunho',
      submitted: 'Relatório submetido',
      in_review: 'Em revisão',
      approved: 'Aprovado',
      returned: 'Devolvido para ajustes',
    };
    const expectedActions = reg?.evangelismFrequency === 'weekly' ? 8 : 4;
    const diagnostico =
      r.evangelismsCount >= expectedActions ? 'Dentro do ritmo previsto' : 'Abaixo do ritmo previsto';

    return {
      nome: reg ? reg.name.split('(')[0].trim().replace(/^Regional\s+/i, '') : r.regionId,
      local: reg ? `${reg.city} / ${reg.state}` : 'Não informado',
      coordenador: r.coordinatorName || reg?.coordinatorName || 'Não informado',
      acoes: typeof r.evangelismsCount === 'number' ? r.evangelismsCount : null,
      participacoes: typeof r.totalParticipantsSum === 'number' ? r.totalParticipantsSum : null,
      almas: typeof r.totalSoulsReached === 'number' ? r.totalSoulsReached : null,
      contatos: typeof r.authorizedContactsCount === 'number' ? r.authorizedContactsCount : null,
      frequencia: freqLabel,
      status: statusLabelMap[r.status] || r.status,
      diagnostico,
      forte: r.strengths ? r.strengths.split('.')[0].trim() : 'Engajamento da equipe local',
      relato: r.activitiesDescription || 'Atividades evangelísticas registradas no período.',
      atencao: [r.challenges, r.regionalNeeds].filter(Boolean).join(' ') || 'Sem pontos críticos registrados.',
      proximos: r.nextPeriodPlanning || 'Aguardando definição de próximos passos.',
    };
  });

  const gargalos = filteredReports
    .filter((r) => r.challenges || r.regionalNeeds)
    .map((r) => {
      const reg = allRegions.find((rg) => rg.id === r.regionId);
      const nome = reg ? reg.name.split('(')[0].trim().replace(/^Regional\s+/i, '') : r.regionId;
      return {
        titulo: `Necessidades e gargalos — ${nome}`,
        regional: nome,
        texto: [r.challenges, r.regionalNeeds].filter(Boolean).join(' '),
      };
    });

  const recomendacoes = filteredReports
    .filter((r) => r.proposedImprovements || r.regionalNeeds)
    .map((r, idx) => {
      const reg = allRegions.find((rg) => rg.id === r.regionId);
      const nome = reg ? reg.name.split('(')[0].trim().replace(/^Regional\s+/i, '') : r.regionId;
      return {
        titulo: `Encaminhamento para ${nome}`,
        escopo: nome,
        ...(idx === 0 ? { prioridade: 'Prioridade máxima' } : {}),
        texto: r.proposedImprovements || r.regionalNeeds || 'Avaliar demandas apresentadas no relatório.',
      };
    });

  if (recomendacoes.length === 0) {
    recomendacoes.push({
      titulo: 'Coleta de relatórios pendentes',
      escopo: 'Coordenações regionais',
      texto: 'Alinhar o envio dos relatórios bimestrais para ampliar a visão consolidada do período.',
    });
  }

  return {
    periodo: periodMeta.periodo,
    meses: periodMeta.meses,
    ano: periodMeta.ano,
    intervalo: periodMeta.intervalo,
    introducao: `Prezada Liderança Global dos Semeadores de Fogo Global, apresentamos o relatório consolidado referente a ${periodMeta.periodo}, elaborado diretamente a partir dos ${filteredReports.length} relatórios registrados na plataforma.`,
    leituraExecutiva: {
      titulo: 'Consolidação operacional das regionais reportadas',
      texto:
        filteredReports.length > 0
          ? `Foram consolidados ${filteredReports.length} relatórios bimestrais reais da base de dados, reunindo resultados de campo, pontos fortes e demandas que exigem encaminhamento na reunião de liderança.`
          : 'Nenhum relatório foi submetido para o filtro selecionado até o momento.',
    },
    leituraMetas: {
      titulo: 'Acompanhamento de constância e frequência',
      texto:
        'A análise compara as ações executadas com a periodicidade prevista de cada regional (semanal ou quinzenal) e destaca os pontos de apoio necessários.',
    },
    regionais,
    gargalos:
      gargalos.length > 0
        ? gargalos
        : [
            {
              titulo: 'Sem gargalos registrados',
              regional: 'Global',
              texto: 'Nenhum gargalo foi declarado nos relatórios filtrados.',
            },
          ],
    recomendacoes,
    demais: {
      titulo: 'Demais regionais globais',
      status: missingRegions.length > 0 ? 'Sem dados no conjunto analisado' : 'Todas as regionais reportaram',
      texto:
        missingRegions.length > 0
          ? `Não foram encontrados relatórios no período para: ${missingRegions.join(', ')}. A ausência de relatório não equivale a ausência de atividades.`
          : 'Todas as regionais cadastradas possuem relatório incluído nesta consolidação.',
      recomendacao:
        missingRegions.length > 0
          ? 'Solicitar às coordenações pendentes o envio dos relatórios para atualizar automaticamente esta consolidação.'
          : 'Manter o acompanhamento bimestral regular.',
    },
  };
}

export function formatPlainSummary(data: StructuredReportData): string {
  const lines: string[] = [
    `${data.periodo} (${data.meses})`,
    '',
    data.introducao,
    '',
    `LEITURA EXECUTIVA — ${data.leituraExecutiva.titulo}`,
    data.leituraExecutiva.texto,
    '',
    `METAS E FREQUÊNCIA — ${data.leituraMetas.titulo}`,
    data.leituraMetas.texto,
  ];
  if (data.gargalos.length > 0) {
    lines.push('', 'GARGALOS RECORRENTES:');
    for (const g of data.gargalos) {
      lines.push(`- ${g.titulo} (${g.regional}): ${g.texto}`);
    }
  }
  if (data.recomendacoes.length > 0) {
    lines.push('', 'RECOMENDAÇÕES:');
    for (const rec of data.recomendacoes) {
      lines.push(`- ${rec.titulo} (${rec.escopo}): ${rec.texto}`);
    }
  }
  return lines.join('\n');
}
