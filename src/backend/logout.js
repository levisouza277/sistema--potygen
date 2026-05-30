document.addEventListener(
    'DOMContentLoaded',
    () => {

        const logoutBtn =
            document.getElementById(
                'logoutBtn'
            );

        if (!logoutBtn) return;

        logoutBtn.addEventListener(
            'click',
            async () => {

                const confirmar =
                    confirm(
                        'Deseja sair da conta?'
                    );

                if (!confirmar) return;

                localStorage.removeItem('potygen_lembrar_me');

                sessionStorage.removeItem('sessao_temporaria');

                const { error } =
                    await supabaseClient.auth.signOut();

                if (error) {
                    console.error(error);
                }

                if (error) {

                    alert(
                        'Erro ao sair.'
                    );

                    return;
                }

                window.location.href =
                    '../pages/index.html';

            }
        );

    }
);