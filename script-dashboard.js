async function verificarLogin() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
        window.location.href = 'index.html';
        return;
    }

    const usuario = data.session.user;
    console.log(usuario);
    const userName = document.querySelector('.user-name');

    if (userName) {
        userName.innerHTML = usuario.email;
    }

    const { data: dadosUsuario, error: erroUsuario } = await supabaseClient
        .from('usuarios')
        .select('*')
        .eq('id', usuario.id)
        .single();

    if (!erroUsuario && dadosUsuario) {
        const userFarm = document.querySelector('.user-farm');

        if (userFarm) {
            userFarm.innerHTML = dadosUsuario.propriedade || 'Fazenda não informada';
        }
        if (userName) {
            userName.innerHTML = dadosUsuario.nome;
        }
    }
}

verificarLogin();

document.addEventListener('DOMContentLoaded', () => {

    const logoutBtn = document.getElementById('logoutBtn');

    if (!logoutBtn) {
        console.log('Botão logout não encontrado');
        return;
    }

    logoutBtn.addEventListener('click', async () => {
        const confirmar = confirm('Deseja sair da conta?');

        if (!confirmar) return;
        console.log('Tentando deslogar...');
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            console.error(error);
            alert(error.message);
            return;
        }

        console.log('Logout realizado');

        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
});

function abrirModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function fecharModal(id) {
    const modal = document.getElementById(id);

    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal-backdrop')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#a3aed0';

    // ==========================================
    // GRÁFICO LINHA
    // ==========================================

    const ctxLine = document.getElementById('lineChart').getContext('2d');

    new Chart(ctxLine, {

        type: 'line',

        data: {

            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],

            datasets: [

                {

                    label: 'Inseminações',

                    data: [35, 48, 38, 55, 42, 60],

                    borderColor: '#3b82f6',

                    borderWidth: 3,

                    pointRadius: 4,

                    pointBackgroundColor: '#3b82f6',

                    tension: 0.4,

                    fill: true,

                    backgroundColor: (context) => {

                        const chart = context.chart;

                        const {ctx, chartArea} = chart;

                        if (!chartArea) return null;

                        const gradient = ctx.createLinearGradient(

                            0,
                            chartArea.top,
                            0,
                            chartArea.bottom
                        );

                        gradient.addColorStop(
                            0,
                            'rgba(59, 130, 246, 0.2)'
                        );

                        gradient.addColorStop(
                            1,
                            'rgba(59, 130, 246, 0)'
                        );

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
                }
            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    position: 'top',

                    align: 'end',

                    labels: {

                        usePointStyle: true,

                        padding: 20,

                        font: {

                            size: 12,

                            weight: '600'
                        }
                    }
                }
            },

            scales: {

                y: {

                    beginAtZero: true,

                    grid: {

                        borderDash: [5, 5],

                        color: '#e9edf7'
                    },

                    border: {

                        display: false
                    }
                },

                x: {

                    grid: {

                        display: false
                    },

                    border: {

                        display: false
                    }
                }
            }
        }
    });

    // ==========================================
    // GRÁFICO PIZZA
    // ==========================================

    const ctxPie = document.getElementById('pieChart').getContext('2d');

    new Chart(ctxPie, {

        type: 'doughnut',

        data: {

            labels: ['Bovinos', 'Ovinos', 'Caprinos'],

            datasets: [

                {

                    data: [550, 220, 150],

                    backgroundColor: [

                        '#00b34e',

                        '#3b82f6',

                        '#ff9900'
                    ],

                    hoverOffset: 10,

                    borderWidth: 0
                }
            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: '75%',

            plugins: {

                legend: {

                    position: 'bottom',

                    labels: {

                        usePointStyle: true,

                        padding: 20,

                        font: {

                            size: 12,

                            weight: '600'
                        }
                    }
                }
            }
        }
    });
});