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
        alert('Ação realizada com sucesso!');
        modalForm.style.display = "none";
    });
});