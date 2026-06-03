// =========================================================
// controle-economico.js — Potygen Pro
// =========================================================
//
// ⚠️  EDITE AS DUAS LINHAS ABAIXO com suas credenciais:
//     Supabase → Settings → API
//
const SUPABASE_URL = 'https://xjzydvtcqywnwmrltzkr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqenlkdnRjcXl3bndtcmx0emtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTMwOTIzMSwiZXhwIjoyMDk0ODg1MjMxfQ.pULjeY3OrN4IFnkcMF4Y_MWR4Qj40pQ6vS7-CsPzjWk';
const FAZENDA_NOME   = 'Fazenda São João';   // nome da fazenda no PDF
const FAZENDA_CIDADE = 'Crateús - CE';        // cidade no PDF
const FAZENDA_CNPJ   = '000.000.000-00';      // CNPJ no PDF (opcional)
//
// ✅  NÃO MEXA EM NADA ABAIXO DESTA LINHA
// =========================================================
 
const CATEGORIAS = {
  receita: ['Venda de Animais','Venda de Leite','Venda de Lã / Fibra','Subsídios / Incentivos','Outros'],
  despesa: ['Alimentação Animal','Vacinas','Medicamentos / Veterinário','Mão de Obra','Equipamentos','Infraestrutura','Combustível / Transporte','Outros'],
};
 
const SB = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
};
 
let todasTransacoes = [];
let periodoAtivo    = 'todos';
let termoBusca      = '';
 
// =========================================================
// INIT
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const agora = new Date();
  document.getElementById('dataTransacao').value = agora.toISOString().split('T')[0];
  document.getElementById('horaTransacao').value = agora.toTimeString().slice(0, 5);
  carregarTransacoes();
});
 
// =========================================================
// CARREGAR DO SUPABASE
// =========================================================
async function carregarTransacoes() {
  const uid = getUsuarioId();
  const filtroUsuario = uid ? `&usuario_id=eq.${uid}` : '';
 
  let filtroData = '';
  const hoje = new Date();
  if (periodoAtivo === 'mes') {
    const d = new Date(hoje); d.setDate(d.getDate() - 30);
    filtroData = `&data=gte.${d.toISOString().split('T')[0]}`;
  } else if (periodoAtivo === 'semestre') {
    const d = new Date(hoje); d.setMonth(d.getMonth() - 6);
    filtroData = `&data=gte.${d.toISOString().split('T')[0]}`;
  } else if (periodoAtivo === 'ano') {
    const d = new Date(hoje); d.setFullYear(d.getFullYear() - 1);
    filtroData = `&data=gte.${d.toISOString().split('T')[0]}`;
  }
 
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/transacoes?select=*${filtroUsuario}${filtroData}&order=data.desc,hora.desc`,
      { headers: SB }
    );
    if (!res.ok) throw new Error(await res.text());
    todasTransacoes = await res.json();
    renderizarTudo();
  } catch (err) {
    console.error(err);
    alert('Erro ao carregar dados. Verifique SUPABASE_URL e SUPABASE_KEY.');
  }
}
 
// =========================================================
// RENDERIZAÇÃO
// =========================================================
function renderizarTudo() {
  const lista = filtrarLista();
  renderResumo(lista);
  renderTabela(lista);
}
 
function filtrarLista() {
  if (!termoBusca) return todasTransacoes;
  const t = termoBusca.toLowerCase();
  return todasTransacoes.filter(tx =>
    (tx.descricao || '').toLowerCase().includes(t) ||
    (tx.categoria || '').toLowerCase().includes(t) ||
    (tx.tipo      || '').toLowerCase().includes(t)
  );
}
 
function renderResumo(lista) {
  const receitas = lista.filter(t => t.tipo === 'receita');
  const despesas = lista.filter(t => t.tipo === 'despesa');
  const totalR   = receitas.reduce((s, t) => s + +t.valor, 0);
  const totalD   = despesas.reduce((s, t) => s + +t.valor, 0);
  const saldo    = totalR - totalD;
 
  document.getElementById('totalReceitas').textContent = fmtM(totalR);
  document.getElementById('totalDespesas').textContent = fmtM(totalD);
  document.getElementById('totalSaldo').textContent    = fmtM(Math.abs(saldo));
  document.getElementById('qtdReceitas').textContent   = `${receitas.length} transaç${receitas.length === 1 ? 'ão' : 'ões'}`;
  document.getElementById('qtdDespesas').textContent   = `${despesas.length} transaç${despesas.length === 1 ? 'ão' : 'ões'}`;
  document.getElementById('badgeTotal').textContent    = lista.length;
 
  const elV = document.getElementById('totalSaldo');
  const elI = document.getElementById('iconeSaldo');
  if (saldo >= 0) {
    elV.className = 'resumo-valor green';
    elI.className = 'resumo-icon green';
    elI.innerHTML = '<i class="fa-solid fa-dollar-sign"></i>';
  } else {
    elV.className = 'resumo-valor red';
    elI.className = 'resumo-icon red';
    elI.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
  }
}
 
function renderTabela(lista) {
  const tbody = document.getElementById('tbodyTransacoes');
  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-row">
      <i class="fa-solid fa-inbox" style="font-size:28px;color:#e2e8f0;display:block;margin-bottom:8px;"></i>
      Nenhuma transação encontrada.
    </td></tr>`;
    return;
  }
  tbody.innerHTML = lista.map(tx => {
    const r   = tx.tipo === 'receita';
    const cls = r ? 'receita' : 'despesa';
    return `<tr>
      <td>
        <span class="tipo-badge ${cls}">
          <i class="fa-solid ${r ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
          ${r ? 'Receita' : 'Despesa'}
        </span>
      </td>
      <td>
        <strong>${tx.descricao || '—'}</strong>
        ${tx.observacoes ? `<br><small style="color:#94a3b8">${tx.observacoes}</small>` : ''}
      </td>
      <td>${tx.categoria || '—'}</td>
      <td>
        ${fmtD(tx.data)}
        ${tx.hora ? `<span style="color:#94a3b8;font-size:12px"> às ${tx.hora.slice(0,5)}</span>` : ''}
      </td>
      <td>${tx.quantidade || 1}</td>
      <td class="valor-${cls}">${r ? '+' : '-'} ${fmtM(tx.valor)}</td>
      <td>
        <div class="acoes-tabela">
          <button class="btn-acao editar"  title="Editar"  onclick="editarTransacao('${tx.id}')"><i class="fa-solid fa-pencil"></i></button>
          <button class="btn-acao excluir" title="Excluir" onclick="excluirTransacao('${tx.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}
 
// =========================================================
// FILTROS E BUSCA
// =========================================================
function setPeriodo(btn, periodo) {
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  periodoAtivo = periodo;
  carregarTransacoes();
}
 
function filtrarTabela() {
  termoBusca = document.getElementById('inputBusca').value.trim();
  renderizarTudo();
}
 
function trocarMainTab(aba) {
  document.getElementById('tabFinanceiro').classList.toggle('active', aba === 'financeiro');
  document.getElementById('tabProducao').classList.toggle('active', aba === 'producao');
  document.getElementById('painelFinanceiro').style.display = aba === 'financeiro' ? '' : 'none';
}
 
// =========================================================
// MODAL — NOVA TRANSAÇÃO
// =========================================================
function abrirNovaTransacao() {
  document.getElementById('editandoId').value        = '';
  document.getElementById('modalTitulo').textContent = 'Nova Transação';
  document.getElementById('descricao').value         = '';
  document.getElementById('quantidade').value        = '1';
  document.getElementById('precoUnitario').value     = '';
  document.getElementById('valorTotal').value        = 'R$ 0,00';
  document.getElementById('observacoes').value       = '';
  const agora = new Date();
  document.getElementById('dataTransacao').value = agora.toISOString().split('T')[0];
  document.getElementById('horaTransacao').value = agora.toTimeString().slice(0, 5);
  setTipo('receita');
  abrirModal('modalTransacao');
}
 
function setTipo(tipo) {
  document.getElementById('tipoTransacao').value = tipo;
  const btnR = document.getElementById('btnReceita');
  const btnD = document.getElementById('btnDespesa');
  btnR.className = 'tipo-btn' + (tipo === 'receita' ? ' active receita-ativo' : '');
  btnD.className = 'tipo-btn' + (tipo === 'despesa' ? ' active despesa-ativo' : '');
 
  const sel = document.getElementById('categoria');
  const atual = sel.value;
  sel.innerHTML = '<option value="">Selecione uma categoria</option>';
  CATEGORIAS[tipo].forEach(cat => {
    const o = document.createElement('option');
    o.value = cat; o.textContent = cat;
    if (cat === atual) o.selected = true;
    sel.appendChild(o);
  });
}
 
function calcularTotal() {
  const qtd   = parseFloat(document.getElementById('quantidade').value)    || 0;
  const preco = parseFloat(document.getElementById('precoUnitario').value) || 0;
  document.getElementById('valorTotal').value = fmtM(qtd * preco);
}
 
// =========================================================
// SALVAR (nova ou edição)
// =========================================================
async function salvarTransacao() {
  const tipo      = document.getElementById('tipoTransacao').value;
  const editId    = document.getElementById('editandoId').value;
  const categoria = document.getElementById('categoria').value;
  const data      = document.getElementById('dataTransacao').value;
  const hora      = document.getElementById('horaTransacao').value;
  const descricao = document.getElementById('descricao').value.trim();
  const qtd       = parseFloat(document.getElementById('quantidade').value)    || 1;
  const preco     = parseFloat(document.getElementById('precoUnitario').value) || 0;
  const obs       = document.getElementById('observacoes').value.trim();
 
  if (!categoria || !data || !descricao || !preco) {
    alert('Preencha todos os campos obrigatórios.'); return;
  }
 
  // "valor" é coluna gerada (quantidade * preco_unitario), então NÃO enviamos "valor"
  const payload = {
    tipo, descricao, categoria, data, hora: hora || null,
    quantidade: qtd, preco_unitario: preco,
    usuario_id: getUsuarioId(),
    ...(obs && { observacoes: obs }),
  };
 
  try {
    if (editId) {
      await sbPatch(`transacoes?id=eq.${editId}`, payload);
    } else {
      await sbPost('transacoes', payload);
    }
    fecharModal('modalTransacao');
    await carregarTransacoes();
  } catch (err) {
    alert('Erro ao salvar: ' + err.message);
  }
}
 
// =========================================================
// EDITAR
// =========================================================
function editarTransacao(id) {
  const tx = todasTransacoes.find(t => t.id === id);
  if (!tx) return;
 
  document.getElementById('editandoId').value        = id;
  document.getElementById('modalTitulo').textContent = 'Editar Transação';
  setTipo(tx.tipo);
  document.getElementById('categoria').value     = tx.categoria    || '';
  document.getElementById('dataTransacao').value = tx.data         || '';
  document.getElementById('horaTransacao').value = (tx.hora || '').slice(0, 5);
  document.getElementById('descricao').value     = tx.descricao    || '';
  document.getElementById('quantidade').value    = tx.quantidade   || 1;
  document.getElementById('precoUnitario').value = tx.preco_unitario || '';
  document.getElementById('observacoes').value   = tx.observacoes  || '';
  calcularTotal();
  abrirModal('modalTransacao');
}
 
// =========================================================
// EXCLUIR
// =========================================================
async function excluirTransacao(id) {
  if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
  try {
    await sbDelete(`transacoes?id=eq.${id}`);
    await carregarTransacoes();
  } catch (err) {
    alert('Erro ao excluir: ' + err.message);
  }
}
 
// =========================================================
// PDF — idêntico ao modelo enviado
// =========================================================
function selecionarOpcaoPDF(radio) {
  document.querySelectorAll('.opcao-pdf').forEach(el => el.classList.remove('active'));
  radio.closest('.opcao-pdf').classList.add('active');
}
 
async function gerarPDF() {
  const periodo = document.querySelector('input[name="periodoRelatorio"]:checked').value;
  const hoje    = new Date();
  let dataCorte, labelPeriodo;
 
  if (periodo === 'mensal') {
    dataCorte = new Date(hoje); dataCorte.setDate(hoje.getDate() - 30);
    labelPeriodo = 'MENSAL';
  } else if (periodo === 'semestral') {
    dataCorte = new Date(hoje); dataCorte.setMonth(hoje.getMonth() - 6);
    labelPeriodo = 'SEMESTRAL';
  } else {
    dataCorte = new Date(hoje); dataCorte.setFullYear(hoje.getFullYear() - 1);
    labelPeriodo = 'ANUAL';
  }
 
  const uid   = getUsuarioId();
  const filtU = uid ? `&usuario_id=eq.${uid}` : '';
  const corte = dataCorte.toISOString().split('T')[0];
 
  const lista = await sbGet(`transacoes?select=*${filtU}&data=gte.${corte}&order=data.desc,hora.desc`);
 
  const receitas = lista.filter(t => t.tipo === 'receita');
  const despesas = lista.filter(t => t.tipo === 'despesa');
  const totalR   = receitas.reduce((s, t) => s + +t.valor, 0);
  const totalD   = despesas.reduce((s, t) => s + +t.valor, 0);
  const saldo    = totalR - totalD;
 
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PW  = 210;
  let y     = 0;
 
  const COR_VERDE  = [13, 138, 79];
  const COR_ESCURO = [30, 30, 30];
  const COR_MEDIO  = [100, 116, 139];
  const COR_BORDA  = [226, 232, 240];
 
  // ── Cabeçalho verde ──────────────────────────────────
  doc.setFillColor(...COR_VERDE);
  doc.rect(0, 0, PW, 42, 'F');
 
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('POTYGEN - Sistema de Gestão', 14, 14);
 
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(FAZENDA_NOME, 14, 22);
  doc.text(`${FAZENDA_CIDADE} | CNPJ: ${FAZENDA_CNPJ}`, 14, 29);
 
  const agora   = new Date();
  const dtGer   = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR');
  doc.setFontSize(9);
  doc.text(`Gerado em: ${dtGer}`, PW - 14, 29, { align: 'right' });
 
  y = 52;
 
  // ── Título ───────────────────────────────────────────
  doc.setTextColor(...COR_ESCURO);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Relatório Financeiro ${labelPeriodo}`, 14, y);
  y += 10;
 
  // ── Resumo ───────────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...COR_BORDA);
  doc.roundedRect(14, y, PW - 28, 36, 3, 3, 'FD');
 
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COR_VERDE);
  doc.text('Resumo Financeiro', 20, y + 9);
 
  const col1 = 20, col2 = 90;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
 
  doc.setTextColor(...COR_MEDIO);
  doc.text('Total de Receitas:', col1, y + 18);
  doc.text('Total de Despesas:', col1, y + 25);
  doc.text('Saldo:', col1, y + 32);
 
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COR_ESCURO);
  doc.text(fmtM(totalR), col2, y + 18);
  doc.text(fmtM(totalD), col2, y + 25);
  doc.setTextColor(...(saldo >= 0 ? COR_VERDE : [220, 38, 38]));
  doc.text(fmtM(Math.abs(saldo)), col2, y + 32);
 
  y += 46;
 
  // ── Título das transações ────────────────────────────
  doc.setTextColor(...COR_ESCURO);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Transações Detalhadas', 14, y);
  y += 8;
 
  // ── Cada transação ───────────────────────────────────
  lista.forEach((tx, i) => {
    const isR  = tx.tipo === 'receita';
    const altH = tx.observacoes ? 32 : 27;
 
    // Nova página se necessário
    if (y + altH > 272) {
      // Rodapé da página atual
      _rodapePagina(doc, PW, COR_MEDIO);
      doc.addPage();
      y = 20;
    }
 
    // Fundo colorido por tipo
    doc.setFillColor(...(isR ? [240, 253, 246] : [255, 241, 242]));
    doc.setDrawColor(...(isR ? [187, 247, 208] : [254, 202, 202]));
    doc.roundedRect(14, y, PW - 28, altH, 2, 2, 'FD');
 
    // Número e tipo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...(isR ? COR_VERDE : [220, 38, 38]));
    doc.text(`${i + 1}. ${tx.tipo.toUpperCase()}`, 20, y + 7);
 
    // Data e hora
    const dtHr = tx.hora ? `${fmtD(tx.data)} às ${tx.hora.slice(0,5)}` : fmtD(tx.data);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COR_MEDIO);
    doc.text(`Data: ${dtHr}`, 20, y + 13);
 
    // Descrição e categoria
    doc.text(`Descrição: ${tx.descricao || '—'}`, 20, y + 18.5);
    doc.text(`Categoria: ${tx.categoria || '—'}`, 20, y + 24);  // alterado para a mesma linha pra caber
 
    // Qtd × preço = total (alinhado à direita)
    const qtd   = tx.quantidade    || 1;
    const preco = tx.preco_unitario || tx.valor;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COR_ESCURO);
    doc.text(`Qtd: ${qtd} × ${fmtM(preco)} = ${fmtM(tx.valor)}`, PW - 18, y + 13, { align: 'right' });
 
    // Observações
    if (tx.observacoes) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...COR_MEDIO);
      doc.text(`Obs: ${tx.observacoes}`, 20, y + 29);
    }
 
    y += altH + 4;
  });
 
  // Rodapé em todas as páginas
  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    _rodapePagina(doc, PW, COR_MEDIO, p, total);
  }
 
  doc.save(`relatorio-financeiro-${labelPeriodo.toLowerCase()}-${hoje.toISOString().split('T')[0]}.pdf`);
  fecharModal('modalPDF');
}
 
function _rodapePagina(doc, PW, cor, pAtual, pTotal) {
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 286, PW - 14, 286);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...cor);
  if (pAtual && pTotal) {
    doc.text(`Página ${pAtual} de ${pTotal}`, PW / 2, 291, { align: 'center' });
  }
  doc.text('Sistema Potygen - Powered by IA', PW / 2, 296, { align: 'center' });
}
 
// =========================================================
// HELPERS SUPABASE
// =========================================================
async function sbGet(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: SB });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sbPost(path, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: { ...SB, 'Prefer': 'return=minimal' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
}
async function sbPatch(path, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: { ...SB, 'Prefer': 'return=minimal' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
}
async function sbDelete(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'DELETE', headers: SB,
  });
  if (!r.ok) throw new Error(await r.text());
}
 
// =========================================================
// HELPERS GERAIS
// =========================================================
function abrirModal(id)  { document.getElementById(id).classList.add('aberto'); }
function fecharModal(id) { document.getElementById(id).classList.remove('aberto'); }
 
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('aberto'); });
});
 
function getUsuarioId() {
  try {
    const raw = localStorage.getItem('usuario') || localStorage.getItem('user') || '{}';
    return JSON.parse(raw).id || null;
  } catch { return null; }
}
 
function fmtM(v) {
  return parseFloat(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function fmtD(d) {
  if (!d) return '—';
  const [a, m, dia] = d.split('-');
  return `${dia}/${m}/${a}`;
}
 