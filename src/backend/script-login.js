const eyeToggle = document.querySelector('.eye-toggle');
if (eyeToggle) {
    eyeToggle.addEventListener('click', function () {
        const senhaInput = document.getElementById('senha');
        const icon = this.querySelector('i');
        
        if (senhaInput.type === 'password') {
            senhaInput.type = 'text';
            icon.classList.replace('fa-regular', 'fa-solid');
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            senhaInput.type = 'password';
            icon.classList.replace('fa-solid', 'fa-regular');
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value.toLowerCase();
        const senha = document.getElementById('senha').value;
        const errorSpan = document.getElementById('emailError');
        const botao = document.querySelector('.btn-submit');

        // Validação simples de e-mail @gmail.com
        if (!email.endsWith('@gmail.com')) {
            errorSpan.style.display = 'block';
            return;
        }

        errorSpan.style.display = 'none';
        const textoOriginal = botao.innerHTML;
        botao.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Entrando...';
        botao.disabled = true;

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: senha
            });

            if (error) {
                alert('Erro ao entrar: ' + error.message);
                botao.innerHTML = textoOriginal;
                botao.disabled = false;
                return;
            }

            console.log('Sucesso:', data);
            window.location.href = 'dashboard.html';
        } catch (err) {
            console.error('Erro inesperado:', err);
            botao.innerHTML = textoOriginal;
            botao.disabled = false;
        }
    });
}