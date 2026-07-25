// Módulo Editor de Checklists (Visual Builder + Preview + Checkrest IA)

let checklistEditando = null;
let abaAtiva = 'itens';

function renderChecklistEditor(container, checklistId = null) {
    const db = window.getDb();
    abaAtiva = 'itens';

    if (checklistId) {
        const chkOriginal = db.checklists.find(c => c.id === checklistId);
        checklistEditando = JSON.parse(JSON.stringify(chkOriginal));
    } else {
        checklistEditando = {
            id: `chk-${Math.random().toString(36).substr(2, 9)}`,
            titulo: "Novo Checklist",
            momento: "Abertura",
            setorId: db.setores[0].id,
            responsavelId: db.usuarios[1].id,
            unidadeId: db.unidades[0].id,
            status: true,
            itens: [],
            agendamento: {
                recorrente: true,
                frequencia: "Diário",
                repetirACada: 1,
                horario: "08:00",
                dataInicio: new Date().toISOString().split('T')[0],
                dataTermino: "",
                excecoes: []
            },
            restricoes: { local: false, horario: false, ordem: false }
        };
    }

    container.innerHTML = `
        <div class="editor-grid">
            <div class="editor-builder-section">
                <div class="editor-nav-header">
                    <div class="editor-steps">
                        <button class="editor-step-btn active" id="btn-step-itens">Ver Itens</button>
                        <button class="editor-step-btn" id="btn-step-config">Configuração e Restrições</button>
                    </div>
                    <div style="display:flex; gap:8px">
                        <button class="btn btn-secondary" id="btn-editor-cancel">Cancelar</button>
                        <button class="btn btn-primary" id="btn-editor-save">Salvar Checklist</button>
                    </div>
                </div>
                
                <div class="editor-body-container" id="editor-step-content"></div>
            </div>

            <div class="editor-sidebar-section">
                <!-- Card do Checkrest Genius -->
                <div class="checkrest-ia-card genius-theme">
                    <div class="ia-title">
                        <i data-lucide="sparkles" class="icon-genius" style="color: #a78bfa;"></i>
                        <span class="genius-gradient-text" style="font-weight:800; background: linear-gradient(135deg, #a78bfa 0%, #2EE6A8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Checkrest Genius</span>
                    </div>
                    <p style="font-size: 11px; margin-bottom: 12px; opacity: 0.9; line-height: 1.3;">Seu assistente inteligente. Crie, refine ou adapte checklists em segundos.</p>
                    
                    <!-- Ações Rápidas -->
                    <div class="ia-quick-actions" style="margin-bottom: 16px;">
                        <span style="font-size: 9px; font-weight: 700; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Refinar Itens Existentes</span>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <button class="ia-pill-btn" id="btn-genius-desc" title="Melhorar descrições de todos os itens">
                                <i data-lucide="sparkles" style="width: 12px; height: 12px;"></i> Refinar Textos
                            </button>
                            <button class="ia-pill-btn" id="btn-genius-weight" title="Ajustar pesos e itens críticos de forma inteligente">
                                <i data-lucide="scale" style="width: 12px; height: 12px;"></i> Ajustar Pesos
                            </button>
                            <button class="ia-pill-btn" id="btn-genius-translate" title="Traduzir itens para inglês">
                                <i data-lucide="languages" style="width: 12px; height: 12px;"></i> Traduzir (EN)
                            </button>
                            <button class="ia-pill-btn" id="btn-genius-simplify" title="Simplificar linguagem das instruções">
                                <i data-lucide="zap" style="width: 12px; height: 12px;"></i> Simplificar
                            </button>
                        </div>
                    </div>

                    <!-- Input de Prompt Livre -->
                    <span style="font-size: 9px; font-weight: 700; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">Adicionar novos itens</span>
                    <div class="ia-input-container">
                        <input type="text" class="ia-input" id="ia-prompt-input" placeholder="Ex: Checklist de fechamento...">
                        <button class="ia-btn" id="btn-ia-generate" title="Gerar itens"><i data-lucide="send"></i></button>
                    </div>

                    <!-- Loader animado interno (escondido por padrão) -->
                    <div class="genius-loader" id="genius-loader" style="display: none; align-items: center; justify-content: center; gap: 10px; margin-top: 15px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                        <div class="genius-spinner" style="width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.1); border-top-color: #2EE6A8; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <span style="font-size: 11px; color: #cbd5e1; font-weight: 500;">Genius está trabalhando...</span>
                    </div>

                    <!-- Feedback de Alterações da IA (escondido por padrão) -->
                    <div class="ia-preview-box" id="genius-preview-box" style="display: none; margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.06); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                        <span style="font-size: 10px; font-weight: 700; color: #2EE6A8; display: block; margin-bottom: 4px;" id="genius-preview-title">Alterações do Genius</span>
                        <p style="font-size: 10px; color: #e2e8f0; margin-bottom: 8px; line-height: 1.3;" id="genius-preview-text"></p>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn btn-primary" id="btn-genius-apply" style="padding: 4px 8px; font-size: 10px; height: auto;">Aplicar</button>
                            <button class="btn btn-secondary" id="btn-genius-discard" style="padding: 4px 8px; font-size: 10px; height: auto; background: transparent; border-color: rgba(255,255,255,0.2); color: white;">Descartar</button>
                        </div>
                    </div>
                </div>

                <div style="flex:1; display:flex; flex-direction:column; justify-content:center">
                    <span class="app-section-title" style="text-align:center; margin-bottom:8px">Preview em Tempo Real</span>
                    <div class="mobile-phone-frame" style="height:480px; width:260px; border-width:8px; border-radius:24px">
                        <div class="mobile-phone-screen" style="padding-top:10px">
                            <div class="app-header" style="height:40px; font-size:11px; padding:0 12px">
                                <span id="preview-app-title">checkrest</span>
                                <i data-lucide="wifi" style="width:12px"></i>
                            </div>
                            <div class="app-body" style="padding:10px" id="preview-app-body"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const btnItens = document.getElementById('btn-step-itens');
    const btnConfig = document.getElementById('btn-step-config');

    btnItens.addEventListener('click', () => {
        btnItens.classList.add('active');
        btnConfig.classList.remove('active');
        abaAtiva = 'itens';
        renderizarCorpoEditor();
    });

    btnConfig.addEventListener('click', () => {
        btnConfig.classList.add('active');
        btnItens.classList.remove('active');
        abaAtiva = 'config';
        renderizarCorpoEditor();
    });

    document.getElementById('btn-editor-cancel').addEventListener('click', () => {
        window.location.hash = '#checklists';
    });
    document.getElementById('btn-editor-save').addEventListener('click', salvarChecklist);

    document.getElementById('btn-ia-generate').addEventListener('click', () => executarAcaoGenius('prompt'));
    document.getElementById('ia-prompt-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') executarAcaoGenius('prompt');
    });

    // Ações Rápidas Genius
    document.getElementById('btn-genius-desc').addEventListener('click', () => executarAcaoGenius('descricoes'));
    document.getElementById('btn-genius-weight').addEventListener('click', () => executarAcaoGenius('pesos'));
    document.getElementById('btn-genius-translate').addEventListener('click', () => executarAcaoGenius('traduzir'));
    document.getElementById('btn-genius-simplify').addEventListener('click', () => executarAcaoGenius('simplificar'));

    // Botões de Aplicação da Revisão
    document.getElementById('btn-genius-apply').addEventListener('click', aplicarAlteracoesGenius);
    document.getElementById('btn-genius-discard').addEventListener('click', descartarAlteracoesGenius);

    renderizarCorpoEditor();
}

function renderizarCorpoEditor() {
    const db = window.getDb();
    const container = document.getElementById('editor-step-content');
    
    if (abaAtiva === 'itens') {
        container.innerHTML = `
            <div class="form-group">
                <label class="form-label">Título do Checklist</label>
                <input type="text" class="form-control" id="edit-chk-title" value="${checklistEditando.titulo}" placeholder="Ex: Higiene Diária da Chapa">
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
                <span class="form-label" style="margin-bottom:0">Itens do Checklist</span>
                <span class="text-muted" style="font-size:12px" id="item-count-badge">${checklistEditando.itens.length} itens</span>
            </div>

            <div class="items-builder-list" id="items-builder-container"></div>

            <div class="builder-add-item-bar" id="btn-trigger-add-item">
                <i data-lucide="plus-circle" style="margin-right:8px"></i> Adicionar Item
            </div>
            
            <div class="add-item-dropdown-menu" id="add-item-dropdown" style="display:none">
                <button class="add-item-menu-btn" data-type="Check"><i data-lucide="check-square"></i> Check</button>
                <button class="add-item-menu-btn" data-type="Avaliativo"><i data-lucide="star"></i> Avaliativo</button>
                <button class="add-item-menu-btn" data-type="Texto"><i data-lucide="align-left"></i> Texto</button>
                <button class="add-item-menu-btn" data-type="Numérico"><i data-lucide="hash"></i> Numérico</button>
                <button class="add-item-menu-btn" data-type="Lista de Seleção"><i data-lucide="list"></i> Lista</button>
                <button class="add-item-menu-btn" data-type="GPS"><i data-lucide="map-pin"></i> GPS</button>
                <button class="add-item-menu-btn" data-type="Código de Barras/QR Code"><i data-lucide="qr-code"></i> Leitor QR</button>
                <button class="add-item-menu-btn" data-type="Separador (Sem interação)"><i data-lucide="minus"></i> Separador</button>
                <button class="add-item-menu-btn" data-type="Assinatura"><i data-lucide="pen-tool"></i> Assinatura</button>
            </div>
        `;

        document.getElementById('edit-chk-title').addEventListener('input', (e) => {
            checklistEditando.titulo = e.target.value;
            atualizarPreviewMobile();
        });

        const btnAddTrigger = document.getElementById('btn-trigger-add-item');
        const dropdown = document.getElementById('add-item-dropdown');
        btnAddTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'grid' : 'none';
        });

        document.addEventListener('click', () => {
            if (dropdown) dropdown.style.display = 'none';
        });

        dropdown.querySelectorAll('.add-item-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tipo = btn.getAttribute('data-type');
                adicionarItemVazio(tipo);
            });
        });

        renderizarItensBuilder();

    } else {
        container.innerHTML = `
            <div class="form-group-row" style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px">
                <div class="form-group">
                    <label class="form-label">Unidade</label>
                    <select class="form-control" id="edit-chk-unit">
                        ${db.unidades.map(u => `<option value="${u.id}" ${checklistEditando.unidadeId === u.id ? 'selected' : ''}>${u.nome}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Momento</label>
                    <select class="form-control" id="edit-chk-moment">
                        <option value="Abertura" ${checklistEditando.momento === 'Abertura' ? 'selected' : ''}>Abertura</option>
                        <option value="Fechamento" ${checklistEditando.momento === 'Fechamento' ? 'selected' : ''}>Fechamento</option>
                        <option value="Troca de turno" ${checklistEditando.momento === 'Troca de turno' ? 'selected' : ''}>Troca de turno</option>
                        <option value="Outros" ${checklistEditando.momento === 'Outros' ? 'selected' : ''}>Outros</option>
                    </select>
                </div>
            </div>

            <div class="form-group-row" style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px">
                <div class="form-group">
                    <label class="form-label">Setor</label>
                    <select class="form-control" id="edit-chk-sector">
                        ${db.setores.map(s => `<option value="${s.id}" ${checklistEditando.setorId === s.id ? 'selected' : ''}>${s.nome}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Responsável Execução</label>
                    <select class="form-control" id="edit-chk-user">
                        ${db.usuarios.map(u => `<option value="${u.id}" ${checklistEditando.responsavelId === u.id ? 'selected' : ''}>${u.nome} (${u.gestor ? 'Gestor' : 'Operador'})</option>`).join('')}
                    </select>
                </div>
            </div>

            <h4 style="margin-bottom:12px; font-weight:700">Agendamento e Recorrência</h4>
            <div class="card" style="margin-bottom:20px">
                <div class="form-group">
                    <label class="form-toggle">
                        <input type="checkbox" id="edit-chk-recurrent" ${checklistEditando.agendamento.recorrente ? 'checked' : ''}>
                        <span class="toggle-switch"></span>
                        <span class="form-label" style="margin-bottom:0">Checklist Recorrente?</span>
                    </label>
                </div>
                <div id="agendamento-detalhes-container" style="display:${checklistEditando.agendamento.recorrente ? 'block' : 'none'}">
                    <div class="form-control-row" style="margin-bottom:16px">
                        <div class="form-group" style="margin-bottom:0">
                            <label class="form-label">Frequência</label>
                            <select class="form-control" id="edit-chk-freq">
                                <option value="Diário" ${checklistEditando.agendamento.frequencia === 'Diário' ? 'selected' : ''}>Diário</option>
                                <option value="Semanal" ${checklistEditando.agendamento.frequencia === 'Semanal' ? 'selected' : ''}>Semanal</option>
                                <option value="Mensal" ${checklistEditando.agendamento.frequencia === 'Mensal' ? 'selected' : ''}>Mensal</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom:0">
                            <label class="form-label">Horário de Execução</label>
                            <input type="time" class="form-control" id="edit-chk-time" value="${checklistEditando.agendamento.horario}">
                        </div>
                    </div>
                </div>
            </div>

            <h4 style="margin-bottom:12px; font-weight:700">Restrições Operacionais (Geofencing / Janela)</h4>
            <div class="card" style="margin-bottom:20px; display:flex; flex-direction:column; gap:16px">
                <label class="form-toggle">
                    <input type="checkbox" class="restricao-toggle" data-key="local" ${checklistEditando.restricoes.local ? 'checked' : ''}>
                    <span class="toggle-switch"></span>
                    <span class="form-label" style="margin-bottom:0"><b>Restrição de Localização (GPS)</b><br><span class="text-muted" style="font-size:11px">Só executa se o operador estiver fisicamente na unidade.</span></span>
                </label>
                
                <label class="form-toggle">
                    <input type="checkbox" class="restricao-toggle" id="edit-chk-restricao-horario" data-key="horario" ${checklistEditando.restricoes.horario ? 'checked' : ''}>
                    <span class="toggle-switch"></span>
                    <span class="form-label" style="margin-bottom:0"><b>Restrição de Horário</b><br><span class="text-muted" style="font-size:11px">Exige execução dentro da janela programada (+/- tolerância).</span></span>
                </label>

                <!-- Configuração de Janela / Prazos Customizados -->
                <div id="restricao-horario-detalhes" style="display: ${checklistEditando.restricoes.horario ? 'block' : 'none'}; padding-left: 12px; border-left: 2px solid var(--border-color); margin-top: -4px; margin-bottom: 4px;">
                    <div class="form-group" style="margin-bottom:0">
                        <label class="form-toggle" style="font-size:12px">
                            <input type="checkbox" id="chk-use-unit-rules" ${checklistEditando.restricoes.respeitarPadraoUnidade !== false ? 'checked' : ''}>
                            <span class="toggle-switch"></span>
                            <span>Respeitar padrão de prazos da unidade</span>
                        </label>
                    </div>

                    <div id="chk-custom-rules-container" style="display: ${checklistEditando.restricoes.respeitarPadraoUnidade === false ? 'flex' : 'none'}; flex-direction:column; gap: 12px; margin-top: 12px;">
                        <div class="form-group" style="margin-bottom:0">
                            <label class="form-label" style="font-size:11px">Antecedência máxima</label>
                            <div style="display:flex; gap:8px">
                                <input type="number" class="form-control" id="edit-chk-antecedence-val" value="${checklistEditando.restricoes.antecedenciaValor !== undefined ? checklistEditando.restricoes.antecedenciaValor : (checklistEditando.restricoes.antecedenciaHoras !== undefined ? checklistEditando.restricoes.antecedenciaHoras : 12)}" min="0" style="padding:6px 10px; font-size:12px; flex:1">
                                <select class="form-control" id="edit-chk-antecedence-unit" style="width:100px; padding:6px; font-size:12px">
                                    <option value="horas" ${checklistEditando.restricoes.antecedenciaUnidade === 'horas' ? 'selected' : ''}>Horas</option>
                                    <option value="minutos" ${checklistEditando.restricoes.antecedenciaUnidade === 'minutos' ? 'selected' : ''}>Minutos</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom:0">
                            <label class="form-label" style="font-size:11px">Limite após o prazo</label>
                            <div style="display:flex; gap:8px">
                                <input type="number" class="form-control" id="edit-chk-limit-after-val" value="${checklistEditando.restricoes.limiteAtrasoValor !== undefined ? checklistEditando.restricoes.limiteAtrasoValor : (checklistEditando.restricoes.limiteAtrasoHoras !== undefined ? checklistEditando.restricoes.limiteAtrasoHoras : 12)}" min="0" style="padding:6px 10px; font-size:12px; flex:1">
                                <select class="form-control" id="edit-chk-limit-after-unit" style="width:100px; padding:6px; font-size:12px">
                                    <option value="horas" ${checklistEditando.restricoes.limiteAtrasoUnidade === 'horas' ? 'selected' : ''}>Horas</option>
                                    <option value="minutos" ${checklistEditando.restricoes.limiteAtrasoUnidade === 'minutos' ? 'selected' : ''}>Minutos</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <label class="form-toggle">
                    <input type="checkbox" class="restricao-toggle" data-key="ordem" ${checklistEditando.restricoes.ordem ? 'checked' : ''}>
                    <span class="toggle-switch"></span>
                    <span class="form-label" style="margin-bottom:0"><b>Restrição de Sequência</b><br><span class="text-muted" style="font-size:11px">Obriga o preenchimento dos itens na ordem exata definida.</span></span>
                </label>
            </div>
        `;

        document.getElementById('edit-chk-unit').addEventListener('change', (e) => checklistEditando.unidadeId = e.target.value);
        document.getElementById('edit-chk-moment').addEventListener('change', (e) => checklistEditando.momento = e.target.value);
        document.getElementById('edit-chk-sector').addEventListener('change', (e) => checklistEditando.setorId = e.target.value);
        document.getElementById('edit-chk-user').addEventListener('change', (e) => checklistEditando.responsavelId = e.target.value);
        
        const recurChkBx = document.getElementById('edit-chk-recurrent');
        recurChkBx.addEventListener('change', (e) => {
            checklistEditando.agendamento.recorrente = e.target.checked;
            document.getElementById('agendamento-detalhes-container').style.display = e.target.checked ? 'block' : 'none';
        });

        document.getElementById('edit-chk-freq').addEventListener('change', (e) => checklistEditando.agendamento.frequencia = e.target.value);
        document.getElementById('edit-chk-time').addEventListener('change', (e) => checklistEditando.agendamento.horario = e.target.value);

        container.querySelectorAll('.restricao-toggle').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const key = chk.getAttribute('data-key');
                checklistEditando.restricoes[key] = e.target.checked;
            });
        });

        const horarioChkBx = document.getElementById('edit-chk-restricao-horario');
        horarioChkBx.addEventListener('change', (e) => {
            document.getElementById('restricao-horario-detalhes').style.display = e.target.checked ? 'block' : 'none';
        });

        const useUnitRulesChkBx = document.getElementById('chk-use-unit-rules');
        useUnitRulesChkBx.addEventListener('change', (e) => {
            checklistEditando.restricoes.respeitarPadraoUnidade = e.target.checked;
            document.getElementById('chk-custom-rules-container').style.display = e.target.checked ? 'none' : 'flex';
        });

        const inputAntecedenceVal = document.getElementById('edit-chk-antecedence-val');
        const selectAntecedenceUnit = document.getElementById('edit-chk-antecedence-unit');
        const inputLimitAfterVal = document.getElementById('edit-chk-limit-after-val');
        const selectLimitAfterUnit = document.getElementById('edit-chk-limit-after-unit');
        
        if (inputAntecedenceVal) {
            inputAntecedenceVal.addEventListener('input', (e) => {
                checklistEditando.restricoes.antecedenciaValor = parseInt(e.target.value) || 0;
            });
        }
        if (selectAntecedenceUnit) {
            selectAntecedenceUnit.addEventListener('change', (e) => {
                checklistEditando.restricoes.antecedenciaUnidade = e.target.value;
            });
        }
        if (inputLimitAfterVal) {
            inputLimitAfterVal.addEventListener('input', (e) => {
                checklistEditando.restricoes.limiteAtrasoValor = parseInt(e.target.value) || 0;
            });
        }
        if (selectLimitAfterUnit) {
            selectLimitAfterUnit.addEventListener('change', (e) => {
                checklistEditando.restricoes.limiteAtrasoUnidade = e.target.value;
            });
        }
    }

    atualizarPreviewMobile();
    lucide.createIcons();
}

function renderizarItensBuilder() {
    const listContainer = document.getElementById('items-builder-container');
    if (checklistEditando.itens.length === 0) {
        listContainer.innerHTML = `<div style="text-align:center; padding:24px; color:var(--text-muted); font-size:13px">Sem itens cadastrados. Use o catálogo acima ou digite um prompt para o Checkrest IA.</div>`;
        return;
    }

    listContainer.innerHTML = checklistEditando.itens.map((item, idx) => `
        <div class="builder-item-card" data-idx="${idx}">
            <div class="builder-item-layout">
                <div class="builder-item-top">
                    <span class="builder-item-type-badge">${item.tipo}</span>
                    <input type="text" class="builder-item-title-input" data-field="titulo" data-idx="${idx}" value="${item.titulo}" placeholder="Título da tarefa/pergunta">
                    
                    <div style="display:flex; align-items:center; gap:4px">
                        <span class="text-muted" style="font-size:11px">Peso:</span>
                        <input type="number" min="0" max="10" class="form-control builder-item-weight" data-field="peso" data-idx="${idx}" value="${item.peso || 1}" style="padding: 4px 6px">
                    </div>

                    <div class="builder-item-actions">
                        <button class="builder-item-action-btn" data-btn-up="${idx}" ${idx === 0 ? 'disabled' : ''}><i data-lucide="chevron-up" style="width:14px"></i></button>
                        <button class="builder-item-action-btn" data-btn-down="${idx}" ${idx === checklistEditando.itens.length - 1 ? 'disabled' : ''}><i data-lucide="chevron-down" style="width:14px"></i></button>
                        <button class="builder-item-action-btn" data-btn-delete="${idx}" style="color:var(--color-danger)"><i data-lucide="trash" style="width:14px"></i></button>
                    </div>
                </div>

                <div class="builder-item-details">
                    <div class="form-group" style="margin-bottom:0">
                        <input type="text" class="form-control" data-field="descricao" data-idx="${idx}" value="${item.descricao || ''}" placeholder="Descreva brevemente a instrução..." style="font-size:12px; padding:6px 10px">
                    </div>
                    
                    <div class="builder-item-meta-row">
                        <label class="form-toggle" style="font-size:12px">
                            <input type="checkbox" data-field="obrigatorio" data-idx="${idx}" ${item.obrigatorio ? 'checked' : ''}>
                            <span class="toggle-switch"></span>
                            <span>Obrigatorio</span>
                        </label>
                        <label class="form-toggle" style="font-size:12px">
                            <input type="checkbox" data-field="critico" data-idx="${idx}" ${item.critico ? 'checked' : ''}>
                            <span class="toggle-switch"></span>
                            <span>Crítico</span>
                        </label>
                        <label class="form-toggle" style="font-size:12px">
                            <input type="checkbox" data-field="evidencia" data-idx="${idx}" ${item.evidência ? 'checked' : ''}>
                            <span class="toggle-switch"></span>
                            <span>Exigir Foto</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();

    listContainer.querySelectorAll('input[data-field]').forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = parseInt(input.getAttribute('data-idx'));
            const field = input.getAttribute('data-field');
            let val = e.target.value;
            if (field === 'peso') val = parseInt(val) || 0;
            checklistEditando.itens[idx][field] = val;
            atualizarPreviewMobile();
        });
    });

    listContainer.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const idx = parseInt(chk.getAttribute('data-idx'));
            const field = chk.getAttribute('data-field');
            checklistEditando.itens[idx][field] = e.target.checked;
            atualizarPreviewMobile();
        });
    });

    listContainer.querySelectorAll('button[data-btn-up]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-btn-up'));
            const temp = checklistEditando.itens[idx];
            checklistEditando.itens[idx] = checklistEditando.itens[idx - 1];
            checklistEditando.itens[idx - 1] = temp;
            renderizarItensBuilder();
        });
    });

    listContainer.querySelectorAll('button[data-btn-down]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-btn-down'));
            const temp = checklistEditando.itens[idx];
            checklistEditando.itens[idx] = checklistEditando.itens[idx + 1];
            checklistEditando.itens[idx + 1] = temp;
            renderizarItensBuilder();
        });
    });

    listContainer.querySelectorAll('button[data-btn-delete]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-btn-delete'));
            checklistEditando.itens.splice(idx, 1);
            renderizarItensBuilder();
        });
    });
}

function adicionarItemVazio(tipo) {
    checklistEditando.itens.push({
        id: `item-${Math.random().toString(36).substr(2, 9)}`,
        titulo: `Nova tarefa (${tipo})`,
        tipo: tipo,
        peso: 1,
        descricao: "",
        obrigatorio: true,
        critico: false,
        evidência: false
    });
    renderizarItensBuilder();
}

function atualizarPreviewMobile() {
    const titleEl = document.getElementById('preview-app-title');
    const bodyEl = document.getElementById('preview-app-body');

    if (!titleEl || !bodyEl) return;

    titleEl.textContent = checklistEditando.titulo.length > 18 
        ? checklistEditando.titulo.substr(0, 18) + '...' 
        : checklistEditando.titulo;

    if (checklistEditando.itens.length === 0) {
        bodyEl.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:16px">
                <i data-lucide="clipboard" style="width:32px; color:var(--text-light); margin-bottom:12px"></i>
                <span style="font-size:12px; color:var(--text-muted)">Sem itens para exibir no app.</span>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    bodyEl.innerHTML = `
        <div class="app-progress-bar-w" style="margin-bottom:12px"><div class="app-progress-bar-fill" style="width:30%"></div></div>
        <div style="display:flex; flex-direction:column; gap:10px; overflow-y:auto; flex:1">
            ${checklistEditando.itens.map((item, idx) => {
                let interacaoHtml = "";
                if (item.tipo === 'Check') {
                    interacaoHtml = `
                        <div style="display:flex; gap:8px">
                            <span class="app-check-btn negativo" style="padding:6px; font-size:11px">Não Feito</span>
                            <span class="app-check-btn positivo" style="padding:6px; font-size:11px">Feito</span>
                        </div>
                    `;
                } else if (item.tipo === 'Avaliativo') {
                    interacaoHtml = `
                        <div style="display:flex; gap:4px; justify-content:center">
                            ${'☆'.repeat(5)}
                        </div>
                    `;
                } else if (item.tipo === 'Numérico') {
                    interacaoHtml = `<input type="text" class="form-control" placeholder="Valor numérico" style="padding:4px 8px; font-size:11px" disabled>`;
                } else if (item.tipo === 'Texto') {
                    interacaoHtml = `<input type="text" class="form-control" placeholder="Resposta por texto" style="padding:4px 8px; font-size:11px" disabled>`;
                } else if (item.tipo === 'GPS') {
                    interacaoHtml = `
                        <div style="display:flex; align-items:center; gap:6px; font-size:11px; color:var(--color-info)">
                            <i data-lucide="map-pin" style="width:12px"></i> Obter Localização (GPS)
                        </div>
                    `;
                } else if (item.tipo === 'Assinatura') {
                    interacaoHtml = `
                        <div style="border:1px dashed var(--border-color); height:35px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-size:10px; color:var(--text-light)">
                            Desenhe sua assinatura aqui
                        </div>
                    `;
                }

                return `
                    <div class="card" style="padding:12px; margin-bottom:0; display:flex; flex-direction:column; gap:8px">
                        <div style="display:flex; justify-content:space-between">
                            <span style="font-weight:700; font-size:12px">${item.titulo}</span>
                            ${item.obrigatorio ? `<span style="color:var(--color-danger); font-size:12px">*</span>` : ''}
                        </div>
                        ${item.descricao ? `<span style="font-size:10px; color:var(--text-muted)">${item.descricao}</span>` : ''}
                        ${interacaoHtml}
                    </div>
                `;
            }).join('')}
        </div>
    `;

    lucide.createIcons();
}

let itensBackupGenius = null;

function executarAcaoGenius(tipo) {
    const db = window.getDb();
    const promptInput = document.getElementById('ia-prompt-input');
    const promptValue = promptInput ? promptInput.value.trim() : '';

    if (tipo === 'prompt' && !promptValue) {
        alert("Digite um prompt para o Checkrest Genius.");
        return;
    }

    if (checklistEditando.itens.length === 0 && tipo !== 'prompt') {
        alert("O checklist precisa ter itens para que o Genius possa editá-los. Adicione alguns itens primeiro ou use o prompt de geração.");
        return;
    }

    // Exibe o loader e esconde a caixa de preview
    const loader = document.getElementById('genius-loader');
    const previewBox = document.getElementById('genius-preview-box');
    if (loader) loader.style.display = 'flex';
    if (previewBox) previewBox.style.display = 'none';

    // Fazer backup dos itens atuais
    itensBackupGenius = JSON.parse(JSON.stringify(checklistEditando.itens));

    let novosItens = JSON.parse(JSON.stringify(checklistEditando.itens));
    let resumoTexto = "";
    let tituloBox = "";

    if (tipo === 'descricoes') {
        tituloBox = "✨ Descrições Refinadas";
        novosItens.forEach(item => {
            const tit = item.titulo.toLowerCase();
            if (tit.includes('temperatura') || tit.includes('freezer') || tit.includes('geladeira')) {
                item.descricao = "Medir a temperatura com termômetro calibrado e registrar no visor. Em caso de desvio (acima de -18°C para freezer, acima de 4°C para geladeira), acionar o gerente.";
            } else if (tit.includes('higiene') || tit.includes('higieniz') || tit.includes('limp') || tit.includes('chapa')) {
                item.descricao = "Realizar a higienização completa da área utilizando detergente neutro e sanitizante homologado. Não deixar resíduos de gordura ou sujidade.";
            } else if (tit.includes('caixa') || tit.includes('dinheiro') || tit.includes('valor')) {
                item.descricao = "Efetuar a contagem detalhada de todas as cédulas, moedas e comprovantes de cartão. Reportar qualquer divergência em relação ao fechamento do PDV.";
            } else if (tit.includes('foto') || tit.includes('evidênc')) {
                item.descricao = "Capturar foto nítida e em foco do local ou equipamento após a execução da atividade. Certificar-se de que a iluminação esteja adequada.";
            } else if (tit.includes('validade') || tit.includes('insumo') || tit.includes('etiquet')) {
                item.descricao = "Verificar se todas as embalagens abertas possuem etiqueta de validade preenchida. Descartar imediatamente produtos fora do prazo.";
            } else {
                item.descricao = "Verificar os padrões operacionais da unidade Bob's e garantir que os procedimentos estejam em total conformidade.";
            }
        });
        resumoTexto = `O Genius detalhou as instruções e descrições técnicas de ${novosItens.length} itens para garantir que a equipe siga o protocolo operacional correto no app.`;
    } 
    else if (tipo === 'pesos') {
        tituloBox = "⚖️ Pesos & Criticidades Calibrados";
        novosItens.forEach(item => {
            const tit = item.titulo.toLowerCase();
            if (tit.includes('temperatura') || tit.includes('freezer') || tit.includes('caixa') || tit.includes('dinheiro') || tit.includes('validade') || tit.includes('etiquet') || tit.includes('insumo')) {
                item.peso = 3;
                item.critico = true;
            } else if (tit.includes('limpeza') || tit.includes('limp') || tit.includes('organiza') || tit.includes('chapa') || tit.includes('óleo')) {
                item.peso = 2;
                item.critico = false;
            } else {
                item.peso = 1;
                item.critico = false;
            }
        });
        resumoTexto = `O Genius identificou tarefas vitais de segurança alimentar e financeira e as recalibrou como críticas (peso 3). As tarefas de organização ganharam peso 1 ou 2.`;
    } 
    else if (tipo === 'traduzir') {
        tituloBox = "🔄 Traduzido para Inglês";
        novosItens.forEach(item => {
            const tit = item.titulo.toLowerCase();
            if (tit.includes('higienização') || tit.includes('higiene')) {
                item.titulo = item.titulo.replace(/higienização/i, "Hygiene of").replace(/higiene/i, "Hygiene of");
            } else if (tit.includes('temperatura')) {
                item.titulo = item.titulo.replace(/temperatura/i, "Temperature");
            } else if (tit.includes('limpeza') || tit.includes('limpar')) {
                item.titulo = item.titulo.replace(/limpeza/i, "Cleaning").replace(/limpar/i, "Clean");
            } else if (tit.includes('registrar foto') || tit.includes('foto')) {
                item.titulo = item.titulo.replace(/registrar foto/i, "Take picture of").replace(/foto/i, "Picture of");
            } else if (tit.includes('validade')) {
                item.titulo = item.titulo.replace(/validade/i, "Expiration dates");
            } else if (tit.includes('fechamento de caixa')) {
                item.titulo = "Cash register closing";
            }
            
            if (item.descricao) {
                item.descricao = "Verify operational standards and ensure compliance with Bob's quality guidelines.";
            }
        });
        resumoTexto = `O Genius traduziu os títulos e descrições de ${novosItens.length} itens para inglês (EN-US), ideal para padronização internacional ou equipes bilíngues.`;
    }
    else if (tipo === 'simplificar') {
        tituloBox = "🪄 Linguagem Simplificada";
        novosItens.forEach(item => {
            if (item.titulo.startsWith("Higienização da") || item.titulo.startsWith("Higienização das")) {
                item.titulo = item.titulo.replace(/higienização da/i, "Higienizar").replace(/higienização das/i, "Higienizar");
            } else if (item.titulo.startsWith("Verificar a") || item.titulo.startsWith("Verificar o")) {
                item.titulo = item.titulo.replace(/verificar a/i, "Checar").replace(/verificar o/i, "Checar");
            } else if (item.titulo.startsWith("Registrar foto da") || item.titulo.startsWith("Registrar foto do")) {
                item.titulo = item.titulo.replace(/registrar foto da/i, "Fotografar").replace(/registrar foto do/i, "Fotografar");
            } else if (item.titulo.startsWith("Conferência física do") || item.titulo.startsWith("Conferência física da")) {
                item.titulo = item.titulo.replace(/conferência física do/i, "Conferir").replace(/conferência física da/i, "Conferir");
            }
            
            if (item.descricao && item.descricao.length > 20) {
                item.descricao = item.descricao.split('.')[0] + '.';
            }
        });
        resumoTexto = `O Genius encurtou os títulos e descrições para verbos no imperativo direto, facilitando a leitura rápida pelos operadores na correria do turno.`;
    }
    else if (tipo === 'prompt') {
        tituloBox = "✨ Itens Gerados por IA";
        const prompt = promptValue.toLowerCase();
        let itensGerados = [];

        if (prompt.includes('cozinha') || prompt.includes('alimento') || prompt.includes('chapa') || prompt.includes('fritura')) {
            itensGerados = [
                { id: `ia-${Math.random().toString(36).substr(2, 5)}`, titulo: "Verificar validade de molhos e insumos", tipo: "Check", peso: 2, descricao: "Todos os molhos abertos devem ter etiqueta de validade.", obrigatorio: true, critico: true },
                { id: `ia-${Math.random().toString(36).substr(2, 5)}`, titulo: "Temperatura da geladeira de laticínios (máx 4°C)", tipo: "Numérico", peso: 2, descricao: "Medir no visor frontal e registrar.", obrigatorio: true, critico: false },
                { id: `ia-${Math.random().toString(36).substr(2, 5)}`, titulo: "Registrar foto da chapa limpa", tipo: "Texto", peso: 1, descricao: "Tire uma foto nítida e descreva se há óleo acumulado.", obrigatorio: true, critico: false, evidência: true }
            ];
        } else if (prompt.includes('limpeza') || prompt.includes('higiene') || prompt.includes('salão') || prompt.includes('banheiro')) {
            itensGerados = [
                { id: `ia-${Math.random().toString(36).substr(2, 5)}`, titulo: "Limpeza das lixeiras e troca de sacos plásticos", tipo: "Check", peso: 1, descricao: "Lixeiras não devem passar de 80% da capacidade.", obrigatorio: true, critico: false },
                { id: `ia-${Math.random().toString(36).substr(2, 5)}`, titulo: "Satisfação visual da disposição das mesas", tipo: "Avaliativo", peso: 2, descricao: "Avalie visualmente o alinhamento das mesas do salão.", obrigatorio: true, critico: false },
                { id: `ia-${Math.random().toString(36).substr(2, 5)}`, titulo: "Limpeza de espelhos e pias dos banheiros", tipo: "Check", peso: 2, descricao: "Verificar marcas de dedos e sabão.", obrigatorio: false, critico: false }
            ];
        } else if (prompt.includes('caixa') || prompt.includes('financeiro') || prompt.includes('fechamento') || prompt.includes('venda')) {
            itensGerados = [
                { id: `ia-${Math.random().toString(36).substr(2, 5)}`, titulo: "Conferência física do fundo de troco (R$ 200,00)", tipo: "Check", peso: 3, descricao: "Confirmar se o valor do fundo está correto para o próximo turno.", obrigatorio: true, critico: true },
                { id: `ia-${Math.random().toString(36).substr(2, 5)}`, titulo: "Valor total das vendas em cartão declaradas", tipo: "Numérico", peso: 2, descricao: "Soma das vias das maquininhas de cartão.", obrigatorio: true, critico: false },
                { id: `ia-${Math.random().toString(36).substr(2, 5)}`, titulo: "Assinatura do fiscal de caixa", tipo: "Assinatura", peso: 2, descricao: "Responsável pelo encerramento de caixa.", obrigatorio: true, critico: false }
            ];
        } else {
            itensGerados = [
                { id: `ia-${Math.random().toString(36).substr(2, 5)}`, titulo: "Conferir funcionamento das lâmpadas e iluminação", tipo: "Check", peso: 1, descricao: "Substituir lâmpadas queimadas se necessário.", obrigatorio: false, critico: false },
                { id: `ia-${Math.random().toString(36).substr(2, 5)}`, titulo: "Organização geral das prateleiras", tipo: "Avaliativo", peso: 2, descricao: "Como está a arrumação visual?", obrigatorio: true, critico: false },
                { id: `ia-${Math.random().toString(36).substr(2, 5)}`, titulo: "Registrar foto do local de trabalho ao finalizar", tipo: "Texto", peso: 1, descricao: "Evidência da organização final.", obrigatorio: true, critico: false, evidência: true }
            ];
        }

        novosItens = [...novosItens, ...itensGerados];
        resumoTexto = `O Genius gerou e inseriu ${itensGerados.length} itens sobre "${promptValue}" no final do seu checklist.`;
        if (promptInput) promptInput.value = "";
    }

    // Simular o delay de processamento da IA
    setTimeout(() => {
        if (loader) loader.style.display = 'none';
        
        checklistEditando.itens = novosItens;
        
        if (abaAtiva === 'itens') {
            renderizarItensBuilder();
        } else {
            renderizarCorpoEditor();
        }
        atualizarPreviewMobile();

        if (previewBox) {
            const titleEl = document.getElementById('genius-preview-title');
            const textEl = document.getElementById('genius-preview-text');
            if (titleEl) titleEl.textContent = tituloBox;
            if (textEl) textEl.textContent = resumoTexto;
            previewBox.style.display = 'block';
        }
    }, 1200);
}

function aplicarAlteracoesGenius() {
    const previewBox = document.getElementById('genius-preview-box');
    if (previewBox) previewBox.style.display = 'none';
    itensBackupGenius = null;
    alert("Alterações sugeridas pelo Genius aplicadas com sucesso!");
}

function descartarAlteracoesGenius() {
    const previewBox = document.getElementById('genius-preview-box');
    if (previewBox) previewBox.style.display = 'none';
    
    if (itensBackupGenius) {
        checklistEditando.itens = itensBackupGenius;
        itensBackupGenius = null;
        
        if (abaAtiva === 'itens') {
            renderizarItensBuilder();
        } else {
            renderizarCorpoEditor();
        }
        atualizarPreviewMobile();
        alert("Alterações do Genius descartadas. O checklist foi restaurado.");
    }
}

function salvarChecklist() {
    if (!checklistEditando.titulo.trim()) {
        alert("O checklist precisa de um título.");
        return;
    }

    const db = window.getDb();
    const index = db.checklists.findIndex(c => c.id === checklistEditando.id);
    
    if (index >= 0) {
        db.checklists[index] = checklistEditando;
    } else {
        db.checklists.push(checklistEditando);
    }

    window.saveDb(db);
    alert(`Checklist "${checklistEditando.titulo}" salvo com sucesso!`);
    window.location.hash = '#checklists';
}

window.renderChecklistEditor = renderChecklistEditor;
