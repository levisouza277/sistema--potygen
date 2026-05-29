// Inicializa ícones Lucide
lucide.createIcons();

// Estado do tema global
let currentTheme = 'light';

// Estado das abas
let currentTab = 'info';

// Alterna o tema da página
function setTheme(theme) {
    currentTheme = theme;
    const htmlElement = document.documentElement;

    const btnLight = document.getElementById('btn-theme-light');
    const btnDark = document.getElementById('btn-theme-dark');

    const activeClass = "flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-emerald-500 text-sm font-semibold transition-all shadow-sm focus:outline-none";
    const inactiveClass = "flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750 text-sm font-semibold transition-all shadow-sm focus:outline-none";

    if (theme === 'dark') {
        htmlElement.classList.add('dark');
        btnDark.className = activeClass + " bg-emerald-500/10 text-emerald-400";
        btnLight.className = inactiveClass;
    } else {
        htmlElement.classList.remove('dark');
        btnLight.className = activeClass + " bg-emerald-50/50 text-emerald-600";
        btnDark.className = inactiveClass;
    }
}

// Alterna entre abas
function switchTab(tab) {
    currentTab = tab;

    const tabInfo     = document.getElementById('tab-info');
    const tabSecurity = document.getElementById('tab-security');
    const panelInfo   = document.getElementById('panel-info');
    const panelSecurity = document.getElementById('panel-security');

    const activeTab   = "flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all bg-white dark:bg-gray-750 text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200/40 dark:border-gray-700/50 focus:outline-none";
    const inactiveTab = "flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none";

    if (tab === 'info') {
        tabInfo.className     = activeTab;
        tabSecurity.className = inactiveTab;
        panelInfo.classList.remove('hidden');
        panelSecurity.classList.add('hidden');
    } else {
        tabSecurity.className = activeTab;
        tabInfo.className     = inactiveTab;
        panelSecurity.classList.remove('hidden');
        panelInfo.classList.add('hidden');
    }
}

// Envia formulário e exibe toast de confirmação
function handleFormSubmit(event, message = "Informações salvas com sucesso!") {
    event.preventDefault();

    const toast    = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');

    toastMsg.textContent = message;

    toast.classList.remove('translate-y-[-100px]', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-[-100px]', 'opacity-0');
    }, 3000);
}

// Inicialização
window.onload = function () {
    setTheme('light');
    switchTab('info');
};
