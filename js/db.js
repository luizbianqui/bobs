// Banco de Dados Local Simulado (localStorage)

const DB_KEY = 'checkrest_db';

// Estrutura Inicial e Dados Fictícios Ricos
const DADOS_INICIAIS = {
    unidades: [
        { id: 'un-1', nome: "Restaurante Matriz PA", sigla: "BMPA", city: "Belém", uf: "PA", latitude: -1.4558, longitude: -48.4902, restricoes: { local: true, horario: true, raioMetros: 100, antecedenciaValor: 12, antecedenciaUnidade: "horas", limiteAtrasoValor: 12, limiteAtrasoUnidade: "horas" } },
        { id: 'un-2', nome: "Pantaneira", sigla: "BPAN", city: "Campo Grande", uf: "MS", latitude: -20.4697, longitude: -54.6201, restricoes: { local: false, horario: true, raioMetros: 100, antecedenciaValor: 6, antecedenciaUnidade: "horas", limiteAtrasoValor: 30, limiteAtrasoUnidade: "minutos" } },
        { id: 'un-3', nome: "Modelo Segurança", sigla: "BKS", city: "João Pessoa", uf: "PB", latitude: -7.1195, longitude: -34.8450, restricoes: { local: true, horario: true, raioMetros: 150, antecedenciaValor: 1, antecedenciaUnidade: "horas", limiteAtrasoValor: 15, limiteAtrasoUnidade: "minutos" } }
    ],
    setores: [
        { id: 'set-1', nome: "Bar" },
        { id: 'set-2', nome: "Compras" },
        { id: 'set-3', nome: "Estoque" },
        { id: 'set-4', nome: "Caixa" },
        { id: 'set-5', nome: "Administrativo" }
    ],
    usuarios: [
        { id: 'usr-1', nome: "Yan Fernandes", email: "yan@bobs.com.br", telefone: "5511999999999", pin: "00000", gestor: true, setores: ['set-5'] },
        { id: 'usr-2', nome: "Brian Nascimento", email: "brian@bobs.com.br", telefone: "5511988888888", pin: "12345", gestor: false, setores: ['set-1', 'set-3'] },
        { id: 'usr-3', nome: "Jaropipoca juniorm", email: "jaropipoca@bobs.com.br", telefone: "5511977777777", pin: "54321", gestor: false, setores: ['set-2', 'set-4'] },
        { id: 'usr-4', nome: "João Souza", email: "joao.souza@bobs.com.br", telefone: "5511966666666", pin: "98765", gestor: false, setores: ['set-1', 'set-2'] }
    ],
    checklists: [
        {
            id: 'chk-1',
            titulo: "Checklist de Abertura - Cozinha",
            momento: "Abertura",
            setorId: "set-1",
            responsavelId: "usr-2",
            unidadeId: "un-1",
            status: true,
            itens: [
                { id: 'item-1-1', titulo: "Higienização das mãos realizada por todos", tipo: "Check", peso: 3, descricao: "Certificar de que todos os operadores lavaram as mãos conforme protocolo da Anvisa.", rotuloPositivo: "Feito", rotuloNegativo: "Não Feito", obrigatorio: true, critico: true },
                { id: 'item-1-2', titulo: "Temperatura do freezer (-18°C ou menos)", tipo: "Numérico", peso: 2, descricao: "Verificar termômetro digital no painel do freezer principal.", obrigatorio: true, critico: true, meta: { minimo: null, maximo: -18 } },
                { id: 'item-1-3', titulo: "Óleo da fritadeira limpo e nivelado", tipo: "Check", peso: 2, descricao: "Verificar se o óleo precisa de filtragem ou troca.", rotuloPositivo: "OK", rotuloNegativo: "Requer Troca", obrigatorio: false, critico: false },
                { id: 'item-1-4', titulo: "Registrar foto da chapa higienizada", tipo: "Texto", peso: 1, descricao: "Tire uma foto nítida e descreva qualquer anomalia.", obrigatorio: true, critico: false, evidência: true },
                { id: 'item-1-5', titulo: "GPS da Unidade", tipo: "GPS", peso: 1, descricao: "Confirmação de abertura no local correto.", obrigatorio: true, critico: false }
            ],
            agendamento: {
                recorrente: true,
                frequencia: "Diário",
                repetirACada: 1,
                horario: "08:00",
                dataInicio: "2026-06-01",
                dataTermino: "",
                excecoes: []
            },
            restricoes: { local: true, horario: true, ordem: false }
        },
        {
            id: 'chk-2',
            titulo: "Checklist de Higiene e Limpeza - Salão",
            momento: "Outros",
            setorId: "set-2",
            responsavelId: "usr-3",
            unidadeId: "un-2",
            status: true,
            itens: [
                { id: 'item-2-1', titulo: "Limpeza das mesas e cadeiras com álcool 70%", tipo: "Check", peso: 2, descricao: "Mesas devem estar secas, limpas e organizadas.", rotuloPositivo: "Sim", rotuloNegativo: "Não", obrigatorio: true, critico: false },
                { id: 'item-2-2', titulo: "Nível de satisfação visual do salão", tipo: "Avaliativo", peso: 2, rotuloInferior: "Ruim", rotuloSuperior: "Excelente", descricao: "Como está o salão visualmente para um cliente?", obrigatorio: true, critico: false, meta: { minimo: 4, maximo: null } },
                { id: 'item-2-3', titulo: "Banheiros limpos e abastecidos", tipo: "Check", peso: 3, descricao: "Verificar sabonete, papel toalha e papel higiênico.", rotuloPositivo: "Abastecido", rotuloNegativo: "Falta Insumo", obrigatorio: true, critico: true, evidência: true }
            ],
            agendamento: {
                recorrente: true,
                frequencia: "Diário",
                repetirACada: 1,
                horario: "14:00",
                dataInicio: "2026-06-01",
                dataTermino: "",
                excecoes: []
            },
            restricoes: { local: false, horario: false, ordem: true }
        },
        {
            id: 'chk-3',
            titulo: "Fechamento de Caixa Diário",
            momento: "Fechamento",
            setorId: "set-4",
            responsavelId: "usr-3",
            unidadeId: "un-1",
            status: true,
            itens: [
                { id: 'item-3-1', titulo: "Valor total em dinheiro no caixa físico", tipo: "Numérico", peso: 2, descricao: "Contar notas e moedas físicas.", obrigatorio: true, critico: false },
                { id: 'item-3-2', titulo: "Diferença declarada vs. sistema", tipo: "Numérico", peso: 3, descricao: "Inserir a diferença encontrada em R$. Use zero se bater correto.", obrigatorio: true, critico: true, meta: { minimo: -5, maximo: 5 } },
                { id: 'item-3-3', titulo: "Assinatura do Operador de Caixa", tipo: "Assinatura", peso: 2, descricao: "Assine na tela para confirmar os valores.", obrigatorio: true, critico: false }
            ],
            agendamento: {
                recorrente: true,
                frequencia: "Diário",
                repetirACada: 1,
                horario: "22:30",
                dataInicio: "2026-06-01",
                dataTermino: "",
                excecoes: []
            },
            restricoes: { local: true, horario: true, ordem: false }
        }
    ],
    execucoes: [],
    notificacoes: {
        whatsappConectado: true,
        numeroPrincipal: "5511999999999",
        agendados: { whatsapp: true, push: true, antecedencia: 15, enviarPara: "responsavel" },
        criticos: { whatsapp: true, push: true, enviarPara: "gestores", mensagem: "⚠️ *Alerta de Item Crítico!* No checklist {checklist} ({unidade}), o item *{item}* foi respondido como não conforme pelo operador *{operador}*." },
        atrasados: { whatsapp: true, push: true, minutosTolerancia: 15, enviarPara: "ambos" },
        fechamento: { whatsapp: true, push: false, horario: "22:00", enviarPara: "gestores" }
    }
};

// Função para gerar histórico fictício
function gerarHistoricoExecucoes(db) {
    const execucoes = [];
    const hoje = new Date();
    
    for (let i = 30; i >= 0; i--) {
        const dataDia = new Date(hoje);
        dataDia.setDate(hoje.getDate() - i);
        const dataStr = dataDia.toISOString().split('T')[0];

        db.checklists.forEach(chk => {
            if (Math.random() > 0.15) {
                const dataAgendamento = `${dataStr}T${chk.agendamento.horario}:00`;
                
                let situacao = "Finalizado";
                let atrasoMinutos = 0;
                
                const rand = Math.random();
                if (rand < 0.05) {
                    situacao = "Não executado";
                } else if (rand < 0.15) {
                    situacao = "Atrasado";
                    atrasoMinutos = Math.floor(Math.random() * 90) + 15;
                } else if (rand < 0.22) {
                    if (i === 0) {
                        situacao = Math.random() > 0.5 ? "Iniciado" : "Não iniciado";
                    } else {
                        situacao = "Não executado";
                    }
                }

                let dataInicio = "";
                let dataConclusao = "";
                let duracaoSegundos = 0;
                
                if (situacao === "Finalizado" || situacao === "Atrasado") {
                    const horaAgendada = new Date(dataAgendamento);
                    const horaInicio = new Date(horaAgendada);
                    const desvioInicio = (Math.random() * 20 - 10) + (situacao === "Atrasado" ? atrasoMinutos : 0);
                    horaInicio.setMinutes(horaInicio.getMinutes() + desvioInicio);
                    dataInicio = horaInicio.toISOString();

                    duracaoSegundos = Math.floor(Math.random() * 480) + 120;
                    const horaFim = new Date(horaInicio);
                    horaFim.setSeconds(horaFim.getSeconds() + duracaoSegundos);
                    dataConclusao = horaFim.toISOString();
                } else if (situacao === "Iniciado") {
                    const horaInicio = new Date();
                    horaInicio.setMinutes(horaInicio.getMinutes() - 5);
                    dataInicio = horaInicio.toISOString();
                }

                const operador = db.usuarios.find(u => u.id === chk.responsavelId) || db.usuarios[1];
                const unidade = db.unidades.find(u => u.id === chk.unidadeId) || db.unidades[0];
                const setor = db.setores.find(s => s.id === chk.setorId) || db.setores[0];

                const respostas = {};
                let itensRespondidos = 0;
                let itensConformes = 0;
                let totalItensCalculados = 0;

                if (situacao === "Finalizado" || situacao === "Atrasado" || situacao === "Iniciado") {
                    chk.itens.forEach(item => {
                        if (situacao === "Iniciado" && Math.random() > 0.5) {
                            return;
                        }

                        let valor = null;
                        let conforme = true;
                        let evidencia = null;

                        if (item.tipo === "Check") {
                            valor = Math.random() > 0.15 ? "Positivo" : "Negativo";
                            conforme = (valor === "Positivo");
                        } else if (item.tipo === "Numérico") {
                            if (item.id === 'item-1-2') {
                                valor = Math.floor(Math.random() * 10) - 24;
                                conforme = (valor <= -18);
                            } else if (item.id === 'item-3-1') {
                                valor = Math.floor(Math.random() * 1000) + 500;
                            } else if (item.id === 'item-3-2') {
                                valor = Math.random() > 0.8 ? (Math.random() > 0.5 ? 10 : -10) : 0;
                                conforme = (valor >= -5 && valor <= 5);
                            } else {
                                valor = Math.floor(Math.random() * 100);
                            }
                        } else if (item.tipo === "Avaliativo") {
                            valor = Math.floor(Math.random() * 3) + 3;
                            if (item.meta && item.meta.minimo) {
                                conforme = (valor >= item.meta.minimo);
                            }
                        } else if (item.tipo === "Texto") {
                            valor = "Rotina executada sem problemas.";
                            if (item.id === 'item-1-4') {
                                evidencia = "imagem_chapa_mock.png";
                            }
                        } else if (item.tipo === "GPS") {
                            valor = `${unidade.latitude + (Math.random() * 0.0004 - 0.0002)}, ${unidade.longitude + (Math.random() * 0.0004 - 0.0002)}`;
                        } else if (item.tipo === "Assinatura") {
                            valor = "assinatura_digital_data";
                        }

                        if (item.evidência && !evidencia) {
                            evidencia = "evidencia_foto_padrao.png";
                        }

                        respostas[item.id] = { valor, conforme, evidencia };
                        itensRespondidos++;
                        
                        if (item.peso > 0) {
                            totalItensCalculados += item.peso;
                            if (conforme) {
                                itensConformes += item.peso;
                            }
                        }
                    });
                }

                let pontualidade = 0;
                let esforco = 0;
                let qualidade = 0;
                let score = 0;

                if (situacao === "Finalizado" || situacao === "Atrasado") {
                    pontualidade = (situacao === "Finalizado") ? 100 : 0;
                    esforco = Math.round((itensRespondidos / chk.itens.length) * 100);
                    qualidade = totalItensCalculados > 0 ? Math.round((itensConformes / totalItensCalculados) * 100) : 100;
                    score = Math.round((pontualidade + esforco + qualidade) / 3);
                } else if (situacao === "Iniciado") {
                    pontualidade = 100;
                    esforco = Math.round((itensRespondidos / chk.itens.length) * 100);
                    qualidade = totalItensCalculados > 0 ? Math.round((itensConformes / totalItensCalculados) * 100) : 100;
                    score = Math.round((pontualidade + esforco + qualidade) / 3);
                }

                execucoes.push({
                    id: `exe-${Math.random().toString(36).substr(2, 9)}`,
                    checklistId: chk.id,
                    checklistTitulo: chk.titulo,
                    unidadeId: unidade.id,
                    unidadeNome: unidade.nome,
                    setorId: setor.id,
                    setorNome: setor.nome,
                    momento: chk.momento,
                    usuarioId: operador.id,
                    usuarioNome: operador.nome,
                    dataAgendamento,
                    dataInicio,
                    dataConclusao,
                    situacao,
                    duracaoSegundos,
                    pontualidade,
                    esforco,
                    qualidade,
                    score,
                    respostas
                });
            }
        });
    }

    db.execucoes = execucoes;
}

// Inicializar banco de dados
function initDb(forceReset = false) {
    let dbStr = localStorage.getItem(DB_KEY);
    
    // Forçar reset caso os dados antigos estejam no localStorage ou falte a propriedade antecedenciaValor
    if (dbStr && (dbStr.includes("Bob's Matriz PA") || dbStr.includes("Yan Silva") || !dbStr.includes("antecedenciaValor"))) {
        forceReset = true;
    }

    if (!dbStr || forceReset) {
        const db = JSON.parse(JSON.stringify(DADOS_INICIAIS));
        gerarHistoricoExecucoes(db);
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        return db;
    }
    return JSON.parse(dbStr);
}

// Obter dados atuais do banco
function getDb() {
    let dbStr = localStorage.getItem(DB_KEY);
    if (!dbStr) {
        return initDb();
    }
    const db = JSON.parse(dbStr);
    
    let mudou = false;
    if (!db.notificacoes) {
        db.notificacoes = {
            whatsappConectado: true,
            numeroPrincipal: "5511999999999",
            agendados: { whatsapp: true, push: true, antecedencia: 15, enviarPara: "responsavel" },
            criticos: { whatsapp: true, push: true, enviarPara: "gestores", mensagem: "⚠️ *Alerta de Item Crítico!* No checklist {checklist} ({unidade}), o item *{item}* foi respondido como não conforme pelo operador *{operador}*." },
            atrasados: { whatsapp: true, push: true, minutosTolerancia: 15, enviarPara: "ambos" },
            fechamento: { whatsapp: true, push: false, horario: "22:00", enviarPara: "gestores" }
        };
        mudou = true;
    }
    db.unidades.forEach(u => {
        if (!u.restricoes) {
            u.restricoes = { local: false, horario: false };
            mudou = true;
        }
        if (u.restricoes.raioMetros === undefined) {
            u.restricoes.raioMetros = 100;
            mudou = true;
        }
        if (u.restricoes.antecedenciaValor === undefined) {
            u.restricoes.antecedenciaValor = 12;
            u.restricoes.antecedenciaUnidade = 'horas';
            mudou = true;
        }
        if (u.restricoes.limiteAtrasoValor === undefined) {
            u.restricoes.limiteAtrasoValor = 12;
            u.restricoes.limiteAtrasoUnidade = 'horas';
            mudou = true;
        }
        if (u.restricoes.local === undefined) {
            u.restricoes.local = false;
            mudou = true;
        }
        if (u.restricoes.horario === undefined) {
            u.restricoes.horario = false;
            mudou = true;
        }
    });
    if (mudou) {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
    
    return db;
}

// Salvar dados no banco (atualizado para sincronizar automaticamente com o Supabase)
function saveDb(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent('checkrest-db-updated'));

    // Executa a sincronização em segundo plano se o Supabase estiver configurado
    if (window.isSupabaseConfigured()) {
        initSupabase();
        if (window.supabaseClient) {
            (async () => {
                try {
                    // 1. Sincroniza Unidades (Upsert e Delete órfãos)
                    if (db.unidades) {
                        const localIds = db.unidades.map(u => u.id);
                        if (localIds.length > 0) {
                            await window.supabaseClient.from('unidades').delete().not('id', 'in', `(${localIds.join(',')})`);
                            await window.supabaseClient.from('unidades').upsert(db.unidades);
                        } else {
                            await window.supabaseClient.from('unidades').delete().neq('id', '_none_');
                        }
                    }

                    // 2. Sincroniza Setores (Upsert e Delete órfãos)
                    if (db.setores) {
                        const localIds = db.setores.map(s => s.id);
                        if (localIds.length > 0) {
                            await window.supabaseClient.from('setores').delete().not('id', 'in', `(${localIds.join(',')})`);
                            await window.supabaseClient.from('setores').upsert(db.setores);
                        } else {
                            await window.supabaseClient.from('setores').delete().neq('id', '_none_');
                        }
                    }

                    // 3. Sincroniza Usuários (Upsert e Delete órfãos)
                    if (db.usuarios) {
                        const localIds = db.usuarios.map(u => u.id);
                        if (localIds.length > 0) {
                            await window.supabaseClient.from('usuarios').delete().not('id', 'in', `(${localIds.join(',')})`);
                            await window.supabaseClient.from('usuarios').upsert(db.usuarios);
                        } else {
                            await window.supabaseClient.from('usuarios').delete().neq('id', '_none_');
                        }
                    }

                    // 4. Sincroniza Checklists (Upsert e Delete órfãos)
                    if (db.checklists) {
                        const localIds = db.checklists.map(c => c.id);
                        if (localIds.length > 0) {
                            await window.supabaseClient.from('checklists').delete().not('id', 'in', `(${localIds.join(',')})`);
                            await window.supabaseClient.from('checklists').upsert(db.checklists.map(chkToDb));
                        } else {
                            await window.supabaseClient.from('checklists').delete().neq('id', '_none_');
                        }
                    }

                    // 5. Sincroniza Execuções (Apenas Upsert, pois execuções não são deletadas pelo painel comum)
                    if (db.execucoes && db.execucoes.length > 0) {
                        // Faz em lotes pequenos para evitar limites de payload
                        const batchSize = 50;
                        for (let i = 0; i < db.execucoes.length; i += batchSize) {
                            const batch = db.execucoes.slice(i, i + batchSize).map(exeToDb);
                            await window.supabaseClient.from('execucoes').upsert(batch);
                        }
                    }

                    console.log("☁️ Alterações sincronizadas com o Supabase com sucesso!");
                } catch (err) {
                    console.error("⚠️ Erro na sincronização em segundo plano do Supabase:", err);
                }
            })();
        }
    }
}

// Resetar banco
function resetDb() {
    return initDb(true);
}

// --- INTEGRAÇÃO SUPABASE (API E BANCO REAL) ---

// Conversão de Checklist (Local -> Supabase)
function chkToDb(chk) {
    return {
        id: chk.id,
        titulo: chk.titulo,
        momento: chk.momento,
        setor_id: chk.setorId,
        responsavel_id: chk.responsavelId,
        unidade_id: chk.unidadeId,
        status: chk.status,
        itens: chk.itens,
        agendamento: chk.agendamento,
        restricoes: chk.restricoes
    };
}

// Conversão de Checklist (Supabase -> Local)
function chkFromDb(chk) {
    return {
        id: chk.id,
        titulo: chk.titulo,
        momento: chk.momento,
        setorId: chk.setor_id,
        responsavelId: chk.responsavel_id,
        unidadeId: chk.unidade_id,
        status: chk.status,
        itens: chk.itens,
        agendamento: chk.agendamento,
        restricoes: chk.restricoes
    };
}

// Conversão de Execução (Local -> Supabase)
function exeToDb(exe) {
    return {
        id: exe.id,
        checklist_id: exe.checklistId,
        checklist_titulo: exe.checklistTitulo,
        unidade_id: exe.unidadeId,
        unidade_nome: exe.unidadeNome,
        setor_id: exe.setorId,
        setor_nome: exe.setorNome,
        momento: exe.momento,
        usuario_id: exe.usuarioId,
        usuario_nome: exe.usuarioNome,
        data_agendamento: exe.dataAgendamento || null,
        data_inicio: exe.dataInicio || null,
        data_conclusao: exe.dataConclusao || null,
        situacao: exe.situacao,
        duracao_segundos: exe.duracaoSegundos || 0,
        pontualidade: exe.pontualidade || 0,
        esforco: exe.esforco || 0,
        qualidade: exe.qualidade || 0,
        score: exe.score || 0,
        respostas: exe.respostas
    };
}

// Conversão de Execução (Supabase -> Local)
function exeFromDb(exe) {
    return {
        id: exe.id,
        checklistId: exe.checklist_id,
        checklistTitulo: exe.checklist_titulo,
        unidadeId: exe.unidade_id,
        unidadeNome: exe.unidade_nome,
        setorId: exe.setor_id,
        setorNome: exe.setor_nome,
        momento: exe.momento,
        usuarioId: exe.usuario_id,
        usuarioNome: exe.usuario_nome,
        dataAgendamento: exe.data_agendamento,
        dataInicio: exe.data_inicio,
        dataConclusao: exe.data_conclusao,
        situacao: exe.situacao,
        duracaoSegundos: exe.duracao_segundos,
        pontualidade: Number(exe.pontualidade),
        esforco: Number(exe.esforco),
        qualidade: Number(exe.qualidade),
        score: Number(exe.score),
        respostas: exe.respostas
    };
}

window.supabaseClient = null;

function initSupabase() {
    if (window.isSupabaseConfigured()) {
        const creds = window.getSupabaseCreds();
        window.supabaseClient = supabase.createClient(creds.url, creds.key);
    } else {
        window.supabaseClient = null;
    }
}

// Inicializar imediatamente
initSupabase();

// Funções assíncronas unificadas
window.api = {
    // UNIDADES
    getUnidades: async () => {
        initSupabase();
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient.from('unidades').select('*').order('nome');
            if (error) throw error;
            return data;
        }
        return window.getDb().unidades;
    },
    saveUnidade: async (unidade) => {
        initSupabase();
        if (window.supabaseClient) {
            const { error } = await window.supabaseClient.from('unidades').upsert(unidade);
            if (error) throw error;
            return;
        }
        const db = window.getDb();
        const idx = db.unidades.findIndex(u => u.id === unidade.id);
        if (idx >= 0) db.unidades[idx] = unidade;
        else db.unidades.push(unidade);
        window.saveDb(db);
    },
    deleteUnidade: async (id) => {
        initSupabase();
        if (window.supabaseClient) {
            const { error } = await window.supabaseClient.from('unidades').delete().eq('id', id);
            if (error) throw error;
            return;
        }
        const db = window.getDb();
        db.unidades = db.unidades.filter(u => u.id !== id);
        window.saveDb(db);
    },

    // SETORES
    getSetores: async () => {
        initSupabase();
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient.from('setores').select('*').order('nome');
            if (error) throw error;
            return data;
        }
        return window.getDb().setores;
    },
    saveSetor: async (setor) => {
        initSupabase();
        if (window.supabaseClient) {
            const { error } = await window.supabaseClient.from('setores').upsert(setor);
            if (error) throw error;
            return;
        }
        const db = window.getDb();
        const idx = db.setores.findIndex(s => s.id === setor.id);
        if (idx >= 0) db.setores[idx] = setor;
        else db.setores.push(setor);
        window.saveDb(db);
    },
    deleteSetor: async (id) => {
        initSupabase();
        if (window.supabaseClient) {
            const { error } = await window.supabaseClient.from('setores').delete().eq('id', id);
            if (error) throw error;
            return;
        }
        const db = window.getDb();
        db.setores = db.setores.filter(s => s.id !== id);
        window.saveDb(db);
    },

    // USUARIOS
    getUsuarios: async () => {
        initSupabase();
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient.from('usuarios').select('*').order('nome');
            if (error) throw error;
            return data;
        }
        return window.getDb().usuarios;
    },
    saveUsuario: async (usuario) => {
        initSupabase();
        if (window.supabaseClient) {
            const { error } = await window.supabaseClient.from('usuarios').upsert(usuario);
            if (error) throw error;
            return;
        }
        const db = window.getDb();
        const idx = db.usuarios.findIndex(u => u.id === usuario.id);
        if (idx >= 0) db.usuarios[idx] = usuario;
        else db.usuarios.push(usuario);
        window.saveDb(db);
    },
    deleteUsuario: async (id) => {
        initSupabase();
        if (window.supabaseClient) {
            const { error } = await window.supabaseClient.from('usuarios').delete().eq('id', id);
            if (error) throw error;
            return;
        }
        const db = window.getDb();
        db.usuarios = db.usuarios.filter(u => u.id !== id);
        window.saveDb(db);
    },

    // CHECKLISTS
    getChecklists: async () => {
        initSupabase();
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient.from('checklists').select('*');
            if (error) throw error;
            return data.map(chkFromDb);
        }
        return window.getDb().checklists;
    },
    saveChecklist: async (checklist) => {
        initSupabase();
        if (window.supabaseClient) {
            const dbObj = chkToDb(checklist);
            const { error } = await window.supabaseClient.from('checklists').upsert(dbObj);
            if (error) throw error;
            return;
        }
        const db = window.getDb();
        const idx = db.checklists.findIndex(c => c.id === checklist.id);
        if (idx >= 0) db.checklists[idx] = checklist;
        else db.checklists.push(checklist);
        window.saveDb(db);
    },
    deleteChecklist: async (id) => {
        initSupabase();
        if (window.supabaseClient) {
            const { error } = await window.supabaseClient.from('checklists').delete().eq('id', id);
            if (error) throw error;
            return;
        }
        const db = window.getDb();
        db.checklists = db.checklists.filter(c => c.id !== id);
        window.saveDb(db);
    },

    // EXECUCOES
    getExecucoes: async () => {
        initSupabase();
        if (window.supabaseClient) {
            const { data, error } = await window.supabaseClient.from('execucoes').select('*').order('data_agendamento', { ascending: false });
            if (error) throw error;
            return data.map(exeFromDb);
        }
        return window.getDb().execucoes;
    },
    saveExecucao: async (execucao) => {
        initSupabase();
        if (window.supabaseClient) {
            const dbObj = exeToDb(execucao);
            const { error } = await window.supabaseClient.from('execucoes').upsert(dbObj);
            if (error) throw error;
            return;
        }
        const db = window.getDb();
        const idx = db.execucoes.findIndex(e => e.id === execucao.id);
        if (idx >= 0) db.execucoes[idx] = execucao;
        else db.execucoes.push(execucao);
        window.saveDb(db);
    }
};

window.seedSupabaseData = async function() {
    initSupabase();
    if (!window.supabaseClient) {
        throw new Error("Supabase não configurado.");
    }
    
    const dbLocal = window.getDb();
    
    try {
        // 1. Semeia setores
        if (dbLocal.setores && dbLocal.setores.length > 0) {
            const { error } = await window.supabaseClient.from('setores').upsert(dbLocal.setores);
            if (error) throw new Error("Erro nos setores: " + error.message);
        }
        
        // 2. Semeia unidades
        if (dbLocal.unidades && dbLocal.unidades.length > 0) {
            const { error } = await window.supabaseClient.from('unidades').upsert(dbLocal.unidades);
            if (error) throw new Error("Erro nas unidades: " + error.message);
        }
        
        // 3. Semeia usuários
        if (dbLocal.usuarios && dbLocal.usuarios.length > 0) {
            const { error } = await window.supabaseClient.from('usuarios').upsert(dbLocal.usuarios);
            if (error) throw new Error("Erro nos usuários: " + error.message);
        }
        
        // 4. Semeia checklists
        if (dbLocal.checklists && dbLocal.checklists.length > 0) {
            const chksDb = dbLocal.checklists.map(chkToDb);
            const { error } = await window.supabaseClient.from('checklists').upsert(chksDb);
            if (error) throw new Error("Erro nos checklists: " + error.message);
        }
        
        // 5. Semeia execuções
        if (dbLocal.execucoes && dbLocal.execucoes.length > 0) {
            const batchSize = 100;
            for (let i = 0; i < dbLocal.execucoes.length; i += batchSize) {
                const batch = dbLocal.execucoes.slice(i, i + batchSize).map(exeToDb);
                const { error } = await window.supabaseClient.from('execucoes').upsert(batch);
                if (error) throw new Error("Erro nas execuções (lote " + i + "): " + error.message);
            }
        }
        
        return true;
    } catch (err) {
        console.error("Falha ao semear dados:", err);
        throw err;
    }
};

window.syncLocalWithSupabase = async function() {
    if (!window.isSupabaseConfigured()) {
        return; // Sem credenciais, usa o localStorage existente
    }
    
    try {
        initSupabase();
        if (!window.supabaseClient) return;
        
        // Puxa em paralelo do Supabase
        const [unidades, setores, usuarios, checklists, execucoes] = await Promise.all([
            window.supabaseClient.from('unidades').select('*').order('nome'),
            window.supabaseClient.from('setores').select('*').order('nome'),
            window.supabaseClient.from('usuarios').select('*').order('nome'),
            window.supabaseClient.from('checklists').select('*'),
            window.supabaseClient.from('execucoes').select('*').order('data_agendamento', { ascending: false })
        ]);
        
        if (unidades.error) throw unidades.error;
        if (setores.error) throw setores.error;
        if (usuarios.error) throw usuarios.error;
        if (checklists.error) throw checklists.error;
        if (execucoes.error) throw execucoes.error;
        
        // Atualiza a estrutura de DADOS no localStorage
        const db = window.getDb();
        db.unidades = unidades.data;
        db.setores = setores.data;
        db.usuarios = usuarios.data;
        db.checklists = checklists.data.map(chkFromDb);
        db.execucoes = execucoes.data.map(exeFromDb);
        
        // Salva silenciosamente no localStorage (sem disparar loop de recarregamento)
        const DB_KEY = 'checkrest_db';
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        console.log("🔄 Banco de dados local sincronizado com sucesso com o Supabase!");
    } catch (err) {
        console.warn("⚠️ Não foi possível sincronizar com o Supabase. Usando dados locais.", err);
    }
};

// Expor globalmente para o protocolo file://
window.initDb = initDb;
window.getDb = getDb;
window.saveDb = saveDb;
window.resetDb = resetDb;
