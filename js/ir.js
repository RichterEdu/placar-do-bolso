// Calculadora do IR mensal de quem tem carteira assinada (sem dependentes).
// Fontes: Lei 15.270/2025 (redução do IR a partir de jan/2026),
// tabela progressiva mensal da Receita Federal e tabela do INSS 2026
// (Portaria Interministerial MPS/MF nº 13/2026).

// Faixas do INSS 2026: cálculo progressivo via parcela a deduzir.
const INSS_FAIXAS = [
  { ate: 1621.0, aliquota: 0.075, deduzir: 0 },
  { ate: 2902.84, aliquota: 0.09, deduzir: 24.32 },
  { ate: 4354.27, aliquota: 0.12, deduzir: 111.4 },
  { ate: 8475.55, aliquota: 0.14, deduzir: 198.49 },
];
const INSS_TETO = 8475.55;

// Tabela progressiva mensal do IRRF (vigente desde maio/2025, mantida em 2026).
const IR_FAIXAS = [
  { ate: 2428.8, aliquota: 0, deduzir: 0 },
  { ate: 2826.65, aliquota: 0.075, deduzir: 182.16 },
  { ate: 3751.05, aliquota: 0.15, deduzir: 394.16 },
  { ate: 4664.68, aliquota: 0.225, deduzir: 675.49 },
  { ate: Infinity, aliquota: 0.275, deduzir: 908.73 },
];

// Desconto simplificado mensal: substitui as deduções legais quando compensa.
const DESCONTO_SIMPLIFICADO = 607.2;

// Lei 15.270/2025: até R$ 5 mil o imposto zera; até R$ 7.350 cai de forma gradual.
const LIMITE_ISENCAO = 5000;
const LIMITE_REDUCAO = 7350;
const REDUCAO_MAXIMA = 312.89;

// Imposto mínimo da mesma lei: só para renda acima de R$ 600 mil/ano.
const LIMITE_IMPOSTO_MINIMO = 50000;

// Arredonda para centavos sem tropeçar em erro de ponto flutuante (ex.: 121,575).
function arred(valor) {
  return Math.round(Number((valor * 100).toPrecision(12))) / 100;
}

function faixaDe(valor, faixas) {
  return faixas.find((f) => valor <= f.ate) ?? faixas[faixas.length - 1];
}

export function inss(bruto) {
  const base = Math.min(bruto, INSS_TETO);
  if (base <= 0) return 0;
  const f = faixaDe(base, INSS_FAIXAS);
  return arred(base * f.aliquota - f.deduzir);
}

export function impostoTabela(base) {
  if (base <= 0) return 0;
  const f = faixaDe(base, IR_FAIXAS);
  return Math.max(0, arred(base * f.aliquota - f.deduzir));
}

export function reducaoLei15270(bruto, impostoDevido) {
  let reducao = 0;
  if (bruto <= LIMITE_ISENCAO) reducao = REDUCAO_MAXIMA;
  else if (bruto <= LIMITE_REDUCAO) reducao = arred(978.62 - 0.133145 * bruto);
  return Math.min(impostoDevido, Math.max(0, reducao));
}

// Devolve o IR mensal sem a nova lei ("antes") e com ela ("depois").
export function calcular(salarioBruto) {
  const bruto = Number.isFinite(salarioBruto) && salarioBruto > 0 ? salarioBruto : 0;
  const comDeducoes = impostoTabela(bruto - inss(bruto));
  const comSimplificado = impostoTabela(bruto - DESCONTO_SIMPLIFICADO);
  const antes = Math.min(comDeducoes, comSimplificado);
  const depois = arred(antes - reducaoLei15270(bruto, antes));
  const economiaMes = arred(antes - depois);
  return {
    antes,
    depois,
    economiaMes,
    economiaAno: arred(economiaMes * 12),
    impostoMinimo: bruto > LIMITE_IMPOSTO_MINIMO,
  };
}
