const cadastroForm = document.getElementById('cadastroForm');
if (cadastroForm) {
    cadastroForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.toLowerCase();
        const senha = document.getElementById('senha').value;
        const confirma = document.getElementById('confirmaSenha').value;
        const nome = document.getElementById('nome').value;
        const telefone = document.getElementById('telefone').value;
        const cpf = document.getElementById('cpf').value;
        const propriedade = document.getElementById('propriedade').value;
        const cidade = document.getElementById('cidade').value;
        const estado = document.getElementById('estado').value;
        const botao = document.querySelector('.btn-submit');
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

        if (!valid) return;

        botao.innerHTML = 'Criando conta...';

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: senha
        });

        if (error) {
            alert('Erro: ' + error.message);
            console.log(error);
            botao.innerHTML = 'Criar Minha Conta';
            return;
        }

        const usuario = data.user;

        const { error: erroBanco } = await supabaseClient
            .from('usuarios')
            .insert({
                id: usuario.id,
                nome: nome,
                email: email,
                telefone: telefone,
                cpf: cpf,
                propriedade: propriedade,
                cidade: cidade,
                estado: estado,
                tipo_usuario: 'produtor'
            });
        if (erroBanco) {
            alert('Erro ao salvar usuário.');
            console.log(erroBanco);
            botao.innerHTML = 'Criar Minha Conta';
            return;
        }

        alert('Conta criada com sucesso!');
        console.log(usuario);
        window.location.href = '../../index.html';

    });
}
