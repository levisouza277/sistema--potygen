document
.getElementById('btnSalvar')
.addEventListener('click', async () => {

    const novaSenha =
        document.getElementById('novaSenha').value;

    if (novaSenha.length < 6) {

        alert(
            'A senha precisa ter pelo menos 6 caracteres.'
        );

        return;
    }

    const { error } =
        await supabaseClient.auth.updateUser({

            password: novaSenha

        });

    if (error) {

        alert(
            'Erro: ' + error.message
        );

        return;
    }

    alert(
        'Senha alterada com sucesso!'
    );

    window.location.href =
        'index.html';

});