// ==========================================
// VERIFICAÇÃO DE LOGIN E DADOS (SUPABASE)
// ==========================================
async function verificarLogin() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
        window.location.href = '../pages/index.html';
        return;
    }

    const usuario = data.session.user;
    
    // Atualiza nome exibido
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.innerHTML = usuario.email;
    }

    // Busca dados complementares na tabela 'usuarios'
    const { data: dadosUsuario, error: erroUsuario } = await supabaseClient
        .from('usuarios')
        .select('*')
        .eq('id', usuario.id)
        .single();

    if (!erroUsuario && dadosUsuario) {
        const userFarmElement = document.querySelector('.user-farm');
        if (userFarmElement) {
            userFarmElement.innerHTML = dadosUsuario.propriedade || 'Fazenda não informada';
        }
        if (userNameElement) {
            userNameElement.innerHTML = dadosUsuario.nome || usuario.email;
        }
    }
}

// Chamar verificação ao carregar
verificarLogin();

// ==========================================
// CONTROLE DE MENU MOBILE E UI
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('openMenu');
    const closeBtn = document.getElementById('closeMenu');

    // Abre menu
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }

    // Fecha menu
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    // Fechar ao clicar fora (Mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 850 && 
            sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !openBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Deseja sair da conta?')) {
                const { error } = await supabaseClient.auth.signOut();
                window.location.href = '../pages/index.html';
            }
        });
    }

    // Inicializa Gráficos
    renderizarGraficos();
});

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
function renderizarGraficos() {
    // Gráfico de Linha
    const ctxLine = document.getElementById('lineChart');
    if (ctxLine) {
        new Chart(ctxLine.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Inseminações',
                    data: [35, 42, 38, 55, 48, 62],
                    borderColor: '#00b34e',
                    backgroundColor: 'rgba(0, 179, 78, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    // Gráfico de Rosca
    const ctxPie = document.getElementById('pieChart');
    if (ctxPie) {
        new Chart(ctxPie.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Bovinos', 'Ovinos', 'Caprinos'],
                datasets: [{
                    data: [550, 220, 150],
                    backgroundColor: ['#00b34e', '#3b82f6', '#ff9900'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}