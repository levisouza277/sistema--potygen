// ==========================================
// CONTROLE DE MENU MOBILE E UI
// ==========================================
function initializeMenuUI() {
    const sidebar = document.getElementById('sidebar') || document.getElementById('potygen-sidebar') || document.querySelector('.potygen-sidebar');
    const openBtn = document.getElementById('openMenu') || document.getElementById('navToggleBtn');
    const closeBtn = document.getElementById('closeMenu') || document.getElementById('navOverlay');

    if (openBtn && sidebar) {
        openBtn.addEventListener('click', () => { sidebar.classList.add('active'); });
    }
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => { sidebar.classList.remove('active'); });
    }
    document.addEventListener('click', (e) => {
        if (!sidebar || !openBtn) return;
        if (window.innerWidth <= 850 &&
            sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            !openBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    renderizarGraficos();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMenuUI);
} else {
    initializeMenuUI();
}

// ==========================================
// CONTROLE DE MODAIS
// ==========================================
function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function fecharModal(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.style.display = 'none');
        document.body.style.overflow = 'auto';
    }
});

// ==========================================
// UTILITÁRIOS
// ==========================================
function mostrarToast(msg, tipo = 'success') {
    const t = document.getElementById('potyToast');
    if (!t) return;
    t.textContent = msg;
    t.className = `show ${tipo}`;
    setTimeout(() => { t.className = ''; }, 3500);
}

function updateChart(canvasId, type, labels, datasets, extraOptions = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (dashboardCharts[canvasId]) {
        dashboardCharts[canvasId].destroy();
        delete dashboardCharts[canvasId];
    }
    const ctx = canvas.getContext('2d');
    dashboardCharts[canvasId] = new Chart(ctx, {
        type,
        data: { labels, datasets },
        options: Object.assign({
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: 8 },
            plugins: { tooltip: { mode: 'index', intersect: false } }
        }, extraOptions)
    });
}

// ==========================================
// GRÁFICOS (CHART.JS) - dados de fallback
// ==========================================
const dashboardCharts = {};

function renderizarGraficos() {
    initializeDashboardFilters();
    setupChartTypeSelection();
    setupDashboardFilterModal();
    setupNotificationButton();
    updateDashboardCharts();
}

function setupNotificationButton() {
    const notificationBell = document.getElementById('notificationBell');
    if (!notificationBell) return;
    notificationBell.addEventListener('click', () => {
        console.log('Notificações clicadas');
    });
}

function initializeDashboardFilters() {
    const filterSelect = document.getElementById('dashboardFilter');
    const periodSelect = document.getElementById('dashboardPeriod');
    if (filterSelect) filterSelect.addEventListener('change', updateDashboardCharts);
    if (periodSelect) periodSelect.addEventListener('change', updateDashboardCharts);
}

function setupDashboardFilterModal() {
    const modal = document.getElementById('dashboardFiltersModal');
    const openBtn = document.getElementById('openDashboardFilters');
    const closeBtn = document.getElementById('closeDashboardFilters');
    const cancelBtn = document.getElementById('cancelDashboardFilters');
    const applyBtn = document.getElementById('applyDashboardFilters');

    if (openBtn) openBtn.addEventListener('click', () => abrirModal('dashboardFiltersModal'));
    if (closeBtn) closeBtn.addEventListener('click', () => fecharModal('dashboardFiltersModal'));
    if (cancelBtn) cancelBtn.addEventListener('click', () => fecharModal('dashboardFiltersModal'));
    if (applyBtn) applyBtn.addEventListener('click', () => {
        atualizarVisibilidadeGraficos();
        carregarDadosDashboard();
        fecharModal('dashboardFiltersModal');
    });
    if (modal) modal.addEventListener('click', (event) => {
        if (event.target === modal) fecharModal('dashboardFiltersModal');
    });
}

function setupChartTypeSelection() {
    document.querySelectorAll('.chart-checkboxes input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', () => {
            atualizarVisibilidadeGraficos();
            updateDashboardCharts();
        });
    });
    atualizarVisibilidadeGraficos();
}

function atualizarVisibilidadeGraficos() {
    document.querySelectorAll('.chart-card-box[data-chart]').forEach(card => {
        const chartType = card.getAttribute('data-chart');
        const checkbox = document.querySelector(`.chart-checkboxes input[value="${chartType}"]`);
        if (checkbox) card.classList.toggle('hidden', !checkbox.checked);
    });
}

function updateDashboardCharts() {
    // Chamada delegada ao carregarDadosDashboard se Supabase estiver disponível
    if (typeof carregarDadosDashboard === 'function') {
        carregarDadosDashboard();
    }
}

// ============================================================
// SIDEBAR FAZENDA - ATUALIZAR DISPLAY
// ============================================================
function atualizarDisplayFazenda(fazenda) {
    if (!fazenda) return;
    const nomeEl = document.getElementById('sidebarFazendaNome');
    const badgeEl = document.getElementById('fazendaBadgeNome');
    const farmEl  = document.getElementById('userFarmDisplay');
    if (nomeEl) nomeEl.textContent = fazenda.nome || 'Trocar Fazenda';
    if (badgeEl) badgeEl.textContent = fazenda.nome || '—';
    if (farmEl) farmEl.textContent =
        [fazenda.tipo_criacao, [fazenda.cidade, fazenda.estado].filter(Boolean).join('/')].filter(Boolean).join(' · ') || '—';
}

// ============================================================
// MODAL TROCAR FAZENDA
// ============================================================
function abrirModalTrocarFazenda() {
    renderizarListaFazendas();
    abrirModal('modalTrocarFazenda');
}

function renderizarListaFazendas() {
    const lista = document.getElementById('fazendasLista');
    if (!lista) return;
    const fazendas = window.PotygenFazenda?.todasFazendas || [];
    const atualId  = window.PotygenFazenda?.getFazendaId();

    if (fazendas.length === 0) {
        lista.innerHTML = `
            <div class="fazendas-lista-vazia">
                <i class="fa-solid fa-tractor" style="font-size:28px;margin-bottom:8px;opacity:0.3;display:block;"></i>
                Nenhuma fazenda cadastrada ainda.
            </div>`;
        return;
    }
    lista.innerHTML = fazendas.map(f => `
        <div class="fazenda-item ${f.id === atualId ? 'ativa' : ''}" onclick="trocarFazenda('${f.id}')">
            <div class="fi-icon"><i class="fa-solid fa-tractor"></i></div>
            <div class="fi-info">
                <div class="fi-nome">${f.nome}</div>
                <div class="fi-sub">${[f.tipo_criacao, [f.cidade, f.estado].filter(Boolean).join('/')].filter(Boolean).join(' · ')}</div>
            </div>
            <i class="fa-solid fa-check fi-check"></i>
        </div>
    `).join('');
}

function trocarFazenda(fazendaId) {
    const fazenda = window.PotygenFazenda?.todasFazendas.find(f => f.id === fazendaId);
    if (!fazenda) return;
    window.PotygenFazenda.fazendaAtual = fazenda;
    sessionStorage.setItem('fazenda_atual_id', fazendaId);
    sessionStorage.setItem('fazenda_atual_json', JSON.stringify(fazenda));
    atualizarDisplayFazenda(fazenda);
    fecharModal('modalTrocarFazenda');
    if (typeof carregarDadosDashboard === 'function') carregarDadosDashboard();
    mostrarToast(`Fazenda trocada para: ${fazenda.nome}`);
}

// ============================================================
// MODAL CADASTRAR FAZENDA
// ============================================================
async function abrirModalCadastrarFazenda() {
    fecharModal('modalTrocarFazenda');
    if (typeof buscarDadosUsuario === 'function') {
        const usuario = await buscarDadosUsuario();
        if (usuario) {
            const propEl = document.getElementById('fzProprietario');
            const cpfEl  = document.getElementById('fzCpf');
            const cidEl  = document.getElementById('fzCidade');
            const estEl  = document.getElementById('fzEstado');
            if (propEl) propEl.value = usuario.nome || '';
            if (cpfEl)  cpfEl.value  = usuario.cpf  || '';
            if (cidEl && usuario.cidade) cidEl.value = usuario.cidade;
            if (estEl && usuario.estado) estEl.value = usuario.estado;
        }
    }
    abrirModal('modalCadastrarFazenda');
}

function fecharModalCadastro() {
    fecharModal('modalCadastrarFazenda');
    ['fzNome','fzTipoCriacao','fzArea','fzTelefone','fzCep','fzEndereco','fzCidade','fzDescricao'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const estEl = document.getElementById('fzEstado');
    if (estEl) estEl.value = '';
}

async function salvarFazenda() {
    const nome = document.getElementById('fzNome')?.value.trim();
    const tipo = document.getElementById('fzTipoCriacao')?.value;

    if (!nome) { mostrarToast('Informe o nome da fazenda.', 'error'); return; }
    if (!tipo) { mostrarToast('Selecione o tipo de criação.', 'error'); return; }

    const btn = document.getElementById('btnSalvarFazenda');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...'; }

    const dados = {
        nome,
        tipo_criacao: tipo,
        area_hectares: document.getElementById('fzArea')?.value || null,
        telefone:  document.getElementById('fzTelefone')?.value.trim() || null,
        cep:       document.getElementById('fzCep')?.value.trim() || null,
        endereco:  document.getElementById('fzEndereco')?.value.trim() || null,
        cidade:    document.getElementById('fzCidade')?.value.trim() || null,
        estado:    document.getElementById('fzEstado')?.value || null,
        descricao: document.getElementById('fzDescricao')?.value.trim() || null,
    };

    const resultado = await cadastrarFazenda(dados);

    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-tractor"></i> Cadastrar Fazenda'; }

    if (resultado.sucesso) {
        mostrarToast(`Fazenda "${nome}" cadastrada com sucesso!`);
        fecharModalCadastro();
        atualizarDisplayFazenda(resultado.fazenda);
        if (typeof carregarDadosDashboard === 'function') carregarDadosDashboard();
    } else {
        mostrarToast('Erro ao cadastrar fazenda: ' + resultado.erro, 'error');
    }
}

// ============================================================
// CARREGAR DADOS DO DASHBOARD (estatísticas + gráficos reais)
// ============================================================
async function carregarDadosDashboard() {
    if (typeof buscarEstatisticasFazenda !== 'function') return;

    const fazendaId = window.PotygenFazenda?.getFazendaId();
    const todasFaz  = document.getElementById('filterFazenda')?.value === 'todas';
    const meses     = parseInt(document.getElementById('dashboardPeriod')?.value || '6');
    const segmento  = document.getElementById('dashboardFilter')?.value || 'Todos';

    ['statTotalAnimais','statTaxaPrenhez','statInseminacoes','statAlertas'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = '—'; el.classList.add('loading'); }
    });

    const stats = await buscarEstatisticasFazenda(fazendaId, todasFaz);
    if (stats) {
        const setCard = (id, val) => {
            const el = document.getElementById(id);
            if (el) { el.textContent = val; el.classList.remove('loading'); }
        };
        setCard('statTotalAnimais', stats.total.toLocaleString('pt-BR'));
        setCard('statTaxaPrenhez', stats.taxaPrenhez + '%');
        setCard('statInseminacoes', stats.inseminacoesMes.toLocaleString('pt-BR'));
        setCard('statAlertas', stats.alertas.toLocaleString('pt-BR'));

        const bovinos  = segmento === 'Todos' ? stats.bovinos  : (segmento === 'Bovinos'  ? stats.bovinos  : 0);
        const ovinos   = segmento === 'Todos' ? stats.ovinos   : (segmento === 'Ovinos'   ? stats.ovinos   : 0);
        const caprinos = segmento === 'Todos' ? stats.caprinos : (segmento === 'Caprinos' ? stats.caprinos : 0);

        updateChart('doughnutChart','doughnut',['Bovinos','Ovinos','Caprinos'],
            [{label:'Distribuição',data:[bovinos,ovinos,caprinos],backgroundColor:['#00b34e','#3b82f6','#ff9900'],borderColor:'#ffffff',borderWidth:2}],
            {cutout:'65%',plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:10}}}});

        updateChart('pieChart','pie',['Bovinos','Ovinos','Caprinos'],
            [{label:'Participação',data:[bovinos,ovinos,caprinos],backgroundColor:['#00b34e','#3b82f6','#ff9900']}],
            {plugins:{legend:{position:'bottom',labels:{usePointStyle:true,boxWidth:10}}}});

        updateChart('barChart','bar',['Bovinos','Ovinos','Caprinos'],
            [{label:'Animais',data:[bovinos,ovinos,caprinos],backgroundColor:['#00b34e','#3b82f6','#ff9900'],borderRadius:12,maxBarThickness:48}],
            {scales:{y:{beginAtZero:true}},plugins:{legend:{display:false}}});
    }

    if (typeof buscarHistoricoMensal !== 'function') return;
    const historico = await buscarHistoricoMensal(fazendaId, meses, todasFaz);
    if (historico) {
        updateChart('lineChart','line',historico.labels,[
            {label:'Inseminações',data:historico.inseminacoes,borderColor:'#00b34e',backgroundColor:'rgba(0,179,78,0.15)',fill:true,tension:0.35,pointRadius:4,pointBackgroundColor:'#0d8a4f'},
            {label:'Prenhez Confirmada',data:historico.prenhez,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.1)',fill:true,tension:0.35,pointRadius:4,pointBackgroundColor:'#3b82f6'}
        ],{scales:{y:{beginAtZero:true}},plugins:{legend:{display:true,position:'bottom'}}});

        const radarCard = document.querySelector('[data-chart="radar"]');
        if (radarCard && !radarCard.classList.contains('hidden')) {
            updateChart('radarChart','radar',historico.labels,
                [{label:'Inseminações',data:historico.inseminacoes,borderColor:'#8a4fff',backgroundColor:'rgba(138,79,255,0.16)',pointBackgroundColor:'#8a4fff',pointBorderColor:'#fff'}],
                {scales:{r:{beginAtZero:true}},plugins:{legend:{display:false}}});
        }
    }
}

// ============================================================
// INICIALIZAÇÃO GLOBAL (fazenda + dashboard)
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Só executa lógica Supabase se supabaseClient estiver disponível
    if (typeof supabaseClient === 'undefined') return;

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        const { data: usuario } = await supabaseClient
            .from('usuarios').select('nome').eq('id', session.user.id).single();
        if (usuario) {
            const el = document.getElementById('userNameDisplay');
            if (el) el.textContent = usuario.nome;
        }
    }

    if (typeof window.inicializarFazenda === 'function') {
        await window.inicializarFazenda();
    }

    const fazendaAtual = window.PotygenFazenda?.fazendaAtual;
    if (fazendaAtual) {
        atualizarDisplayFazenda(fazendaAtual);
        carregarDadosDashboard();
    } else {
        const nomeEl = document.getElementById('sidebarFazendaNome');
        const subEl  = document.getElementById('sidebarFazendaSub');
        if (nomeEl) nomeEl.textContent = 'Cadastrar fazenda';
        if (subEl)  subEl.textContent  = 'Clique para começar';
        setTimeout(() => abrirModalCadastrarFazenda(), 700);
    }

    document.addEventListener('fazendaTrocada', (e) => {
        atualizarDisplayFazenda(e.detail);
        if (typeof carregarDadosDashboard === 'function') carregarDadosDashboard();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            ['modalTrocarFazenda','modalCadastrarFazenda','dashboardFiltersModal','modalNovoAnimal'].forEach(fecharModal);
        }
    });
});