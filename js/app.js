// Inicializador e Roteador Principal da SPA (Escopo Global)

// Inicializar banco de dados local
window.initDb();
window.rodarTestes();

document.addEventListener('DOMContentLoaded', async () => {
    // === VERIFICAÇÃO DE AUTENTICAÇÃO ===
    // Se o Supabase estiver configurado, verificar sessão antes de mostrar o painel.
    if (window.isSupabaseConfigured && window.isSupabaseConfigured()) {
        try {
            const session = await window.checkAuth();
            if (!session) {
                // Sem sessão: redireciona para a tela de login
                window.location.replace('login.html');
                return; // Para a execução do restante do script
            }
        } catch (e) {
            console.warn("Erro ao verificar auth:", e);
        }
    }

    // === CARREGAR USUÁRIO LOGADO NA SIDEBAR ===
    try {
        const usuario = await window.getLoggedUser();
        if (usuario) {
            const inicial = usuario.nome ? usuario.nome.charAt(0).toUpperCase() : 'G';
            const primeiroNome = usuario.nome ? usuario.nome.split(' ')[0] : 'Gestor';
            // Atualiza sidebar footer
            const sidebarAvatars = document.querySelectorAll('.user-avatar');
            sidebarAvatars.forEach(a => { a.textContent = inicial; });
            const sidebarNames = document.querySelectorAll('.sidebar .user-name, .sidebar-footer span[style*="font-size: 12px"]');
            sidebarNames.forEach(n => { if (n.textContent.includes('Yan') || n.textContent.includes('Admin')) n.textContent = usuario.nome; });
            // Atualiza header
            const headerName = document.querySelector('.header-right .user-name');
            if (headerName) headerName.textContent = primeiroNome;
            const headerRole = document.querySelector('.header-right .user-role');
            if (headerRole) headerRole.textContent = usuario.gestor ? 'Gestor' : 'Operador';
            const headerAvatars = document.querySelectorAll('.header-right .user-avatar');
            headerAvatars.forEach(a => { a.textContent = inicial; });
            // Guarda o nome para o dashboard usar
            window.__loggedUserName = primeiroNome;
            window.__loggedUserFull = usuario.nome;
        }
    } catch (e) {
        console.warn("Não foi possível carregar o usuário logado:", e);
    }


    const sidebar = document.getElementById('sidebar');
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    
    btnToggleSidebar.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const icon = btnToggleSidebar.querySelector('i, svg');
        if (icon) {
            if (sidebar.classList.contains('collapsed')) {
                icon.setAttribute('data-lucide', 'chevron-right');
            } else {
                icon.setAttribute('data-lucide', 'chevron-left');
            }
            lucide.createIcons();
        }
    });

    const btnMobileMenu = document.getElementById('btn-mobile-menu');
    btnMobileMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });

    const mainContent = document.getElementById('main-content');
    const pageTitle = document.getElementById('page-current-title');
    const navItems = document.querySelectorAll('.nav-item');

    async function navigateToView() {
        const hash = window.location.hash || '#dashboard';
        const view = hash.replace('#', '');
        
        window.closeAllDrawers();

        // Sincroniza dados com o Supabase antes de renderizar a view
        await window.syncLocalWithSupabase();

        navItems.forEach(item => {
            if (item.getAttribute('data-view') === view) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        sidebar.classList.remove('active');

        const subtitleEl = document.getElementById('page-current-subtitle');
        const customizeBtn = document.getElementById('btn-header-customize');
        
        // Reset padrão para outras telas
        subtitleEl.textContent = "";
        customizeBtn.style.display = "none";

        switch (view) {
            case 'dashboard':
                // Saudação dinâmica baseada na hora do dia
                const horaAtual = new Date().getHours();
                let saudacao = "Bom dia";
                if (horaAtual >= 12 && horaAtual < 18) {
                    saudacao = "Boa tarde";
                } else if (horaAtual >= 18 || horaAtual < 5) {
                    saudacao = "Boa noite";
                }
                const nomeUsuario = window.__loggedUserName || "Gestor";
                pageTitle.textContent = `${saudacao}, ${nomeUsuario}`;

                // Data de hoje formatada em pt-BR (ex: "Sexta-Feira, 24 de Julho de 2026")
                const hoje = new Date();
                const diasSemana = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];
                const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                
                const diaSemana = diasSemana[hoje.getDay()];
                const dia = hoje.getDate();
                const mes = meses[hoje.getMonth()];
                const ano = hoje.getFullYear();
                
                subtitleEl.textContent = `${diaSemana}, ${dia} de ${mes} de ${ano}`;
                customizeBtn.style.display = "flex";
                window.renderDashboard(mainContent);
                break;
            case 'checklists':
                pageTitle.textContent = "Checklists";
                window.renderChecklists(mainContent);
                break;
            case 'notifications':
                pageTitle.textContent = "Notificações";
                window.renderNotifications(mainContent);
                break;
            case 'settings':
                pageTitle.textContent = "Configurações";
                window.renderSettings(mainContent);
                break;
            case 'courses':
                pageTitle.textContent = "Cursos";
                window.renderCourses(mainContent);
                break;
            case 'help':
                pageTitle.textContent = "Central de Ajuda";
                window.renderHelp(mainContent);
                break;
            case 'ideas':
                pageTitle.textContent = "Ideias";
                window.renderIdeas(mainContent);
                break;
            case 'updates':
                pageTitle.textContent = "Atualizações";
                window.renderUpdates(mainContent);
                break;
            case 'mobile-app':
                pageTitle.textContent = "Checkrest 360 - Simulador Mobile";
                window.renderMobileApp(mainContent);
                break;
            case 'logout':
                if (confirm("Deseja realmente sair do sistema?")) {
                    try {
                        await window.logoutUser();
                    } catch (e) {
                        console.warn("Erro no logout:", e);
                    }
                    window.location.replace('login.html');
                } else {
                    window.location.hash = '#dashboard';
                }
                break;
            default:
                if (view.startsWith('checklist-editor')) {
                    pageTitle.textContent = "Editor de Checklist";
                    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
                    const checklistId = params.get('id');
                    window.renderChecklistEditor(mainContent, checklistId);
                } else {
                    pageTitle.textContent = "Página Não Encontrada";
                    mainContent.innerHTML = `<div class="card"><h2>Erro 404</h2><p>A página que você está procurando não existe.</p></div>`;
                }
        }
        
        lucide.createIcons();
    }

    window.addEventListener('hashchange', navigateToView);
    
    // === EVENTO DE CLIQUE NOS PERFIS DO MENU ===
    const irParaPerfil = () => {
        if (typeof activeTab !== 'undefined') {
            activeTab = 'users';
        }
        window.location.hash = '#settings';
    };

    const headerUserProfile = document.getElementById('header-user-profile');
    if (headerUserProfile) {
        headerUserProfile.addEventListener('click', irParaPerfil);
    }

    const sidebarUserProfile = document.getElementById('sidebar-user-profile');
    if (sidebarUserProfile) {
        sidebarUserProfile.addEventListener('click', irParaPerfil);
    }

    navigateToView();

    window.addEventListener('checkrest-db-updated', () => {
        navigateToView();
    });
});
