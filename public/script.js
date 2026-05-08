// public/script.js

// Variáveis de REGRA (Agora vêm do servidor)
let bdGrimorio = { essencias: [], formas: [], modificadores: [], gatilhos: [] };
let periciasBase = []; 
let classesRPG = {};
let listaTreinamentosPadrao = [];
let ditCondicoes = {};

// Variáveis de ESTADO (Do jogador)
let magiasAprendidas = {};
let magiasInuteis = [];
let itensMagicos = [];
// ... (mantenha aqui todas as variáveis de estado: inventario, ataques, tecnicas, etc) ...

async function carregarDadosDoServidor() {
    console.log("Conectando ao Grimório Central...");
    try {
        const response = await fetch('/api/grimorio');
        
        if (!response.ok) {
            throw new Error(`Servidor recusou a conexão (Status ${response.status})`);
        }

        const dados = await response.json();

        // Alimenta o sistema com as regras da API
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

        // Agora que temos as regras, inicializamos a interface
        inicializarPericias(); 
        renderizarGrimorioHTML();
        renderizarTreinamentos();
        renderizarCondicoes();
        
        // Tenta carregar o save local
        const backupStr = localStorage.getItem('rpg_backup_feiticeiros'); 
        if (backupStr) aplicarDadosNaFicha(JSON.parse(backupStr));
        else startFichaLimpa();

        console.log("Sistema Autenticado e Pronto.");

    } catch (e) {
        console.error("ERRO CRÍTICO:", e.message);
        document.body.innerHTML = `
            <div style="background:#050505; color:#ff4444; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif; text-align:center;">
                <h1 style="font-size:3rem; margin-bottom:10px;">ERRO CRÍTICO DE AUTENTICAÇÃO</h1>
                <p style="font-size:1.2rem; color:#888;">O sistema não conseguiu carregar as regras do servidor.</p>
                <code style="background:#1a1a1a; padding:10px; border-radius:5px; margin-top:20px;">Detalhe: ${e.message}</code>
            </div>`;
    }
}

// Inicializador principal
window.onload = () => { carregarDadosDoServidor(); };

// --- SUAS FUNÇÕES ORIGINAIS (Mantenha todas a partir daqui) ---
// Note que inicializarPericias() agora usa o periciasBase que veio da API!
function inicializarPericias() { 
    const container = document.getElementById('lista-pericias'); 
    if(!container || !periciasBase.length) return;
    container.innerHTML = ''; 
    periciasBase.forEach(p => { 
        // ... (seu código de renderização de perícias aqui)
    });
}

// ... (Restante do script.js com calcularDerivados, renderizarInventario, etc)
