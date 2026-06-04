/**
 * Navbar Loader - Carrega o componente navbar.html dinamicamente
 * Este arquivo injeta o HTML da navbar em todas as páginas
 */

function loadNavbar() {
    // Verifica se o navbar já foi carregado
    if (document.getElementById('potygen-sidebar')) {
        window.navbarLoaded = true;
        // Aguarda um pouco e dispara o evento para quem se registrou depois
        setTimeout(() => {
            const event = new CustomEvent('navbarLoaded');
            document.dispatchEvent(event);
        }, 0);
        return;
    }

    // Cria um contenedor para a navbar
    const navContainer = document.createElement('div');
    navContainer.id = 'navbar-container';

    // Insere o contenedor no início do body
    document.body.insertAdjacentElement('afterbegin', navContainer);

    // Carrega o arquivo navbar.html
    fetch('../pages/navbar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao carregar navbar: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            // Injeta o HTML da navbar
            navContainer.innerHTML = html;

            // Aguarda um pouco para garantir que o DOM foi atualizado
            setTimeout(() => {
                window.navbarLoaded = true;
                console.log('✅ Navbar carregada e injetada');
                
                // Dispara evento customizado para indicar que a navbar foi carregada
                const event = new CustomEvent('navbarLoaded');
                document.dispatchEvent(event);
            }, 50);
        })
        .catch(error => {
            console.error('❌ Erro ao carregar navbar:', error);
        });
}

// Executa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
} else {
    loadNavbar();
}
