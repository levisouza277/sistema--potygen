// ==========================================================================
// CONFIGURAÇÕES BIOLÓGICAS DA RAÇA & ESPÉCIE
// ==========================================================================
const dadosConfig = {
    Bovino: {
        racas: ['Nelore', 'Gir', 'Guzerá', 'Mestiço'],
        finalidades: ['Carne (Corte)', 'Leite', 'Dupla Aptidão', 'Resistência à Seca']
    },
    Ovino: {
        racas: ['Santa Inês', 'Merino', 'Dorper', 'Morada Nova'],
        finalidades: ['Carne (Corte)', 'Lã', 'Pele / Couro', 'Resistência à Seca']
    },
    Caprino: {
        racas: ['Saanen', 'Boer', 'Repartida', 'Moxotó'],
        finalidades: ['Leite', 'Carne (Cabrito)', 'Pele', 'Resistência à Seca']
    }
};

// Variáveis Globais de Monitoramento
let temperaturaAtual = 28; // Fallback estável
let umidadeAtual = 60;     // Fallback estável
let ituAtual = 75;         // ITU padrão base
let dadosUsuario = { cidade: "Crateús", estado: "CE" };

// Variáveis de Controle da IA
let net;
let iaTreinadaEPronta = false;

// ==========================================================================
// CAPTURA AUTOMÁTICA DE ATRIBUTOS DO CADASTRO
// ==========================================================================
function carregarLocalizacaoDoCadastro() {
    try {
        const cidadeSalva = localStorage.getItem("user_cidade");
        const estadoSalvo = localStorage.getItem("user_estado");

        if (cidadeSalva && estadoSalvo) {
            dadosUsuario.cidade = cidadeSalva;
            dadosUsuario.estado = estadoSalvo;
        } else {
            console.warn("Dados de cadastro não encontrados. Usando polo padrão do Semiárido: Crateús-CE.");
            dadosUsuario.cidade = "Crateús";
            dadosUsuario.estado = "CE";
        }

        const lblLocalizacao = document.getElementById("lblLocalizacaoUsuario");
        if (lblLocalizacao) {
            lblLocalizacao.innerText = `${dadosUsuario.cidade} — ${dadosUsuario.estado}`;
        }
        
        buscarClimaCidadeReal(dadosUsuario.cidade);
    } catch (erro) {
        console.error("Erro ao carregar dados do usuário:", erro);
    }
}

// ==========================================================================
// CAPTURA DE DADOS METEOROLÓGICOS REAIS (OPEN-METEO VIA GEOCODING)
// ==========================================================================
async function buscarClimaCidadeReal(cidade) {
    const statusText = document.getElementById("lblStatusTermico");
    if(statusText) statusText.innerHTML = "Sincronizando estação climática...";

    try {
        // Passo 1: Obter Lat/Long da cidade cadastrada
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`
        );
        const geoDados = await geoResponse.json();

        // Validação de Segurança (API pode retornar undefined ou array vazio)
        if (!geoDados || !geoDados.results || geoDados.results.length === 0) {
            throw new Error(`Cidade '${cidade}' não encontrada no mapa global.`);
        }

        const { latitude, longitude } = geoDados.results[0];

        // Passo 2: Buscar Clima Atual em tempo de execução
        const climaResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`
        );
        const dadosClima = await climaResponse.json();

        temperaturaAtual = Math.round(dadosClima.current.temperature_2m);
        umidadeAtual = Math.round(dadosClima.current.relative_humidity_2m);

        // Passo 3: Cálculo Bioclimático Direto do ITU (Fórmula Zootécnica Corrigida)
        const tFahrenheit = (1.8 * temperaturaAtual) + 32;
        ituAtual = Math.round(
            tFahrenheit - ((0.55 - 0.0055 * umidadeAtual) * (tFahrenheit - 58))
        );

        // Atualizar painéis visuais
        document.getElementById("lblTemperatura").innerText = `${temperaturaAtual}°C`;
        document.getElementById("lblUmidade").innerText = `${umidadeAtual}%`;
        document.getElementById("lblITU").innerText = ituAtual;

        // Classificação do Estresse Térmico
        const containerITU = document.querySelector(".itu-container");
        if (ituAtual >= 92) {
            statusText.innerHTML = "🚨 Estresse Térmico Extremo";
            if(containerITU) containerITU.style.borderLeftColor = "#dc2626";
        } else if (ituAtual >= 84) {
            statusText.innerHTML = "⚠️ Estresse Térmico Alto";
            if(containerITU) containerITU.style.borderLeftColor = "#f97316";
        } else if (ituAtual >= 74) {
            statusText.innerHTML = "🌤️ Estresse Térmico Moderado";
            if(containerITU) containerITU.style.borderLeftColor = "#eab308";
        } else {
            statusText.innerHTML = "✅ Conforto Térmico Ideal";
            if(containerITU) containerITU.style.borderLeftColor = "#00b34e";
        }

        const agora = new Date();
        document.getElementById("lblAtualizacao").innerText = agora.toLocaleTimeString('pt-BR');

    } catch (erro) {
        console.error("Falha ao recuperar dados climáticos:", erro);
        if(statusText) statusText.innerHTML = "⚠️ Operando via dados históricos simulados.";
    }
}

// ==========================================================================
// POPULAÇÃO DINÂMICA DOS CAMPOS (SELECTS)
// ==========================================================================
function atualizarFormulario() {
    try {
        const especie = document.getElementById('txtEspecie').value;
        const comboRacaMatriz = document.getElementById('txtRaca');
        const comboRacaReprodutor = document.getElementById('txtRacaReprodutor');
        const comboFinalidade = document.getElementById('txtFinalidade');

        // Limpar seletores
        comboRacaMatriz.innerHTML = '';
        comboRacaReprodutor.innerHTML = '';
        comboFinalidade.innerHTML = '';

        // Injetar Raças Disponíveis
        if (dadosConfig[especie] && dadosConfig[especie].racas) {
            dadosConfig[especie].racas.forEach(r => {
                comboRacaMatriz.add(new Option(r, r));
                comboRacaReprodutor.add(new Option(r, r));
            });
        }

        // Injetar Finalidades
        if (dadosConfig[especie] && dadosConfig[especie].finalidades) {
            dadosConfig[especie].finalidades.forEach(f => {
                comboFinalidade.add(new Option(f, f));
            });
        }

        // Esconder painel de resultados ao trocar as opções base
        document.getElementById('painelResultado').style.display = 'none';
    } catch (erro) {
        console.error("Erro ao atualizar o formulário dinâmico:", erro);
    }
}

// ==========================================================================
// TREINAMENTO E REDE NEURAL (BRAIN.JS)
// ==========================================================================
const dadosTreinamento = [
    { input: { especie: 0.1, finalidade: 0.1, calor: 0.2 }, output: { sucesso: 0.95 } },
    { input: { especie: 0.1, finalidade: 0.2, calor: 0.8 }, output: { sucesso: 0.42 } },
    { input: { especie: 0.2, finalidade: 0.1, calor: 0.3 }, output: { sucesso: 0.90 } },
    { input: { especie: 0.2, finalidade: 0.2, calor: 0.9 }, output: { sucesso: 0.35 } },
    { input: { especie: 0.3, finalidade: 0.4, calor: 0.2 }, output: { sucesso: 0.98 } }
];

// ==========================================================================
// EXECUÇÃO DO MOTOR PREDITIVO (NOME CORRIGIDO)
// ==========================================================================
function executarPredicaoIA() {
    // Trava de segurança caso o Brain.js ainda não tenha treinado
    if (!iaTreinadaEPronta) {
        alert("A Inteligência Artificial ainda está sendo carregada. Por favor, aguarde alguns segundos e tente novamente.");
        return;
    }

    try {
        const esp = document.getElementById('txtEspecie').value;
        const racaMatriz = document.getElementById('txtRaca').value;
        const racaReprodutor = document.getElementById('txtRacaReprodutor').value;
        const fin = document.getElementById('txtFinalidade').value;

        // Normalização das entradas matemáticas para a Rede Neural
        let espInput = esp === 'Bovino' ? 0.1 : esp === 'Ovino' ? 0.2 : 0.3;
        let finInput = 0.1;
        if (fin.includes('Leite')) finInput = 0.2;
        if (fin.includes('Lã')) finInput = 0.3;
        if (fin.includes('Seca')) finInput = 0.4;

        // Fator climático normalizado de 0 a 1 (Ex: ITU 75 vira 0.75)
        let calorInput = (ituAtual / 100) || 0.75; 

        // Processamento na Rede Neural Artificial
        const predicao = net.run({ especie: espInput, finalidade: finInput, calor: calorInput });
        let probabilidadePrenhezSucesso = Math.round((predicao.sucesso || 0.6) * 100);

        // Penalizações e Regras Bioclimáticas por Estresse (Mantidas e Integradas com a nova fórmula ITU)
        let impactoClimatico = 0;
        let alertaClimatico = "";

        if (ituAtual >= 92) {
            impactoClimatico = -35;
            alertaClimatico = `<br><br>🚨 <b>ALERTA CRÍTICO:</b> O ITU em ${dadosUsuario.cidade} está extremo (${ituAtual}). O estresse severo colapsa taxas de prenhez em programas de IATF/Inseminação.`;
        } else if (ituAtual >= 84) {
            impactoClimatico = -20;
            alertaClimatico = `<br><br>⚠️ <b>RESTRIÇÃO AMBIENTAL:</b> Calor severo detectado. Recomenda-se realizar procedimentos estritamente nos horários mais frios do dia (madrugada/manhã).`;
        } else if (ituAtual >= 74) {
            impactoClimatico = -10;
            alertaClimatico = `<br><br>🌤️ <b>ESTRESSE LEVE:</b> O ambiente impõe leve desgaste calórico sobre os animais reprodutores.`;
        }

        probabilidadePrenhezSucesso += impactoClimatico;

        // Travas de segurança percentual (Não menor que 10%, não maior que 100%)
        if (probabilidadePrenhezSucesso > 100) probabilidadePrenhezSucesso = 100;
        if (probabilidadePrenhezSucesso < 10) probabilidadePrenhezSucesso = 10;

        // Construção do Parecer Técnico
        let recomendacaoTextual = `
            ✅ <b>Análise Finalizada com Sucesso:</b>
            O cruzamento planejado entre as linhagens <b>${racaMatriz}</b> (Matriz) e <b>${racaReprodutor}</b> (Reprodutor) foi validado pela inteligência artificial de acordo com os parâmetros zootécnicos e clima da região.
        `;

        // Impactos Específicos por Sensibilidade de Raça
        if ((racaMatriz === 'Saanen' || racaReprodutor === 'Saanen') && temperaturaAtual >= 35) {
            probabilidadePrenhezSucesso -= 15;
            recomendacaoTextual += `<br><br>⚠️ <b>Sensibilidade Frágil:</b> Exemplares da linhagem Saanen sofrem acentuada perda reprodutiva sob temperaturas de ${temperaturaAtual}°C por sua origem europeia.`;
        }
        if ((racaMatriz === 'Moxotó' || racaReprodutor === 'Moxotó')) {
            probabilidadePrenhezSucesso += 5;
            // Garante que não ultrapasse 100% novamente após bônus de raça
            if (probabilidadePrenhezSucesso > 100) probabilidadePrenhezSucesso = 100; 
            recomendacaoTextual += `<br><br>🌵 <b>Vantagem Adaptativa Nativa:</b> A genética Moxotó carrega alta rusticidade, ideal para os biomas semiáridos, mitigando perdas calóricas.`;
        }

        recomendacaoTextual += alertaClimatico;

        // Atualização da Interface Gráfica com Animação da Barra
        document.getElementById('lblScore').innerText = `${probabilidadePrenhezSucesso}%`;
        
        const barra = document.getElementById('lblBarra');
        // Adicionada garantia de width válida
        barra.style.width = `${Math.max(0, Math.min(100, probabilidadePrenhezSucesso))}%`;

        if (probabilidadePrenhezSucesso >= 80) {
            barra.style.backgroundColor = '#00b34e'; // Verde
            document.getElementById('lblScore').style.color = '#00b34e';
        } else if (probabilidadePrenhezSucesso >= 50) {
            barra.style.backgroundColor = '#f97316'; // Laranja
            document.getElementById('lblScore').style.color = '#f97316';
        } else {
            barra.style.backgroundColor = '#ef4444'; // Vermelho
            document.getElementById('lblScore').style.color = '#ef4444';
        }

        document.getElementById('lblRecomendacao').innerHTML = recomendacaoTextual;
        document.getElementById('painelResultado').style.display = 'block';

    } catch (erro) {
        console.error("Erro durante a execução do motor preditivo:", erro);
        alert("Ocorreu um erro ao processar a predição. Verifique o console para mais detalhes.");
    }
}

// ==========================================================================
// INICIALIZAÇÃO OTIMIZADA NO CARREGAMENTO DA PÁGINA
// ==========================================================================
window.addEventListener("load", () => {
    // 1. Carrega dados de interface iniciais
    carregarLocalizacaoDoCadastro();
    atualizarFormulario();

    // 2. Verifica a existência da biblioteca e treina a IA de forma segura e otimizada
    if (typeof brain !== "undefined") {
        try {
            net = new brain.NeuralNetwork({ hiddenLayers: [4] });
            // Reduzido peso do treinamento conforme solicitado
            net.train(dadosTreinamento, { 
                iterations: 500, 
                errorThresh: 0.01 
            });
            iaTreinadaEPronta = true;
            console.log("Potygen AI: Rede neural treinada e pronta para uso.");
        } catch (erroIA) {
            console.error("Falha ao treinar a rede neural:", erroIA);
        }
    } else {
        console.error("Erro Crítico: A biblioteca Brain.js não foi carregada corretamente. Verifique sua conexão ou a tag <script>.");
    }
});