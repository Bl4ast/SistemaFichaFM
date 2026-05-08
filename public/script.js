// public/script.js

// Estado limpo - Sem a API, estas variáveis ficam vazias e a ficha quebra
let bdGrimorio = { essencias: [], formas: [], modificadores: [], gatilhos: [] };
let periciasBase = []; // AGORA VEM DA API
let classesRPG = {};
let listaTreinamentosPadrao = [];
let ditCondicoes = {};

// ... (Mantenha aqui apenas as variáveis de ESTADO do jogador: magiasAprendidas, inventario, etc) ...

async function carregarDadosDoServidor() {
    try {
        const response = await fetch('/api/grimorio');
        if (!response.ok) throw new Error("Acesso negado à API Original.");

        const dados = await response.json();

        // MAPEAMENTO DOS DADOS PARA O SCRIPT
        bdGrimorio = {
            essencias: dados.essencias,
            formas: dados.formas,
            modificadores: dados.modificadores,
            gatilhos: dados.gatilhos
        };
        
        periciasBase = dados.config.periciasBase;
        classesRPG = dados.config.classesRPG;
        listaTreinamentosPadrao = dados.config.listaTreinamentosPadrao;
        ditCondicoes = dados.config.ditCondicoes;

        // INICIALIZAÇÃO SÓ DEPOIS DE RECEBER OS DADOS
        inicializarPericias(); 
        renderizarGrimorioHTML();
        renderizarTreinamentos();
        renderizarCondicoes();
        
        // Carrega o save local
        const backupStr = localStorage.getItem('rpg_backup_feiticeiros'); 
        if (backupStr) aplicarDadosNaFicha(JSON.parse(backupStr));

    } catch (e) {
        document.body.innerHTML = `<div style="color:red; text-align:center; padding:50px;">
            <h1>ERRO CRÍTICO DE AUTENTICAÇÃO</h1>
            <p>O sistema não conseguiu carregar as regras do servidor.</p>
        </div>`;
    }
}

// Inicializador principal
window.onload = () => { carregarDadosDoServidor(); };

// ... (Resto das suas funções: calcularDerivados, renderizarInventario, etc) ...
