// Módulo de Telas Extras (Notificações, Cursos, Ajuda, Ideias e Atualizações - Design Premium)

// 1. Renderiza a tela de Notificações (Inbox)
function renderNotifications(container) {
    container.innerHTML = `
        <div class="extras-container animate-fade-in" style="display:flex; flex-direction:column; gap:20px;">
            <div class="card" style="padding: 24px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:15px">
                    <h3 style="font-weight:700; color:var(--text-main); font-size:18px; margin:0">Mensagens e Alertas</h3>
                    <button class="btn btn-secondary" style="font-size:12px; padding:6px 12px;" onclick="window.clearNotifications()">Marcar todas como lidas</button>
                </div>
                
                <div class="notifications-list" style="display:flex; flex-direction:column; gap:12px;" id="notifications-list-container">
                    <!-- Gerado dinamicamente -->
                </div>
            </div>
        </div>
    `;
    
    renderNotificationsList();
}

function renderNotificationsList() {
    const listContainer = document.getElementById('notifications-list-container');
    if (!listContainer) return;

    const notificacoes = [
        { id: 1, titulo: "Checklist Atrasado - Cozinha", desc: "O checklist 'Fechamento de Caixa' da unidade Restaurante Matriz PA está atrasado há 20 minutos.", tempo: "Há 10 min", lido: false, tipo: "danger", icon: "alert-triangle" },
        { id: 2, titulo: "Não Conformidade Detectada", desc: "O operador Brian Nascimento registrou um item crítico inconforme no checklist de Abertura.", tempo: "Há 1 hora", lido: false, tipo: "warning", icon: "alert-circle" },
        { id: 3, titulo: "Unidade Modelo Segurança updated", desc: "Yan Fernandes editou as restrições da unidade Modelo Segurança.", tempo: "Há 1 dia", lido: true, tipo: "info", icon: "info" },
        { id: 4, titulo: "Backup concluído", desc: "O backup automático do banco de dados simulado foi realizado com sucesso.", tempo: "Há 2 dias", lido: true, tipo: "success", icon: "check-circle" }
    ];

    listContainer.innerHTML = notificacoes.map(n => `
        <div class="notification-item ${n.lido ? 'lido' : 'nao-lido'}" style="display:flex; gap:16px; padding:16px; border-radius:var(--radius-md); background:${n.lido ? 'var(--bg-card)' : 'rgba(46, 230, 168, 0.05)'}; border:1px solid ${n.lido ? 'var(--border-color)' : 'rgba(46, 230, 168, 0.2)'}; transition:all 0.2s ease; cursor:pointer">
            <div class="noti-icon" style="width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:${n.tipo === 'danger' ? '#fef2f2' : n.tipo === 'warning' ? '#fffbeb' : n.tipo === 'info' ? '#eff6ff' : '#ecfdf5'}; color:${n.tipo === 'danger' ? '#ef4444' : n.tipo === 'warning' ? '#f59e0b' : n.tipo === 'info' ? '#3b82f6' : '#10b981'}">
                <i data-lucide="${n.icon}" style="width:20px; height:20px"></i>
            </div>
            <div style="flex:1; display:flex; flex-direction:column; gap:4px">
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <span style="font-size:14px; font-weight:700; color:var(--text-main)">${n.titulo}</span>
                    <span style="font-size:11px; color:var(--text-muted)">${n.tempo}</span>
                </div>
                <p style="font-size:13px; color:var(--text-muted); margin:0; line-height:1.4">${n.desc}</p>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

window.clearNotifications = () => {
    alert("Notificações marcadas como lidas!");
};

// 2. Renderiza a tela de Cursos (Capacitação)
function renderCourses(container) {
    const cursos = [
        { id: 1, titulo: "Manual de Abertura de Loja", desc: "Aprenda o passo a passo para iniciar o dia de forma padronizada.", duracao: "15 min", progresso: 80, cover: "📚" },
        { id: 2, titulo: "Segurança de Alimentos e Anvisa", desc: "Regras críticas sobre temperaturas, etiquetagem e validades.", duracao: "35 min", progresso: 40, cover: "🥗" },
        { id: 3, titulo: "Dominando o Checkrest 360", desc: "Treinamento básico para operadores de caixa e cozinha.", duracao: "10 min", progresso: 100, cover: "📱" },
        { id: 4, titulo: "Análise de Indicadores para Gestores", desc: "Como usar pontualidade, esforço e qualidade para tomar decisões.", duracao: "45 min", progresso: 0, cover: "📊" }
    ];

    container.innerHTML = `
        <div class="extras-container animate-fade-in" style="display:flex; flex-direction:column; gap:24px;">
            <div style="display:flex; flex-direction:column; gap:4px">
                <span class="text-muted" style="font-size:13px; font-weight:500;">CAPACITAÇÃO OPERACIONAL</span>
                <h2 style="font-size:22px; font-weight:800; color:var(--text-main); margin:0">Cursos e Treinamentos</h2>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px">
                ${cursos.map(c => `
                    <div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; height:100%; transition:transform 0.2s ease, box-shadow 0.2s ease;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow-lg)';" onmouseout="this.style.transform='none'; this.style.boxShadow='var(--shadow-sm)';">
                        <div style="padding:30px 24px; background:linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); font-size:48px; display:flex; align-items:center; justify-content:center; border-bottom:1px solid var(--border-color)">
                            ${c.cover}
                        </div>
                        <div style="padding:20px; display:flex; flex-direction:column; gap:12px; flex:1">
                            <span style="font-size:11px; font-weight:700; color:var(--color-primary-hover); text-transform:uppercase">${c.duracao} de duração</span>
                            <h3 style="font-size:16px; font-weight:700; color:var(--text-main); margin:0; line-height:1.3">${c.titulo}</h3>
                            <p style="font-size:12px; color:var(--text-muted); margin:0; line-height:1.4; flex:1">${c.desc}</p>
                            
                            <!-- Barra de Progresso -->
                            <div style="margin-top:10px">
                                <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:600; color:var(--text-muted); margin-bottom:4px">
                                    <span>Progresso</span>
                                    <span>${c.progresso}%</span>
                                </div>
                                <div style="height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden">
                                    <div style="width:${c.progresso}%; height:100%; background:${c.progresso === 100 ? '#10b981' : 'var(--color-primary)'}; border-radius:3px"></div>
                                </div>
                            </div>
                        </div>
                        <div style="padding:16px 20px; border-top:1px solid var(--border-color); background:#fafafa; display:flex; justify-content:flex-end">
                            <button class="btn ${c.progresso === 100 ? 'btn-secondary' : 'btn-primary'}" style="padding:6px 12px; font-size:12px" onclick="alert('Iniciando curso: ${c.titulo}')">
                                ${c.progresso === 100 ? 'Rever Aulas' : c.progresso > 0 ? 'Continuar' : 'Começar'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 3. Renderiza a Central de Ajuda
function renderHelp(container) {
    container.innerHTML = `
        <div class="extras-container animate-fade-in" style="display:flex; flex-direction:column; gap:24px;">
            <div class="card" style="padding:30px; display:flex; flex-direction:column; align-items:center; text-align:center; background:linear-gradient(135deg, var(--color-primary-hover) 0%, #0f766e 100%); color:white;">
                <h2 style="font-size:24px; font-weight:800; margin:0 0 8px 0">Como podemos ajudar?</h2>
                <p style="font-size:14px; opacity:0.9; max-width:500px; margin:0 0 20px 0; line-height:1.4">Pesquise por tutoriais, dúvidas frequentes ou abra um ticket de suporte técnico.</p>
                <div style="display:flex; width:100%; max-width:480px; position:relative">
                    <input type="text" placeholder="Digite sua dúvida (ex: Cadastrar operador)..." style="width:100%; padding:12px 16px 12px 46px; border-radius:var(--radius-md); border:none; color:var(--text-main); font-weight:500; font-size:14px; box-shadow:var(--shadow-md)">
                    <i data-lucide="search" style="position:absolute; left:16px; top:13px; color:#64748b; width:18px"></i>
                </div>
            </div>

            <div class="card" style="padding:24px">
                <h3 style="font-size:16px; font-weight:700; color:var(--text-main); margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:10px">Perguntas Frequentes (FAQ)</h3>
                
                <div style="display:flex; flex-direction:column; gap:12px" class="faq-container">
                    <details style="padding:16px; border:1px solid var(--border-color); border-radius:var(--radius-md); cursor:pointer" class="faq-item">
                        <summary style="font-weight:700; color:var(--text-main); font-size:14px; display:flex; justify-content:space-between; align-items:center; list-style:none">
                            <span>Como alterar o PIN de um operador?</span>
                            <i data-lucide="chevron-down" style="width:16px"></i>
                        </summary>
                        <p style="font-size:13px; color:var(--text-muted); margin-top:10px; line-height:1.5; cursor:default">
                            Acesse <b>Configurações</b> > aba <b>Usuários</b>, selecione o operador desejado e clique em Editar. Altere o campo PIN (deve possuir 5 dígitos) e clique em Salvar.
                        </p>
                    </details>
                    
                    <details style="padding:16px; border:1px solid var(--border-color); border-radius:var(--radius-md); cursor:pointer" class="faq-item">
                        <summary style="font-weight:700; color:var(--text-main); font-size:14px; display:flex; justify-content:space-between; align-items:center; list-style:none">
                            <span>Como funciona a Restrição de Localização?</span>
                            <i data-lucide="chevron-down" style="width:16px"></i>
                        </summary>
                        <p style="font-size:13px; color:var(--text-muted); margin-top:10px; line-height:1.5; cursor:default">
                            Quando ativada, a restrição de localização utiliza as coordenadas GPS configuradas na Unidade. O operador só conseguirá abrir ou finalizar o checklist caso seu dispositivo móvel esteja dentro do raio de tolerância definido (padrão de 100m).
                        </p>
                    </details>
                    
                    <details style="padding:16px; border:1px solid var(--border-color); border-radius:var(--radius-md); cursor:pointer" class="faq-item">
                        <summary style="font-weight:700; color:var(--text-main); font-size:14px; display:flex; justify-content:space-between; align-items:center; list-style:none">
                            <span>Por que um checklist aparece como "Fora da Janela" no app?</span>
                            <i data-lucide="chevron-down" style="width:16px"></i>
                        </summary>
                        <p style="font-size:13px; color:var(--text-muted); margin-top:10px; line-height:1.5; cursor:default">
                            Isso ocorre porque as restrições de horário estão ativadas para o checklist (ou unidade). Ele só pode ser executado dentro dos limites de <b>Antecedência máxima</b> e <b>Limite após o prazo</b> em relação ao horário de agendamento programado.
                        </p>
                    </details>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
}

// 4. Renderiza a tela de Ideias (Sugestões)
let ideiasEnviadas = [
    { id: 1, usuario: "Yan Fernandes", titulo: "Integração direta com balanças via Bluetooth", desc: "Possibilidade de coletar o peso dos recipientes diretamente no item numérico usando conexão Bluetooth.", status: "em-analise", votos: 5 },
    { id: 2, usuario: "Brian Nascimento", titulo: "Assinatura do gestor pós-auditoria", desc: "Permitir que o gestor assine digitalmente a tela de auditoria consolidando o fechamento do mês.", status: "aprovada", votos: 12 }
];

function renderIdeas(container) {
    container.innerHTML = `
        <div class="extras-container animate-fade-in" style="display:flex; flex-direction:column; gap:24px;">
            <div style="display:grid; grid-template-columns: 1fr 1.8fr; gap:24px; align-items:flex-start">
                <!-- Formulário de Nova Ideia -->
                <div class="card" style="padding:24px">
                    <h3 style="font-size:16px; font-weight:700; color:var(--text-main); margin-bottom:16px">Sugerir Melhoria</h3>
                    <form id="form-nova-ideia" style="display:flex; flex-direction:column; gap:16px">
                        <div class="form-group">
                            <label class="form-label">Título da Ideia</label>
                            <input type="text" class="form-control" id="idea-title" placeholder="Ex: Relatório em PDF por e-mail" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Explicação da Sugestão</label>
                            <textarea class="form-control" id="idea-desc" rows="4" placeholder="Descreva qual problema essa melhoria resolve..." required style="resize:none"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:100%">Enviar Ideia</button>
                    </form>
                </div>

                <!-- Lista de Ideias Coletivas -->
                <div class="card" style="padding:24px">
                    <h3 style="font-size:16px; font-weight:700; color:var(--text-main); margin-bottom:16px">Canal de Sugestões da Comunidade</h3>
                    <div style="display:flex; flex-direction:column; gap:16px" id="ideas-list-container">
                        <!-- Gerado via JS -->
                    </div>
                </div>
            </div>
        </div>
    `;

    renderIdeiasList();

    document.getElementById('form-nova-ideia').addEventListener('submit', (e) => {
        e.preventDefault();
        const titulo = document.getElementById('idea-title').value.trim();
        const desc = document.getElementById('idea-desc').value.trim();
        
        ideiasEnviadas.unshift({
            id: Date.now(),
            usuario: "Yan Fernandes",
            titulo,
            desc,
            status: "em-analise",
            votos: 1
        });

        alert("Ideia enviada com sucesso! Ela passará pela avaliação da comunidade.");
        document.getElementById('idea-title').value = "";
        document.getElementById('idea-desc').value = "";
        renderIdeiasList();
    });
}

function renderIdeiasList() {
    const listContainer = document.getElementById('ideas-list-container');
    if (!listContainer) return;

    listContainer.innerHTML = ideiasEnviadas.map(i => `
        <div style="border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; display:flex; gap:16px; justify-content:space-between; align-items:flex-start">
            <div style="display:flex; flex-direction:column; gap:6px; flex:1">
                <div style="display:flex; align-items:center; gap:8px">
                    <span style="font-weight:700; font-size:14px; color:var(--text-main)">${i.titulo}</span>
                    <span style="font-size:10px; font-weight:700; border-radius:10px; padding:2px 8px; text-transform:uppercase; background:${i.status === 'aprovada' ? '#ecfdf5' : '#fffbeb'}; color:${i.status === 'aprovada' ? '#10b981' : '#d97706'}">
                        ${i.status === 'aprovada' ? 'Aprovada' : 'Em Análise'}
                    </span>
                </div>
                <p style="font-size:12px; color:var(--text-muted); margin:0; line-height:1.4">${i.desc}</p>
                <span style="font-size:10px; color:var(--text-muted)">Enviada por <b>${i.usuario}</b></span>
            </div>
            
            <button class="btn btn-secondary" style="display:flex; flex-direction:column; align-items:center; padding:8px 12px; gap:4px; height:auto; min-width:50px" onclick="window.votarIdeia(${i.id})">
                <i data-lucide="chevron-up" style="width:16px"></i>
                <span style="font-size:12px; font-weight:700">${i.votos}</span>
            </button>
        </div>
    `).join('');

    lucide.createIcons();
}

window.votarIdeia = (id) => {
    const ideia = ideiasEnviadas.find(i => i.id === id);
    if (ideia) {
        ideia.votos++;
        renderIdeiasList();
    }
};

// 5. Renderiza a tela de Atualizações (Logs de Novidades)
function renderUpdates(container) {
    const atualizacoes = [
        { versao: "v4.2.0", data: "22/07/2026", titulo: "Restrições de Tempo Personalizadas", desc: "Agora é possível configurar limites de antecedência e atraso em minutos e horas diretamente nas unidades e checklists, gerando alertas no painel e controlando as janelas de execução com extrema precisão.", tags: ["Novo", "Restrições"] },
        { versao: "v4.1.0", data: "10/06/2026", titulo: "Inteligência Artificial Genius", desc: "Lançamento do assistente inteligente que auxilia na geração de novos itens de checklist, na melhoria das descrições operacionais e no ajuste ideal de pontuações de itens críticos.", tags: ["Melhoria", "IA"] },
        { versao: "v4.0.0", data: "01/05/2026", titulo: "Checkrest V4 Dashboard Redesign", desc: "Nova interface do painel web baseada em bibliotecas de visualização avançadas (Chart.js), micro-animações, design premium e performance otimizada.", tags: ["Melhoria", "Design"] }
    ];

    container.innerHTML = `
        <div class="extras-container animate-fade-in" style="display:flex; flex-direction:column; gap:24px;">
            <div style="display:flex; flex-direction:column; gap:4px">
                <span class="text-muted" style="font-size:13px; font-weight:500;">HISTÓRICO DE VERSÕES</span>
                <h2 style="font-size:22px; font-weight:800; color:var(--text-main); margin:0">Novidades da Plataforma</h2>
            </div>

            <div style="display:flex; flex-direction:column; gap:20px; position:relative; padding-left:24px; border-left:2px solid var(--border-color)">
                ${atualizacoes.map(a => `
                    <div class="card" style="padding:20px; position:relative">
                        <!-- Indicador na timeline -->
                        <div style="width:12px; height:12px; border-radius:50%; background:var(--color-primary-hover); position:absolute; left:-31px; top:24px; border:2px solid white; box-shadow:var(--shadow-sm)"></div>
                        
                        <div style="display:flex; flex-direction:column; gap:10px">
                            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px">
                                <div style="display:flex; align-items:center; gap:10px">
                                    <span style="font-weight:800; font-size:16px; color:var(--text-main)">${a.titulo}</span>
                                    <span style="font-size:11px; font-weight:700; background:#e6fffa; color:#0f766e; padding:2px 8px; border-radius:10px">${a.versao}</span>
                                </div>
                                <span style="font-size:12px; color:var(--text-muted)">Publicado em ${a.data}</span>
                            </div>
                            
                            <p style="font-size:13px; color:var(--text-muted); margin:0; line-height:1.5">${a.desc}</p>
                            
                            <div style="display:flex; gap:6px; margin-top:4px">
                                ${a.tags.map(t => `<span style="font-size:10px; font-weight:600; color:#475569; background:#f1f5f9; padding:2px 8px; border-radius:4px">${t}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Expor globalmente as funções de renderização para o roteador SPA
window.renderNotifications = renderNotifications;
window.renderCourses = renderCourses;
window.renderHelp = renderHelp;
window.renderIdeas = renderIdeas;
window.renderUpdates = renderUpdates;
