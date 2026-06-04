/**
 * POTYGEN PRO - NAVBAR SCRIPT GLOBAL (V2 - Simplificado)
 * Gerencia toda a lógica de interação da sidebar
 */

function initNavbar() {
    console.log('🔄 Iniciando navbar...');
    
    const toggleBtn = document.getElementById('navToggleBtn');
    const sidebar = document.getElementById('potygen-sidebar');
    const overlay = document.getElementById('navOverlay');
    const mainContent = document.getElementById('mainContent');
    
    // Validação básica
    if (!toggleBtn || !sidebar) {
        console.warn('⚠️ Elementos da navbar não encontrados');
        return false;
    }
    
    console.log('✅ Navbar inicializada com sucesso!');
    
    const isDesktop = () => window.innerWidth > 1024;
    
    // Funções principais
    function openSidebar() {
        sidebar.classList.add('nav-open');
        if (overlay && !isDesktop()) {
            overlay.classList.add('visible');
        }
        if (mainContent && isDesktop()) {
            mainContent.classList.add('nav-sidebar-open');
        }
    }
    
    function closeSidebar() {
        sidebar.classList.remove('nav-open');
        if (overlay) overlay.classList.remove('visible');
        if (mainContent) mainContent.classList.remove('nav-sidebar-open');
    }
    
    function toggleSidebar() {
        if (sidebar.classList.contains('nav-open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
    
    // Inicializa fechado
    closeSidebar();
    
    // Event Listeners
    try {
        // Botão toggle
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        });
        
        // Overlay (mobile)
        if (overlay) {
            overlay.addEventListener('click', function() {
                if (!isDesktop()) {
                    closeSidebar();
                }
            });
        }
        
        // Nav items - fecha ao clicar (mobile)
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                if (!isDesktop()) {
                    setTimeout(closeSidebar, 150);
                }
            });
        });
        
        // Fecha ao clicar fora (mobile)
        document.addEventListener('click', function(e) {
            if (!isDesktop() && 
                sidebar.classList.contains('nav-open') && 
                !sidebar.contains(e.target) && 
                !toggleBtn.contains(e.target)) {
                closeSidebar();
            }
        });
        
        // Marca como inicializado
        window.potygenNavbarReady = true;
        console.log('✅ Todos os event listeners configurados');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao configurar event listeners:', error);
        return false;
    }
}

// Executa assim que os elementos estão disponíveis
if (window.navbarLoaded) {
    console.log('📱 Navbar já estava carregada, inicializando agora');
    initNavbar();
} else {
    console.log('⏳ Aguardando navbar ser carregada...');
    document.addEventListener('navbarLoaded', initNavbar);
}

// Fallback final - tenta inicializar após DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    if (!window.potygenNavbarReady && document.getElementById('potygen-sidebar')) {
        console.log('ℹ️ Inicializando navbar no DOMContentLoaded');
        initNavbar();
    }
});
