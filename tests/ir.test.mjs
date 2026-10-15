// Testes da calculadora do IR. Rodar com: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inss, impostoTabela, reducaoLei15270, calcular } from '../js/ir.js';

test('INSS 2026 respeita faixas e teto', () => {
  assert.equal(inss(1621), 121.58);
  assert.equal(inss(3000), 248.6);
  assert.equal(inss(8475.55), 988.09);
  assert.equal(inss(20000), 988.09);
});

test('tabela progressiva bate com exemplo publicado (base R$ 5.264,40 -> R$ 538,98)', () => {
  assert.equal(impostoTabela(5264.4), 538.98);
  assert.equal(impostoTabela(2428.8), 0);
});

test('redução da Lei 15.270 para R$ 5.900 é R$ 193,06', () => {
  assert.equal(reducaoLei15270(5900, 1000), 193.06);
});

test('redução nunca passa do imposto devido nem fica negativa', () => {
  assert.equal(reducaoLei15270(5900, 100), 100);
  assert.equal(reducaoLei15270(7350, 500), 0);
  assert.equal(reducaoLei15270(9000, 500), 0);
});

test('quem ganha até R$ 5 mil não paga IR em 2026', () => {
  const r = calcular(5000);
  assert.equal(r.antes, 312.89);
  assert.equal(r.depois, 0);
  assert.equal(r.economiaMes, 312.89);
});

test('salário de R$ 3.000 já era isento antes da nova lei', () => {
  const r = calcular(3000);
  assert.equal(r.antes, 0);
  assert.equal(r.depois, 0);
});

test('faixa de transição tem desconto parcial', () => {
  const r = calcular(6000);
  assert.ok(r.depois > 0 && r.depois < r.antes);
  assert.equal(r.economiaMes, 179.75);
});

test('acima de R$ 7.350 nada muda', () => {
  const r = calcular(10000);
  assert.equal(r.antes, 1569.55);
  assert.equal(r.depois, r.antes);
  assert.equal(r.economiaMes, 0);
});

test('imposto mínimo só a partir de R$ 50 mil por mês', () => {
  assert.equal(calcular(49999).impostoMinimo, false);
  assert.equal(calcular(50001).impostoMinimo, true);
});

test('entrada inválida vira zero', () => {
  assert.equal(calcular(NaN).antes, 0);
  assert.equal(calcular(-10).depois, 0);
});
