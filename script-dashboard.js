/**
 * POTYGEN - DASHBOARD CONTROLLER
 */

// FUNÇÕES DE CONTROLE DE MODAL
function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Trava o scroll do fundo
    }
}

function fecharModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Destrava o scroll
    }
}

// FECHAR MODAL AO CLICAR FORA DA CAIXA BRANCA
window.onclick = function(event) {
    if (event.target.classList.contains('modal-backdrop')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// INICIALIZAÇÃO DOS GRÁFICOS QUANDO O DOM CARREGAR
document.addEventListener('DOMContentLoaded', () => {
    
    // CONFIGURAÇÃO GLOBAL DO CHART.JS
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#a3aed0';

    // 1. GRÁFICO DE LINHA (HISTÓRICO)
    const ctxLine = document.getElementById('lineChart').getContext('2d');
    new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Inseminações',
                data: [35, 48, 38, 55, 42, 60],
                borderColor: '#3b82f6',
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
                tension: 0.4, // Curva suave
                fill: true,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return null;
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                    return gradient;
                }
            },
            {
                label: 'Prenhez',
                data: [28, 40, 32, 48, 35, 52],
                borderColor: '#00b34e',
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#00b34e',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', align: 'end', labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: '600' } } }
            },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [5, 5], color: '#e9edf7' }, border: { display: false } },
                x: { grid: { display: false }, border: { display: false } }
            }
        }
    });

    // 2. GRÁFICO DE PIZZA (ESPÉCIES)
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Bovinos', 'Ovinos', 'Caprinos'],
            datasets: [{
                data: [550, 220, 150],
                backgroundColor: ['#00b34e', '#3b82f6', '#ff9900'],
                hoverOffset: 10,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%', // Efeito de rosca fina igual à imagem
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: '600' } } }
            }
        }
    });
});