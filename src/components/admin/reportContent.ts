import type { StructuredReportData } from '../../../server/reportTemplate';

export function reportSections(data: StructuredReportData) {
  const value = (n: number | null) => (n == null ? 'Não informado' : String(n));
  const total = (key: 'acoes' | 'participacoes' | 'almas' | 'contatos') =>
    data.regionais.length && data.regionais.every((r) => r[key] != null)
      ? String(data.regionais.reduce((a, r) => a + r[key]!, 0))
      : 'Não informado';
  return [
    {
      title: 'Resumo executivo',
      rows: [
        [
          'Período',
          [data.periodo, data.meses, data.intervalo]
            .filter(Boolean)
            .join(' · '),
        ],
        ['Panorama', data.introducao],
        [data.leituraExecutiva.titulo, data.leituraExecutiva.texto],
        [
          'Indicadores consolidados',
          `Ações: ${total('acoes')} · Participações: ${total('participacoes')} · Almas: ${total('almas')} · Contatos: ${total('contatos')}`,
        ],
        [data.leituraMetas.titulo, data.leituraMetas.texto],
      ],
    },
    ...data.regionais.map((r) => ({
      title: r.nome,
      rows: [
        [
          'Regional',
          [r.local, r.coordenador, r.status, r.frequencia]
            .filter(Boolean)
            .join(' · '),
        ],
        [
          'Resultados',
          `Ações: ${value(r.acoes)} · Participações: ${value(r.participacoes)} · Almas: ${value(r.almas)} · Contatos: ${value(r.contatos)}`,
        ],
        ['Diagnóstico', r.diagnostico],
        ['Pontos fortes', r.forte],
        ['Relato', r.relato],
        ['Atenção', r.atencao],
        ['Próximos passos', r.proximos],
      ],
    })),
    {
      title: 'Pontos de atenção',
      rows: data.gargalos.map((g) => [
        [g.titulo, g.regional].filter(Boolean).join(' · '),
        g.texto,
      ]),
    },
    {
      title: 'Recomendações',
      rows: data.recomendacoes.map((r) => [
        [r.titulo, r.escopo, r.prioridade].filter(Boolean).join(' · '),
        r.texto,
      ]),
    },
    {
      title: data.demais.titulo,
      rows: [
        ['Abrangência', data.demais.status],
        ['Situação', data.demais.texto],
        ['Encaminhamento', data.demais.recomendacao],
      ],
    },
  ]
    .map((s) => ({ ...s, rows: s.rows.filter(([, text]) => text?.trim()) }))
    .filter((s) => s.rows.length);
}

export async function downloadReport(data: StructuredReportData) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const pdf = new jsPDF({ compress: true });
  pdf.setProperties({ title: 'Relatório consolidado — ' + data.periodo });
  pdf.setFontSize(20);
  pdf.text('Relatório consolidado', 14, 20);
  pdf.setFontSize(10);
  pdf.text('Semeadores de Fogo Global', 14, 28);
  autoTable(pdf, {
    startY: 34,
    margin: { top: 15, bottom: 16 },
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2.5, overflow: 'linebreak' },
    columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' } },
    body: reportSections(data).flatMap((section) =>
      section.rows.map(([label, value], i) => [
        i === 0
          ? {
              content: section.title + '\n' + label,
              styles: {
                textColor: [10, 56, 85] as [number, number, number],
                fillColor: [234, 241, 246] as [number, number, number],
              },
            }
          : label,
        value,
      ]),
    ),
    didDrawPage: ({ pageNumber }) => {
      pdf.setFontSize(8);
      pdf.text('Semeadores de Fogo  /  ' + pageNumber, 14, 289);
    },
  });
  pdf.save(
    'relatorio-semeadores-' +
      data.periodo.replace(/[^\p{L}\d]+/gu, '-') +
      '.pdf',
  );
}
