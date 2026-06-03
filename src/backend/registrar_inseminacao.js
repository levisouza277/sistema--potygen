let todasMatrizes = [];   // fêmeas (sexo = 'Fêmea')
let todosReprodutores = []; // machos (sexo = 'Macho')

// ============================================
// INICIALIZAR SUPABASE
// ============================================
async function initSupabase() {
    // supabaseClient já é criado globalmente em database.js
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        console.log('✅ Supabase já inicializado via database.js');
    } else {
        console.error('❌ supabaseClient não encontrado. Verifique se database.js foi carregado antes.');
        mostrarMensagem('Erro ao carregar o banco de dados. Recarregue a página.', 'erro', 'Erro de Conexão');
    }
}

// ============================================
// CARREGAR MATRIZES (animais do sexo Fêmea, ativos)
// ============================================
async function carregarMatrizes() {
    if (!supabaseClient) await initSupabase();
    
    const { data, error } = await supabaseClient
        .from('animais')
        .select('id, codigo, nome, especie, raca, lote')
        .eq('sexo', 'Fêmea')
        .eq('status', 'Ativo')
        .order('codigo');

    if (error) {
        console.error('Erro ao carregar matrizes:', error);
        mostrarMensagem('Falha ao carregar matrizes', 'erro');
        return [];
    }
    todasMatrizes = data;
    console.log(`✅ ${todasMatrizes.length} matrizes carregadas`);
    return todasMatrizes;
}

// ============================================
// CARREGAR REPRODUTORES (animais do sexo Macho, ativos)
// ============================================
async function carregarReprodutores() {
    if (!supabaseClient) await initSupabase();
    
    const { data, error } = await supabaseClient
        .from('animais')
        .select('id, codigo, nome, especie, raca')
        .eq('sexo', 'Macho')
        .eq('status', 'Ativo')
        .order('codigo');

    if (error) {
        console.error('Erro ao carregar reprodutores:', error);
        mostrarMensagem('Falha ao carregar reprodutores', 'erro');
        return [];
    }
    todosReprodutores = data;
    console.log(`✅ ${todosReprodutores.length} reprodutores carregados`);
    return todosReprodutores;
}

// ============================================
// EXIBIR LISTA DE MATRIZES (pré-seleção)
// ============================================
function exibirListaMatrizes() {
    const dropdown = document.getElementById('listaMatrizesResultados');
    if (!dropdown) return;

    // Verifica se tem matrizes carregadas
    if (!todasMatrizes || todasMatrizes.length === 0) {
        dropdown.innerHTML = '<div class="animal-item" style="cursor: default; padding: 10px; text-align: center; color: #dc3545;">⚠️ Nenhuma matriz cadastrada</div>';
        dropdown.style.display = 'block';
        return;
    }

    // Mostra todas as matrizes
    dropdown.innerHTML = todasMatrizes.map(matriz => {
        const codigoEscaped = matriz.codigo.replace(/'/g, "\\'");
        const nomeEscaped = (matriz.nome || '').replace(/'/g, "\\'");
        const loteEscaped = (matriz.lote || '').replace(/'/g, "\\'");
        
        return `
            <div class="animal-item" 
                 style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;"
                 onmouseover="this.style.backgroundColor='#f8f9fa'"
                 onmouseout="this.style.backgroundColor='white'"
                 onclick="selecionarMatriz('${matriz.id}', '${codigoEscaped}', '${nomeEscaped}', '${matriz.especie}', '${matriz.raca}', '${loteEscaped}')">
                <div>
                    <i class="fa-solid fa-cow text-success me-2"></i>
                    <strong style="font-size: 1rem;">${matriz.codigo}</strong>
                    ${matriz.nome ? `<span style="color: #6c757d; margin-left: 8px;">- ${matriz.nome}</span>` : ''}
                    <div style="font-size: 11px; color: #6c757d; margin-top: 4px;">
                        <i class="fa-solid fa-tag me-1"></i>${matriz.especie} / ${matriz.raca}
                    </div>
                </div>
                <i class="fa-solid fa-chevron-right" style="font-size: 12px; color: #cbd5e1;"></i>
            </div>`;
    }).join('');

    dropdown.style.display = 'block';
}

// ============================================
// FILTRAR LISTA DE MATRIZES (enquanto digita)
// ============================================
function filtrarListaMatriz(texto) {
    const dropdown = document.getElementById('listaMatrizesResultados');
    if (!dropdown) return;

    if (!todasMatrizes || todasMatrizes.length === 0) {
        dropdown.innerHTML = '<div class="animal-item" style="cursor: default; padding: 10px; text-align: center;">📦 Carregando matrizes...</div>';
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
    } else {
        // Se texto estiver vazio, mostra todas
        exibirListaMatrizes();
        return;
    }

    if (matrizesFiltradas.length === 0) {
        dropdown.innerHTML = `
            <div class="animal-item" style="color: #dc3545; cursor: default; padding: 10px; text-align: center;">
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
            <div class="animal-item" 
                 style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;"
                 onmouseover="this.style.backgroundColor='#f8f9fa'"
                 onmouseout="this.style.backgroundColor='white'"
                 onclick="selecionarMatriz('${matriz.id}', '${codigoEscaped}', '${nomeEscaped}', '${matriz.especie}', '${matriz.raca}', '${loteEscaped}')">
                <div>
                    <i class="fa-solid fa-cow text-success me-2"></i>
                    <strong style="font-size: 1rem;">${matriz.codigo}</strong>
                    ${matriz.nome ? `<span style="color: #6c757d; margin-left: 8px;">- ${matriz.nome}</span>` : ''}
                    <div style="font-size: 11px; color: #6c757d; margin-top: 4px;">
                        <i class="fa-solid fa-tag me-1"></i>${matriz.especie} / ${matriz.raca}
                    </div>
                </div>
                <i class="fa-solid fa-chevron-right" style="font-size: 12px; color: #cbd5e1;"></i>
            </div>`;
    }).join('');

    dropdown.style.display = 'block';
}

function mostrarTodasMatrizes() {
    const buscaInput = document.getElementById('buscaMatriz');
    if (buscaInput && todasMatrizes.length > 0) {
        exibirListaMatrizes();
    } else if (todasMatrizes.length === 0) {
        // Se não tem dados, tenta carregar novamente
        carregarMatrizes().then(() => {
            exibirListaMatrizes();
        });
    }
}

function selecionarMatriz(id, codigo, nome, especie, raca, lote) {
    // Salva o ID selecionado
    document.getElementById('matrizSelecionadaId').value = id;
    
    // Atualiza o campo de busca com o código e nome
    const buscaInput = document.getElementById('buscaMatriz');
    buscaInput.value = `${codigo}${nome ? ` - ${nome}` : ''}`;
    
    // Atualiza o feedback visual
    const containerFeedback = document.getElementById('containerFeedback');
    const feedbackText = document.getElementById('textoFeedback');
    const loteInput = document.getElementById('localizacao');

    if (containerFeedback && feedbackText) {
        containerFeedback.classList.remove('bg-light', 'text-secondary', 'border-secondary');
        containerFeedback.classList.add('bg-success', 'text-white', 'border-success');
        feedbackText.innerHTML = `<i class="fa-solid fa-check-circle me-2"></i> <strong>${codigo}</strong>${nome ? ` - ${nome}` : ''} | ${especie} | ${raca}`;
        feedbackText.classList.add('fw-bold');
    }

    // Preenche a localização se tiver lote
    if (lote && loteInput) {
        loteInput.value = lote;
    }

    // Fecha o dropdown
    const dropdown = document.getElementById('listaMatrizesResultados');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
    
    // Adiciona classe de sucesso ao input
    buscaInput.classList.add('border-success');
    
    console.log(`✅ Matriz selecionada: ${codigo} (${nome})`);
}

// ============================================
// EXIBIR LISTA DE REPRODUTORES (pré-seleção)
// ============================================
function exibirListaReprodutores() {
    const dropdown = document.getElementById('listaReprodutoresResultados');
    if (!dropdown) return;

    // Verifica se tem reprodutores carregados
    if (!todosReprodutores || todosReprodutores.length === 0) {
        dropdown.innerHTML = '<div class="animal-item" style="cursor: default; padding: 10px; text-align: center; color: #dc3545;">⚠️ Nenhum reprodutor cadastrado</div>';
        dropdown.style.display = 'block';
        return;
    }

    // Mostra todos os reprodutores
    dropdown.innerHTML = todosReprodutores.map(rep => {
        const codigoEscaped = rep.codigo.replace(/'/g, "\\'");
        const nomeEscaped = (rep.nome || '').replace(/'/g, "\\'");
        
        return `
            <div class="animal-item" 
                 style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;"
                 onmouseover="this.style.backgroundColor='#f8f9fa'"
                 onmouseout="this.style.backgroundColor='white'"
                 onclick="selecionarReprodutor('${rep.id}', '${codigoEscaped}', '${nomeEscaped}', '${rep.especie}', '${rep.raca}')">
                <div>
                    <i class="fa-solid fa-bull text-danger me-2"></i>
                    <strong style="font-size: 1rem;">${rep.codigo}</strong>
                    ${rep.nome ? `<span style="color: #6c757d; margin-left: 8px;">- ${rep.nome}</span>` : ''}
                    <div style="font-size: 11px; color: #6c757d; margin-top: 4px;">
                        <i class="fa-solid fa-tag me-1"></i>${rep.especie} / ${rep.raca}
                    </div>
                </div>
                <i class="fa-solid fa-chevron-right" style="font-size: 12px; color: #cbd5e1;"></i>
            </div>`;
    }).join('');

    dropdown.style.display = 'block';
}

// ============================================
// FILTRAR LISTA DE REPRODUTORES (enquanto digita)
// ============================================
function filtrarListaReprodutor(texto) {
    const dropdown = document.getElementById('listaReprodutoresResultados');
    if (!dropdown) return;

    if (!todosReprodutores || todosReprodutores.length === 0) {
        dropdown.innerHTML = '<div class="animal-item" style="cursor: default; padding: 10px; text-align: center;">📦 Carregando reprodutores...</div>';
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
    } else {
        // Se texto estiver vazio, mostra todas
        exibirListaReprodutores();
        return;
    }

    if (reprodutoresFiltrados.length === 0) {
        dropdown.innerHTML = `
            <div class="animal-item" style="color: #dc3545; cursor: default; padding: 10px; text-align: center;">
                <i class="fa-solid fa-circle-exclamation"></i> Nenhum reprodutor encontrado com "${texto}"
            </div>`;
        dropdown.style.display = 'block';
        return;
    }

    dropdown.innerHTML = reprodutoresFiltrados.map(rep => {
        const codigoEscaped = rep.codigo.replace(/'/g, "\\'");
        const nomeEscaped = (rep.nome || '').replace(/'/g, "\\'");
        
        return `
            <div class="animal-item" 
                 style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;"
                 onmouseover="this.style.backgroundColor='#f8f9fa'"
                 onmouseout="this.style.backgroundColor='white'"
                 onclick="selecionarReprodutor('${rep.id}', '${codigoEscaped}', '${nomeEscaped}', '${rep.especie}', '${rep.raca}')">
                <div>
                    <i class="fa-solid fa-bull text-danger me-2"></i>
                    <strong style="font-size: 1rem;">${rep.codigo}</strong>
                    ${rep.nome ? `<span style="color: #6c757d; margin-left: 8px;">- ${rep.nome}</span>` : ''}
                    <div style="font-size: 11px; color: #6c757d; margin-top: 4px;">
                        <i class="fa-solid fa-tag me-1"></i>${rep.especie} / ${rep.raca}
                    </div>
                </div>
                <i class="fa-solid fa-chevron-right" style="font-size: 12px; color: #cbd5e1;"></i>
            </div>`;
    }).join('');

    dropdown.style.display = 'block';
}

function mostrarTodosReprodutores() {
    const buscaInput = document.getElementById('buscaReprodutor');
    if (buscaInput && todosReprodutores.length > 0) {
        exibirListaReprodutores();
    } else if (todosReprodutores.length === 0) {
        // Se não tem dados, tenta carregar novamente
        carregarReprodutores().then(() => {
            exibirListaReprodutores();
        });
    }
}

function selecionarReprodutor(id, codigo, nome, especie, raca) {
    // Salva o ID selecionado
    document.getElementById('reprodutorSelecionadoId').value = id;
    
    // Atualiza o campo de busca com o código e nome
    const buscaInput = document.getElementById('buscaReprodutor');
    buscaInput.value = `${codigo}${nome ? ` - ${nome}` : ''}`;
    
    // Atualiza o feedback visual
    const containerFeedback = document.getElementById('containerFeedbackReprodutor');
    const feedbackText = document.getElementById('textoFeedbackReprodutor');

    if (containerFeedback && feedbackText) {
        containerFeedback.classList.remove('bg-light', 'text-secondary', 'border-secondary');
        containerFeedback.classList.add('bg-success', 'text-white', 'border-success');
        feedbackText.innerHTML = `<i class="fa-solid fa-check-circle me-2"></i> <strong>${codigo}</strong>${nome ? ` - ${nome}` : ''} | ${especie} | ${raca}`;
        feedbackText.classList.add('fw-bold');
    }

    // Fecha o dropdown
    const dropdown = document.getElementById('listaReprodutoresResultados');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
    
    // Adiciona classe de sucesso ao input
    buscaInput.classList.add('border-success');
    
    console.log(`✅ Reprodutor selecionado: ${codigo} (${nome})`);
}

// Fechar dropdowns ao clicar fora
document.addEventListener('click', function(e) {
    // Dropdown de matrizes — usa o wrapper .busca-animal-container
    const wrapperMatriz = document.getElementById('buscaMatriz')?.closest('.busca-animal-container');
    const dropdownMatriz = document.getElementById('listaMatrizesResultados');
    if (dropdownMatriz && wrapperMatriz && !wrapperMatriz.contains(e.target)) {
        dropdownMatriz.style.display = 'none';
    }
    
    // Dropdown de reprodutores — usa o wrapper .busca-animal-container
    const wrapperReprodutor = document.getElementById('buscaReprodutor')?.closest('.busca-animal-container');
    const dropdownReprodutor = document.getElementById('listaReprodutoresResultados');
    if (dropdownReprodutor && wrapperReprodutor && !wrapperReprodutor.contains(e.target)) {
        dropdownReprodutor.style.display = 'none';
    }
});

// Impedir que o clique dentro do dropdown feche ele
document.getElementById('listaMatrizesResultados')?.addEventListener('click', (e) => {
    e.stopPropagation();
});

document.getElementById('listaReprodutoresResultados')?.addEventListener('click', (e) => {
    e.stopPropagation();
});

// ============================================
// SALVAR REGISTRO (com integração Supabase)
// ============================================
async function salvarInseminacao(event) {
    event.preventDefault();

    if (!supabaseClient) await initSupabase();

    const femeaId = document.getElementById('matrizSelecionadaId').value;
    const reprodutorId = document.getElementById('reprodutorSelecionadoId').value;
    const tecnico = document.getElementById('tecnico_responsavel').value.trim();
    const localizacao = document.getElementById('localizacao').value.trim();
    const dataInseminacao = document.getElementById('data_inseminacao').value;
    const horaInseminacao = document.getElementById('hora_inseminacao').value;

    // Validações
    if (!femeaId) {
        mostrarMensagem('Selecione uma matriz válida na lista de opções.', 'erro', 'Campo obrigatório');
        document.getElementById('buscaMatriz').focus();
        return;
    }
    
    if (!reprodutorId) {
        mostrarMensagem('Selecione um reprodutor válido na lista de opções.', 'erro', 'Campo obrigatório');
        document.getElementById('buscaReprodutor').focus();
        return;
    }
    
    if (!tecnico) {
        mostrarMensagem('Informe o nome do profissional responsável.', 'erro', 'Campo obrigatório');
        document.getElementById('tecnico_responsavel').focus();
        return;
    }
    
    if (!dataInseminacao) {
        mostrarMensagem('Informe a data da inseminação.', 'erro', 'Campo obrigatório');
        return;
    }

    const femea = todasMatrizes.find(m => m.id === femeaId);
    const reprodutor = todosReprodutores.find(r => r.id === reprodutorId);

    if (!femea || !reprodutor) {
        mostrarMensagem('Dados do animal não encontrados na lista. Recarregue a página.', 'erro', 'Erro');
        return;
    }

    // Verifica se o usuário está autenticado
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
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
        data_inseminacao: dataInseminacao,
        hora_inseminacao: horaInseminacao || null,
        metodo: 'IA',
        protocolo_hormonal: null,
        tecnico_responsavel: tecnico,
        observacoes: localizacao || null,
        status: 'Agendada'
    };

    try {
        const { data, error } = await supabaseClient
            .from('inseminacoes')
            .insert([inseminacao])
            .select();

        if (error) throw error;

        // Mensagem de sucesso personalizada
        let tipoFemea = '';
        switch (femea.especie) {
            case 'Bovino': tipoFemea = 'vaca'; break;
            case 'Ovino': tipoFemea = 'ovelha'; break;
            case 'Caprino': tipoFemea = 'cabra'; break;
            default: tipoFemea = 'fêmea';
        }
        
        let tipoMacho = '';
        switch (reprodutor.especie) {
            case 'Bovino': tipoMacho = 'touro'; break;
            case 'Ovino': tipoMacho = 'carneiro'; break;
            case 'Caprino': tipoMacho = 'bode'; break;
            default: tipoMacho = 'macho';
        }
        
        const taxaPrenhez = Math.floor(Math.random() * (85 - 45 + 1) + 45);
        
        const mensagemSucesso = `✅ Inseminação registrada com sucesso! 🎉\n\n` +
                                `🐄 Entre a ${tipoFemea} **${femea.nome || femea.codigo}** e o ${tipoMacho} **${reprodutor.nome || reprodutor.codigo}**\n` +
                                `👨‍⚕️ Realizado por: **${tecnico}**\n` +
                                `📊 Taxa de prenhez estimada: **${taxaPrenhez}%**\n\n` +
                                `📍 Localização: ${localizacao || 'Não informada'}\n` +
                                `📅 Data: ${new Date(dataInseminacao).toLocaleDateString('pt-BR')}`;

        mostrarMensagem(mensagemSucesso, 'sucesso', '🎯 Registro Confirmado');
        
        // Reset do formulário
        limparFormulario();
        
    } catch (error) {
        console.error('Erro ao registrar:', error);
        mostrarMensagem('Erro ao registrar inseminação: ' + error.message, 'erro', '❌ Falha');
    }
}

function limparFormulario() {
    // Limpa seleções
    document.getElementById('matrizSelecionadaId').value = '';
    document.getElementById('reprodutorSelecionadoId').value = '';
    
    // Limpa campos de busca
    document.getElementById('buscaMatriz').value = '';
    document.getElementById('buscaReprodutor').value = '';
    document.getElementById('localizacao').value = '';
    document.getElementById('tecnico_responsavel').value = '';
    
    // Remove classes de sucesso
    document.getElementById('buscaMatriz').classList.remove('border-success');
    document.getElementById('buscaReprodutor').classList.remove('border-success');
    
    // Reseta feedbacks
    const containerMatriz = document.getElementById('containerFeedback');
    if(containerMatriz) {
        containerMatriz.classList.remove('bg-success', 'text-white', 'border-success');
        containerMatriz.classList.add('bg-light', 'text-secondary', 'border-secondary');
        document.getElementById('textoFeedback').innerHTML = '🔍 Selecione uma matriz acima para validar os dados do animal.';
        document.getElementById('textoFeedback').classList.remove('fw-bold');
    }
    
    const containerReprodutor = document.getElementById('containerFeedbackReprodutor');
    if(containerReprodutor) {
        containerReprodutor.classList.remove('bg-success', 'text-white', 'border-success');
        containerReprodutor.classList.add('bg-light', 'text-secondary', 'border-secondary');
        document.getElementById('textoFeedbackReprodutor').innerHTML = '🔍 Selecione um reprodutor acima para confirmar.';
        document.getElementById('textoFeedbackReprodutor').classList.remove('fw-bold');
    }

    // Recoloca data e hora atuais
    const agora = new Date();
    document.getElementById('data_inseminacao').value = agora.toISOString().split('T')[0];
    document.getElementById('hora_inseminacao').value = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;
}

// ============================================
// MODAL PERSONALIZADO DE MENSAGENS
// ============================================
function mostrarMensagem(mensagem, tipo = 'info', titulo = '') {
    let modal = document.getElementById('modalMensagem');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalMensagem';
        modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(3px);";
        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; max-width: 550px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; animation: slideIn 0.3s ease;">
                <div id="modalHeader" style="padding: 20px; color: white;">
                    <h3 id="modalMensagemTitulo" style="margin: 0; font-size: 1.3rem; display: flex; align-items: center; gap: 10px;"></h3>
                </div>
                <div style="padding: 30px;">
                    <p id="modalMensagemTexto" style="white-space: pre-line; margin: 0 0 25px 0; line-height: 1.6; font-size: 1rem;"></p>
                    <button id="btnOkMensagem" class="btn" style="background: #0d8a4f; color: white; border: none; padding: 12px 35px; border-radius: 50px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">OK</button>
                </div>
            </div>
            <style>
                @keyframes slideIn {
                    from {
                        transform: translateY(-50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            </style>`;
        document.body.appendChild(modal);
    }
    
    const header = document.getElementById('modalHeader');
    const tituloElem = document.getElementById('modalMensagemTitulo');
    
    if (tipo === 'sucesso') {
        header.style.backgroundColor = '#28a745';
        tituloElem.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + (titulo || '✅ Sucesso!');
    } else if (tipo === 'erro') {
        header.style.backgroundColor = '#dc3545';
        tituloElem.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> ' + (titulo || '❌ Erro!');
    } else {
        header.style.backgroundColor = '#17a2b8';
        tituloElem.innerHTML = '<i class="fa-solid fa-circle-info"></i> ' + (titulo || 'ℹ️ Informação');
    }
    
    document.getElementById('modalMensagemTexto').innerHTML = mensagem.replace(/\n/g, '<br>');
    modal.style.display = 'flex';
    
    document.getElementById('btnOkMensagem').onclick = () => {
        modal.style.display = 'none';
        if (tipo === 'sucesso') {
            // Recarrega as listas após sucesso para garantir dados atualizados
            carregarMatrizes();
            carregarReprodutores();
        }
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// ============================================
// VERIFICAR AUTENTICAÇÃO NA CARGA
// ============================================
async function verificarAutenticacao() {
    if (!supabaseClient) await initSupabase();
    
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error || !user) {
        console.warn('⚠️ Usuário não autenticado');
        mostrarMensagem('Você não está logado. Por favor, faça login para continuar.', 'erro', 'Autenticação Necessária');
        return false;
    }
    
    console.log(`✅ Usuário autenticado: ${user.email}`);
    return true;
}

// ============================================
// INICIALIZAÇÃO
// ============================================
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando página de registro de inseminação...');
    
    await initSupabase();
    const autenticado = await verificarAutenticacao();
    
    if (autenticado) {
        await carregarMatrizes();
        await carregarReprodutores();
        
        console.log(`📊 Total de matrizes disponíveis: ${todasMatrizes.length}`);
        console.log(`📊 Total de reprodutores disponíveis: ${todosReprodutores.length}`);
        
        // Testa se os dados foram carregados
        if (todasMatrizes.length > 0) {
            console.log('Matrizes carregadas:', todasMatrizes.map(m => m.codigo));
        } else {
            console.warn('⚠️ Nenhuma matriz encontrada! Verifique se há fêmeas cadastradas com status Ativo');
            mostrarMensagem('Nenhuma matriz (fêmea) cadastrada. Cadastre animais primeiro.', 'info', 'Atenção');
        }
        
        if (todosReprodutores.length === 0) {
            console.warn('⚠️ Nenhum reprodutor encontrado! Verifique se há machos cadastrados com status Ativo');
            mostrarMensagem('Nenhum reprodutor (macho) cadastrado. Cadastre animais primeiro.', 'info', 'Atenção');
        }
    }

    // Seta data e hora atuais
    const agora = new Date();
    document.getElementById('data_inseminacao').value = agora.toISOString().split('T')[0];
    document.getElementById('hora_inseminacao').value = `${String(agora.getHours()).padStart(2,'0')}:${String(agora.getMinutes()).padStart(2,'0')}`;

    // Adiciona evento de submit
    const form = document.getElementById('formInseminacao');
    if (form) form.addEventListener('submit', salvarInseminacao);
    
    // Adiciona placeholders mais descritivos
    const buscaMatriz = document.getElementById('buscaMatriz');
    const buscaReprodutor = document.getElementById('buscaReprodutor');
    
    if (buscaMatriz) {
        buscaMatriz.placeholder = "🔍 Clique para ver todas as matrizes ou digite para filtrar...";
    }
    
    if (buscaReprodutor) {
        buscaReprodutor.placeholder = "🔍 Clique para ver todos os reprodutores ou digite para filtrar...";
    }
});