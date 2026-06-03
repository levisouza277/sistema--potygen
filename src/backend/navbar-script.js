/* ==========================================================================
   POTYGEN PRO - NAVBAR SCRIPT GLOBAL
   Arquivo: navbar-script.js
   
   Gerencia toda a lógica de interação da sidebar:
   - Botão hambúrguer visível em todas as telas
   - Abrir/Fechar menu ao clicar (mobile e desktop)
   - Fechar menu ao clicar fora (apenas mobile)
   - Em desktop: sidebar flutuante com overlay? Não! Sidebar empurra conteúdo
   ========================================================================== */

(function() {
    'use strict';
    
    function init() {
        const toggleBtn = document.getElementById('navToggleBtn');
        const sidebar = document.getElementById('potygen-sidebar');
        const overlay = document.getElementById('navOverlay');
        const mainContent = document.getElementById('mainContent');
        
        if (!toggleBtn || !sidebar) {
            console.warn('Elementos da navbar não encontrados, tentando novamente...');
            setTimeout(init, 100);
            return;
        }
        
        let navItems = document.querySelectorAll('.nav-item');
        const isDesktop = () => window.innerWidth > 1024;
        
        // =====================================================================
        // FUNÇÕES PRINCIPAIS
        // =====================================================================
        
        function openSidebar() {
            if (!sidebar) return;
            
            sidebar.classList.add('nav-open');
            
            // Overlay apenas em mobile
            if (overlay && !isDesktop()) {
                overlay.classList.add('visible');
            }
            
            // Em desktop, ajusta padding do conteúdo
            if (mainContent && isDesktop()) {
                mainContent.classList.add('nav-sidebar-open');
            }
        }
        
        function closeSidebar() {
            if (!sidebar) return;
            
            sidebar.classList.remove('nav-open');
            
            if (overlay) {
                overlay.classList.remove('visible');
            }
            
            if (mainContent) {
                mainContent.classList.remove('nav-sidebar-open');
            }
        }
        
        function toggleSidebar() {
            if (!sidebar) return;
            
            if (sidebar.classList.contains('nav-open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        }
        
        // Estado inicial: sidebar FECHADA em todas as telas
        function setInitialState() {
            closeSidebar();
        }
        
        // =====================================================================
        // EVENT LISTENERS
        // =====================================================================
        
        // Botão hambúrguer
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        });
        
        // Overlay (apenas mobile)
        if (overlay) {
            overlay.addEventListener('click', function() {
                if (!isDesktop()) {
                    closeSidebar();
                }
            });
        }
        
        // Fecha sidebar ao clicar em link (apenas mobile)
        function setupNavItemListeners() {
            navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.removeEventListener('click', handleNavItemClick);
                item.addEventListener('click', handleNavItemClick);
            });
        }
        
        function handleNavItemClick() {
            if (!isDesktop()) {
                setTimeout(() => closeSidebar(), 150);
            }
        }
        
        // Fechar ao clicar fora (apenas mobile)
        document.addEventListener('click', function(e) {
            if (!isDesktop() && 
                sidebar && sidebar.classList.contains('nav-open') && 
                !sidebar.contains(e.target) && 
                toggleBtn && !toggleBtn.contains(e.target) &&
                overlay && !overlay.contains(e.target)) {
                closeSidebar();
            }
        });
        
        // =====================================================================
        // ITEM ATIVO
        // =====================================================================
        
        function setActiveNavItem() {
            const items = document.querySelectorAll('.nav-item');
            if (items.length === 0) return;
            
            let currentPage = window.location.pathname.split('/').pop();
            if (!currentPage || currentPage === '') currentPage = '../pages/dashboard.html';
            
            items.forEach(item => {
                item.classList.remove('active');
                const href = item.getAttribute('href');
                
                if (href) {
                    const cleanHref = href.split('/').pop();
                    if (currentPage === cleanHref) {
                        item.classList.add('active');
                    } else if (currentPage === '../pages/index.html' && cleanHref === '../pages/dashboard.html') {
                        item.classList.add('active');
                    }
                }
            });
        }

        function addChatbotButton() {
            if (document.getElementById('potygenChatbotButton')) return;

            const chatbotButton = document.createElement('button');
            chatbotButton.id = 'potygenChatbotButton';
            chatbotButton.type = 'button';
            chatbotButton.className = 'potygen-chatbot-button';
            chatbotButton.title = 'Abrir chatbot PotyGen';
            chatbotButton.setAttribute('aria-label', 'Abrir chatbot PotyGen');
            chatbotButton.innerHTML = '<i class="fa-solid fa-leaf"></i>';
            chatbotButton.addEventListener('click', function() {
                openChatbotPopup();
            });

            document.body.appendChild(chatbotButton);
            createChatbotPopup();
        }

        function createChatbotPopup() {
            if (document.getElementById('potygenChatbotOverlay')) return;

            const overlay = document.createElement('div');
            overlay.id = 'potygenChatbotOverlay';
            overlay.className = 'potygen-chatbot-overlay';

            const modal = document.createElement('div');
            modal.className = 'potygen-chatbot-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', 'Chatbot PotyGen');

            const closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.className = 'potygen-chatbot-close';
            closeButton.title = 'Fechar chatbot';
            closeButton.setAttribute('aria-label', 'Fechar chatbot');
            closeButton.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            closeButton.addEventListener('click', closeChatbotPopup);

            const iframe = document.createElement('iframe');
            iframe.className = 'potygen-chatbot-iframe';
            iframe.src = 'chatbot.html';
            iframe.title = 'Chatbot PotyGen';
            iframe.loading = 'lazy';

            modal.appendChild(closeButton);
            modal.appendChild(iframe);
            overlay.appendChild(modal);

            overlay.addEventListener('click', function(event) {
                if (event.target === overlay) {
                    closeChatbotPopup();
                }
            });

            document.body.appendChild(overlay);
        }

        function openChatbotPopup() {
            const overlay = document.getElementById('potygenChatbotOverlay');
            if (!overlay) return;
            overlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }

        function closeChatbotPopup() {
            const overlay = document.getElementById('potygenChatbotOverlay');
            if (!overlay) return;
            overlay.classList.remove('visible');
            document.body.style.overflow = '';
        }
        
        // =====================================================================
        // REDIMENSIONAMENTO
        // =====================================================================
        
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                if (isDesktop()) {
                    // Em desktop, se sidebar estava aberta, mantém padding
                    if (sidebar && sidebar.classList.contains('nav-open') && mainContent) {
                        mainContent.classList.add('nav-sidebar-open');
                    } else if (mainContent) {
                        mainContent.classList.remove('nav-sidebar-open');
                    }
                    if (overlay) overlay.classList.remove('visible');
                } else {
                    // Em mobile, remove padding
                    if (mainContent) mainContent.classList.remove('nav-sidebar-open');
                }
                setActiveNavItem();
            }, 150);
        });
        
        // =====================================================================
        // ACESSIBILIDADE
        // =====================================================================
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar && sidebar.classList.contains('nav-open')) {
                if (!isDesktop()) {
                    closeSidebar();
                }
            }
        });
        
        // =====================================================================
        // INICIALIZAÇÃO
        // =====================================================================
        
        setInitialState();
        setActiveNavItem();
        setupNavItemListeners();
        addChatbotButton();
        
        window.potygenNavbar = {
            open: openSidebar,
            close: closeSidebar,
            toggle: toggleSidebar,
            refresh: function() {
                setActiveNavItem();
            }
        };
        
        console.log('✅ Potygen Navbar Carregada - Botão visível em todas as telas');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();