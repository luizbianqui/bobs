// Módulo de Listagem de Checklists (Design Premium)

let filtroUnidade = "";
let buscaNome = "";
let paginaChecklists = 1;
let linhasPorPagina = 20;

function renderChecklists(container) {
    const db = window.getDb();

    container.innerHTML = `
        <div class="dashboard-actions-bar">
            <span class="text-muted">Gerencie os checklists e rotinas operacionais</span>
            <button class="btn btn-primary" id="btn-add-checklist">
                <i data-lucide="plus"></i> Adicionar Checklist +
            </button>
        </div>

        <!-- Painel Superior de Estatísticas -->
        <div class="stats-cards-grid" id="checklist-stats-container"></div>

        <!-- Barra de Filtros e Busca Inteligente -->
        <div class="dashboard-filters" style="justify-content:space-between; align-items:center; margin-bottom:16px; gap:16px; flex-wrap:wrap">
            <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap">
                <div class="form-group" style="margin-bottom:0">
                    <input type="text" class="form-control" id="list-search-name" placeholder="Buscar por título, responsável, setor..." value="${buscaNome}" style="padding: 8px 12px; width:280px; font-size:13px">
                </div>
                <div class="form-group" style="margin-bottom:0">
                    <select class="filter-select" id="list-filter-unit" style="padding: 8px 12px; font-size:13px">
                        <option value="">Todas as Unidades</option>
                        ${db.unidades.map(u => `<option value="${u.id}" ${filtroUnidade === u.id ? 'selected' : ''}>${u.nome}</option>`).join('')}
                    </select>
                </div>
            </div>
            
            <div style="display:flex; gap:8px; align-items:center">
                <button class="btn btn-secondary" style="padding: 8px 12px; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px; border:1px solid var(--border-color); background:white">
                    Ações em massa <i data-lucide="chevron-down" style="width:14px; height:14px"></i>
                </button>
                <button class="btn btn-secondary" style="padding: 8px 12px; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px; border:1px solid var(--border-color); background:white">
                    <i data-lucide="columns" style="width:14px; height:14px"></i> Colunas
                </button>
            </div>
        </div>

        <!-- Tabela Redesenhada -->
        <div class="card" style="padding:0; overflow:hidden; margin-bottom:24px">
            <div class="table-container" style="border:none">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th style="width: 40px; padding-left: 24px">
                                <input type="checkbox" style="cursor:pointer">
                            </th>
                            <th>Checklist</th>
                            <th>Responsável</th>
                            <th>Setor</th>
                            <th>Status</th>
                            <th>Momento</th>
                            <th>Recorrência</th>
                            <th>Horário</th>
                            <th style="text-align:right; padding-right: 24px"></th>
                        </tr>
                    </thead>
                    <tbody id="table-checklists-body"></tbody>
                </table>
            </div>
            
            <!-- Contêiner de Paginação -->
            <div id="table-pagination-container"></div>
        </div>
    `;

    document.getElementById('btn-add-checklist').addEventListener('click', () => {
        window.location.hash = '#checklist-editor';
    });

    document.getElementById('list-filter-unit').addEventListener('change', (e) => {
        filtroUnidade = e.target.value;
        paginaChecklists = 1; // Reseta página ao mudar filtro
        atualizarListagem();
    });

    document.getElementById('list-search-name').addEventListener('input', (e) => {
        buscaNome = e.target.value;
        paginaChecklists = 1; // Reseta página ao digitar busca
        atualizarListagem();
    });

    atualizarListagem();
}

function atualizarListagem() {
    const db = window.getDb();
    const tbody = document.getElementById('table-checklists-body');
    const statsContainer = document.getElementById('checklist-stats-container');
    const paginationContainer = document.getElementById('table-pagination-container');

    if (!tbody) return;

    // 1. Filtragem Inteligente
    const checklistsFiltrados = db.checklists.filter(chk => {
        // Filtro por Unidade
        if (filtroUnidade && chk.unidadeId !== filtroUnidade) return false;

        // Busca por múltiplos termos (Título, Setor, Responsável, Unidade)
        if (buscaNome) {
            const termo = buscaNome.toLowerCase().trim();
            const unidade = db.unidades.find(u => u.id === chk.unidadeId);
            const setor = db.setores.find(s => s.id === chk.setorId);
            const responsavel = db.usuarios.find(u => u.id === chk.responsavelId);

            const matchTitulo = chk.titulo.toLowerCase().includes(termo);
            const matchUnidade = unidade && unidade.nome.toLowerCase().includes(termo);
            const matchSetor = setor && setor.nome.toLowerCase().includes(termo);
            const matchResponsavel = responsavel && responsavel.nome.toLowerCase().includes(termo);

            if (!matchTitulo && !matchUnidade && !matchSetor && !matchResponsavel) {
                return false;
            }
        }
        return true;
    });

    // 2. Renderizar Estatísticas Dinâmicas do Topo
    renderEstatisticas(statsContainer, checklistsFiltrados, db);

    // 3. Paginação
    const totalChecklists = checklistsFiltrados.length;
    const totalPaginas = Math.ceil(totalChecklists / linhasPorPagina) || 1;
    
    if (paginaChecklists > totalPaginas) {
        paginaChecklists = totalPaginas;
    }

    const inicioIdx = totalChecklists === 0 ? 0 : (paginaChecklists - 1) * linhasPorPagina;
    const fimIdx = Math.min(inicioIdx + linhasPorPagina, totalChecklists);
    const checklistsPaginados = checklistsFiltrados.slice(inicioIdx, fimIdx);

    // 4. Renderizar Tabela
    if (checklistsFiltrados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-muted)">Nenhum checklist correspondente aos filtros foi encontrado.</td></tr>`;
        paginationContainer.innerHTML = '';
        return;
    }

    tbody.innerHTML = checklistsPaginados.map(chk => {
        const unidade = db.unidades.find(u => u.id === chk.unidadeId);
        const setor = db.setores.find(s => s.id === chk.setorId);
        const responsavel = db.usuarios.find(u => u.id === chk.responsavelId);

        // Iniciais para o avatar
        const iniciais = responsavel ? obterIniciais(responsavel.nome) : "";

        // Tag de momento com a classe correta
        const classeMomento = (chk.momento || 'outros').toLowerCase().replace(/\s+/g, '-');

        return `
            <tr>
                <td style="padding-left: 24px">
                    <input type="checkbox" style="cursor:pointer">
                </td>
                <td>
                    <div style="font-weight:700; color:var(--text-main); font-size:13px">${chk.titulo}</div>
                    <div style="font-size:11px; color:var(--text-muted); margin-top:2px">${unidade ? unidade.nome : 'Todas as Unidades'}</div>
                </td>
                <td>
                    ${responsavel ? `
                        <div class="table-user-cell">
                            <div class="table-user-avatar">${iniciais}</div>
                            <span class="table-user-name">${responsavel.nome}</span>
                        </div>
                    ` : `
                        <div class="table-user-cell">
                            <div class="table-user-avatar neutral">—</div>
                            <span class="table-user-name" style="color:var(--text-muted)">Sem responsável</span>
                        </div>
                    `}
                </td>
                <td>
                    <span class="tag-sector">${setor ? setor.nome : 'Geral'}</span>
                </td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px">
                        <label class="form-toggle">
                            <input type="checkbox" class="toggle-checklist-status" data-id="${chk.id}" ${chk.status ? 'checked' : ''}>
                            <span class="toggle-switch"></span>
                        </label>
                        <span class="toggle-status-text ${chk.status ? 'active-status' : ''}" id="status-label-${chk.id}">
                            ${chk.status ? 'Ativo' : 'Inativo'}
                        </span>
                    </div>
                </td>
                <td>
                    <span class="tag-moment ${classeMomento}">${chk.momento || 'Outros'}</span>
                </td>
                <td>
                    <div style="display:flex; align-items:center; gap:4px">
                        <span>${chk.agendamento.recorrente ? (chk.agendamento.frequencia || 'Diário') : 'Única'}</span>
                        <i data-lucide="info" style="width:13px; height:13px; color:var(--text-muted); cursor:help" title="Configurações avançadas do agendamento"></i>
                    </div>
                </td>
                <td style="font-weight: 500">${chk.agendamento.horario || '--:--'}</td>
                <td style="text-align:right; position:relative; padding-right: 24px">
                    <button class="btn btn-secondary btn-icon-only btn-actions-dropdown" data-id="${chk.id}" style="border:none; background:transparent">
                        <i data-lucide="more-horizontal" style="width:18px; height:18px"></i>
                    </button>
                    <div class="dropdown-actions-menu" id="dropdown-menu-${chk.id}">
                        <button class="dropdown-action-item" data-action="edit" data-id="${chk.id}"><i data-lucide="edit-3"></i> Editar Checklist</button>
                        <button class="dropdown-action-item" data-action="rename" data-id="${chk.id}"><i data-lucide="type"></i> Renomear</button>
                        <button class="dropdown-action-item" data-action="duplicate" data-id="${chk.id}"><i data-lucide="copy"></i> Duplicar Checklist</button>
                        <div style="height:1px; background:#f1f5f9; margin:4px 0"></div>
                        <button class="dropdown-action-item danger" data-action="delete" data-id="${chk.id}"><i data-lucide="trash-2"></i> Excluir Checklist</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // 5. Renderizar Controles de Paginação
    renderPaginacao(paginationContainer, totalChecklists, totalPaginas, inicioIdx, fimIdx);

    lucide.createIcons();

    // 6. Associar Event Listeners
    configurarEventosTabela(tbody);
}

function renderEstatisticas(container, checklists, db) {
    if (!container) return;

    const total = checklists.length;
    
    // Card 1: Checklists (Ativos vs Inativos)
    const ativos = checklists.filter(c => c.status).length;
    const inativos = total - ativos;
    const pctAtivos = total > 0 ? Math.round((ativos / total) * 100) : 0;
    const pctInativos = total > 0 ? Math.round((inativos / total) * 100) : 0;

    // Card 2: Por Setor
    const setoresMap = {};
    checklists.forEach(c => {
        const setor = db.setores.find(s => s.id === c.setorId);
        const nomeSetor = setor ? setor.nome : 'Geral';
        setoresMap[nomeSetor] = (setoresMap[nomeSetor] || 0) + 1;
    });
    const setoresList = Object.entries(setoresMap)
        .map(([nome, count]) => ({ nome, count }))
        .sort((a, b) => b.count - a.count);
    const topSetores = setoresList.slice(0, 3);
    const outrosSetoresCount = setoresList.slice(3).reduce((acc, curr) => acc + curr.count, 0);

    // Card 3: Por Responsável
    const respMap = {};
    checklists.forEach(c => {
        const resp = db.usuarios.find(u => u.id === c.responsavelId);
        const nomeResp = resp ? resp.nome : 'Sem responsável';
        respMap[nomeResp] = (respMap[nomeResp] || 0) + 1;
    });
    const respList = Object.entries(respMap)
        .map(([nome, count]) => ({ nome, count }))
        .sort((a, b) => b.count - a.count);
    const topResps = respList.slice(0, 3);
    const outrosRespsCount = respList.slice(3).reduce((acc, curr) => acc + curr.count, 0);

    // Card 4: Por Momento
    const momentoMap = {};
    checklists.forEach(c => {
        const m = c.momento || 'Outros';
        momentoMap[m] = (momentoMap[m] || 0) + 1;
    });
    const momentoList = Object.entries(momentoMap)
        .map(([nome, count]) => ({ nome, count }))
        .sort((a, b) => b.count - a.count);
    const topMomentos = momentoList.slice(0, 3);
    const outrosMomentosCount = momentoList.slice(3).reduce((acc, curr) => acc + curr.count, 0);

    const calcBarWidth = (count) => total > 0 ? Math.round((count / total) * 100) : 0;

    container.innerHTML = `
        <!-- Card 1: Checklists Ativos/Inativos -->
        <div class="stats-card">
            <span class="stats-card-title">Checklists</span>
            
            <div class="stats-item-row">
                <div class="stats-item-label-group">
                    <span>Ativos</span>
                    <span class="stats-item-value-highlight">${ativos} (${pctAtivos}%)</span>
                </div>
                <div class="stats-item-progress-bg">
                    <div class="stats-item-progress-bar green" style="width: ${pctAtivos}%"></div>
                </div>
            </div>
            
            <div class="stats-item-row">
                <div class="stats-item-label-group">
                    <span>Inativos</span>
                    <span class="stats-item-value-highlight">${inativos} (${pctInativos}%)</span>
                </div>
                <div class="stats-item-progress-bg">
                    <div class="stats-item-progress-bar neutral" style="width: ${pctInativos}%"></div>
                </div>
            </div>
            
            <div class="stats-card-total-row">
                <span>Total</span>
                <span class="stats-card-total-value">${total}</span>
            </div>
        </div>

        <!-- Card 2: Por Setor -->
        <div class="stats-card">
            <span class="stats-card-title">Por setor</span>
            ${topSetores.map(s => `
                <div class="stats-item-row">
                    <div class="stats-item-label-group">
                        <span>${s.nome}</span>
                        <span class="stats-item-value-highlight">${s.count}</span>
                    </div>
                    <div class="stats-item-progress-bg">
                        <div class="stats-item-progress-bar blue" style="width: ${calcBarWidth(s.count)}%"></div>
                    </div>
                </div>
            `).join('')}
            
            ${outrosSetoresCount > 0 ? `
                <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; margin-top: auto; margin-bottom: 2px;">
                    + ${setoresList.length - 3} outros
                </div>
            ` : ''}
        </div>

        <!-- Card 3: Por Responsável -->
        <div class="stats-card">
            <span class="stats-card-title">Por responsável</span>
            ${topResps.map(r => `
                <div class="stats-item-row">
                    <div class="stats-item-label-group">
                        <span style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 140px;" title="${r.nome}">${r.nome}</span>
                        <span class="stats-item-value-highlight">${r.count}</span>
                    </div>
                    <div class="stats-item-progress-bg">
                        <div class="stats-item-progress-bar green" style="width: ${calcBarWidth(r.count)}%"></div>
                    </div>
                </div>
            `).join('')}
            
            ${outrosRespsCount > 0 ? `
                <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; margin-top: auto; margin-bottom: 2px;">
                    + ${respList.length - 3} outros
                </div>
            ` : ''}
        </div>

        <!-- Card 4: Por Momento -->
        <div class="stats-card">
            <span class="stats-card-title">Por momento</span>
            ${topMomentos.map(m => `
                <div class="stats-item-row">
                    <div class="stats-item-label-group">
                        <span>${m.nome}</span>
                        <span class="stats-item-value-highlight">${m.count}</span>
                    </div>
                    <div class="stats-item-progress-bg">
                        <div class="stats-item-progress-bar dark-green" style="width: ${calcBarWidth(m.count)}%"></div>
                    </div>
                </div>
            `).join('')}
            
            ${outrosMomentosCount > 0 ? `
                <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; margin-top: auto; margin-bottom: 2px;">
                    + ${momentoList.length - 3} outros
                </div>
            ` : ''}
        </div>
    `;
}

function renderPaginacao(container, totalChecklists, totalPaginas, inicioIdx, fimIdx) {
    if (!container) return;

    container.innerHTML = `
        <div class="table-pagination-container">
            <div>
                <span style="margin-right: 8px">Linhas por página:</span>
                <select class="pagination-rows-select" id="rows-per-page-select">
                    <option value="5" ${linhasPorPagina === 5 ? 'selected' : ''}>5</option>
                    <option value="10" ${linhasPorPagina === 10 ? 'selected' : ''}>10</option>
                    <option value="20" ${linhasPorPagina === 20 ? 'selected' : ''}>20</option>
                    <option value="50" ${linhasPorPagina === 50 ? 'selected' : ''}>50</option>
                </select>
            </div>
            <div class="pagination-controls-group">
                <span>Mostrando ${totalChecklists === 0 ? 0 : inicioIdx + 1}-${fimIdx} de ${totalChecklists}</span>
                <div class="pagination-page-controls">
                    <button class="btn btn-secondary btn-icon-only" id="btn-chk-page-first" style="padding: 4px 8px; border: 1px solid var(--border-color); background: white; cursor: pointer" ${paginaChecklists === 1 ? 'disabled style="opacity:0.5; cursor:not-allowed"' : ''}>
                        <i data-lucide="chevrons-left" style="width: 14px; height: 14px"></i>
                    </button>
                    <button class="btn btn-secondary btn-icon-only" id="btn-chk-page-prev" style="padding: 4px 8px; border: 1px solid var(--border-color); background: white; cursor: pointer" ${paginaChecklists === 1 ? 'disabled style="opacity:0.5; cursor:not-allowed"' : ''}>
                        <i data-lucide="chevron-left" style="width: 14px; height: 14px"></i>
                    </button>
                    <button class="btn btn-secondary btn-icon-only" id="btn-chk-page-next" style="padding: 4px 8px; border: 1px solid var(--border-color); background: white; cursor: pointer" ${paginaChecklists === totalPaginas ? 'disabled style="opacity:0.5; cursor:not-allowed"' : ''}>
                        <i data-lucide="chevron-right" style="width: 14px; height: 14px"></i>
                    </button>
                    <button class="btn btn-secondary btn-icon-only" id="btn-chk-page-last" style="padding: 4px 8px; border: 1px solid var(--border-color); background: white; cursor: pointer" ${paginaChecklists === totalPaginas ? 'disabled style="opacity:0.5; cursor:not-allowed"' : ''}>
                        <i data-lucide="chevrons-right" style="width: 14px; height: 14px"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('rows-per-page-select').addEventListener('change', (e) => {
        linhasPorPagina = parseInt(e.target.value);
        paginaChecklists = 1;
        atualizarListagem();
    });

    if (paginaChecklists > 1) {
        document.getElementById('btn-chk-page-first').addEventListener('click', () => {
            paginaChecklists = 1;
            atualizarListagem();
        });
        document.getElementById('btn-chk-page-prev').addEventListener('click', () => {
            paginaChecklists--;
            atualizarListagem();
        });
    }

    if (paginaChecklists < totalPaginas) {
        document.getElementById('btn-chk-page-next').addEventListener('click', () => {
            paginaChecklists++;
            atualizarListagem();
        });
        document.getElementById('btn-chk-page-last').addEventListener('click', () => {
            paginaChecklists = totalPaginas;
            atualizarListagem();
        });
    }
}

function configurarEventosTabela(tbody) {
    // 1. Toggle do Status (Switch)
    tbody.querySelectorAll('.toggle-checklist-status').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const chkId = chk.getAttribute('data-id');
            const dataDb = window.getDb();
            const targetChk = dataDb.checklists.find(c => c.id === chkId);
            
            if (targetChk) {
                targetChk.status = e.target.checked;
                window.saveDb(dataDb);

                // Atualizar dinamicamente o texto do status ao lado do toggle
                const label = document.getElementById(`status-label-${chkId}`);
                if (label) {
                    label.textContent = targetChk.status ? 'Ativo' : 'Inativo';
                    if (targetChk.status) {
                        label.classList.add('active-status');
                    } else {
                        label.classList.remove('active-status');
                    }
                }
                
                // Recarrega as estatísticas de forma dinâmica
                const checklistsFiltrados = dataDb.checklists.filter(c => {
                    if (filtroUnidade && c.unidadeId !== filtroUnidade) return false;
                    if (buscaNome) {
                        const termo = buscaNome.toLowerCase().trim();
                        const unidade = dataDb.unidades.find(u => u.id === c.unidadeId);
                        const setor = dataDb.setores.find(s => s.id === c.setorId);
                        const responsavel = dataDb.usuarios.find(u => u.id === c.responsavelId);

                        const matchTitulo = c.titulo.toLowerCase().includes(termo);
                        const matchUnidade = unidade && unidade.nome.toLowerCase().includes(termo);
                        const matchSetor = setor && setor.nome.toLowerCase().includes(termo);
                        const matchResponsavel = responsavel && responsavel.nome.toLowerCase().includes(termo);

                        if (!matchTitulo && !matchUnidade && !matchSetor && !matchResponsavel) return false;
                    }
                    return true;
                });
                renderEstatisticas(document.getElementById('checklist-stats-container'), checklistsFiltrados, dataDb);
            }
        });
    });

    // 2. Dropdown de Ações
    tbody.querySelectorAll('.btn-actions-dropdown').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const chkId = btn.getAttribute('data-id');
            
            document.querySelectorAll('.dropdown-actions-menu.active').forEach(menu => {
                if (menu.id !== `dropdown-menu-${chkId}`) {
                    menu.classList.remove('active');
                }
            });

            const menu = document.getElementById(`dropdown-menu-${chkId}`);
            menu.classList.toggle('active');
        });
    });

    tbody.querySelectorAll('.dropdown-action-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.getAttribute('data-action');
            const chkId = item.getAttribute('data-id');
            
            document.getElementById(`dropdown-menu-${chkId}`).classList.remove('active');
            tratarAcaoChecklist(action, chkId);
        });
    });
}

document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-actions-menu.active').forEach(menu => {
        menu.classList.remove('active');
    });
});

function tratarAcaoChecklist(action, chkId) {
    const db = window.getDb();
    const chk = db.checklists.find(c => c.id === chkId);
    if (!chk) return;

    if (action === 'edit') {
        window.location.hash = `#checklist-editor?id=${chkId}`;
    } 
    else if (action === 'rename') {
        const novoTitulo = prompt("Renomear checklist para:", chk.titulo);
        if (novoTitulo && novoTitulo.trim() !== "") {
            chk.titulo = novoTitulo.trim();
            window.saveDb(db);
            atualizarListagem();
        }
    } 
    else if (action === 'duplicate') {
        const novoChk = JSON.parse(JSON.stringify(chk));
        novoChk.id = `chk-${Math.random().toString(36).substr(2, 9)}`;
        novoChk.titulo = `Cópia de ${chk.titulo}`;
        db.checklists.push(novoChk);
        window.saveDb(db);
        atualizarListagem();
    } 
    else if (action === 'delete') {
        if (confirm(`Tem certeza que deseja excluir o checklist "${chk.titulo}"?`)) {
            db.checklists = db.checklists.filter(c => c.id !== chkId);
            window.saveDb(db);
            atualizarListagem();
        }
    }
}

// Helpers
function obterIniciais(nome) {
    if (!nome) return "?";
    const partes = nome.trim().split(/\s+/);
    if (partes.length >= 2) {
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
}

window.renderChecklists = renderChecklists;
