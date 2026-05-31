document.addEventListener('DOMContentLoaded', function() {
    const modalForm = document.getElementById('modalForm');
    const modalVisualizar = document.getElementById('modalVisualizar');
    const modalTitle = document.getElementById('modalTitle');
    const btnSalvar = document.getElementById('btnSalvar');
    
    const btnNovoAnimal = document.getElementById('btnNovoAnimal');
    const btnSair = document.getElementById('btnSair');
    const btnClose = document.querySelectorAll('.close, .btn-close-modal');

    // Abrir Modal para Cadastro
    btnNovoAnimal.addEventListener('click', () => {
        modalTitle.innerText = "Cadastrar Novo Animal";
        btnSalvar.innerText = "Cadastrar Animal";
        limparFormulario();
        modalForm.style.display = "flex";
    });

    // Abrir Modal para Edição
    document.querySelectorAll('.btn-action-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            modalTitle.innerText = "Editar Animal";
            btnSalvar.innerText = "Salvar Alterações";
            
            // Preenche dados simulados para edição
            document.getElementById('formCodigo').value = this.dataset.codigo;
            document.getElementById('formNome').value = this.dataset.nome;
            document.getElementById('formRaca').value = this.dataset.raca;
            
            modalForm.style.display = "flex";
        });
    });

    // Abrir Visualização
    document.querySelectorAll('.btn-action-view').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('viewCodigo').innerText = this.dataset.codigo;
            document.getElementById('viewNome').innerText = this.dataset.nome;
            document.getElementById('viewEspecie').innerText = this.dataset.especie;
            document.getElementById('viewRaca').innerText = this.dataset.raca;
            document.getElementById('viewPeso').innerText = this.dataset.peso;
            document.getElementById('viewStatus').innerText = this.dataset.status;
            modalVisualizar.style.display = "flex";
        });
    });

    // Fechar Modais
    btnClose.forEach(btn => {
        btn.addEventListener('click', () => {
            modalForm.style.display = "none";
            modalVisualizar.style.display = "none";
        });
    });

    // Fechar ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target.className === 'modal') {
            modalForm.style.display = "none";
            modalVisualizar.style.display = "none";
        }
    });

    function limparFormulario() {
        const inputs = modalForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => input.value = "");
    }


    btnSalvar.addEventListener('click', () => {
        mostrarMensagem('Ação realizada com sucesso!', 'sucesso');
        modalForm.style.display = "none";
    });
});

    // ============================================
    // SISTEMA DE ARMAZENAMENTO DE ANIMAIS
    // ============================================
    
    let animais = JSON.parse(localStorage.getItem('potygen_animais') || '[]');
    // ============================================
// BANCO DE DOENÇAS POR ESPÉCIE E SEXO
// ============================================

const bancoDoencas = {
    'Bovino': {
        'Macho': [
            'Brucelose bovina (mal de casco/touro caído)',
            'Tricomonose (Tritrichomonas foetus - cio repetido)',
            'Campilobacteriose genital (vibrião - cio sujo)',
            'Leptospirose (urina de rato)',
            'Mycoplasma bovis (inflamação reprodutiva)',
            'Ureaplasma spp.',
            'Tristeza parasitária bovina (babesiose/anaplasmose)',
            'Verminoses'
        ],
        'Fêmea': [
            'Brucelose (aborto contagioso)',
            'Leptospirose',
            'Campilobacteriose genital bovina',
            'Tricomonose',
            'IBR (rinotraqueíte - resfriado bovino reprodutivo)',
            'BVD (diarreia viral bovina)',
            'Neosporose (principal causa de aborto no Brasil)',
            'Endometrite/metrite pós-parto',
            'Infecção uterina subclínica',
            'Cetose',
            'Hipocalcemia',
            'Tristeza parasitária',
            'Verminoses'
        ]
    },
    'Ovino': {
        'Macho': [
            'Brucella ovis (epididimite ovina)',
            'Actinobacillus seminis',
            'Histophilus somni',
            'Salmonella enterica',
            'Corynebacterium pseudotuberculosis',
            'Maedi-visna',
            'Vírus da língua azul',
            'Toxoplasmose (impacto indireto via ambiente)',
            'Pasteurelose (fraqueza geral)'
        ],
        'Fêmea': [
            'Toxoplasmose (aborto das ovelhas)',
            'Brucella ovis (indireto)',
            'Maedi-visna',
            'Clostridioses (enterotoxemia - doença do excesso de ração)',
            'Pododermatite (podridão dos cascos)',
            'Verminoses',
            'Hipocalcemia',
            'Cetose'
        ]
    },
    'Caprino': {
        'Macho': [
            'CAEV (artrite encefalite caprina)',
            'Brucelose (B. melitensis)',
            'Clamidiose (Chlamydophila abortus)',
            'Febre Q (Coxiella burnetii)',
            'Linfadenite caseosa',
            'Mycoplasma agalactiae',
            'Toxoplasmose (importante no sistema extensivo)'
        ],
        'Fêmea': [
            'CAEV',
            'Brucelose',
            'Clamidiose (abortos enzoóticos)',
            'Toxoplasmose (principal causa de aborto em cabras no Nordeste)',
            'Febre Q',
            'Linfadenite caseosa',
            'Enterotoxemia',
            'Verminoses',
            'Cetose'
        ]
    }
};

let doencasSelecionadas = [];

// Função para atualizar lista de doenças baseado em espécie e sexo
// Função para buscar crias de um determinado pai
function buscarCriasPorPai() {
    const paiInput = document.getElementById('formPaiMacho');
    const paiNome = paiInput ? paiInput.value : '';
    const qtdCriasInput = document.getElementById('formQtdCriasMacho');
    const container = document.getElementById('listaCriasMachoContainer');
    
    if (!paiNome || paiNome === '') {
        container.innerHTML = '<p style="color: #64748b; font-size: 13px;">Digite o nome/código do pai para buscar suas crias automaticamente</p>';
        return;
    }
    
    // Buscar todos os animais onde o pai é este macho
    const crias = animais.filter(animal => {
        const paiDoAnimal = animal.pai || animal.paiMacho || animal.paiFemea;
        return paiDoAnimal && paiDoAnimal.includes(paiNome);
    });
    
    if (crias.length > 0) {
        qtdCriasInput.value = crias.length;
        
        let html = '<div class="sub-block"><h4>🐄 Crias/Descendentes Registrados</h4>';
        html += '<div style="max-height: 200px; overflow-y: auto;">';
        
        crias.forEach(cria => {
            const idade = calcularIdade(cria.dataNascimento);
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #e2e8f0;">
                    <div>
                        <strong>${cria.codigo}</strong> - ${cria.nome || 'Sem nome'}
                        <span style="color: #64748b; font-size: 12px; margin-left: 10px;">${idade}</span>
                    </div>
                    <span style="background: #e2e8f0; padding: 2px 8px; border-radius: 20px; font-size: 11px;">${cria.sexo}</span>
                </div>
            `;
        });
        
        html += '</div></div>';
        container.innerHTML = html;
    } else {
        const qtdManual = qtdCriasInput.value;
        if (qtdManual > 0) {
            container.innerHTML = `<p style="color: #64748b; font-size: 13px;">${qtdManual} crias registradas manualmente</p>`;
        } else {
            container.innerHTML = '<p style="color: #64748b; font-size: 13px;">Nenhuma cria encontrada para este pai</p>';
        }
    }
}

// Função para atualizar lista de doenças para MACHO
// Função para atualizar lista de doenças para MACHO (Corrigida)
function atualizarListaDoencasMacho() {
    const especie = document.getElementById('formEspecie').value;
    const container = document.getElementById('listaDoencasContainerMacho');
    
    console.log("Chamou atualizarListaDoencasMacho - Espécie:", especie);
    
    if (!container) {
        console.log("Container listaDoencasContainerMacho NÃO encontrado no HTML!");
        return;
    }
    
    if (!especie) {
        container.innerHTML = '<p style="color: #64748b; font-size: 13px;">Selecione a espécie primeiro</p>';
        return;
    }
    
    const doencas = bancoDoencas[especie]?.['Macho'] || [];
    console.log("Doenças de macho encontradas:", doencas);
    
    if (doencas.length === 0) {
        container.innerHTML = '<p style="color: #64748b; font-size: 13px;">Nenhuma doença cadastrada para este macho</p>';
        return;
    }
    
    let html = '<div class="section-title" style="margin-top: 10px;">Doenças Registradas (Macho)</div>';
    html += '<div class="form-grid" style="flex-direction: column; gap: 15px;">';
    
    doencas.forEach(doenca => {
        // Correção do ID para evitar duplicação do prefixo
        const doencaId = 'macho_' + doenca.replace(/[^a-zA-Z0-9]/g, '_');
        
        html += `
            <div class="doenca-card" style="background: #f8fafc; border-radius: 12px; padding: 15px; border: 1px solid #e2e8f0;">
                <label style="display: flex; align-items: center; gap: 10px; font-weight: 600; cursor: pointer; margin-bottom: 10px;">
                    <input type="checkbox" value="${doenca.replace(/"/g, '&quot;')}" class="doenca-checkbox-macho" onchange="toggleDoencaDetalhesMacho(this, '${doencaId}')">
                    ${doenca}
                </label>
                
                <div id="detalhes_${doencaId}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <div class="form-grid">
                        <div class="input-group">
                            <label>Data do Diagnóstico</label>
                            <input type="date" id="dataDoencaMacho_${doencaId}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        </div>
                        <div class="input-group">
                            <label>Já tratou esta doença?</label>
                            <select id="tratouDoencaMacho_${doencaId}" onchange="toggleTratamentoCamposMacho(this, '${doencaId}')" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <option value="">Selecione...</option>
                                <option value="sim">Sim</option>
                                <option value="nao">Não</option>
                            </select>
                        </div>
                    </div>
                    
                    <div id="tratamentoCamposMacho_${doencaId}" style="display: none; margin-top: 15px;">
                        <div class="form-grid">
                            <div class="input-group">
                                <label>Data do Tratamento</label>
                                <input type="date" id="dataTratamentoMacho_${doencaId}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            </div>
                            <div class="input-group">
                                <label>Tipo de Tratamento</label>
                                <input type="text" id="tipoTratamentoMacho_${doencaId}" placeholder="Ex: Antibiótico..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            </div>
                        </div>
                        <div class="input-group" style="margin-top: 10px;">
                            <label>Observações</label>
                            <textarea id="obsTratamentoMacho_${doencaId}" rows="2" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;"></textarea>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Função auxiliar corrigida para o Macho abrir a div correta
function toggleDoencaDetalhesMacho(checkbox, doencaId) {
    const detalhesDiv = document.getElementById(`detalhes_${doencaId}`);
    if (detalhesDiv) {
        detalhesDiv.style.display = checkbox.checked ? 'block' : 'none';
    }
}

function toggleTratamentoCamposMacho(select, doencaId) {
    const tratamentoCampos = document.getElementById(`tratamentoCamposMacho_${doencaId}`);
    if (select.value === 'sim') {
        tratamentoCampos.style.display = 'block';
    } else {
        tratamentoCampos.style.display = 'none';
    }
}

// Função para coletar doenças do MACHO no salvamento
function coletarDoencasMacho() {
    const doencasRegistradas = [];
    const especie = document.getElementById('formEspecie').value;
    
    if (!especie) return [];
    
    const doencas = bancoDoencas[especie]?.['Macho'] || [];
    
    doencas.forEach(doenca => {
        const doencaId = 'macho_' + doenca.replace(/[^a-zA-Z0-9]/g, '_');
        const checkbox = document.querySelector(`.doenca-checkbox-macho[value="${doenca.replace(/"/g, '&quot;')}"]`);
        if (checkbox && checkbox.checked) {
            doencasRegistradas.push({
                nome: doenca,
                dataDiagnostico: document.getElementById(`dataDoencaMacho_${doencaId}`)?.value || null,
                tratou: document.getElementById(`tratouDoencaMacho_${doencaId}`)?.value === 'sim',
                dataTratamento: document.getElementById(`dataTratamentoMacho_${doencaId}`)?.value || null,
                tipoTratamento: document.getElementById(`tipoTratamentoMacho_${doencaId}`)?.value || null,
                observacoesTratamento: document.getElementById(`obsTratamentoMacho_${doencaId}`)?.value || null
            });
        }
    });
    
    return doencasRegistradas;
}
function atualizarListaDoencas() {
    const especie = document.getElementById('formEspecie').value;
    const sexo = document.getElementById('formSexo').value;
    const container = document.getElementById('listaDoencasContainer');
    
    if (!container) return;
    
    if (!especie || !sexo) {
        container.innerHTML = '<p style="color: #64748b; font-size: 13px;">Selecione espécie e sexo primeiro</p>';
        return;
    }
    
    const doencas = bancoDoencas[especie]?.[sexo] || [];
    
    if (doencas.length === 0) {
        container.innerHTML = '<p style="color: #64748b; font-size: 13px;">Nenhuma doença cadastrada para esta combinação</p>';
        return;
    }
    
    let html = '<div class="section-title" style="margin-top: 10px;">Doenças Registradas</div>';
    html += '<div class="form-grid" style="flex-direction: column; gap: 15px;">';
    
    doencas.forEach(doenca => {
        const doencaId = doenca.replace(/[^a-zA-Z0-9]/g, '_');
        html += `
            <div class="doenca-card" style="background: #f8fafc; border-radius: 12px; padding: 15px; border: 1px solid #e2e8f0;">
                <label style="display: flex; align-items: center; gap: 10px; font-weight: 600; cursor: pointer; margin-bottom: 10px;">
                    <input type="checkbox" value="${doenca.replace(/"/g, '&quot;')}" class="doenca-checkbox" onchange="toggleDoencaDetalhes(this, '${doencaId}')">
                    ${doenca}
                </label>
                <div id="detalhes_${doencaId}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <div class="form-grid">
                        <div class="input-group">
                            <label>Data do Diagnóstico</label>
                            <input type="date" id="dataDoenca_${doencaId}" class="doenca-data" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        </div>
                        <div class="input-group">
                            <label>Já tratou esta doença?</label>
                            <select id="tratouDoenca_${doencaId}" class="tratou-select" onchange="toggleTratamentoCampos(this, '${doencaId}')" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <option value="">Selecione...</option>
                                <option value="sim">Sim</option>
                                <option value="nao">Não</option>
                            </select>
                        </div>
                    </div>
                    <div id="tratamentoCampos_${doencaId}" style="display: none;">
                        <div class="form-grid">
                            <div class="input-group">
                                <label>Data do Tratamento</label>
                                <input type="date" id="dataTratamento_${doencaId}" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            </div>
                            <div class="input-group">
                                <label>Tipo de Tratamento</label>
                                <input type="text" id="tipoTratamento_${doencaId}" placeholder="Ex: Antibiótico, Anti-inflamatório..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            </div>
                        </div>
                        <div class="input-group">
                            <label>Observações do Tratamento</label>
                            <textarea id="obsTratamento_${doencaId}" rows="2" placeholder="Informações adicionais sobre o tratamento..." style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;"></textarea>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Função para mostrar/esconder detalhes da doença
function toggleDoencaDetalhes(checkbox, doencaId) {
    const detalhesDiv = document.getElementById(`detalhes_${doencaId}`);
    if (checkbox.checked) {
        detalhesDiv.style.display = 'block';
    } else {
        detalhesDiv.style.display = 'none';
    }
}

// Função para mostrar/esconder campos de tratamento
function toggleTratamentoCampos(select, doencaId) {
    const tratamentoCampos = document.getElementById(`tratamentoCampos_${doencaId}`);
    if (select.value === 'sim') {
        tratamentoCampos.style.display = 'block';
    } else {
        tratamentoCampos.style.display = 'none';
    }
}
// Função para coletar doenças no salvamento
// Função para coletar doenças no salvamento
function coletarDoencas() {
    const doencasRegistradas = [];
    const especie = document.getElementById('formEspecie').value;
    const sexo = document.getElementById('formSexo').value;
    
    if (!especie || !sexo) return [];
    
    const doencas = bancoDoencas[especie]?.[sexo] || [];
    
    doencas.forEach(doenca => {
        const doencaId = doenca.replace(/[^a-zA-Z0-9]/g, '_');
        const checkbox = document.querySelector(`input[value="${doenca.replace(/"/g, '&quot;')}"]`);
        if (checkbox && checkbox.checked) {
            doencasRegistradas.push({
                nome: doenca,
                dataDiagnostico: document.getElementById(`dataDoenca_${doencaId}`)?.value || null,
                tratou: document.getElementById(`tratouDoenca_${doencaId}`)?.value === 'sim',
                dataTratamento: document.getElementById(`dataTratamento_${doencaId}`)?.value || null,
                tipoTratamento: document.getElementById(`tipoTratamento_${doencaId}`)?.value || null,
                observacoesTratamento: document.getElementById(`obsTratamento_${doencaId}`)?.value || null
            });
        }
    });
    
    return doencasRegistradas;
}
    // Função para atualizar as datalists com animais existentes
    function atualizarDatalists() {
        const matrizes = animais.filter(a => a.sexo === 'Fêmea');
        const reprodutores = animais.filter(a => a.sexo === 'Macho');
        
        const listaMatrizes = document.getElementById('listaMatrizes');
        const listaReprodutores = document.getElementById('listaReprodutores');
        
        if (listaMatrizes) {
            listaMatrizes.innerHTML = '';
            matrizes.forEach(matriz => {
                const option = document.createElement('option');
                option.value = `${matriz.codigo} - ${matriz.nome || 'Sem nome'}`;
                listaMatrizes.appendChild(option);
            });
        }
        
        if (listaReprodutores) {
            listaReprodutores.innerHTML = '';
            reprodutores.forEach(reprodutor => {
                const option = document.createElement('option');
                option.value = `${reprodutor.codigo} - ${reprodutor.nome || 'Sem nome'}`;
                listaReprodutores.appendChild(option);
            });
        }
    }
    
    // Função para controlar campos dinâmicos baseado no sexo
    // Função para calcular idade do animal em tempo real
function calcularIdadeAnimal() {
    const dataInput = document.getElementById('formDataNascimento');
    const idadeDiv = document.getElementById('idadeAnimalPreview');
    
    if (!dataInput || !dataInput.value) {
        idadeDiv.innerHTML = '';
        return;
    }
    
    const dataNasc = new Date(dataInput.value);
    const hoje = new Date();
    
    // Verificar se a data é válida
    if (isNaN(dataNasc.getTime())) {
        idadeDiv.innerHTML = '⚠️ Data inválida';
        return;
    }
    
    // Calcular diferença em meses
    const diffMeses = (hoje.getFullYear() - dataNasc.getFullYear()) * 12 + (hoje.getMonth() - dataNasc.getMonth());
    
    let idadeTexto = '';
    
    if (diffMeses < 0) {
        idadeTexto = '⚠️ Data futura';
    } else if (diffMeses < 1) {
        const diffDias = Math.floor((hoje - dataNasc) / (1000 * 60 * 60 * 24));
        idadeTexto = `${diffDias} dias`;
    } else if (diffMeses < 12) {
        idadeTexto = `${diffMeses} meses`;
    } else {
        const anos = Math.floor(diffMeses / 12);
        const meses = diffMeses % 12;
        idadeTexto = meses > 0 ? `${anos} anos e ${meses} meses` : `${anos} anos`;
    }
    
    idadeDiv.innerHTML = `<i class="fa-solid fa-calendar"></i> Idade atual: ${idadeTexto}`;
}
    function toggleCamposPorSexo() {
    const sexo = document.getElementById('formSexo').value;
    const especie = document.getElementById('formEspecie').value;
    const camposFemea = document.getElementById('camposFemea');
    const camposMacho = document.getElementById('camposMacho');
    
    // Convertendo para checar sem problemas de maiúsculas/minúsculas ou acentos
    const sexoNormalizado = sexo ? sexo.trim().toLowerCase() : '';

    if (sexoNormalizado === 'fêmea' || sexoNormalizado === 'femea') {
        if (camposFemea) camposFemea.style.display = 'block';
        if (camposMacho) camposMacho.style.display = 'none';
        
        // Atualizar doenças da fêmea se espécie já estiver selecionada
        if (especie) {
            atualizarListaDoencas();
        }
    } else if (sexoNormalizado === 'macho') {
        if (camposFemea) camposFemea.style.display = 'none';
        if (camposMacho) camposMacho.style.display = 'block';
        
        // Atualizar doenças do macho se espécie já estiver selecionada
        if (especie) {
            atualizarListaDoencasMacho();
        }
    } else {
        if (camposFemea) camposFemea.style.display = 'none';
        if (camposMacho) camposMacho.style.display = 'none';
    }
}
    
    // Controlar subcampos de categoria reprodutiva
    function toggleCamposCategoria() {
    const categoria = document.getElementById('formCategoriaFemea').value;
    const camposECC = document.getElementById('camposECC');
    
    if (categoria === 'Reprodutora') {
        camposECC.style.display = 'block';
    } else {
        camposECC.style.display = 'none';
        document.getElementById('formECC').value = '';
    }
}
    
    // Controlar subcampos de aborto
    function toggleCamposAborto() {
    const temAborto = document.getElementById('formHistoricoAborto').value;
    const subCampos = document.getElementById('subCamposAborto');
    
    if (temAborto === 'sim') {
        subCampos.style.display = 'block';
        gerarCamposAborto();
    } else {
        subCampos.style.display = 'none';
        document.getElementById('formQtdAbortos').value = 0;
        document.getElementById('listaAbortosContainer').innerHTML = '';
    }
}

function gerarCamposAborto() {
    const qtd = parseInt(document.getElementById('formQtdAbortos').value) || 0;
    const container = document.getElementById('listaAbortosContainer');
    
    if (qtd === 0) {
        container.innerHTML = '<p style="color: #64748b; font-size: 13px; margin-top: 10px;">Nenhum aborto registrado</p>';
        return;
    }
    
    let html = '<div style="margin-top: 15px;"><label style="font-weight: 600; margin-bottom: 10px; display: block;">Detalhes de cada aborto:</label>';
    
    for (let i = 1; i <= qtd; i++) {
        html += `
            <div class="sub-block" style="margin-bottom: 15px; border-left-color: #dc3545;">
                <h4 style="color: #dc3545;">Aborto #${i}</h4>
                <div class="form-grid">
                    <div class="input-group">
                        <label>Data do Aborto</label>
                        <input type="date" id="abortoData_${i}" class="aborto-data">
                    </div>
                    <div class="input-group">
                        <label>Macho Reprodutor</label>
                        <input type="text" id="abortoMacho_${i}" class="aborto-macho" 
                               placeholder="Código/Nome do touro" list="listaReprodutores">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="input-group">
                        <label>Gestão Aproximada (dias)</label>
                        <input type="number" id="abortoDias_${i}" class="aborto-dias" 
                               placeholder="Ex: 120, 180" step="10">
                    </div>
                    <div class="input-group">
                        <label>Observações</label>
                        <input type="text" id="abortoObs_${i}" class="aborto-obs" 
                               placeholder="Ex: Causa desconhecida, trauma...">
                    </div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}
    
    // Salvar animal no localStorage
   function salvarAnimal() {
    const isEditing = window.animalEmEdicao;
    const editingAnimal = isEditing ? animais.find(a => a.id === isEditing) : null;
    if (isEditing && editingAnimal) {
        animais = animais.filter(a => a.id !== isEditing);
    }
    
    // Coletar dados básicos
    const animal = {
        id: isEditing || Date.now(),
        codigo: document.getElementById('formCodigo').value,
        nome: document.getElementById('formNome').value || '',
        especie: document.getElementById('formEspecie').value,
        raca: document.getElementById('formRaca').value,
        grauSangue: document.getElementById('formGrauSangue').value,
        pelagem: document.getElementById('formPelagem').value,
        dataNascimento: document.getElementById('formDataNascimento').value,
        pesoNascer: parseFloat(document.getElementById('formPesoNascer').value) || 0,
        pesoAtual: parseFloat(document.getElementById('formPesoAtual').value) || 0,
        sexo: document.getElementById('formSexo').value,
        finalidade: document.getElementById('formFinalidade').value,
        lote: document.getElementById('formLote').value,
        observacoes: document.getElementById('formObs').value,
        dataCadastro: new Date().toISOString(),
        doencas: []
    };
    
    // Validar campos obrigatórios
    if (!animal.codigo || !animal.especie || !animal.raca || !animal.sexo || !animal.dataNascimento) {
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios (*)', 'aviso');
        return;
    }
    
    // Adicionar campos específicos baseado no sexo
    if (animal.sexo === 'Fêmea') {
        animal.categoriaReprodutiva = document.getElementById('formCategoriaFemea').value;
        animal.ecc = parseFloat(document.getElementById('formECC').value) || null;
        animal.mae = document.getElementById('formMae').value || null;
        animal.historicoAborto = document.getElementById('formHistoricoAborto').value === 'sim';
        
        if (animal.historicoAborto) {
            animal.qtdAbortos = parseInt(document.getElementById('formQtdAbortos').value) || 0;
            const abortosDetalhes = [];
            for (let i = 1; i <= animal.qtdAbortos; i++) {
                const data = document.getElementById(`abortoData_${i}`)?.value;
                const macho = document.getElementById(`abortoMacho_${i}`)?.value;
                const dias = document.getElementById(`abortoDias_${i}`)?.value;
                const obs = document.getElementById(`abortoObs_${i}`)?.value;
                
                if (data || macho) {
                    abortosDetalhes.push({
                        numero: i,
                        data: data || null,
                        macho: macho || null,
                        diasGestacao: dias ? parseInt(dias) : null,
                        observacoes: obs || null
                    });
                }
            }
            animal.abortos = abortosDetalhes;
        }
        animal.doencas = coletarDoencas();
        
        // Coletar doenças pregressas
        const doencas = [];
        document.querySelectorAll('#camposFemea input[type="checkbox"]:checked').forEach(cb => {
            doencas.push(cb.value);
        });
        animal.doencasPregressas = doencas;
        
        // ========== CÓDIGO PARA NASCIMENTOS (COM PERGUNTA) ==========
        const temCrias = document.getElementById('formTemCrias')?.value;
        
        if (temCrias === 'sim') {
            const qtdNascimentos = parseInt(document.getElementById('formQtdNascimentos').value) || 0;
            const nascimentos = [];
            
            for (let i = 1; i <= qtdNascimentos; i++) {
                const data = document.getElementById(`nascimentoData_${i}`)?.value;
                if (data) {
                    nascimentos.push({
                        numero: i,
                        data: data,
                        sexo: document.getElementById(`nascimentoSexo_${i}`)?.value || null,
                        pai: document.getElementById(`nascimentoPai_${i}`)?.value || null,
                        peso: parseFloat(document.getElementById(`nascimentoPeso_${i}`)?.value) || null,
                        observacoes: document.getElementById(`nascimentoObs_${i}`)?.value || null
                    });
                }
            }
            animal.nascimentos = nascimentos;
            animal.qtdNascimentos = qtdNascimentos;
        } else {
            animal.nascimentos = [];
            animal.qtdNascimentos = 0;
        }
        // ========== FIM DO CÓDIGO PARA NASCIMENTOS ==========
        
    } else if (animal.sexo === 'Macho') {
        animal.tipoReprodutor = document.getElementById('formTipoMacho').value;
        animal.exameAndrologicoDia = document.getElementById('formExameAndrologico').value === 'sim';
        animal.eccMacho = document.getElementById('formECCMacho').value || null;
        animal.maeMacho = document.getElementById('formMaeMacho').value || null;
        animal.paiMacho = document.getElementById('formPaiMacho').value || null;
        animal.laboratorio = document.getElementById('formLaboratorio').value || null;
        
        // ========== COLETAR DESCENDENTES (COM PERGUNTA) ==========
        const temDescendentes = document.getElementById('formTemDescendentes')?.value;
        
        if (temDescendentes === 'sim') {
            const qtdDescendentes = parseInt(document.getElementById('formQtdDescendentes').value) || 0;
            animal.qtdDescendentes = qtdDescendentes;
            
            const descendentes = [];
            for (let i = 1; i <= qtdDescendentes; i++) {
                const nomeDescendente = document.getElementById(`descendenteNome_${i}`)?.value;
                if (nomeDescendente) {
                    descendentes.push({
                        numero: i,
                        nome: nomeDescendente,
                        sexo: document.getElementById(`descendenteSexo_${i}`)?.value || null,
                        mae: document.getElementById(`descendenteMae_${i}`)?.value || null,
                        dataNascimento: document.getElementById(`descendenteData_${i}`)?.value || null,
                        pesoNascer: parseFloat(document.getElementById(`descendentePeso_${i}`)?.value) || null,
                        observacoes: document.getElementById(`descendenteObs_${i}`)?.value || null
                    });
                }
            }
            animal.descendentes = descendentes;
        } else {
            animal.qtdDescendentes = 0;
            animal.descendentes = [];
        }
        // ========== FIM DESCENDENTES ==========
        
        // Coletar doenças do macho
        animal.doencas = coletarDoencasMacho();
    }
    
    // Salvar
    animais.push(animal);
    localStorage.setItem('potygen_animais', JSON.stringify(animais));
    
    // Depois de salvar, fechar modal e atualizar tudo
    window.animalEmEdicao = null;
    mostrarMensagem(isEditing ? 'Animal atualizado com sucesso!' : 'Animal cadastrado com sucesso!', 'sucesso');
    fecharModalCadastro();
    renderizarTabela();
    atualizarDatalists();
}
    // Renderizar tabela
    function renderizarTabela() {
    const tbody = document.getElementById('tabelaAnimais');
    if (!tbody) return;
    
    if (animais.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Nenhum animal cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = animais.map(animal => {
    const idade = calcularIdade(animal.dataNascimento);
    return `
        <tr>
            <td><strong>${animal.nome || 'Sem nome'}</strong><br><small>${animal.codigo}</small></td>
            <td>${animal.raca} - ${animal.especie}</td>
            <td>${idade}</td>
            <td>${animal.pesoAtual} kg</td>
            <td>${animal.sexo || 'N/A'}</td>
            <td>${animal.finalidade || '—'}</td>
            <td>${animal.lote || '—'}</td>
            <td>${animal.pelagem || '—'}</td>
            <td class="action-buttons">
                <button class="action-btn action-view" onclick="visualizarAnimal(${animal.id})">
                    <i class="fa-solid fa-eye"></i> Ver características
                </button>
                <button class="action-btn action-edit" onclick="editarAnimal(${animal.id})">
                <i class="fa-solid fa-pen"></i> Editar
             </button>
                <button class="action-btn action-delete" onclick="deletarAnimal(${animal.id})">
                    <i class="fa-solid fa-trash"></i> Excluir
                </button>
            </td>
        </tr>
    `;
}).join('');
}
    
    function calcularIdade(dataNascimento) {
        if (!dataNascimento) return 'N/A';
        const nasc = new Date(dataNascimento);
        const hoje = new Date();
        const idadeMeses = (hoje.getFullYear() - nasc.getFullYear()) * 12 + (hoje.getMonth() - nasc.getMonth());
        
        if (idadeMeses < 12) {
            return `${idadeMeses} meses`;
        } else {
            const anos = Math.floor(idadeMeses / 12);
            const meses = idadeMeses % 12;
            return meses > 0 ? `${anos} anos e ${meses} meses` : `${anos} anos`;
        }
    }
    
    function visualizarAnimal(id) {
    // Buscar o animal do array global (já atualizado)
    const animal = animais.find(a => a.id === id);
    if (!animal) {
        console.error("Animal não encontrado! ID:", id);
        mostrarMensagem('Animal não encontrado!', 'erro');
        return;
    }
    
    // Informações básicas (comuns a ambos)
    document.getElementById('viewCodigo').textContent = animal.codigo || '-';
    document.getElementById('viewNome').textContent = animal.nome || '-';
    document.getElementById('viewEspecie').textContent = animal.especie || '-';
    document.getElementById('viewRaca').textContent = animal.raca || '-';
    document.getElementById('viewPelagem').textContent = animal.pelagem || '-';
    document.getElementById('viewLote').textContent = animal.lote || '-';
    document.getElementById('viewFinalidade').textContent = animal.finalidade || '-';
    document.getElementById('viewGrauSangue').textContent = animal.grauSangue || '-';
    document.getElementById('viewPeso').textContent = animal.pesoAtual ? `${animal.pesoAtual} kg` : '-';
    document.getElementById('viewIdade').textContent = calcularIdade(animal.dataNascimento);
    document.getElementById('viewStatus').textContent = animal.sexo || '-';
    
    // Esconder seções específicas primeiro
    const viewFemeaInfo = document.getElementById('viewFemeaInfo');
    const viewMachoInfo = document.getElementById('viewMachoInfo');
    if (viewFemeaInfo) viewFemeaInfo.style.display = 'none';
    if (viewMachoInfo) viewMachoInfo.style.display = 'none';
    
    // Se for FÊMEA
    if (animal.sexo === 'Fêmea') {
        if (viewFemeaInfo) viewFemeaInfo.style.display = 'block';
        
        document.getElementById('viewCategoria').textContent = animal.categoriaReprodutiva || '-';
        document.getElementById('viewECC').textContent = animal.ecc || '-';
        document.getElementById('viewQtdCrias').textContent = animal.qtdNascimentos || '0';
        document.getElementById('viewAborto').textContent = animal.historicoAborto ? 'Sim' : 'Não';
        document.getElementById('viewMae').textContent = animal.mae || '-';
        document.getElementById('viewPai').textContent = animal.pai || '-';
        
        // Mostrar lista de crias/nascimentos
        const nascimentosContainer = document.getElementById('viewNascimentosContainer');
        const listaNascimentos = document.getElementById('viewListaNascimentos');
        
        if (nascimentosContainer && listaNascimentos) {
            if (animal.nascimentos && animal.nascimentos.length > 0) {
                nascimentosContainer.style.display = 'block';
                listaNascimentos.innerHTML = animal.nascimentos.map(n => `
                    <div style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                        <strong>${n.numero}ª cria:</strong> ${n.data || 'Data não registrada'} 
                        ${n.sexo ? `- ${n.sexo}` : ''}
                        ${n.pai ? `<br>👨 Pai: ${n.pai}` : ''}
                        ${n.peso ? `<br>⚖️ Peso: ${n.peso} kg` : ''}
                    </div>
                `).join('');
            } else {
                nascimentosContainer.style.display = 'none';
            }
        }
    }
    
    // Se for MACHO
    if (animal.sexo === 'Macho') {
        if (viewMachoInfo) viewMachoInfo.style.display = 'block';
        
        // Tipo de Reprodutor com texto amigável
        let tipoTexto = '-';
        if (animal.tipoReprodutor === 'local') tipoTexto = 'Reprodutor Local';
        else if (animal.tipoReprodutor === 'laboratorio') tipoTexto = 'Reprodutor de Laboratório';
        else if (animal.tipoReprodutor === 'rufiao') tipoTexto = 'Rufião';
        else if (animal.tipoReprodutor === 'castrado') tipoTexto = 'Castrado';
        else tipoTexto = animal.tipoReprodutor || '-';
        
        document.getElementById('viewTipoMacho').textContent = tipoTexto;
        document.getElementById('viewExameAndrologico').textContent = animal.exameAndrologicoDia ? 'Sim - Apto' : 'Não ou Vencido';
        document.getElementById('viewECCMacho').textContent = animal.eccMacho || '-';
        document.getElementById('viewQtdDescendentes').textContent = animal.qtdDescendentes || '0';
        document.getElementById('viewMaeMacho').textContent = animal.maeMacho || '-';
        document.getElementById('viewPaiMacho').textContent = animal.paiMacho || '-';
        document.getElementById('viewLaboratorio').textContent = animal.laboratorio || '-';
        
        // Mostrar lista de descendentes
        const descendentesContainer = document.getElementById('viewDescendentesContainer');
        const listaDescendentes = document.getElementById('viewListaDescendentes');
        
        if (descendentesContainer && listaDescendentes) {
            if (animal.descendentes && animal.descendentes.length > 0) {
                descendentesContainer.style.display = 'block';
                listaDescendentes.innerHTML = animal.descendentes.map(d => `
                    <div style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                        <strong>${d.nome || `Descendente #${d.numero}`}</strong>
                        ${d.sexo ? `<br>🧬 Sexo: ${d.sexo}` : ''}
                        ${d.mae ? `<br>🐄 Mãe: ${d.mae}` : ''}
                        ${d.dataNascimento ? `<br>📅 Nascimento: ${d.dataNascimento}` : ''}
                    </div>
                `).join('');
            } else {
                descendentesContainer.style.display = 'none';
            }
        }
    }
    
    // Mostrar doenças (para ambos)
    const listaDoencas = document.getElementById('viewListaDoencas');
    if (listaDoencas) {
        if (animal.doencas && animal.doencas.length > 0) {
            listaDoencas.innerHTML = animal.doencas.map(d => `
                <div style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
                    <strong>${d.nome}</strong>
                    ${d.dataDiagnostico ? `<br>📅 Diagnóstico: ${d.dataDiagnostico}` : ''}
                    ${d.tratou ? `<br>✅ Tratado em: ${d.dataTratamento || 'Data não registrada'}` : '<br>⚠️ Não tratado'}
                </div>
            `).join('');
        } else {
            listaDoencas.innerHTML = '<p style="color: #64748b;">Nenhuma doença registrada</p>';
        }
    }
    
    // Abrir modal
    const modalVisualizar = document.getElementById('modalVisualizar');
    if (modalVisualizar) {
        modalVisualizar.style.display = 'flex';
    }
}
   function deletarAnimal(id) {
    mostrarConfirmacao(
        'Tem certeza que deseja excluir este animal? Esta ação não pode ser desfeita!',
        function() {
            // Confirmado
            animais = animais.filter(a => a.id !== id);
            localStorage.setItem('potygen_animais', JSON.stringify(animais));
            renderizarTabela();
            atualizarDatalists();
            mostrarMensagem('Animal excluído com sucesso!', 'sucesso');
        },
        function() {
            // Cancelado - não faz nada
            console.log('Exclusão cancelada');
        }
    );
}
    
    function fecharModalCadastro() {
        document.getElementById('modalForm').style.display = 'none';
        document.getElementById('formCodigo').value = '';
        document.getElementById('formNome').value = '';
        document.getElementById('formEspecie').value = '';
        document.getElementById('formRaca').value = '';
        document.getElementById('formSexo').value = '';
        document.getElementById('camposFemea').style.display = 'none';
        document.getElementById('camposMacho').style.display = 'none';
         limparRacaSelecionada();
    }
    // Atualiza as opções de finalidade baseado na espécie escolhida
function atualizarFinalidadePorEspecie() {
    const especie = document.getElementById('formEspecie').value;
    const selectFinalidade = document.getElementById('formFinalidade');
    
    // Mapeamento das finalidades por espécie
    const finalidades = {
        'Bovino': ['Corte', 'Leite', 'Dupla Aptidão', 'Melhoramento Genético'],
        'Ovino': ['Corte', 'Lã', 'Leite', 'Couro', 'Dupla Aptidão'],
        'Caprino': ['Corte (Carne)', 'Leite', 'Couro', 'Dupla Aptidão']
    };
    
    // Limpa as opções atuais
    selectFinalidade.innerHTML = '<option value="">Selecione uma finalidade...</option>';
    
    // Se a espécie existe no mapeamento, adiciona as opções
    if (finalidades[especie]) {
        finalidades[especie].forEach(finalidade => {
            const option = document.createElement('option');
            option.value = finalidade;
            option.textContent = finalidade;
            selectFinalidade.appendChild(option);
        });
    } else {
        selectFinalidade.innerHTML = '<option value="">Selecione uma espécie primeiro</option>';
    }
}
// ============================================
// SISTEMA DE BUSCA DE RAÇAS PRÉ-DEFINIDAS
// ============================================

// Banco de raças pré-definidas (SEM opção de adicionar nova)
const racasPreDefinidas = {
    'Bovino': [
        'Nelore', 'Angus', 'Hereford','Gir', 'Brahman', 'Guzerá', 
        'Tabapuã', 'Senepol', 'Caracu', 'Holandês', 'Jersey',
        'Girolando', 'Sindi', 'Bonsmara', 'Brangus', 'Braford',
        'Canchim', 'Santa Gertrudes', 'Limousin', 'Charolês',
        'Devon', 'Red Angus', 'Wagyu','Guerande', 'Normanda', 'Pardo Suíço', 'Lavínia'
    ],
    'Ovino': [
        'Dorper', 'Santa Inês', 'Suffolk', 'Hampshire Down','Morada Nova', 'Bergamácia', 'Crioulo',
        'Texel', 'Morada Nova', 'Somalis Brasileira', 'Ile de France', 'Rabo Largo', 'Lacaune', 'Cordeiro do Marajó',
        'Katahdin', 'White Dorper','Corriedale', 'Merino', 'Pantaneiro'       
    ],
    'Caprino': [
        'Boer', 'Saanen', 'Anglo-Nubiana', 'Parda Alpina', 
        'Toggenburg', 'Moxotó', 'Canindé', 'Marota',
        'Repartida', 'Azul', 'Gurguéia', 'Bhuj', 'Kalahari Red'
    ]
};

// Função para obter raças da espécie selecionada
function getRacasDaEspecie(especie) {
    return racasPreDefinidas[especie] || [];
}

// Função para filtrar raças baseado no texto digitado
function filtrarListaRacas(texto) {
    const especie = document.getElementById('formEspecie').value;
    const dropdown = document.getElementById('listaRacasResultados');
    const buscaInput = document.getElementById('buscaRaca');
    
    if (!especie) {
        dropdown.style.display = 'none';
        if (buscaInput) {
            buscaInput.placeholder = 'Selecione a espécie primeiro';
            buscaInput.disabled = true;
        }
        return;
    }
    
    if (buscaInput) buscaInput.disabled = false;
    const todasRacas = getRacasDaEspecie(especie);
    const textoLower = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    let racasFiltradas;
    
    if (texto === '') {
        racasFiltradas = todasRacas;
    } else {
        racasFiltradas = todasRacas.filter(raca => {
            const racaLower = raca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return racaLower.includes(textoLower);
        });
    }
    
    if (racasFiltradas.length === 0) {
        dropdown.innerHTML = `
            <div class="raca-item" style="color: #dc3545; cursor: default;">
                <i class="fa-solid fa-circle-exclamation"></i> 
                Nenhuma raça encontrada com "${texto}"
            </div>
        `;
        dropdown.style.display = 'block';
        return;
    }
    
    dropdown.innerHTML = racasFiltradas.map(raca => `
        <div class="raca-item" onclick="selecionarRaca('${raca.replace(/'/g, "\\'")}')">
            <i class="fa-solid fa-paw" style="color: #0d8a4f; margin-right: 8px;"></i>
            ${raca}
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

// Função para mostrar todas as raças quando clicar no campo
function mostrarTodasRacas() {
    const especie = document.getElementById('formEspecie').value;
    const buscaInput = document.getElementById('buscaRaca');
    if (especie && buscaInput) {
        filtrarListaRacas(buscaInput.value);
    }
}

// Função para selecionar uma raça
function selecionarRaca(raca) {
    const hiddenInput = document.getElementById('formRaca');
    const buscaInput = document.getElementById('buscaRaca');
    const dropdown = document.getElementById('listaRacasResultados');
    
    if (hiddenInput) hiddenInput.value = raca;
    if (buscaInput) buscaInput.value = raca;
    if (dropdown) dropdown.style.display = 'none';
    
    mostrarBadgeRacaSelecionada(raca);
}

// Mostrar badge visual da raça selecionada
function mostrarBadgeRacaSelecionada(raca) {
    let badgeDiv = document.getElementById('racaSelecionadaBadge');
    if (!badgeDiv) {
        badgeDiv = document.createElement('div');
        badgeDiv.id = 'racaSelecionadaBadge';
        badgeDiv.className = 'raca-selecionada-badge';
        const container = document.querySelector('.raca-busca-container');
        if (container && container.parentNode) {
            container.parentNode.insertBefore(badgeDiv, container.nextSibling);
        }
    }
    badgeDiv.innerHTML = `<i class="fa-solid fa-check-circle"></i> Raça selecionada: ${raca}`;
    badgeDiv.style.display = 'block';
}

// Limpar seleção de raça
function limparRacaSelecionada() {
    const hiddenInput = document.getElementById('formRaca');
    const buscaInput = document.getElementById('buscaRaca');
    const badge = document.getElementById('racaSelecionadaBadge');
    
    if (hiddenInput) hiddenInput.value = '';
    if (buscaInput) buscaInput.value = '';
    if (badge) badge.style.display = 'none';
}

// Atualizar raças quando a espécie mudar
function atualizarRacasPorEspecie() {
    const especie = document.getElementById('formEspecie').value;
    const buscaInput = document.getElementById('buscaRaca');
    const dropdown = document.getElementById('listaRacasResultados');
    
    limparRacaSelecionada();
    
    if (!especie) {
        if (buscaInput) {
            buscaInput.placeholder = 'Selecione a espécie primeiro';
            buscaInput.disabled = true;
            buscaInput.value = '';
        }
        if (dropdown) dropdown.style.display = 'none';
    } else {
        if (buscaInput) {
            buscaInput.placeholder = 'Digite para buscar raça...';
            buscaInput.disabled = false;
            buscaInput.value = '';
            buscaInput.focus();
        }
        filtrarListaRacas('');
    }
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', function(e) {
    const container = document.querySelector('.raca-busca-container');
    const dropdown = document.getElementById('listaRacasResultados');
    if (container && !container.contains(e.target) && dropdown) {
        dropdown.style.display = 'none';
    }
});
// Função para mostrar/esconder campo de nascimentos baseado na categoria
function toggleCamposNascimentosPorCategoria() {
    const categoria = document.getElementById('formCategoriaFemea').value;
    const subCampos = document.getElementById('subCamposNascimentos');
    
    if (categoria === 'primipara' || categoria === 'multipara') {
        subCampos.style.display = 'block';
        gerarCamposNascimentos();
    } else {
        subCampos.style.display = 'none';
        document.getElementById('listaNascimentosContainer').innerHTML = '';
    }
}

// Função para gerar campos de nascimento
function gerarCamposNascimentos() {
    const qtd = parseInt(document.getElementById('formQtdNascimentos').value) || 0;
    const container = document.getElementById('listaNascimentosContainer');
    
    if (qtd === 0) {
        container.innerHTML = '<p style="color: #64748b; font-size: 13px;">Nenhuma cria registrada</p>';
        return;
    }
    
    let html = '<div style="margin-top: 15px;"><label style="font-weight: 600;">Detalhes de cada cria:</label>';
    
    for (let i = 1; i <= qtd; i++) {
        html += `
            <div class="sub-block" style="margin-bottom: 15px;">
                <h4>🐄 Cria #${i}</h4>
                <div class="form-grid">
                    <div class="input-group">
                        <label>Data do Nascimento</label>
                        <input type="date" id="nascimentoData_${i}" class="nascimento-data" onchange="calcularIdadeCria(${i})">
                        <div id="idadeCria_${i}" class="help-text" style="color: #0d8a4f;"></div>
                    </div>
                    <div class="input-group">
                        <label>Gênero da Cria</label>
                        <select id="nascimentoSexo_${i}" class="nascimento-sexo">
                            <option value="">Selecione...</option>
                            <option value="Macho">Macho</option>
                            <option value="Fêmea">Fêmea</option>
                        </select>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="input-group">
                        <label>Nome do Reprodutor (Pai)</label>
                        <input type="text" id="nascimentoPai_${i}" class="nascimento-pai" 
                               placeholder="Código/Nome do touro/carneiro/bode" list="listaReprodutores">
                    </div>
                    <div class="input-group">
                        <label>Peso ao Nascer (kg)</label>
                        <input type="number" id="nascimentoPeso_${i}" class="nascimento-peso" step="0.1" placeholder="0.0">
                    </div>
                </div>
                <div class="input-group">
                    <label>Observações</label>
                    <input type="text" id="nascimentoObs_${i}" class="nascimento-obs" placeholder="Ex: Parto normal, gêmeos, natimorto...">
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}
function toggleCamposPorSexo() {
    const sexo = document.getElementById('formSexo').value;
    const camposFemea = document.getElementById('camposFemea');
    const camposMacho = document.getElementById('camposMacho');
    
    if (sexo === 'Fêmea') {
        camposFemea.style.display = 'block';
        camposMacho.style.display = 'none';
    } else if (sexo === 'Macho') {
        camposFemea.style.display = 'none';
        camposMacho.style.display = 'block';
    } else {
        camposFemea.style.display = 'none';
        camposMacho.style.display = 'none';
    }
}
// Função para calcular idade da cria em tempo real
function calcularIdadeCria(numero) {
    const dataInput = document.getElementById(`nascimentoData_${numero}`);
    const idadeDiv = document.getElementById(`idadeCria_${numero}`);
    
    if (!dataInput || !dataInput.value) {
        idadeDiv.innerHTML = '';
        return;
    }
    
    const dataNasc = new Date(dataInput.value);
    const hoje = new Date();
    const diffMeses = (hoje.getFullYear() - dataNasc.getFullYear()) * 12 + (hoje.getMonth() - dataNasc.getMonth());
    
    if (diffMeses < 0) {
        idadeDiv.innerHTML = '⚠️ Data futura';
    } else if (diffMeses < 1) {
        const diffDias = Math.floor((hoje - dataNasc) / (1000 * 60 * 60 * 24));
        idadeDiv.innerHTML = `📅 Idade atual: ${diffDias} dias`;
    } else if (diffMeses < 12) {
        idadeDiv.innerHTML = `📅 Idade atual: ${diffMeses} meses`;
    } else {
        const anos = Math.floor(diffMeses / 12);
        const meses = diffMeses % 12;
        idadeDiv.innerHTML = meses > 0 ? `📅 Idade atual: ${anos} anos e ${meses} meses` : `📅 Idade atual: ${anos} anos`;
    }
}
    // Event Listeners
    document.addEventListener('DOMContentLoaded', () => {
    renderizarTabela();
    atualizarDatalists();
    document.getElementById('formQtdDescendentes').addEventListener('input', gerarCamposDescendentes);
    // Evento para espécie (atualiza finalidade, raças e doenças)
    document.getElementById('formEspecie').addEventListener('change', function() {
    atualizarFinalidadePorEspecie();
    atualizarRacasPorEspecie();
    // Adicione ESTES event listeners dentro do seu DOMContentLoaded existente

document.getElementById('formEspecie').addEventListener('change', function() {
    const sexo = document.getElementById('formSexo').value;
    if (sexo === 'Fêmea') {
        atualizarListaDoencas();
    } else if (sexo === 'Macho') {
        atualizarListaDoencasMacho();
    }
});

document.getElementById('formSexo').addEventListener('change', function() {
    const especie = document.getElementById('formEspecie').value;
    if (especie) {
        if (this.value === 'Fêmea') {
            atualizarListaDoencas();
        } else if (this.value === 'Macho') {
            atualizarListaDoencasMacho();
        }
    }
});
    
    // Atualizar doenças baseado na espécie e sexo atual
    const sexo = document.getElementById('formSexo').value;
    if (sexo === 'Fêmea') {
        atualizarListaDoencas();
    } else if (sexo === 'Macho') {
        atualizarListaDoencasMacho();
    }
});
    
    // Evento para sexo (mostra campos específicos e atualiza doenças)
    document.getElementById('formSexo').addEventListener('change', function() {
        toggleCamposPorSexo();
        
        // Atualizar doenças quando mudar o sexo
        const especie = document.getElementById('formEspecie').value;
        if (especie) {
            if (this.value === 'Fêmea') {
                atualizarListaDoencas();
            } else if (this.value === 'Macho') {
                atualizarListaDoencasMacho();
            }
        }
    });
    
    // Evento para categoria da fêmea
    document.getElementById('formCategoriaFemea').addEventListener('change', toggleCamposNascimentosPorCategoria);
    
    // Evento para pai do macho (buscar crias)
    document.getElementById('formPaiMacho')?.addEventListener('input', buscarCriasPorPai);
    
    // Evento para quantidade de crias da fêmea
    document.getElementById('formQtdNascimentos').addEventListener('input', gerarCamposNascimentos);
    
    // Evento para histórico de aborto
    document.getElementById('formHistoricoAborto').addEventListener('change', toggleCamposAborto);
    document.getElementById('formQtdAbortos').addEventListener('input', gerarCamposAborto);
    
    // Botão novo animal
    document.getElementById('btnNovoAnimal').addEventListener('click', () => {
        document.getElementById('modalForm').style.display = 'flex';
    });
    
    // Botão salvar
    document.getElementById('btnSalvar').addEventListener('click', salvarAnimal);
    
    // Fechar modais
    document.querySelectorAll('.close, .btn-close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('modalForm').style.display = 'none';
            document.getElementById('modalVisualizar').style.display = 'none';
        });
    });
    
    // Filtro de busca
    document.getElementById('busca').addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const filtrados = animais.filter(a => 
            a.codigo.toLowerCase().includes(termo) || 
            (a.nome && a.nome.toLowerCase().includes(termo)) ||
            (a.lote && a.lote.toLowerCase().includes(termo))
        );
        renderizarTabelaFiltrada(filtrados);
    });
});
       // ============================================
        // EVENTOS DOS MODAIS E FORMULÁRIOS
        // ============================================
        document.getElementById('btnNovoAnimal').addEventListener('click', () => {
            window.animalEmEdicao = null;  // ← ESSA LINHA É IMPORTANTE
            limparFormulario();
            document.getElementById('modalForm').style.display = 'flex';
        });
        
        document.getElementById('formQtdAbortos').addEventListener('input', gerarCamposAborto);
        document.getElementById('formSexo').addEventListener('change', toggleCamposPorSexo);
        document.getElementById('formHistoricoAborto').addEventListener('change', toggleCamposAborto);
        
        document.getElementById('btnSalvar').addEventListener('click', salvarAnimal);
        
        // Fechar modais
        document.querySelectorAll('.close, .btn-close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('modalForm').style.display = 'none';
                document.getElementById('modalVisualizar').style.display = 'none';
            });
        });
        
        // ============================================
        // SISTEMA DE FILTRAGEM UNIFICADO (BUSCA + DROPDOWN)
        // ============================================
        let especieSelecionada = 'todas';
    
        const dropdownBtn = document.getElementById('dropdownBtn');
        const dropdownMenu = document.getElementById('dropdownMenu');
        const selectedEspecieText = document.getElementById('selectedEspecie');
    
        // 1. Abrir e fechar o menu dinâmico de espécies
        if (dropdownBtn && dropdownMenu) {
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const estaAberto = dropdownMenu.style.display === 'block';
                dropdownMenu.style.display = estaAberto ? 'none' : 'block';
            });
    
            // Fechar o menu se clicar em qualquer outro lugar da tela
            document.addEventListener('click', () => {
                dropdownMenu.style.display = 'none';
            });
    
            // 2. Escutar o clique em cada opção do menu (Todas, Bovino, etc.)
            document.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', function() {
                    // Remove destaque visual do antigo e coloca no novo
                    document.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
                    this.classList.add('selected');
    
                    // Atualiza o texto visual que fica no botão do menu
                    selectedEspecieText.textContent = this.textContent;
    
                    // Captura o valor ('todas', 'Bovino', 'Ovino'...)
                    especieSelecionada = this.getAttribute('data-value');
    
                    // Executa a filtragem combinada
                    executarFiltroGeral();
                });
            });
        }
        
        // 3. Escutar o que o usuário digita no campo de busca
        // Event listener da busca
document.getElementById('busca').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = animais.filter(animal => 
        animal.codigo.toLowerCase().includes(termo) || 
        (animal.nome && animal.nome.toLowerCase().includes(termo)) ||
        (animal.lote && animal.lote.toLowerCase().includes(termo)) ||
        (animal.pelagem && animal.pelagem.toLowerCase().includes(termo)) ||
        (animal.finalidade && animal.finalidade.toLowerCase().includes(termo)) ||
        (animal.raca && animal.raca.toLowerCase().includes(termo))
    );
    renderizarTabelaFiltrada(filtrados);
});
    
        // 4. Função que faz a mágica de filtrar por Texto E Espécie ao mesmo tempo
        function executarFiltroGeral() {
            const termoBusca = document.getElementById('busca').value.toLowerCase();
            
            const listaFiltrada = animais.filter(animal => {
                // Critério A: Verifica se bate com o termo digitado
                const codigoBate = animal.codigo.toLowerCase().includes(termoBusca);
                const nomeBate = animal.nome && animal.nome.toLowerCase().includes(termoBusca);
                const loteBate = animal.lote && animal.lote.toLowerCase().includes(termoBusca);
                const textoValido = codigoBate || nomeBate || loteBate;
    
                // Critério B: Verifica se bate com a espécie (se for 'todas', aceita qualquer um)
                const especieValida = (especieSelecionada === 'todas') || (animal.especie === especieSelecionada);
    
                // Só exibe o animal se ele passar nas duas regras juntas
                return textoValido && especieValida;
            });
    
            renderizarTabelaFiltrada(listaFiltrada);
        }
        
        // ============================================
        // RENDERIZAÇÃO DA TABELA
        // ============================================
        function renderizarTabelaFiltrada(lista) {
    const tbody = document.getElementById('tabelaAnimais');
    if (!tbody) return;
    
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Nenhum animal encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = lista.map(animal => {
        const idade = calcularIdade(animal.dataNascimento);
        return `
            <tr>
                <td><strong>${animal.nome || 'Sem nome'}</strong><br><small>${animal.codigo}</small></td>
                <td>${animal.raca} - ${animal.especie}</td>
                <td>${idade}</td>
                <td>${animal.pesoAtual} kg</td>
                <td>${animal.sexo === 'Fêmea' ? 'Fêmea' : 'Macho'}</td>
                <td>${animal.finalidade || '—'}</td>
                <td>${animal.lote || '—'}</td>
                <td>${animal.pelagem || '—'}</td>
                <td class="action-buttons">
                    <button class="action-btn action-view" onclick="visualizarAnimal(${animal.id})">
                        <i class="fa-solid fa-eye"></i> Ver características
                    </button>
                    <button class="action-btn action-edit" onclick="editarAnimal(${animal.id})">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="action-btn action-delete" onclick="deletarAnimal(${animal.id})">
                        <i class="fa-solid fa-trash"></i> Excluir
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}
        
    function editarAnimal(id) {
    const animal = animais.find(a => a.id === id);
    if (!animal) {
        mostrarMensagem('Animal não encontrado!', 'erro');
        return;
    }
    
    // Limpar formulário primeiro
    limparFormulario();
    
    // Abrir modal
    const modalForm = document.getElementById('modalForm');
    const modalTitle = document.getElementById('modalTitle');
    const btnSalvar = document.getElementById('btnSalvar');
    
    modalTitle.innerText = "Editar Animal";
    btnSalvar.innerText = "Salvar Alterações";
    
    // ========== PREENCHER DADOS BÁSICOS ==========
    document.getElementById('formCodigo').value = animal.codigo || '';
    document.getElementById('formNome').value = animal.nome || '';
    document.getElementById('formEspecie').value = animal.especie || '';
    document.getElementById('buscaRaca').value = animal.raca || '';
    document.getElementById('formRaca').value = animal.raca || '';
    document.getElementById('formGrauSangue').value = animal.grauSangue || '';
    document.getElementById('formPelagem').value = animal.pelagem || '';
    document.getElementById('formDataNascimento').value = animal.dataNascimento || '';
    document.getElementById('formPesoNascer').value = animal.pesoNascer || '';
    document.getElementById('formPesoAtual').value = animal.pesoAtual || '';
    document.getElementById('formSexo').value = animal.sexo || '';
    document.getElementById('formFinalidade').value = animal.finalidade || '';
    document.getElementById('formLote').value = animal.lote || '';
    document.getElementById('formObs').value = animal.observacoes || '';
    
    // Calcular idade
    if (animal.dataNascimento) {
        calcularIdadeAnimal();
    }
    
    // Mostrar campos corretos baseado no sexo
    toggleCamposPorSexo();
    
    // ========== SE FOR FÊMEA ==========
    if (animal.sexo === 'Fêmea') {
        document.getElementById('formCategoriaFemea').value = animal.categoriaReprodutiva || '';
        document.getElementById('formECC').value = animal.ecc || '';
        document.getElementById('formMae').value = animal.mae || '';
        document.getElementById('formPai').value = animal.pai || '';
        document.getElementById('formHistoricoAborto').value = animal.historicoAborto ? 'sim' : 'nao';
        
        const qtdCrias = (animal.nascimentos && animal.nascimentos.length) || animal.qtdNascimentos || 0;
        document.getElementById('formQtdNascimentos').value = qtdCrias;
        
        if (qtdCrias > 0) {
            gerarCamposNascimentos();
            setTimeout(() => {
                if (animal.nascimentos) {
                    animal.nascimentos.forEach(n => {
                        const dataField = document.getElementById(`nascimentoData_${n.numero}`);
                        if (dataField) dataField.value = n.data || '';
                        const sexoField = document.getElementById(`nascimentoSexo_${n.numero}`);
                        if (sexoField) sexoField.value = n.sexo || '';
                        const paiField = document.getElementById(`nascimentoPai_${n.numero}`);
                        if (paiField) paiField.value = n.pai || '';
                        const pesoField = document.getElementById(`nascimentoPeso_${n.numero}`);
                        if (pesoField) pesoField.value = n.peso || '';
                    });
                }
            }, 100);
        }
    }
    
    // ========== SE FOR MACHO ==========
    if (animal.sexo === 'Macho') {
        document.getElementById('formTipoMacho').value = animal.tipoReprodutor || '';
        document.getElementById('formExameAndrologico').value = animal.exameAndrologicoDia ? 'sim' : 'nao';
        document.getElementById('formECCMacho').value = animal.eccMacho || '';
        document.getElementById('formMaeMacho').value = animal.maeMacho || '';
        document.getElementById('formPaiMacho').value = animal.paiMacho || '';
        document.getElementById('formLaboratorio').value = animal.laboratorio || '';
        
        if (animal.tipoReprodutor === 'laboratorio') {
            document.getElementById('campoLaboratorio').style.display = 'block';
        }
        
        const qtdDesc = (animal.descendentes && animal.descendentes.length) || animal.qtdDescendentes || 0;
        document.getElementById('formQtdDescendentes').value = qtdDesc;
        
        if (qtdDesc > 0) {
            gerarCamposDescendentes();
            setTimeout(() => {
                if (animal.descendentes) {
                    animal.descendentes.forEach(d => {
                        const nomeField = document.getElementById(`descendenteNome_${d.numero}`);
                        if (nomeField) nomeField.value = d.nome || '';
                        const sexoField = document.getElementById(`descendenteSexo_${d.numero}`);
                        if (sexoField) sexoField.value = d.sexo || '';
                        const maeField = document.getElementById(`descendenteMae_${d.numero}`);
                        if (maeField) maeField.value = d.mae || '';
                        const dataField = document.getElementById(`descendenteData_${d.numero}`);
                        if (dataField) dataField.value = d.dataNascimento || '';
                    });
                }
            }, 100);
        }
    }
    
    // Guardar ID para saber que é edição
    window.animalEmEdicao = animal.id;
    
    // Abrir modal
    modalForm.style.display = "flex";
}
        // Função para gerar campos de descendentes com nome da mãe
function gerarCamposDescendentes() {
    const qtd = parseInt(document.getElementById('formQtdDescendentes').value) || 0;
    const container = document.getElementById('listaDescendentesContainer');
    
    if (qtd === 0) {
        container.innerHTML = '<p style="color: #64748b; font-size: 13px;">Nenhum descendente registrado</p>';
        return;
    }
    
    let html = '<div style="margin-top: 15px;"><label style="font-weight: 600; margin-bottom: 10px; display: block;">📋 Informações dos Descendentes:</label>';
    
    for (let i = 1; i <= qtd; i++) {
        html += `
            <div class="sub-block" style="margin-bottom: 15px; border-left: 3px solid #0d8a4f;">
                <h4>🐄 Descendente #${i}</h4>
                <div class="form-grid">
                    <div class="input-group">
                        <label>Nome/ID do Descendente</label>
                        <input type="text" id="descendenteNome_${i}" placeholder="Ex: BR2024-01" class="descendente-nome">
                    </div>
                    <div class="input-group">
                        <label>Sexo do Descendente</label>
                        <select id="descendenteSexo_${i}" class="descendente-sexo">
                            <option value="">Selecione...</option>
                            <option value="Macho">Macho</option>
                            <option value="Fêmea">Fêmea</option>
                        </select>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="input-group">
                        <label>🐄 Nome da Mãe (Fêmea)</label>
                        <input type="text" id="descendenteMae_${i}" class="descendente-mae" 
                               placeholder="Código/Nome da mãe" list="listaMatrizes">
                        <div class="help-text">Selecione a matriz que gerou este descendente</div>
                    </div>
                    <div class="input-group">
                        <label>Data de Nascimento</label>
                        <input type="date" id="descendenteData_${i}" class="descendente-data">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="input-group">
                        <label>Peso ao Nascer (kg)</label>
                        <input type="number" id="descendentePeso_${i}" class="descendente-peso" step="0.1" placeholder="0.0">
                    </div>
                    <div class="input-group">
                        <label>Observações</label>
                        <input type="text" id="descendenteObs_${i}" class="descendente-obs" placeholder="Ex: Gêmeos, parto normal...">
                    </div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}// Função para mostrar/esconder campos de laboratório
function toggleCamposReprodutor() {
    const tipoReprodutor = document.getElementById('formTipoMacho').value;
    const campoLaboratorio = document.getElementById('campoLaboratorio');
    
    if (tipoReprodutor === 'laboratorio') {
        campoLaboratorio.style.display = 'block';
    } else {
        campoLaboratorio.style.display = 'none';
        // Limpar campos se não for laboratório
        document.getElementById('formLaboratorio').value = '';
       
    }
}
// TESTE - Função de edição simplificada
// ============================================
// FUNÇÃO EDITAR ANIMAL (COMPLETA)
window.editarAnimal = function(id) {
    const animal = animais.find(a => a.id === id);
    if (!animal) {
        mostrarMensagem('Animal não encontrado!', 'erro');
        return;
    }
    
    console.log("Editando animal:", animal);
    
    // Abrir modal
    const modalForm = document.getElementById('modalForm');
    const modalTitle = document.getElementById('modalTitle');
    const btnSalvar = document.getElementById('btnSalvar');
    
    modalTitle.innerText = "Editar Animal";
    btnSalvar.innerText = "Salvar Alterações";
    
    // Limpar formulário primeiro
    if (typeof limparFormulario === 'function') {
        limparFormulario();
    }
    
    // PREENCHER DADOS BÁSICOS
    document.getElementById('formCodigo').value = animal.codigo || '';
    document.getElementById('formNome').value = animal.nome || '';
    document.getElementById('formEspecie').value = animal.especie || '';
    document.getElementById('buscaRaca').value = animal.raca || '';
    document.getElementById('formRaca').value = animal.raca || '';
    document.getElementById('formGrauSangue').value = animal.grauSangue || '';
    document.getElementById('formPelagem').value = animal.pelagem || '';
    document.getElementById('formDataNascimento').value = animal.dataNascimento || '';
    document.getElementById('formPesoNascer').value = animal.pesoNascer || '';
    document.getElementById('formPesoAtual').value = animal.pesoAtual || '';
    document.getElementById('formSexo').value = animal.sexo || '';
    document.getElementById('formFinalidade').value = animal.finalidade || '';
    document.getElementById('formLote').value = animal.lote || '';
    document.getElementById('formObs').value = animal.observacoes || '';
    
    // Calcular idade
    if (animal.dataNascimento && typeof calcularIdadeAnimal === 'function') {
        calcularIdadeAnimal();
    }
    
    // Mostrar campos corretos baseado no sexo
    if (typeof toggleCamposPorSexo === 'function') {
        toggleCamposPorSexo();
    }
    
    // Disparar eventos change para ativar as funções
    const especieSelect = document.getElementById('formEspecie');
    const sexoSelect = document.getElementById('formSexo');
    if (especieSelect) especieSelect.dispatchEvent(new Event('change'));
    if (sexoSelect) sexoSelect.dispatchEvent(new Event('change'));
    
    // ========== SE FOR FÊMEA ==========
    if (animal.sexo === 'Fêmea') {
        // Dados básicos da fêmea
        const catElem = document.getElementById('formCategoriaFemea');
        if (catElem) catElem.value = animal.categoriaReprodutiva || '';
        
        const eccElem = document.getElementById('formECC');
        if (eccElem) eccElem.value = animal.ecc || '';
        
        const maeElem = document.getElementById('formMae');
        if (maeElem) maeElem.value = animal.mae || '';
        
        const paiElem = document.getElementById('formPai');
        if (paiElem) paiElem.value = animal.pai || '';
        
        const abortoElem = document.getElementById('formHistoricoAborto');
        if (abortoElem) abortoElem.value = animal.historicoAborto ? 'sim' : 'nao';
        
        // ========== CARREGAR PERGUNTA "JÁ TEVE CRIAS?" ==========
        const temCrias = (animal.qtdNascimentos && animal.qtdNascimentos > 0) || 
                         (animal.nascimentos && animal.nascimentos.length > 0);
        const temCriasSelect = document.getElementById('formTemCrias');
        if (temCriasSelect) {
            temCriasSelect.value = temCrias ? 'sim' : 'nao';
            if (typeof toggleCamposCrias === 'function') {
                toggleCamposCrias();
            }
        }
        
        // ========== CARREGAR CRIAS ==========
        const qtdCrias = (animal.nascimentos && animal.nascimentos.length) || animal.qtdNascimentos || 0;
        const qtdElem = document.getElementById('formQtdNascimentos');
        if (qtdElem) qtdElem.value = qtdCrias;
        
        if (qtdCrias > 0 && typeof gerarCamposNascimentos === 'function') {
            setTimeout(() => {
                gerarCamposNascimentos();
                setTimeout(() => {
                    if (animal.nascimentos) {
                        animal.nascimentos.forEach(n => {
                            const dataField = document.getElementById(`nascimentoData_${n.numero}`);
                            if (dataField) dataField.value = n.data || '';
                            const sexoField = document.getElementById(`nascimentoSexo_${n.numero}`);
                            if (sexoField) sexoField.value = n.sexo || '';
                            const paiField = document.getElementById(`nascimentoPai_${n.numero}`);
                            if (paiField) paiField.value = n.pai || '';
                            const pesoField = document.getElementById(`nascimentoPeso_${n.numero}`);
                            if (pesoField) pesoField.value = n.peso || '';
                            const obsField = document.getElementById(`nascimentoObs_${n.numero}`);
                            if (obsField) obsField.value = n.observacoes || '';
                        });
                    }
                }, 100);
            }, 100);
        }
        
        // ========== CARREGAR ABORTOS ==========
        if (animal.historicoAborto && typeof toggleCamposAborto === 'function') {
            setTimeout(() => {
                toggleCamposAborto();
                setTimeout(() => {
                    if (animal.abortos && animal.abortos.length > 0) {
                        const qtdAbortos = animal.abortos.length;
                        const qtdAbortosElem = document.getElementById('formQtdAbortos');
                        if (qtdAbortosElem) qtdAbortosElem.value = qtdAbortos;
                        
                        if (typeof gerarCamposAborto === 'function') {
                            gerarCamposAborto();
                        }
                        
                        setTimeout(() => {
                            animal.abortos.forEach(aborto => {
                                const dataField = document.getElementById(`abortoData_${aborto.numero}`);
                                if (dataField) dataField.value = aborto.data || '';
                                const machoField = document.getElementById(`abortoMacho_${aborto.numero}`);
                                if (machoField) machoField.value = aborto.macho || '';
                                const diasField = document.getElementById(`abortoDias_${aborto.numero}`);
                                if (diasField) diasField.value = aborto.diasGestacao || '';
                                const obsField = document.getElementById(`abortoObs_${aborto.numero}`);
                                if (obsField) obsField.value = aborto.observacoes || '';
                            });
                        }, 100);
                    }
                }, 100);
            }, 100);
        }
        
        // ========== CARREGAR DOENÇAS DA FÊMEA ==========
        if (animal.doencas && animal.doencas.length > 0) {
            setTimeout(() => {
                if (typeof atualizarListaDoencas === 'function') {
                    atualizarListaDoencas();
                }
                setTimeout(() => {
                    animal.doencas.forEach(doenca => {
                        const doencaId = doenca.nome.replace(/[^a-zA-Z0-9]/g, '_');
                        const checkbox = document.querySelector(`.doenca-checkbox[value="${doenca.nome.replace(/"/g, '&quot;')}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                            if (typeof toggleDoencaDetalhes === 'function') {
                                toggleDoencaDetalhes(checkbox, doencaId);
                            }
                            const dataDiag = document.getElementById(`dataDoenca_${doencaId}`);
                            if (dataDiag) dataDiag.value = doenca.dataDiagnostico || '';
                            
                            const tratouSelect = document.getElementById(`tratouDoenca_${doencaId}`);
                            if (tratouSelect) {
                                tratouSelect.value = doenca.tratou ? 'sim' : 'nao';
                                if (doenca.tratou && typeof toggleTratamentoCampos === 'function') {
                                    toggleTratamentoCampos(tratouSelect, doencaId);
                                    const dataTrat = document.getElementById(`dataTratamento_${doencaId}`);
                                    if (dataTrat) dataTrat.value = doenca.dataTratamento || '';
                                    const tipoTrat = document.getElementById(`tipoTratamento_${doencaId}`);
                                    if (tipoTrat) tipoTrat.value = doenca.tipoTratamento || '';
                                    const obsTrat = document.getElementById(`obsTratamento_${doencaId}`);
                                    if (obsTrat) obsTrat.value = doenca.observacoesTratamento || '';
                                }
                            }
                        }
                    });
                }, 200);
            }, 200);
        }
    }
    
    // ========== SE FOR MACHO ==========
    if (animal.sexo === 'Macho') {
        // Dados básicos do macho
        const tipoElem = document.getElementById('formTipoMacho');
        if (tipoElem) tipoElem.value = animal.tipoReprodutor || '';
        
        const exameElem = document.getElementById('formExameAndrologico');
        if (exameElem) exameElem.value = animal.exameAndrologicoDia ? 'sim' : 'nao';
        
        const eccMachoElem = document.getElementById('formECCMacho');
        if (eccMachoElem) eccMachoElem.value = animal.eccMacho || '';
        
        const maeMachoElem = document.getElementById('formMaeMacho');
        if (maeMachoElem) maeMachoElem.value = animal.maeMacho || '';
        
        const paiMachoElem = document.getElementById('formPaiMacho');
        if (paiMachoElem) paiMachoElem.value = animal.paiMacho || '';
        
        const labElem = document.getElementById('formLaboratorio');
        if (labElem) labElem.value = animal.laboratorio || '';
        
        // Mostrar/esconder campo de laboratório
        const campoLab = document.getElementById('campoLaboratorio');
        if (campoLab) {
            campoLab.style.display = animal.tipoReprodutor === 'laboratorio' ? 'block' : 'none';
        }
        
        // ========== CARREGAR PERGUNTA "JÁ GEROU DESCENDENTES?" ==========
        const temDescendentes = (animal.qtdDescendentes && animal.qtdDescendentes > 0) || 
                                (animal.descendentes && animal.descendentes.length > 0);
        const temDescendentesSelect = document.getElementById('formTemDescendentes');
        if (temDescendentesSelect) {
            temDescendentesSelect.value = temDescendentes ? 'sim' : 'nao';
            if (typeof toggleCamposDescendentes === 'function') {
                toggleCamposDescendentes();
            }
        }
        
        // ========== CARREGAR DESCENDENTES ==========
        const qtdDesc = (animal.descendentes && animal.descendentes.length) || animal.qtdDescendentes || 0;
        const qtdDescElem = document.getElementById('formQtdDescendentes');
        if (qtdDescElem) qtdDescElem.value = qtdDesc;
        
        if (qtdDesc > 0 && typeof gerarCamposDescendentes === 'function') {
            setTimeout(() => {
                gerarCamposDescendentes();
                setTimeout(() => {
                    if (animal.descendentes) {
                        animal.descendentes.forEach(d => {
                            const nomeField = document.getElementById(`descendenteNome_${d.numero}`);
                            if (nomeField) nomeField.value = d.nome || '';
                            const sexoField = document.getElementById(`descendenteSexo_${d.numero}`);
                            if (sexoField) sexoField.value = d.sexo || '';
                            const maeField = document.getElementById(`descendenteMae_${d.numero}`);
                            if (maeField) maeField.value = d.mae || '';
                            const dataField = document.getElementById(`descendenteData_${d.numero}`);
                            if (dataField) dataField.value = d.dataNascimento || '';
                            const pesoField = document.getElementById(`descendentePeso_${d.numero}`);
                            if (pesoField) pesoField.value = d.pesoNascer || '';
                            const obsField = document.getElementById(`descendenteObs_${d.numero}`);
                            if (obsField) obsField.value = d.observacoes || '';
                        });
                    }
                }, 100);
            }, 100);
        }
        
        // ========== CARREGAR DOENÇAS DO MACHO ==========
        if (animal.doencas && animal.doencas.length > 0) {
            setTimeout(() => {
                if (typeof atualizarListaDoencasMacho === 'function') {
                    atualizarListaDoencasMacho();
                }
                setTimeout(() => {
                    animal.doencas.forEach(doenca => {
                        const doencaId = 'macho_' + doenca.nome.replace(/[^a-zA-Z0-9]/g, '_');
                        const checkbox = document.querySelector(`.doenca-checkbox-macho[value="${doenca.nome.replace(/"/g, '&quot;')}"]`);
                        if (checkbox) {
                            checkbox.checked = true;
                            if (typeof toggleDoencaDetalhesMacho === 'function') {
                                toggleDoencaDetalhesMacho(checkbox, doencaId);
                            }
                            const dataDiag = document.getElementById(`dataDoencaMacho_${doencaId}`);
                            if (dataDiag) dataDiag.value = doenca.dataDiagnostico || '';
                            
                            const tratouSelect = document.getElementById(`tratouDoencaMacho_${doencaId}`);
                            if (tratouSelect) {
                                tratouSelect.value = doenca.tratou ? 'sim' : 'nao';
                                if (doenca.tratou && typeof toggleTratamentoCamposMacho === 'function') {
                                    toggleTratamentoCamposMacho(tratouSelect, doencaId);
                                    const dataTrat = document.getElementById(`dataTratamentoMacho_${doencaId}`);
                                    if (dataTrat) dataTrat.value = doenca.dataTratamento || '';
                                    const tipoTrat = document.getElementById(`tipoTratamentoMacho_${doencaId}`);
                                    if (tipoTrat) tipoTrat.value = doenca.tipoTratamento || '';
                                    const obsTrat = document.getElementById(`obsTratamentoMacho_${doencaId}`);
                                    if (obsTrat) obsTrat.value = doenca.observacoesTratamento || '';
                                }
                            }
                        }
                    });
                }, 200);
            }, 200);
        }
    }
    
    // Guardar ID para saber que é edição
    window.animalEmEdicao = animal.id;
    
    // Abrir modal
    if (modalForm) modalForm.style.display = "flex";
};
// Função para mostrar/esconder campos de crias da fêmea
function toggleCamposCrias() {
    const temCrias = document.getElementById('formTemCrias').value;
    const camposQuantidade = document.getElementById('camposQuantidadeCrias');
    
    if (temCrias === 'sim') {
        camposQuantidade.style.display = 'block';
        // Se for edição e já tiver crias, mantém os valores
        const qtdExistente = document.getElementById('formQtdNascimentos').value;
        if (qtdExistente && parseInt(qtdExistente) > 0) {
            gerarCamposNascimentos();
        }
    } else {
        camposQuantidade.style.display = 'none';
        // Limpar campos
        document.getElementById('formQtdNascimentos').value = 0;
        document.getElementById('listaNascimentosContainer').innerHTML = '';
    }
}

// Função para mostrar/esconder campos de descendentes do macho
function toggleCamposDescendentes() {
    const temDescendentes = document.getElementById('formTemDescendentes').value;
    const camposQuantidade = document.getElementById('camposQuantidadeDescendentes');
    
    if (temDescendentes === 'sim') {
        camposQuantidade.style.display = 'block';
        // Se for edição e já tiver descendentes, mantém os valores
        const qtdExistente = document.getElementById('formQtdDescendentes').value;
        if (qtdExistente && parseInt(qtdExistente) > 0) {
            gerarCamposDescendentes();
        }
    } else {
        camposQuantidade.style.display = 'none';
        // Limpar campos
        document.getElementById('formQtdDescendentes').value = 0;
        document.getElementById('listaDescendentesContainer').innerHTML = '';
    }
}
// ============================================
// MODAL DE MENSAGEM PERSONALIZADO
// ============================================

function mostrarMensagem(mensagem, tipo = 'info', titulo = '') {
    let modal = document.getElementById('modalMensagem');
    
    // Criar modal se não existir
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalMensagem';
        modal.className = 'modal-confirmacao';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-confirmacao-content">
                <div class="modal-confirmacao-header" id="modalMensagemHeader">
                    <i class="fa-solid fa-circle-info" style="font-size: 24px;" id="modalMensagemIcone"></i>
                    <h3 id="modalMensagemTitulo">Atenção</h3>
                </div>
                <div class="modal-confirmacao-body">
                    <p id="modalMensagemTexto">Mensagem aqui</p>
                </div>
                <div class="modal-confirmacao-footer" id="modalMensagemFooter">
                    <button class="btn-confirmar-ok" id="btnOkMensagem">
                        <i class="fa-solid fa-check"></i> OK
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const icone = document.getElementById('modalMensagemIcone');
    const tituloEl = document.getElementById('modalMensagemTitulo');
    const textoEl = document.getElementById('modalMensagemTexto');
    const header = document.getElementById('modalMensagemHeader');
    
    if (tipo === 'sucesso') {
        icone.className = 'fa-solid fa-check-circle';
        icone.style.color = '#0d8a4f';
        tituloEl.textContent = titulo || 'Sucesso!';
        header.className = 'modal-confirmacao-header sucesso';
    } else if (tipo === 'erro') {
        icone.className = 'fa-solid fa-circle-exclamation';
        icone.style.color = '#dc3545';
        tituloEl.textContent = titulo || 'Erro!';
        header.className = 'modal-confirmacao-header erro';
    } else if (tipo === 'aviso') {
        icone.className = 'fa-solid fa-triangle-exclamation';
        icone.style.color = '#ff9800';
        tituloEl.textContent = titulo || 'Atenção';
        header.className = 'modal-confirmacao-header aviso';
    } else {
        icone.className = 'fa-solid fa-circle-info';
        icone.style.color = '#0d8a4f';
        tituloEl.textContent = titulo || 'Informação';
        header.className = 'modal-confirmacao-header';
    }
    
    textoEl.textContent = mensagem;
    modal.style.display = 'flex';
    
    const btnOk = document.getElementById('btnOkMensagem');
    const closeModal = () => {
        modal.style.display = 'none';
        btnOk.removeEventListener('click', closeModal);
    };
    btnOk.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// ============================================
// MODAL DE CONFIRMAÇÃO PERSONALIZADO
// ============================================

let confirmarCallback = null;
let cancelarCallback = null;

function mostrarConfirmacao(mensagem, onConfirm, onCancel) {
    let modal = document.getElementById('modalConfirmacao');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modalConfirmacao';
        modal.className = 'modal-confirmacao';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-confirmacao-content">
                <div class="modal-confirmacao-header">
                    <i class="fa-solid fa-triangle-exclamation" style="color: #dc3545; font-size: 24px;"></i>
                    <h3>Confirmar Exclusão</h3>
                </div>
                <div class="modal-confirmacao-body">
                    <p id="confirmacaoMensagem">Tem certeza que deseja excluir este animal?</p>
                    <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Esta ação não pode ser desfeita!</p>
                </div>
                <div class="modal-confirmacao-footer">
                    <button class="btn-confirmar-cancelar" id="btnCancelarExclusao">
                        <i class="fa-solid fa-times"></i> Cancelar
                    </button>
                    <button class="btn-confirmar-excluir" id="btnConfirmarExclusao">
                        <i class="fa-solid fa-trash"></i> Sim, Excluir
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const mensagemEl = document.getElementById('confirmacaoMensagem');
    mensagemEl.textContent = mensagem;
    modal.style.display = 'flex';
    
    confirmarCallback = onConfirm;
    cancelarCallback = onCancel;
    
    const btnConfirmar = document.getElementById('btnConfirmarExclusao');
    const btnCancelar = document.getElementById('btnCancelarExclusao');
    
    const newBtnConfirmar = btnConfirmar.cloneNode(true);
    const newBtnCancelar = btnCancelar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(newBtnConfirmar, btnConfirmar);
    btnCancelar.parentNode.replaceChild(newBtnCancelar, btnCancelar);
    
    newBtnConfirmar.addEventListener('click', () => {
        modal.style.display = 'none';
        if (confirmarCallback) confirmarCallback();
        confirmarCallback = null;
        cancelarCallback = null;
    });
    
    newBtnCancelar.addEventListener('click', () => {
        modal.style.display = 'none';
        if (cancelarCallback) cancelarCallback();
        confirmarCallback = null;
        cancelarCallback = null;
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            if (cancelarCallback) cancelarCallback();
            confirmarCallback = null;
            cancelarCallback = null;
        }
    });
}