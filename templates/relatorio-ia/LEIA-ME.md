# Modelo de relatório global — Semeadores de Fogo

Este pacote reúne o layout HTML autocontido e os dados de exemplo. O PDF entregue separadamente foi impresso a partir deste mesmo HTML, em A4, com fundos e fontes incorporados.

## Arquivos

- modelo-relatorio-semeadores.html: template, estilos, logomarca e Montserrat incorporados. Abre localmente, sem carregar fontes ou imagens externas.
- dados-exemplo.json: estrutura de dados para preencher o modelo com a resposta da IA.
- LEIA-ME.md: orientações de integração.
- OFL-Montserrat.txt: licença da fonte.

## Como preencher

A IA deve produzir um objeto JSON com a estrutura de dados-exemplo.json. Os textos dos campos devem ser texto simples, sem títulos Markdown, asteriscos ou tabelas Markdown. As seis seções são montadas pelo template. Não enviar toda a resposta da IA como um único bloco de texto.

Depois de carregar o HTML e aguardar document.fonts.ready, chamar:

```js
window.renderReport(dadosDoRelatorio);
```

Também é possível substituir o JSON dentro do elemento script com id report-data antes de carregar o HTML. Nesse caso, serializar de forma segura: escapar o caractere < como \\u003c antes de inserir no script. Não interpolar HTML produzido pela IA. Os campos de texto renderizados pelo template são escapados.

A função renderReport retorna a quantidade de páginas. Para imprimir por Chromium/Playwright: aguardar document.fonts.ready e window.reportReady; imprimir com printBackground: true e preferCSSPageSize: true. Após uma atualização assíncrona de dados, aguardar a chamada de renderReport terminar antes de imprimir. O botão Salvar em PDF usa a impressão do navegador; escolher A4, margens nenhuma, fundos ativados e cabeçalhos/rodapés do navegador desativados.

## Campos e critérios

- periodo, meses, ano e intervalo: identificação do período.
- introducao: apresentação dirigida à liderança.
- leituraExecutiva e leituraMetas: título e texto das análises consolidadas.
- regionais: lista variável com identificação, coordenação, resultados, frequência, diagnóstico, ponto forte, relato, atenção e próximos passos declarados.
- gargalos: lista variável de dificuldades, com regional de origem.
- recomendacoes: lista variável de encaminhamentos. prioridade é opcional. Recomendação não significa aprovação, despacho ou gasto já realizado.
- demais: situação das regionais sem dados e encaminhamento proposto.

Os indicadores gerais são calculados a partir das regionais. Não inserir uma linha Total como regional, para evitar duplicação. Informar quantidades como números; usar null para dado desconhecido. Ausência de relatório não equivale a zero atividade. Caso algum total necessário esteja ausente, o modelo mostra Não informado.

Participações são somas de presenças, sem inferir pessoas únicas. A taxa de contatos é contatos autorizados / almas alcançadas. As médias são totais / ações, com uma casa decimal. O modelo não calcula porcentagem exata de cumprimento de metas sem calendário aprovado. O diagnóstico de cada regional vem dos dados e da análise, não é inferido apenas pela frequência.

O layout gera páginas adicionais quando o conteúdo aumenta. Tabelas são agrupadas em blocos de até quatro regionais com cabeçalhos repetidos; textos excepcionalmente longos continuam em blocos de leitura, com o título da seção repetido. A contagem de páginas é atualizada automaticamente. O exemplo foi validado com duas regionais, com quinze regionais e textos extensos, e com dados ausentes. Novos formatos de conteúdo exigem nova revisão visual.

Este pacote é o modelo de apresentação. A conexão com a base de dados, a geração da análise por IA e a validação dos relatórios de origem continuam sob responsabilidade da plataforma. O PDF de exemplo não representa uma aprovação ministerial nem uma ação executada.
