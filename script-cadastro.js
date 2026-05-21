// 1. Mostrar/Esconder Senha
document.querySelectorAll('.eye-toggle').forEach(eye => {
    eye.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input');
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.replace('fa-regular', 'fa-solid'); 
            this.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            this.classList.replace('fa-solid', 'fa-regular');
            this.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
});

// 2. Máscara Telefone
const inputTel = document.getElementById('telefone');
if (inputTel) {
    inputTel.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, "");
        v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
        v = v.replace(/(\d{5})(\d)/, "$1-$2");
        e.target.value = v;
    });
}

// 3. Máscara CPF
const inputCpf = document.getElementById('cpf');
if (inputCpf) {
    inputCpf.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, "");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d)/, "$1.$2");
        v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        e.target.value = v;
    });
}

// 4. Validação Geral
const cadastroForm = document.getElementById('cadastroForm');
if (cadastroForm) {
    cadastroForm.addEventListener('submit', function(e) {
        const email = document.getElementById('email').value.toLowerCase();
        const senha = document.getElementById('senha').value;
        const confirma = document.getElementById('confirmaSenha').value;
        let valid = true;

        if (!email.endsWith('@gmail.com')) {
            document.getElementById('emailError').style.display = 'block';
            valid = false;
        } else {
            document.getElementById('emailError').style.display = 'none';
        }

        if (senha !== confirma) {
            document.getElementById('senhaError').style.display = 'block';
            valid = false;
        } else {
            document.getElementById('senhaError').style.display = 'none';
        }

        if (!valid) e.preventDefault();
    });
}