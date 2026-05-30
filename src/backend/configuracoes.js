// ============================================
// Funções para Configurações
// ============================================

// Alternar entre abas
function switchTab(tabName) {
    const panelInfo = document.getElementById('panel-info');
    const panelSecurity = document.getElementById('panel-security');
    const tabInfo = document.getElementById('tab-info');
    const tabSecurity = document.getElementById('tab-security');
    
    // Classes para botão ativo e inativo
    const activeClasses = ['border-emerald-600', 'text-emerald-600', 'bg-emerald-50', 'dark:bg-emerald-900/30'];
    const inactiveClasses = ['border-gray-200', 'text-gray-700', 'bg-white', 'dark:border-gray-700', 'dark:text-gray-300'];
    
    if (tabName === 'info') {
        // Mostrar painel de informações
        panelInfo.classList.remove('hidden');
        panelSecurity.classList.add('hidden');
        
        // Ativar botão de informações
        tabInfo.classList.remove(...inactiveClasses);
        tabInfo.classList.add(...activeClasses);
        
        // Desativar botão de segurança
        tabSecurity.classList.remove(...activeClasses);
        tabSecurity.classList.add(...inactiveClasses);
    } else if (tabName === 'security') {
        // Mostrar painel de segurança
        panelInfo.classList.add('hidden');
        panelSecurity.classList.remove('hidden');
        
        // Ativar botão de segurança
        tabSecurity.classList.remove(...inactiveClasses);
        tabSecurity.classList.add(...activeClasses);
        
        // Desativar botão de informações
        tabInfo.classList.remove(...activeClasses);
        tabInfo.classList.add(...inactiveClasses);
    }
}

// Alterar tema
function setTheme(theme) {
    const html = document.documentElement;
    const btnLight = document.getElementById('btn-theme-light');
    const btnDark = document.getElementById('btn-theme-dark');
    
    if (theme === 'light') {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        
        btnLight.classList.add('border-emerald-600', 'text-emerald-600', 'bg-emerald-50');
        btnLight.classList.remove('border-gray-200', 'text-gray-700', 'bg-white');
        
        btnDark.classList.remove('border-emerald-600', 'text-emerald-600', 'bg-emerald-50');
        btnDark.classList.add('border-gray-200', 'text-gray-700', 'bg-white');
    } else if (theme === 'dark') {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        
        btnDark.classList.add('border-emerald-600', 'text-emerald-600', 'bg-emerald-50', 'dark:bg-emerald-900/30', 'dark:text-emerald-400');
        btnDark.classList.remove('border-gray-200', 'text-gray-700', 'bg-white', 'dark:border-gray-700', 'dark:text-gray-300');
        
        btnLight.classList.remove('border-emerald-600', 'text-emerald-600', 'bg-emerald-50', 'dark:bg-emerald-900/30', 'dark:text-emerald-400');
        btnLight.classList.add('border-gray-200', 'text-gray-700', 'bg-white', 'dark:border-gray-700', 'dark:text-gray-300');
    }
}

// Enviar formulário
function handleFormSubmit(event, customMessage) {
    event.preventDefault();
    
    // Mostrar toast de sucesso
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = customMessage || 'Alterações salvas com sucesso!';
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    
    // Ocultar toast após 3 segundos
    setTimeout(() => {
        toast.style.transform = 'translateY(-100px)';
        toast.style.opacity = '0';
    }, 3000);
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    // Renderizar ícones Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Restaurar tema salvo
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }
    
    // Configurar botões de tema
    const btnLight = document.getElementById('btn-theme-light');
    const btnDark = document.getElementById('btn-theme-dark');
    
    if (savedTheme === 'light') {
        btnLight.classList.add('border-emerald-600', 'text-emerald-600', 'bg-emerald-50');
        btnLight.classList.remove('border-gray-200', 'text-gray-700', 'bg-white');
        btnDark.classList.add('border-gray-200', 'text-gray-700', 'bg-white');
        btnDark.classList.remove('border-emerald-600', 'text-emerald-600', 'bg-emerald-50');
    } else {
        btnDark.classList.add('border-emerald-600', 'text-emerald-600', 'bg-emerald-50', 'dark:bg-emerald-900/30', 'dark:text-emerald-400');
        btnDark.classList.remove('border-gray-200', 'text-gray-700', 'bg-white');
        btnLight.classList.add('border-gray-200', 'text-gray-700', 'bg-white', 'dark:border-gray-700', 'dark:text-gray-300');
        btnLight.classList.remove('border-emerald-600', 'text-emerald-600', 'bg-emerald-50');
    }
    
    // Ativar aba padrão (informações)
    switchTab('info');
});
