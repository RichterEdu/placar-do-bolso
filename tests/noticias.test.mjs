// Testes da página de notícias: toda notícia tem data, etiqueta e fonte. Rodar com: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ler = (arquivo) => readFileSync(new URL(`../${arquivo}`, import.meta.url), 'utf8');
const noticias = ler('noticias.html');
const index = ler('index.html');

// Cada <article class="card ..."> da página, com o HTML de dentro.
const cards = [...noticias.matchAll(/<article class="card[^"]*"([^>]*)>([\s\S]*?)<\/article>/g)]
  .map(([, atributos, corpo]) => ({ atributos, corpo, id: atributos.match(/id="([^"]+)"/)?.[1] }));
const cardsNoticia = [...noticias.matchAll(/<article class="card[^"]*\bnoticia\b[^"]*"([^>]*)>([\s\S]*?)<\/article>/g)]
  .map(([, atributos, corpo]) => ({ atributos, corpo, id: atributos.match(/id="([^"]+)"/)?.[1] }));

test('a página tem o destaque e pelo menos 8 notícias', () => {
  assert.ok(cards.some((c) => c.id === 'desafio-sigilos'), 'falta o destaque dos sigilos');
  assert.ok(cardsNoticia.length >= 8, `só ${cardsNoticia.length} notícias`);
});

test('todo card tem id único e texto para o WhatsApp', () => {
  const ids = cards.map((c) => c.id);
  assert.ok(ids.every(Boolean), 'card sem id');
  assert.equal(new Set(ids).size, ids.length, 'id repetido');
  for (const c of cards) assert.match(c.atributos, /data-resumo="[^"]{40,}"/, `${c.id} sem data-resumo`);
});

test('todo card tem pelo menos um link de fonte que abre em outra aba', () => {
  for (const c of cards) {
    const links = [...c.corpo.matchAll(/<a href="(https:\/\/[^"]+)" target="_blank" rel="noopener">/g)];
    assert.ok(links.length > 0, `${c.id} sem fonte`);
  }
});

test('toda notícia tem data e etiqueta', () => {
  for (const c of cardsNoticia) {
    assert.match(c.corpo, /<time datetime="\d{4}-\d{2}-\d{2}">/, `${c.id} sem data`);
    assert.match(c.corpo, /class="etiqueta[^"]*">[^<]+</, `${c.id} sem etiqueta`);
    assert.match(c.corpo, /class="fonte-noticia"/, `${c.id} sem linha de fonte`);
  }
});

test('notícias vêm da mais nova para a mais antiga', () => {
  const datas = cardsNoticia.map((c) => c.corpo.match(/<time datetime="([^"]+)">/)[1]);
  assert.deepEqual(datas, [...datas].sort().reverse());
});

test('o menu do site leva para a página de notícias', () => {
  assert.match(index, /<a class="menu-noticias[^"]*" href="noticias\.html">Notícias<\/a>/);
  assert.match(noticias, /<a class="menu-noticias[^"]*" href="noticias\.html" aria-current="page">Notícias<\/a>/);
});
