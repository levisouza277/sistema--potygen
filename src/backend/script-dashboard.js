// ==========================================
// CONTROLE DE MENU MOBILE E UI
// ==========================================
function initializeMenuUI() {
    const sidebar = document.getElementById('sidebar') || document.getElementById('potygen-sidebar') || document.querySelector('.potygen-sidebar');
    const openBtn = document.getElementById('openMenu') || document.getElementById('navToggleBtn');
    const closeBtn = document.getElementById('closeMenu') || document.getElementById('navOverlay');

    // Abre menu
    if (openBtn && sidebar) {
        openBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }

    // Fecha menu
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    // Fechar ao clicar fora (Mobile)
    document.addEventListener('click', (e) => {
        if (!sidebar || !openBtn) return;
        if (window.innerWidth <= 850 && 
            sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !openBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Inicializa Gráficos
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
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Trava scroll do fundo
    }
}

function fecharModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Fechar com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.style.display = 'none');
        document.body.style.overflow = 'auto';
    }
});

// ==========================================
// GRÁFICOS (CHART.JS)
// ==========================================
const dashboardCharts = {};
const dashboardData = {
    labels: {
        '3meses': ['Abr', 'Mai', 'Jun'],
        '6meses': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        '12meses': ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
    },
    datasets: {
        Todos: {
            inseminacoes: [29, 34, 37, 41, 45, 52, 55, 58, 62, 60, 63, 68],
            producao: [380, 395, 410, 430, 450, 480, 500, 520, 540, 530, 550, 570],
            especies: [550, 220, 150],
            saude: [78, 82, 74, 88, 73, 80, 85, 83, 87, 84, 86, 90],
            manejo: [24, 18, 15, 12, 10, 8]
        },
        Bovinos: {
            inseminacoes: [22, 24, 26, 29, 31, 35, 38, 42, 45, 44, 47, 50],
            producao: [280, 295, 310, 330, 350, 370, 385, 400, 420, 410, 430, 450],
            especies: [550, 40, 20],
            saude: [82, 85, 78, 90, 80, 86, 88, 87, 89, 88, 90, 92],
            manejo: [18, 14, 12, 10, 9, 7]
        },
        Ovinos: {
            inseminacoes: [4, 5, 4, 5, 6, 7, 7, 8, 8, 7, 8, 9],
            producao: [65, 62, 64, 66, 68, 70, 72, 74, 76, 75, 77, 80],
            especies: [0, 220, 40],
            saude: [70, 72, 68, 75, 70, 74, 76, 77, 78, 79, 80, 81],
            manejo: [4, 3, 2, 1, 1, 1]
        },
        Caprinos: {
            inseminacoes: [1, 2, 2, 3, 3, 4, 4, 5, 5, 4, 5, 6],
            producao: [28, 25, 27, 30, 32, 33, 34, 35, 36, 35, 36, 38],
            especies: [0, 0, 150],
            saude: [68, 70, 72, 79, 74, 79, 80, 81, 82, 83, 84, 85],
            manejo: [2, 1, 1, 1, 0, 0]
        }
    }
};

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
        const videoFile = encodeURI('file:///C:/Users/aluno/AppData/Local/Packages/Microsoft.ScreenSketch_8wekyb3d8bbwe/TempState/Recordings/20260602-1932-08.1263335.mp4');
        const opened = window.open(videoFile, '_blank');
        if (!opened) {
            window.location.href = videoFile;
        }
    });
}

function initializeDashboardFilters() {
    const filterSelect = document.getElementById('dashboardFilter');
    const periodSelect = document.getElementById('dashboardPeriod');

    if (filterSelect) {
        filterSelect.addEventListener('change', updateDashboardCharts);
    }
    if (periodSelect) {
        periodSelect.addEventListener('change', updateDashboardCharts);
    }
}

function setupDashboardFilterModal() {
    const openBtn = document.getElementById('openDashboardFilters');
    const closeBtn = document.getElementById('closeDashboardFilters');
    const cancelBtn = document.getElementById('cancelDashboardFilters');
    const applyBtn = document.getElementById('applyDashboardFilters');
    const modal = document.getElementById('dashboardFiltersModal');

    if (openBtn) {
        openBtn.addEventListener('click', () => abrirModal('dashboardFiltersModal'));
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => fecharModal('dashboardFiltersModal'));
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => fecharModal('dashboardFiltersModal'));
    }
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            updateDashboardCharts();
            fecharModal('dashboardFiltersModal');
        });
    }
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                fecharModal('dashboardFiltersModal');
            }
        });
    }
}

function setupChartTypeSelection() {
    const chartCheckboxes = document.querySelectorAll('.chart-checkboxes input[type="checkbox"]');
    chartCheckboxes.forEach(input => {
        input.addEventListener('change', () => {
            updateChartVisibility();
            updateDashboardCharts();
        });
    });
    updateChartVisibility();
}

function updateChartVisibility() {
    document.querySelectorAll('.chart-card-box[data-chart]').forEach(card => {
        const chartType = card.getAttribute('data-chart');
        const checkbox = document.querySelector(`.chart-checkboxes input[value="${chartType}"]`);
        if (checkbox && checkbox.checked) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function getSelectedChartTypes() {
    return Array.from(document.querySelectorAll('.chart-checkboxes input[type="checkbox"]'))
        .filter(input => input.checked)
        .map(input => input.value);
}

function getCurrentFilterData() {
    const filter = document.getElementById('dashboardFilter')?.value || 'Todos';
    const period = document.getElementById('dashboardPeriod')?.value || '6meses';
    const labels = dashboardData.labels[period] || dashboardData.labels['6meses'];
    const dataset = dashboardData.datasets[filter] || dashboardData.datasets.Todos;
    return { filter, period, labels, dataset };
}

function updateDashboardCharts() {
    const { labels, dataset } = getCurrentFilterData();
    const selectedCharts = getSelectedChartTypes();

    if (selectedCharts.includes('line')) {
        updateChart('lineChart', 'line', labels, [{
            label: 'Inseminações',
            data: dataset.inseminacoes.slice(-labels.length),
            borderColor: '#00b34e',
            backgroundColor: 'rgba(0, 179, 78, 0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#0d8a4f'
        }], { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } });
    }

    if (selectedCharts.includes('bar')) {
        updateChart('barChart', 'bar', labels, [{
            label: 'Produção por Lote',
            data: dataset.producao.slice(-labels.length),
            backgroundColor: '#3b82f6',
            borderRadius: 12,
            maxBarThickness: 36
        }], { scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } });
    }

    if (selectedCharts.includes('doughnut')) {
        updateChart('doughnutChart', 'doughnut', ['Bovinos', 'Ovinos', 'Caprinos'], [{
            label: 'Distribuição',
            data: dataset.especies,
            backgroundColor: ['#00b34e', '#3b82f6', '#ff9900'],
            borderColor: '#ffffff',
            borderWidth: 2
        }], { cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10 } } } });
    }

    if (selectedCharts.includes('pie')) {
        updateChart('pieChart', 'pie', ['Bovinos', 'Ovinos', 'Caprinos'], [{
            label: 'Participação',
            data: dataset.especies,
            backgroundColor: ['#00b34e', '#3b82f6', '#ff9900']
        }], { plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 10 } } } });
    }

    if (selectedCharts.includes('radar')) {
        updateChart('radarChart', 'radar', labels, [{
            label: 'Índice de Saúde',
            data: dataset.saude.slice(-labels.length),
            borderColor: '#8a4fff',
            backgroundColor: 'rgba(138, 79, 255, 0.16)',
            pointBackgroundColor: '#8a4fff',
            pointBorderColor: '#fff'
        }], { scales: { r: { beginAtZero: true, max: 100 } }, plugins: { legend: { display: false } } });
    }

    if (selectedCharts.includes('polarArea')) {
        updateChart('polarChart', 'polarArea', ['Manejo', 'Saúde', 'Reprodução', 'Nutrição', 'Genética', 'Bem-estar'], [{
            label: 'Engajamento',
            data: dataset.manejo,
            backgroundColor: ['#0d8a4f', '#22c55e', '#14b8a6', '#3b82f6', '#f97316', '#a855f7']
        }], { plugins: { legend: { position: 'bottom' } } });
    }

    if (selectedCharts.includes('bubble')) {
        updateChart('bubbleChart', 'bubble', labels, [{
            label: 'Tamanho da Produção',
            data: labels.map((label, index) => ({ x: index + 1, y: dataset.producao.slice(-labels.length)[index] / 10 + 20, r: 6 + index })),
            backgroundColor: '#ff9900'
        }], { scales: { x: { title: { display: true, text: 'Período' } }, y: { beginAtZero: true, title: { display: true, text: 'Produção' } } }, plugins: { legend: { display: false } } });
    }

    if (selectedCharts.includes('scatter')) {
        updateChart('scatterChart', 'scatter', labels, [{
            label: 'Produtividade x Inseminações',
            data: labels.map((label, index) => ({ x: index + 1, y: dataset.inseminacoes.slice(-labels.length)[index] })),
            backgroundColor: '#3b82f6'
        }], { scales: { x: { type: 'linear', title: { display: true, text: 'Período' } }, y: { beginAtZero: true, title: { display: true, text: 'Inseminações' } } }, plugins: { legend: { display: false } } });
    }
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
