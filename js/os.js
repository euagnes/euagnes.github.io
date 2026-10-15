// Demonstração do Gerador de OS com dados fictícios.
const TAREFAS = [
  { cod: 48213, cliente: 'Condomínio Jardim das Flores', tec: 'Rafael S.', data: '06/10/2026', status: 'Finalizada', grupo: 'OS com questionário', tipo: 'Manutenção preventiva', equip: 'Elevador social – Torre A', checkin: '08:12', checkout: '09:40' },
  { cod: 48219, cliente: 'Edifício Monte Azul', tec: 'Bruna L.', data: '07/10/2026', status: 'Finalizada', grupo: 'OS sem questionário', tipo: 'Chamado corretivo', equip: 'Elevador de serviço', checkin: '14:05', checkout: '15:22' },
  { cod: 48230, cliente: 'Hospital Vida Nova', tec: 'Rafael S.', data: '08/10/2026', status: 'Em andamento', grupo: 'OS com questionário', tipo: 'Manutenção preventiva', equip: 'Elevador de maca – Bloco 2', checkin: '10:30', checkout: '–' },
  { cod: 48241, cliente: 'Shopping Centro Sul', tec: 'Diego M.', data: '09/10/2026', status: 'Finalizada', grupo: 'OS com questionário', tipo: 'Inspeção mensal', equip: 'Escada rolante – Piso 1', checkin: '07:50', checkout: '09:05' },
  { cod: 48255, cliente: 'Residencial Bela Vista', tec: 'Bruna L.', data: '13/10/2026', status: 'Agendada', grupo: 'OS sem questionário', tipo: 'Manutenção preventiva', equip: 'Elevador social', checkin: '–', checkout: '–' },
];

const PERGUNTAS = [
  ['Freios e polias inspecionados', 'Conforme'],
  ['Portas de pavimento com fechamento correto', 'Conforme'],
  ['Iluminação e ventilação da cabina', 'Conforme'],
  ['Nivelamento nas paradas', 'Ajustado'],
  ['Limpeza da casa de máquinas', 'Realizada'],
];

const $ = (id) => document.getElementById(id);
const list = $('os-list');
const doc = $('os-doc');
const pdfBtn = $('os-pdf');
let aberta = null;

[...new Set(TAREFAS.map((t) => t.tec))].forEach((tec) => {
  const o = document.createElement('option');
  o.textContent = tec;
  $('os-tec').appendChild(o);
});

function h(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function renderList() {
  const st = $('os-status').value, tec = $('os-tec').value, gr = $('os-grupo').value;
  const itens = TAREFAS.filter((t) => (!st || t.status === st) && (!tec || t.tec === tec) && (!gr || t.grupo === gr));
  if (!itens.length) {
    list.replaceChildren(h('li', 'os-none', 'Nenhuma tarefa com esses filtros. Tente outro status ou técnico.'));
    return;
  }
  list.replaceChildren(...itens.map((t) => {
    const li = h('li');
    const b = h('button', 'os-item' + (aberta === t ? ' is-open' : ''));
    b.type = 'button';
    b.setAttribute('aria-pressed', String(aberta === t));
    const top = h('span', 'os-item-top');
    top.append(h('strong', '', '#' + t.cod), h('span', '', t.data));
    const badge = h('span', 'os-badge' + (t.grupo === 'OS com questionário' ? ' is-q' : ''), t.grupo === 'OS com questionário' ? 'Com questionário' : 'Sem questionário');
    b.append(top, h('span', 'os-item-cli', t.cliente), h('span', 'os-item-meta', `${t.tec}, ${t.status.toLowerCase()}`), badge);
    b.addEventListener('click', () => { aberta = t; renderList(); renderDoc(); });
    li.appendChild(b);
    return li;
  }));
}

function campo(label, valor) {
  const d = h('div', 'os-field');
  d.append(h('span', '', label), h('strong', '', valor));
  return d;
}

function renderDoc() {
  const t = aberta;
  const comQ = t.grupo === 'OS com questionário';
  doc.hidden = false;
  pdfBtn.disabled = false;
  $('os-hint').textContent = comQ ? 'OS com questionário, pelo grupo do cliente.' : 'OS sem questionário, pelo grupo do cliente.';

  const head = h('header', 'os-doc-head');
  const brand = h('div');
  brand.append(h('strong', 'os-co', 'Elevadores Exemplo Ltda.'), h('span', '', 'CNPJ 00.000.000/0001-00, Rua Fictícia, 100, Juiz de Fora, MG'));
  const num = h('div', 'os-num');
  num.append(h('span', '', 'Ordem de serviço'), h('strong', '', '#' + t.cod));
  head.append(brand, num);

  const grid = h('div', 'os-fields');
  grid.append(campo('Cliente', t.cliente), campo('Equipamento', t.equip), campo('Tipo', t.tipo),
    campo('Técnico', t.tec), campo('Data', t.data), campo('Check-in / check-out', `${t.checkin} / ${t.checkout}`));

  const parts = [head, grid];
  if (comQ) {
    const sec = h('section', 'os-q');
    sec.appendChild(h('h4', '', 'Questionário'));
    const tb = h('table');
    PERGUNTAS.forEach(([p, r]) => {
      const tr = h('tr');
      tr.append(h('td', '', p), h('td', '', r));
      tb.appendChild(tr);
    });
    sec.appendChild(tb);
    const fotos = h('div', 'os-photos');
    ['Antes', 'Depois'].forEach((f) => fotos.appendChild(h('div', 'os-photo', 'Foto: ' + f.toLowerCase())));
    sec.appendChild(fotos);
    parts.push(sec);
  }
  const sign = h('div', 'os-sign');
  sign.append(h('span', '', 'Assinatura do responsável'), h('span', '', 'Página 1 de 1'));
  parts.push(sign);
  doc.replaceChildren(...parts);
}

['os-status', 'os-tec', 'os-grupo'].forEach((id) => $(id).addEventListener('change', renderList));

pdfBtn.addEventListener('click', () => {
  document.body.classList.add('printing-os');
  window.print();
});
window.addEventListener('afterprint', () => document.body.classList.remove('printing-os'));

aberta = TAREFAS[0];
renderList();
renderDoc();
