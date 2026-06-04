// ============================================================
// SUPABASE
// ============================================================
const SUPABASE_URL = "https://xjzydvtcqywnwmrltzkr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqenlkdnRjcXl3bndtcmx0emtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDkyMzEsImV4cCI6MjA5NDg4NTIzMX0.QCvTBvVCjxu4Wa65hitMQLsgEkNL4pXUNgmu__o8PCE";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// ESTADO
// ============================================================
let anoAtual, mesAtual;
// Cada item de dadosCombinados = { inseminacao, agenda, animal }
let dadosCombinados = [];
let registroFoco = null;   // { inseminacao, agenda, animal } em ação
let opcaoSelecionada = {};

// ============================================================
// UTILITÁRIOS
// ============================================================
const $ = id => document.getElementById(id);
function mostrarLoading(v){ $('loadingOverlay').classList.toggle('ativo',v); }
function toast(msg, tipo='ok'){
    const el = $('toast');
    el.textContent = msg;
    el.style.background = tipo==='erro' ? '#dc2626' : '#1e293b';
    el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'), 3500);
}
function abrirModal(id){ $(id).classList.add('aberto'); }
function fecharModal(id){ $(id).classList.remove('aberto'); }
function fmt(iso){ if(!iso)return'—'; const[a,m,d]=iso.split('-'); return `${d}/${m}/${a}`; }
function hoje(){ return new Date().toISOString().split('T')[0]; }
function addDias(iso,n){ const d=new Date(iso+'T00:00:00'); d.setDate(d.getDate()+n); return d.toISOString().split('T')[0]; }

function gestDias(especie){
    const s=(especie||'').toLowerCase();
    if(s.includes('caprino')||s.includes('cabra')) return 150;
    if(s.includes('ovino')||s.includes('ovelha')) return 147;
    return 283;
}
function cioDias(especie){
    const s=(especie||'').toLowerCase();
    if(s.includes('caprino')||s.includes('cabra')) return 18;
    if(s.includes('ovino')||s.includes('ovelha')) return 16;
    return 21;
}

function selecionarOpcao(tipo, val){
    opcaoSelecionada[tipo]=val;
    if(tipo==='cio'){
        $('btnCioSim').classList.toggle('selecionado', val==='sim');
        $('btnCioNao').classList.toggle('selecionado', val==='nao');
        $('blocoUltraCio').style.display = val==='nao'?'block':'none';
    }
    if(tipo==='ultra'){
        $('btnUltraSim').classList.toggle('selecionado', val==='sim');
        $('btnUltraNao').classList.toggle('selecionado', val==='nao');
    }
}

function badgeHtml(status){
    const map = {
        'Agendada':         ['badge-Agendada',     'Agendada'],
        'Realizada':        ['badge-Realizada',    'Realizada'],
        'alta_prenhez':     ['badge-alta_prenhez', 'Alta Chance Prenhez'],
        'prenhe':           ['badge-prenhe',       'Prenhe ✅'],
        'vazia':            ['badge-vazia',        'Vazia'],
        'parto':            ['badge-parto',        'Parto Registrado'],
        'cio':              ['badge-cio',          'Retorno ao Cio'],
        'aborto':           ['badge-aborto',       'Aborto'],
        'Prenhez Confirmada':['badge-prenhe',      'Prenhez Confirmada'],
        'Falha':            ['badge-vazia',        'Falha'],
        'Cancelada':        ['badge-aborto',       'Cancelada'],
    };
    const [cls,lbl] = map[status]||['badge-vazia', status||'—'];
    return `<span class="badge-status ${cls}">${lbl}</span>`;
}

// ============================================================
// STATUS EFETIVO: agenda tem prioridade, senão usa inseminacao
// ============================================================
function statusEfetivo(item){
    if(item.agenda?.status) return item.agenda.status;
    return item.inseminacao?.status || '—';
}

// ============================================================
// CARREGAR DADOS
// ============================================================
async function carregarDados(){
    mostrarLoading(true);
    try {
        // 1. Buscar todas as inseminações com dados da fêmea (animais)
        const { data: inseminacoes, error: errIns } = await db
            .from('inseminacoes')
            .select(`
                id, femea_id, codigo_femea, codigo_reprodutor,
                data_inseminacao, metodo, tecnico_responsavel,
                status, resultado_prenhez, data_diagnostico,
                animais!inseminacoes_femea_id_fkey ( id, nome, especie, raca, brinco_id, qtd_partos, qtd_crias )
            `)
            .order('data_inseminacao', { ascending: false });

        if(errIns) throw errIns;

        // 2. Buscar todos os registros de agenda_reprodutiva
        const { data: agendas, error: errAg } = await db
            .from('agenda_reprodutiva')
            .select('*');

        if(errAg) throw errAg;

        // 3. Montar mapa agenda por inseminacao_id
        const mapaAgenda = {};
        (agendas||[]).forEach(ag => {
            if(ag.inseminacao_id) mapaAgenda[ag.inseminacao_id] = ag;
        });

        // 4. Combinar: cada inseminação + sua agenda (se existir)
        dadosCombinados = (inseminacoes||[]).map(ins => ({
            inseminacao: ins,
            agenda:      mapaAgenda[ins.id] || null,
            animal:      ins.animais || {}
        }));

        // 5. Para inseminações sem agenda, criar automaticamente
        const semAgenda = dadosCombinados.filter(d => !d.agenda);
        for(const item of semAgenda){
            await criarAgendaParaInseminacao(item.inseminacao, item.animal);
        }

        // Se criou novas agendas, recarregar
        if(semAgenda.length > 0){
            await carregarDados();
            return;
        }

        montarCalendarioGeral(anoAtual, mesAtual);
        renderizarTabela(dadosCombinados);

    } catch(e){
        console.error(e);
        toast('Erro ao carregar dados: '+e.message, 'erro');
    } finally {
        mostrarLoading(false);
    }
}

// ============================================================
// CRIAR AGENDA AUTOMATICAMENTE PARA UMA INSEMINAÇÃO
// ============================================================
async function criarAgendaParaInseminacao(ins, animal){
    const especie = animal?.especie || 'Bovino';
    const dias = cioDias(especie);
    const dataCio = addDias(ins.data_inseminacao, dias);

    const novo = {
        id: crypto.randomUUID(),
        femea_id: ins.femea_id,
        inseminacao_id: ins.id,
        data_inseminacao: ins.data_inseminacao,
        data_prevista_cio: dataCio,
        status: ins.status === 'Prenhez Confirmada' ? 'prenhe' : 'Realizada'
    };

    // Se já há diagnóstico na inseminação, aproveitar
    if(ins.resultado_prenhez === true && ins.data_diagnostico){
        novo.data_ultrassom = ins.data_diagnostico;
        novo.resultado_prenhez = true;
        novo.status = 'prenhe';
        novo.data_prevista_parto = addDias(ins.data_inseminacao, gestDias(especie));
    } else if(ins.resultado_prenhez === false){
        novo.resultado_prenhez = false;
        novo.status = 'vazia';
    }

    const { error } = await db.from('agenda_reprodutiva').insert(novo);
    if(error) console.warn('Erro ao criar agenda:', error.message);
}

// ============================================================
// CALENDÁRIO
// ============================================================
function atualizarSeletores(){
    $('selectMes').value = mesAtual;
    $('selectAno').value = anoAtual;
}

function construirMapaEventos(){
    const mapa = new Map();
    const add = (dataStr, tipo, label, item) => {
        if(!dataStr) return;
        if(!mapa.has(dataStr)) mapa.set(dataStr,[]);
        mapa.get(dataStr).push({tipo, label, item});
    };

    dadosCombinados.forEach(d => {
        const {inseminacao: ins, agenda: ag, animal: an} = d;
        const nome = an?.nome || ins?.codigo_femea || 'Animal';
        const st = statusEfetivo(d);

        // Inseminação
        if(ins.data_inseminacao)
            add(ins.data_inseminacao, 'ins', `Inseminação: ${nome}`, d);

        // Cio previsto (só se ainda não resolvido)
        if(ag?.data_prevista_cio && (st==='Realizada'||st==='inseminada'||st==='Agendada'))
            add(ag.data_prevista_cio, 'cio', `Verificar Cio: ${nome}`, d);

        // Ultrassom agendado
        if(ag?.data_ultrassom && st!=='prenhe' && st!=='vazia' && st!=='parto' && st!=='aborto')
            add(ag.data_ultrassom, 'ultrassom', `Ultrassom: ${nome}`, d);

        // Parto previsto
        if(ag?.data_prevista_parto && (st==='prenhe'||st==='parto'||st==='Prenhez Confirmada'))
            add(ag.data_prevista_parto, 'parto', `Parto Previsto: ${nome}`, d);

        // Aborto
        if(st==='aborto')
            add(ins.data_inseminacao, 'aborto', `Aborto: ${nome}`, d);
    });

    return mapa;
}

function montarCalendarioGeral(ano, mes){
    const corpo = $('corpoCalendarioGeral');
    if(!corpo) return;
    corpo.innerHTML = '';

    const hojeStr = hoje();
    const mapaEv = construirMapaEventos();
    const primDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes+1, 0).getDate();

    let linha = document.createElement('tr');
    let col = 0;

    for(let i=0; i<primDia; i++){
        linha.appendChild(tdVazio()); col++;
    }

    for(let dia=1; dia<=totalDias; dia++){
        if(col===7){ corpo.appendChild(linha); linha=document.createElement('tr'); col=0; }
        const ds = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
        const evs = mapaEv.get(ds)||[];
        const isHoje = ds===hojeStr;

        let bolinhas = '<div class="bolinhas-dia">';
        evs.forEach(e=>{ bolinhas+=`<span class="ponto-evento ponto-${e.tipo}" title="${e.label}"></span>`; });
        bolinhas += '</div>';

        const td = document.createElement('td');
        const div = document.createElement('div');
        div.className = 'dia-card'+(isHoje?' hoje':'');
        div.innerHTML = `<span class="dia-numero">${dia}</span>${bolinhas}`;
        div.addEventListener('click', ()=>abrirEventosDia(ds, dia, mes, ano, evs));
        td.appendChild(div);
        linha.appendChild(td);
        col++;
    }

    while(col<7){ linha.appendChild(tdVazio()); col++; }
    corpo.appendChild(linha);
}

function tdVazio(){ const td=document.createElement('td'); td.innerHTML='<div class="dia-vazio"></div>'; return td; }

// ============================================================
// MODAL EVENTOS DO DIA
// ============================================================
function abrirEventosDia(dataStr, dia, mes, ano, evs){
    $('modalDiaTitulo').textContent = `${String(dia).padStart(2,'0')}/${String(mes+1).padStart(2,'0')}/${ano}`;
    const lista = $('listaEventosDia');
    lista.innerHTML = '';

    if(!evs.length){
        lista.innerHTML = `<li style="color:#94a3b8;text-align:center;padding:16px;">Nenhum evento neste dia.</li>`;
    } else {
        evs.forEach(ev=>{
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="ponto-evento ponto-${ev.tipo}" style="width:12px;height:12px;flex-shrink:0;"></span>
                <div>
                    <div class="ev-label">${ev.label}</div>
                    <div class="ev-sub">${ev.item.animal?.especie||''} • ${ev.item.inseminacao?.codigo_femea||''}</div>
                </div>
            `;
            li.addEventListener('click',()=>{ fecharModal('modalDia'); abrirAcaoEvento(ev); });
            lista.appendChild(li);
        });
    }
    abrirModal('modalDia');
}

// ============================================================
// ROTEADOR DE AÇÕES
// ============================================================
function abrirAcaoEvento(ev){
    registroFoco = ev.item;
    const nome = ev.item.animal?.nome || ev.item.inseminacao?.codigo_femea || 'Animal';
    const especie = ev.item.animal?.especie || 'Bovino';

    if(ev.tipo==='cio'){
        $('modalCioAnimal').textContent = `Fêmea: ${nome} (${especie})`;
        opcaoSelecionada.cio=null;
        $('btnCioSim').classList.remove('selecionado');
        $('btnCioNao').classList.remove('selecionado');
        $('blocoUltraCio').style.display='none';
        $('inputDataUltraCio').value='';
        abrirModal('modalCio');
        return;
    }
    if(ev.tipo==='ultrassom'){
        // Verificar se ultrassom já foi agendado → registrar resultado
        const ag = ev.item.agenda;
        $('modalUltraAnimal').textContent = `Fêmea: ${nome} (${especie})`;
        $('inputDataUltrassom').value = ag?.data_ultrassom || hoje();
        opcaoSelecionada.ultra=null;
        $('btnUltraSim').classList.remove('selecionado');
        $('btnUltraNao').classList.remove('selecionado');
        abrirModal('modalUltrassom');
        return;
    }
    if(ev.tipo==='parto'){
        $('modalPartoAnimal').textContent = `Fêmea: ${nome} — Parto previsto: ${fmt(ev.item.agenda?.data_prevista_parto)}`;
        $('inputDataParto').value = hoje();
        abrirModal('modalParto');
        return;
    }
    if(ev.tipo==='ins'){
        toast(`Inseminação de ${nome} em ${fmt(ev.item.inseminacao?.data_inseminacao)}`);
    }
}

// ============================================================
// SALVAR: CIO
// ============================================================
$('btnConfirmarCio').addEventListener('click', async ()=>{
    const resp = opcaoSelecionada.cio;
    if(!resp){ toast('Selecione uma opção!','erro'); return; }
    const {inseminacao: ins, agenda: ag} = registroFoco;
    mostrarLoading(true);
    try{
        if(resp==='sim'){
            // Retornou ao cio → encerrar ciclo
            await db.from('agenda_reprodutiva').update({
                cio_confirmado: true,
                data_cio_real: hoje(),
                status_cio: 'retornou',
                status: 'cio',
                data_prevista_parto: null,
                data_ultrassom: null
            }).eq('id', ag.id);

            // Atualizar status na inseminação para Falha
            await db.from('inseminacoes').update({ status:'Falha' }).eq('id', ins.id);
            toast('Retorno ao cio confirmado. Ciclo encerrado.');
        } else {
            // Não retornou → alta chance de prenhez
            const dataUltra = $('inputDataUltraCio').value || null;
            const upd = { cio_confirmado:false, status_cio:'nao_retornou', status:'alta_prenhez' };
            if(dataUltra) upd.data_ultrassom = dataUltra;
            await db.from('agenda_reprodutiva').update(upd).eq('id', ag.id);
            toast('Alta chance de prenhez registrada!'+(dataUltra?' Ultrassom agendado.':''));
        }
        fecharModal('modalCio');
        await carregarDados();
    }catch(e){ toast('Erro: '+e.message,'erro'); }
    finally{ mostrarLoading(false); }
});

// ============================================================
// SALVAR: AGENDAR ULTRASSOM (via modal de cio→não)
// ============================================================
$('btnConfirmarAgUltrassom').addEventListener('click', async ()=>{
    const data = $('inputAgendaUltrassom').value;
    if(!data){ toast('Informe a data!','erro'); return; }
    const {agenda: ag} = registroFoco;
    mostrarLoading(true);
    try{
        await db.from('agenda_reprodutiva').update({
            data_ultrassom: data,
            status: 'alta_prenhez'
        }).eq('id', ag.id);
        toast('Ultrassom agendado!');
        fecharModal('modalAgendarUltrassom');
        await carregarDados();
    }catch(e){ toast('Erro: '+e.message,'erro'); }
    finally{ mostrarLoading(false); }
});

// ============================================================
// SALVAR: RESULTADO ULTRASSOM
// ============================================================
$('btnSalvarUltrassom').addEventListener('click', async ()=>{
    const resp = opcaoSelecionada.ultra;
    if(!resp){ toast('Selecione o resultado!','erro'); return; }
    const dataU = $('inputDataUltrassom').value || hoje();
    const {inseminacao: ins, agenda: ag, animal: an} = registroFoco;
    mostrarLoading(true);
    try{
        if(resp==='nao'){
            await db.from('agenda_reprodutiva').update({
                data_ultrassom: dataU, resultado_prenhez:false,
                status:'vazia', data_prevista_parto:null
            }).eq('id', ag.id);
            await db.from('inseminacoes').update({
                resultado_prenhez:false, data_diagnostico:dataU, status:'Falha'
            }).eq('id', ins.id);
            toast('Fêmea vazia. Ciclo encerrado.');
        } else {
            const diasGest = gestDias(an?.especie);
            const dataParto = addDias(ins.data_inseminacao, diasGest);
            await db.from('agenda_reprodutiva').update({
                data_ultrassom: dataU, resultado_prenhez:true,
                status:'prenhe', data_prevista_parto:dataParto
            }).eq('id', ag.id);
            await db.from('inseminacoes').update({
                resultado_prenhez:true, data_diagnostico:dataU, status:'Prenhez Confirmada'
            }).eq('id', ins.id);
            toast(`Prenhe! Parto previsto em ${fmt(dataParto)}.`);
        }
        fecharModal('modalUltrassom');
        await carregarDados();
    }catch(e){ toast('Erro: '+e.message,'erro'); }
    finally{ mostrarLoading(false); }
});

// ============================================================
// SALVAR: PARTO
// ============================================================
$('btnSalvarParto').addEventListener('click', async ()=>{
    const dataParto = $('inputDataParto').value;
    const qtd = parseInt($('inputQtdCrias').value)||1;
    const sexo = $('selectSexoCrias').value;
    const obs = $('inputObsParto').value;
    if(!dataParto){ toast('Informe a data do parto!','erro'); return; }
    const {inseminacao: ins, agenda: ag} = registroFoco;
    mostrarLoading(true);
    try{
        await db.from('agenda_reprodutiva').update({
            data_parto_real: dataParto, status:'parto',
            observacoes: `${qtd} cria(s) — Sexo: ${sexo}. ${obs||''}`
        }).eq('id', ag.id);

        // Atualizar contadores na tabela animais
        const { data: animal } = await db.from('animais').select('qtd_partos,qtd_crias').eq('id', ins.femea_id).single();
        if(animal){
            await db.from('animais').update({
                qtd_partos: (animal.qtd_partos||0)+1,
                qtd_crias:  (animal.qtd_crias||0)+qtd
            }).eq('id', ins.femea_id);
        }

        toast(`Parto de registrado! ${qtd} cria(s).`);
        fecharModal('modalParto');
        await carregarDados();
    }catch(e){ toast('Erro: '+e.message,'erro'); }
    finally{ mostrarLoading(false); }
});

// ============================================================
// TABELA DE ACOMPANHAMENTO
// ============================================================
function renderizarTabela(lista){
    const tbody = $('tabelaAcompanhamento');
    if(!tbody) return;
    tbody.innerHTML = '';

    if(!lista.length){
        tbody.innerHTML = `<tr class="empty-row"><td colspan="7">
            <i class="fa-solid fa-cow" style="font-size:24px;display:block;margin-bottom:8px;"></i>
            Nenhuma inseminação registrada ainda.
        </td></table>`;
        return;
    }

    lista.forEach(d=>{
        const {inseminacao:ins, agenda:ag, animal:an} = d;
        const st = statusEfetivo(d);

        // Calcular próximo evento
        let proximo = '—';
        if(st==='Realizada'||st==='Agendada'||st==='inseminada'){
            if(ag?.data_prevista_cio) proximo=`🔄 Cio: ${fmt(ag.data_prevista_cio)}`;
        } else if(st==='alta_prenhez'){
            if(ag?.data_ultrassom) proximo=`🔬 Ultrassom: ${fmt(ag.data_ultrassom)}`;
            else proximo='🔬 Agendar ultrassom';
        } else if(st==='prenhe'||st==='Prenhez Confirmada'){
            if(ag?.data_prevista_parto) proximo=`🐣 Parto: ${fmt(ag.data_prevista_parto)}`;
        }

        tbody.innerHTML += `
            <tr>
                <td><span style="font-weight:700;color:#0d8a4f;">${ins.codigo_femea||'—'}</span></td>
                <td><strong>${an?.nome||'—'}</strong></td>
                <td>${an?.especie||'—'}</td>
                <td>${fmt(ins.data_inseminacao)}</td>
                <td>${badgeHtml(st)}</td>
                <td style="font-size:13px;color:#475569;">${proximo}</td>
                <td>
                    <a href="painel_animal.html?id=${an?.id||ins.femea_id}" class="btn-ver">
                        <i class="fa-regular fa-eye"></i> Ver
                    </a>
                 </td>
            </tr>
        `;
    });
}

// ============================================================
// BUSCA
// ============================================================
$('inputBusca').addEventListener('input', e=>{
    const q = e.target.value.toLowerCase();
    const filtrado = dadosCombinados.filter(d=>
        (d.animal?.nome||'').toLowerCase().includes(q)||
        (d.inseminacao?.codigo_femea||'').toLowerCase().includes(q)
    );
    renderizarTabela(filtrado);
});

// ============================================================
// NAVEGAÇÃO CALENDÁRIO
// ============================================================
$('selectMes').addEventListener('change', e=>{ mesAtual=parseInt(e.target.value); montarCalendarioGeral(anoAtual,mesAtual); });
$('selectAno').addEventListener('input', e=>{ const v=parseInt(e.target.value); if(!isNaN(v)&&v>0){anoAtual=v;montarCalendarioGeral(anoAtual,mesAtual);} });
$('btnMesAnterior').addEventListener('click',()=>{ if(mesAtual===0){mesAtual=11;anoAtual--;}else mesAtual--; atualizarSeletores(); montarCalendarioGeral(anoAtual,mesAtual); });
$('btnMesProximo').addEventListener('click',()=>{ if(mesAtual===11){mesAtual=0;anoAtual++;}else mesAtual++; atualizarSeletores(); montarCalendarioGeral(anoAtual,mesAtual); });

// Fechar modais clicando fora
document.querySelectorAll('.modal-overlay').forEach(m=>{
    m.addEventListener('click', e=>{ if(e.target===m) m.classList.remove('aberto'); });
});

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', ()=>{
    const d = new Date();
    anoAtual = d.getFullYear();
    mesAtual = d.getMonth();
    atualizarSeletores();
    carregarDados();
});