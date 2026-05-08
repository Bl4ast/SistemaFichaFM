// public/script.js

// Estado limpo de variáveis globais de segurança (Carregadas do servidor)
let bdGrimorio = { essencias: [], formas: [], modificadores: [], gatilhos: [] };
let classesRPG = {};
let listaTreinamentosPadrao = [];
let ditCondicoes = {};

// Variáveis de estado do jogador (Salvas localmente)
let magiasAprendidas = {};
let magiasInuteis = [];
let itensMagicos = [];
let exaustaoAtual = 0;
let modoSerioAtivo = false;

let avatarImgData = ""; 
let inventario = [{ id: 1, nome: "Ferramenta Amaldiçoada", desc: "", qtd: 1, peso: 1 }]; 
let ataques = [{ id: 1, nome: "Ataque Desarmado", acao: "Padrão", teste: "Luta", dano: "1d3+FOR", critico: "x2", alcance: "C-a-C", especial: "" }]; 
let tecnicas = [{ id: 1, nome: "Técnica Básica", acao: "Padrão", custo: "1 PE", teste: "Vontade", dano: "1d6", efeito: "" }]; 
let treinamentos = []; 
let habilidades = { origem: [], espec: [], talento: [] }; 
let condicoes = []; 
let defesas = []; 
let votos = []; 
let shikigamis = []; 
let configTema = { preset: "padrao", cor: "#7c3aed", fonte: "'Poppins', sans-serif", modoBatalha: false }; 
let corrosaoAtual = 0; 
let vazioAtual = 0; 
let fimAtual = 0; 
let petalInterval = null;
let auraAzulInterval = null;

const periciasBase = [ 
    { id: 'acrobacia', nome: 'Acrobacia', attr: 'des' }, { id: 'adestramento', nome: 'Adestramento', attr: 'pre' }, 
    { id: 'artes', nome: 'Artes', attr: 'pre' }, { id: 'astucia', nome: 'Astúcia', attr: 'int' }, 
    { id: 'atletismo', nome: 'Atletismo', attr: 'for' }, { id: 'atualidades', nome: 'Atualidades', attr: 'int' }, 
    { id: 'ciencias', nome: 'Ciências', attr: 'int' }, { id: 'diplomacia', nome: 'Diplomacia', attr: 'pre' }, 
    { id: 'enganacao', nome: 'Enganação', attr: 'pre' }, { id: 'feiticaria', nome: 'Feitiçaria', attr: 'int' }, 
    { id: 'fortitude', nome: 'Fortitude', attr: 'con' }, { id: 'furtividade', nome: 'Furtividade', attr: 'des' }, 
    { id: 'iniciativa', nome: 'Iniciativa', attr: 'des' }, { id: 'intimidacao', nome: 'Intimidação', attr: 'pre' }, 
    { id: 'intuicao', nome: 'Intuição', attr: 'sab' }, { id: 'investigacao', nome: 'Investigação', attr: 'int' }, 
    { id: 'luta', nome: 'Luta', attr: 'for' }, { id: 'medicina', nome: 'Medicina', attr: 'sab' }, 
    { id: 'ocultismo', nome: 'Ocultismo', attr: 'int' }, { id: 'percepcao', nome: 'Percepção', attr: 'sab' }, 
    { id: 'pontaria', nome: 'Pontaria', attr: 'des' }, { id: 'profissao', nome: 'Profissão', attr: 'int' }, 
    { id: 'reflexos', nome: 'Reflexos', attr: 'des' }, { id: 'religiao', nome: 'Religião', attr: 'sab' }, 
    { id: 'sobrevivencia', nome: 'Sobrevivência', attr: 'sab' }, { id: 'tatica', nome: 'Tática', attr: 'int' }, 
    { id: 'vontade', nome: 'Vontade', attr: 'sab' } 
];

// --- COMUNICAÇÃO SEGURA COM O SERVIDOR ---
async function carregarDadosDoServidor() {
    console.log("Tentando conectar à API...");
    try {
        // Tenta buscar os dados
        const response = await fetch('/api/grimorio');
        
        console.log("Status da Resposta:", response.status);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }

        const dadosSeguros = await response.json();
        console.log("Dados recebidos com sucesso:", dadosSeguros);

        // Verifica se a estrutura dos dados está correta antes de atribuir
        if (!dadosSeguros.config) {
            throw new Error("A estrutura 'config' não foi encontrada no JSON.");
        }

        bdGrimorio = {
            essencias: dadosSeguros.essencias || [],
            formas: dadosSeguros.formas || [],
            modificadores: dadosSeguros.modificadores || [],
            gatilhos: dadosSeguros.gatilhos || []
        };
        
        classesRPG = dadosSeguros.config.classesRPG;
        listaTreinamentosPadrao = dadosSeguros.config.listaTreinamentosPadrao;
        ditCondicoes = dadosSeguros.config.ditCondicoes;

        renderizarGrimorioHTML();
        renderizarTreinamentos();
        renderizarCondicoes();
        
        console.log("Interface renderizada!");

    } catch (e) {
        console.error("ERRO DETALHADO:", e.message);
        mostrarModal("Erro Crítico", `Falha: ${e.message}`);
    }
}

// --- CONTROLE DE NAVEGAÇÃO DE ABAS ---
function mudarAba(aba) {
    ['principal', 'shikigamis', 'grimorio', 'itens'].forEach(a => {
        document.getElementById(`aba-${a}`).classList.add('hidden');
        document.getElementById(`btn-aba-${a}`).className = 'tab-btn tab-inactive whitespace-nowrap ' + 
            (a === 'grimorio' || a === 'itens' ? 'font-cinzel tracking-wider' : '');
    });
    document.getElementById(`aba-${aba}`).classList.remove('hidden');
    document.getElementById(`btn-aba-${aba}`).className = 'tab-btn tab-active whitespace-nowrap ' + 
        (aba === 'grimorio' || aba === 'itens' ? 'font-cinzel tracking-wider' : '');
}

// --- SISTEMA DO GRANDE GRIMÓRIO (RENDERIZADO VIA API) ---
function renderizarGrimorioHTML() {
    if (!bdGrimorio.essencias.length) return; // Aguarda o download seguro da API
    
    const containerMapping = [
        { tipo: 'essencias', div: 'grim-essencias', corTag: 'emerald' },
        { tipo: 'formas', div: 'grim-formas', corTag: 'cyan' },
        { tipo: 'modificadores', div: 'grim-modificadores', corTag: 'fuchsia' },
        { tipo: 'gatilhos', div: 'grim-gatilhos', corTag: 'amber' }
    ];

    containerMapping.forEach(m => {
        const div = document.getElementById(m.div); 
        div.innerHTML = '';
        
        let grupos = {};
        bdGrimorio[m.tipo].forEach(item => {
            if (!grupos[item.sub]) grupos[item.sub] = [];
            grupos[item.sub].push(item);
        });

        Object.keys(grupos).forEach(subcat => {
            let blockHtml = `<details class="mb-3 bg-[#131826] rounded-lg border border-slate-700/60 overflow-hidden transition-all duration-300 shadow-md">
                <summary class="cursor-pointer font-bold text-xs p-3 text-slate-300 uppercase hover:text-${m.corTag}-300 hover:bg-[#1a2035] transition flex justify-between items-center outline-none select-none">
                    <span class="tracking-widest">${subcat}</span> <i class="fas fa-chevron-down text-[10px] transition-transform transform duration-300 details-arrow"></i>
                </summary>
                <div class="p-3 grid grid-cols-1 gap-2 border-t border-slate-700/60 bg-[#0a0d16]">`;
            
            grupos[subcat].forEach(item => {
                const isChecked = magiasAprendidas[item.id] ? 'checked' : '';
                const colorDot = item.cor ? `<div class="w-2 h-2 rounded-full absolute top-2 right-2 shadow-sm" style="background-color: ${item.cor}; box-shadow: 0 0 5px ${item.cor};"></div>` : '';
                
                blockHtml += `
                    <label class="magic-checkbox-wrapper group relative" title="${item.desc}">
                        ${colorDot}
                        <input type="checkbox" class="magic-checkbox hidden" id="chk_${item.id}" onchange="toggleMagia('${item.id}', this.checked)" ${isChecked}>
                        <div class="magic-box border-${m.corTag}-900 group-hover:border-${m.corTag}-500"></div>
                        <div class="flex-1 mt-0.5">
                            <span class="text-sm font-bold text-slate-200 group-hover:text-${m.corTag}-300 transition-colors block tracking-wide">${item.nome}</span>
                            <span class="text-[10px] text-slate-400 leading-tight block mt-1 font-roboto group-hover:text-slate-300">${item.desc}</span>
                        </div>
                    </label>`;
            });
            blockHtml += `</div></details>`;
            div.innerHTML += blockHtml;
        });
    });
    atualizarOpcoesCrafter();
}

function toggleMagia(id, checked) { 
    magiasAprendidas[id] = checked; 
    atualizarOpcoesCrafter(); 
    autoSalvar(); 
}

function getItemPorIdGlobal(id) {
    if (!id) return null;
    let found = bdGrimorio.essencias.find(i => i.id === id); if (found) return found;
    found = bdGrimorio.formas.find(i => i.id === id); if (found) return found;
    found = bdGrimorio.modificadores.find(i => i.id === id); if (found) return found;
    found = bdGrimorio.gatilhos.find(i => i.id === id); if (found) return found;
    return null;
}

// --- SINTETIZADOR ARCANO ---
function atualizarOpcoesCrafter() {
    const selEss = document.getElementById('craft-essencia'); 
    const selForma = document.getElementById('craft-forma');
    const selMod1 = document.getElementById('craft-mod1'); 
    const selMod2 = document.getElementById('craft-mod2');
    const selGat = document.getElementById('craft-gatilho');

    const vEss = selEss.value; 
    const vFor = selForma.value; 
    const vM1 = selMod1.value; 
    const vM2 = selMod2.value; 
    const vGat = selGat.value;

    selEss.innerHTML = '<option value="">Selecione...</option>'; 
    selForma.innerHTML = '<option value="">Selecione...</option>';
    selMod1.innerHTML = '<option value="">Nenhum...</option>'; 
    selMod2.innerHTML = '<option value="">Nenhum...</option>';
    selGat.innerHTML = '<option value="">Ativação Manual...</option>';

    if (bdGrimorio.essencias && bdGrimorio.essencias.length) {
        bdGrimorio.essencias.filter(i => magiasAprendidas[i.id]).forEach(i => selEss.innerHTML += `<option value="${i.id}">${i.nome}</option>`);
        bdGrimorio.formas.filter(i => magiasAprendidas[i.id]).forEach(i => selForma.innerHTML += `<option value="${i.id}">${i.nome}</option>`);
        bdGrimorio.modificadores.filter(i => magiasAprendidas[i.id]).forEach(i => { 
            selMod1.innerHTML += `<option value="${i.id}">${i.nome}</option>`; 
            selMod2.innerHTML += `<option value="${i.id}">${i.nome}</option>`; 
        });
        bdGrimorio.gatilhos.filter(i => magiasAprendidas[i.id]).forEach(i => selGat.innerHTML += `<option value="${i.id}">${i.nome}</option>`);
    }

    if (selEss.querySelector(`option[value="${vEss}"]`)) selEss.value = vEss;
    if (selForma.querySelector(`option[value="${vFor}"]`)) selForma.value = vFor;
    if (selMod1.querySelector(`option[value="${vM1}"]`)) selMod1.value = vM1;
    if (selMod2.querySelector(`option[value="${vM2}"]`)) selMod2.value = vM2;
    if (selGat.querySelector(`option[value="${vGat}"]`)) selGat.value = vGat;

    gerarDescricaoMagia();
}

function animarSintese() { 
    const box = document.getElementById('synthesizer-box'); 
    box.classList.remove('flash-magic'); 
    void box.offsetWidth; 
    box.classList.add('flash-magic'); 
    gerarDescricaoMagia(true); 
}

function gerarDescricaoMagia(forcarNarrativa = false) {
    const idEss = document.getElementById('craft-essencia').value; 
    const idForma = document.getElementById('craft-forma').value;
    const idMod1 = document.getElementById('craft-mod1').value; 
    const idMod2 = document.getElementById('craft-mod2').value;
    const idGatilho = document.getElementById('craft-gatilho').value;

    const elNome = document.getElementById('craft-nome'); 
    const elDesc = document.getElementById('craft-desc');
    const svgCircle = document.getElementById('magic-circle-result');

    if (!idEss || !idForma) {
        elNome.innerText = "Aguardando componentes...";
        elNome.classList.remove('text-emerald-300'); elNome.classList.add('text-white');
        elDesc.innerText = "Combine Essência, Forma, Modificadores e Gatilhos para tecer a magia ou forjar um item. Suas opções dependem do que foi estudado nos tomos abaixo.";
        svgCircle.style.color = "transparent";
        svgCircle.style.opacity = "0.1";
        return;
    }

    const ess = getItemPorIdGlobal(idEss); 
    const forma = getItemPorIdGlobal(idForma);
    const mod1 = getItemPorIdGlobal(idMod1); 
    const mod2 = getItemPorIdGlobal(idMod2);
    const gatilho = getItemPorIdGlobal(idGatilho);

    let titulo = `${forma.nome.split('/')[0]} de ${ess.nome.split('/')[0]}`; 
    if (mod1 || mod2) titulo += " Aprimorado(a)";
    if (gatilho) titulo = `Relíquia: ${titulo}`;

    if (ess.cor) {
        svgCircle.style.color = ess.cor;
        svgCircle.style.opacity = "0.8";
        svgCircle.style.filter = `drop-shadow(0 0 10px ${ess.cor})`;
        elNome.style.color = ess.cor;
    } else {
        svgCircle.style.color = "cyan";
        elNome.style.color = "white";
    }

    let txt = `<span class="text-cyan-300 font-bold">• Efeito Geométrico:</span> <span class="text-slate-200">${forma.desc}</span><br>
               <span class="text-emerald-300 font-bold">• Natureza:</span> <span class="text-slate-200">${ess.desc}</span>`;
    
    let modsApt = [];
    if (mod1) modsApt.push(`<span class="text-fuchsia-300 font-bold">${mod1.nome}:</span> <span class="text-slate-300">${mod1.desc}</span>`);
    if (mod2 && idMod2 !== idMod1) modsApt.push(`<span class="text-fuchsia-300 font-bold">${mod2.nome}:</span> <span class="text-slate-300">${mod2.desc}</span>`);
    if (gatilho) modsApt.push(`<span class="text-amber-400 font-bold">Gatilho de Ativação (${gatilho.nome}):</span> <span class="text-amber-100">${gatilho.desc}</span>`);
    
    if (modsApt.length > 0) txt += `<br><div class="mt-2 pt-2 border-t border-slate-700/50">${modsApt.join('<br>')}</div>`;

    let rpText = `<div class="mt-4 p-4 border-l-2 bg-[#00000080] text-slate-300 italic rounded-r-lg text-sm shadow-inner" style="border-color: ${ess.cor || '#7c3aed'};">`;
    
    if (gatilho) {
        rpText += `"A magia é inscrita na matéria e adormece. Ela despertará subitamente e assumirá a forma de um(a) <b class="text-cyan-300">${forma.nome.split('/')[0]}</b> impregnada de <b style="color:${ess.cor || '#a78bfa'};">${ess.nome.split('/')[0]}</b> única e exclusivamente quando ${gatilho.desc.toLowerCase().replace('.', '')}`;
    } else {
        rpText += `"Você canaliza a essência de <b style="color:${ess.cor || '#a78bfa'};">${ess.nome.split('/')[0]}</b>, dobrando o espaço para que ela assuma a geometria exata de um(a) <b class="text-cyan-300">${forma.nome.split('/')[0]}</b>. No ar, a magia se manifesta de modo que ${forma.desc.toLowerCase().replace('.', '')}, carregando a propriedade de que ${ess.desc.toLowerCase().replace('.', '')}`;
    }
    
    if (mod1 || mod2) {
        rpText += ` A estrutura foi alterada por <span class="text-fuchsia-300">${mod1?.nome.split('/')[0] || ''}</span>${mod2 && idMod2 !== idMod1 ? ` e <span class="text-fuchsia-300">${mod2.nome.split('/')[0]}</span>` : ''}.`;
    }
    rpText += `."</div>`;

    elNome.innerText = titulo; 
    elDesc.innerHTML = txt + rpText;
}

// --- ARSENAL FORJADO ---
function gerarCaminhoSVGUnico(seedStr) {
    let num = 0; for (let i = 0; i < seedStr.length; i++) num += seedStr.charCodeAt(i);
    const pontos = 3 + (num % 5);
    const r = 40; const cx = 50, cy = 50;
    let path = '';
    for (let i = 0; i < pontos; i++) {
        const angle = (Math.PI * 2 * i) / pontos - (Math.PI / 2);
        const x = cx + r * Math.cos(angle); const y = cy + r * Math.sin(angle);
        path += (i === 0 ? `M${x},${y} ` : `L${x},${y} `);
    }
    path += 'Z';
    let svgInner = `<path d="${path}" stroke="currentColor" stroke-width="1.5" fill="none" transform="rotate(${num % 360} 50 50)"/>`;
    if (num % 2 === 0) svgInner += `<circle cx="50" cy="50" r="25" stroke="currentColor" stroke-width="1" fill="none" stroke-dasharray="2 4"/>`;
    else svgInner += `<path d="${path}" stroke="currentColor" stroke-width="0.5" fill="none" transform="rotate(${(num + 180) % 360} 50 50) scale(0.6) translate(30, 30)"/>`;
    
    return `<svg viewBox="0 0 100 100" class="w-full h-full opacity-80 animate-spin-slow">
        <circle cx="50" cy="50" r="48" stroke="currentColor" stroke-width="1" fill="none"/>
        <circle cx="50" cy="50" r="43" stroke="currentColor" stroke-width="0.5" fill="none"/>
        ${svgInner}
    </svg>`;
}

function forjarItemMagico() {
    const idEss = document.getElementById('craft-essencia').value; 
    const idForma = document.getElementById('craft-forma').value;
    if (!idEss || !idForma) { 
        mostrarModal("Falha na Forja", "É necessário no mínimo uma Essência e uma Forma para forjar um item."); 
        return; 
    }
    
    const ess = getItemPorIdGlobal(idEss); 
    const forma = getItemPorIdGlobal(idForma);
    const mod1 = getItemPorIdGlobal(document.getElementById('craft-mod1').value); 
    const mod2 = getItemPorIdGlobal(document.getElementById('craft-mod2').value);
    const gatilho = getItemPorIdGlobal(document.getElementById('craft-gatilho').value);

    const customName = document.getElementById('craft-custom-name').value.trim();
    let nomePadrao = customName || `Relíquia de ${ess.nome.split('/')[0]}`;
    if (!customName && gatilho) nomePadrao = `${gatilho.nome.split('/')[0]} de ${ess.nome.split('/')[0]}`;

    const itemForjado = {
        id: Date.now(),
        nome: nomePadrao,
        desc: `[Ao ${gatilho ? gatilho.desc.toLowerCase().replace('.', '') : 'ativar'}] manifesta uma ${forma.desc.toLowerCase().replace('.', '')} carregando o efeito absoluto de ${ess.desc.toLowerCase().replace('.', '')}`,
        essencia: ess, forma: forma, mod1: mod1, mod2: mod2, gatilho: gatilho,
        seed: idEss + idForma + (mod1 ? mod1.id : '') + (gatilho ? gatilho.id : ''),
        imagem: ""
    };

    document.getElementById('craft-custom-name').value = '';
    itensMagicos.push(itemForjado);
    renderizarItensMagicos();
    autoSalvar();
    mostrarModal("Sucesso na Forja!", "Sua relíquia foi criada e armazenada na aba 'Itens Mágicos'. Dica: Clique na imagem do item para personalizá-lo com uma foto.");
    mudarAba('itens');
}

function renderizarItensMagicos() {
    const lista = document.getElementById('lista-itens-magicos'); 
    lista.innerHTML = '';
    
    if (itensMagicos.length === 0) {
        lista.innerHTML = `<div class="col-span-full text-center p-10 text-slate-500 italic"><i class="fas fa-hammer text-4xl mb-4 block opacity-30"></i>Nenhum item forjado. Use o Sintetizador no Grimório para criar sua primeira relíquia.</div>`;
        return;
    }

    itensMagicos.forEach((item, index) => {
        const corEssencia = item.essencia.cor || '#7c3aed';
        
        let badges = `<span class="bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">${item.essencia.nome.split('/')[0]}</span>
                      <span class="bg-cyan-900/40 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">${item.forma.nome.split('/')[0]}</span>`;
        if (item.mod1) badges += `<span class="bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-700/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">${item.mod1.nome.split('/')[0]}</span>`;
        if (item.mod2 && item.mod1?.id !== item.mod2.id) badges += `<span class="bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-700/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">${item.mod2.nome.split('/')[0]}</span>`;
        if (item.gatilho) badges += `<span class="bg-amber-900/40 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-[0_0_8px_rgba(217,119,6,0.3)]"><i class="fas fa-bolt mr-1"></i>${item.gatilho.nome.split('/')[0]}</span>`;

        lista.innerHTML += `
        <div class="bg-black/40 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl overflow-hidden group transition-all hover:border-slate-500 relative flex flex-col h-full" style="box-shadow: inset 0 0 20px ${corEssencia}15;">
            <div class="p-5 flex gap-4 border-b border-slate-700/50 relative overflow-hidden">
                <div class="absolute -right-10 -top-10 w-40 h-40 opacity-10 pointer-events-none mix-blend-screen" style="color: ${corEssencia};">
                    ${gerarCaminhoSVGUnico(item.seed)}
                </div>
                <div class="w-16 h-16 flex-shrink-0 relative z-10 flex items-center justify-center group/img cursor-pointer transition-transform hover:scale-105" onclick="document.getElementById('upload-item-${index}').click()" style="color: ${corEssencia}; filter: drop-shadow(0 0 5px ${corEssencia});">
                    ${item.imagem ? 
                        `<img src="${item.imagem}" class="w-[52px] h-[52px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full object-cover z-0 opacity-70 pointer-events-none">
                         <div class="w-full h-full relative z-10 drop-shadow-[0_0_3px_rgba(0,0,0,1)] pointer-events-none">
                             ${gerarCaminhoSVGUnico(item.seed + item.id)}
                         </div>
                         <div class="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity z-30 pointer-events-none"><i class="fas fa-camera text-white text-xs"></i></div>` : 
                        `${gerarCaminhoSVGUnico(item.seed + item.id)}
                         <div class="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity z-30 pointer-events-none"><i class="fas fa-camera text-white text-xs"></i></div>`
                    }
                    <input type="file" id="upload-item-${index}" class="hidden" accept="image/*" onchange="carregarImagemItem(event, ${index})">
                </div>
                <div class="flex-1 relative z-10 pl-2 pr-10">
                    <input type="text" class="w-full bg-transparent font-bold text-white text-xl font-cinzel border-none outline-none focus:ring-0 p-0 mb-1 transition-colors focus:text-amber-400 placeholder-slate-500" value="${item.nome}" placeholder="Nome da Relíquia..." onchange="atualizarItemMagico(${index}, 'nome', this.value)">
                    <div class="flex flex-wrap gap-1 mt-2">
                        ${badges}
                    </div>
                </div>
            </div>
            <div class="p-4 flex-1 flex flex-col bg-slate-900/30">
                <textarea class="w-full bg-transparent text-slate-300 text-sm border-none outline-none focus:ring-0 p-0 resize-y min-h-[80px] font-roboto transition-colors focus:text-white placeholder-slate-600" placeholder="História, detalhes ou lore do item..." onchange="atualizarItemMagico(${index}, 'desc', this.value)">${item.desc}</textarea>
            </div>
            <button type="button" onclick="removerItemMagico(${index})" title="Quebrar Item" class="absolute top-4 right-4 text-slate-400 hover:text-white opacity-80 md:opacity-0 group-hover:opacity-100 transition-all z-[100] bg-black/90 hover:bg-red-600 border border-slate-600 hover:border-red-400 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer shadow-lg">
                <i class="fas fa-trash text-sm"></i>
            </button>
        </div>`;
    });
}

function removerItemMagico(i) { 
    pedirConfirmacao("Quebrar Relíquia", "Deseja realmente quebrar este item mágico e transformá-lo em poeira?", "Quebrar", () => { 
        itensMagicos.splice(i, 1); 
        renderizarItensMagicos(); 
        autoSalvar(); 
    }); 
}

function atualizarItemMagico(i, c, v) { 
    itensMagicos[i][c] = v; 
    autoSalvar(); 
}

function carregarImagemItem(event, index) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 250;
            let width = img.width, height = img.height;
            if (width > height) { 
                if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } 
            } else { 
                if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } 
            }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            itensMagicos[index].imagem = canvas.toDataURL('image/jpeg', 0.85);
            renderizarItensMagicos();
            autoSalvar();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// --- TRANQUEIRAS & TRUQUES ---
function renderizarMagiasInuteis() {
    const lista = document.getElementById('lista-magias-inuteis'); 
    lista.innerHTML = '';
    magiasInuteis.forEach((mag, index) => {
        lista.innerHTML += `
        <div class="bg-[#131826] p-4 rounded-xl border border-slate-700/60 relative group transition-all hover:border-slate-500 shadow-md">
            <button onclick="removerMagiaInutil(${index})" class="absolute top-3 right-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><i class="fas fa-times"></i></button>
            <input type="text" class="w-11/12 bg-transparent font-bold text-slate-100 text-lg font-cinzel border-none outline-none focus:ring-0 p-0 mb-2 transition-colors focus:text-cursed placeholder-slate-600" value="${mag.nome}" placeholder="Nome do Feitiço..." onchange="atualizarMagiaInutil(${index}, 'nome', this.value)">
            <textarea class="w-full bg-transparent text-slate-400 text-xs font-roboto border-none outline-none focus:ring-0 p-0 mt-1 resize-y h-16 transition-colors focus:text-slate-200 placeholder-slate-600" placeholder="O que esse truque faz?" onchange="atualizarMagiaInutil(${index}, 'desc', this.value)">${mag.desc}</textarea>
        </div>`;
    });
}
function adicionarMagiaInutil() { magiasInuteis.push({ nome: "Nova Tranqueira", desc: "" }); renderizarMagiasInuteis(); autoSalvar(); }
function removerMagiaInutil(i) { magiasInuteis.splice(i, 1); renderizarMagiasInuteis(); autoSalvar(); }
function atualizarMagiaInutil(i, c, v) { magiasInuteis[i][c] = v; autoSalvar(); }

// --- CONTROLE DE FICHA ---
function inicializarPericias() { 
    const container = document.getElementById('lista-pericias'); 
    container.innerHTML = ''; 
    periciasBase.forEach(p => { 
        container.innerHTML += `
        <div class="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700 transition-colors shadow-sm hover:border-slate-500">
            <div class="flex items-center gap-1 w-5/12">
                <span class="text-sm font-semibold text-slate-200 truncate cursor-default transition-colors" title="${p.nome}">${p.nome}</span>
                <select id="attr-per-${p.id}" class="bg-slate-900/80 border border-slate-600 rounded text-xs font-bold text-slate-400 uppercase outline-none cursor-pointer p-1 ml-1 hover:border-cyan-400 hover:text-cyan-400 transition-colors" onchange="calcularDerivados()">
                    <option value="for" ${p.attr === 'for' ? 'selected' : ''}>FOR</option>
                    <option value="des" ${p.attr === 'des' ? 'selected' : ''}>DES</option>
                    <option value="con" ${p.attr === 'con' ? 'selected' : ''}>CON</option>
                    <option value="int" ${p.attr === 'int' ? 'selected' : ''}>INT</option>
                    <option value="sab" ${p.attr === 'sab' ? 'selected' : ''}>SAB</option>
                    <option value="pre" ${p.attr === 'pre' ? 'selected' : ''}>PRE</option>
                </select>
            </div>
            <div class="flex items-center gap-2 w-7/12 justify-end">
                <select id="grau-${p.id}" class="input-field bg-slate-900 border-slate-600 p-1.5 text-xs w-[85px] font-bold transition-colors" onchange="calcularDerivados()">
                    <option value="0">Destre.</option>
                    <option value="1">Treinado</option>
                    <option value="2">Especia.</option>
                    <option value="3">Maestria</option>
                </select>
                <input type="number" id="per-${p.id}" class="input-field bg-slate-900 border-slate-600 w-10 p-1.5 text-center text-xs font-bold transition-colors" value="0" onchange="calcularDerivados()">
                <span class="text-cyan-400 font-bold w-8 text-right text-base transition-colors" id="tot-${p.id}">+0</span>
            </div>
        </div>`; 
    }); 
}

function calcularDerivados() {
    const nivel = parseInt(document.getElementById('nivel').value) || 1; 
    const getMod = (score) => Math.floor((score - 10) / 2);
    
    const baseAttrs = { 
        for: getMod(parseInt(document.getElementById('attr-for').value) || 10), 
        des: getMod(parseInt(document.getElementById('attr-des').value) || 10), 
        con: getMod(parseInt(document.getElementById('attr-con').value) || 10), 
        int: getMod(parseInt(document.getElementById('attr-int').value) || 10), 
        sab: getMod(parseInt(document.getElementById('attr-sab').value) || 10), 
        pre: getMod(parseInt(document.getElementById('attr-pre').value) || 10) 
    };
    
    let penGlobal = 0, penAtributos = { for: 0, des: 0, con: 0, int: 0, sab: 0, pre: 0 }, penDefesa = 0, multDeslocamento = 1; 
    let bonusDeslocamentoCorrosao = 0;
    
    condicoes.forEach(c => { 
        const n = c.nome; 
        if (n === "Abalado" || n === "Alucinado" || n === "Doente") penGlobal += 2; 
        if (n === "Apavorado") penGlobal += 5; 
        if (n === "Debilitado" || n === "Exausto") { penAtributos.for += 5; penAtributos.des += 5; penAtributos.con += 5; } 
        if (n === "Fraco") { penAtributos.for += 2; penAtributos.des += 2; penAtributos.con += 2; } 
        if (n === "Frustrado") { penAtributos.int += 2; penAtributos.sab += 2; penAtributos.pre += 2; } 
        if (n === "Doente") { penAtributos.for += 2; penAtributos.des += 2; penAtributos.con += 2; penAtributos.int += 2; penAtributos.sab += 2; penAtributos.pre += 2; } 
        if (["Exausto", "Lento", "Cego", "Enredado"].includes(n)) multDeslocamento *= 0.5; 
        if (["Agarrado", "Paralisado", "Preso", "Inconsciente", "Morrendo", "Petrificado", "Esmagado"].includes(n)) multDeslocamento = 0; 
        if (n === "Desprevenido" || n === "Atordoado") penDefesa += 5; 
        if (n === "Vulnerável") penDefesa += 2; 
        if (n === "Indefeso" || n === "Inconsciente" || n === "Paralisado" || n === "Preso") penDefesa += 10; 
    });

    if (configTema.preset === 'vinteum') { 
        penGlobal *= -1; penDefesa *= -1; 
        for (let key in penAtributos) { penAtributos[key] *= -1; } 
        if (multDeslocamento < 1) multDeslocamento = 2; 
    }
    
    for (let key in baseAttrs) { 
        const elMod = document.getElementById(`mod-${key}`);
        if(elMod) elMod.innerText = baseAttrs[key] >= 0 ? '+' + baseAttrs[key] : baseAttrs[key]; 
    }
    
    const bonusMaestria = Math.ceil(nivel / 4) + 1; 
    const elBonusNivel = document.getElementById('txt-bonus-nivel');
    if(elBonusNivel) elBonusNivel.innerText = '+' + bonusMaestria; 
    let percepcaoTotal = 0;

    let bVazioDano = 0, bVazioAcerto = 0, bVazioCD = 0, bVazioRD = 0, bVazioCA = 0, bVazioTR = 0, bVazioDado = 0, bVazioNivelDano = 0;
    if (configTema.preset === 'vinteum') {
        bVazioDano = vazioAtual; bVazioDado = Math.floor(vazioAtual / 5); bVazioNivelDano = Math.floor(vazioAtual / 6);
        if (vazioAtual > 0) { 
            const tabela = [ 
                { a: 0, r: 0, t: 0 }, { a: 1, r: 1, t: 1 }, { a: 2, r: 1, t: 1 }, 
                { a: 2, r: 2, t: 1 }, { a: 3, r: 2, t: 2 }, { a: 3, r: 2, t: 2 }, { a: 4, r: 2, t: 2 } 
            ]; 
            let ref = vazioAtual > 6 ? 6 : vazioAtual; 
            bVazioAcerto = tabela[ref].a; bVazioCD = tabela[ref].a; bVazioRD = tabela[ref].r; bVazioCA = tabela[ref].r; bVazioTR = tabela[ref].t; 
            if (vazioAtual > 6) { 
                let extra = vazioAtual - 6; 
                bVazioAcerto += Math.floor(extra / 2); bVazioCD += Math.floor(extra / 2); 
                bVazioRD += Math.floor(extra / 3); bVazioCA += Math.floor(extra / 3); 
                bVazioTR += Math.floor(extra / 4); 
            } 
        }
    }
    
    let buffsTexto = "Nenhum efeito ativo."; let buffsDano = "";
    if (configTema.preset === 'vinteum' && vazioAtual > 0) { 
        buffsTexto = `+${bVazioAcerto} Acerto e CD | +${bVazioCA} CA | +${bVazioRD} RD Geral | +${bVazioTR} em TODOS os Testes`; 
        buffsDano = `+${bVazioDano} Dano Fixo em Tudo`; 
        if (bVazioDado > 0) buffsDano += ` | +${bVazioDado}d de Dano na Arma`; 
        if (bVazioNivelDano > 0) buffsDano += ` | +${bVazioNivelDano} Nível(is) de Dano`; 
    }
    const elBuffsText = document.getElementById('vazio-buffs-texto');
    const elBuffsDmg = document.getElementById('vazio-buffs-dano');
    if(elBuffsText) elBuffsText.innerText = buffsTexto; 
    if(elBuffsDmg) elBuffsDmg.innerText = buffsDano;

    periciasBase.forEach(p => {
        const inputGrau = document.getElementById(`grau-${p.id}`);
        const inputExtra = document.getElementById(`per-${p.id}`);
        const inputAttr = document.getElementById(`attr-per-${p.id}`);
        
        const grau = parseInt(inputGrau?.value) || 0; 
        const extra = parseInt(inputExtra?.value) || 0; 
        const chosenAttr = inputAttr?.value || p.attr; 
        const valorTreino = grau * bonusMaestria; 
        const totalFinal = (baseAttrs[chosenAttr] - (penAtributos[chosenAttr] || 0)) + valorTreino + extra - penGlobal;
        if (p.id === 'percepcao') percepcaoTotal = totalFinal;
        
        const elTotal = document.getElementById(`tot-${p.id}`); 
        if (elTotal) { 
            elTotal.innerText = totalFinal >= 0 ? '+' + totalFinal : totalFinal; 
            elTotal.classList.remove('text-cyan-400', 'text-red-400', 'text-emerald-400'); 
            if (penGlobal > 0 || (penAtributos[chosenAttr] > 0)) elTotal.classList.add('text-red-400'); 
            else if (penGlobal < 0 || (penAtributos[chosenAttr] < 0)) elTotal.classList.add('text-emerald-400'); 
            else elTotal.classList.add('text-cyan-400'); 
        }
    });

    const caTotal = 10 + baseAttrs.des + (parseInt(document.getElementById('ca-bonus').value) || 0) - penDefesa + bVazioCA;
    const elCA = document.getElementById('valor-ca'); 
    if (elCA) {
        elCA.innerText = caTotal; 
        elCA.classList.remove('text-white', 'text-red-400', 'text-cyan-400'); 
        if (penDefesa > 0) elCA.classList.add('text-red-400'); 
        else if (penDefesa < 0) elCA.classList.add('text-cyan-400'); 
        else elCA.classList.add('text-white');
    }
    
    const elPercepcao = document.getElementById('percepcao-passiva');
    const elCd = document.getElementById('valor-cd');
    if(elPercepcao) elPercepcao.innerText = 10 + percepcaoTotal; 
    if(elCd) elCd.innerText = 10 + bonusMaestria + baseAttrs[document.getElementById('attr-cd').value] + bVazioCD;

    let rdBase = parseInt(document.getElementById('rd-geral-base').value) || 0; 
    let rdTotal = rdBase + bVazioRD;
    const elRdTotal = document.getElementById('rd-total-display'); 
    if(elRdTotal) {
        elRdTotal.innerText = `= ${rdTotal}`; 
        if (bVazioRD > 0) elRdTotal.classList.remove('hidden'); else elRdTotal.classList.add('hidden');
    }

    let maxCorrosao = Math.max(0, Math.floor(baseAttrs.int / 2)); 
    if (document.getElementById('corr-max')) document.getElementById('corr-max').innerText = maxCorrosao;
    
    if (configTema.preset === 'vinteum' && configTema.modoBatalha) { 
        bonusDeslocamentoCorrosao = 6; 
        document.getElementById('corr-atk').innerText = '+' + Math.floor(bonusMaestria / 2); 
        document.getElementById('corr-dmg').innerText = '+' + bonusMaestria; 
        let dcTeste = 15 + bonusMaestria + corrosaoAtual + Math.floor(nivel / 2); 
        document.getElementById('corr-dc').innerText = dcTeste; 
        const elAtual = document.getElementById('corr-atual'); 
        if(elAtual) {
            elAtual.innerText = corrosaoAtual; 
            if (corrosaoAtual >= maxCorrosao && maxCorrosao > 0) { 
                elAtual.classList.add('text-red-500', 'animate-pulse'); elAtual.classList.remove('text-white'); 
            } else { 
                elAtual.classList.remove('text-red-500', 'animate-pulse'); elAtual.classList.add('text-white'); 
            } 
        }
    }

    const inputDesloc = document.getElementById('deslocamento'); 
    const alertaDesloc = document.getElementById('alerta-deslocamento'); 
    const totalBadge = document.getElementById('deslocamento-total');
    let deslocBase = parseInt(inputDesloc?.value) || 9; 
    let deslocFinal = Math.floor(deslocBase * multDeslocamento);
    
    if(totalBadge) {
        if (bonusDeslocamentoCorrosao > 0 || multDeslocamento !== 1) { 
            totalBadge.classList.remove('hidden'); 
            totalBadge.innerText = (deslocFinal + bonusDeslocamentoCorrosao) + "m"; 
        } else { 
            totalBadge.classList.add('hidden'); 
        }
    }
    
    if(inputDesloc && alertaDesloc && totalBadge) {
        inputDesloc.classList.remove('text-red-500', 'text-cyan-400'); 
        alertaDesloc.classList.remove('text-red-400', 'text-cyan-400', 'text-emerald-400');
        
        if (multDeslocamento < 1) { 
            inputDesloc.classList.add('text-red-500'); 
            alertaDesloc.classList.remove('hidden'); 
            alertaDesloc.classList.add('text-red-400'); 
            alertaDesloc.innerText = multDeslocamento === 0 ? "Imóvel (0m)" : "Metade (Penalizado)"; 
            totalBadge.classList.add('bg-slate-700'); 
            totalBadge.classList.remove('bg-red-600', 'shadow-[0_0_5px_red]'); 
        } else if (multDeslocamento > 1) { 
            inputDesloc.classList.add('text-cyan-400'); 
            alertaDesloc.classList.remove('hidden'); 
            alertaDesloc.classList.add('text-emerald-400'); 
            alertaDesloc.innerText = "Acelerado (x2)"; 
            totalBadge.classList.remove('bg-slate-700'); 
            totalBadge.classList.add('bg-red-600', 'shadow-[0_0_5px_red]'); 
        } else { 
            alertaDesloc.classList.add('hidden'); 
            totalBadge.classList.remove('bg-slate-700'); 
            totalBadge.classList.add('bg-red-600', 'shadow-[0_0_5px_red]'); 
        }
    }

    const pvMax = (parseInt(document.getElementById('pv-base').value) || 0) + baseAttrs.con + (((parseInt(document.getElementById('pv-nivel').value) || 0) + baseAttrs.con) * (nivel > 1 ? nivel - 1 : 0)) + (parseInt(document.getElementById('pv-adicional').value) || 0);
    let peMaxCalculado = (parseInt(document.getElementById('pe-base').value) || 0) + baseAttrs.pre + (((parseInt(document.getElementById('pe-nivel').value) || 0) + baseAttrs.pre) * (nivel > 1 ? nivel - 1 : 0)) + (parseInt(document.getElementById('pe-adicional').value) || 0);
    
    if (modoSerioAtivo) peMaxCalculado = Math.floor(peMaxCalculado * 3);

    document.getElementById('pv-max').value = pvMax; 
    document.getElementById('pe-max').value = peMaxCalculado;
    
    let pvAtual = parseInt(document.getElementById('pv-atual').value) || 0; 
    if (pvAtual > pvMax && pvMax > 0) { pvAtual = pvMax; document.getElementById('pv-atual').value = pvMax; }
    let peAtual = parseInt(document.getElementById('pe-atual').value) || 0; 
    if (peAtual > peMaxCalculado && peMaxCalculado > 0) { peAtual = peMaxCalculado; document.getElementById('pe-atual').value = peMaxCalculado; }
    
    document.getElementById('bar-pv').style.width = (pvMax > 0 ? Math.min(100, Math.max(0, (pvAtual / pvMax) * 100)) : 0) + '%'; 
    document.getElementById('bar-pe').style.width = (peMaxCalculado > 0 ? Math.min(100, Math.max(0, (peAtual / peMaxCalculado) * 100)) : 0) + '%';
}

function curarTotal(tipo) { 
    if (tipo === 'pv') document.getElementById('pv-atual').value = document.getElementById('pv-max').value; 
    else if (tipo === 'pe') document.getElementById('pe-atual').value = document.getElementById('pe-max').value; 
    calcularDerivados(); 
}

function mudarClasse() { 
    const val = document.getElementById('classe-select').value; 
    if (classesRPG[val] && val !== 'personalizado') { 
        document.getElementById('pv-base').value = classesRPG[val].pvBase; 
        document.getElementById('pv-nivel').value = classesRPG[val].pvNivel; 
        document.getElementById('pe-base').value = classesRPG[val].peBase; 
        document.getElementById('pe-nivel').value = classesRPG[val].peNivel; 
    } 
    calcularDerivados(); 
}

// --- CURSOR DE AVATAR ---
function carregarAvatar(event) { 
    const file = event.target.files[0]; 
    if (!file) return; 
    const reader = new FileReader(); 
    reader.onload = function(e) { 
        const img = new Image(); 
        img.onload = function() { 
            const canvas = document.createElement('canvas'); 
            const MAX_SIZE = 300; 
            let width = img.width, height = img.height; 
            if (width > height) { 
                if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } 
            } else { 
                if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } 
            } 
            canvas.width = width; canvas.height = height; 
            const ctx = canvas.getContext('2d'); 
            ctx.drawImage(img, 0, 0, width, height); 
            avatarImgData = canvas.toDataURL('image/jpeg', 0.85); 
            document.getElementById('avatar-img').src = avatarImgData; 
            document.getElementById('avatar-img').classList.remove('hidden'); 
            document.getElementById('avatar-placeholder').classList.add('hidden'); 
            document.getElementById('btn-remove-avatar').classList.remove('hidden'); 
            autoSalvar(); 
        }; 
        img.src = e.target.result; 
    }; 
    reader.readAsDataURL(file); 
}

function removerAvatar(event) { 
    event.stopPropagation(); 
    avatarImgData = ""; 
    document.getElementById('avatar-img').src = ''; 
    document.getElementById('avatar-img').classList.add('hidden'); 
    document.getElementById('avatar-placeholder').classList.remove('hidden'); 
    document.getElementById('btn-remove-avatar').classList.add('hidden'); 
    document.getElementById('avatar-upload').value = ''; 
    autoSalvar(); 
}

// --- ENERGIA EXTREMA (VINTEUM/SERIO) ---
function alterarVazio(valor) { vazioAtual += valor; if (vazioAtual < 0) vazioAtual = 0; document.getElementById('vazio-atual').innerText = vazioAtual; calcularDerivados(); autoSalvar(); }
function alterarFim(valor) { fimAtual += valor; if (fimAtual < 0) fimAtual = 0; if (fimAtual > 12) fimAtual = 12; document.getElementById('fim-atual').innerText = fimAtual; document.getElementById('bar-fim').style.width = (fimAtual / 12 * 100) + '%'; autoSalvar(); }
function alterarCorrosao(valor) { corrosaoAtual += valor; if (corrosaoAtual < 0) corrosaoAtual = 0; calcularDerivados(); autoSalvar(); }

function purgaRapida() { 
    let peAtual = parseInt(document.getElementById('pe-atual').value) || 0; 
    if (peAtual >= 5) { 
        document.getElementById('pe-atual').value = peAtual - 5; 
        alterarCorrosao(-2); 
        mostrarModal("Purga de Sistema", "Você gastou 5 PE e purgou parte do vírus! (Nível de Corrosão -2)"); 
    } else { 
        mostrarModal("Energia Insuficiente", "Você precisa de pelo menos 5 PE."); 
    } 
}

function alterarExaustao(valor) {
    exaustaoAtual += valor;
    if (exaustaoAtual < 0) exaustaoAtual = 0;
    if (exaustaoAtual > 6) exaustaoAtual = 6;
    
    const el = document.getElementById('valor-exaustao');
    if(el) {
        if (exaustaoAtual >= 6) {
            el.innerText = "6 (MORTO)";
            el.classList.add('text-red-500', 'animate-pulse');
            el.classList.remove('text-white');
            el.style.width = "auto";
            el.style.fontSize = "1rem";
        } else {
            el.innerText = exaustaoAtual;
            el.classList.remove('text-red-500', 'animate-pulse');
            el.classList.add('text-white');
            el.style.width = "2rem";
            el.style.fontSize = "1.5rem";
        }
    }
    autoSalvar();
}

function iniciarAuraAzul() { 
    if (auraAzulInterval) return; 
    const container = document.getElementById('aura-azul-container'); 
    if(!container) return;
    container.innerHTML = ''; 
    for (let i = 0; i < 20; i++) criarParticulaAzul(container); 
    auraAzulInterval = setInterval(() => { criarParticulaAzul(container); }, 150); 
}

function pararAuraAzul() { 
    clearInterval(auraAzulInterval); 
    auraAzulInterval = null; 
    const container = document.getElementById('aura-azul-container');
    if(container) container.innerHTML = ''; 
}

function criarParticulaAzul(container) { 
    const part = document.createElement('div'); 
    part.classList.add('particula-azul'); 
    part.style.left = Math.random() * 100 + 'vw'; 
    const size = Math.random() * 6 + 2; 
    part.style.width = size + 'px'; 
    part.style.height = size + 'px'; 
    part.style.animationDuration = (Math.random() * 4 + 3) + 's'; 
    container.appendChild(part); 
    setTimeout(() => { if (container.contains(part)) part.remove(); }, 7000); 
}

function toggleModoSerio() {
    modoSerioAtivo = !modoSerioAtivo;
    const btn = document.getElementById('btn-modo-serio'); 
    const selo = document.getElementById('selo-modo-serio');
    if (modoSerioAtivo) { 
        if(btn) btn.classList.add('modo-serio-on'); 
        if(selo) selo.classList.remove('hidden'); 
        document.body.classList.add('modo-serio-ativo'); 
        iniciarAuraAzul(); 
        alterarExaustao(1); 
    } else { 
        if(btn) btn.classList.remove('modo-serio-on'); 
        if(selo) selo.classList.add('hidden'); 
        document.body.classList.remove('modo-serio-ativo'); 
        pararAuraAzul(); 
    }
    calcularDerivados(); 
    autoSalvar();
}

function toggleModoBatalha() { 
    configTema.modoBatalha = !configTema.modoBatalha; 
    if (!configTema.modoBatalha && corrosaoAtual > 0) { 
        mostrarModal("Protocolo de Corrosão: Encerrado", `Modo desativado. Você fica sob a condição EXAUSTO por ${corrosaoAtual} rodada(s)!`); 
        corrosaoAtual = 0; 
    } 
    aplicarTema(configTema); 
    autoSalvar(); 
}

function iniciarPetalas() { 
    if (petalInterval) return; 
    const container = document.getElementById('petal-container'); 
    if(!container) return;
    container.innerHTML = ''; 
    for (let i = 0; i < 15; i++) criarPetala(container); 
    petalInterval = setInterval(() => { criarPetala(container); }, 300); 
}

function pararPetalas() { 
    clearInterval(petalInterval); 
    petalInterval = null; 
    const container = document.getElementById('petal-container');
    if(container) container.innerHTML = ''; 
}

function criarPetala(container) { 
    const petala = document.createElement('div'); 
    petala.classList.add('petal'); 
    petala.style.left = Math.random() * 100 + 'vw'; 
    petala.style.animationDuration = (Math.random() * 3 + 4) + 's'; 
    container.appendChild(petala); 
    setTimeout(() => { if (container.contains(petala)) petala.remove(); }, 7000); 
}

// --- RENDERIZAÇÃO DOS ELEMENTOS DO PERSONAGEM ---
function renderizarTreinamentos() { 
    const lista = document.getElementById('lista-treinamentos'); 
    if(!lista) return;
    lista.innerHTML = ''; 
    let optionsHtml = ''; 
    listaTreinamentosPadrao.forEach(t => optionsHtml += `<option value="${t}">${t}</option>`); 
    
    treinamentos.forEach((t, index) => { 
        lista.innerHTML += `<div class="bg-slate-800 p-3 rounded-lg border border-slate-700 relative group transition-colors">
            <button onclick="removerTreinamento(${index})" class="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><i class="fas fa-times"></i></button>
            <div class="flex items-center gap-2 mb-2 w-11/12">
                <select class="w-full bg-transparent font-bold text-green-300 text-sm border-b border-transparent focus:border-green-500 outline-none focus:ring-0 p-1 transition-colors appearance-none cursor-pointer" onchange="atualizarTreinamento(${index}, 'tipo', this.value)">
                    <option value="${t.tipo}" selected hidden>${t.tipo}</option>
                    ${optionsHtml}
                </select>
                <div class="flex items-center bg-slate-900 rounded border border-slate-600 px-2 py-1 gap-1">
                    <span class="text-[10px] font-bold text-slate-400 uppercase">Nvl:</span>
                    <input type="number" class="bg-transparent text-center text-white font-bold w-8 text-sm outline-none" value="${t.nivel || 1}" min="1" onchange="atualizarTreinamento(${index}, 'nivel', this.value)">
                </div>
            </div>
            <input type="text" class="w-full bg-transparent font-bold text-green-100 text-sm border-b border-green-900/50 outline-none focus:border-green-500 focus:ring-0 p-1 mb-2 transition-colors ${t.tipo === 'Personalizado' ? '' : 'hidden'}" value="${t.nomeCustom || ''}" placeholder="Nome do Treinamento" onchange="atualizarTreinamento(${index}, 'nomeCustom', this.value)">
            <textarea class="w-full bg-transparent text-slate-300 text-sm border-none outline-none focus:ring-0 p-1 resize-y h-16 transition-colors focus:text-white placeholder-slate-600" placeholder="Regras e efeitos deste treinamento..." onchange="atualizarTreinamento(${index}, 'desc', this.value)">${t.desc || ''}</textarea>
            <div class="text-[10px] text-green-400 font-bold mt-1 text-right">Maestria: Nível ${t.nivel || 1}</div>
        </div>`; 
    }); 
}
function adicionarTreinamento() { treinamentos.push({ tipo: "Combate Corpo-a-Corpo", nivel: 1, nomeCustom: "", desc: "" }); renderizarTreinamentos(); autoSalvar(); } 
function removerTreinamento(i) { treinamentos.splice(i, 1); renderizarTreinamentos(); autoSalvar(); } 
function atualizarTreinamento(i, c, v) { treinamentos[i][c] = v; renderizarTreinamentos(); autoSalvar(); }

function renderizarVotos() { 
    const lista = document.getElementById('lista-votos'); 
    if(!lista) return;
    lista.innerHTML = ''; 
    votos.forEach((voto, index) => { 
        lista.innerHTML += `<div class="bg-slate-800 p-3 rounded-lg border border-pink-900/50 relative group transition-colors">
            <button onclick="removerVoto(${index})" class="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><i class="fas fa-times"></i></button>
            <input type="text" class="w-11/12 bg-transparent font-bold text-pink-300 text-lg border-none outline-none focus:ring-0 p-0 mb-2 transition-colors focus:text-pink-400 placeholder-pink-800/50" value="${voto.nome}" placeholder="Nome do Voto" onchange="atualizarVoto(${index}, 'nome', this.value)">
            <div class="grid grid-cols-2 gap-3 mt-1">
                <div>
                    <label class="text-xs text-emerald-400 font-bold transition-colors"><i class="fas fa-plus-circle"></i> Efeito Positivo</label>
                    <textarea class="input-field bg-slate-900 text-sm p-2 h-16 resize-y mt-1 border-emerald-900/50 transition-colors" placeholder="O que você ganha..." onchange="atualizarVoto(${index}, 'positivo', this.value)">${voto.positivo}</textarea>
                </div>
                <div>
                    <label class="text-xs text-red-400 font-bold transition-colors"><i class="fas fa-minus-circle"></i> Efeito Negativo</label>
                    <textarea class="input-field bg-slate-900 text-sm p-2 h-16 resize-y mt-1 border-red-900/50 transition-colors" placeholder="O que você sacrifica..." onchange="atualizarVoto(${index}, 'negativo', this.value)">${voto.negativo}</textarea>
                </div>
            </div>
        </div>`; 
    }); 
}
function adicionarVoto() { votos.push({ nome: "Novo Voto", positivo: "", negativo: "" }); renderizarVotos(); autoSalvar(); } 
function removerVoto(i) { votos.splice(i, 1); renderizarVotos(); autoSalvar(); } 
function atualizarVoto(i, c, v) { votos[i][c] = v; autoSalvar(); }

function renderizarCondicoes() { 
    const lista = document.getElementById('lista-condicoes'); 
    if(!lista) return;
    lista.innerHTML = ''; 
    let opcoesCondicoes = ''; 
    for (let key in ditCondicoes) opcoesCondicoes += `<option value="${key}">${key}</option>`; 
    condicoes.forEach((cond, index) => { 
        lista.innerHTML += `
        <div class="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700 transition-colors">
            <select class="input-field bg-transparent border-none p-1 text-sm font-semibold text-orange-300 w-1/3 transition-colors" onchange="atualizarCondicao(${index}, 'nome', this.value)">
                <option value="${cond.nome}" selected hidden>${cond.nome || "Selecione..."}</option>
                ${opcoesCondicoes}
            </select>
            <input type="text" class="input-field bg-slate-900 p-1.5 text-xs w-full transition-colors" placeholder="Efeito da condição" value="${cond.efeito || ''}" onchange="atualizarCondicao(${index}, 'efeito', this.value)">
            <button onclick="removerCondicao(${index})" class="text-slate-500 hover:text-red-400 transition px-2"><i class="fas fa-times"></i></button>
        </div>`; 
    }); 
    calcularDerivados(); 
}
function adicionarCondicao() { condicoes.push({ nome: "", efeito: "" }); renderizarCondicoes(); autoSalvar(); } 
function removerCondicao(i) { condicoes.splice(i, 1); renderizarCondicoes(); autoSalvar(); } 
function atualizarCondicao(i, c, v) { 
    condicoes[i][c] = v; 
    if (c === 'nome' && ditCondicoes[v]) { condicoes[i]['efeito'] = ditCondicoes[v]; } 
    renderizarCondicoes(); 
    autoSalvar(); 
}

function renderizarDefesas() { 
    const lista = document.getElementById('lista-defesas'); 
    if(!lista) return;
    lista.innerHTML = ''; 
    defesas.forEach((def, index) => { 
        lista.innerHTML += `
        <div class="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700 transition-colors">
            <select class="input-field bg-transparent border-none p-1 text-sm text-teal-300 font-bold w-1/3 transition-colors" onchange="atualizarDefesa(${index}, 'tipo', this.value)">
                <option value="Resistência" ${def.tipo === 'Resistência' ? 'selected' : ''}>Resistência</option>
                <option value="Vulnerabilidade" ${def.tipo === 'Vulnerabilidade' ? 'selected' : ''}>Vulnerabilidade</option>
                <option value="Imunidade" ${def.tipo === 'Imunidade' ? 'selected' : ''}>Imunidade</option>
            </select>
            <input type="text" class="input-field bg-slate-900 p-1.5 text-xs w-full transition-colors" placeholder="Ex: Fogo, Veneno" value="${def.alvo}" onchange="atualizarDefesa(${index}, 'alvo', this.value)">
            <button onclick="removerDefesa(${index})" class="text-slate-500 hover:text-red-400 transition px-2"><i class="fas fa-times"></i></button>
        </div>`; 
    }); 
}
function adicionarDefesa() { defesas.push({ tipo: "Resistência", alvo: "" }); renderizarDefesas(); autoSalvar(); } 
function removerDefesa(i) { defesas.splice(i, 1); renderizarDefesas(); autoSalvar(); } 
function atualizarDefesa(i, c, v) { defesas[i][c] = v; autoSalvar(); }

function renderizarHabs() { 
    ['origem', 'espec', 'talento'].forEach(tipo => { 
        const lista = document.getElementById(`lista-hab-${tipo}`); 
        if(!lista) return;
        lista.innerHTML = ''; 
        habilidades[tipo].forEach((hab, index) => { 
            lista.innerHTML += `
            <div class="bg-[#0a0812] rounded-md border border-[#1f1b38] relative group transition-colors overflow-hidden mb-3 shadow-sm">
                <div class="bg-black/60 px-3 py-1 border-b border-[#1f1b38] flex justify-between items-center">
                    <input type="text" class="w-10/12 bg-transparent font-bold text-white text-sm border-none outline-none focus:ring-0 p-0 transition-colors focus:text-cyan-400 placeholder-slate-500" value="${hab.nome}" placeholder="Nome..." onchange="atualizarHab('${tipo}', ${index}, 'nome', this.value)">
                    <button onclick="removerHab('${tipo}', ${index})" class="text-slate-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"><i class="fas fa-times"></i></button>
                </div>
                <div class="p-2">
                    <textarea class="w-full bg-transparent text-gray-300 text-sm border-none outline-none focus:ring-0 p-0 resize-y h-16 transition-colors focus:text-white placeholder-slate-600 mt-1" placeholder="Regras e efeitos..." onchange="atualizarHab('${tipo}', ${index}, 'desc', this.value)">${hab.desc}</textarea>
                </div>
            </div>`; 
        }); 
    }); 
}
function adicionarHab(t) { habilidades[t].push({ nome: "Nova Habilidade", desc: "" }); renderizarHabs(); autoSalvar(); } 
function removerHab(t, i) { habilidades[t].splice(i, 1); renderizarHabs(); autoSalvar(); } 
function atualizarHab(t, i, c, v) { habilidades[t][i][c] = v; autoSalvar(); }

function renderizarInventario() { 
    const lista = document.getElementById('lista-inventario'); 
    if(!lista) return;
    lista.innerHTML = ''; 
    let pt = 0; 
    inventario.forEach((item, index) => { 
        pt += (item.qtd * item.peso); 
        lista.innerHTML += `
        <div class="grid grid-cols-12 gap-2 items-start bg-slate-800 p-2 rounded-lg border border-slate-700 transition-colors">
            <div class="col-span-7 flex flex-col gap-2">
                <input type="text" class="input-field bg-transparent border-none p-1 text-sm font-bold transition-colors" value="${item.nome}" placeholder="Nome do Item" onchange="atualizarItem(${index}, 'nome', this.value)">
                <textarea class="input-field bg-slate-900 text-xs p-2 h-12 resize-y w-full transition-colors" placeholder="Descrição ou Efeito..." onchange="atualizarItem(${index}, 'desc', this.value)">${item.desc || ''}</textarea>
            </div>
            <div class="col-span-2 pt-1">
                <input type="number" class="input-field bg-slate-900 p-1.5 text-center text-sm transition-colors" value="${item.qtd}" min="0" onchange="atualizarItem(${index}, 'qtd', this.value)">
            </div>
            <div class="col-span-2 pt-1">
                <input type="number" class="input-field bg-slate-900 p-1.5 text-center text-sm transition-colors" value="${item.peso}" min="0" step="0.1" onchange="atualizarItem(${index}, 'peso', this.value)">
            </div>
            <div class="col-span-1 pt-2 text-center">
                <button onclick="removerItem(${index})" class="text-slate-500 hover:text-red-400"><i class="fas fa-trash text-sm"></i></button>
            </div>
        </div>`; 
    }); 
    document.getElementById('peso-total').innerText = pt.toFixed(1); 
}
function adicionarItem() { inventario.push({ id: Date.now(), nome: "Novo Item", desc: "", qtd: 1, peso: 1 }); renderizarInventario(); autoSalvar(); } 
function removerItem(i) { inventario.splice(i, 1); renderizarInventario(); autoSalvar(); } 
function atualizarItem(i, c, v) { if (c === 'qtd' || c === 'peso') v = parseFloat(v) || 0; inventario[i][c] = v; renderizarInventario(); autoSalvar(); }

function renderizarAtaques() { 
    const lista = document.getElementById('lista-ataques'); 
    if(!lista) return;
    lista.innerHTML = ''; 
    ataques.forEach((atk, index) => { 
        lista.innerHTML += `
        <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 relative group transition-colors">
            <button onclick="removerAtaque(${index})" class="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><i class="fas fa-times"></i></button>
            <input type="text" class="w-11/12 bg-transparent font-bold text-red-300 text-lg border-none outline-none focus:ring-0 p-0 mb-2 transition-colors focus:text-red-400 placeholder-red-800/50" value="${atk.nome}" placeholder="Arma / Ataque" onchange="atualizarAtaque(${index}, 'nome', this.value)">
            <div class="grid grid-cols-12 gap-3">
                <div class="col-span-3">
                    <label class="text-[10px] text-slate-400 uppercase font-bold transition-colors">Ação</label>
                    <select class="input-field bg-slate-900 text-[11px] p-1.5 mt-1 transition-colors" onchange="atualizarAtaque(${index}, 'acao', this.value)">
                        <option value="Padrão" ${atk.acao === 'Padrão' ? 'selected' : ''}>Padrão</option>
                        <option value="Movimento" ${atk.acao === 'Movimento' ? 'selected' : ''}>Movimento</option>
                        <option value="Bônus" ${atk.acao === 'Bônus' ? 'selected' : ''}>Bônus</option>
                        <option value="Reação" ${atk.acao === 'Reação' ? 'selected' : ''}>Reação</option>
                        <option value="Livre" ${atk.acao === 'Livre' ? 'selected' : ''}>Livre</option>
                        <option value="Simples" ${atk.acao === 'Simples' ? 'selected' : ''}>Simples</option>
                        <option value="Complexa" ${atk.acao === 'Complexa' ? 'selected' : ''}>Complexa</option>
                    </select>
                </div>
                <div class="col-span-2">
                    <label class="text-[10px] text-slate-400 uppercase font-bold transition-colors">Teste</label>
                    <input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1 transition-colors" value="${atk.teste}" onchange="atualizarAtaque(${index}, 'teste', this.value)">
                </div>
                <div class="col-span-3">
                    <label class="text-[10px] text-slate-400 uppercase font-bold transition-colors">Dano</label>
                    <input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1 transition-colors" value="${atk.dano}" onchange="atualizarAtaque(${index}, 'dano', this.value)">
                </div>
                <div class="col-span-2">
                    <label class="text-[10px] text-slate-400 uppercase font-bold transition-colors">Crítico</label>
                    <input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1 text-center transition-colors" value="${atk.critico}" onchange="atualizarAtaque(${index}, 'critico', this.value)">
                </div>
                <div class="col-span-2">
                    <label class="text-[10px] text-slate-400 uppercase font-bold transition-colors">Alcance</label>
                    <input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1 transition-colors" value="${atk.alcance}" onchange="atualizarAtaque(${index}, 'alcance', this.value)">
                </div>
                <div class="col-span-12">
                    <textarea class="input-field bg-slate-900 text-xs p-2 mt-1 h-16 resize-y w-full transition-colors" placeholder="Especial / Observações..." onchange="atualizarAtaque(${index}, 'especial', this.value)">${atk.especial || ''}</textarea>
                </div>
            </div>
        </div>`; 
    }); 
}
function adicionarAtaque() { ataques.push({ id: Date.now(), nome: "Novo Ataque", acao: "Padrão", teste: "", dano: "", critico: "", alcance: "", especial: "" }); renderizarAtaques(); autoSalvar(); } 
function removerAtaque(i) { ataques.splice(i, 1); renderizarAtaques(); autoSalvar(); } 
function atualizarAtaque(i, c, v) { ataques[i][c] = v; autoSalvar(); }

function renderizarTecnicas() { 
    const lista = document.getElementById('lista-tecnicas'); 
    if(!lista) return;
    lista.innerHTML = ''; 
    tecnicas.forEach((tec, index) => { 
        lista.innerHTML += `
        <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 relative group transition-colors">
            <button onclick="removerTecnica(${index})" class="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><i class="fas fa-times"></i></button>
            <input type="text" class="w-11/12 bg-transparent font-bold text-purple-300 text-lg border-none outline-none focus:ring-0 p-0 mb-2 transition-colors focus:text-purple-400 placeholder-purple-800/50" value="${tec.nome}" placeholder="Nome da Técnica" onchange="atualizarTecnica(${index}, 'nome', this.value)">
            <div class="grid grid-cols-12 gap-3">
                <div class="col-span-3">
                    <label class="text-[10px] text-slate-400 uppercase font-bold transition-colors">Ação</label>
                    <select class="input-field bg-slate-900 text-[11px] p-1.5 mt-1 transition-colors" onchange="atualizarTecnica(${index}, 'acao', this.value)">
                        <option value="Padrão" ${tec.acao === 'Padrão' ? 'selected' : ''}>Padrão</option>
                        <option value="Movimento" ${tec.acao === 'Movimento' ? 'selected' : ''}>Movimento</option>
                        <option value="Bônus" ${tec.acao === 'Bônus' ? 'selected' : ''}>Bônus</option>
                        <option value="Reação" ${tec.acao === 'Reação' ? 'selected' : ''}>Reação</option>
                        <option value="Livre" ${tec.acao === 'Livre' ? 'selected' : ''}>Livre</option>
                        <option value="Simples" ${tec.acao === 'Simples' ? 'selected' : ''}>Simples</option>
                        <option value="Complexa" ${tec.acao === 'Complexa' ? 'selected' : ''}>Complexa</option>
                    </select>
                </div>
                <div class="col-span-2">
                    <label class="text-[10px] text-slate-400 uppercase font-bold transition-colors">Custo</label>
                    <input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1 text-center transition-colors" value="${tec.custo}" onchange="atualizarTecnica(${index}, 'custo', this.value)">
                </div>
                <div class="col-span-3">
                    <label class="text-[10px] text-slate-400 uppercase font-bold transition-colors">Teste</label>
                    <input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1 transition-colors" value="${tec.teste || ''}" onchange="atualizarTecnica(${index}, 'teste', this.value)">
                </div>
                <div class="col-span-4">
                    <label class="text-[10px] text-slate-400 uppercase font-bold transition-colors">Dano/Cura</label>
                    <input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1 transition-colors" value="${tec.dano}" onchange="atualizarTecnica(${index}, 'dano', this.value)">
                </div>
                <div class="col-span-12">
                    <textarea class="input-field bg-slate-900 text-sm p-2 mt-1 h-24 resize-y w-full transition-colors" placeholder="Descrição detalhada e Efeitos da Técnica..." onchange="atualizarTecnica(${index}, 'efeito', this.value)">${tec.efeito || ''}</textarea>
                </div>
            </div>
        </div>`; 
    }); 
}
function adicionarTecnica() { tecnicas.push({ id: Date.now(), nome: "Nova Técnica", acao: "Padrão", custo: "", teste: "", dano: "", efeito: "" }); renderizarTecnicas(); autoSalvar(); } 
function removerTecnica(i) { tecnicas.splice(i, 1); renderizarTecnicas(); autoSalvar(); } 
function atualizarTecnica(i, c, v) { tecnicas[i][c] = v; autoSalvar(); }

function renderizarShikigamis() { 
    const lista = document.getElementById('lista-shikigamis'); 
    if(!lista) return;
    lista.innerHTML = ''; 
    shikigamis.forEach((shiki, index) => { 
        lista.innerHTML += `
        <div class="bg-cardBg p-5 rounded-lg border border-indigo-900/50 shadow-md relative transition-colors">
            <button onclick="removerShikigami(${index})" class="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition bg-slate-800 px-3 py-1.5 rounded"><i class="fas fa-trash"></i></button>
            <input type="text" class="w-10/12 bg-transparent font-bold text-indigo-300 text-2xl border-none outline-none focus:ring-0 p-0 mb-5 transition-colors focus:text-indigo-400 placeholder-indigo-700/50" value="${shiki.nome}" placeholder="Nome do Shikigami" onchange="atualizarShiki(${index}, 'nome', this.value)">
            <div class="grid grid-cols-2 gap-4 mb-5">
                <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 transition-colors">
                    <span class="text-xs text-slate-400 uppercase font-bold block mb-2 transition-colors">Pontos de Vida</span>
                    <div class="flex items-center gap-2">
                        <input type="number" class="input-field text-red-400 font-bold p-2 text-center text-lg transition-colors" value="${shiki.pvAtual}" onchange="atualizarShiki(${index}, 'pvAtual', this.value)">
                        <span class="text-slate-500 transition-colors">/</span>
                        <input type="number" class="input-field text-slate-400 p-2 text-center text-lg transition-colors" value="${shiki.pvMax}" onchange="atualizarShiki(${index}, 'pvMax', this.value)">
                    </div>
                </div>
                <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 transition-colors">
                    <span class="text-xs text-slate-400 uppercase font-bold block mb-2 transition-colors">Energia (PE)</span>
                    <div class="flex items-center gap-2">
                        <input type="number" class="input-field text-purple-400 font-bold p-2 text-center text-lg transition-colors" value="${shiki.peAtual}" onchange="atualizarShiki(${index}, 'peAtual', this.value)">
                        <span class="text-slate-500 transition-colors">/</span>
                        <input type="number" class="input-field text-slate-400 p-2 text-center text-lg transition-colors" value="${shiki.peMax}" onchange="atualizarShiki(${index}, 'peMax', this.value)">
                    </div>
                </div>
            </div>
            <div class="space-y-4">
                <div>
                    <span class="text-xs text-slate-400 uppercase font-bold transition-colors"><i class="fas fa-crosshairs mr-1"></i> Ataques & Danos</span>
                    <textarea class="input-field bg-slate-900 text-sm p-3 h-20 resize-y mt-2 transition-colors" placeholder="Ex: Mordida (Luta) - 1d8+3 Cortante" onchange="atualizarShiki(${index}, 'ataques', this.value)">${shiki.ataques}</textarea>
                </div>
                <div>
                    <span class="text-xs text-slate-400 uppercase font-bold transition-colors"><i class="fas fa-magic mr-1"></i> Habilidades Especiais</span>
                    <textarea class="input-field bg-slate-900 text-sm p-3 h-24 resize-y mt-2 transition-colors" placeholder="Voo, Resistências..." onchange="atualizarShiki(${index}, 'habilidades', this.value)">${shiki.habilidades}</textarea>
                </div>
            </div>
        </div>`; 
    }); 
}
function adicionarShikigami() { shikigamis.push({ nome: "Novo Cão Divino", pvAtual: 10, pvMax: 10, peAtual: 0, peMax: 0, ataques: "", habilidades: "" }); renderizarShikigamis(); autoSalvar(); } 
function removerShikigami(i) { pedirConfirmacao("Dispensar Shikigami", "Tens a certeza que queres excluir este Shikigami para sempre?", "Excluir", () => { shikigamis.splice(i, 1); renderizarShikigamis(); autoSalvar(); }); } 
function atualizarShiki(i, c, v) { shikigamis[i][c] = v; autoSalvar(); }

// --- DESIGN & CUSTOMIZAÇÃO ---
function abrirConfigModal() { 
    const modal = document.getElementById('configModal'); 
    if(!modal) return;
    modal.classList.remove('hidden'); 
    setTimeout(() => { 
        modal.classList.remove('opacity-0'); 
        document.getElementById('configModalContent').classList.remove('scale-95'); 
        document.getElementById('configModalContent').classList.add('scale-100'); 
    }, 10); 
}

function fecharConfigModal() { 
    const modal = document.getElementById('configModal'); 
    if(!modal) return;
    modal.classList.add('opacity-0'); 
    document.getElementById('configModalContent').classList.remove('scale-100'); 
    document.getElementById('configModalContent').classList.add('scale-95'); 
    setTimeout(() => { modal.classList.add('hidden'); }, 300); 
}

function salvarConfigTema() { 
    configTema.preset = document.getElementById('tema-preset').value; 
    configTema.cor = document.getElementById('tema-cor').value; 
    configTema.fonte = document.getElementById('tema-fonte').value; 
    if (configTema.preset !== 'vinteum') configTema.modoBatalha = false; 
    aplicarTema(configTema); 
    fecharConfigModal(); 
    autoSalvar(); 
}

function aplicarTema(tema) {
    if (!tema) return;
    let darkColor = ajustarCorHex(tema.cor || "#7c3aed", -30);
    document.documentElement.style.setProperty('--color-cursed', tema.cor || "#7c3aed"); 
    document.documentElement.style.setProperty('--color-cursed-dark', darkColor); 
    document.documentElement.style.setProperty('--font-main', tema.fonte || "'Poppins', sans-serif");
    
    document.body.classList.remove('tema-vinteum', 'modo-batalha', 'tema-zoltraak');
    
    const btnBatalha = document.getElementById('btn-modo-batalha'); 
    const painelCorrosao = document.getElementById('painel-corrosao'); 
    const painelInexistencia = document.getElementById('painel-inexistencia');
    const btnSerio = document.getElementById('btn-modo-serio');
    const tabGrimorio = document.getElementById('btn-aba-grimorio');
    const tabItens = document.getElementById('btn-aba-itens');

    if (tema.preset && tema.preset !== 'padrao') { 
        document.body.classList.add(`tema-${tema.preset}`); 
    }
    
    if (tema.preset === 'vinteum') {
        if(btnBatalha) btnBatalha.classList.remove('hidden'); 
        if(painelInexistencia) {
            painelInexistencia.classList.remove('hidden'); 
            painelInexistencia.classList.add('flex'); 
        }
        const elTitle = document.getElementById('main-title');
        if(elTitle) elTitle.style.backgroundImage = 'none';
        
        if (tema.modoBatalha) { 
            document.body.classList.add('modo-batalha'); 
            if(btnBatalha) {
                btnBatalha.classList.add('modo-batalha-on'); 
                btnBatalha.innerHTML = '<i class="fas fa-bolt text-white"></i> MODO BATALHA: ON'; 
            }
            if(painelCorrosao) {
                painelCorrosao.classList.remove('hidden'); 
                painelCorrosao.classList.add('grid'); 
            }
            iniciarPetalas(); 
        } else { 
            if(btnBatalha) {
                btnBatalha.classList.remove('modo-batalha-on'); 
                btnBatalha.innerHTML = '<i class="fas fa-bolt text-cyan-400"></i> MODO BATALHA'; 
            }
            if(painelCorrosao) {
                painelCorrosao.classList.add('hidden'); 
                painelCorrosao.classList.remove('grid'); 
            }
            pararPetalas(); 
        }
    } else {
        if(btnBatalha) btnBatalha.classList.add('hidden'); 
        if(painelCorrosao) {
            painelCorrosao.classList.add('hidden'); 
            painelCorrosao.classList.remove('grid'); 
        }
        if(painelInexistencia) {
            painelInexistencia.classList.add('hidden'); 
            painelInexistencia.classList.remove('flex'); 
        }
        pararPetalas();
        const elTitle = document.getElementById('main-title');
        if(elTitle) elTitle.style.backgroundImage = `linear-gradient(to right, #c084fc, var(--color-cursed))`;
    }
    
    if (tema.preset === 'zoltraak') { 
        const elTitle = document.getElementById('main-title');
        if(elTitle) {
            elTitle.style.backgroundImage = 'none'; 
            elTitle.classList.add('text-white'); 
        }
        if(tabGrimorio) tabGrimorio.classList.remove('hidden');
        if(tabItens) tabItens.classList.remove('hidden');
        if(btnSerio) btnSerio.classList.remove('hidden');
    } else { 
        const elTitle = document.getElementById('main-title');
        if(elTitle) elTitle.classList.remove('text-white'); 
        if(tabGrimorio) tabGrimorio.classList.add('hidden');
        if(tabItens) tabItens.classList.add('hidden');
        if(btnSerio) btnSerio.classList.add('hidden');
        
        const abaGrim = document.getElementById('aba-grimorio');
        const abaItens = document.getElementById('aba-itens');
        if ((abaGrim && !abaGrim.classList.contains('hidden')) || (abaItens && !abaItens.classList.contains('hidden'))) {
            mudarAba('principal');
        }
    }
    calcularDerivados();
}

function ajustarCorHex(hex, luminosidade) { 
    hex = String(hex).replace(/[^0-9a-f]/gi, ''); 
    if (hex.length < 6) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]; 
    let result = "#"; 
    for (let i = 0; i < 3; i++) { 
        let c = parseInt(hex.substring(i * 2, i * 2 + 2), 16); 
        c = Math.round(Math.min(Math.max(0, c + (c * (luminosidade / 100))), 255)).toString(16); 
        result += ("00" + c).substring(c.length); 
    } 
    return result; 
}

// --- CONFIRMAÇÃO & MODAIS ---
function pedirConfirmacao(titulo, texto, textoBotao, callback) {
    document.getElementById('confirmModalTitle').innerText = titulo;
    document.getElementById('confirmModalText').innerHTML = texto;
    const btnYes = document.getElementById('confirmModalBtnYes');
    btnYes.innerText = textoBotao;
    btnYes.onclick = () => { fecharConfirmModal(); if (callback) callback(); };
    const modal = document.getElementById('confirmModal');
    if(!modal) return;
    modal.classList.remove('hidden');
    setTimeout(() => { 
        modal.classList.remove('opacity-0'); 
        document.getElementById('confirmModalContent').classList.remove('scale-95'); 
        document.getElementById('confirmModalContent').classList.add('scale-100'); 
    }, 10);
}

function fecharConfirmModal() { 
    const modal = document.getElementById('confirmModal'); 
    if(!modal) return;
    modal.classList.add('opacity-0'); 
    document.getElementById('confirmModalContent').classList.remove('scale-100'); 
    document.getElementById('confirmModalContent').classList.add('scale-95'); 
    setTimeout(() => { modal.classList.add('hidden'); }, 300); 
}

function confirmarLimparFicha() { localStorage.removeItem('rpg_backup_feiticeiros'); location.reload(); }

function mostrarModal(titulo, texto) { 
    const modal = document.getElementById('msgModal'); 
    if(!modal) return;
    document.getElementById('msgTitle').innerText = titulo; 
    document.getElementById('msgText').innerText = texto; 
    modal.classList.remove('hidden'); 
    setTimeout(() => { 
        modal.classList.remove('opacity-0'); 
        document.getElementById('msgModalContent').classList.remove('scale-95'); 
        document.getElementById('msgModalContent').classList.add('scale-100'); 
    }, 10); 
}

function fecharModal() { 
    const modal = document.getElementById('msgModal'); 
    if(!modal) return;
    modal.classList.add('opacity-0'); 
    document.getElementById('msgModalContent').classList.remove('scale-100'); 
    document.getElementById('msgModalContent').classList.add('scale-95'); 
    setTimeout(() => { modal.classList.add('hidden'); }, 300); 
}

// --- DADOS DA SESSÃO ---
function obterDadosAtuais() {
    let treinoPericias = {}; 
    periciasBase.forEach(p => { 
        const grau = parseInt(document.getElementById(`grau-${p.id}`)?.value) || 0; 
        const bonus = parseInt(document.getElementById(`per-${p.id}`)?.value) || 0; 
        const chosenAttr = document.getElementById(`attr-per-${p.id}`)?.value || p.attr; 
        treinoPericias[p.id] = { grau: grau, bonus: bonus, attr: chosenAttr }; 
    });
    return {
        jogador: document.getElementById('nome-jogador').value, 
        nome: document.getElementById('nome').value, 
        avatar: avatarImgData, 
        grau: document.getElementById('grau').value, 
        origem: document.getElementById('origem').value, 
        classeSelect: document.getElementById('classe-select').value, 
        nivel: document.getElementById('nivel').value,
        secundarios: { 
            deslocamento: document.getElementById('deslocamento').value, 
            attrCD: document.getElementById('attr-cd').value, 
            caBonus: document.getElementById('ca-bonus').value, 
            rdGeral: document.getElementById('rd-geral-base').value, 
            rdEspecifica: document.getElementById('rd-especifica').value 
        },
        classeInfo: { 
            pvBase: document.getElementById('pv-base').value, 
            pvNivel: document.getElementById('pv-nivel').value, 
            peBase: document.getElementById('pe-base').value, 
            peNivel: document.getElementById('pe-nivel').value 
        },
        atributos: { 
            for: document.getElementById('attr-for').value, 
            des: document.getElementById('attr-des').value, 
            con: document.getElementById('attr-con').value, 
            int: document.getElementById('attr-int').value, 
            sab: document.getElementById('attr-sab').value, 
            pre: document.getElementById('attr-pre').value 
        },
        pericias: treinoPericias, 
        status: { 
            pvAdicional: document.getElementById('pv-adicional').value, 
            peAdicional: document.getElementById('pe-adicional').value, 
            pvAtual: document.getElementById('pv-atual').value, 
            peAtual: document.getElementById('pe-atual').value, 
            corrosaoAtual: corrosaoAtual, vazioAtual: vazioAtual, fimAtual: fimAtual, 
            exaustaoAtual: exaustaoAtual, modoSerioAtivo: modoSerioAtivo 
        },
        condicoes: condicoes, defesas: defesas, votos: votos, shikigamis: shikigamis, 
        treinamentos: treinamentos, habilidadesDin: habilidades, inventario: inventario, 
        ataques: ataques, tecnicas: tecnicas, anotacoes: document.getElementById('anotacoes').value, tema: configTema,
        magiasAprendidas: magiasAprendidas, magiasInuteis: magiasInuteis, itensMagicos: itensMagicos
    };
}

function aplicarDadosNaFicha(dados) {
    document.getElementById('nome-jogador').value = dados.jogador || ''; 
    document.getElementById('nome').value = dados.nome || ''; 
    document.getElementById('grau').value = dados.grau || '4'; 
    document.getElementById('origem').value = dados.origem || ''; 
    document.getElementById('nivel').value = dados.nivel || 1;
    
    avatarImgData = dados.avatar || ""; 
    if (avatarImgData) { 
        document.getElementById('avatar-img').src = avatarImgData; 
        document.getElementById('avatar-img').classList.remove('hidden'); 
        document.getElementById('avatar-placeholder').classList.add('hidden'); 
        document.getElementById('btn-remove-avatar').classList.remove('hidden'); 
    } else { 
        document.getElementById('avatar-img').src = ''; 
        document.getElementById('avatar-img').classList.add('hidden'); 
        document.getElementById('avatar-placeholder').classList.remove('hidden'); 
        document.getElementById('btn-remove-avatar').classList.add('hidden'); 
    }
    
    if (dados.classeSelect) document.getElementById('classe-select').value = dados.classeSelect;
    
    if (dados.secundarios) { 
        document.getElementById('deslocamento').value = dados.secundarios.deslocamento || 9; 
        document.getElementById('attr-cd').value = dados.secundarios.attrCD || 'pre'; 
        document.getElementById('ca-bonus').value = dados.secundarios.caBonus || 0; 
        if (document.getElementById('rd-geral-base')) document.getElementById('rd-geral-base').value = dados.secundarios.rdGeral || 0; 
        if (document.getElementById('rd-especifica')) document.getElementById('rd-especifica').value = dados.secundarios.rdEspecifica || ''; 
    } else { 
        if (document.getElementById('rd-geral-base')) document.getElementById('rd-geral-base').value = 0; 
        if (document.getElementById('rd-especifica')) document.getElementById('rd-especifica').value = ''; 
    }
    
    if (dados.classeInfo) { 
        document.getElementById('pv-base').value = dados.classeInfo.pvBase || 20; 
        document.getElementById('pv-nivel').value = dados.classeInfo.pvNivel || 4; 
        document.getElementById('pe-base').value = dados.classeInfo.peBase || 2; 
        document.getElementById('pe-nivel').value = dados.classeInfo.peNivel || 2; 
    }
    
    if (dados.atributos) { 
        ['for', 'des', 'con', 'int', 'sab', 'pre'].forEach(a => { 
            document.getElementById(`attr-${a}`).value = dados.atributos[a] || 10; 
        }); 
    }
    
    if (dados.pericias) { 
        periciasBase.forEach(p => { 
            const inputGrau = document.getElementById(`grau-${p.id}`); 
            const inputBonus = document.getElementById(`per-${p.id}`); 
            const selectAttr = document.getElementById(`attr-per-${p.id}`); 
            if (inputGrau && inputBonus && dados.pericias[p.id] !== undefined) { 
                if (typeof dados.pericias[p.id] === 'object') { 
                    inputGrau.value = dados.pericias[p.id].grau || 0; 
                    inputBonus.value = dados.pericias[p.id].bonus || 0; 
                    if (selectAttr && dados.pericias[p.id].attr) selectAttr.value = dados.pericias[p.id].attr; 
                } else { 
                    inputBonus.value = dados.pericias[p.id]; 
                    inputGrau.value = dados.pericias[p.id] > 0 ? 1 : 0; 
                } 
            } 
        }); 
    }
    
    condicoes = dados.condicoes || []; 
    defesas = dados.defesas || []; 
    votos = dados.votos || []; 
    shikigamis = dados.shikigamis || []; 
    treinamentos = dados.treinamentos || []; 
    if (dados.habilidadesDin) habilidades = dados.habilidadesDin;
    
    if (dados.status) { 
        document.getElementById('pv-adicional').value = dados.status.pvAdicional || 0; 
        document.getElementById('pe-adicional').value = dados.status.peAdicional || 0; 
        document.getElementById('pv-atual').value = dados.status.pvAtual || 0; 
        document.getElementById('pe-atual').value = dados.status.peAtual || 0; 
        corrosaoAtual = dados.status.corrosaoAtual || 0; 
        vazioAtual = dados.status.vazioAtual || 0; 
        fimAtual = dados.status.fimAtual || 0; 
        document.getElementById('vazio-atual').innerText = vazioAtual; 
        document.getElementById('fim-atual').innerText = fimAtual; 
        document.getElementById('bar-fim').style.width = (fimAtual / 12 * 100) + '%'; 
        exaustaoAtual = dados.status.exaustaoAtual || 0; 
        modoSerioAtivo = dados.status.modoSerioAtivo || false;
    }
    
    inventario = dados.inventario || []; 
    ataques = (dados.ataques || []).map(atk => ({...atk, acao: atk.acao || "Padrão"})); 
    tecnicas = (dados.tecnicas || []).map(tec => ({...tec, acao: tec.acao || "Padrão"})); 
    document.getElementById('anotacoes').value = dados.anotacoes || '';
    
    magiasAprendidas = dados.magiasAprendidas || {};
    magiasInuteis = dados.magiasInuteis || [];
    itensMagicos = dados.itensMagicos || [];

    if (dados.tema) { configTema = dados.tema; aplicarTema(configTema); }

    renderizarCondicoes(); 
    renderizarDefesas(); 
    renderizarVotos(); 
    renderizarShikigamis(); 
    renderizarTreinamentos(); 
    renderizarHabs(); 
    renderizarInventario(); 
    renderizarAtaques(); 
    renderizarTecnicas(); 
    
    alterarExaustao(0); 
    const btnSerio = document.getElementById('btn-modo-serio');
    const seloSerio = document.getElementById('selo-modo-serio');
    if (modoSerioAtivo) {
        if(btnSerio) btnSerio.classList.add('modo-serio-on');
        if(seloSerio) seloSerio.classList.remove('hidden');
        document.body.classList.add('modo-serio-ativo');
        iniciarAuraAzul();
    } else {
        if(btnSerio) btnSerio.classList.remove('modo-serio-on');
        if(seloSerio) seloSerio.classList.add('hidden');
        document.body.classList.remove('modo-serio-ativo');
        pararAuraAzul();
    }
    
    calcularDerivados(); 
    renderizarGrimorioHTML();
    renderizarMagiasInuteis();
    renderizarItensMagicos();
}

function exportarFicha() { 
    const dadosFicha = obterDadosAtuais(); 
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dadosFicha, null, 2)); 
    const dlAnchorElem = document.createElement('a'); 
    dlAnchorElem.setAttribute("href", dataStr); 
    dlAnchorElem.setAttribute("download", `ficha_${dadosFicha.nome || 'feiticeiro'}.json`); 
    dlAnchorElem.click(); 
    mostrarModal("Sucesso", "Ficha guardada com sucesso! Guarde o arquivo JSON."); 
}

function importarFicha(event) { 
    const file = event.target.files[0]; 
    if (!file) return; 
    const reader = new FileReader(); 
    reader.onload = function(e) { 
        try { 
            const dados = JSON.parse(e.target.result); 
            aplicarDadosNaFicha(dados); 
            autoSalvar(); 
            mostrarModal("Sucesso", "Ficha carregada com sucesso!"); 
        } catch (error) { 
            mostrarModal("Erro", "Ocorreu um erro ao ler o arquivo JSON."); 
        } 
    }; 
    reader.readAsText(file); 
    event.target.value = ''; 
}

// --- PERSISTÊNCIA NA DATABASE LOCAL (PREPARADO PARA INTEGRAÇÃO COM DB) ---
function autoSalvar() { 
    try { 
        const dados = obterDadosAtuais(); 
        localStorage.setItem('rpg_backup_feiticeiros', JSON.stringify(dados)); 
        const statusEl = document.getElementById('save-status'); 
        if (statusEl) { 
            statusEl.classList.add('saving-indicator', 'text-green-400'); 
            setTimeout(() => { statusEl.classList.remove('saving-indicator', 'text-green-400'); }, 1500); 
        } 
    } catch (e) { 
        console.error("Erro no auto-save", e); 
    } 
}

function carregarBackup() { 
    inicializarPericias(); 
    carregarDadosDoServidor(); // Inicializa e busca as regras e grimório do backend seguro
    renderizarMagiasInuteis(); 
    renderizarItensMagicos(); 
    const backupStr = localStorage.getItem('rpg_backup_feiticeiros'); 
    if (backupStr) { 
        try { 
            const dados = JSON.parse(backupStr); 
            aplicarDadosNaFicha(dados); 
        } catch (e) { 
            console.error("Erro ao ler backup", e); 
            startFichaLimpa(); 
        } 
    } else { 
        startFichaLimpa(); 
    } 
}

function startFichaLimpa() { 
    mudarClasse(); 
    renderizarCondicoes(); 
    renderizarDefesas(); 
    renderizarVotos(); 
    renderizarShikigamis(); 
    renderizarTreinamentos(); 
    renderizarHabs(); 
    renderizarInventario(); 
    renderizarAtaques(); 
    renderizarTecnicas(); 
    aplicarTema(configTema); 
    renderizarGrimorioHTML(); 
    renderizarMagiasInuteis(); 
    renderizarItensMagicos(); 
    alterarExaustao(0); 
    document.body.classList.remove('modo-serio-ativo'); 
    pararAuraAzul(); 
}

// Inicializador
window.onload = () => { 
    carregarBackup(); 
    setInterval(autoSalvar, 3000); 
};
