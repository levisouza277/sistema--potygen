# Potygen - Pecuária de Precisão e Gestão Bioclimática

O **Potygen** é uma plataforma web responsiva voltada para a transformação digital, melhoramento genético e gestão reprodutiva da pecuária familiar nos Sertões de Crateús. O sistema substitui as anotações manuais por um controle prático baseado em inteligência artificial, dados climáticos e gestão financeira.

---

## 🛠️ Como a Inteligência Artificial Funciona (Sem Alucinação)

O assistente inteligente do Potygen funciona como um **Consultor de Dados Seguro** do rebanho, utilizando o modelo **Gemini** com uma trava de contexto para garantir que ele nunca invente informações:

1. **Consulta Automática ao Banco:** Quando o usuário faz uma pergunta no chat, o sistema intercepta o comando e faz uma busca prévia no banco de dados (**Supabase**), puxando o histórico real daquela propriedade.
2. **Resposta Blindada:** O sistema junta esses dados reais com a pergunta do usuário e envia para o Gemini com uma ordem rígida: *"Você é o Potygen. Responda apenas usando estes dados reais da fazenda. É proibido inventar qualquer informação fora deste bloco"*. Isso garante respostas exatas, seguras e baseadas na realidade do produtor.
3. **Análise de Clima Local (Brain.js):** Uma inteligência que roda direto no navegador cruza dados de temperatura e umidade para calcular o risco de estresse térmico antes de uma inseminação, avisando o produtor se há risco de perda do sêmen.
4. **Comandos de Voz:** Integração com a `Web Speech API` para o produtor ditar os manejos no curral sem precisar digitar com as mãos ocupadas.

---

## ⚙️ Execução Local (Ambiente de Apresentação)

Para garantir estabilidade na apresentação e contornar erros de servidores de hospedagem na véspera da entrega, a interface roda localmente através do VS Code, mas salva e busca os dados na nuvem normalmente.

### Como rodar:
1. Abra a pasta do projeto no **VS Code**.
2. Certifique-se de ter a extensão **Live Server** instalada.
3. Abra o arquivo `index.html`.
4. Clique em **"Go Live"** na barra inferior do VS Code.
5. A aplicação abrirá no navegador em `http://127.0.0.1:5500`.

---

## 🕹️ Manual de Operação da Solução (Passo a Passo das Telas)

### 1. Acesso e Autenticação
* **Preencher Cadastro:** Na tela inicial, o usuário clica em "Cadastrar" e insere Nome, Distrito de Crateús, E-mail e Senha para criar seu perfil de acesso.
* **Fazer Login:** O usuário faz o login com e-mail e senha para acessar o seu painel exclusivo.

### 2. Gestão do Rebanho e Reprodução
* **Cadastrar Animal:** No menu "Rebanho", o usuário clica em "Adicionar", preenche a identificação do animal (Brinco/Nome), espécie (Bovino, Ovino ou Caprino) e raça.
* **Registrar Inseminação:** No menu "Reprodução", escolhe o animal, a data do procedimento e o sêmen utilizado. 
  * *Uso da Voz:* É possível clicar no microfone e falar (Ex: *"Inseminação feita na cabra 02 hoje"*). O sistema preenche o formulário sozinho.

### 3. Análise Preditiva e Alertas
* **Ver o Alerta de Clima:** Ao salvar a inseminação, o sistema analisa o calor de Crateús. Se a temperatura estiver perigosa para o animal, a tela exibe na hora um **Alerta Vermelho de Risco de Aborto por Estresse Térmico**, sugerindo adiar o procedimento para não perder o sêmen.

### 4. Gestão Financeira e Relatórios (CSV)
* **Controle Econômico e Produção:** No painel financeiro, registram-se os gastos (vacinas, sêmen, ração) e os ganhos (venda de leite/animais). O sistema calcula o custo real de cada filhote nascido. No painel de produção, registra-se a litragem de leite diária.
* **Botão de Exportação:** Na aba de relatórios, o usuário clica em **"Exportar Relatório de Rastreabilidade"** e o sistema baixa na hora uma planilha (arquivo .CSV que abre no Excel) com tudo unificado: animais, inseminações, finanças e produção.

---

## 🔒 Segurança de Dados (Privacidade das Propriedades)

A segurança do Potygen foi feita direto na estrutura do banco de dados para garantir que os dados financeiros e estratégicos de uma fazenda fiquem completamente isolados das outras:

* **Isolamento por Conta:** O banco de dados possui uma trava automática que reconhece o usuário logado através de chaves de segurança (tokens).
* **Bloqueio de Acesso:** Mesmo que o sistema esteja rodando em ambiente de testes ou localmente na apresentação, um usuário fica totalmente impedido de visualizar, alterar ou interceptar as informações, animais ou relatórios de outra propriedade rural. Cada produtor só enxerga o que é seu.

---

## 🚀 Parceria com a Prefeitura e Infraestrutura (Brevo)

* **Operação com a Prefeitura:** O projeto foi desenhado para a **Secretaria Municipal de Desenvolvimento Agrário e Pecuária de Crateús**. Os técnicos da prefeitura usam o sistema nas sedes dos distritos onde há internet, centralizando os dados coletados nas visitas ao campo.
* **Alertas por E-mail:** O sistema envia e-mails automáticos avisando o dia de checar se o animal ficou prenhe. Usamos o plano gratuito do **Brevo (limite de 300 e-mails/dia)** para a fase de testes do Hackathon.
* **Escala Simples:** Para expandir para todo o município e hospedar em um **domínio oficial** (como `potygen.crateus.ce.gov.br`), a prefeitura só precisa mudar a assinatura do Brevo para um plano maior e subir os arquivos para o servidor público. O código do site já está pronto e não precisa de nenhuma alteração.

---
