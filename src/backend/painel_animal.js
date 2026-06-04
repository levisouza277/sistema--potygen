// ============================================================
// SUPABASE
// ============================================================
const SUPABASE_URL = "https://xjzydvtcqywnwmrltzkr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqenlkdnRjcXl3bndtcmx0emtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDkyMzEsImV4cCI6MjA5NDg4NTIzMX0.QCvTBvVCjxu4Wa65hitMQLsgEkNL4pXUNgmu__o8PCE";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// ESTADO
// ============================================================
let animalId = null;
let animalData = null;
let agendaRegistros = []; // todos os ciclos deste animal
let anoAtual, mesAtual;

// ============================================================
// UTILITÁRIOS
// ============================================================
function mostrarLoading(v){ document.getElementById('loadingOverlay').classList.toggle('ativo',v); }

function toast(msg, tipo='ok'){
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.style.background = tipo==='erro' ? '#dc2626' : '#1e293b';
    el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'), 3500);
}

function abrirModal(id){ document.getElementById(id).classList.add('aberto'); }
function fecharModal(id){ document.getElementById(id).classList.remove('aberto'); }

function getParam(p){ return new URLSearchParams(window.location.search).get(p); }

function formatarData(iso){
    if(!iso) return '—';
    const [a,m,d] = iso.split('-');
    return `${d}/${m}/${a}`;
}

function dataHoje(){ return new Date().toISOString().split('T')[0]; }

function addDias(iso, n){
    const d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
}

function gestacaoPorEspecie(especie){
    if(!especie) return 283;
    const s = especie.toLowerCase();
    if(s.includes('caprino')||s.includes('cabra')) return 150;
    if(s.includes('ovino')||s.includes('ovelha')) return 147;
    return 283;
}

function cioDias(especie){
    const s = (especie||'').toLowerCase();
    if(s.includes('caprino')||s.includes('cabra')) return 18;
    if(s.includes('ovino')||s.includes('ovelha')) return 16;
    return 21; // bovino
}

function meses(){ return ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']; }

function tagStatus(status){
    const m = {
        inseminada:'tag-inseminada', prenhe:'tag-prenhe', vazia:'tag-vazia',
        parto:'tag-parto', cio:'tag-cio', alta_prenhez:'tag-alta_prenhez', aborto:'tag-aborto'
    };
    const labels = {
        inseminada:'Inseminada', prenhe:'Prenhe ✅', vazia:'Vazia',
        parto:'Parto Registrado', cio:'Retorno ao Cio', alta_prenhez:'Alta Chance Prenhez', aborto:'Aborto'
    };
    const cls = m[status]||'tag-vazia';
    const lbl = labels[status]||status||'—';
    return `<span class="tag-status ${cls}">${lbl}</span>`;
}

function mudarTab(nome){
    document.querySelectorAll('.tab-btn').forEach((b,i)=>{
        const nomes = ['inseminacoes','ultrassons','partos','abortos'];
        b.classList.toggle('ativo', nomes[i]===nome);
    });
    document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('ativo'));
    document.getElementById('tab'+nome.charAt(0).toUpperCase()+nome.slice(1)).classList.add('ativo');
}

// ============================================================
// CARREGAR DADOS
// ============================================================
async function carregarAnimal(){
    mostrarLoading(true);
    try {
        const { data: animal, error } = await db.from('animais').select('*').eq('id', animalId).single();
        if(error) throw error;
        animalData = animal;
        renderizarPerfil(animal);
    } catch(e){
        toast('Erro ao carregar animal: ' + e.message, 'erro');
    } finally { mostrarLoading(false); }
}

async function carregarAgenda(){
    try {
        const { data, error } = await db
            .from('agenda_reprodutiva')
            .select('*')
            .eq('femea_id', animalId)
            .order('data_inseminacao', { ascending: false });
        if(error) throw error;
        agendaRegistros = data || [];
        renderizarHistorico();
        montarCalendario(anoAtual, mesAtual);
    } catch(e){
        console.error(e);
    }
}

// ============================================================
// RENDERIZAR PERFIL
// ============================================================
function renderizarPerfil(a){
    document.getElementById('pageTitulo').textContent = a.nome || 'Painel do Animal';
    document.getElementById('animalNome').textContent = a.nome || '—';
    document.getElementById('animalBrinco').textContent = `Brinco: #${a.brinco_id || a.codigo || '—'}`;

    // Avatar por espécie
    const av = document.getElementById('avatarAnimal');
    const esp = (a.especie||'').toLowerCase();
    let icone = 'fa-cow';
    if(esp.includes('caprino')||esp.includes('cabra')) icone = 'fa-goat';
    if(esp.includes('ovino')||esp.includes('ovelha')) icone = 'fa-sheep';
    av.innerHTML = `<i class="fa-solid ${icone}"></i>`;

    // Status mais recente da agenda
    if(agendaRegistros.length > 0){
        const statusTag = document.getElementById('animalStatusTag');
        statusTag.outerHTML = tagStatus(agendaRegistros[0].status);
    }

    // Info básica
    const container = document.getElementById('infoBasica');
    const campos = [
        ['Espécie', a.especie],
        ['Raça', a.raca],
        ['Nascimento', formatarData(a.data_nascimento)],
        ['Sexo', a.sexo || 'Fêmea'],
        ['Qtd. Partos', a.qtd_partos ?? '0'],
        ['Qtd. Crias', a.qtd_crias ?? '0'],
    ];
    container.innerHTML = campos.map(([l,v])=>`
        <div class="info-row">
            <span class="info-label">${l}</span>
            <span class="info-valor">${v||'—'}</span>
        </div>
    `).join('');
}

// ============================================================
// HISTÓRICO
// ============================================================
function renderizarHistorico(){
    // INSEMINAÇÕES
    const listaIns = document.getElementById('listaInseminacoes');
    const inseminacoes = agendaRegistros.filter(r=>r.data_inseminacao);
    if(inseminacoes.length === 0){
        listaIns.innerHTML = `<div class="empty-state"><i class="fa-solid fa-syringe"></i>Nenhuma inseminação registrada.</div>`;
    } else {
        listaIns.innerHTML = inseminacoes.map(r=>`
            <li>
                <div class="tl-icone tl-ins"><i class="fa-solid fa-syringe"></i></div>
                <div>
                    <div class="tl-label">${formatarData(r.data_inseminacao)}</div>
                    <div class="tl-sub">Status: ${r.status||'—'} • Cio previsto: ${formatarData(r.data_prevista_cio)}</div>
                </div>
            </li>
        `).join('');
    }

    // ULTRASSONS
    const listaU = document.getElementById('listaUltrassons');
    const ultrassons = agendaRegistros.filter(r=>r.data_ultrassom);
    if(ultrassons.length === 0){
        listaU.innerHTML = `<div class="empty-state"><i class="fa-solid fa-stethoscope"></i>Nenhum ultrassom registrado.</div>`;
    } else {
        listaU.innerHTML = ultrassons.map(r=>`
            <li>
                <div class="tl-icone tl-ultra"><i class="fa-solid fa-stethoscope"></i></div>
                <div>
                    <div class="tl-label">${formatarData(r.data_ultrassom)}</div>
                    <div class="tl-sub">Resultado: ${r.resultado_prenhez===true?'Prenhe ✅':r.resultado_prenhez===false?'Vazia ❌':'Pendente'}</div>
                </div>
            </li>
        `).join('');
    }

    // PARTOS
    const listaP = document.getElementById('listaPartos');
    const partos = agendaRegistros.filter(r=>r.data_parto_real);
    if(partos.length === 0){
        listaP.innerHTML = `<div class="empty-state"><i class="fa-solid fa-baby"></i>Nenhum parto registrado.</div>`;
    } else {
        listaP.innerHTML = partos.map(r=>`
            <li>
                <div class="tl-icone tl-parto"><i class="fa-solid fa-baby"></i></div>
                <div>
                    <div class="tl-label">Parto em ${formatarData(r.data_parto_real)}</div>
                    <div class="tl-sub">Previsto: ${formatarData(r.data_prevista_parto)} • Obs: ${r.observacoes||'—'}</div>
                </div>
            </li>
        `).join('');
    }

    // ABORTOS
    const listaA = document.getElementById('listaAbortos');
    const abortos = agendaRegistros.filter(r=>r.status==='aborto');
    if(abortos.length === 0){
        listaA.innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i>Nenhum aborto registrado.</div>`;
    } else {
        listaA.innerHTML = abortos.map(r=>`
            <li>
                <div class="tl-icone tl-aborto"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div>
                    <div class="tl-label">Aborto registrado</div>
                    <div class="tl-sub">${r.observacoes||'Sem observações'}</div>
                </div>
            </li>
        `).join('');
    }
}

// ============================================================
// CALENDÁRIO INDIVIDUAL
// ============================================================
function atualizarCalLabel(){
    document.getElementById('calMesLabel').textContent = `${meses()[mesAtual]} ${anoAtual}`;
}

function montarCalendario(ano, mes){
    atualizarCalLabel();
    const corpo = document.getElementById('corpoCalendario');
    corpo.innerHTML = '';
    const hoje = dataHoje();

    // Montar mapa de eventos deste animal
    const mapa = new Map();
    const add = (d, tipo) => {
        if(!d) return;
        if(!mapa.has(d)) mapa.set(d,[]);
        mapa.get(d).push(tipo);
    };

    agendaRegistros.forEach(r => {
        if(r.data_inseminacao) add(r.data_inseminacao, 'ins');
        if(r.data_prevista_cio && r.status==='inseminada') add(r.data_prevista_cio, 'cio');
        if(r.data_ultrassom) add(r.data_ultrassom, 'ultrassom');
        if(r.data_prevista_parto && (r.status==='prenhe'||r.status==='parto')) add(r.data_prevista_parto, 'parto');
        if(r.status==='aborto') add(r.data_inseminacao, 'aborto');
    });

    const primDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes+1, 0).getDate();
    let linha = document.createElement('tr');
    let col = 0;

    for(let i=0; i<primDia; i++){
        linha.innerHTML += `<td><div class="dia-vazio"></div></td>`;
        col++;
    }

    for(let dia=1; dia<=totalDias; dia++){
        if(col===7){ corpo.appendChild(linha); linha=document.createElement('tr'); col=0; }
        const ds = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
        const tipos = mapa.get(ds) || [];
        const isHoje = ds === hoje;

        let bolinhas = '<div class="bolinhas">';
        tipos.forEach(t => bolinhas += `<span class="ponto-evento ponto-${t}"></span>`);
        bolinhas += '</div>';

        const td = document.createElement('td');
        const div = document.createElement('div');
        div.className = 'dia-card' + (isHoje?' hoje':'');
        div.innerHTML = `<span class="dia-num">${dia}</span>${bolinhas}`;
        td.appendChild(div);
        linha.appendChild(td);
        col++;
    }

    while(col<7){ linha.innerHTML+=`<td><div class="dia-vazio"></div></td>`; col++; }
    corpo.appendChild(linha);
}

// ============================================================
// AÇÕES DOS MODAIS (exceto INSEMINAÇÃO)
// ============================================================

// -- AGENDAR/REGISTRAR ULTRASSOM --
document.getElementById('btnSalvarUltrassom').addEventListener('click', async () => {
    const data = document.getElementById('ultraData').value;
    const resultado = document.getElementById('ultraResultado').value;
    if(!data){ toast('Informe a data!', 'erro'); return; }

    // Pega o ciclo mais recente
    const reg = agendaRegistros[0];
    if(!reg){ toast('Nenhum ciclo ativo.', 'erro'); return; }

    mostrarLoading(true);
    try {
        const upd = { data_ultrassom: data };

        if(resultado === 'prenhe'){
            const diasGest = gestacaoPorEspecie(animalData?.especie);
            const dataParto = addDias(reg.data_inseminacao, diasGest);
            upd.resultado_prenhez = true;
            upd.status = 'prenhe';
            upd.data_prevista_parto = dataParto;
            toast(`Prenhe! Parto previsto em ${formatarData(dataParto)}.`);
        } else if(resultado === 'vazia'){
            upd.resultado_prenhez = false;
            upd.status = 'vazia';
            upd.data_prevista_parto = null;
            toast('Fêmea vazia. Ciclo encerrado.');
        } else {
            upd.status = 'alta_prenhez';
            toast('Ultrassom agendado!');
        }

        await db.from('agenda_reprodutiva').update(upd).eq('id', reg.id);
        fecharModal('modalUltrassom');
        await carregarAgenda();
    } catch(e){
        toast('Erro: ' + e.message, 'erro');
    } finally { mostrarLoading(false); }
});

// -- EDITAR CIO --
document.getElementById('btnSalvarCio').addEventListener('click', async () => {
    const previsto = document.getElementById('cioPrevisto').value;
    const real = document.getElementById('cioReal').value;
    const reg = agendaRegistros[0];
    if(!reg){ toast('Nenhum ciclo encontrado.', 'erro'); return; }
    mostrarLoading(true);
    try {
        const upd = {};
        if(previsto) upd.data_prevista_cio = previsto;
        if(real){ upd.data_cio_real = real; upd.cio_confirmado = true; upd.status_cio = 'retornou'; }
        await db.from('agenda_reprodutiva').update(upd).eq('id', reg.id);
        toast('Dados do cio atualizados!');
        fecharModal('modalEditarCio');
        await carregarAgenda();
    } catch(e){
        toast('Erro: ' + e.message, 'erro');
    } finally { mostrarLoading(false); }
});

// -- EDITAR PARTO --
document.getElementById('btnSalvarParto').addEventListener('click', async () => {
    const previsto = document.getElementById('partoPrevisto').value;
    const real = document.getElementById('partoReal').value;
    const reg = agendaRegistros[0];
    if(!reg){ toast('Nenhum ciclo encontrado.', 'erro'); return; }
    mostrarLoading(true);
    try {
        const upd = {};
        if(previsto) upd.data_prevista_parto = previsto;
        if(real){ upd.data_parto_real = real; upd.status = 'parto'; }
        await db.from('agenda_reprodutiva').update(upd).eq('id', reg.id);

        if(real){
            // Atualizar contador de partos
            const { data: a } = await db.from('animais').select('qtd_partos').eq('id',animalId).single();
            if(a) await db.from('animais').update({ qtd_partos:(a.qtd_partos||0)+1 }).eq('id',animalId);
        }

        toast('Parto atualizado com sucesso!');
        fecharModal('modalEditarParto');
        await Promise.all([carregarAnimal(), carregarAgenda()]);
    } catch(e){
        toast('Erro: ' + e.message, 'erro');
    } finally { mostrarLoading(false); }
});

// -- REGISTRAR ABORTO --
document.getElementById('btnSalvarAborto').addEventListener('click', async () => {
    const data = document.getElementById('abortoData').value;
    const causa = document.getElementById('abortoCausa').value;
    const reprodutor = document.getElementById('abortoReprodutor').value;
    const obs = document.getElementById('abortoObs').value;
    if(!data){ toast('Informe a data!', 'erro'); return; }
    const reg = agendaRegistros[0];
    if(!reg){ toast('Nenhum ciclo encontrado.', 'erro'); return; }
    mostrarLoading(true);
    try {
        await db.from('agenda_reprodutiva').update({
            status: 'aborto',
            data_prevista_parto: null,
            data_parto_real: null,
            observacoes: `Aborto em ${data}. Causa: ${causa||'—'}. Reprodutor: ${reprodutor||'—'}. ${obs||''}`
        }).eq('id', reg.id);
        toast('Aborto registrado. Parto cancelado.');
        fecharModal('modalRegistrarAborto');
        await carregarAgenda();
    } catch(e){
        toast('Erro: ' + e.message, 'erro');
    } finally { mostrarLoading(false); }
});

// -- REGISTRAR NASCIMENTO --
document.getElementById('btnSalvarNascimento').addEventListener('click', async () => {
    const data = document.getElementById('nascData').value;
    const qtd = parseInt(document.getElementById('nascQtd').value)||1;
    const sexo = document.getElementById('nascSexo').value;
    const raca = document.getElementById('nascRaca').value;
    const obs = document.getElementById('nascObs').value;
    if(!data){ toast('Informe a data!', 'erro'); return; }
    const reg = agendaRegistros[0];
    if(!reg){ toast('Nenhum ciclo encontrado.', 'erro'); return; }
    mostrarLoading(true);
    try {
        // Atualizar agenda
        await db.from('agenda_reprodutiva').update({
            data_parto_real: data,
            status: 'parto',
            observacoes: `${qtd} cria(s) — Sexo: ${sexo} — Raça: ${raca||'—'}. ${obs||''}`
        }).eq('id', reg.id);

        // Atualizar animal
        const { data: a } = await db.from('animais').select('qtd_partos,qtd_crias').eq('id',animalId).single();
        if(a){
            await db.from('animais').update({
                qtd_partos: (a.qtd_partos||0)+1,
                qtd_crias: (a.qtd_crias||0)+qtd
            }).eq('id', animalId);
        }

        toast(`Nascimento registrado! ${qtd} cria(s) registrada(s).`);
        fecharModal('modalRegistrarNascimento');
        await Promise.all([carregarAnimal(), carregarAgenda()]);
    } catch(e){
        toast('Erro: ' + e.message, 'erro');
    } finally { mostrarLoading(false); }
});

// ============================================================
// NAVEGAÇÃO CALENDÁRIO
// ============================================================
document.getElementById('btnMesAnt').addEventListener('click', () => {
    if(mesAtual===0){ mesAtual=11; anoAtual--; } else mesAtual--;
    montarCalendario(anoAtual, mesAtual);
});
document.getElementById('btnMesProx').addEventListener('click', () => {
    if(mesAtual===11){ mesAtual=0; anoAtual++; } else mesAtual++;
    montarCalendario(anoAtual, mesAtual);
});

// Fechar modais ao clicar fora
document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if(e.target===m) m.classList.remove('aberto'); });
});

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    animalId = getParam('id');
    if(!animalId){
        alert('Nenhum animal selecionado.');
        window.location.href = 'gestao-animais.html';
        return;
    }

    const hoje = new Date();
    anoAtual = hoje.getFullYear();
    mesAtual = hoje.getMonth();

    await carregarAnimal();
    await carregarAgenda();

    // Pré-preencher datas dos modais com hoje
    document.getElementById('abortoData').value = dataHoje();
    document.getElementById('nascData').value = dataHoje();
    document.getElementById('ultraData').value = dataHoje();
});