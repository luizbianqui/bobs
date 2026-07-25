// Módulo de Configurações (Unidades, Usuários, Setores - Design Premium)

let activeTab = 'units';
let editUserId = null;
let editUnitId = null;

function renderSettings(container) {
    container.innerHTML = `
        <div class="settings-container">
            <div class="tabs-header">
                <button class="tab-btn ${activeTab === 'units' ? 'active' : ''}" data-tab="units">Unidades</button>
                <button class="tab-btn ${activeTab === 'sectors' ? 'active' : ''}" data-tab="sectors">Setores</button>
                <button class="tab-btn ${activeTab === 'users' ? 'active' : ''}" data-tab="users">Usuários</button>
                <button class="tab-btn ${activeTab === 'notifications' ? 'active' : ''}" data-tab="notifications">Notificações</button>
                <button class="tab-btn ${activeTab === 'supabase' ? 'active' : ''}" data-tab="supabase">Integração Supabase</button>
            </div>

            <div class="tab-content">
                <div class="tab-pane ${activeTab === 'units' ? 'active' : ''}" id="pane-units"></div>
                <div class="tab-pane ${activeTab === 'sectors' ? 'active' : ''}" id="pane-sectors"></div>
                <div class="tab-pane ${activeTab === 'users' ? 'active' : ''}" id="pane-users"></div>
                <div class="tab-pane ${activeTab === 'notifications' ? 'active' : ''}" id="pane-notifications"></div>
                <div class="tab-pane ${activeTab === 'supabase' ? 'active' : ''}" id="pane-supabase"></div>
            </div>
        </div>
    `;

    container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = btn.getAttribute('data-tab');
            renderSettings(container);
        });
    });

    if (activeTab === 'units') renderUnitsPane();
    else if (activeTab === 'sectors') renderSectorsPane();
    else if (activeTab === 'users') renderUsersPane();
    else if (activeTab === 'notifications') renderNotificationsPane();
    else if (activeTab === 'supabase') renderSupabasePane();

    lucide.createIcons();
}

function renderUnitsPane() {
    const pane = document.getElementById('pane-units');
    const db = window.getDb();

    pane.innerHTML = `
        <div class="dashboard-actions-bar" style="margin-bottom: 20px">
            <span class="text-muted">Filiais e regras geográficas</span>
            <button class="btn btn-primary" id="btn-add-unit">
                <i data-lucide="plus"></i> Nova Unidade
            </button>
        </div>

        <div class="card" style="padding:0; overflow:hidden">
            <div class="table-container" style="border:none">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>Sigla</th>
                            <th>Nome</th>
                            <th>Cidade/UF</th>
                            <th>Restrição Localização (GPS)</th>
                            <th>Restrição Horário (Prazos)</th>
                            <th style="text-align:right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${db.unidades.map(u => {
                            const hasLocal = u.restricoes && u.restricoes.local !== false;
                            const hasHorario = u.restricoes && u.restricoes.horario !== false;
                            const city = u.cidade || u.city || "";
                            return `
                            <tr>
                                <td><b>${u.sigla}</b></td>
                                <td>${u.nome}</td>
                                <td>${city} - ${u.uf}</td>
                                <td>
                                    ${hasLocal ? `
                                        <div style="font-size:12px; color:var(--text-main); display:flex; flex-direction:column; gap:2px">
                                            <span>${u.latitude ? u.latitude.toFixed(4) : "N/A"}, ${u.longitude ? u.longitude.toFixed(4) : "N/A"}</span>
                                            <span style="font-weight:700; color:#0f766e; background:#e6fffa; padding:2px 6px; border-radius:4px; width:fit-content; font-size:11px">Raio: ${u.restricoes.raioMetros || 100}m</span>
                                        </div>
                                    ` : `<span style="background:#f1f5f9; color:#64748b; font-size:11px; padding:2px 8px; border-radius:10px; font-weight:600">Inativa</span>`}
                                </td>
                                <td>
                                    ${hasHorario ? `
                                        <div style="font-size:12px; color:var(--text-main); display:flex; flex-direction:column; gap:2px">
                                            <span>Antecedência: <b>${u.restricoes.antecedenciaValor || 12} ${u.restricoes.antecedenciaUnidade || 'horas'}</b></span>
                                            <span>Limite Máximo: <b>${u.restricoes.limiteAtrasoValor || 12} ${u.restricoes.limiteAtrasoUnidade || 'horas'}</b></span>
                                        </div>
                                    ` : `<span style="background:#f1f5f9; color:#64748b; font-size:11px; padding:2px 8px; border-radius:10px; font-weight:600">Inativa</span>`}
                                </td>
                                <td style="text-align:right">
                                    <button class="btn btn-secondary btn-icon-only btn-edit-unit" data-id="${u.id}"><i data-lucide="edit-2" style="width:14px"></i></button>
                                    <button class="btn btn-secondary btn-icon-only btn-delete-unit" data-id="${u.id}" style="color:var(--color-danger)"><i data-lucide="trash-2" style="width:14px"></i></button>
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('btn-add-unit').addEventListener('click', () => abrirModalUnidade());
    
    pane.querySelectorAll('.btn-edit-unit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            abrirModalUnidade(id);
        });
    });

    pane.querySelectorAll('.btn-delete-unit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            if (confirm("Deseja realmente deletar esta unidade?")) {
                const data = window.getDb();
                data.unidades = data.unidades.filter(u => u.id !== id);
                window.saveDb(data);
                renderUnitsPane();
                lucide.createIcons();
            }
        });
    });
}

function abrirModalUnidade(unitId = null) {
    editUnitId = unitId;
    const db = window.getDb();
    
    const overlay = document.getElementById('unit-modal-overlay');
    const container = document.getElementById('unit-modal-overlay').querySelector('.modal-container');
    const title = document.getElementById('unit-modal-title');
    const body = document.getElementById('unit-modal-body');

    let unit = { nome: "", sigla: "", cidade: "", uf: "PA", latitude: -1.4558, longitude: -48.4902, restricoes: { local: true, horario: true, raioMetros: 100, antecedenciaValor: 12, antecedenciaUnidade: "horas", limiteAtrasoValor: 12, limiteAtrasoUnidade: "horas" } };
    
    if (unitId) {
        title.textContent = "Editar Unidade";
        const found = db.unidades.find(u => u.id === unitId);
        if (found) {
            unit = JSON.parse(JSON.stringify(found));
            if (!unit.restricoes) unit.restricoes = {};
            if (unit.restricoes.local === undefined) unit.restricoes.local = true;
            if (unit.restricoes.horario === undefined) unit.restricoes.horario = true;
            if (unit.restricoes.raioMetros === undefined) unit.restricoes.raioMetros = 100;
            if (unit.restricoes.antecedenciaValor === undefined) {
                unit.restricoes.antecedenciaValor = unit.restricoes.antecedenciaHoras !== undefined ? unit.restricoes.antecedenciaHoras : 12;
                unit.restricoes.antecedenciaUnidade = "horas";
            }
            if (unit.restricoes.limiteAtrasoValor === undefined) {
                unit.restricoes.limiteAtrasoValor = unit.restricoes.limiteAtrasoHoras !== undefined ? unit.restricoes.limiteAtrasoHoras : 12;
                unit.restricoes.limiteAtrasoUnidade = "horas";
            }
        }
    } else {
        title.textContent = "Adicionar nova unidade";
    }

    body.innerHTML = `
        <form id="form-unit-modal">
            <!-- DADOS BÁSICOS -->
            <div class="modal-section-title">Dados Gerais</div>
            
            <div class="form-control-row" style="margin-bottom:16px">
                <div class="form-group" style="margin-bottom:0">
                    <label class="form-label">Nome da Unidade</label>
                    <input type="text" class="form-control" id="unit-name" value="${unit.nome}" required placeholder="Ex: Bob's Shopping">
                </div>
                <div class="form-group" style="margin-bottom:0">
                    <label class="form-label">Sigla</label>
                    <input type="text" class="form-control" id="unit-sigla" value="${unit.sigla}" required placeholder="Ex: BS">
                </div>
            </div>

            <div class="form-control-row" style="margin-bottom:16px">
                <div class="form-group" style="margin-bottom:0">
                    <label class="form-label">Cidade</label>
                    <input type="text" class="form-control" id="unit-city" value="${unit.cidade || unit.city || ''}" required placeholder="Ex: Belém">
                </div>
                <div class="form-group" style="margin-bottom:0">
                    <label class="form-label">UF</label>
                    <input type="text" class="form-control" id="unit-uf" value="${unit.uf}" required maxlength="2" placeholder="Ex: PA">
                </div>
            </div>

            <!-- RESTRIÇÕES DE EXECUÇÃO -->
            <div class="modal-section-title">Restrições de Execução</div>
            
            <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:20px">
                <label class="form-toggle">
                    <input type="checkbox" id="unit-local-toggle" ${unit.restricoes.local !== false ? 'checked' : ''}>
                    <span class="toggle-switch"></span>
                    <span class="form-label" style="margin-bottom:0"><b>Restrição de Localização (GPS)</b></span>
                </label>
                
                <div id="unit-local-details" style="display: ${unit.restricoes.local !== false ? 'block' : 'none'}; padding-left:12px; border-left:2px solid var(--border-color)">
                    <div class="form-control-row" style="margin-bottom:12px">
                        <div class="form-group" style="margin-bottom:0">
                            <label class="form-label">Latitude</label>
                            <input type="number" step="0.000001" class="form-control" id="unit-lat" value="${unit.latitude || -1.4558}" required placeholder="Ex: -1.4558">
                        </div>
                        <div class="form-group" style="margin-bottom:0">
                            <label class="form-label">Longitude</label>
                            <input type="number" step="0.000001" class="form-control" id="unit-lng" value="${unit.longitude || -48.4902}" required placeholder="Ex: -48.4902">
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:0">
                        <label class="form-label">Raio de Tolerância GPS (Metros)</label>
                        <div style="display:flex; align-items:center; position:relative">
                            <input type="number" class="form-control" id="unit-raio" value="${unit.restricoes.raioMetros || 100}" required min="10" placeholder="Ex: 100" style="padding-right:48px">
                            <span style="position:absolute; right:12px; font-size:13px; font-weight:700; color:#94a3b8">metros</span>
                        </div>
                    </div>
                </div>

                <label class="form-toggle">
                    <input type="checkbox" id="unit-horario-toggle" ${unit.restricoes.horario !== false ? 'checked' : ''}>
                    <span class="toggle-switch"></span>
                    <span class="form-label" style="margin-bottom:0"><b>Restrição de Horário</b></span>
                </label>

                <div id="unit-horario-details" style="display: ${unit.restricoes.horario !== false ? 'block' : 'none'}; padding-left:12px; border-left:2px solid var(--border-color)">
                    <div class="form-group" style="margin-bottom:12px">
                        <label class="form-label">Antecedência máxima</label>
                        <div style="display:flex; gap:8px">
                            <input type="number" class="form-control" id="unit-antecedence-val" value="${unit.restricoes.antecedenciaValor !== undefined ? unit.restricoes.antecedenciaValor : 12}" min="0" required style="flex:1">
                            <select class="form-control" id="unit-antecedence-unit" style="width:110px">
                                <option value="horas" ${unit.restricoes.antecedenciaUnidade === 'horas' ? 'selected' : ''}>Horas</option>
                                <option value="minutos" ${unit.restricoes.antecedenciaUnidade === 'minutos' ? 'selected' : ''}>Minutos</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:0">
                        <label class="form-label">Limite após o prazo</label>
                        <div style="display:flex; gap:8px">
                            <input type="number" class="form-control" id="unit-limit-after-val" value="${unit.restricoes.limiteAtrasoValor !== undefined ? unit.restricoes.limiteAtrasoValor : 12}" min="0" required style="flex:1">
                            <select class="form-control" id="unit-limit-after-unit" style="width:110px">
                                <option value="horas" ${unit.restricoes.limiteAtrasoUnidade === 'horas' ? 'selected' : ''}>Horas</option>
                                <option value="minutos" ${unit.restricoes.limiteAtrasoUnidade === 'minutos' ? 'selected' : ''}>Minutos</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px">
                <button type="button" class="btn btn-secondary" id="btn-close-unit-modal">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
        </form>
    `;

    const fechar = () => {
        overlay.classList.remove('active');
        container.classList.remove('active');
    };

    document.getElementById('btn-close-unit-modal').addEventListener('click', fechar);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) fechar(); });

    const localToggle = document.getElementById('unit-local-toggle');
    const localDetails = document.getElementById('unit-local-details');
    localToggle.addEventListener('change', (e) => {
        localDetails.style.display = e.target.checked ? 'block' : 'none';
        const latInput = document.getElementById('unit-lat');
        const lngInput = document.getElementById('unit-lng');
        const raioInput = document.getElementById('unit-raio');
        if (e.target.checked) {
            latInput.setAttribute('required', '');
            lngInput.setAttribute('required', '');
            raioInput.setAttribute('required', '');
        } else {
            latInput.removeAttribute('required');
            lngInput.removeAttribute('required');
            raioInput.removeAttribute('required');
        }
    });

    const horarioToggle = document.getElementById('unit-horario-toggle');
    const horarioDetails = document.getElementById('unit-horario-details');
    horarioToggle.addEventListener('change', (e) => {
        horarioDetails.style.display = e.target.checked ? 'block' : 'none';
        const antVal = document.getElementById('unit-antecedence-val');
        const limVal = document.getElementById('unit-limit-after-val');
        if (e.target.checked) {
            antVal.setAttribute('required', '');
            limVal.setAttribute('required', '');
        } else {
            antVal.removeAttribute('required');
            limVal.removeAttribute('required');
        }
    });

    document.getElementById('form-unit-modal').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = window.getDb();

        const nome = document.getElementById('unit-name').value.trim();
        const sigla = document.getElementById('unit-sigla').value.trim().toUpperCase();
        const cidade = document.getElementById('unit-city').value.trim();
        const uf = document.getElementById('unit-uf').value.trim().toUpperCase();
        
        const local = localToggle.checked;
        const lat = local ? parseFloat(document.getElementById('unit-lat').value) : -1.4558;
        const lng = local ? parseFloat(document.getElementById('unit-lng').value) : -48.4902;
        const raio = local ? (parseInt(document.getElementById('unit-raio').value) || 100) : 100;
        
        const horario = horarioToggle.checked;
        const antecedenceVal = horario ? (parseInt(document.getElementById('unit-antecedence-val').value) || 12) : 12;
        const antecedenceUnit = horario ? document.getElementById('unit-antecedence-unit').value : 'horas';
        const limitAfterVal = horario ? (parseInt(document.getElementById('unit-limit-after-val').value) || 12) : 12;
        const limitAfterUnit = horario ? document.getElementById('unit-limit-after-unit').value : 'horas';

        const updatedUnit = { 
            nome, 
            sigla, 
            cidade, 
            uf, 
            latitude: lat, 
            longitude: lng, 
            restricoes: { 
                local,
                horario,
                raioMetros: raio,
                antecedenciaValor: antecedenceVal,
                antecedenciaUnidade: antecedenceUnit,
                limiteAtrasoValor: limitAfterVal,
                limiteAtrasoUnidade: limitAfterUnit
            } 
        };

        if (editUnitId) {
            const index = data.unidades.findIndex(u => u.id === editUnitId);
            if (index >= 0) {
                data.unidades[index] = { id: editUnitId, ...updatedUnit };
            }
        } else {
            data.unidades.push({
                id: `un-${Math.random().toString(36).substr(2, 9)}`,
                ...updatedUnit
            });
        }

        window.saveDb(data);
        fechar();
        renderUnitsPane();
        lucide.createIcons();
    });

    overlay.classList.add('active');
    container.classList.add('active');
}

function renderSectorsPane() {
    const pane = document.getElementById('pane-sectors');
    const db = window.getDb();

    pane.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 300px; gap:24px">
            <div class="card" style="padding:0; overflow:hidden">
                <div class="table-container" style="border:none">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Nome do Setor</th>
                                <th style="text-align:right; width:80px">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${db.setores.map(s => `
                                <tr>
                                    <td><b>${s.nome}</b></td>
                                    <td style="text-align:right">
                                        <button class="btn btn-secondary btn-icon-only btn-delete-sector" data-id="${s.id}" style="color:var(--color-danger)"><i data-lucide="trash-2" style="width:14px"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card" style="height:fit-content">
                <h4 style="margin-bottom:16px; font-weight:700">Adicionar Setor</h4>
                <form id="form-add-sector">
                    <div class="form-group">
                        <label class="form-label">Nome do Setor</label>
                        <input type="text" class="form-control" id="sector-new-name" required placeholder="Ex: Delivery">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%">
                        Criar Setor
                    </button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('form-add-sector').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = window.getDb();
        const nome = document.getElementById('sector-new-name').value.trim();

        if (nome) {
            data.setores.push({
                id: `set-${Math.random().toString(36).substr(2, 9)}`,
                nome
            });
            window.saveDb(data);
            renderSectorsPane();
            lucide.createIcons();
        }
    });

    pane.querySelectorAll('.btn-delete-sector').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const data = window.getDb();
            
            const chkLinked = data.checklists.some(c => c.setorId === id);
            if (chkLinked) {
                alert("Não é possível excluir este setor porque há checklists ativos associados a ele.");
                return;
            }

            if (confirm("Deseja realmente excluir este setor?")) {
                data.setores = data.setores.filter(s => s.id !== id);
                window.saveDb(data);
                renderSectorsPane();
                lucide.createIcons();
            }
        });
    });
}

function renderUsersPane() {
    const pane = document.getElementById('pane-users');
    const db = window.getDb();

    pane.innerHTML = `
        <div class="dashboard-actions-bar" style="margin-bottom: 20px">
            <span class="text-muted">Gestores (Painel Web) e Operadores (PIN Mobile)</span>
            <button class="btn btn-primary" id="btn-add-user">
                <i data-lucide="plus"></i> Novo Usuário
            </button>
        </div>

        <div class="card" style="padding:0; overflow:hidden">
            <div class="table-container" style="border:none">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Perfil</th>
                            <th>PIN de Acesso</th>
                            <th>Setores de Atuação (Unidade)</th>
                            <th style="text-align:right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${db.usuarios.map(u => {
                            let setoresExibidos = "";
                            if (u.vinculos && u.vinculos.length > 0) {
                                setoresExibidos = u.vinculos.map(v => {
                                    const s = db.setores.find(x => x.id === v.setorId);
                                    const un = db.unidades.find(x => x.id === v.unidadeId);
                                    return s && un ? `${s.nome} (${un.sigla})` : '';
                                }).filter(x => x).join(', ');
                            } else {
                                // Fallback para usuários criados originalmente
                                setoresExibidos = (u.setores || []).map(sid => {
                                    const s = db.setores.find(x => x.id === sid);
                                    return s ? s.nome : '';
                                }).filter(x => x).join(', ');
                            }

                            let perfilText = u.gestor ? 'Gestor' : 'Operador';
                            if (u.gestor && u.subperfil) {
                                const sub = u.subperfil.charAt(0).toUpperCase() + u.subperfil.slice(1);
                                perfilText = `Gestor (${sub})`;
                            }

                            return `
                                <tr>
                                    <td>
                                        <b>${u.nome}</b>
                                        <br>
                                        <span class="text-muted" style="font-size:11px">${u.telefone || 'Sem telefone'}</span>
                                    </td>
                                    <td>${u.email}</td>
                                    <td>
                                        <span class="badge ${u.gestor ? 'badge-success' : 'badge-neutral'}">${perfilText}</span>
                                    </td>
                                    <td>
                                        <code style="font-size:13px; font-weight:700; background:#f1f5f9; padding:2px 6px; border-radius:4px">${u.pin}</code>
                                    </td>
                                    <td style="font-size:13px">${setoresExibidos || 'Geral'}</td>
                                    <td style="text-align:right">
                                        <button class="btn btn-secondary btn-icon-only btn-edit-user" data-id="${u.id}"><i data-lucide="edit-2" style="width:14px"></i></button>
                                        <button class="btn btn-secondary btn-icon-only btn-delete-user" data-id="${u.id}" style="color:var(--color-danger)"><i data-lucide="trash-2" style="width:14px"></i></button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('btn-add-user').addEventListener('click', () => abrirModalUsuario());

    pane.querySelectorAll('.btn-edit-user').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            abrirModalUsuario(id);
        });
    });

    pane.querySelectorAll('.btn-delete-user').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const data = window.getDb();

            if (id === 'usr-1') {
                alert("Você não pode excluir o gestor padrão logado.");
                return;
            }

            if (confirm("Deseja realmente remover este usuário?")) {
                data.usuarios = data.usuarios.filter(u => u.id !== id);
                window.saveDb(data);
                renderUsersPane();
                lucide.createIcons();
            }
        });
    });
}

function abrirModalUsuario(usrId = null) {
    editUserId = usrId;
    const db = window.getDb();

    const overlay = document.getElementById('user-modal-overlay');
    const container = document.getElementById('user-modal-overlay').querySelector('.modal-container');
    const title = document.getElementById('user-modal-title');
    const body = document.getElementById('user-modal-body');

    let user = { nome: "", email: "", telefone: "", pin: "", gestor: false, subperfil: "gerente", vinculos: [] };

    if (usrId) {
        title.textContent = `Editando ${usrId}`;
        const found = db.usuarios.find(u => u.id === usrId);
        if (found) {
            user = JSON.parse(JSON.stringify(found));
            title.textContent = `Editando ${user.nome}`;
        }
    } else {
        title.textContent = "Adicionar novo usuário";
    }

    // Configuração de e-mail inteligente
    let usandoEmailProprio = false;
    let emailParteLocal = "";
    
    if (user.email) {
        if (user.email.endsWith('@kon.vc')) {
            emailParteLocal = user.email.replace('@kon.vc', '');
            usandoEmailProprio = false;
        } else {
            emailParteLocal = "";
            usandoEmailProprio = true;
        }
    }

    // Inicializa a lista de vínculos temporários para edição
    let vinculosEdit = user.vinculos ? JSON.parse(JSON.stringify(user.vinculos)) : [];
    // Mapeia setores antigos para vínculos com a primeira unidade
    if (vinculosEdit.length === 0 && user.setores && user.setores.length > 0) {
        const primeiraUnidade = db.unidades[0] ? db.unidades[0].id : '';
        if (primeiraUnidade) {
            vinculosEdit = user.setores.map(sid => ({ unidadeId: primeiraUnidade, setorId: sid }));
        }
    }

    body.innerHTML = `
        <form id="form-user-modal">
            <!-- DADOS PESSOAIS -->
            <div class="modal-section-title">Dados Pessoais</div>
            
            <div class="form-group">
                <label class="form-label">Nome</label>
                <input type="text" class="form-control" id="usr-name" value="${user.nome}" required placeholder="Ex: Lucas de Freitas">
            </div>

            <div class="form-control-row" style="margin-bottom:16px">
                <!-- E-mail Inteligente -->
                <div class="form-group" style="margin-bottom:0; flex:1; position:relative">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px">
                        <label class="form-label" style="margin-bottom:0">E-mail</label>
                        <a href="#" id="lnk-toggle-email-type" style="font-size:11px; font-weight:700; color:var(--color-primary-hover); text-decoration:none; display:${usrId ? 'none' : 'block'}">
                            ${usandoEmailProprio ? 'usar e-mail kon.vc' : 'usar meu próprio e-mail'}
                        </a>
                    </div>
                    
                    <div id="email-input-wrapper">
                        <!-- Será injetado dinamicamente -->
                    </div>
                    
                    ${usrId ? `
                        <button type="button" class="btn btn-secondary" id="btn-change-email" style="position:absolute; right:4px; top:24px; padding:4px 8px; font-size:11px; height:34px; display:flex; align-items:center; gap:4px">
                            <i data-lucide="edit-3" style="width:12px; height:12px"></i> Alterar e-mail
                        </button>
                    ` : ''}
                </div>

                <!-- Telefone -->
                <div class="form-group" style="margin-bottom:0; width: 180px;">
                    <label class="form-label">Telefone</label>
                    <div style="display:flex; align-items:center; position:relative">
                        <span style="position:absolute; left:12px; font-size:13px; font-weight:600; color:#64748b; display:flex; align-items:center; gap:4px">
                            🇧🇷 +55
                        </span>
                        <input type="tel" class="form-control" id="usr-tel" value="${user.telefone ? user.telefone.replace('55', '') : ''}" required placeholder="(00) 00000-0000" style="padding-left:62px" maxlength="15">
                    </div>
                </div>
            </div>

            <!-- SEGURANÇA (Senha Temporária / Acesso) -->
            ${usrId ? `
                <!-- Modo Edição -->
                <div class="modal-section-title">Segurança</div>
                <div class="form-group" style="margin-bottom:16px">
                    <label class="form-label">Senha de acesso</label>
                    <div style="display:flex; gap:8px; align-items:center">
                        <div style="position:relative; flex:1">
                            <input type="password" class="form-control" value="••••••••" readonly style="background:#f8fafc; cursor:not-allowed; padding-left:36px">
                            <i data-lucide="lock" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); width:14px; height:14px; color:#94a3b8"></i>
                        </div>
                        <button type="button" class="btn btn-secondary" id="btn-change-password-edit" style="height:40px; white-space:nowrap; padding: 0 16px; font-size:12px; font-weight:600">Alterar senha</button>
                    </div>
                </div>
            ` : `
                <!-- Modo Criação -->
                <div class="form-group" style="margin-bottom:16px">
                    <label class="form-label">Senha temporária</label>
                    <div style="display:flex; gap:8px">
                        <div style="position:relative; flex:1">
                            <input type="password" class="form-control" id="usr-temp-pass" value="${Math.random().toString(36).substring(2, 10).toUpperCase()}" required style="padding-right:40px">
                            <button type="button" id="btn-toggle-pass-visibility" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); border:none; background:transparent; cursor:pointer; color:#64748b" title="Visualizar senha">
                                <i data-lucide="eye" style="width:16px; height:16px"></i>
                            </button>
                        </div>
                        <button type="button" class="btn btn-secondary" id="btn-regenerate-pass" style="height:40px; width:40px; display:flex; align-items:center; justify-content:center" title="Gerar nova senha">
                            <i data-lucide="refresh-cw" style="width:16px; height:16px"></i>
                        </button>
                    </div>
                </div>
            `}

            <!-- TROCA RÁPIDA (PIN de 5 Dígitos Segmentado) -->
            <div class="pin-container-box">
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <span style="font-size:11px; font-weight:700; color:#0f766e; display:flex; align-items:center; gap:6px">
                        <i data-lucide="smartphone" style="width:13px; height:13px"></i> PIN de 5 dígitos 
                        <span style="background:#ccfbf1; color:#0f766e; font-size:9px; padding:2px 6px; border-radius:4px; font-weight:800">TROCA RÁPIDA ATIVA</span>
                    </span>
                    <a href="#" id="lnk-gen-random-pin" style="font-size:11px; font-weight:700; color:var(--color-primary-hover); text-decoration:none">Gerar aleatório</a>
                </div>
                <p style="font-size:11px; color:#0f766e; opacity:0.8; margin-top:4px; margin-bottom:12px">Defina um PIN inicial que o operador vai usar para alternar contas no app.</p>
                <div class="pin-inputs-row">
                    <input type="text" class="pin-digit-input" maxlength="1" pattern="[0-9]" data-index="0" value="${user.pin ? user.pin[0] || '' : ''}" required>
                    <input type="text" class="pin-digit-input" maxlength="1" pattern="[0-9]" data-index="1" value="${user.pin ? user.pin[1] || '' : ''}" required>
                    <input type="text" class="pin-digit-input" maxlength="1" pattern="[0-9]" data-index="2" value="${user.pin ? user.pin[2] || '' : ''}" required>
                    <input type="text" class="pin-digit-input" maxlength="1" pattern="[0-9]" data-index="3" value="${user.pin ? user.pin[3] || '' : ''}" required>
                    <input type="text" class="pin-digit-input" maxlength="1" pattern="[0-9]" data-index="4" value="${user.pin ? user.pin[4] || '' : ''}" required>
                </div>
                <span id="pin-validation-msg" style="font-size:11px; color:var(--color-danger); font-weight:600; display:none; margin-top:8px">PIN deve ter exatamente 5 dígitos numéricos</span>
            </div>

            <!-- PERFIL DO GESTOR -->
            <div class="modal-section-title">Configurações do Gestor</div>
            <div class="form-group" style="margin-bottom:20px">
                <label class="form-toggle">
                    <input type="checkbox" id="usr-is-gestor" ${user.gestor ? 'checked' : ''}>
                    <span class="toggle-switch"></span>
                    <span class="form-label" style="margin-bottom:0; font-weight:600; color:var(--text-main)">Esse usuário é Gestor? (Acesso painel web)</span>
                </label>
                <div id="gestor-profile-container" style="display:${user.gestor ? 'flex' : 'none'}; flex-direction:column; margin-top:4px">
                    <div class="gestor-profile-group">
                        <label class="gestor-profile-option">
                            <input type="radio" name="usr-subperfil" value="gerente" ${(!user.subperfil || user.subperfil === 'gerente') ? 'checked' : ''}>
                            <span>Gerente</span>
                        </label>
                        <label class="gestor-profile-option">
                            <input type="radio" name="usr-subperfil" value="administrador" ${user.subperfil === 'administrador' ? 'checked' : ''}>
                            <span>Administrador</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- CONFIGURAÇÕES DE SETORES E UNIDADES (VÍNCULOS) -->
            <div class="modal-section-title">Configurações de Setor</div>
            <div class="form-group" style="margin-bottom:24px">
                <div id="vinculos-container" style="margin-bottom:10px"></div>
                <button type="button" class="btn-add-vinc" id="btn-add-vinculo-row">
                    <i data-lucide="plus" style="width:14px; height:14px"></i> Adicionar Setor
                </button>
            </div>

            <!-- AÇÕES -->
            <div style="display:flex; justify-content:flex-end; gap:8px; padding-top:16px; border-top:1px solid var(--border-color)">
                <button type="button" class="btn btn-secondary" id="btn-close-user-modal">Cancelar</button>
                <button type="submit" class="btn btn-primary" id="btn-save-user">${usrId ? 'Salvar' : 'Criar usuário'}</button>
            </div>
        </form>
    `;

    const fechar = () => {
        overlay.classList.remove('active');
        container.classList.remove('active');
    };

    document.getElementById('btn-close-user-modal').addEventListener('click', fechar);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) fechar(); });

    // Lógica do E-mail Inteligente
    const emailWrapper = document.getElementById('email-input-wrapper');
    const toggleEmailTypeLink = document.getElementById('lnk-toggle-email-type');

    function renderEmailInput() {
        if (usandoEmailProprio) {
            emailWrapper.innerHTML = `
                <input type="email" class="form-control" id="usr-email" value="${user.email || ''}" required placeholder="Ex: rodrigo@gmail.com" ${usrId ? 'readonly style="background:#f8fafc; cursor:not-allowed"' : ''}>
            `;
            if (toggleEmailTypeLink) toggleEmailTypeLink.textContent = "usar e-mail kon.vc";
        } else {
            emailWrapper.innerHTML = `
                <div class="input-group-email">
                    <input type="text" class="form-control" id="usr-email-local" value="${emailParteLocal}" required placeholder="Ex: rodrigo" ${usrId ? 'readonly style="background:#f8fafc; cursor:not-allowed"' : ''}>
                    <div class="email-addon">@kon.vc</div>
                </div>
            `;
            if (toggleEmailTypeLink) toggleEmailTypeLink.textContent = "usar meu próprio e-mail";
        }
    }
    
    renderEmailInput();

    if (toggleEmailTypeLink) {
        toggleEmailTypeLink.addEventListener('click', (e) => {
            e.preventDefault();
            usandoEmailProprio = !usandoEmailProprio;
            renderEmailInput();
        });
    }

    if (usrId) {
        const btnChangeEmail = document.getElementById('btn-change-email');
        if (btnChangeEmail) {
            btnChangeEmail.addEventListener('click', () => {
                const localInput = document.getElementById('usr-email-local');
                const fullInput = document.getElementById('usr-email');
                
                if (localInput) {
                    localInput.removeAttribute('readonly');
                    localInput.style.background = 'white';
                    localInput.style.cursor = 'text';
                    localInput.focus();
                }
                if (fullInput) {
                    fullInput.removeAttribute('readonly');
                    fullInput.style.background = 'white';
                    fullInput.style.cursor = 'text';
                    fullInput.focus();
                }
                if (toggleEmailTypeLink) toggleEmailTypeLink.style.display = 'block';
                btnChangeEmail.style.display = 'none';
            });
        }
        
        const btnChangePass = document.getElementById('btn-change-password-edit');
        if (btnChangePass) {
            btnChangePass.addEventListener('click', () => {
                const novaSenha = prompt("Digite a nova senha temporária do usuário:");
                if (novaSenha !== null) {
                    if (novaSenha.trim().length >= 4) {
                        alert("Senha alterada com sucesso! (Salva ao salvar o formulário)");
                        user.tempPassword = novaSenha.trim(); // Atribui temporariamente no objeto
                    } else {
                        alert("A senha deve conter ao menos 4 caracteres.");
                    }
                }
            });
        }
    } else {
        // Controle de visibilidade da senha (modo criação)
        const tempPassInput = document.getElementById('usr-temp-pass');
        const toggleVisibilityBtn = document.getElementById('btn-toggle-pass-visibility');
        const regenerateBtn = document.getElementById('btn-regenerate-pass');

        if (toggleVisibilityBtn) {
            toggleVisibilityBtn.addEventListener('click', () => {
                if (tempPassInput.type === 'password') {
                    tempPassInput.type = 'text';
                    toggleVisibilityBtn.innerHTML = '<i data-lucide="eye-off" style="width:16px; height:16px"></i>';
                } else {
                    tempPassInput.type = 'password';
                    toggleVisibilityBtn.innerHTML = '<i data-lucide="eye" style="width:16px; height:16px"></i>';
                }
                lucide.createIcons();
            });
        }

        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                tempPassInput.value = Math.random().toString(36).substring(2, 10).toUpperCase();
            });
        }
    }

    // Controle do PIN Segmentado
    const pinInputs = container.querySelectorAll('.pin-digit-input');
    const pinValMsg = document.getElementById('pin-validation-msg');

    pinInputs.forEach((input, index) => {
        // Impede entrada de caracteres não-numéricos
        input.addEventListener('keypress', (e) => {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });

        // Foca automaticamente o próximo
        input.addEventListener('input', (e) => {
            if (input.value.length === 1 && index < 4) {
                pinInputs[index + 1].focus();
                pinInputs[index + 1].select();
            }
            validarPinLocal();
        });

        // Navegação com Backspace (foca o anterior)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value.length === 0 && index > 0) {
                pinInputs[index - 1].focus();
                pinInputs[index - 1].select();
            }
        });
    });

    function validarPinLocal() {
        let pinCompleto = "";
        pinInputs.forEach(i => pinCompleto += i.value);
        if (pinCompleto.length === 5 && /^[0-9]{5}$/.test(pinCompleto)) {
            pinValMsg.style.display = 'none';
            return true;
        } else {
            pinValMsg.style.display = 'block';
            return false;
        }
    }

    document.getElementById('lnk-gen-random-pin').addEventListener('click', (e) => {
        e.preventDefault();
        const randomPin = Math.floor(10000 + Math.random() * 90000).toString();
        pinInputs.forEach((input, idx) => {
            input.value = randomPin[idx];
        });
        pinValMsg.style.display = 'none';
    });

    // Toggle do perfil de gestor
    const isGestorCheckbox = document.getElementById('usr-is-gestor');
    const gestorProfileContainer = document.getElementById('gestor-profile-container');

    isGestorCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            gestorProfileContainer.style.display = 'flex';
        } else {
            gestorProfileContainer.style.display = 'none';
        }
    });

    // Lógica de Vínculos de Setores/Unidades
    function renderizarVinculos() {
        const vincContainer = document.getElementById('vinculos-container');
        if (!vincContainer) return;
        
        if (vinculosEdit.length === 0) {
            vincContainer.innerHTML = `<div style="font-size:12px; color:var(--text-muted); font-style:italic; padding:6px 0">Nenhum setor atribuído. Adicione ao menos um setor.</div>`;
            return;
        }

        vincContainer.innerHTML = vinculosEdit.map((v, idx) => `
            <div class="vinc-row" data-index="${idx}">
                <select class="select-vinc-unidade" data-index="${idx}" required>
                    <option value="" disabled ${!v.unidadeId ? 'selected' : ''}>Selecione a Unidade</option>
                    ${db.unidades.map(un => `<option value="${un.id}" ${v.unidadeId === un.id ? 'selected' : ''}>${un.nome}</option>`).join('')}
                </select>
                <select class="select-vinc-setor" data-index="${idx}" required>
                    <option value="" disabled ${!v.setorId ? 'selected' : ''}>Selecione o Setor</option>
                    ${db.setores.map(s => `<option value="${s.id}" ${v.setorId === s.id ? 'selected' : ''}>${s.nome}</option>`).join('')}
                </select>
                <button type="button" class="btn-remove-vinc" data-index="${idx}">
                    <i data-lucide="trash-2" style="width:14px; height:14px"></i>
                </button>
            </div>
        `).join('');

        lucide.createIcons();

        // Registrar escutas nos selects e botões
        vincContainer.querySelectorAll('.select-vinc-unidade').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const index = parseInt(sel.getAttribute('data-index'));
                vinculosEdit[index].unidadeId = e.target.value;
            });
        });

        vincContainer.querySelectorAll('.select-vinc-setor').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const index = parseInt(sel.getAttribute('data-index'));
                vinculosEdit[index].setorId = e.target.value;
            });
        });

        vincContainer.querySelectorAll('.btn-remove-vinc').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                vinculosEdit.splice(index, 1);
                renderizarVinculos();
            });
        });
    }

    renderizarVinculos();

    document.getElementById('btn-add-vinculo-row').addEventListener('click', () => {
        const primeiraUnidade = db.unidades[0] ? db.unidades[0].id : '';
        const primeiroSetor = db.setores[0] ? db.setores[0].id : '';
        
        vinculosEdit.push({ unidadeId: primeiraUnidade, setorId: primeiroSetor });
        renderizarVinculos();
    });

    // Envio do formulário
    document.getElementById('form-user-modal').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = window.getDb();

        const nome = document.getElementById('usr-name').value.trim();
        const telefone = '55' + document.getElementById('usr-tel').value.replace(/\D/g, '');
        
        let email = "";
        if (usandoEmailProprio) {
            email = document.getElementById('usr-email').value.trim();
        } else {
            email = document.getElementById('usr-email-local').value.trim() + '@kon.vc';
        }

        // Recupera o PIN
        let pin = "";
        pinInputs.forEach(i => pin += i.value);
        
        if (pin.length !== 5 || !/^[0-9]{5}$/.test(pin)) {
            pinValMsg.style.display = 'block';
            pinInputs[0].focus();
            return;
        }

        // Validação de exclusividade do PIN
        const pinDuplicado = data.usuarios.some(u => u.pin === pin && u.id !== editUserId);
        if (pinDuplicado) {
            alert(`Erro: O PIN "${pin}" já está sendo utilizado por outro usuário no sistema. Escolha outro.`);
            return;
        }

        const gestor = isGestorCheckbox.checked;
        let subperfil = "gerente";
        if (gestor) {
            const radProfile = document.querySelector('input[name="usr-subperfil"]:checked');
            if (radProfile) {
                subperfil = radProfile.value;
            }
        }

        // Sanitiza vínculos para remoção de eventuais nulos
        const vinculosFinais = vinculosEdit.filter(v => v.unidadeId && v.setorId);

        // Fallback do array legível para setores antigos
        const setoresListaLegada = [...new Set(vinculosFinais.map(v => v.setorId))];

        if (editUserId) {
            const index = data.usuarios.findIndex(u => u.id === editUserId);
            if (index >= 0) {
                // Atualiza mantendo as informações de senha pré-existentes se não alteradas
                const usrAntigo = data.usuarios[index];
                data.usuarios[index] = {
                    id: editUserId,
                    nome,
                    email,
                    telefone,
                    pin,
                    gestor,
                    subperfil: gestor ? subperfil : "",
                    setores: setoresListaLegada,
                    vinculos: vinculosFinais,
                    tempPassword: user.tempPassword || usrAntigo.tempPassword || ""
                };
            }
        } else {
            // Nova criação
            const tempPassword = document.getElementById('usr-temp-pass').value;
            data.usuarios.push({
                id: `usr-${Math.random().toString(36).substr(2, 9)}`,
                nome,
                email,
                telefone,
                pin,
                gestor,
                subperfil: gestor ? subperfil : "",
                setores: setoresListaLegada,
                vinculos: vinculosFinais,
                tempPassword
            });
        }

        window.saveDb(data);
        fechar();
        renderUsersPane();
        lucide.createIcons();
    });

    overlay.classList.add('active');
    container.classList.add('active');
    lucide.createIcons();
}

function renderNotificationsPane() {
    const pane = document.getElementById('pane-notifications');
    const db = window.getDb();
    const notif = db.notificacoes;

    pane.innerHTML = `
        <div class="notifications-layout">
            <!-- Coluna de Configuração -->
            <div class="notif-config-column">
                <!-- Card Integração WhatsApp -->
                <div class="card notif-card-whatsapp" style="margin-bottom: 20px;">
                    <div class="whatsapp-card-header">
                        <div class="whatsapp-brand">
                            <i data-lucide="message-square" class="icon-whatsapp"></i>
                            <div>
                                <h4 style="font-weight: 700; margin: 0;">Integração WhatsApp</h4>
                                <span class="text-muted" style="font-size: 12px;">Canal de comunicação direta</span>
                            </div>
                        </div>
                        <span class="badge badge-success" style="display: flex; align-items: center; gap: 4px;">
                            <span class="dot-blink"></span> Conectado
                        </span>
                    </div>
                    <div class="whatsapp-card-body" style="margin-top: 15px;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label class="form-label">Número de Telefone Principal</label>
                            <div style="display: flex; align-items: center; position: relative;">
                                <span style="position: absolute; left: 12px; font-size: 13px; font-weight: 600; color: #64748b;">🇧🇷 +55</span>
                                <input type="tel" class="form-control" id="notif-wa-number" value="${(notif.numeroPrincipal || '').replace(/^55/, '')}" placeholder="(00) 00000-0000" style="padding-left: 62px;" maxlength="15">
                            </div>
                            <span class="text-muted" style="font-size: 11px; display: block; margin-top: 6px;">Este número receberá os alertas do sistema.</span>
                        </div>
                    </div>
                </div>

                <!-- Card 1: Checklists Agendados -->
                <div class="card notif-card" style="margin-bottom: 20px;">
                    <div class="notif-card-header">
                        <div class="notif-icon-title">
                            <div class="notif-icon-wrapper bg-primary-light">
                                <i data-lucide="calendar" style="color: var(--color-primary-hover);"></i>
                            </div>
                            <div>
                                <h4 style="font-weight: 700; margin: 0;">Checklists Agendados (Lembretes)</h4>
                                <span class="text-muted" style="font-size: 12px;">Dispara lembretes de tarefas agendadas para o dia</span>
                            </div>
                        </div>
                    </div>
                    <div class="notif-card-body">
                        <div class="notif-channels">
                            <label class="form-toggle-label">
                                <span>Receber no WhatsApp</span>
                                <label class="form-toggle">
                                    <input type="checkbox" id="notif-agendados-wa" ${notif.agendados.whatsapp ? 'checked' : ''}>
                                    <span class="toggle-switch"></span>
                                </label>
                            </label>
                            <label class="form-toggle-label">
                                <span>Receber via Push (App)</span>
                                <label class="form-toggle">
                                    <input type="checkbox" id="notif-agendados-push" ${notif.agendados.push ? 'checked' : ''}>
                                    <span class="toggle-switch"></span>
                                </label>
                            </label>
                        </div>
                        <div class="form-control-row" style="margin-top: 15px;">
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Antecedência do Envio</label>
                                <select class="form-control" id="notif-agendados-time">
                                    <option value="0" ${notif.agendados.antecedencia == 0 ? 'selected' : ''}>No horário de início</option>
                                    <option value="15" ${notif.agendados.antecedencia == 15 ? 'selected' : ''}>15 minutos antes</option>
                                    <option value="30" ${notif.agendados.antecedencia == 30 ? 'selected' : ''}>30 minutos antes</option>
                                    <option value="60" ${notif.agendados.antecedencia == 60 ? 'selected' : ''}>1 hora antes</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Enviar Para</label>
                                <select class="form-control" id="notif-agendados-to">
                                    <option value="responsavel" ${notif.agendados.enviarPara === 'responsavel' ? 'selected' : ''}>Operador Responsável</option>
                                    <option value="gestores" ${notif.agendados.enviarPara === 'gestores' ? 'selected' : ''}>Apenas Gestores</option>
                                    <option value="todos" ${notif.agendados.enviarPara === 'todos' ? 'selected' : ''}>Todos da Unidade</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card 2: Itens Críticos -->
                <div class="card notif-card" style="margin-bottom: 20px;">
                    <div class="notif-card-header">
                        <div class="notif-icon-title">
                            <div class="notif-icon-wrapper bg-danger-light">
                                <i data-lucide="alert-triangle" style="color: var(--color-danger);"></i>
                            </div>
                            <div>
                                <h4 style="font-weight: 700; margin: 0;">Itens Críticos (Alertas de Desvio)</h4>
                                <span class="text-muted" style="font-size: 12px;">Alertas imediatos quando um item crítico não for conforme</span>
                            </div>
                        </div>
                    </div>
                    <div class="notif-card-body">
                        <div class="notif-channels">
                            <label class="form-toggle-label">
                                <span>Receber no WhatsApp</span>
                                <label class="form-toggle">
                                    <input type="checkbox" id="notif-criticos-wa" ${notif.criticos.whatsapp ? 'checked' : ''}>
                                    <span class="toggle-switch"></span>
                                </label>
                            </label>
                            <label class="form-toggle-label">
                                <span>Receber via Push (App)</span>
                                <label class="form-toggle">
                                    <input type="checkbox" id="notif-criticos-push" ${notif.criticos.push ? 'checked' : ''}>
                                    <span class="toggle-switch"></span>
                                </label>
                            </label>
                        </div>
                        <div class="form-group" style="margin-top: 15px;">
                            <label class="form-label">Enviar Para</label>
                            <select class="form-control" id="notif-criticos-to">
                                <option value="gestores" ${notif.criticos.enviarPara === 'gestores' ? 'selected' : ''}>Gestores da Unidade</option>
                                <option value="administrador" ${notif.criticos.enviarPara === 'administrador' ? 'selected' : ''}>Administradores Gerais</option>
                                <option value="ambos" ${notif.criticos.enviarPara === 'ambos' ? 'selected' : ''}>Ambos</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0; margin-top: 15px;">
                            <label class="form-label" style="display: flex; justify-content: space-between;">
                                <span>Modelo de Mensagem (WhatsApp)</span>
                                <span style="font-size: 11px; color: var(--text-light); text-transform: none;">Use {checklist}, {item}, {operador}, {unidade}</span>
                            </label>
                            <textarea class="form-control" id="notif-criticos-msg" style="height: 80px; font-family: monospace; font-size: 12px; line-height: 1.4; resize: none;">${notif.criticos.mensagem}</textarea>
                        </div>
                    </div>
                </div>

                <!-- Card 3: Checklists Atrasados -->
                <div class="card notif-card" style="margin-bottom: 20px;">
                    <div class="notif-card-header">
                        <div class="notif-icon-title">
                            <div class="notif-icon-wrapper bg-warning-light">
                                <i data-lucide="clock" style="color: var(--color-warning);"></i>
                            </div>
                            <div>
                                <h4 style="font-weight: 700; margin: 0;">Checklists Atrasados</h4>
                                <span class="text-muted" style="font-size: 12px;">Notifica quando uma execução passa do horário limite</span>
                            </div>
                        </div>
                    </div>
                    <div class="notif-card-body">
                        <div class="notif-channels">
                            <label class="form-toggle-label">
                                <span>Receber no WhatsApp</span>
                                <label class="form-toggle">
                                    <input type="checkbox" id="notif-atrasados-wa" ${notif.atrasados.whatsapp ? 'checked' : ''}>
                                    <span class="toggle-switch"></span>
                                </label>
                            </label>
                            <label class="form-toggle-label">
                                <span>Receber via Push (App)</span>
                                <label class="form-toggle">
                                    <input type="checkbox" id="notif-atrasados-push" ${notif.atrasados.push ? 'checked' : ''}>
                                    <span class="toggle-switch"></span>
                                </label>
                            </label>
                        </div>
                        <div class="form-control-row" style="margin-top: 15px;">
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Tolerância para Atraso (Minutos)</label>
                                <input type="number" class="form-control" id="notif-atrasados-time" value="${notif.atrasados.minutosTolerancia || 15}" min="1">
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Enviar Para</label>
                                <select class="form-control" id="notif-atrasados-to">
                                    <option value="ambos" ${notif.atrasados.enviarPara === 'ambos' ? 'selected' : ''}>Operador & Gestor</option>
                                    <option value="responsavel" ${notif.atrasados.enviarPara === 'responsavel' ? 'selected' : ''}>Apenas Operador</option>
                                    <option value="gestores" ${notif.atrasados.enviarPara === 'gestores' ? 'selected' : ''}>Apenas Gestores</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card 4: Relatório de Fechamento -->
                <div class="card notif-card" style="margin-bottom: 20px;">
                    <div class="notif-card-header">
                        <div class="notif-icon-title">
                            <div class="notif-icon-wrapper bg-info-light">
                                <i data-lucide="file-text" style="color: var(--color-info);"></i>
                            </div>
                            <div>
                                <h4 style="font-weight: 700; margin: 0;">Relatório de Fechamento Diário</h4>
                                <span class="text-muted" style="font-size: 12px;">Resumo diário de conformidade e execuções</span>
                            </div>
                        </div>
                    </div>
                    <div class="notif-card-body">
                        <div class="notif-channels">
                            <label class="form-toggle-label">
                                <span>Receber no WhatsApp</span>
                                <label class="form-toggle">
                                    <input type="checkbox" id="notif-fechamento-wa" ${notif.fechamento.whatsapp ? 'checked' : ''}>
                                    <span class="toggle-switch"></span>
                                </label>
                            </label>
                            <label class="form-toggle-label">
                                <span>Receber via Push (App)</span>
                                <label class="form-toggle">
                                    <input type="checkbox" id="notif-fechamento-push" ${notif.fechamento.push ? 'checked' : ''}>
                                    <span class="toggle-switch"></span>
                                </label>
                            </label>
                        </div>
                        <div class="form-control-row" style="margin-top: 15px;">
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Horário de Envio</label>
                                <input type="time" class="form-control" id="notif-fechamento-time" value="${notif.fechamento.horario || '22:00'}">
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Enviar Para</label>
                                <select class="form-control" id="notif-fechamento-to">
                                    <option value="gestores" ${notif.fechamento.enviarPara === 'gestores' ? 'selected' : ''}>Gestores da Unidade</option>
                                    <option value="administrador" ${notif.fechamento.enviarPara === 'administrador' ? 'selected' : ''}>Administradores Gerais</option>
                                    <option value="ambos" ${notif.fechamento.enviarPara === 'ambos' ? 'selected' : ''}>Ambos</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Coluna do Simulador -->
            <div class="notif-simulator-column">
                <div class="card simulator-card" style="position: sticky; top: 20px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div class="simulator-icon-wrapper">
                            <i data-lucide="smartphone"></i>
                        </div>
                        <h4 style="font-weight: 700; margin-top: 10px; margin-bottom: 4px;">Simulador de Testes</h4>
                        <p class="text-muted" style="font-size: 12px; line-height: 1.4;">Teste instantaneamente a formatação e o envio das notificações simulando ocorrências na sua unidade.</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Tipo de Alerta de Simulação</label>
                        <select class="form-control" id="test-alert-type">
                            <option value="agendado">Checklist Agendado (Lembrete)</option>
                            <option value="critico">Item Crítico Respondido Não Conforme</option>
                            <option value="atrasado">Checklist Atrasado (Estouro de Janela)</option>
                            <option value="fechamento">Relatório de Fechamento Diário</option>
                        </select>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
                        <button class="btn btn-secondary btn-test-notif" id="btn-test-wa" style="justify-content: center; gap: 8px; width: 100%;">
                            <i data-lucide="message-square" style="width: 16px; height: 16px;"></i> WhatsApp
                        </button>
                        <button class="btn btn-primary btn-test-notif" id="btn-test-push" style="justify-content: center; gap: 8px; width: 100%;">
                            <i data-lucide="bell" style="width: 16px; height: 16px;"></i> Push App
                        </button>
                    </div>

                    <div class="simulation-tip" style="margin-top: 20px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid var(--border-color);">
                        <span style="font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                            <i data-lucide="info" style="width: 14px; height: 14px;"></i> Dica de Simulação
                        </span>
                        <p style="font-size: 11px; color: var(--text-muted); line-height: 1.4; margin: 0;">Ao testar, o sistema gera dinamicamente dados simulados da franquia Bob's com base nos checklists configurados para criar um alerta real.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
    registrarSalvarNotificacoes();
    registrarSimuladores();
}

function registrarSalvarNotificacoes() {
    const db = window.getDb();
    
    const salvar = () => {
        const telInput = document.getElementById('notif-wa-number');
        const telOriginal = '55' + telInput.value.replace(/\D/g, '');
        
        db.notificacoes = {
            whatsappConectado: true,
            numeroPrincipal: telOriginal,
            agendados: {
                whatsapp: document.getElementById('notif-agendados-wa').checked,
                push: document.getElementById('notif-agendados-push').checked,
                antecedencia: parseInt(document.getElementById('notif-agendados-time').value),
                enviarPara: document.getElementById('notif-agendados-to').value
            },
            criticos: {
                whatsapp: document.getElementById('notif-criticos-wa').checked,
                push: document.getElementById('notif-criticos-push').checked,
                enviarPara: document.getElementById('notif-criticos-to').value,
                mensagem: document.getElementById('notif-criticos-msg').value
            },
            atrasados: {
                whatsapp: document.getElementById('notif-atrasados-wa').checked,
                push: document.getElementById('notif-atrasados-push').checked,
                minutosTolerancia: parseInt(document.getElementById('notif-atrasados-time').value),
                enviarPara: document.getElementById('notif-atrasados-to').value
            },
            fechamento: {
                whatsapp: document.getElementById('notif-fechamento-wa').checked,
                push: document.getElementById('notif-fechamento-push').checked,
                horario: document.getElementById('notif-fechamento-time').value,
                enviarPara: document.getElementById('notif-fechamento-to').value
            }
        };
        
        localStorage.setItem('checkrest_db', JSON.stringify(db));
    };

    const ids = [
        'notif-wa-number', 'notif-agendados-wa', 'notif-agendados-push', 
        'notif-agendados-time', 'notif-agendados-to', 'notif-criticos-wa', 
        'notif-criticos-push', 'notif-criticos-to', 'notif-criticos-msg', 
        'notif-atrasados-wa', 'notif-atrasados-push', 'notif-atrasados-time', 
        'notif-atrasados-to', 'notif-fechamento-wa', 'notif-fechamento-push', 
        'notif-fechamento-time', 'notif-fechamento-to'
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', salvar);
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.addEventListener('input', salvar);
            }
        }
    });
}

function registrarSimuladores() {
    const btnWa = document.getElementById('btn-test-wa');
    const btnPush = document.getElementById('btn-test-push');
    const typeSelect = document.getElementById('test-alert-type');

    const gerarDadosAlerta = () => {
        const type = typeSelect.value;
        const msgTemplate = document.getElementById('notif-criticos-msg').value;

        let pushTitle = "";
        let pushBody = "";
        let waBody = "";

        if (type === 'agendado') {
            pushTitle = "Novo Checklist Agendado";
            pushBody = "O checklist 'Checklist de Abertura - Cozinha' está disponível para execução. Limite de conclusão às 08:30.";
            waBody = "📋 *Lembrete de Checklist* 📋\n\nOlá, o checklist *Checklist de Abertura - Cozinha* está disponível para preenchimento na unidade *BMPA* (Bob's Matriz PA).\n\n*Momento:* Abertura\n*Setor:* Bar\n*Responsável:* Brian Nascimento\n*Horário:* 08:00 (tolerância de atraso: 30 minutos).";
        } else if (type === 'critico') {
            pushTitle = "Desvio Crítico Encontrado!";
            pushBody = "Item crítico 'Temperatura do freezer (-15°C)' fora da conformidade no checklist 'Checklist de Abertura - Cozinha'.";
            
            let msg = msgTemplate
                .replace(/{checklist}/g, "Checklist de Abertura - Cozinha")
                .replace(/{unidade}/g, "BMPA")
                .replace(/{item}/g, "Temperatura do freezer (-15°C - Meta: <= -18°C)")
                .replace(/{operador}/g, "Brian Nascimento");
            waBody = msg;
        } else if (type === 'atrasado') {
            pushTitle = "Alerta de Checklist Atrasado";
            pushBody = "O checklist 'Checklist de Abertura - Cozinha' está atrasado na unidade 'BMPA'.";
            waBody = "⏰ *Alerta de Atraso* ⏰\n\nAtenção! O checklist *Checklist de Abertura - Cozinha* da unidade *BMPA* (Setor: Bar) ainda não foi finalizado. O horário agendado era *08:00* e o prazo de tolerância de *30 minutos* expirou.";
        } else if (type === 'fechamento') {
            pushTitle = "Relatório de Fechamento Diário Disponível";
            pushBody = "Resumo diário da unidade 'BMPA': 100% concluídos, 82% de qualidade geral.";
            waBody = "📊 *Relatório Diário de Operação - Checkrest* 📊\n\nResumo da unidade *BMPA* (Bob's Matriz PA) hoje:\n\n*Checklists Finalizados:* 3 de 3 (100%)\n*Pontualidade Média:* 67%\n*Qualidade Média:* 82%\n*Itens Críticos Não Conformes:* 1 ocorrência\n\n👉 Acesse o painel web para ver os relatórios completos e evidências fotográficas.";
        }

        return { pushTitle, pushBody, waBody };
    };

    if (btnWa) {
        btnWa.addEventListener('click', () => {
            const data = gerarDadosAlerta();
            dispararWhatsAppSimulado(data.waBody);
        });
    }

    if (btnPush) {
        btnPush.addEventListener('click', () => {
            const data = gerarDadosAlerta();
            dispararPushSimulado(data.pushTitle, data.pushBody);
        });
    }
}

function dispararPushSimulado(titulo, texto) {
    const antigo = document.getElementById('checkrest-push-toast');
    if (antigo) antigo.remove();

    const pushToast = document.createElement('div');
    pushToast.id = 'checkrest-push-toast';
    pushToast.className = 'push-toast-container';
    pushToast.innerHTML = `
        <div class="push-toast-header">
            <div style="display: flex; align-items: center; gap: 8px;">
                <div class="push-toast-logo">C</div>
                <span style="font-weight: 700; font-size: 12px; color: #ffffff;">CHECKREST</span>
                <span style="font-size: 10px; color: rgba(255,255,255,0.6);">agora mesmo</span>
            </div>
            <button class="push-toast-close">&times;</button>
        </div>
        <div class="push-toast-body">
            <h5 style="margin: 0; font-weight: 700; color: #ffffff; font-size: 13px; margin-bottom: 2px;">${titulo}</h5>
            <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.85); line-height: 1.3;">${texto}</p>
        </div>
    `;

    document.body.appendChild(pushToast);

    pushToast.querySelector('.push-toast-close').addEventListener('click', () => {
        pushToast.classList.add('fade-out');
        setTimeout(() => pushToast.remove(), 300);
    });

    setTimeout(() => {
        if (document.body.contains(pushToast)) {
            pushToast.classList.add('fade-out');
            setTimeout(() => {
                if (document.body.contains(pushToast)) pushToast.remove();
            }, 300);
        }
    }, 6000);
}

function dispararWhatsAppSimulado(mensagem) {
    const antigo = document.getElementById('checkrest-wa-mockup');
    if (antigo) antigo.remove();

    let mensagemFormatada = mensagem
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

    const waMockup = document.createElement('div');
    waMockup.id = 'checkrest-wa-mockup';
    waMockup.className = 'wa-mockup-container';
    
    const agora = new Date();
    const horaStr = agora.getHours().toString().padStart(2, '0') + ':' + agora.getMinutes().toString().padStart(2, '0');

    waMockup.innerHTML = `
        <div class="wa-mockup-header">
            <div style="display: flex; align-items: center; gap: 8px;">
                <div class="wa-mockup-avatar">
                    <i data-lucide="message-square" style="width: 16px; height: 16px; color: white;"></i>
                </div>
                <div>
                    <h5 style="margin: 0; font-weight: 700; color: white; font-size: 13px;">Checkrest Alertas</h5>
                    <span style="font-size: 10px; color: rgba(255,255,255,0.8); display: block;">online</span>
                </div>
            </div>
            <button class="wa-mockup-close">&times;</button>
        </div>
        <div class="wa-mockup-body">
            <div class="wa-message-bubble">
                <div class="wa-message-text">${mensagemFormatada}</div>
                <span class="wa-message-time">${horaStr}</span>
            </div>
        </div>
    `;

    document.body.appendChild(waMockup);
    lucide.createIcons();

    waMockup.querySelector('.wa-mockup-close').addEventListener('click', () => {
        waMockup.classList.add('slide-down');
        setTimeout(() => waMockup.remove(), 300);
    });
}

function renderSupabasePane() {
    const pane = document.getElementById('pane-supabase');
    const creds = window.getSupabaseCreds();
    const isConfigured = window.isSupabaseConfigured();

    pane.innerHTML = `
        <div class="dashboard-actions-bar" style="margin-bottom: 20px">
            <span class="text-muted">Conecte o Checkrest a um banco de dados PostgreSQL na nuvem via Supabase</span>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1.2fr; gap:24px; align-items:flex-start">
            <div class="card" style="padding:24px">
                <h3 style="font-size:16px; font-weight:700; color:var(--text-main); margin-bottom:16px">Configurar Credenciais</h3>
                <form id="form-supabase-creds" style="display:flex; flex-direction:column; gap:16px">
                    <div class="form-group">
                        <label class="form-label">Supabase URL</label>
                        <input type="text" class="form-control" id="sb-url" placeholder="https://xxxx.supabase.co" value="${creds.url}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Supabase API Key (anon/public)</label>
                        <input type="password" class="form-control" id="sb-key" placeholder="eyJhbGciOi..." value="${creds.key}" required>
                    </div>
                    
                    <div id="connection-status-msg" style="margin-top:4px">
                        ${isConfigured ? 
                            `<span style="color:#10b981; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px"><i data-lucide="check-circle" style="width:16px"></i> Credenciais configuradas localmente.</span>` : 
                            `<span style="color:var(--text-muted); font-size:13px; display:flex; align-items:center; gap:6px"><i data-lucide="info" style="width:16px"></i> Nenhuma conexão ativa. Usando fallback LocalStorage.</span>`
                        }
                    </div>

                    <div style="display:flex; gap:12px; margin-top:8px">
                        <button type="submit" class="btn btn-primary" style="flex:1">Salvar</button>
                        <button type="button" class="btn btn-secondary" id="btn-test-connection" style="flex:1">Testar Conexão</button>
                    </div>
                </form>
            </div>

            <div class="card" style="padding:24px">
                <h3 style="font-size:16px; font-weight:700; color:var(--text-main); margin-bottom:16px">Preparar Banco de Dados</h3>
                <p style="font-size:13px; color:var(--text-muted); line-height:1.5; margin-bottom:16px">
                    Antes de salvar as credenciais, crie as tabelas necessárias no seu painel do Supabase. Vá em seu projeto, abra o <b>SQL Editor</b>, clique em <b>New Query</b>, cole o código abaixo e execute (clique em <b>Run</b>):
                </p>
                <div style="position:relative">
                    <pre style="background:#0b2420; color:#2EE6A8; padding:16px; border-radius:var(--radius-md); font-size:11px; overflow-x:auto; max-height:220px; border:1px solid rgba(46,230,168,0.2); font-family:monospace; margin:0"><code>-- Copie este SQL e execute no Supabase SQL Editor
CREATE TABLE IF NOT EXISTS unidades (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    sigla TEXT,
    city TEXT,
    uf TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    restricoes JSONB
);

CREATE TABLE IF NOT EXISTS setores (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    pin TEXT UNIQUE,
    gestor BOOLEAN DEFAULT false,
    setores TEXT[]
);

CREATE TABLE IF NOT EXISTS checklists (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    momento TEXT,
    setor_id TEXT REFERENCES setores(id),
    responsavel_id TEXT REFERENCES usuarios(id),
    unidade_id TEXT REFERENCES unidades(id),
    status BOOLEAN DEFAULT true,
    itens JSONB,
    agendamento JSONB,
    restricoes JSONB
);

CREATE TABLE IF NOT EXISTS execucoes (
    id TEXT PRIMARY KEY,
    checklist_id TEXT REFERENCES checklists(id),
    checklist_titulo TEXT,
    unidade_id TEXT REFERENCES unidades(id),
    unidade_nome TEXT,
    setor_id TEXT REFERENCES setores(id),
    setor_nome TEXT,
    momento TEXT,
    usuario_id TEXT REFERENCES usuarios(id),
    usuario_nome TEXT,
    data_agendamento TIMESTAMP WITH TIME ZONE,
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    situacao TEXT,
    duracao_segundos INTEGER,
    pontualidade NUMERIC,
    esforco NUMERIC,
    qualidade NUMERIC,
    score NUMERIC,
    respostas JSONB
);</code></pre>
                    <button class="btn btn-secondary" id="btn-copy-sql" style="position:absolute; top:8px; right:8px; padding:4px 8px; font-size:11px; background:rgba(255,255,255,0.1); border-color:transparent; color:#ffffff">Copiar</button>
                </div>

                <div id="seed-section" style="margin-top:20px; padding-top:20px; border-top:1px solid var(--border-color); display:${isConfigured ? 'block' : 'none'}">
                    <h4 style="font-size:14px; font-weight:700; color:var(--text-main); margin-bottom:8px">Popular Banco (Semear dados)</h4>
                    <p style="font-size:12px; color:var(--text-muted); line-height:1.4; margin-bottom:12px">
                        Se o seu banco do Supabase estiver vazio, clique no botão abaixo para carregar as filiais, usuários, checklists e histórico simulados iniciais diretamente no Supabase.
                    </p>
                    <button class="btn btn-secondary" id="btn-seed-supabase" style="width:100%; border-color:#0f766e; color:#0f766e; background:#e6fffa">
                        <i data-lucide="database" style="width:14px; margin-right:6px"></i> Semear Dados no Supabase
                    </button>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();

    // Eventos
    document.getElementById('form-supabase-creds').addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('sb-url').value.trim();
        const key = document.getElementById('sb-key').value.trim();
        
        localStorage.setItem('supabase_url', url);
        localStorage.setItem('supabase_anon_key', key);
        
        alert("Credenciais salvas com sucesso! A aplicação se reconectará automaticamente.");
        window.location.reload();
    });

    document.getElementById('btn-test-connection').addEventListener('click', async () => {
        const url = document.getElementById('sb-url').value.trim();
        const key = document.getElementById('sb-key').value.trim();
        const statusMsg = document.getElementById('connection-status-msg');
        
        if (!url || !key) {
            alert("Insira a URL e a API Key antes de testar!");
            return;
        }

        statusMsg.innerHTML = `<span style="color:var(--text-muted); font-size:13px; display:flex; align-items:center; gap:6px"><i data-lucide="loader" class="animate-spin" style="width:16px"></i> Testando conexão...</span>`;
        lucide.createIcons();

        try {
            if (typeof supabase === 'undefined') {
                throw new Error("SDK do Supabase não carregado. Verifique a conexão com a internet.");
            }
            const client = supabase.createClient(url, key);
            // Faz um select simples para testar
            const { data, error } = await client.from('unidades').select('count', { count: 'exact', head: true });
            
            if (error && error.code !== 'PGRST116') { // Ignora se a tabela não existir, pois indica que a conexão autenticou mas a tabela falta ser criada
                throw error;
            }

            statusMsg.innerHTML = `<span style="color:#10b981; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px"><i data-lucide="check-circle" style="width:16px"></i> Conexão estabelecida com sucesso!</span>`;
        } catch (err) {
            console.error(err);
            statusMsg.innerHTML = `<span style="color:var(--color-danger); font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px"><i data-lucide="x-circle" style="width:16px"></i> Falha na conexão: ${err.message || 'Erro desconhecido'}</span>`;
        }
        lucide.createIcons();
    });

    document.getElementById('btn-copy-sql').addEventListener('click', () => {
        const sqlText = document.querySelector('pre code').innerText;
        navigator.clipboard.writeText(sqlText).then(() => {
            alert("Código SQL copiado para a área de transferência!");
        });
    });

    const btnSeed = document.getElementById('btn-seed-supabase');
    if (btnSeed) {
        btnSeed.addEventListener('click', async () => {
            if (!confirm("Isso irá salvar os dados iniciais do localStorage no Supabase. Deseja continuar?")) return;
            
            btnSeed.disabled = true;
            btnSeed.innerHTML = `<i data-lucide="loader" class="animate-spin" style="width:14px; margin-right:6px"></i> Semeando dados...`;
            lucide.createIcons();
            
            try {
                const sucesso = await window.seedSupabaseData();
                if (sucesso) {
                    alert("Dados semeados no Supabase com sucesso!");
                } else {
                    alert("Ocorreu um erro durante a semeadura. Verifique se as tabelas foram criadas no SQL Editor.");
                }
            } catch (err) {
                alert("Falha na semeadura: " + err.message);
            }
            
            btnSeed.disabled = false;
            btnSeed.innerHTML = `<i data-lucide="database" style="width:14px; margin-right:6px"></i> Semear Dados no Supabase`;
            lucide.createIcons();
        });
    }
}

window.renderSettings = renderSettings;
