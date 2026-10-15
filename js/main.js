// Compartilhamento (WhatsApp / copiar link) e calculadora do IR.
import { calcular } from './ir.js';

const reais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function urlDaPagina(ancora) {
  const base = location.origin + location.pathname;
  return ancora ? `${base}#${ancora}` : base;
}

function abrirWhatsApp(texto) {
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
}

let timerAviso;
function avisar(mensagem) {
  const aviso = document.getElementById('aviso');
  aviso.textContent = mensagem;
  aviso.hidden = false;
  clearTimeout(timerAviso);
  timerAviso = setTimeout(() => { aviso.hidden = true; }, 2200);
}

async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    avisar('Link copiado!');
  } catch {
    // Sem permissão de área de transferência: mostra o link para copiar à mão.
    window.prompt('Copie o link:', texto);
  }
}

// Cada card com id e resumo ganha os botões de compartilhar.
function montarBotoesDosCards() {
  document.querySelectorAll('article.card[id][data-resumo]').forEach((card) => {
    const barra = document.createElement('div');
    barra.className = 'card-acoes';

    const zap = document.createElement('button');
    zap.type = 'button';
    zap.className = 'btn btn-zap';
    zap.textContent = 'Mandar no WhatsApp';
    zap.addEventListener('click', () => {
      abrirWhatsApp(`${card.dataset.resumo}\n\nVeja a fonte: ${urlDaPagina(card.id)}`);
    });

    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'btn btn-sec';
    link.textContent = 'Copiar link';
    link.addEventListener('click', () => copiar(urlDaPagina(card.id)));

    barra.append(zap, link);
    card.append(barra);
  });

  document.querySelectorAll('[data-share-site]').forEach((botao) => {
    botao.addEventListener('click', () => {
      abrirWhatsApp(
        'Lula x Bolsonaro, número a número e com fonte oficial: salário, emprego, imposto, comida e saúde. ' +
        'E dá pra calcular quanto você deixa de pagar de IR em 2026:\n\n' + urlDaPagina()
      );
    });
  });
}

function montarCalculadora() {
  const form = document.getElementById('calculadora');
  if (!form) return;
  const campo = form.querySelector('#salario');
  const resultado = form.querySelector('#resultado');
  const saida = {
    antes: form.querySelector('#r-antes'),
    depois: form.querySelector('#r-depois'),
    mes: form.querySelector('#r-mes'),
    ano: form.querySelector('#r-ano'),
    mensagem: form.querySelector('#r-mensagem'),
  };

  function atualizar() {
    const salario = Number.parseFloat(String(campo.value).replace(',', '.'));
    if (!Number.isFinite(salario) || salario <= 0) {
      resultado.hidden = true;
      return;
    }
    const r = calcular(salario);
    saida.antes.textContent = reais.format(r.antes);
    saida.depois.textContent = reais.format(r.depois);
    saida.mes.textContent = reais.format(r.economiaMes);
    saida.ano.textContent = reais.format(r.economiaAno);

    let mensagem;
    if (r.impostoMinimo) {
      mensagem = 'Você está na faixa do imposto mínimo (acima de R$ 50 mil por mês). Mas, com salário de carteira, você já paga mais de 10% de IR, e aí a regra não cobra nada a mais. Ela mira quem vive de dividendos quase sem imposto.';
    } else if (r.antes === 0) {
      mensagem = 'Esse salário já era isento antes. E o imposto mínimo da lei do Lula não te atinge: ele só vale acima de R$ 50 mil por mês.';
    } else if (r.economiaMes > 0) {
      mensagem = `A lei do Lula põe ${reais.format(r.economiaAno)} a mais no seu bolso em um ano. E o imposto mínimo que paga essa conta não te atinge: ele só vale acima de R$ 50 mil por mês.`;
    } else {
      mensagem = 'Acima de R$ 7.350 o seu IR não muda. E o imposto mínimo da lei do Lula também não te atinge: ele só vale acima de R$ 50 mil por mês.';
    }
    saida.mensagem.textContent = mensagem;
    ultimo = r;
    resultado.hidden = false;
  }

  let ultimo = null;
  form.querySelector('#r-compartilhar')?.addEventListener('click', () => {
    if (!ultimo) return;
    const texto = ultimo.economiaMes > 0
      ? `Com a lei do Lula, eu deixo de pagar ${reais.format(ultimo.economiaAno)} de Imposto de Renda por ano (${reais.format(ultimo.economiaMes)} por mês). Bolsonaro prometeu em 2018 e não fez.`
      : 'A lei do Lula zerou o Imposto de Renda de quem ganha até R$ 5 mil e só cobra mais de quem ganha acima de R$ 50 mil por mês. Bolsonaro prometeu em 2018 e não fez.';
    abrirWhatsApp(`${texto}\n\nFaça a sua conta: ${urlDaPagina('classe-media')}`);
  });

  campo.addEventListener('input', atualizar);
  form.addEventListener('submit', (e) => { e.preventDefault(); atualizar(); });
  form.querySelectorAll('[data-valor]').forEach((botao) => {
    botao.addEventListener('click', () => {
      campo.value = botao.dataset.valor;
      atualizar();
    });
  });
}

// Acende no menu lateral (desktop) e nas abas (celular) a seção que está na tela.
function marcarSecaoAtual() {
  const links = [...document.querySelectorAll('.menu a[href^="#"]:not(.marca), .abas a[href^="#"]')];
  const ids = [...new Set(links.map((a) => a.getAttribute('href').slice(1)))];
  const secoes = ids.map((id) => document.getElementById(id)).filter(Boolean);
  if (!('IntersectionObserver' in window) || secoes.length === 0) return;

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      const id = entrada.target.id;
      links.forEach((a) => {
        if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  secoes.forEach((s) => observador.observe(s));
}

// As barras dos gráficos crescem quando entram na tela.
function animarGraficos() {
  const graficos = document.querySelectorAll('.barras');
  if (!('IntersectionObserver' in window)) {
    graficos.forEach((g) => g.classList.add('visivel'));
    return;
  }
  const observador = new IntersectionObserver((entradas, obs) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('visivel');
      obs.unobserve(entrada.target);
    });
  }, { threshold: 0.35 });
  graficos.forEach((g) => observador.observe(g));
}

montarBotoesDosCards();
montarCalculadora();
marcarSecaoAtual();
animarGraficos();
