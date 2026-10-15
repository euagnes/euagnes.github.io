// Demonstração do BI Padrão com dados fictícios.
const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const int = (n) => Math.round(n).toLocaleString('pt-BR');
const pct = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';

// Gerador previsível para os números não mudarem a cada clique.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const MESES = ['mai', 'jun', 'jul', 'ago', 'set', 'out'];

const TABS = [
  {
    id: 'geral', label: 'Visão geral',
    build(days, r) {
      const total = 4.1 * days * (0.9 + r() * 0.2);
      const fin = total * 0.82;
      const semanas = Math.round(days / 7);
      const bars = Array.from({ length: Math.min(semanas, 13) }, (_, i) => ({
        label: 'S' + (i + 1), value: Math.round(total / semanas * (0.75 + r() * 0.5)),
      }));
      return {
        kpis: [['Tarefas', int(total)], ['Finalizadas', int(fin)], ['Pendentes', int(total - fin)], ['Taxa de atraso', pct(6 + r() * 4)]],
        chart: { title: 'Tarefas por semana', note: 'últimas ' + bars.length + ' semanas', kind: 'col', bars, fmt: int },
      };
    },
  },
  {
    id: 'equipe', label: 'Equipe',
    build(days, r) {
      const nomes = ['Técnico A', 'Técnico B', 'Técnico C', 'Técnico D', 'Técnico E', 'Técnico F'];
      const bars = nomes.map((label) => ({ label, value: Math.round(days * (0.4 + r() * 0.5)) }))
        .sort((a, b) => b.value - a.value);
      return {
        kpis: [['Técnicos ativos', '6'], ['Km rodados', int(days * 210 * (0.9 + r() * 0.2))], ['Horas trabalhadas', int(days * 38)], ['OS enviadas', int(days * 3.3)]],
        chart: { title: 'Tarefas por técnico', note: 'no período', kind: 'row', bars, fmt: int },
      };
    },
  },
  {
    id: 'orcamentos', label: 'Orçamentos',
    build(days, r) {
      const etapas = ['Enviado', 'Em negociação', 'Aprovado', 'Recusado'];
      const bars = etapas.map((label, i) => ({ label, value: Math.round(days * 1800 * (1.4 - i * 0.28) * (0.85 + r() * 0.3)) }));
      const total = bars.reduce((s, b) => s + b.value, 0);
      return {
        kpis: [['Orçamentos', int(days * 0.9)], ['Valor total', brl(total)], ['Conversão', pct(31 + r() * 8)], ['Ciclo médio', int(9 + r() * 6) + ' dias']],
        chart: { title: 'Valor por etapa', note: 'em reais', kind: 'row', bars, fmt: brl },
      };
    },
  },
  {
    id: 'financeiro', label: 'Financeiro',
    build(days, r) {
      const bars = MESES.map((label) => ({ label, value: Math.round(118000 * (0.85 + r() * 0.3)) }));
      const receita = bars.slice(-Math.max(1, Math.round(days / 30))).reduce((s, b) => s + b.value, 0);
      const despesas = receita * (0.62 + r() * 0.08);
      return {
        kpis: [['Receita', brl(receita)], ['Despesas', brl(despesas)], ['Resultado', brl(receita - despesas)], ['Ticket médio', brl(860 + r() * 140)]],
        chart: { title: 'Receita por mês', note: 'últimos 6 meses, em reais', kind: 'col', bars, fmt: brl },
      };
    },
  },
  {
    id: 'equipamentos', label: 'Equipamentos',
    build(days, r) {
      const cats = ['Ar-condicionado', 'Elevador', 'Gerador', 'Câmara fria', 'Bomba'];
      const bars = cats.map((label) => ({ label, value: Math.round(days / 9 * (0.4 + r())) }))
        .sort((a, b) => b.value - a.value);
      return {
        kpis: [['Ativos', '412'], ['MTBF', int(640 + r() * 120) + ' h'], ['MTTR', (3 + r() * 2).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' h'], ['Preventivas', pct(58 + r() * 10)]],
        chart: { title: 'Falhas por categoria', note: 'corretivas no período', kind: 'row', bars, fmt: int },
      };
    },
  },
];

const el = (id) => document.getElementById(id);
const root = el('bi');
const tabsEl = el('bi-tabs');
const tip = el('bi-tip');
let current = 0;
let showTable = false;

TABS.forEach((t, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.role = 'tab';
  b.id = 'tab-' + t.id;
  b.textContent = t.label;
  b.setAttribute('aria-controls', 'bi-panel');
  b.addEventListener('click', () => { select(i); stopTv(); });
  b.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const next = (i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
      select(next);
      tabsEl.children[next].focus();
    }
  });
  tabsEl.appendChild(b);
});

function select(i) {
  current = i;
  [...tabsEl.children].forEach((b, j) => {
    b.setAttribute('aria-selected', String(i === j));
    b.tabIndex = i === j ? 0 : -1;
  });
  el('bi-panel').setAttribute('aria-labelledby', 'tab-' + TABS[i].id);
  render();
}

function render() {
  const days = Number(el('bi-period').value);
  const tab = TABS[current];
  const data = tab.build(days, seeded(days * 31 + current * 7 + 3));

  el('bi-kpis').innerHTML = data.kpis.map(([k, v]) =>
    `<div class="kpi"><span class="kpi-label">${k}</span><span class="kpi-value">${v}</span></div>`).join('');

  const c = data.chart;
  el('bi-chart-title').textContent = c.title;
  el('bi-chart-note').textContent = c.note;
  const max = Math.max(...c.bars.map((b) => b.value));

  const chart = el('bi-chart');
  chart.className = 'chart chart-' + c.kind;
  chart.innerHTML = c.bars.map((b) => {
    const size = (b.value / max * 100).toFixed(1) + '%';
    return `<div class="bar" tabindex="0" data-label="${b.label}" data-value="${c.fmt(b.value)}">
      <span class="bar-label">${b.label}</span>
      <span class="bar-track"><span class="bar-fill" style="--v:${size}"></span></span>
      ${c.kind === 'row' ? `<span class="bar-value">${c.fmt(b.value)}</span>` : ''}
    </div>`;
  }).join('');

  el('bi-table').innerHTML = `<thead><tr><th>${c.kind === 'row' ? 'Item' : 'Período'}</th><th>${c.title}</th></tr></thead><tbody>` +
    c.bars.map((b) => `<tr><td>${b.label}</td><td>${c.fmt(b.value)}</td></tr>`).join('') + '</tbody>';
  chart.hidden = showTable;
  el('bi-table').hidden = !showTable;
}

// Tooltip das barras
function showTip(bar) {
  tip.textContent = `${bar.dataset.label}: ${bar.dataset.value}`;
  tip.hidden = false;
  const r = bar.querySelector('.bar-fill').getBoundingClientRect();
  const box = root.getBoundingClientRect();
  tip.style.left = (r.left + r.width / 2 - box.left) + 'px';
  tip.style.top = (r.top - box.top - 8) + 'px';
}
el('bi-chart').addEventListener('mouseover', (e) => { const b = e.target.closest('.bar'); if (b) showTip(b); });
el('bi-chart').addEventListener('focusin', (e) => { const b = e.target.closest('.bar'); if (b) showTip(b); });
el('bi-chart').addEventListener('mouseleave', () => { tip.hidden = true; });
el('bi-chart').addEventListener('focusout', () => { tip.hidden = true; });

el('bi-period').addEventListener('change', render);

el('bi-table-btn').addEventListener('click', (e) => {
  showTable = !showTable;
  e.currentTarget.setAttribute('aria-pressed', String(showTable));
  e.currentTarget.textContent = showTable ? 'Ver gráfico' : 'Ver tabela';
  render();
});

// Modo TV: tela cheia e rodízio de abas
const TV_MS = 6000;
let tvTimer = null;
let tvStart = 0;
const progress = el('bi-progress');

function tick() {
  const t = (performance.now() - tvStart) / TV_MS;
  if (t >= 1) {
    select((current + 1) % TABS.length);
    tvStart = performance.now();
  }
  progress.style.width = (Math.min(t, 1) * 100) + '%';
  tvTimer = requestAnimationFrame(tick);
}

function startTv() {
  root.classList.add('is-tv');
  el('bi-tv-btn').textContent = 'Desligar modo TV';
  el('bi-tv-btn').setAttribute('aria-pressed', 'true');
  if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
  tvStart = performance.now();
  tvTimer = requestAnimationFrame(tick);
}

function stopTv() {
  if (!tvTimer) return;
  cancelAnimationFrame(tvTimer);
  tvTimer = null;
  progress.style.width = '0';
  root.classList.remove('is-tv');
  el('bi-tv-btn').textContent = 'Ligar modo TV';
  el('bi-tv-btn').setAttribute('aria-pressed', 'false');
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

el('bi-tv-btn').addEventListener('click', () => (tvTimer ? stopTv() : startTv()));
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) stopTv(); });

select(0);
