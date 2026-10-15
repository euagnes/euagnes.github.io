// Demonstração do Relatório de Pendências por E-mail, com dados fictícios.
const FREQS = {
  diario: { nome: 'Diário', periodo: '13/10/2026', proximo: 'amanhã, 15/10', escala: 1 },
  semanal: { nome: 'Semanal', periodo: '05/10 a 11/10/2026', proximo: 'segunda, 19/10', escala: 5 },
  mensal: { nome: 'Mensal', periodo: 'setembro de 2026', proximo: '01/11', escala: 21 },
};

const estado = {
  diario: { ativo: true, hora: 6, emails: ['supervisao@empresaexemplo.com.br'] },
  semanal: { ativo: true, hora: 7, emails: ['supervisao@empresaexemplo.com.br', 'operacoes@empresaexemplo.com.br'] },
  mensal: { ativo: false, hora: 6, emails: ['diretoria@empresaexemplo.com.br'] },
};

const TECNICOS = [
  { nome: 'Bruna L.', tarefas: 6, com: 1 },
  { nome: 'Diego M.', tarefas: 5, com: 2 },
  { nome: 'Rafael S.', tarefas: 7, com: 1 },
  { nome: 'Tiago A.', tarefas: 4, com: 0 },
];

const TAREFAS = [
  { num: 48213, tec: 'Diego M.', cliente: 'Condomínio Jardim das Flores', itens: ['Foto do quadro elétrico (sem resposta)', 'Assinatura do responsável (sem resposta)'] },
  { num: 48230, tec: 'Rafael S.', cliente: 'Hospital Vida Nova', itens: ['Observação do técnico: "Peça de reposição pedida, retorno na quinta."'] },
  { num: 48241, tec: 'Diego M.', cliente: 'Shopping Centro Sul', itens: ['Leitura do horímetro (sem resposta)', 'Nível de óleo (sem resposta)', 'Temperatura de saída (sem resposta)', 'Pressão do sistema (sem resposta)', 'Ruído anormal? (sem resposta)', 'Vibração (sem resposta)', 'Foto da placa (sem resposta)'] },
  { num: 48255, tec: 'Bruna L.', cliente: 'Residencial Bela Vista', itens: ['Observação do técnico: "Cliente ausente, faltou conferir a casa de máquinas."'] },
];
const MAX_ITENS = 5;
const MAX_EMAILS = 20;

const $ = (id) => document.getElementById(id);
let atual = 'diario';

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

// Abas de frequência
Object.entries(FREQS).forEach(([id, f]) => {
  const b = el('button', '', f.nome);
  b.type = 'button';
  b.setAttribute('role', 'tab');
  b.dataset.freq = id;
  b.addEventListener('click', () => { atual = id; erro(''); render(); });
  $('rp-freqs').appendChild(b);
});

for (let h = 0; h < 24; h++) {
  const o = el('option', '', String(h).padStart(2, '0') + ':00');
  o.value = h;
  $('rp-hora').appendChild(o);
}

function erro(msg) { $('rp-erro').textContent = msg; }

function render() {
  const f = FREQS[atual];
  const s = estado[atual];

  [...$('rp-freqs').children].forEach((b) => {
    const on = b.dataset.freq === atual;
    b.setAttribute('aria-selected', String(on));
    b.classList.toggle('is-off', !estado[b.dataset.freq].ativo);
  });

  $('rp-card-title').textContent = 'Relatório ' + f.nome.toLowerCase();
  $('rp-ativo').checked = s.ativo;
  $('rp-ativo-txt').textContent = s.ativo ? 'Ativo' : 'Pausado';
  $('rp-card').classList.toggle('is-paused', !s.ativo);
  $('rp-hora').value = s.hora;
  $('rp-count').textContent = `${s.emails.length} de ${MAX_EMAILS}`;

  $('rp-emails').replaceChildren(...s.emails.map((email, i) => {
    const li = el('li');
    const rm = el('button', 'rp-rm', '×');
    rm.type = 'button';
    rm.setAttribute('aria-label', 'Remover ' + email);
    rm.addEventListener('click', () => {
      if (s.emails.length === 1) { erro('Deixe pelo menos 1 destinatário. Para parar os envios, use Pausar.'); return; }
      s.emails.splice(i, 1);
      erro('');
      render();
    });
    li.append(el('span', '', email), rm);
    return li;
  }));

  const hora = String(s.hora).padStart(2, '0') + ':00';
  $('rp-next').textContent = s.ativo
    ? `Próximo envio: ${f.proximo}, às ${hora}.`
    : 'Pausado. A configuração continua salva e volta a valer quando você reativar.';

  renderMail(f, s);
}

function renderMail(f, s) {
  const tecs = TECNICOS.map((t) => ({ ...t, tarefas: t.tarefas * f.escala, com: t.com * Math.max(1, Math.round(f.escala * 0.6)) }));
  const totalTarefas = tecs.reduce((n, t) => n + t.tarefas, 0);
  const totalCom = tecs.reduce((n, t) => n + t.com, 0);
  const totalPend = totalCom + Math.round(totalCom * 0.8);

  $('rp-assunto').textContent = `Relatório ${f.nome} de Pendências — ${totalPend} pendências (${f.periodo})`;
  $('rp-para').textContent = s.emails.join(', ');

  const mail = $('rp-mail');
  mail.classList.toggle('is-paused', !s.ativo);

  const head = el('header', 'rp-m-head');
  head.append(el('span', 'rp-m-co', 'Empresa Exemplo Ltda.'), el('h3', '', `Relatório ${f.nome.toLowerCase()} de pendências`), el('span', 'rp-m-per', 'Período: ' + f.periodo));

  const totais = el('div', 'rp-m-totals');
  [[totalTarefas, 'tarefas finalizadas'], [totalCom, 'com pendência'], [totalPend, 'pendências']].forEach(([n, l]) => {
    const d = el('div');
    d.append(el('strong', '', n.toLocaleString('pt-BR')), el('span', '', l));
    totais.appendChild(d);
  });

  const tabela = el('table', 'rp-m-table');
  const thead = el('tr');
  ['Colaborador', 'Tarefas', 'Sem pendência', 'Com pendência'].forEach((h) => thead.appendChild(el('th', '', h)));
  tabela.appendChild(thead);
  tecs.forEach((t) => {
    const tr = el('tr');
    [t.nome, t.tarefas, t.tarefas - t.com, t.com].forEach((v) => tr.appendChild(el('td', '', String(v))));
    tabela.appendChild(tr);
  });

  const lista = el('section', 'rp-m-list');
  lista.appendChild(el('h4', '', 'Pendências por tarefa'));
  TAREFAS.forEach((t) => {
    const bloco = el('div', 'rp-m-task');
    const top = el('p');
    const link = el('a', '', '#' + t.num);
    link.href = '#';
    link.addEventListener('click', (e) => e.preventDefault());
    top.append(link, ` ${t.cliente}, ${t.tec}`);
    const ul = el('ul');
    t.itens.slice(0, MAX_ITENS).forEach((i) => ul.appendChild(el('li', '', i)));
    if (t.itens.length > MAX_ITENS) ul.appendChild(el('li', 'rp-m-more', `e mais ${t.itens.length - MAX_ITENS} itens`));
    bloco.append(top, ul);
    lista.appendChild(bloco);
  });

  const parts = [head, totais, tabela, lista];
  if (!s.ativo) parts.unshift(el('p', 'rp-m-paused', 'Esta frequência está pausada. Este é só o modelo do e-mail.'));
  mail.replaceChildren(...parts);
}

$('rp-ativo').addEventListener('change', (e) => { estado[atual].ativo = e.target.checked; render(); });
$('rp-hora').addEventListener('change', (e) => { estado[atual].hora = Number(e.target.value); render(); });

$('rp-add').addEventListener('submit', (e) => {
  e.preventDefault();
  const s = estado[atual];
  const v = $('rp-novo').value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { erro('Digite um e-mail válido, como nome@empresa.com.br.'); return; }
  if (s.emails.includes(v)) { erro('Esse e-mail já está na lista.'); return; }
  if (s.emails.length >= MAX_EMAILS) { erro(`O limite é de ${MAX_EMAILS} destinatários por frequência.`); return; }
  s.emails.push(v);
  $('rp-novo').value = '';
  erro('');
  render();
});

render();
