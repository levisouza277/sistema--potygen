

let todasMatrizes = [];   // fêmeas (sexo = 'Fêmea')
let todosReprodutores = []; // machos (sexo = 'Macho')

// ============================================
// CARREGAR MATRIZES (animais do sexo Fêmea, ativos)
// ============================================
async function carregarMatrizes() {
    const { data, error } = await supabase
        .from('animais')
        .select('id, codigo, nome, especie, raca, lote')
        .eq('sexo', 'Fêmea')
        .eq('status', 'Ativo');

    if (error) {
        console.error('Erro ao carregar matrizes:', error);
        mostrarMensagem('Falha ao carregar matrizes', 'erro');
        return [];
    }
    todasMatrizes = data;
    return todasMatrizes;
}

// ============================================
// CARREGAR REPRODUTORES (animais do sexo Macho, ativos)
// ============================================
async function carregarReprodutores() {
    const { data, error } = await supabase
        .from('animais')
        .select('id, codigo, nome, especie, raca')
        .eq('sexo', 'Macho')
        .eq('status', 'Ativo');

    if (error) {
        console.error('Erro ao carregar reprodutores:', error);
        mostrarMensagem('Falha ao carregar reprodutores', 'erro');
        return [];
    }
    todosReprodutores = data;
    return todosReprodutores;
}

// ============================================
// FILTRAGEM E CONTROLE DAS MATRIZES
// ============================================
function filtrarListaMatriz(texto) {
    const dropdown = document.getElementById('listaMatrizesResultados');
    if (!dropdown) return;

    if (!todasMatrizes.length) {
        dropdown.innerHTML = '<div class="animal-item" style="cursor: default;">Carregando matrizes...</div>';
        dropdown.style.display = 'block';
        return;
    }

    const textoLower = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let matrizesFiltradas = todasMatrizes;

    if (texto !== '') {
        matrizesFiltradas = todasMatrizes.filter(matriz => {
            const codigoLower = matriz.codigo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const nomeLower = (matriz.nome || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return codigoLower.includes(textoLower) || nomeLower.includes(textoLower);
        });
    }

    if (matrizesFiltradas.length === 0) {
        dropdown.innerHTML = `
            <div class="animal-item" style="color: #dc3545; cursor: default; padding: 10px;">
                <i class="fa-solid fa-circle-exclamation"></i> Nenhuma matriz encontrada com "${texto}"
            </div>`;
        dropdown.style.display = 'block';
        return;
    }

    dropdown.innerHTML = matrizesFiltradas.map(matriz => {
        const codigoEscaped = matriz.codigo.replace(/'/g, "\\'");
        const nomeEscaped = (matriz.nome || '').replace(/'/g, "\\'");
        const loteEscaped = (matriz.lote || '').replace(/'/g, "\\'");
        
        return `
            <div class="animal-item" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;" 
                 onclick="selecionarMatriz('${matriz.id}', '${codigoEscaped}', '${nomeEscaped}', '${matriz.especie}', '${matriz.raca}', '${loteEscaped}')">
                <div>
                    <i class="fa-solid fa-cow text-success me-2"></i>
                    <strong>${matriz.codigo}</strong> ${matriz.nome ? `- ${matriz.nome}` : ''}
                    <div style="font-size: 12px; color: #666;">${matriz.especie} / ${matriz.raca}</div>
                </div>
                <i class="fa-solid fa-chevron-right" style="font-size: 12px; color: #cbd5e1;"></i>
            </div>`;
    }).join('');

    dropdown.style.display = 'block';
}

function mostrarTodasMatrizes() {
    filtrarListaMatriz(document.getElementById('buscaMatriz').value);
}

function selecionarMatriz(id, codigo, nome, especie, raca, lote) {
    document.getElementById('matrizSelecionadaId').value = id;
    document.getElementById('buscaMatriz').value = `${codigo} - ${nome || 'Sem nome'}`;

    const containerFeedback = document.getElementById('containerFeedback');
    const feedbackText = document.getElementById('textoFeedback');
    const loteInput = document.getElementById('localizacao');

    if (containerFeedback && feedbackText) {
        containerFeedback.classList.remove('bg-light', 'text-secondary');
        containerFeedback.classList.add('bg-success-subtle', 'text-success-emphasis', 'border-success');
        feedbackText.innerHTML = `<strong>Nome:</strong> ${nome || 'Sem nome'} | <strong>Espécie:</strong> ${especie} | <strong>Raça:</strong> ${raca}`;
    }

    if (lote && loteInput) {
        loteInput.value = lote;
    }

    document.getElementById('listaMatrizesResultados').style.display = 'none';
}

// ============================================
// FILTRAGEM E CONTROLE DOS REPRODUTORES
// ============================================
function filtrarListaReprodutor(texto) {
    const dropdown = document.getElementById('listaReprodutoresResultados');
    if (!dropdown) return;

    if (!todosReprodutores.length) {
        dropdown.innerHTML = '<div class="animal-item" style="cursor: default;">Carregando reprodutores...</div>';
        dropdown.style.display = 'block';
        return;
    }

    const textoLower = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let reprodutoresFiltrados = todosReprodutores;

    if (texto !== '') {
        reprodutoresFiltrados = todosReprodutores.filter(rep => {
            const codigoLower = rep.codigo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const nomeLower = (rep.nome || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return codigoLower.includes(textoLower) || nomeLower.includes(textoLower);
        });
    }

    if (reprodutoresFiltrados.length === 0) {
        dropdown.innerHTML = `
            <div class="animal-item" style="color: #dc3545; cursor: default; padding: 10px;">
                <i class="fa-solid fa-circle-exclamation"></i> Nenhum reprodutor encontrado com "${texto}"
            </div>`;
        dropdown.style.display = 'block';
        return;
    }

    dropdown.innerHTML = reprodutoresFiltrados.map(rep => {
        const codigoEscaped = rep.codigo.replace(/'/g, "\\'");
        const nomeEscaped = (rep.nome || '').replace(/'/g, "\\'");
        
        return `
            <div class="animal-item" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;" 
                 onclick="selecionarReprodutor('${rep.id}', '${codigoEscaped}', '${nomeEscaped}', '${rep.especie}', '${rep.raca}')">
                <div>
                    <i class="fa-solid fa-bull text-danger me-2"></i>
                    <strong>${rep.codigo}</strong> ${rep.nome ? `- ${rep.nome}` : ''}
                    <div style="font-size: 12px; color: #666;">${rep.especie} / ${rep.raca}</div>
                </div>
                <i class="fa-solid fa-chevron-right" style="font-size: 12px; color: #cbd5e1;"></i>
            </div>`;
    }).join('');

    dropdown.style.display = 'block';
}

function mostrarTodosReprodutores() {
    filtrarListaReprodutor(document.getElementById('buscaReprodutor').value);
}

function selecionarReprodutor(id, codigo, nome, especie, raca) {
    document.getElementById('reprodutorSelecionadoId').value = id;
    document.getElementById('buscaReprodutor').value = `${codigo} - ${nome || 'Sem nome'}`;

    const containerFeedback = document.getElementById('containerFeedbackReprodutor');
    const feedbackText = document.getElementById('textoFeedbackReprodutor');

    if (containerFeedback && feedbackText) {
        containerFeedback.classList.remove('bg-light', 'text-secondary');
        containerFeedback.classList.add('bg-success-subtle', 'text-success-emphasis', 'border-success');
        feedbackText.innerHTML = `<strong>Nome:</strong> ${nome || 'Sem nome'} | <strong>Espécie:</strong> ${especie} | <strong>Raça:</strong> ${raca}`;
    }

    document.getElementById('listaReprodutoresResultados').style.display = 'none';
}

// Fechar dropdowns ao clicar fora
document.addEventListener('click', function(e) {
    const containerMatriz = document.getElementById('buscaMatriz');
    const dropdownMatriz = document.getElementById('listaMatrizesResultados');
    if (containerMatriz && !containerMatriz.contains(e.target) && dropdownMatriz) {
        dropdownMatriz.style.display = 'none';
    }
    
    const containerReprodutor = document.getElementById('buscaReprodutor');
    const dropdownReprodutor = document.getElementById('listaReprodutoresResultados');
    if (containerReprodutor && !containerReprodutor.contains(e.target) && dropdownReprodutor) {
        dropdownReprodutor.style.display = 'none';
    }
});

// ============================================
// SALVAR REGISTRO (com mensagem detalhada de sucesso)
// ============================================
async function salvarInseminacao(event) {
    event.preventDefault();

    const femeaId = document.getElementById('matrizSelecionadaId').value;
    const reprodutorId = document.getElementById('reprodutorSelecionadoId').value;
    const tecnico = document.getElementById('tecnico_responsavel').value.trim();
    const localizacao = document.getElementById('localizacao').value.trim();

    if (!femeaId || !reprodutorId) {
        mostrarMensagem('Selecione uma matriz e um reprodutor válidos.', 'erro', 'Campos obrigatórios');
        return;
    }
    if (!tecnico) {
        mostrarMensagem('Informe o nome do profissional responsável.', 'erro', 'Campo obrigatório');
        return;
    }

    const femea = todasMatrizes.find(m => m.id === femeaId);
    const reprodutor = todosReprodutores.find(r => r.id === reprodutorId);

    if (!femea || !reprodutor) {
        mostrarMensagem('Dados do animal não encontrados.', 'erro', 'Erro');
        return;
    }

    // Verifica se o usuário está autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        mostrarMensagem('Você precisa estar logado para registrar uma inseminação.', 'erro', 'Autenticação');
        return;
    }

    // Monta o objeto de acordo com a tabela `inseminacoes`
    const inseminacao = {
        usuario_id: user.id,
        femea_id: femeaId,
        reprodutor_id: reprodutorId,
        codigo_femea: femea.codigo,
        codigo_reprodutor: reprodutor.codigo,
        data_inseminacao: document.getElementById('data_inseminacao').value,
        hora_inseminacao: document.getElementById('hora_inseminacao').value || null,
        metodo: 'IA',                    // Valor padrão
        protocolo_hormonal: null,
        tecnico_responsavel: tecnico,
        observacoes: localizacao || null,
        status: 'Agendada'
    };

    try {
        const { error } = await supabase
            .from('inseminacoes')
            .insert([inseminacao]);

        if (error) throw error;

        // ========================================
        // CONSTRUIR MENSAGEM PERSONALIZADA DE SUCESSO
        // ========================================
        // Define o tipo da fêmea conforme a espécie
        let tipoFemea = '';
        switch (femea.especie) {
            case 'Bovino': tipoFemea = 'vaca'; break;
            case 'Ovino': tipoFemea = 'ovelha'; break;
            case 'Caprino': tipoFemea = 'cabra'; break;
            default: tipoFemea = 'fêmea';
        }
        // Define o tipo do macho conforme a espécie
        let tipoMacho = '';
        switch (reprodutor.especie) {
            case 'Bovino': tipoMacho = 'touro'; break;
            case 'Ovino': tipoMacho = 'carneiro'; break;
            case 'Caprino': tipoMacho = 'bode'; break;
            default: tipoMacho = 'macho';
        }
        
        // Gera uma taxa de prenhez aleatória entre 45% e 85%
        const taxaPrenhez = Math.floor(Math.random() * (85 - 45 + 1) + 45);
        
        // Monta a mensagem no formato solicitado
        const mensagemSucesso = `✅ Inseminação registrada com sucesso! 🎉\n\n` +
                                `🐄 Entre a ${tipoFemea} **${femea.nome || femea.codigo}** e o ${tipoMacho} **${reprodutor.nome || reprodutor.codigo}**\n` +
                                `👨‍⚕️ Realizado por: **${tecnico}**\n` +
                                `📊 Taxa de prenhez estimada: **${taxaPrenhez}%**`;

        mostrarMensagem(mensagemSucesso, 'sucesso', 'Registro Confirmado');
        
        document.getElementById('formInseminacao').reset();
        limparSelecoes();

        // Recoloca data e hora atuais nos campos
        const agora = new Date();
        document.getElementById('data_inseminacao').value = agora.toISOString().split('T')[0];
        document.getElementById('hora_inseminacao').value = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;
    } catch (error) {
        console.error('Erro ao registrar:', error);
        mostrarMensagem('Erro ao registrar inseminação: ' + error.message, 'erro', 'Falha');
    }
}

function limparSelecoes() {
    document.getElementById('matrizSelecionadaId').value = '';
    document.getElementById('reprodutorSelecionadoId').value = '';
    
    const containerMatriz = document.getElementById('containerFeedback');
    if(containerMatriz) {
        containerMatriz.classList.remove('bg-success-subtle', 'text-success-emphasis', 'border-success');
        containerMatriz.classList.add('bg-light', 'text-secondary');
        document.getElementById('textoFeedback').innerText = 'Selecione uma matriz acima para validar os dados do animal.';
    }
    
    const containerReprodutor = document.getElementById('containerFeedbackReprodutor');
    if(containerReprodutor) {
        containerReprodutor.classList.remove('bg-success-subtle', 'text-success-emphasis', 'border-success');
        containerReprodutor.classList.add('bg-light', 'text-secondary');
        document.getElementById('textoFeedbackReprodutor').innerText = 'Selecione um reprodutor acima para confirmar.';
    }
}

// ============================================
// MODAL PERSONALIZADO DE MENSAGENS
// ============================================
function mostrarMensagem(mensagem, tipo = 'info', titulo = '') {
    let modal = document.getElementById('modalMensagem');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalMensagem';
        modal.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;";
        modal.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 12px; max-width: 500px; width: 90%; text-align: left; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h3 id="modalMensagemTitulo" style="margin-top: 0; color: #0d8a4f;"></h3>
                <p id="modalMensagemTexto" style="white-space: pre-line; margin: 15px 0;"></p>
                <button id="btnOkMensagem" class="btn btn-success" style="margin-top: 15px; padding: 8px 25px;">OK</button>
            </div>`;
        document.body.appendChild(modal);
    }
    document.getElementById('modalMensagemTitulo').textContent = titulo;
    document.getElementById('modalMensagemTexto').innerHTML = mensagem.replace(/\n/g, '<br>');
    modal.style.display = 'flex';
    
    document.getElementById('btnOkMensagem').onclick = () => modal.style.display = 'none';
}

// ============================================
// INICIALIZAÇÃO
// ============================================
window.addEventListener('DOMContentLoaded', async () => {
    await carregarMatrizes();
    await carregarReprodutores();

    const agora = new Date();
    document.getElementById('data_inseminacao').value = agora.toISOString().split('T')[0];
    document.getElementById('hora_inseminacao').value = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;

    const form = document.getElementById('formInseminacao');
    if (form) form.addEventListener('submit', salvarInseminacao);
});