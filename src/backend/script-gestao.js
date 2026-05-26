let animalEditandoId = null;
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

    // ==========================================
    // EDITAR ANIMAL
    // ==========================================

    document.addEventListener('click', function(e) {

        const botaoEditar = e.target.closest('.btn-action-edit');

        if (!botaoEditar) return;

        animalEditandoId = botaoEditar.dataset.id;

        modalTitle.innerText = "Editar Animal";

        btnSalvar.innerText = "Salvar Alterações";

        animalEditandoId = botaoEditar.dataset.id;

        // ==========================================
        // PREENCHER FORMULÁRIO
        // ==========================================

        document.getElementById('formCodigo').value =
            botaoEditar.dataset.codigo || '';

        document.getElementById('formNome').value =
            botaoEditar.dataset.nome || '';

        document.getElementById('formEspecie').value =
            botaoEditar.dataset.especie || '';

        document.getElementById('formRaca').value =
            botaoEditar.dataset.raca || '';

        document.getElementById('formSexo').value =
            botaoEditar.dataset.sexo || '';

        document.getElementById('formPelagem').value =
            botaoEditar.dataset.pelagem || '';

        // DATA
        if (botaoEditar.dataset.data) {

            const partes = botaoEditar.dataset.data.split('-');

            if (partes.length === 3) {

                document.getElementById('formDataNascimento').value =
                    `${partes[2]}/${partes[1]}/${partes[0]}`;
            }
        }

        document.getElementById('formPesoNascer').value =
            botaoEditar.dataset.peso_nascer || '';

        document.getElementById('formPesoAtual').value =
            botaoEditar.dataset.peso || '';

        document.getElementById('formFinalidade').value =
            botaoEditar.dataset.finalidade || '';

        document.getElementById('formLote').value =
            botaoEditar.dataset.lote || '';

        document.getElementById('formObs').value =
            botaoEditar.dataset.observacoes || '';

        animalEditandoId = botaoEditar.dataset.id;

        modalForm.style.display = "flex";
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
        alert('Ação realizada com sucesso!');
        modalForm.style.display = "none";
    });
});

document.addEventListener('DOMContentLoaded', () => {

    const logoutBtn = document.getElementById('logoutBtn');

    if (!logoutBtn) {
        console.log('Botão logout não encontrado');
        return;
    }

    logoutBtn.addEventListener('click', async () => {
        const confirmar = confirm('Deseja sair da conta?');

        if (!confirmar) return;
        console.log('Tentando deslogar...');
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            console.error(error);
            alert(error.message);
            return;
        }

        console.log('Logout realizado');

        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
});

// =====================================================
// SUPABASE - GESTÃO DE ANIMAIS
// =====================================================

async function buscarUsuarioLogado() {

    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {

        window.location.href = 'index.html';

        return null;
    }

    return data.session.user;
}

function calcularIdade(dataNascimento) {

    if (!dataNascimento) return '-';

    const hoje = new Date();

    const nascimento = new Date(dataNascimento);

    let anos = hoje.getFullYear() - nascimento.getFullYear();

    let meses = hoje.getMonth() - nascimento.getMonth();

    // Ajuste caso ainda não tenha feito aniversário no ano
    if (
        meses < 0 ||
        (
            meses === 0 &&
            hoje.getDate() < nascimento.getDate()
        )
    ) {

        anos--;

        meses += 12;
    }

    // Menor de 1 ano
    if (anos <= 0) {

        const totalMeses =
            (hoje.getFullYear() - nascimento.getFullYear()) * 12 +
            hoje.getMonth() -
            nascimento.getMonth();

        return `${totalMeses} meses`;
    }

    return `${anos} anos`;
}

// =====================================================
// CARREGAR ANIMAIS
// =====================================================

async function carregarAnimais() {

    const usuario = await buscarUsuarioLogado();

    if (!usuario) return;

    const tbody = document.querySelector('tbody');

    const { data: animais, error } = await supabaseClient
        .from('animais')
        .select('*')
        .eq('usuario_id', usuario.id)
        .order('created_at', { ascending: false });

    if (error) {

        console.error(error);

        return;
    }

    tbody.innerHTML = '';

    animais.forEach(animal => {

        tbody.innerHTML += `

            <tr>

                <td>
                    <strong>${animal.codigo}</strong><br>
                    <small>${animal.nome || '-'}</small>
                </td>

                <td>
                    ${animal.raca} ${animal.especie}
                </td>

                <td>
                    ${calcularIdade(animal.data_nascimento)}
                </td>

                <td>
                    <span class="weight-tag">
                        ${animal.peso_atual || 0} kg
                    </span>
                </td>

                <td>
                    <span class="badge blue">
                        ${animal.status || 'Ativo'}
                    </span>
                </td>

                <td class="actions">

                    <button 
                        class="btn-action-view"

                        data-codigo="${animal.codigo}"
                        data-nome="${animal.nome || ''}"
                        data-especie="${animal.especie}"
                        data-raca="${animal.raca}"
                        data-peso="${animal.peso_atual || 0} kg"
                        data-status="${animal.status || 'Ativo'}"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>

                    <button 
                        class="btn-action-edit"

                        data-id="${animal.id}"

                        data-codigo="${animal.codigo || ''}"

                        data-nome="${animal.nome || ''}"

                        data-especie="${animal.especie || ''}"

                        data-raca="${animal.raca || ''}"

                        data-sexo="${animal.sexo || ''}"

                        data-pelagem="${animal.pelagem || ''}"

                        data-data="${animal.data_nascimento || ''}"

                        data-peso_nascer="${animal.peso_nascer || ''}"

                        data-peso="${animal.peso_atual || ''}"

                        data-finalidade="${animal.finalidade || ''}"

                        data-lote="${animal.lote || ''}"

                        data-observacoes="${animal.observacoes || ''}"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button 
                        class="btn-action-del"
                        onclick="deletarAnimal('${animal.id}')"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </td>

            </tr>
        `;
    });

    ativarVisualizacao();
}

// ==========================================
// MÁSCARA E CONVERSÃO DE DATA
// ==========================================

const inputDataNascimento = document.getElementById('formDataNascimento');

if (inputDataNascimento) {

    // Máscara automática
    inputDataNascimento.addEventListener('input', (e) => {

        let valor = e.target.value.replace(/\D/g, '');

        // Limita em 8 números
        valor = valor.substring(0, 8);

        // Adiciona barras automaticamente
        if (valor.length > 2) {
            valor = valor.replace(/^(\d{2})(\d)/, '$1/$2');
        }

        if (valor.length > 5) {
            valor = valor.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
        }

        e.target.value = valor;
    });
}

// ==========================================
// FUNÇÃO PARA CONVERTER DATA
// ==========================================

function converterDataParaBanco(dataBR) {

    if (!dataBR) return null;

    // Remove tudo que não for número
    let limpa = dataBR.replace(/\D/g, '');

    // Se digitou sem barras
    if (limpa.length === 8) {

        const dia = limpa.substring(0, 2);
        const mes = limpa.substring(2, 4);
        const ano = limpa.substring(4, 8);

        return `${ano}-${mes}-${dia}`;
    }

    // Se digitou com barras
    if (dataBR.includes('/')) {

        const partes = dataBR.split('/');

        if (partes.length !== 3) return null;

        const [dia, mes, ano] = partes;

        return `${ano}-${mes}-${dia}`;
    }

    return null;
}

// =====================================================
// CADASTRAR ANIMAL
// =====================================================

async function salvarAnimal() {

    const usuario = await buscarUsuarioLogado();

    if (!usuario) return;

    const animal = {

        usuario_id: usuario.id,

        codigo: document.getElementById('formCodigo').value,

        nome: document.getElementById('formNome').value,

        especie: document.getElementById('formEspecie').value,

        raca: document.getElementById('formRaca').value,

        sexo: document.getElementById('formSexo').value,

        pelagem: document.getElementById('formPelagem').value,

        data_nascimento: converterDataParaBanco(
            document.getElementById('formDataNascimento').value
        ),

        peso_nascer: document.getElementById('formPesoNascer').value || null,

        peso_atual: document.getElementById('formPesoAtual').value || null,

        finalidade: document.getElementById('formFinalidade').value,

        lote: document.getElementById('formLote').value,

        observacoes: document.getElementById('formObs').value
    };

    const editando = !!animalEditandoId;

    let error;

    if (animalEditandoId) {
        const resposta = await supabaseClient
            .from('animais')
            .update(animal)
            .eq('id', animalEditandoId);
        error = resposta.error;
    } else {
        const resposta = await supabaseClient
            .from('animais')
            .insert(animal);
        error = resposta.error;
    }
    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }
    alert(
        editando
            ? 'Animal atualizado com sucesso!'
            : 'Animal cadastrado com sucesso!'
    );

    animalEditandoId = null;
    document.getElementById('modalForm').style.display = 'none';
    carregarAnimais();
}

// =====================================================
// DELETAR ANIMAL
// =====================================================

async function deletarAnimal(id) {

    const confirmar = confirm('Deseja excluir este animal?');

    if (!confirmar) return;

    const { error } = await supabaseClient
        .from('animais')
        .delete()
        .eq('id', id);

    if (error) {

        console.error(error);

        alert(error.message);

        return;
    }

    alert('Animal removido!');

    carregarAnimais();
}

// =====================================================
// VISUALIZAÇÃO
// =====================================================

function ativarVisualizacao() {

    document.querySelectorAll('.btn-action-view').forEach(btn => {

        btn.addEventListener('click', function() {

            document.getElementById('viewCodigo').innerText =
                this.dataset.codigo;

            document.getElementById('viewNome').innerText =
                this.dataset.nome;

            document.getElementById('viewEspecie').innerText =
                this.dataset.especie;

            document.getElementById('viewRaca').innerText =
                this.dataset.raca;

            document.getElementById('viewPeso').innerText =
                this.dataset.peso;

            document.getElementById('viewStatus').innerText =
                this.dataset.status;

            document.getElementById('modalVisualizar').style.display = 'flex';
        });
    });
}

// =====================================================
// BOTÃO SALVAR
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

    carregarAnimais();

    const btnSalvar = document.getElementById('btnSalvar');

    if (btnSalvar) {

        btnSalvar.addEventListener('click', salvarAnimal);
    }
});