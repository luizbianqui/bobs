// Módulo de Customização do Dashboard (Layouts e Widgets)

function initDashboardCustomizer(layoutAtual, onSaveCallback) {
    const overlay = document.getElementById('custom-drawer-overlay');
    const drawer = document.getElementById('custom-drawer');
    const body = document.getElementById('custom-drawer-body');

    let layoutEdit = JSON.parse(JSON.stringify(layoutAtual));

    // Garante que o layout contenha todos os widgets no array de edição, mesmo os inativos
    const CATALOGO_WIDGETS = [
        { id: 'w-situacao-geral', titulo: 'Situação Geral', categoria: 'Situação Operacional', icone: 'layout-grid' },
        { id: 'w-taxa-conclusao', titulo: 'Taxa de Conclusão', categoria: 'Situação Operacional', icone: 'clock' },
        { id: 'w-alertas', titulo: 'Alertas de Pendência', categoria: 'Situação Operacional', icone: 'alert-triangle' },
        { id: 'w-kpis-medios', titulo: 'KPIs Médios', categoria: 'Desempenho (KPIs)', icone: 'gauge' },
        { id: 'w-evolucao', titulo: 'Evolução de Desempenho', categoria: 'Desempenho (KPIs)', icone: 'trending-up' },
        { id: 'w-mapa-calor', titulo: 'Mapa de Calor Diário', categoria: 'Desempenho (KPIs)', icone: 'grid' },
        { id: 'w-comparativo-semana', titulo: 'Comparativo por Dia da Semana', categoria: 'Desempenho (KPIs)', icone: 'calendar' },
        { id: 'w-ranking-usuarios', titulo: 'Ranking de Usuários', categoria: 'Rankings', icone: 'users' },
        { id: 'w-ranking-unidades', titulo: 'Ranking de Unidades', categoria: 'Rankings', icone: 'building' },
        { id: 'w-ranking-setores', titulo: 'Ranking de Setores', categoria: 'Rankings', icone: 'layers' },
        { id: 'w-ranking-checklists', titulo: 'Ranking de Checklists', categoria: 'Rankings', icone: 'clipboard-list' }
    ];

    // Sincroniza layoutEdit.widgets com CATALOGO_WIDGETS para garantir integridade
    CATALOGO_WIDGETS.forEach(catW => {
        const existe = layoutEdit.widgets.find(w => w.id === catW.id);
        if (!existe) {
            layoutEdit.widgets.push({
                id: catW.id,
                titulo: catW.titulo,
                largura: catW.id === 'w-situacao-geral' || catW.id === 'w-evolucao' ? 'col-4' : (catW.id === 'w-taxa-conclusao' ? 'col-1' : 'col-2'),
                ativo: false
            });
        }
    });

    function renderizarForm() {
        const widgetsAtivos = layoutEdit.widgets.filter(w => w.ativo);
        const categorias = [...new Set(CATALOGO_WIDGETS.map(w => w.categoria))];

        body.innerHTML = `
            <!-- Predefinições -->
            <div style="margin-bottom: 24px">
                <div class="customizer-section-title">Predefinições</div>
                <div class="preset-grid-custom">
                    <div class="preset-card-custom ${layoutEdit.predeterminacao === 'Padrão' ? 'active' : ''}" data-preset="Padrão">
                        <div class="preset-card-icon-wrapper"><i data-lucide="layout-grid"></i></div>
                        <div class="preset-card-info">
                            <span class="preset-card-title-custom">Padrão</span>
                            <span class="preset-card-desc-custom">Visão geral essencial...</span>
                        </div>
                    </div>
                    <div class="preset-card-custom ${layoutEdit.predeterminacao === 'Operacional' ? 'active' : ''}" data-preset="Operacional">
                        <div class="preset-card-icon-wrapper"><i data-lucide="target"></i></div>
                        <div class="preset-card-info">
                            <span class="preset-card-title-custom">Operacional</span>
                            <span class="preset-card-desc-custom">Foco no dia a dia...</span>
                        </div>
                    </div>
                    <div class="preset-card-custom ${layoutEdit.predeterminacao === 'Estratégico' ? 'active' : ''}" data-preset="Estratégico">
                        <div class="preset-card-icon-wrapper"><i data-lucide="trending-up"></i></div>
                        <div class="preset-card-info">
                            <span class="preset-card-title-custom">Estratégico</span>
                            <span class="preset-card-desc-custom">Tendências e KPIs...</span>
                        </div>
                    </div>
                    <div class="preset-card-custom ${layoutEdit.predeterminacao === 'Multi-Unidades' ? 'active' : ''}" data-preset="Multi-Unidades">
                        <div class="preset-card-icon-wrapper"><i data-lucide="building"></i></div>
                        <div class="preset-card-info">
                            <span class="preset-card-title-custom">Multi-Unidades</span>
                            <span class="preset-card-desc-custom">Comparação unidades...</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Widgets Ativos -->
            <div style="margin-bottom: 24px">
                <div class="customizer-section-title">Widgets ativos (${widgetsAtivos.length})</div>
                <div style="display:flex; flex-direction:column; gap:8px" id="customizer-widgets-list">
                    ${widgetsAtivos.map((w, idx) => {
                        const catInfo = CATALOGO_WIDGETS.find(cw => cw.id === w.id);
                        const icone = catInfo ? catInfo.icone : 'layout';
                        const originalIdx = layoutEdit.widgets.findIndex(origW => origW.id === w.id);
                        
                        return `
                            <div class="active-widget-card">
                                <div class="active-widget-left">
                                    <div class="active-widget-grip"><i data-lucide="grip-vertical" style="width:14px; height:14px;"></i></div>
                                    <div class="active-widget-icon"><i data-lucide="${icone}" style="width:16px; height:16px;"></i></div>
                                    <span class="active-widget-title">${w.titulo}</span>
                                </div>
                                <div class="active-widget-right">
                                    <span class="active-widget-col-label" title="Clique para alternar a largura" style="cursor:pointer; background:#f1f5f9; padding:4px 8px; border-radius:4px;" data-change-width="${w.id}">
                                        ${w.largura.replace('col-', '')}col
                                    </span>
                                    <div style="display:flex; flex-direction:column; gap:2px;">
                                        <button class="builder-item-action-btn" data-move-up="${originalIdx}" ${idx === 0 ? 'disabled' : ''} style="padding:1px; border:none; background:none; cursor:pointer;">
                                            <i data-lucide="chevron-up" style="width:12px; height:12px;"></i>
                                        </button>
                                        <button class="builder-item-action-btn" data-move-down="${originalIdx}" ${idx === widgetsAtivos.length - 1 ? 'disabled' : ''} style="padding:1px; border:none; background:none; cursor:pointer;">
                                            <i data-lucide="chevron-down" style="width:12px; height:12px;"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- Catálogo de Widgets -->
            <div style="margin-bottom: 24px">
                <div class="customizer-section-title">Catálogo de widgets</div>
                <div>
                    ${categorias.map(cat => `
                        <div class="catalogo-category-title">${cat}</div>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${CATALOGO_WIDGETS.filter(w => w.categoria === cat).map(catW => {
                                const widgetObj = layoutEdit.widgets.find(w => w.id === catW.id);
                                const isAtivo = widgetObj ? widgetObj.ativo : false;
                                return `
                                    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f1f5f9;">
                                        <div style="display:flex; align-items:center; gap:10px;">
                                            <i data-lucide="${catW.icone}" style="width:16px; height:16px; color:var(--text-muted);"></i>
                                            <span style="font-size:13px; font-weight:600; color:var(--text-main);">${catW.titulo}</span>
                                        </div>
                                        <label class="form-toggle" style="margin-bottom:0;">
                                            <input type="checkbox" class="widget-toggle-checkbox" data-widget-id="${catW.id}" ${isAtivo ? 'checked' : ''}>
                                            <span class="toggle-switch"></span>
                                        </label>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>

            <button class="btn btn-primary" id="btn-save-customizer" style="width:100%; padding:12px; font-weight:600; border-radius:var(--radius-md); font-size:14px; cursor:pointer;">
                Salvar Alterações
            </button>
        `;

        lucide.createIcons();

        // Preset clicado
        body.querySelectorAll('.preset-card-custom').forEach(card => {
            card.addEventListener('click', () => {
                const preset = card.getAttribute('data-preset');
                aplicarPreset(preset);
            });
        });

        // Alternar largura de forma cíclica
        body.querySelectorAll('[data-change-width]').forEach(el => {
            el.addEventListener('click', () => {
                const wId = el.getAttribute('data-change-width');
                const widgetObj = layoutEdit.widgets.find(w => w.id === wId);
                if (widgetObj) {
                    if (widgetObj.largura === 'col-1') widgetObj.largura = 'col-2';
                    else if (widgetObj.largura === 'col-2') widgetObj.largura = 'col-4';
                    else widgetObj.largura = 'col-1';
                }
                layoutEdit.predeterminacao = 'Customizado';
                renderizarForm();
            });
        });

        // Reordenação
        body.querySelectorAll('button[data-move-up]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-move-up'));
                if (idx > 0) {
                    const temp = layoutEdit.widgets[idx];
                    layoutEdit.widgets[idx] = layoutEdit.widgets[idx - 1];
                    layoutEdit.widgets[idx - 1] = temp;
                    renderizarForm();
                }
            });
        });

        body.querySelectorAll('button[data-move-down]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-move-down'));
                if (idx < layoutEdit.widgets.length - 1) {
                    const temp = layoutEdit.widgets[idx];
                    layoutEdit.widgets[idx] = layoutEdit.widgets[idx + 1];
                    layoutEdit.widgets[idx + 1] = temp;
                    renderizarForm();
                }
            });
        });

        // Toggles checkbox
        body.querySelectorAll('.widget-toggle-checkbox').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const wId = chk.getAttribute('data-widget-id');
                const widgetObj = layoutEdit.widgets.find(w => w.id === wId);
                if (widgetObj) {
                    widgetObj.ativo = e.target.checked;
                }
                layoutEdit.predeterminacao = 'Customizado';
                renderizarForm();
            });
        });

        // Botão Salvar
        document.getElementById('btn-save-customizer').addEventListener('click', () => {
            onSaveCallback(layoutEdit);
            fecharGaveta();
        });
    }

    function aplicarPreset(preset) {
        layoutEdit.predeterminacao = preset;
        if (preset === 'Padrão') {
            layoutEdit.widgets = [
                { id: 'w-situacao-geral', titulo: 'Situação Geral', largura: 'col-4', ativo: true },
                { id: 'w-taxa-conclusao', titulo: 'Taxa de Conclusão', largura: 'col-1', ativo: true },
                { id: 'w-ranking-usuarios', titulo: 'Ranking de Usuários', largura: 'col-1', ativo: true },
                { id: 'w-ranking-unidades', titulo: 'Ranking de Unidades', largura: 'col-1', ativo: true },
                { id: 'w-ranking-setores', titulo: 'Ranking de Setores', largura: 'col-1', ativo: true },
                { id: 'w-evolucao', titulo: 'Evolução de Desempenho', largura: 'col-4', ativo: true },
                { id: 'w-kpis-medios', titulo: 'KPIs Médios', largura: 'col-2', ativo: true },
                { id: 'w-ranking-checklists', titulo: 'Ranking de Checklists', largura: 'col-2', ativo: true },
                { id: 'w-mapa-calor', titulo: 'Mapa de Calor Diário', largura: 'col-2', ativo: true },
                { id: 'w-comparativo-semana', titulo: 'Comparativo por Dia da Semana', largura: 'col-2', ativo: true },
                { id: 'w-alertas', titulo: 'Alertas de Pendência', largura: 'col-2', ativo: false }
            ];
        } else if (preset === 'Operacional') {
            layoutEdit.widgets = [
                { id: 'w-situacao-geral', titulo: 'Situação Geral', largura: 'col-4', ativo: true },
                { id: 'w-taxa-conclusao', titulo: 'Taxa de Conclusão', largura: 'col-2', ativo: true },
                { id: 'w-alertas', titulo: 'Alertas de Pendência', largura: 'col-2', ativo: true },
                { id: 'w-ranking-usuarios', titulo: 'Ranking de Usuários', largura: 'col-4', ativo: true }
            ];
        } else if (preset === 'Estratégico') {
            layoutEdit.widgets = [
                { id: 'w-evolucao', titulo: 'Evolução de Desempenho', largura: 'col-4', ativo: true },
                { id: 'w-kpis-medios', titulo: 'KPIs Médios', largura: 'col-4', ativo: true },
                { id: 'w-ranking-unidades', titulo: 'Ranking de Unidades', largura: 'col-2', ativo: true },
                { id: 'w-ranking-usuarios', titulo: 'Ranking de Usuários', largura: 'col-2', ativo: true }
            ];
        } else if (preset === 'Multi-Unidades') {
            layoutEdit.widgets = [
                { id: 'w-ranking-unidades', titulo: 'Ranking de Unidades', largura: 'col-4', ativo: true },
                { id: 'w-taxa-conclusao', titulo: 'Taxa de Conclusão', largura: 'col-2', ativo: true },
                { id: 'w-ranking-usuarios', titulo: 'Ranking de Usuários', largura: 'col-2', ativo: true }
            ];
        }
        renderizarForm();
    }

    function fecharGaveta() {
        overlay.classList.remove('active');
        drawer.classList.remove('active');
    }

    document.getElementById('btn-close-custom-drawer').addEventListener('click', fecharGaveta);
    overlay.addEventListener('click', fecharGaveta);

    overlay.classList.add('active');
    drawer.classList.add('active');
    
    renderizarForm();
}

window.initDashboardCustomizer = initDashboardCustomizer;
