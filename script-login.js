const eyeToggle = document.querySelector('.eye-toggle');
if (eyeToggle) {
    eyeToggle.addEventListener('click', function () {
        const senhaInput = document.getElementById('senha');
        if (senhaInput.type === 'password') {
            senhaInput.type = 'text';
            this.classList.replace('fa-regular', 'fa-solid');
            this.classList.replace('fa-eye', 'fa-eye-slash');

        } else {
            senhaInput.type = 'password';
            this.classList.replace('fa-solid', 'fa-regular');
            this.classList.replace('fa-eye-slash', 'fa-eye');
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
        if (!email.endsWith('@gmail.com')) {

            errorSpan.style.display = 'block';

            return;
        }

        errorSpan.style.display = 'none';
        botao.innerHTML = 'Entrando...'

        const { data, error } = await supabaseClient.auth.signInWithPassword({

            email: email,
            password: senha

        });
        if (error) {
            alert('Erro: ' + error.message);
            console.log(error);
            botao.innerHTML = 'Entrar';
            return;
        }
        console.log(data);

        alert('Login realizado com sucesso!');

        window.location.href = 'dashboard.html';

    });
}