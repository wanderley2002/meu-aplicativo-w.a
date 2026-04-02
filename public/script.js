const socket = io();
const c1 = document.getElementById('camada-1-inicio');
const c2 = document.getElementById('camada-2-selecao');
const c3 = document.getElementById('camada-3-app');
const numContador = document.getElementById('num-contador');
const textoAlerta = document.getElementById('texto-alerta');
const fotoDinamica = document.getElementById('foto-dinamica');

let marcaAtual = "";
const somLatinha = new Audio('som/latinha-abrindo.mp3'); // Certifique-se de que o caminho está correto

// --- SISTEMA DE STATUS E EFEITOS ---
function atualizarStatus(qtd) {
    let msg = "";
    if (qtd === 0) msg = "Bora começar?";
    else if (qtd === 1) msg = "Beba com moderação!";
    else if (qtd === 2) msg = "Cuidado, vai com calma...";
    else if (qtd === 3) msg = "Perdeu o juízo?";
    else if (qtd === 4) msg = "VOCÊ VAI MORRER!";
    else if (qtd >= 11) msg = "⚠️ CPF CANCELADO ⚠️";
    else msg = "O perigo aumenta...";

    textoAlerta.innerText = msg;
    document.body.classList.remove('tremendo', 'perigo');

    if (qtd >= 10) {
        document.body.classList.add('tremendo', 'perigo');
        textoAlerta.style.color = "red";
    } else {
        textoAlerta.style.color = (qtd >= 4) ? "orange" : "#00ff00";
    }
}

// --- FUNÇÕES DE ATUALIZAÇÃO ---
async function atualizarPlacarTopo() {
    const marcas = ['monster', 'redbull', 'tnt'];
    for (let marca of marcas) {
        try {
            const res = await fetch(`/consumo/${marca}`);
            const dados = await res.json();
            const elemento = document.getElementById(`total-${marca}`);
            if (elemento) elemento.innerText = dados.total;
        } catch (err) { 
            console.error("Erro ao buscar dados do MySQL:", err); 
        }
    }
}

// --- NAVEGAÇÃO E LOGIN ---
document.getElementById('btn-entrar').addEventListener('click', async () => {
    const nomeDigitado = document.getElementById('user-nome-login').value;
    
    if (nomeDigitado.trim() !== "") {
        document.getElementById('user-nome').value = nomeDigitado;
        socket.emit('usuario_entrou', nomeDigitado);
        
        try {
            await atualizarPlacarTopo(); 
        } catch (e) {
            console.log("Servidor offline ou erro no placar, prosseguindo...");
        }

        c1.style.display = 'none';
        c2.style.display = 'block';
    } else { 
        alert("Por favor, digite seu nome!"); 
    }
});

// --- BOTÕES DE NAVEGAÇÃO ---
document.getElementById('btn-voltar-para-inicio').onclick = () => {
    c2.style.display = 'none';
    c1.style.display = 'flex';
};

document.getElementById('btn-voltar-para-marcas').onclick = () => {
    c3.style.display = 'none';
    c2.style.display = 'block';
};

// --- ESCOLHA DA MARCA ---
document.querySelectorAll('.btn-escolha-marca').forEach(btn => {
    btn.addEventListener('click', async () => {
        marcaAtual = btn.getAttribute('data-nome');
        fotoDinamica.src = btn.querySelector('img').src;
        document.getElementById('titulo-marca-ativa').innerText = "Consumo: " + marcaAtual.toUpperCase();
        
        c2.style.display = 'none';
        c3.style.display = 'block';

        try {
            const res = await fetch(`/consumo/${marcaAtual}`);
            const dados = await res.json();
            numContador.innerText = dados.total;
            atualizarStatus(parseInt(dados.total));
            atualizarPlacarTopo();
        } catch(e) { 
            console.error("Erro ao carregar dados da marca:", e); 
        }
    });
});

// --- CONTROLE DE CONSUMO (UNIFICADO) ---
document.getElementById('btn-add-lata').addEventListener('click', async () => {
    // 1. Feedback Visual (Efeito de clique)
    fotoDinamica.style.transition = "transform 0.1s";
    fotoDinamica.style.transform = "scale(0.9)";
    setTimeout(() => { fotoDinamica.style.transform = "scale(1)"; }, 100);

    // 2. Feedback Sonoro
    somLatinha.play().catch(() => console.log("Áudio aguardando interação do usuário."));

    // 3. Lógica de Interface
    let valor = parseInt(numContador.innerText) + 1;
    numContador.innerText = valor;
    atualizarStatus(valor);

    // 4. Sincronização em Tempo Real e Banco de Dados
    socket.emit('bebeu_energetico', marcaAtual);
    
    try {
        await fetch('/adicionar', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({marca: marcaAtual}) 
        });
        atualizarPlacarTopo();
    } catch(err) {
        console.error("Erro ao salvar no banco:", err);
    }
});

document.getElementById('btn-resetar').addEventListener('click', async () => {
    if(confirm("Deseja realmente ZERAR o consumo desta marca?")) {
        try {
            await fetch('/zerar', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({marca: marcaAtual}) 
            });
            socket.emit('forcar_atualizacao_geral');
        } catch(e) {
            console.error("Erro ao zerar dados:", e);
        }
    }
});

// --- CHAT GLOBAL ---
function mandarMensagem() {
    const nome = document.getElementById('user-nome').value;
    const msg = document.getElementById('user-msg').value;
    if(nome && msg.trim() !== "") {
        socket.emit('enviar_mensagem', {nome, msg});
        document.getElementById('user-msg').value = "";
    }
}

// --- SOCKET LISTENERS ---
socket.on('atualizar_geral', () => {
    atualizarPlacarTopo();
    if(marcaAtual !== "") {
        numContador.innerText = 0;
        atualizarStatus(0);
    }
});

socket.on('receber_mensagem', (d) => {
    const lista = document.getElementById('lista-mensagens');
    const p = document.createElement('p');
    p.innerHTML = `<strong></strong>: `;
    p.querySelector('strong').textContent = d.nome;
    p.appendChild(document.createTextNode(d.msg));
    
    lista.appendChild(p);
    lista.scrollTop = lista.scrollHeight;
});

socket.on('atualizar_ranking', (lista) => {
    const divRanking = document.getElementById('lista-ranking');
    divRanking.innerHTML = ""; 
    lista.forEach(user => {
        const p = document.createElement('p');
        p.innerHTML = `👤 <strong></strong>: ${user.pontos} latas`;
        p.querySelector('strong').textContent = user.nome;
        divRanking.appendChild(p);
    });
});

socket.on('aviso_bebeu', (dados) => {
    const container = document.getElementById('container-avisos');
    const aviso = document.createElement('div');
    aviso.style.cssText = "background: #000; color: #fff; padding: 10px; border-left: 5px solid gold; margin-bottom: 5px; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.5);";
    aviso.innerHTML = `🚀 <strong></strong> bebeu um <strong></strong>!`;
    aviso.querySelectorAll('strong')[0].textContent = dados.nome;
    aviso.querySelectorAll('strong')[1].textContent = dados.marca;
    
    container.appendChild(aviso);
    setTimeout(() => { aviso.remove(); }, 8000);
});

socket.on('atualizar_usuarios', (lista) => {
    const spanCount = document.getElementById('count-usuarios');
    const divNomes = document.getElementById('nomes-online');
    if(spanCount) spanCount.innerText = lista.length;
    if(divNomes) {
        divNomes.innerHTML = "";
        lista.forEach(user => { 
            const item = document.createElement('div');
            item.textContent = `• ${user.nome}`;
            divNomes.appendChild(item);
        });
    }
});