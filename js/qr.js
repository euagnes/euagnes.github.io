// Demonstração das etiquetas com QR Code, com dados fictícios.
const EMPRESA = { nome: 'Exemplo Engenharia', sigla: 'EE', tel: '(32) 3000-0000', email: 'contato@exemplo.com.br', horario: 'Seg. a sex., 8h às 18h. Plantão 24h pelo telefone.' };
const EQUIPS = [
  { id: 'AC-0142', nome: 'Ar-condicionado split 18.000 BTUs', cliente: 'Clínica Bem-Estar' },
  { id: 'AC-0143', nome: 'Ar-condicionado split 24.000 BTUs', cliente: 'Clínica Bem-Estar' },
  { id: 'CF-0007', nome: 'Câmara fria de resfriados', cliente: 'Mercado Bom Preço' },
  { id: 'GE-0021', nome: 'Gerador 150 kVA', cliente: 'Hotel Serra Azul' },
  { id: 'CM-0310', nome: 'Câmera de segurança externa', cliente: 'Condomínio Parque Verde' },
  { id: 'CT-0055', nome: 'Central de alarme', cliente: 'Condomínio Parque Verde' },
];

const $ = (id) => document.getElementById(id);
const form = $('qr-form');
const sheet = $('qr-sheet');
const marcados = new Set(EQUIPS.slice(0, 4).map((e) => e.id));

EQUIPS.forEach((e) => {
  const label = document.createElement('label');
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = marcados.has(e.id);
  cb.addEventListener('change', () => { cb.checked ? marcados.add(e.id) : marcados.delete(e.id); render(); });
  label.append(cb, ` ${e.id}, ${e.nome}`);
  $('qr-equips').appendChild(label);
});

function qrSvg(texto) {
  const qr = qrcode(0, 'M');
  qr.addData(texto);
  qr.make();
  const wrap = document.createElement('div');
  wrap.className = 'qr-code';
  // SVG gerado pela biblioteca a partir de um texto fixo da página.
  wrap.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  return wrap;
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function logo() {
  const l = el('div', 'qr-logo');
  l.append(el('span', 'qr-mark', EMPRESA.sigla), el('span', '', EMPRESA.nome));
  return l;
}

function render() {
  const fmt = form.fmt.value;
  const size = form.size.value;
  const linhas = new Set([...form.querySelectorAll('input[name="line"]:checked')].map((i) => i.value));
  $('qr-size-set').hidden = fmt !== 'vertical';
  $('qr-lines-set').hidden = fmt !== 'vertical';

  sheet.className = 'qr-sheet is-' + fmt + (fmt === 'vertical' ? ' size-' + size : '');
  const escolhidos = EQUIPS.filter((e) => marcados.has(e.id));
  if (!escolhidos.length) {
    sheet.replaceChildren(el('p', 'qr-none', 'Marque pelo menos um equipamento para montar a folha.'));
    $('qr-page').textContent = '';
    $('qr-print').disabled = true;
    return;
  }
  $('qr-print').disabled = false;

  sheet.replaceChildren(...escolhidos.map((e) => {
    const url = `https://solicitacao.exemplo.com.br/chamado/novo?eq=${encodeURIComponent(e.id)}`;
    const card = el('div', 'qr-label');
    if (fmt === 'quadrada') {
      card.append(logo(), qrSvg(url), el('strong', 'qr-name', e.nome), el('span', 'qr-id', e.id));
    } else {
      const head = el('div', 'qr-head');
      head.append(logo());
      if (linhas.has('tel')) head.append(el('span', 'qr-line', `${EMPRESA.tel}, ${EMPRESA.email}`));
      card.append(head, qrSvg(url), el('strong', 'qr-name', e.cliente));
      if (linhas.has('horario')) card.append(el('span', 'qr-line', EMPRESA.horario));
    }
    return card;
  }));
  $('qr-page').textContent = `${escolhidos.length} etiqueta${escolhidos.length > 1 ? 's' : ''}, página 1 de 1`;
}

form.addEventListener('change', render);
$('qr-print').addEventListener('click', () => {
  document.body.classList.add('printing-qr');
  window.print();
});
window.addEventListener('afterprint', () => document.body.classList.remove('printing-qr'));

render();
