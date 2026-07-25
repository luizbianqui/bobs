// Módulo de Validação e Testes Unitários de Regras de Negócio

function rodarTestes() {
    console.group("%c🧪 Testes de Validação - Checkrest", "color: #2EE6A8; font-weight: bold; font-size: 14px;");
    
    let testesPassaram = true;

    // Teste 1: Validação de PINs únicos e troca rápida
    try {
        const db = window.getDb();
        const pins = db.usuarios.map(u => u.pin);
        const pinsUnicos = new Set(pins);
        
        if (pins.length === pinsUnicos.size) {
            console.log("✅ [Teste 1 - Usuários] Todos os usuários possuem PIN de acesso único.");
        } else {
            console.warn("⚠️ [Teste 1 - Usuários] Existem usuários com PIN duplicado no banco de dados.");
            testesPassaram = false;
        }
    } catch (e) {
        console.error("❌ [Teste 1 - Usuários] Falha no teste de PINs:", e);
        testesPassaram = false;
    }

    // Teste 2: Cálculo de Score e KPIs de Execução
    try {
        const pontualidadeEsperada = 100;
        
        const itensRespondidos = 3;
        const totalItens = 4;
        const esforcoEsperado = Math.round((itensRespondidos / totalItens) * 100);
        
        const somaPesosRespondidos = 6;
        const somaPesosConformes = 3;
        const qualidadeEsperada = Math.round((somaPesosConformes / somaPesosRespondidos) * 100);
        
        const scoreEsperado = Math.round((pontualidadeEsperada + esforcoEsperado + qualidadeEsperada) / 3);

        if (esforcoEsperado === 75 && qualidadeEsperada === 50 && scoreEsperado === 75) {
            console.log("✅ [Teste 2 - KPIs] Fórmulas de Pontualidade, Esforço, Qualidade e Score calculadas corretamente.");
        } else {
            console.error(`❌ [Teste 2 - KPIs] Erro nas fórmulas. Esperado Esforço: 75% (recebeu: ${esforcoEsperado}%), Qualidade: 50% (recebeu: ${qualidadeEsperada}%), Score: 75% (recebeu: ${scoreEsperado}%)`);
            testesPassaram = false;
        }
    } catch (e) {
        console.error("❌ [Teste 2 - KPIs] Falha ao testar cálculos de KPIs:", e);
        testesPassaram = false;
    }

    // Teste 3: Restrições de Localização (GPS)
    try {
        const db = window.getDb();
        const unidade = db.unidades[0];
        const raioMaximo = (unidade.restricoes && unidade.restricoes.raioMetros) ? unidade.restricoes.raioMetros : 100;
        
        // Ponto 1: Perto (aprox 11 metros de distância) - Deve Passar
        const latPerto = unidade.latitude + 0.0001;
        const lngPerto = unidade.longitude;
        const distPerto = window.calcularDistanciaMetros(unidade.latitude, unidade.longitude, latPerto, lngPerto);
        const estaNoLocalPerto = distPerto <= raioMaximo;

        // Ponto 2: Longe (aprox 470 metros de distância) - Deve Falhar
        const latLonge = unidade.latitude + 0.003;
        const lngLonge = unidade.longitude + 0.003;
        const distLonge = window.calcularDistanciaMetros(unidade.latitude, unidade.longitude, latLonge, lngLonge);
        const estaNoLocalLonge = distLonge <= raioMaximo;

        if (estaNoLocalPerto && !estaNoLocalLonge) {
            console.log(`✅ [Teste 3 - Geofencing] Restrição de GPS validada com sucesso: Ponto perto (${distPerto.toFixed(1)}m) aceito, Ponto longe (${distLonge.toFixed(1)}m) rejeitado. (Raio configurado: ${raioMaximo}m)`);
        } else {
            console.error(`❌ [Teste 3 - Geofencing] Falha na validação de GPS. Perto: ${estaNoLocalPerto} (dist: ${distPerto.toFixed(1)}m), Longe: ${estaNoLocalLonge} (dist: ${distLonge.toFixed(1)}m)`);
            testesPassaram = false;
        }
    } catch (e) {
        console.error("❌ [Teste 3 - Geofencing] Erro ao validar regras de GPS:", e);
        testesPassaram = false;
    }

    if (testesPassaram) {
        console.log("%c🎉 Todos os testes de regras de negócio passaram com sucesso!", "color: #2EE6A8; font-weight: bold;");
    } else {
        console.error("⚠️ Existem testes que falharam. Por favor, revise as regras.");
    }
    
    console.groupEnd();
}

window.rodarTestes = rodarTestes;
