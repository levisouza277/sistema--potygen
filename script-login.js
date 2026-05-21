// 1. Mostrar/Esconder Senha
const eyeToggle = document.querySelector('.eye-toggle');
if (eyeToggle) {
    eyeToggle.addEventListener('click', function() {
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

// 2. Validação de Gmail
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        const email = document.getElementById('email').value.toLowerCase();
        const errorSpan = document.getElementById('emailError');

        if (!email.endsWith('@gmail.com')) {
            e.preventDefault();
            errorSpan.style.display = 'block';
        } else {
            errorSpan.style.display = 'none';
        }
    });
}