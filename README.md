# Placar do Bolso — Lula x Bolsonaro

Site estático (HTML, CSS e JS puros, sem build) que compara, com fonte em cada número, o que os governos Bolsonaro (2019–2022) e Lula (2023–2026) fizeram em temas que afetam todo mundo. Tem também uma calculadora do Imposto de Renda de 2026.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | Todo o conteúdo: cards, gráficos, seção do Flávio e lista de fontes |
| `noticias.html` | Notícias recentes sobre o Flávio, cada uma com data, etiqueta, resposta dele e link para a matéria |
| `css/style.css` | Visual, mobile-first, com modo escuro |
| `js/ir.js` | Cálculo do IR (tabelas 2026 da Receita e do INSS, Lei 15.270/2025) |
| `js/main.js` | Botões de WhatsApp e copiar link, e a calculadora |
| `img/og.png` | Imagem que aparece ao compartilhar o link |
| `og.html` | Molde usado para gerar `img/og.png` |
| `tests/ir.test.mjs` | Testes da calculadora |
| `tests/noticias.test.mjs` | Confere que toda notícia tem data, etiqueta, fonte e está em ordem |

## Rodar localmente

```bash
py -m http.server 8123
```

Depois abra http://localhost:8123.

## Testar a calculadora

```bash
node --test "tests/*.test.mjs"
```

## Atualizar um número

1. Ache o card no `index.html` (cada um tem um `id`, ex.: `id="desemprego"`).
2. Troque o número no texto, no `data-resumo` (texto que vai para o WhatsApp) e, se houver gráfico, no `--v` e no `aria-label` da barra.
3. Se a fonte mudar, atualize o item correspondente em `<ol class="fontes">`.
4. Atualize a data no rodapé.
5. Mudou o CSS ou o JS? Troque o `?v=` de `css/style.css` e `js/main.js` nos dois HTML (`index.html` e `noticias.html`), senão o navegador de quem já visitou continua com a versão antiga por até 4 horas.

## Adicionar uma notícia

1. Copie um `<article class="card fato noticia">` do `noticias.html` e coloque na posição certa: da mais nova para a mais antiga.
2. Preencha o `id`, o `data-resumo` (texto do WhatsApp), o `<time datetime="AAAA-MM-DD">`, a etiqueta (Investigação, Ação no TSE, Reportagem, Checagem, Decisão do TSE ou Fala dele), o texto, a resposta dele e a linha de fonte.
3. Atualize a data no topo e no rodapé da página.
4. Rode os testes: eles falham se faltar fonte, data ou etiqueta, ou se a ordem estiver errada.

## Regerar a imagem de compartilhamento

Com o servidor local rodando:

```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --hide-scrollbars --window-size=1200,630 --screenshot="$(pwd -W)/img/og.png" http://127.0.0.1:8123/og.html
```

## Regras do conteúdo

- Todo número tem link para a fonte, de preferência oficial (IBGE, Inpe, ANP, Receita, Senado, Banco Central).
- Mesmo indicador e mesma fonte para os dois governos.
- Nas notícias: só matéria de veículo identificado, nada de boato. Acusação é chamada de acusação, e a resposta do Flávio entra quando a matéria traz.
- No dia da eleição é proibido publicar conteúdo novo (Lei 9.504/97, art. 39, §5º, IV). Atualize até a véspera.
- O rodapé identifica o autor (Lei 9.504/97, art. 57-D: é proibido anonimato em manifestação eleitoral na internet). Pessoa física não pode pagar impulsionamento.
