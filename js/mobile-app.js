// Módulo Simulador App Mobile Checkrest 360

// Função de Haversine para calcular a distância entre duas coordenadas em metros
function calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Raio da Terra em metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distância em metros
}
window.calcularDistanciaMetros = calcularDistanciaMetros;

let operadorLogado = null;
let checklistAtivo = null;
let itemIndiceAtivo = 0;
let respostasTemporarias = {};
let pinDigitado = "";
let gpsCapturado = null;
let horaInicioExecucao = null;

function renderMobileApp(container) {
    operadorLogado = null;
    checklistAtivo = null;
    pinDigitado = "";
    respostasTemporarias = {};
    gpsCapturado = null;

    container.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; min-height: calc(100vh - 180px);">
            <div class="mobile-phone-frame">
                <div class="mobile-phone-screen" id="mobile-screen-container"></div>
            </div>
        </div>
    `;

    renderizarTelaPIN();
}

function renderizarTelaPIN() {
    pinDigitado = "";
    const container = document.getElementById('mobile-screen-container');
    
    container.innerHTML = `
        <div class="pin-screen-container">
            <div class="pin-logo">C</div>
            <span class="pin-title">checkrest 360</span>
            <span class="pin-subtitle">Insira seu PIN de 5 dígitos para troca rápida</span>
            
            <div class="pin-dots">
                <div class="pin-dot" id="dot-0"></div>
                <div class="pin-dot" id="dot-1"></div>
                <div class="pin-dot" id="dot-2"></div>
                <div class="pin-dot" id="dot-3"></div>
                <div class="pin-dot" id="dot-4"></div>
            </div>

            <div class="pin-keyboard">
                <button class="pin-key num-key" data-val="1">1</button>
                <button class="pin-key num-key" data-val="2">2</button>
                <button class="pin-key num-key" data-val="3">3</button>
                <button class="pin-key num-key" data-val="4">4</button>
                <button class="pin-key num-key" data-val="5">5</button>
                <button class="pin-key num-key" data-val="6">6</button>
                <button class="pin-key num-key" data-val="7">7</button>
                <button class="pin-key num-key" data-val="8">8</button>
                <button class="pin-key num-key" data-val="9">9</button>
                <button class="pin-key action-key" id="btn-pin-clear">Limpar</button>
                <button class="pin-key num-key" data-val="0">0</button>
                <button class="pin-key action-key" id="btn-pin-exit"><i data-lucide="log-out" style="width:18px"></i></button>
            </div>
        </div>
    `;

    lucide.createIcons();

    container.querySelectorAll('.num-key').forEach(key => {
        key.addEventListener('click', () => {
            if (pinDigitado.length < 5) {
                const val = key.getAttribute('data-val');
                pinDigitado += val;
                atualizarBolinhasPIN();
                
                if (pinDigitado.length === 5) {
                    setTimeout(verificarPIN, 250);
                }
            }
        });
    });

    document.getElementById('btn-pin-clear').addEventListener('click', () => {
        pinDigitado = "";
        atualizarBolinhasPIN();
    });

    document.getElementById('btn-pin-exit').addEventListener('click', () => {
        window.location.hash = '#dashboard';
    });
}

function atualizarBolinhasPIN() {
    for (let i = 0; i < 5; i++) {
        const dot = document.getElementById(`dot-${i}`);
        if (i < pinDigitado.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    }
}

function verificarPIN() {
    const db = window.getDb();
    const usuario = db.usuarios.find(u => u.pin === pinDigitado);

    if (usuario) {
        operadorLogado = usuario;
        renderizarTelaChecklists();
    } else {
        alert("PIN incorreto! Tente usar PINs cadastrados nas Configurações (Ex: 12345, 54321).");
        pinDigitado = "";
        atualizarBolinhasPIN();
    }
}

function obterLimitesJanela(chk, db) {
    const unidade = db.unidades.find(u => u.id === chk.unidadeId) || db.unidades[0];
    
    let antecedenciaValor = 12;
    let antecedenciaUnidade = "horas";
    let limiteAtrasoValor = 12;
    let limiteAtrasoUnidade = "horas";
    
    if (chk.restricoes && chk.restricoes.respeitarPadraoUnidade === false) {
        antecedenciaValor = chk.restricoes.antecedenciaValor !== undefined 
            ? chk.restricoes.antecedenciaValor 
            : (chk.restricoes.antecedenciaHoras !== undefined ? chk.restricoes.antecedenciaHoras : 12);
        antecedenciaUnidade = chk.restricoes.antecedenciaUnidade || "horas";
        
        limiteAtrasoValor = chk.restricoes.limiteAtrasoValor !== undefined 
            ? chk.restricoes.limiteAtrasoValor 
            : (chk.restricoes.limiteAtrasoHoras !== undefined ? chk.restricoes.limiteAtrasoHoras : 12);
        limiteAtrasoUnidade = chk.restricoes.limiteAtrasoUnidade || "horas";
    } else if (unidade && unidade.restricoes) {
        antecedenciaValor = unidade.restricoes.antecedenciaValor !== undefined 
            ? unidade.restricoes.antecedenciaValor 
            : (unidade.restricoes.antecedenciaHoras !== undefined ? unidade.restricoes.antecedenciaHoras : 12);
        antecedenciaUnidade = unidade.restricoes.antecedenciaUnidade || "horas";
        
        limiteAtrasoValor = unidade.restricoes.limiteAtrasoValor !== undefined 
            ? unidade.restricoes.limiteAtrasoValor 
            : (unidade.restricoes.limiteAtrasoHoras !== undefined ? unidade.restricoes.limiteAtrasoHoras : 12);
        limiteAtrasoUnidade = unidade.restricoes.limiteAtrasoUnidade || "horas";
    }
    
    return { antecedenciaValor, antecedenciaUnidade, limiteAtrasoValor, limiteAtrasoUnidade };
}

function verificarStatusJanela(chk, db) {
    if (!chk.restricoes || !chk.restricoes.horario) {
        return { liberado: true };
    }
    
    const { antecedenciaValor, antecedenciaUnidade, limiteAtrasoValor, limiteAtrasoUnidade } = obterLimitesJanela(chk, db);
    const agora = new Date();
    
    const [horaAgend, minAgend] = chk.agendamento.horario.split(':').map(Number);
    const dataAgend = new Date(agora);
    dataAgend.setHours(horaAgend, minAgend, 0, 0);
    
    const dataInicioPermitido = new Date(dataAgend);
    if (antecedenciaUnidade === 'minutos') {
        dataInicioPermitido.setMinutes(dataInicioPermitido.getMinutes() - antecedenciaValor);
    } else {
        dataInicioPermitido.setHours(dataInicioPermitido.getHours() - antecedenciaValor);
    }
    
    const dataFimPermitido = new Date(dataAgend);
    if (limiteAtrasoUnidade === 'minutos') {
        dataFimPermitido.setMinutes(dataFimPermitido.getMinutes() + limiteAtrasoValor);
    } else {
        dataFimPermitido.setHours(dataFimPermitido.getHours() + limiteAtrasoValor);
    }
    
    const liberado = (agora >= dataInicioPermitido && agora <= dataFimPermitido);
    
    const formatTime = (d) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return {
        liberado,
        inicioFormatado: formatTime(dataInicioPermitido),
        fimFormatado: formatTime(dataFimPermitido),
        foraAntecedencia: agora < dataInicioPermitido,
        foraAtraso: agora > dataFimPermitido
    };
}

function renderizarTelaChecklists() {
    const container = document.getElementById('mobile-screen-container');
    const db = window.getDb();

    const checklistsOperador = db.checklists.filter(chk => {
        if (!chk.status) return false;
        return operadorLogado.setores.includes(chk.setorId);
    });

    container.innerHTML = `
        <div class="app-header">
            <span>checkrest 360</span>
            <button id="btn-app-logout" style="background:none; border:none; color:white; cursor:pointer"><i data-lucide="log-out" style="width:16px"></i></button>
        </div>
        <div class="app-body">
            <div style="margin-bottom: 20px">
                <h4 style="font-weight:700">Olá, ${operadorLogado.nome}</h4>
                <span class="text-muted" style="font-size:12px">Estes são seus checklists agendados para hoje:</span>
            </div>

            <div class="app-checklists-list">
                ${checklistsOperador.map(chk => {
                    const setor = db.setores.find(s => s.id === chk.setorId);
                    const unidade = db.unidades.find(u => u.id === chk.unidadeId);
                    const status = verificarStatusJanela(chk, db);
                    
                    let cardStyle = "";
                    let lockIcon = '<i data-lucide="chevron-right" style="color:var(--text-light); width:18px"></i>';
                    let statusLabel = `<span class="app-checklist-meta" style="color:var(--color-primary-hover)">Momento: ${chk.momento} | Execução: ${chk.agendamento.horario}</span>`;
                    
                    if (!status.liberado) {
                        cardStyle = "opacity: 0.65; cursor: not-allowed; border-left: 3px solid var(--color-danger); background: #f8fafc;";
                        lockIcon = '<i data-lucide="lock" style="color:var(--color-danger); width:16px"></i>';
                        statusLabel = `
                            <span class="app-checklist-meta" style="color:var(--color-danger); font-weight:700; display:flex; align-items:center; gap:4px; margin-top:2px;">
                                ⚠️ Bloqueado (Permitido: ${status.inicioFormatado} às ${status.fimFormatado})
                            </span>
                        `;
                    }
                    
                    return `
                        <div class="app-checklist-card" data-chk-id="${chk.id}" style="${cardStyle}">
                            <div class="app-checklist-info">
                                <span class="app-checklist-title">${chk.titulo}</span>
                                <span class="app-checklist-meta">${unidade ? unidade.nome : 'Unidade'} • Setor: ${setor ? setor.nome : 'Geral'}</span>
                                ${statusLabel}
                            </div>
                            ${lockIcon}
                        </div>
                    `;
                }).join('')}
                
                ${checklistsOperador.length === 0 ? `
                    <div style="text-align:center; padding:32px 16px; color:var(--text-muted)">
                        <i data-lucide="smile" style="width:36px; margin-bottom:12px"></i>
                        <p style="font-size:13px">Nenhum checklist agendado para seus setores no momento.</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    lucide.createIcons();

    document.getElementById('btn-app-logout').addEventListener('click', renderizarTelaPIN);

    container.querySelectorAll('.app-checklist-card').forEach(card => {
        card.addEventListener('click', () => {
            const chkId = card.getAttribute('data-chk-id');
            const targetChk = db.checklists.find(c => c.id === chkId);
            if (targetChk) {
                const status = verificarStatusJanela(targetChk, db);
                if (!status.liberado) {
                    alert(`Este checklist está bloqueado! O horário permitido de execução para hoje é de ${status.inicioFormatado} às ${status.fimFormatado}.`);
                    return;
                }
                iniciarExecucaoChecklist(targetChk);
            }
        });
    });
}

function iniciarExecucaoChecklist(chk) {
    checklistAtivo = chk;
    itemIndiceAtivo = 0;
    respostasTemporarias = {};
    gpsCapturado = null;
    horaInicioExecucao = new Date();

    renderizarPassoItem();
}

function renderizarPassoItem() {
    const container = document.getElementById('mobile-screen-container');
    const item = checklistAtivo.itens[itemIndiceAtivo];
    const totalItens = checklistAtivo.itens.length;
    const progressoPercent = Math.round(((itemIndiceAtivo) / totalItens) * 100);

    if (itemIndiceAtivo >= totalItens) {
        renderizarConclusaoChecklist();
        return;
    }

    if (!respostasTemporarias[item.id]) {
        respostasTemporarias[item.id] = { valor: null, conforme: true, evidencia: null };
    }

    const resp = respostasTemporarias[item.id];

    container.innerHTML = `
        <div class="app-header">
            <span style="font-size:12px; font-weight:700">${checklistAtivo.titulo}</span>
            <span style="font-size:11px">${itemIndiceAtivo + 1}/${totalItens}</span>
        </div>
        
        <div class="app-progress-bar-w">
            <div class="app-progress-bar-fill" style="width:${progressoPercent}%"></div>
        </div>

        <div class="app-body">
            <div class="app-item-card">
                <div>
                    <span class="builder-item-type-badge">${item.tipo}</span>
                    <h3 class="app-item-title" style="margin-top:8px">${item.titulo} ${item.obrigatorio ? '<span style="color:var(--color-danger)">*</span>' : ''}</h3>
                    ${item.descricao ? `<p class="app-item-desc" style="margin-top:6px">${item.descricao}</p>` : ''}
                </div>

                <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:16px" id="app-item-control-container"></div>

                ${item.evidência ? `
                    <div style="margin-top:10px">
                        <span class="form-label" style="font-size:12px">Foto de Evidência Requerida</span>
                        <div class="app-control-evidence" id="btn-app-photo">
                            <i data-lucide="camera" style="width:20px; margin-bottom:4px"></i>
                            <div>Tirar Foto</div>
                        </div>
                        <div class="app-evidence-preview" id="app-photo-preview" style="display:${resp.evidencia ? 'block' : 'none'}">
                            <img src="${resp.evidencia ? (resp.evidencia.startsWith('data:') ? resp.evidencia : 'js/' + resp.evidencia) : ''}" id="app-photo-img">
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>

        <div class="app-footer">
            <button class="btn btn-secondary" id="btn-app-prev" style="padding:6px 12px; font-size:12px" ${itemIndiceAtivo === 0 ? 'disabled' : ''}>Anterior</button>
            <button class="btn btn-primary" id="btn-app-next" style="padding:6px 12px; font-size:12px">${itemIndiceAtivo === totalItens - 1 ? 'Finalizar' : 'Próximo'}</button>
        </div>
    `;

    lucide.createIcons();
    renderizarControlesItem(item, resp);

    document.getElementById('btn-app-prev').addEventListener('click', () => {
        if (itemIndiceAtivo > 0) {
            itemIndiceAtivo--;
            renderizarPassoItem();
        }
    });

    document.getElementById('btn-app-next').addEventListener('click', () => {
        if (checklistAtivo.restricoes.ordem || item.obrigatorio) {
            const respCorrente = respostasTemporarias[item.id];
            if (respCorrente.valor === null || respCorrente.valor === "") {
                alert("Este item é obrigatório. Por favor, forneça uma resposta.");
                return;
            }
            if (item.evidência && !respCorrente.evidencia) {
                alert("Este item exige o envio de uma foto de evidência.");
                return;
            }
        }

        itemIndiceAtivo++;
        renderizarPassoItem();
    });

    if (item.evidência) {
        document.getElementById('btn-app-photo').addEventListener('click', () => {
            const fotoSimulada = prompt("Insira o nome do arquivo da foto ou digite OK para simular captura da câmera:", "evidencia_foto_camera.png");
            if (fotoSimulada) {
                resp.evidencia = fotoSimulada;
                const img = document.getElementById('app-photo-img');
                const preview = document.getElementById('app-photo-preview');
                img.src = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=120";
                preview.style.display = 'block';
            }
        });
    }
}

function renderizarControlesItem(item, resp) {
    const container = document.getElementById('app-item-control-container');

    if (item.tipo === 'Check') {
        container.innerHTML = `
            <div class="app-control-check">
                <button class="app-check-btn negativo ${resp.valor === 'Negativo' ? 'selected' : ''}" id="btn-opt-neg">${item.rotuloNegativo || 'Não Feito'}</button>
                <button class="app-check-btn positivo ${resp.valor === 'Positivo' ? 'selected' : ''}" id="btn-opt-pos">${item.rotuloPositivo || 'Feito'}</button>
            </div>
        `;
        
        document.getElementById('btn-opt-neg').addEventListener('click', () => {
            resp.valor = 'Negativo';
            resp.conforme = false;
            renderizarPassoItem();
        });
        document.getElementById('btn-opt-pos').addEventListener('click', () => {
            resp.valor = 'Positivo';
            resp.conforme = true;
            renderizarPassoItem();
        });
    } 
    else if (item.tipo === 'Avaliativo') {
        const val = parseInt(resp.valor) || 0;
        container.innerHTML = `
            <div style="text-align:center; font-size:12px; color:var(--text-muted); margin-bottom:8px">${item.rotuloInferior || 'Ruim'} → ${item.rotuloSuperior || 'Excelente'}</div>
            <div class="app-control-stars">
                ${[1, 2, 3, 4, 5].map(num => `
                    <button class="app-star-btn ${num <= val ? 'selected' : ''}" data-val="${num}">★</button>
                `).join('')}
            </div>
        `;
        
        container.querySelectorAll('.app-star-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const num = parseInt(btn.getAttribute('data-val'));
                resp.valor = num;
                
                let conf = true;
                if (item.meta && item.meta.minimo) conf = (num >= item.meta.minimo);
                resp.conforme = conf;
                
                renderizarPassoItem();
            });
        });
    } 
    else if (item.tipo === 'Numérico') {
        container.innerHTML = `
            <div class="form-group" style="margin-bottom:0">
                <input type="number" class="form-control" id="num-input" value="${resp.valor !== null ? resp.valor : ''}" placeholder="Digite a medida..." style="text-align:center">
            </div>
        `;
        
        const input = document.getElementById('num-input');
        input.focus();
        input.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (isNaN(val)) {
                resp.valor = null;
            } else {
                resp.valor = val;
                
                let conf = true;
                if (item.meta) {
                    if (item.meta.minimo !== null && val < item.meta.minimo) conf = false;
                    if (item.meta.maximo !== null && val > item.meta.maximo) conf = false;
                }
                resp.conforme = conf;
            }
        });
    } 
    else if (item.tipo === 'Texto') {
        container.innerHTML = `
            <div class="form-group" style="margin-bottom:0">
                <textarea class="form-control" id="text-input" rows="3" placeholder="Insira o texto explicativo..." style="font-size:12px">${resp.valor || ''}</textarea>
            </div>
        `;
        const textarea = document.getElementById('text-input');
        textarea.addEventListener('input', (e) => {
            resp.valor = e.target.value;
            resp.conforme = true;
        });
    } 
    else if (item.tipo === 'GPS') {
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; gap:12px">
                <button class="btn btn-secondary" id="btn-capture-gps" style="width:100%">
                    <i data-lucide="map-pin"></i> Capturar Coordenadas
                </button>
                <div id="gps-status" style="font-size:11px; text-align:center; color:${resp.valor ? 'var(--color-primary-hover)' : 'var(--text-muted)'}">
                    ${resp.valor ? `Coordenadas capturadas:<br><b>${resp.valor}</b><br><span style="font-size:11px;color:var(--text-muted)">Distância: <b>${resp.distanciaInfo || 'OK'}</b></span><br><span style="color:var(--color-success)">Unidade Validada</span>` : 'GPS não capturado'}
                </div>
            </div>
        `;
        
        lucide.createIcons();

        document.getElementById('btn-capture-gps').addEventListener('click', () => {
            const db = window.getDb();
            const unidade = db.unidades.find(u => u.id === checklistAtivo.unidadeId) || db.unidades[0];
            
            // Simula uma pequena distância em metros (ex: 15 a 45 metros)
            const angulo = Math.random() * Math.PI * 2;
            const distanciaSimulada = 15 + Math.random() * 30; // 15m a 45m
            const deltaLat = (distanciaSimulada * Math.cos(angulo)) * 0.000009;
            const deltaLng = (distanciaSimulada * Math.sin(angulo)) * 0.000009;
            
            const lat = unidade.latitude + deltaLat;
            const lng = unidade.longitude + deltaLng;
            
            const distanciaCalculada = calcularDistanciaMetros(unidade.latitude, unidade.longitude, lat, lng);
            const raioMaximo = (unidade.restricoes && unidade.restricoes.raioMetros) ? unidade.restricoes.raioMetros : 100;
            
            resp.valor = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            resp.conforme = distanciaCalculada <= raioMaximo;
            gpsCapturado = resp.valor;
            resp.distanciaInfo = `${distanciaCalculada.toFixed(1)}m (limite: ${raioMaximo}m)`;
            
            renderizarPassoItem();
        });
    } 
    else if (item.tipo === 'Assinatura') {
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; gap:12px">
                <div style="border:1px dashed var(--border-color); width:100%; height:80px; border-radius:6px; background:#ffffff; display:flex; align-items:center; justify-content:center; font-size:11px; color:var(--text-light); cursor:pointer" id="sign-pad">
                    ${resp.valor ? '<span style="font-family:\'Outfit\'; font-weight:700; font-style:italic; font-size:18px; color:#1e293b">Assinado digitalmente</span>' : 'Clique para assinar com o dedo'}
                </div>
                ${resp.valor ? `<button class="filter-clear-btn" id="btn-clear-sign" style="font-size:11px">Limpar Assinatura</button>` : ''}
            </div>
        `;
        
        document.getElementById('sign-pad').addEventListener('click', () => {
            resp.valor = "assinatura_cripto_hash_digital";
            resp.conforme = true;
            renderizarPassoItem();
        });

        const clearBtn = document.getElementById('btn-clear-sign');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                resp.valor = null;
                resp.conforme = false;
                renderizarPassoItem();
            });
        }
    } 
    else if (item.tipo === 'Separador (Sem interação)') {
        container.innerHTML = `
            <div style="text-align:center; padding:12px">
                <div style="height:1px; background:var(--border-color); margin-bottom:12px"></div>
                <span style="font-size:11px; text-transform:uppercase; font-weight:700; color:var(--text-light)">Divisor Operacional</span>
            </div>
        `;
        resp.valor = "Separado";
        resp.conforme = true;
    }
}

function renderizarConclusaoChecklist() {
    const container = document.getElementById('mobile-screen-container');

    container.innerHTML = `
        <div class="pin-screen-container" style="background:#ffffff; color:var(--text-main); justify-content:center">
            <div class="logo-icon" style="width:60px; height:60px; border-radius:var(--radius-full); background:var(--color-primary-light); color:var(--color-primary-hover); font-size:32px; display:flex; align-items:center; justify-content:center; margin-bottom:20px">
                <i data-lucide="check-circle" style="width:36px; height:36px"></i>
            </div>
            
            <h3 style="font-weight:800; font-size:18px; margin-bottom:8px">Checklist Concluído!</h3>
            <p style="font-size:12px; color:var(--text-muted); text-align:center; margin-bottom:24px; padding:0 16px">Todos os itens foram respondidos de acordo com as instruções.</p>

            <button class="btn btn-primary" id="btn-app-submit" style="width:80%; margin-bottom:12px">
                Enviar Checklist
            </button>
            <button class="btn btn-secondary" id="btn-app-review" style="width:80%">
                Revisar Respostas
            </button>
        </div>
    `;

    lucide.createIcons();

    document.getElementById('btn-app-review').addEventListener('click', () => {
        itemIndiceAtivo = 0;
        renderizarPassoItem();
    });

    document.getElementById('btn-app-submit').addEventListener('click', enviarChecklistFinalizado);
}

function enviarChecklistFinalizado() {
    const db = window.getDb();
    
    if (checklistAtivo.restricoes.local && !gpsCapturado) {
        alert("Restrição de Localização Ativa: Você precisa coletar a coordenada GPS para provar que está na loja antes de enviar.");
        itemIndiceAtivo = 0;
        renderizarPassoItem();
        return;
    }

    const horaConclusao = new Date();
    const duracaoSegundos = Math.floor((horaConclusao - horaInicioExecucao) / 1000);

    let pontualidade = 100;
    if (checklistAtivo.restricoes.horario) {
        const horaAtual = horaConclusao.getHours();
        const minAtual = horaConclusao.getMinutes();
        const [horaAgendada, minAgendado] = checklistAtivo.agendamento.horario.split(':').map(Number);
        
        const unidade = db.unidades.find(u => u.id === checklistAtivo.unidadeId) || db.unidades[0];
        const tol = unidade.restricoes.toleranciaMin;
        
        const minTotaisAtual = horaAtual * 60 + minAtual;
        const minTotaisAgendado = horaAgendada * 60 + minAgendado;

        if (Math.abs(minTotaisAtual - minTotaisAgendado) > tol) {
            pontualidade = 0;
        }
    }

    const totalItens = checklistAtivo.itens.length;
    const respondidosCount = Object.keys(respostasTemporarias).length;
    const esforco = Math.round((respondidosCount / totalItens) * 100);

    let sumPesos = 0;
    let sumConformes = 0;
    
    checklistAtivo.itens.forEach(item => {
        const r = respostasTemporarias[item.id];
        if (r && item.peso > 0) {
            sumPesos += item.peso;
            if (r.conforme) {
                sumConformes += item.peso;
            }
        }
    });

    const qualidade = sumPesos > 0 ? Math.round((sumConformes / sumPesos) * 100) : 100;
    const score = Math.round((pontualidade + esforco + qualidade) / 3);

    const situacao = (pontualidade === 100) ? 'Finalizado' : 'Atrasado';

    const unidade = db.unidades.find(u => u.id === checklistAtivo.unidadeId) || db.unidades[0];
    const setor = db.setores.find(s => s.id === checklistAtivo.setorId) || db.setores[0];

    const novaExecucao = {
        id: `exe-${Math.random().toString(36).substr(2, 9)}`,
        checklistId: checklistAtivo.id,
        checklistTitulo: checklistAtivo.titulo,
        unidadeId: unidade.id,
        unidadeNome: unidade.nome,
        setorId: setor.id,
        setorNome: setor.nome,
        momento: checklistAtivo.momento,
        usuarioId: operadorLogado.id,
        usuarioNome: operadorLogado.nome,
        dataAgendamento: new Date(horaInicioExecucao.toDateString() + " " + checklistAtivo.agendamento.horario).toISOString(),
        dataInicio: horaInicioExecucao.toISOString(),
        dataConclusao: horaConclusao.toISOString(),
        situacao,
        duracaoSegundos,
        pontualidade,
        esforco,
        qualidade,
        score,
        respostas: respostasTemporarias
    };

    db.execucoes.push(novaExecucao);
    window.saveDb(db);

    // Persiste diretamente no Supabase se conectado (já em paralelo no saveDb, mas garante para a execução)
    if (window.isSupabaseConfigured && window.isSupabaseConfigured() && window.api) {
        window.api.saveExecucao(novaExecucao).catch(err => {
            console.warn("⚠️ Aviso: Falha ao salvar execução no Supabase:", err);
        });
    }

    alert("Checklist enviado com sucesso! O dashboard do gestor foi atualizado.");
    
    renderizarTelaChecklists();
}

window.renderMobileApp = renderMobileApp;
