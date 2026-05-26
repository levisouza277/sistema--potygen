function calcularJanelaIA() {
    // 1. Captura dos elementos do DOM
    const especie = document.getElementById("txtEspecieAgenda").value;
    const matriz = document.getElementById("txtIdentificacaoMatriz").value.trim();
    const dataHoraCioInput = document.getElementById("txtDataHoraCio").value;
    
    const feedPlaceholder = document.getElementById("feedPlaceholder");
    const feedCronograma = document.getElementById("feedCronograma");

    // Validação básica de preenchimento
    if (!matriz || !dataHoraCioInput) {
        alert("Por favor, preencha a identificação da matriz e a data/hora do cio.");
        return;
    }

    // 2. Tratamento das datas
    const dataCio = new Date(dataHoraCioInput);
    
    let htmlResultados = `<h3>Cronograma Gerado para Matriz: <strong>${matriz}</strong> (${especie})</h3>`;
    
    // Variáveis que armazenarão os cálculos baseados na regra de negócio
    let textoJanelaInseminacao = "";
    let dataJanelaInicio, dataJanelaFim;
    let dataRetornoCio;
    let diasRetorno = 21; // Padrão bovino/caprino

    // 3. Aplicação das Regras Zootécnicas
    if (especie === "Bovino") {
        const horaDoCio = dataCio.getHours();
        dataRetornoCio = new Date(dataCio);
        dataRetornoCio.setDate(dataCio.getDate() + 21);

        // Regra AM/PM Zootécnica para Bovinos
        if (horaDoCio < 12) {
            // Cio de manhã -> Inseminar à tarde do mesmo dia (Ex: das 14h às 20h)
            textoJanelaInseminacao = `Cio observado no período da <strong>Manhã</strong>. A janela ótima de inseminação é na <strong>Tarde do mesmo dia</strong>.`;
            
            dataJanelaInicio = new Date(dataCio);
            dataJanelaInicio.setHours(14, 0, 0);
            
            dataJanelaFim = new Date(dataCio);
            dataJanelaFim.setHours(20, 0, 0);
        } else {
            // Cio à tarde -> Inseminar na manhã do dia seguinte (Ex: das 06h às 12h do próximo dia)
            textoJanelaInseminacao = `Cio observado no período da <strong>Tarde/Noite</strong>. A janela ótima de inseminação é na <strong>Manhã do dia seguinte</strong>.`;
            
            dataJanelaInicio = new Date(dataCio);
            dataJanelaInicio.setDate(dataCio.getDate() + 1);
            dataJanelaInicio.setHours(6, 0, 0);
            
            dataJanelaFim = new Date(dataCio);
            dataJanelaFim.setDate(dataCio.getDate() + 1);
            dataJanelaFim.setHours(12, 0, 0);
        }

        htmlResultados += gerarCardTimeline("Janela Ótima de Inseminação", textoJanelaInseminacao, dataJanelaInicio, dataJanelaFim, "optimal", "fa-clock");

    } else if (especie === "Caprino") {
        // Regra Caprinos: 12 a 24 horas após início do cio
        diasRetorno = 21;
        dataJanelaInicio = new Date(dataCio);
        dataJanelaInicio.setHours(dataCio.getHours() + 12);
        
        dataJanelaFim = new Date(dataCio);
        dataJanelaFim.setHours(dataCio.getHours() + 24);

        textoJanelaInseminacao = `Protocolo de I.A. para Caprinos: Agendar o procedimento estritamente entre 12 e 24 horas após o primeiro sinal verificado.`;
        dataRetornoCio = new Date(dataCio);
        dataRetornoCio.setDate(dataCio.getDate() + diasRetorno);

        htmlResultados += gerarCardTimeline("Janela Ótima (12h às 24h)", textoJanelaInseminacao, dataJanelaInicio, dataJanelaFim, "optimal", "fa-clock");

    } else if (especie === "Ovino") {
        // Regra Ovinos: 12 a 18 horas após início do cio / Retorno em 17 dias
        diasRetorno = 17;
        dataJanelaInicio = new Date(dataCio);
        dataJanelaInicio.setHours(dataCio.getHours() + 12);
        
        dataJanelaFim = new Date(dataCio);
        dataJanelaFim.setHours(dataCio.getHours() + 18);

        textoJanelaInseminacao = `Protocolo de I.A. para Ovinos: Período de ovulação mais curto. Inseminar obrigatoriamente entre 12 e 18 horas pós-cio.`;
        dataRetornoCio = new Date(dataCio);
        dataRetornoCio.setDate(dataCio.getDate() + diasRetorno);

        htmlResultados += gerarCardTimeline("Janela Estrita (12h às 18h)", textoJanelaInseminacao, dataJanelaInicio, dataJanelaFim, "alert", "fa-hourglass-half");
    }

    // 4. Geração do Alerta de Possível Retorno de Cio (Comum a todas mas com data variável)
    const textoRetorno = `Monitore a matriz atentamente. Caso a fertilização falhe, novos comportamentos de estro podem reaparecer nesta data estimada (+${diasRetorno} dias).`;
    htmlResultados += gerarCardTimeline("Alerta: Possível Retorno de Cio", textoRetorno, dataRetornoCio, null, "info", "fa-arrows-spin");

    // 5. Atualização da Interface do Usuário (UI)
    feedPlaceholder.style.display = "none";
    feedCronograma.innerHTML = htmlResultados;
    feedCronograma.style.display = "flex";
}

// Helper function para estruturar o HTML dos blocos de notificação da timeline
function formatarDataBR(data) {
    if (!data) return "";
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} às ${hora}:${minuto}h`;
}

function gerarCardTimeline(titulo, descricao, dataInicio, dataFim, tipoClasse, icone) {
    let faixaHoraria = formatarDataBR(dataInicio);
    if (dataFim) {
        faixaHoraria += ` até ${formatarDataBR(dataFim)}`;
    }

    return `
        <div class="timeline-item window-${tipoClasse}">
            <div class="timeline-icon">
                <i class="fa-solid ${icone}"></i>
            </div>
            <div class="timeline-content">
                <h4>${titulo}</h4>
                <p>${descricao}</p>
                <span class="timeline-time-badge"><i class="fa-regular fa-clock"></i> Prescrição: ${faixaHoraria}</span>
            </div>
        </div>
    `;
}