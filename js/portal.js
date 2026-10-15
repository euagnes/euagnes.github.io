// Demonstração do Portal Financeiro com dados fictícios.
// Cada rodada de sincronização aplica o próximo evento de cada indicação.
const INDICACOES = [
  {
    empresa: 'Padaria Exemplo', embaixador: 'Carla M.',
    eventos: [
      { etapa: 'Validada pelo SDR', bonus: 'R$ 100 simulado', log: 'HubSpot: negócio passou para Conexão. Bônus de R$ 100 calculado e registrado como ação simulada.' },
      { etapa: 'Vendido, aguardando pagamento', log: 'HubSpot: negócio marcado como Vendido.' },
      { etapa: 'Pagamento conferido', bonus: 'R$ 500 simulado', log: 'Superlógica: 1º pagamento encontrado dentro de 60 dias da venda. Bônus de R$ 500 e sequência de 3 e-mails registrados como ação simulada.', ok: true },
    ],
  },
  {
    empresa: 'Clima Norte Refrigeração', embaixador: 'João P.',
    eventos: [
      { etapa: 'Validada pelo SDR', bonus: 'R$ 100 simulado', log: 'HubSpot: negócio passou para Conexão. Bônus de R$ 100 calculado e registrado como ação simulada.' },
      { etapa: 'Perdido', log: 'HubSpot: negócio perdido. Nenhum bônus de R$ 500 a calcular.' },
    ],
  },
  {
    empresa: 'Elevadores Alfa', embaixador: 'Ana R.',
    eventos: [
      { etapa: 'Vendido, aguardando pagamento', bonus: 'R$ 100 simulado', log: 'HubSpot: negócio já chegou como Vendido. Bônus de R$ 100 registrado como ação simulada.' },
      { etapa: 'Pagador divergente', log: 'Superlógica: o pagador cadastrado não é a empresa indicada. Buscando pelo CNPJ.', warn: true },
      { etapa: 'Pagamento conferido', bonus: 'R$ 500 simulado', log: 'Superlógica: pagador conciliado pelo CNPJ, com histórico guardado. 1º pagamento confirmado. Bônus de R$ 500 registrado como ação simulada.', ok: true },
    ],
  },
  {
    empresa: 'Gerador Sul', embaixador: 'Marcos T.',
    eventos: [
      { etapa: 'Em revisão', log: 'Coda: a mesma indicação aparece em duas linhas. Mantive as duas e enviei para a fila de revisão, sem contar o bônus duas vezes.', warn: true },
    ],
  },
];

const rowsEl = document.getElementById('pf-rows');
const logEl = document.getElementById('pf-log');
const syncBtn = document.getElementById('pf-sync');
let rodada = 0;
let estado = [];

function reset() {
  rodada = 0;
  estado = INDICACOES.map(() => ({ etapa: 'Indicação recebida', bonus: '–', ok: false, warn: false }));
  logEl.innerHTML = '';
  const li = document.createElement('li');
  li.className = 'pf-empty';
  li.textContent = 'Nada rodou ainda.';
  logEl.appendChild(li);
  syncBtn.disabled = false;
  syncBtn.textContent = 'Rodar sincronização';
  render();
}

function render() {
  rowsEl.replaceChildren(...INDICACOES.map((ind, i) => {
    const s = estado[i];
    const tr = document.createElement('tr');
    if (s.flash) tr.className = 'is-new';
    const etapa = document.createElement('span');
    etapa.className = 'pf-stage' + (s.ok ? ' is-ok' : '') + (s.warn ? ' is-warn' : '');
    etapa.textContent = s.etapa;
    [ind.empresa, ind.embaixador, etapa, s.bonus].forEach((v) => {
      const td = document.createElement('td');
      td.append(v);
      tr.appendChild(td);
    });
    return tr;
  }));
}

function sync() {
  const hora = `08:${String(45 + rodada).padStart(2, '0')}`;
  const linhas = [];
  INDICACOES.forEach((ind, i) => {
    estado[i].flash = false;
    const ev = ind.eventos[rodada];
    if (!ev) return;
    Object.assign(estado[i], { etapa: ev.etapa, ok: !!ev.ok, warn: !!ev.warn, flash: true });
    if (ev.bonus) estado[i].bonus = estado[i].bonus === '–' ? ev.bonus : estado[i].bonus + ' + ' + ev.bonus;
    linhas.push(`${ind.empresa}: ${ev.log}`);
  });

  logEl.querySelector('.pf-empty')?.remove();
  const li = document.createElement('li');
  const h = document.createElement('strong');
  h.textContent = `Rodada ${rodada + 1}, ${hora}`;
  li.appendChild(h);
  linhas.forEach((t) => { const p = document.createElement('p'); p.textContent = t; li.appendChild(p); });
  logEl.prepend(li);

  rodada++;
  const fim = INDICACOES.every((ind) => rodada >= ind.eventos.length);
  if (fim) {
    syncBtn.disabled = true;
    syncBtn.textContent = 'Tudo sincronizado';
  }
  render();
}

syncBtn.addEventListener('click', sync);
document.getElementById('pf-reset').addEventListener('click', reset);
reset();
