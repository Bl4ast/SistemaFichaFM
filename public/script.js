// =============================================================
// script.js — Feiticeiros & Maldições Bl4ast
// Este arquivo depende da API /api/grimorio para funcionar.
// Sem ela, a ficha não carrega. Copiar apenas este arquivo
// não é suficiente — os dados ficam protegidos na API.
// =============================================================

// ─── PONTO DE ENTRADA ────────────────────────────────────────
// Todos os dados de jogo são carregados da API antes de iniciar.
let bdGrimorio, classesRPG, listaTreinamentosPadrao, ditCondicoes, periciasBase;

async function carregarAPI() {
  try {
    const res = await fetch('/api/grimorio');

    if (res.status === 403) {
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#020617;flex-direction:column;gap:16px;font-family:sans-serif;">
          <div style="font-size:3rem;">🔒</div>
          <h1 style="color:#ef4444;font-size:1.5rem;font-weight:bold;">Acesso Não Autorizado</h1>
          <p style="color:#94a3b8;text-align:center;max-width:400px;">
            Este aplicativo é protegido. Os dados só podem ser carregados a partir do domínio oficial.<br><br>
            <span style="color:#7c3aed;font-weight:bold;">Feiticeiros & Maldições Bl4ast</span>
          </p>
        </div>`;
      return false;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const dados = await res.json();
    bdGrimorio             = dados.bdGrimorio;
    classesRPG             = dados.classesRPG;
    listaTreinamentosPadrao = dados.listaTreinamentosPadrao;
    ditCondicoes           = dados.ditCondicoes;
    periciasBase           = dados.periciasBase;
    return true;

  } catch (err) {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#020617;flex-direction:column;gap:16px;font-family:sans-serif;">
        <div style="font-size:3rem;">⚠️</div>
        <h1 style="color:#f59e0b;font-size:1.5rem;font-weight:bold;">Erro ao carregar o Grimório</h1>
        <p style="color:#94a3b8;text-align:center;max-width:400px;">
          Não foi possível conectar à API. Verifique sua conexão ou tente novamente.
        </p>
        <button onclick="location.reload()" style="background:#7c3aed;color:white;padding:10px 24px;border:none;border-radius:8px;cursor:pointer;font-size:1rem;">
          Tentar Novamente
        </button>
      </div>`;
    return false;
  }
}

// ─── ESTADO GLOBAL ───────────────────────────────────────────
let avatarImgData = "";
let inventario    = [{ id: 1, nome: "Ferramenta Amaldiçoada", desc: "", qtd: 1, peso: 1 }];
let ataques       = [{ id: 1, nome: "Ataque Desarmado", acao: "Padrão", teste: "Luta", dano: "1d3+FOR", critico: "x2", alcance: "C-a-C", especial: "" }];
let tecnicas      = [{ id: 1, nome: "Técnica Básica", acao: "Padrão", custo: "1 PE", teste: "Vontade", dano: "1d6", efeito: "" }];
let treinamentos  = [];
let habilidades   = { origem: [], espec: [], talento: [] };
let condicoes     = [];
let defesas       = [];
let votos         = [];
let shikigamis    = [];
let magiasAprendidas = {};
let magiasInuteis    = [];
let itensMagicos     = [];
let exaustaoAtual    = 0;
let modoSerioAtivo   = false;
let corrosaoAtual    = 0;
let vazioAtual       = 0;
let fimAtual         = 0;
let petalInterval    = null;
let auraAzulInterval = null;
let configTema = { preset: "padrao", cor: "#7c3aed", fonte: "'Poppins', sans-serif", modoBatalha: false };

// ─── ABAS ─────────────────────────────────────────────────────
function mudarAba(aba) {
  ['principal', 'shikigamis', 'grimorio', 'itens'].forEach(a => {
    document.getElementById(`aba-${a}`).classList.add('hidden');
    document.getElementById(`btn-aba-${a}`).className =
      'tab-btn tab-inactive whitespace-nowrap ' + (a === 'grimorio' || a === 'itens' ? 'font-cinzel tracking-wider' : '');
  });
  document.getElementById(`aba-${aba}`).classList.remove('hidden');
  document.getElementById(`btn-aba-${aba}`).className =
    'tab-btn tab-active whitespace-nowrap ' + (aba === 'grimorio' || aba === 'itens' ? 'font-cinzel tracking-wider' : '');
}

// ─── GRIMÓRIO ─────────────────────────────────────────────────
function renderizarGrimorioHTML() {
  const mapa = [
    { tipo: 'essencias',    div: 'grim-essencias',    corTag: 'emerald' },
    { tipo: 'formas',       div: 'grim-formas',       corTag: 'cyan'    },
    { tipo: 'modificadores',div: 'grim-modificadores',corTag: 'fuchsia' },
    { tipo: 'gatilhos',     div: 'grim-gatilhos',     corTag: 'amber'   },
  ];

  mapa.forEach(m => {
    const div = document.getElementById(m.div);
    div.innerHTML = '';
    let grupos = {};
    bdGrimorio[m.tipo].forEach(item => {
      if (!grupos[item.sub]) grupos[item.sub] = [];
      grupos[item.sub].push(item);
    });

    Object.keys(grupos).forEach(subcat => {
      let html = `<details class="mb-3 bg-[#131826] rounded-lg border border-slate-700/60 overflow-hidden transition-all duration-300 shadow-md">
        <summary class="cursor-pointer font-bold text-xs p-3 text-slate-300 uppercase hover:text-${m.corTag}-300 hover:bg-[#1a2035] transition flex justify-between items-center outline-none select-none">
          <span class="tracking-widest">${subcat}</span>
          <i class="fas fa-chevron-down text-[10px] transition-transform transform duration-300 details-arrow"></i>
        </summary>
        <div class="p-3 grid grid-cols-1 gap-2 border-t border-slate-700/60 bg-[#0a0d16]">`;

      grupos[subcat].forEach(item => {
        const checked  = magiasAprendidas[item.id] ? 'checked' : '';
        const colorDot = item.cor
          ? `<div class="w-2 h-2 rounded-full absolute top-2 right-2 shadow-sm" style="background-color:${item.cor};box-shadow:0 0 5px ${item.cor};"></div>`
          : '';
        html += `
          <label class="magic-checkbox-wrapper group relative" title="${item.desc}">
            ${colorDot}
            <input type="checkbox" class="magic-checkbox hidden" id="chk_${item.id}"
              onchange="toggleMagia('${item.id}', this.checked)" ${checked}>
            <div class="magic-box border-${m.corTag}-900 group-hover:border-${m.corTag}-500"></div>
            <div class="flex-1 mt-0.5">
              <span class="text-sm font-bold text-slate-200 group-hover:text-${m.corTag}-300 transition-colors block tracking-wide">${item.nome}</span>
              <span class="text-[10px] text-slate-400 leading-tight block mt-1 group-hover:text-slate-300">${item.desc}</span>
            </div>
          </label>`;
      });
      html += `</div></details>`;
      div.innerHTML += html;
    });
  });
  atualizarOpcoesCrafter();
}

function toggleMagia(id, checked) { magiasAprendidas[id] = checked; atualizarOpcoesCrafter(); autoSalvar(); }

// ─── SINTETIZADOR ─────────────────────────────────────────────
function atualizarOpcoesCrafter() {
  const selEss   = document.getElementById('craft-essencia');
  const selForma = document.getElementById('craft-forma');
  const selMod1  = document.getElementById('craft-mod1');
  const selMod2  = document.getElementById('craft-mod2');
  const selGat   = document.getElementById('craft-gatilho');

  const vEss = selEss.value, vFor = selForma.value, vM1 = selMod1.value, vM2 = selMod2.value, vGat = selGat.value;

  selEss.innerHTML   = '<option value="">Selecione...</option>';
  selForma.innerHTML = '<option value="">Selecione...</option>';
  selMod1.innerHTML  = '<option value="">Nenhum...</option>';
  selMod2.innerHTML  = '<option value="">Nenhum...</option>';
  selGat.innerHTML   = '<option value="">Ativação Manual...</option>';

  bdGrimorio.essencias.filter(i => magiasAprendidas[i.id]).forEach(i =>
    selEss.innerHTML += `<option value="${i.id}">${i.nome}</option>`);
  bdGrimorio.formas.filter(i => magiasAprendidas[i.id]).forEach(i =>
    selForma.innerHTML += `<option value="${i.id}">${i.nome}</option>`);
  bdGrimorio.modificadores.filter(i => magiasAprendidas[i.id]).forEach(i => {
    selMod1.innerHTML += `<option value="${i.id}">${i.nome}</option>`;
    selMod2.innerHTML += `<option value="${i.id}">${i.nome}</option>`;
  });
  bdGrimorio.gatilhos.filter(i => magiasAprendidas[i.id]).forEach(i =>
    selGat.innerHTML += `<option value="${i.id}">${i.nome}</option>`);

  if (selEss.querySelector(`option[value="${vEss}"]`))   selEss.value   = vEss;
  if (selForma.querySelector(`option[value="${vFor}"]`)) selForma.value = vFor;
  if (selMod1.querySelector(`option[value="${vM1}"]`))   selMod1.value  = vM1;
  if (selMod2.querySelector(`option[value="${vM2}"]`))   selMod2.value  = vM2;
  if (selGat.querySelector(`option[value="${vGat}"]`))   selGat.value   = vGat;

  gerarDescricaoMagia();
}

function getItemPorIdGlobal(id) {
  if (!id) return null;
  for (const cat of ['essencias', 'formas', 'modificadores', 'gatilhos']) {
    const found = bdGrimorio[cat].find(i => i.id === id);
    if (found) return found;
  }
  return null;
}

function animarSintese() {
  const box = document.getElementById('synthesizer-box');
  box.classList.remove('flash-magic');
  void box.offsetWidth;
  box.classList.add('flash-magic');
  gerarDescricaoMagia(true);
}

function gerarDescricaoMagia() {
  const idEss    = document.getElementById('craft-essencia').value;
  const idForma  = document.getElementById('craft-forma').value;
  const idMod1   = document.getElementById('craft-mod1').value;
  const idMod2   = document.getElementById('craft-mod2').value;
  const idGatilho= document.getElementById('craft-gatilho').value;

  const elNome   = document.getElementById('craft-nome');
  const elDesc   = document.getElementById('craft-desc');
  const svgCircle= document.getElementById('magic-circle-result');

  if (!idEss || !idForma) {
    elNome.innerText = "Aguardando componentes...";
    elNome.style.color = 'white';
    elDesc.innerText = "Combine Essência, Forma, Modificadores e Gatilhos para tecer a magia ou forjar um item.";
    svgCircle.style.color = "transparent";
    svgCircle.style.opacity = "0.1";
    return;
  }

  const ess     = getItemPorIdGlobal(idEss);
  const forma   = getItemPorIdGlobal(idForma);
  const mod1    = getItemPorIdGlobal(idMod1);
  const mod2    = getItemPorIdGlobal(idMod2);
  const gatilho = getItemPorIdGlobal(idGatilho);

  let titulo = `${forma.nome.split('/')[0]} de ${ess.nome.split('/')[0]}`;
  if (mod1 || mod2) titulo += " Aprimorado(a)";
  if (gatilho) titulo = `Relíquia: ${titulo}`;

  if (ess.cor) {
    svgCircle.style.color   = ess.cor;
    svgCircle.style.opacity = "0.8";
    svgCircle.style.filter  = `drop-shadow(0 0 10px ${ess.cor})`;
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
  if (gatilho) modsApt.push(`<span class="text-amber-400 font-bold">Gatilho (${gatilho.nome}):</span> <span class="text-amber-100">${gatilho.desc}</span>`);
  if (modsApt.length > 0) txt += `<br><div class="mt-2 pt-2 border-t border-slate-700/50">${modsApt.join('<br>')}</div>`;

  let rpText = `<div class="mt-4 p-4 border-l-2 bg-[#00000080] text-slate-300 italic rounded-r-lg text-sm shadow-inner" style="border-color: ${ess.cor || '#7c3aed'};">`;
  if (gatilho) {
    rpText += `"A magia adormece e despertará como um(a) <b class="text-cyan-300">${forma.nome.split('/')[0]}</b> de <b style="color:${ess.cor || '#a78bfa'};">${ess.nome.split('/')[0]}</b> quando ${gatilho.desc.toLowerCase().replace('.', '')}`;
  } else {
    rpText += `"Você canaliza <b style="color:${ess.cor || '#a78bfa'};">${ess.nome.split('/')[0]}</b> na geometria de um(a) <b class="text-cyan-300">${forma.nome.split('/')[0]}</b>. ${forma.desc.replace('.', '')}, carregando a propriedade de que ${ess.desc.toLowerCase().replace('.', '')}`;
  }
  if (mod1 || mod2) {
    rpText += ` Modificada por <span class="text-fuchsia-300">${mod1?.nome.split('/')[0] || ''}</span>${mod2 && idMod2 !== idMod1 ? ` e <span class="text-fuchsia-300">${mod2.nome.split('/')[0]}</span>` : ''}.`;
  }
  rpText += `."</div>`;

  elNome.innerText = titulo;
  elDesc.innerHTML = txt + rpText;
}

// ─── FORJA DE ITENS ───────────────────────────────────────────
function gerarCaminhoSVGUnico(seedStr) {
  let num = 0;
  for (let i = 0; i < seedStr.length; i++) num += seedStr.charCodeAt(i);
  const pontos = 3 + (num % 5);
  const r = 40, cx = 50, cy = 50;
  let path = '';
  for (let i = 0; i < pontos; i++) {
    const angle = (Math.PI * 2 * i) / pontos - (Math.PI / 2);
    path += (i === 0 ? `M${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)} ` : `L${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)} `);
  }
  path += 'Z';
  let inner = `<path d="${path}" stroke="currentColor" stroke-width="1.5" fill="none" transform="rotate(${num % 360} 50 50)"/>`;
  if (num % 2 === 0) inner += `<circle cx="50" cy="50" r="25" stroke="currentColor" stroke-width="1" fill="none" stroke-dasharray="2 4"/>`;
  else inner += `<path d="${path}" stroke="currentColor" stroke-width="0.5" fill="none" transform="rotate(${(num + 180) % 360} 50 50) scale(0.6) translate(30,30)"/>`;
  return `<svg viewBox="0 0 100 100" class="w-full h-full opacity-80 animate-spin-slow">
    <circle cx="50" cy="50" r="48" stroke="currentColor" stroke-width="1" fill="none"/>
    <circle cx="50" cy="50" r="43" stroke="currentColor" stroke-width="0.5" fill="none"/>
    ${inner}
  </svg>`;
}

function forjarItemMagico() {
  const idEss  = document.getElementById('craft-essencia').value;
  const idForma= document.getElementById('craft-forma').value;
  if (!idEss || !idForma) { mostrarModal("Falha na Forja", "Selecione ao menos uma Essência e uma Forma."); return; }

  const ess     = getItemPorIdGlobal(idEss);
  const forma   = getItemPorIdGlobal(idForma);
  const mod1    = getItemPorIdGlobal(document.getElementById('craft-mod1').value);
  const mod2    = getItemPorIdGlobal(document.getElementById('craft-mod2').value);
  const gatilho = getItemPorIdGlobal(document.getElementById('craft-gatilho').value);
  const custom  = document.getElementById('craft-custom-name').value.trim();
  let nome = custom || (gatilho ? `${gatilho.nome.split('/')[0]} de ${ess.nome.split('/')[0]}` : `Relíquia de ${ess.nome.split('/')[0]}`);

  itensMagicos.push({
    id: Date.now(), nome,
    desc: `[Ao ${gatilho ? gatilho.desc.toLowerCase().replace('.', '') : 'ativar'}] manifesta ${forma.desc.toLowerCase().replace('.', '')} com ${ess.desc.toLowerCase().replace('.', '')}`,
    essencia: ess, forma, mod1, mod2, gatilho,
    seed: idEss + idForma + (mod1 ? mod1.id : '') + (gatilho ? gatilho.id : ''),
    imagem: "",
  });
  document.getElementById('craft-custom-name').value = '';
  renderizarItensMagicos();
  autoSalvar();
  mostrarModal("Forja Concluída!", "Relíquia criada! Veja em 'Itens Mágicos'.");
  mudarAba('itens');
}

function renderizarItensMagicos() {
  const lista = document.getElementById('lista-itens-magicos');
  lista.innerHTML = '';
  if (itensMagicos.length === 0) {
    lista.innerHTML = `<div class="col-span-full text-center p-10 text-slate-500 italic">
      <i class="fas fa-hammer text-4xl mb-4 block opacity-30"></i>Nenhum item forjado. Use o Sintetizador no Grimório.</div>`;
    return;
  }
  itensMagicos.forEach((item, index) => {
    const cor = item.essencia.cor || '#7c3aed';
    let badges = `
      <span class="bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">${item.essencia.nome.split('/')[0]}</span>
      <span class="bg-cyan-900/40 text-cyan-300 border border-cyan-700/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">${item.forma.nome.split('/')[0]}</span>`;
    if (item.mod1) badges += `<span class="bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-700/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">${item.mod1.nome.split('/')[0]}</span>`;
    if (item.mod2 && item.mod1?.id !== item.mod2.id) badges += `<span class="bg-fuchsia-900/40 text-fuchsia-300 border border-fuchsia-700/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">${item.mod2.nome.split('/')[0]}</span>`;
    if (item.gatilho) badges += `<span class="bg-amber-900/40 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"><i class="fas fa-bolt mr-1"></i>${item.gatilho.nome.split('/')[0]}</span>`;

    lista.innerHTML += `
    <div class="bg-black/40 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl overflow-hidden group transition-all hover:border-slate-500 relative flex flex-col h-full" style="box-shadow: inset 0 0 20px ${cor}15;">
      <div class="p-5 flex gap-4 border-b border-slate-700/50 relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-40 h-40 opacity-10 pointer-events-none mix-blend-screen" style="color:${cor};">${gerarCaminhoSVGUnico(item.seed)}</div>
        <div class="w-16 h-16 flex-shrink-0 relative z-10 flex items-center justify-center group/img cursor-pointer transition-transform hover:scale-105" onclick="document.getElementById('upload-item-${index}').click()" style="color:${cor};filter:drop-shadow(0 0 5px ${cor});">
          ${item.imagem ? `<img src="${item.imagem}" class="w-[52px] h-[52px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full object-cover z-0 opacity-70 pointer-events-none">
            <div class="w-full h-full relative z-10 drop-shadow-[0_0_3px_rgba(0,0,0,1)] pointer-events-none">${gerarCaminhoSVGUnico(item.seed + item.id)}</div>
            <div class="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity z-30 pointer-events-none"><i class="fas fa-camera text-white text-xs"></i></div>` :
            `${gerarCaminhoSVGUnico(item.seed + item.id)}
            <div class="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity z-30 pointer-events-none"><i class="fas fa-camera text-white text-xs"></i></div>`}
          <input type="file" id="upload-item-${index}" class="hidden" accept="image/*" onchange="carregarImagemItem(event,${index})">
        </div>
        <div class="flex-1 relative z-10 pl-2 pr-10">
          <input type="text" class="w-full bg-transparent font-bold text-white text-xl font-cinzel border-none outline-none focus:ring-0 p-0 mb-1 transition-colors focus:text-amber-400 placeholder-slate-500" value="${item.nome}" placeholder="Nome da Relíquia..." onchange="atualizarItemMagico(${index},'nome',this.value)">
          <div class="flex flex-wrap gap-1 mt-2">${badges}</div>
        </div>
      </div>
      <div class="p-4 flex-1 flex flex-col bg-slate-900/30">
        <textarea class="w-full bg-transparent text-slate-300 text-sm border-none outline-none focus:ring-0 p-0 resize-y min-h-[80px] transition-colors focus:text-white placeholder-slate-600" placeholder="História ou lore do item..." onchange="atualizarItemMagico(${index},'desc',this.value)">${item.desc}</textarea>
      </div>
      <button type="button" onclick="removerItemMagico(${index})" class="absolute top-4 right-4 text-slate-400 hover:text-white opacity-80 md:opacity-0 group-hover:opacity-100 transition-all z-[100] bg-black/90 hover:bg-red-600 border border-slate-600 hover:border-red-400 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer shadow-lg">
        <i class="fas fa-trash text-sm"></i>
      </button>
    </div>`;
  });
}

function removerItemMagico(i) { pedirConfirmacao("Quebrar Relíquia", "Deseja realmente quebrar este item?", "Quebrar", () => { itensMagicos.splice(i, 1); renderizarItensMagicos(); autoSalvar(); }); }
function atualizarItemMagico(i, c, v) { itensMagicos[i][c] = v; autoSalvar(); }

function carregarImagemItem(event, index) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 250;
      let w = img.width, h = img.height;
      if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } } else { if (h > MAX) { w *= MAX / h; h = MAX; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      itensMagicos[index].imagem = canvas.toDataURL('image/jpeg', 0.85);
      renderizarItensMagicos();
      autoSalvar();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ─── MAGIAS INÚTEIS ───────────────────────────────────────────
function renderizarMagiasInuteis() {
  const lista = document.getElementById('lista-magias-inuteis');
  lista.innerHTML = '';
  magiasInuteis.forEach((mag, index) => {
    lista.innerHTML += `
    <div class="bg-[#131826] p-4 rounded-xl border border-slate-700/60 relative group transition-all hover:border-slate-500 shadow-md">
      <button onclick="removerMagiaInutil(${index})" class="absolute top-3 right-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><i class="fas fa-times"></i></button>
      <input type="text" class="w-11/12 bg-transparent font-bold text-slate-100 text-lg font-cinzel border-none outline-none focus:ring-0 p-0 mb-2 transition-colors focus:text-cursed placeholder-slate-600" value="${mag.nome}" placeholder="Nome do Feitiço..." onchange="atualizarMagiaInutil(${index},'nome',this.value)">
      <textarea class="w-full bg-transparent text-slate-400 text-xs border-none outline-none focus:ring-0 p-0 mt-1 resize-y h-16 transition-colors focus:text-slate-200 placeholder-slate-600" placeholder="O que esse truque faz?" onchange="atualizarMagiaInutil(${index},'desc',this.value)">${mag.desc}</textarea>
    </div>`;
  });
}
function adicionarMagiaInutil() { magiasInuteis.push({ nome: "Nova Tranqueira", desc: "" }); renderizarMagiasInuteis(); autoSalvar(); }
function removerMagiaInutil(i) { magiasInuteis.splice(i, 1); renderizarMagiasInuteis(); autoSalvar(); }
function atualizarMagiaInutil(i, c, v) { magiasInuteis[i][c] = v; autoSalvar(); }

// ─── PERÍCIAS ─────────────────────────────────────────────────
function inicializarPericias() {
  console.log("periciasBase:", periciasBase);

  periciasBase.forEach(p => {
    container.innerHTML += `
    <div class="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700 transition-colors shadow-sm hover:border-slate-500">
      <div class="flex items-center gap-1 w-5/12">
        <span class="text-sm font-semibold text-slate-200 truncate cursor-default" title="${p.nome}">${p.nome}</span>
        <select id="attr-per-${p.id}" class="bg-slate-900/80 border border-slate-600 rounded text-xs font-bold text-slate-400 uppercase outline-none cursor-pointer p-1 ml-1 hover:border-cyan-400 hover:text-cyan-400 transition-colors" onchange="calcularDerivados()">
          ${['for','des','con','int','sab','pre'].map(a => `<option value="${a}"${p.attr===a?' selected':''}>${a.toUpperCase()}</option>`).join('')}
        </select>
      </div>
      <div class="flex items-center gap-2 w-7/12 justify-end">
        <select id="grau-${p.id}" class="input-field bg-slate-900 border-slate-600 p-1.5 text-xs w-[85px] font-bold transition-colors" onchange="calcularDerivados()">
          <option value="0">Destre.</option><option value="1">Treinado</option><option value="2">Especia.</option><option value="3">Maestria</option>
        </select>
        <input type="number" id="per-${p.id}" class="input-field bg-slate-900 border-slate-600 w-10 p-1.5 text-center text-xs font-bold transition-colors" value="0" onchange="calcularDerivados()">
        <span class="text-cyan-400 font-bold w-8 text-right text-base transition-colors" id="tot-${p.id}">+0</span>
      </div>
    </div>`;
  });
}

// ─── CÁLCULOS ─────────────────────────────────────────────────
function mudarClasse() {
  const val = document.getElementById('classe-select').value;
  if (classesRPG[val] && val !== 'personalizado') {
    document.getElementById('pv-base').value  = classesRPG[val].pvBase;
    document.getElementById('pv-nivel').value = classesRPG[val].pvNivel;
    document.getElementById('pe-base').value  = classesRPG[val].peBase;
    document.getElementById('pe-nivel').value = classesRPG[val].peNivel;
  }
  calcularDerivados();
}

function calcularDerivados() {
  const nivel  = parseInt(document.getElementById('nivel').value) || 1;
  const getMod = score => Math.floor((score - 10) / 2);
  const base   = {
    for: getMod(parseInt(document.getElementById('attr-for').value) || 10),
    des: getMod(parseInt(document.getElementById('attr-des').value) || 10),
    con: getMod(parseInt(document.getElementById('attr-con').value) || 10),
    int: getMod(parseInt(document.getElementById('attr-int').value) || 10),
    sab: getMod(parseInt(document.getElementById('attr-sab').value) || 10),
    pre: getMod(parseInt(document.getElementById('attr-pre').value) || 10),
  };

  let penGlobal = 0, penAttr = { for:0,des:0,con:0,int:0,sab:0,pre:0 }, penDef = 0, multDesloc = 1, bonusDeslCorr = 0;

  condicoes.forEach(c => {
    const n = c.nome;
    if (['Abalado','Alucinado','Doente'].includes(n)) penGlobal += 2;
    if (n === 'Apavorado') penGlobal += 5;
    if (['Debilitado','Exausto'].includes(n)) { penAttr.for+=5; penAttr.des+=5; penAttr.con+=5; }
    if (n === 'Fraco') { penAttr.for+=2; penAttr.des+=2; penAttr.con+=2; }
    if (n === 'Frustrado') { penAttr.int+=2; penAttr.sab+=2; penAttr.pre+=2; }
    if (n === 'Doente') Object.keys(penAttr).forEach(k => penAttr[k] += 2);
    if (['Exausto','Lento','Cego','Enredado'].includes(n)) multDesloc *= 0.5;
    if (['Agarrado','Paralisado','Preso','Inconsciente','Morrendo','Petrificado','Esmagado'].includes(n)) multDesloc = 0;
    if (['Desprevenido','Atordoado'].includes(n)) penDef += 5;
    if (n === 'Vulnerável') penDef += 2;
    if (['Indefeso','Inconsciente','Paralisado','Preso'].includes(n)) penDef += 10;
  });

  if (configTema.preset === 'vinteum') {
    penGlobal *= -2; penDef *= -2;
    Object.keys(penAttr).forEach(k => penAttr[k] *= -2);
    if (multDesloc < 1) multDesloc = 2;
  }

  ['for','des','con','int','sab','pre'].forEach(a =>
    document.getElementById(`mod-${a}`).innerText = base[a] >= 0 ? '+' + base[a] : String(base[a]));

  const bMaestria = Math.ceil(nivel / 4) + 1;
  document.getElementById('txt-bonus-nivel').innerText = '+' + bMaestria;

  // Vazio (Vinteum)
  let bVazioDano=0, bVazioAcerto=0, bVazioCD=0, bVazioRD=0, bVazioCA=0, bVazioTR=0, bVazioDado=0, bVazioNivel=0;
  if (configTema.preset === 'vinteum') {
    bVazioDano  = vazioAtual;
    bVazioDado  = Math.floor(vazioAtual / 5);
    bVazioNivel = Math.floor(vazioAtual / 6);
    if (vazioAtual > 0) {
      const tab = [{a:0,r:0,t:0},{a:1,r:1,t:1},{a:2,r:1,t:1},{a:2,r:2,t:1},{a:3,r:2,t:2},{a:3,r:2,t:2},{a:4,r:2,t:2}];
      const ref = Math.min(vazioAtual, 6);
      bVazioAcerto = tab[ref].a; bVazioCD = tab[ref].a; bVazioRD = tab[ref].r; bVazioCA = tab[ref].r; bVazioTR = tab[ref].t;
      if (vazioAtual > 6) { const ex = vazioAtual - 6; bVazioAcerto+=Math.floor(ex/2); bVazioCD+=Math.floor(ex/2); bVazioRD+=Math.floor(ex/3); bVazioCA+=Math.floor(ex/3); bVazioTR+=Math.floor(ex/4); }
    }
  }

  let buffsTexto = "Nenhum efeito ativo.", buffsDano = "";
  if (configTema.preset === 'vinteum' && vazioAtual > 0) {
    buffsTexto = `+${bVazioAcerto} Acerto e CD | +${bVazioCA} CA | +${bVazioRD} RD | +${bVazioTR} em TODOS os Testes`;
    buffsDano  = `+${bVazioDano} Dano Fixo`;
    if (bVazioDado  > 0) buffsDano += ` | +${bVazioDado}d de Dano`;
    if (bVazioNivel > 0) buffsDano += ` | +${bVazioNivel} Nível(is) de Dano`;
  }
  document.getElementById('vazio-buffs-texto').innerText = buffsTexto;
  document.getElementById('vazio-buffs-dano').innerText  = buffsDano;

  let percTotal = 0;
  periciasBase.forEach(p => {
    const grau  = parseInt(document.getElementById(`grau-${p.id}`)?.value) || 0;
    const extra = parseInt(document.getElementById(`per-${p.id}`)?.value)  || 0;
    const attr  = document.getElementById(`attr-per-${p.id}`)?.value || p.attr;
    const total = (base[attr] - (penAttr[attr] || 0)) + grau * bMaestria + extra - penGlobal;
    if (p.id === 'percepcao') percTotal = total;
    const el = document.getElementById(`tot-${p.id}`);
    if (el) {
      el.innerText = total >= 0 ? '+' + total : String(total);
      el.className = `font-bold w-8 text-right text-base transition-colors ${penGlobal > 0 || penAttr[attr] > 0 ? 'text-red-400' : penGlobal < 0 || penAttr[attr] < 0 ? 'text-emerald-400' : 'text-cyan-400'}`;
    }
  });

  const caTotal = 10 + base.des + (parseInt(document.getElementById('ca-bonus').value) || 0) - penDef + bVazioCA;
  const elCA = document.getElementById('valor-ca');
  elCA.innerText = caTotal;
  elCA.className = `text-4xl font-bold transition-colors ${penDef > 0 ? 'text-red-400' : penDef < 0 ? 'text-cyan-400' : 'text-white'}`;
  document.getElementById('percepcao-passiva').innerText = 10 + percTotal;
  document.getElementById('valor-cd').innerText = 10 + bMaestria + base[document.getElementById('attr-cd').value] + bVazioCD;

  const rdBase  = parseInt(document.getElementById('rd-geral-base').value) || 0;
  const rdTotal = rdBase + bVazioRD;
  const elRd = document.getElementById('rd-total-display');
  elRd.innerText = `= ${rdTotal}`;
  elRd.classList.toggle('hidden', bVazioRD === 0);

  // Corrosão
  if (configTema.preset === 'vinteum' && configTema.modoBatalha) {
    bonusDeslCorr = 6;
    document.getElementById('corr-atk').innerText = '+' + Math.floor(bMaestria / 2);
    document.getElementById('corr-dmg').innerText = '+' + bMaestria;
    document.getElementById('corr-dc').innerText  = 15 + bMaestria + corrosaoAtual + Math.floor(nivel / 2);
    const maxCorr = Math.max(0, Math.floor(base.int / 2));
    document.getElementById('corr-max').innerText = maxCorr;
    const elCA2 = document.getElementById('corr-atual');
    elCA2.innerText = corrosaoAtual;
    elCA2.className = `text-4xl font-bold transition-colors ${corrosaoAtual >= maxCorr && maxCorr > 0 ? 'text-red-500 animate-pulse' : 'text-white'}`;
  }

  // Deslocamento
  const deslocBase  = parseInt(document.getElementById('deslocamento').value) || 9;
  const deslocFinal = Math.floor(deslocBase * multDesloc);
  const totalBadge  = document.getElementById('deslocamento-total');
  const alertaDesloc= document.getElementById('alerta-deslocamento');
  const inputDesloc = document.getElementById('deslocamento');
  if (bonusDeslCorr > 0 || multDesloc !== 1) {
    totalBadge.classList.remove('hidden');
    totalBadge.innerText = (deslocFinal + bonusDeslCorr) + "m";
  } else { totalBadge.classList.add('hidden'); }
  inputDesloc.classList.remove('text-red-500','text-cyan-400');
  alertaDesloc.classList.remove('hidden');
  if      (multDesloc === 0)   { inputDesloc.classList.add('text-red-500'); alertaDesloc.classList.add('text-red-400'); alertaDesloc.innerText = "Imóvel (0m)"; }
  else if (multDesloc < 1)     { inputDesloc.classList.add('text-red-500'); alertaDesloc.classList.add('text-red-400'); alertaDesloc.innerText = "Metade (Penalizado)"; }
  else if (multDesloc > 1)     { inputDesloc.classList.add('text-cyan-400'); alertaDesloc.classList.add('text-emerald-400'); alertaDesloc.innerText = "Acelerado (x2)"; }
  else                         { alertaDesloc.classList.add('hidden'); }

  // PV / PE
  const pvMax = (parseInt(document.getElementById('pv-base').value)||0) + base.con +
    (((parseInt(document.getElementById('pv-nivel').value)||0) + base.con) * (nivel > 1 ? nivel - 1 : 0)) +
    (parseInt(document.getElementById('pv-adicional').value)||0);
  let peMax = (parseInt(document.getElementById('pe-base').value)||0) + base.pre +
    (((parseInt(document.getElementById('pe-nivel').value)||0) + base.pre) * (nivel > 1 ? nivel - 1 : 0)) +
    (parseInt(document.getElementById('pe-adicional').value)||0);
  if (modoSerioAtivo) peMax = Math.floor(peMax * 3);

  document.getElementById('pv-max').value = pvMax;
  document.getElementById('pe-max').value = peMax;

  const pvAtual = parseInt(document.getElementById('pv-atual').value) || 0;
  const peAtual = parseInt(document.getElementById('pe-atual').value) || 0;
  document.getElementById('bar-pv').style.width = (pvMax > 0 ? Math.min(100, Math.max(0, (pvAtual / pvMax) * 100)) : 0) + '%';
  document.getElementById('bar-pe').style.width = (peMax > 0 ? Math.min(100, Math.max(0, (peAtual / peMax) * 100)) : 0) + '%';
}

// ─── HELPERS MENORES ──────────────────────────────────────────
function curarTotal(tipo) {
  document.getElementById(`${tipo}-atual`).value = document.getElementById(`${tipo}-max`).value;
  calcularDerivados();
}
function alterarExaustao(v) {
  exaustaoAtual = Math.min(6, Math.max(0, exaustaoAtual + v));
  const el = document.getElementById('valor-exaustao');
  if (exaustaoAtual >= 6) { el.innerText="6 (MORTO)"; el.classList.add('text-red-500','animate-pulse'); el.classList.remove('text-white'); el.style.width="auto"; el.style.fontSize="1rem"; }
  else { el.innerText=exaustaoAtual; el.classList.remove('text-red-500','animate-pulse'); el.classList.add('text-white'); el.style.width="2rem"; el.style.fontSize="1.5rem"; }
  autoSalvar();
}
function alterarVazio(v)  { vazioAtual = Math.max(0, vazioAtual + v); document.getElementById('vazio-atual').innerText = vazioAtual; calcularDerivados(); autoSalvar(); }
function alterarFim(v)    { fimAtual = Math.min(12, Math.max(0, fimAtual + v)); document.getElementById('fim-atual').innerText = fimAtual; document.getElementById('bar-fim').style.width = (fimAtual/12*100)+'%'; autoSalvar(); }
function alterarCorrosao(v){ corrosaoAtual = Math.max(0, corrosaoAtual + v); calcularDerivados(); autoSalvar(); }
function purgaRapida()    { const pe = parseInt(document.getElementById('pe-atual').value)||0; if(pe>=5){document.getElementById('pe-atual').value=pe-5;alterarCorrosao(-2);mostrarModal("Purga de Sistema","Você gastou 5 PE! (Corrosão -2)");}else mostrarModal("PE Insuficiente","Você precisa de pelo menos 5 PE."); }
function toggleModoSerio() {
  modoSerioAtivo = !modoSerioAtivo;
  const btn  = document.getElementById('btn-modo-serio');
  const selo = document.getElementById('selo-modo-serio');
  if (modoSerioAtivo) { btn.classList.add('modo-serio-on'); selo.classList.remove('hidden'); document.body.classList.add('modo-serio-ativo'); iniciarAuraAzul(); alterarExaustao(1); }
  else               { btn.classList.remove('modo-serio-on'); selo.classList.add('hidden'); document.body.classList.remove('modo-serio-ativo'); pararAuraAzul(); }
  calcularDerivados(); autoSalvar();
}
function iniciarAuraAzul() {
  if (auraAzulInterval) return;
  const c = document.getElementById('aura-azul-container'); c.innerHTML = '';
  for (let i=0;i<20;i++) criarParticulaAzul(c);
  auraAzulInterval = setInterval(()=>criarParticulaAzul(c), 150);
}
function pararAuraAzul() { clearInterval(auraAzulInterval); auraAzulInterval=null; document.getElementById('aura-azul-container').innerHTML=''; }
function criarParticulaAzul(c) { const p=document.createElement('div'); p.classList.add('particula-azul'); p.style.left=Math.random()*100+'vw'; const s=Math.random()*6+2; p.style.width=s+'px'; p.style.height=s+'px'; p.style.animationDuration=(Math.random()*4+3)+'s'; c.appendChild(p); setTimeout(()=>{if(c.contains(p))p.remove();},7000); }
function iniciarPetalas() { if(petalInterval)return; const c=document.getElementById('petal-container');c.innerHTML=''; for(let i=0;i<15;i++)criarPetala(c); petalInterval=setInterval(()=>criarPetala(c),300); }
function pararPetalas()   { clearInterval(petalInterval);petalInterval=null;document.getElementById('petal-container').innerHTML=''; }
function criarPetala(c)   { const p=document.createElement('div');p.classList.add('petal');p.style.left=Math.random()*100+'vw';p.style.animationDuration=(Math.random()*3+4)+'s';c.appendChild(p);setTimeout(()=>{if(c.contains(p))p.remove();},7000); }

// ─── AVATAR ───────────────────────────────────────────────────
function carregarAvatar(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX=300; let w=img.width,h=img.height;
      if(w>h){if(w>MAX){h*=MAX/w;w=MAX;}}else{if(h>MAX){w*=MAX/h;h=MAX;}}
      canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);
      avatarImgData=canvas.toDataURL('image/jpeg',0.85);
      document.getElementById('avatar-img').src=avatarImgData;
      document.getElementById('avatar-img').classList.remove('hidden');
      document.getElementById('avatar-placeholder').classList.add('hidden');
      document.getElementById('btn-remove-avatar').classList.remove('hidden');
      autoSalvar();
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}
function removerAvatar(event) {
  event.stopPropagation();
  avatarImgData="";
  document.getElementById('avatar-img').src='';
  document.getElementById('avatar-img').classList.add('hidden');
  document.getElementById('avatar-placeholder').classList.remove('hidden');
  document.getElementById('btn-remove-avatar').classList.add('hidden');
  document.getElementById('avatar-upload').value='';
  autoSalvar();
}

// ─── RENDERIZADORES ───────────────────────────────────────────
function renderizarTreinamentos() {
  const lista = document.getElementById('lista-treinamentos');
  lista.innerHTML = '';
  let opts = listaTreinamentosPadrao.map(t => `<option value="${t}">${t}</option>`).join('');
  treinamentos.forEach((t, i) => {
    lista.innerHTML += `
    <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 relative group transition-colors">
      <button onclick="removerTreinamento(${i})" class="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><i class="fas fa-times"></i></button>
      <div class="flex items-center gap-2 mb-2 w-11/12">
        <select class="w-full bg-transparent font-bold text-green-300 text-sm border-b border-transparent focus:border-green-500 outline-none focus:ring-0 p-1 transition-colors appearance-none cursor-pointer" onchange="atualizarTreinamento(${i},'tipo',this.value)"><option value="${t.tipo}" selected hidden>${t.tipo}</option>${opts}</select>
        <div class="flex items-center bg-slate-900 rounded border border-slate-600 px-2 py-1 gap-1"><span class="text-[10px] font-bold text-slate-400 uppercase">Nvl:</span><input type="number" class="bg-transparent text-center text-white font-bold w-8 text-sm outline-none" value="${t.nivel||1}" min="1" onchange="atualizarTreinamento(${i},'nivel',this.value)"></div>
      </div>
      <input type="text" class="w-full bg-transparent font-bold text-green-100 text-sm border-b border-green-900/50 outline-none focus:border-green-500 focus:ring-0 p-1 mb-2 transition-colors ${t.tipo==='Personalizado'?'':'hidden'}" value="${t.nomeCustom||''}" placeholder="Nome do Treinamento" onchange="atualizarTreinamento(${i},'nomeCustom',this.value)">
      <textarea class="w-full bg-transparent text-slate-300 text-sm border-none outline-none focus:ring-0 p-1 resize-y h-16 transition-colors focus:text-white placeholder-slate-600" placeholder="Regras e efeitos..." onchange="atualizarTreinamento(${i},'desc',this.value)">${t.desc||''}</textarea>
      <div class="text-[10px] text-green-400 font-bold mt-1 text-right">Maestria: Nível ${t.nivel||1}</div>
    </div>`;
  });
}
function adicionarTreinamento() { treinamentos.push({tipo:"Combate Corpo-a-Corpo",nivel:1,nomeCustom:"",desc:""}); renderizarTreinamentos(); autoSalvar(); }
function removerTreinamento(i)  { treinamentos.splice(i,1); renderizarTreinamentos(); autoSalvar(); }
function atualizarTreinamento(i,c,v) { treinamentos[i][c]=v; renderizarTreinamentos(); autoSalvar(); }

function renderizarVotos() {
  const lista = document.getElementById('lista-votos');
  lista.innerHTML = '';
  votos.forEach((v, i) => {
    lista.innerHTML += `
    <div class="bg-slate-800 p-3 rounded-lg border border-pink-900/50 relative group transition-colors">
      <button onclick="removerVoto(${i})" class="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><i class="fas fa-times"></i></button>
      <input type="text" class="w-11/12 bg-transparent font-bold text-pink-300 text-lg border-none outline-none focus:ring-0 p-0 mb-2 transition-colors" value="${v.nome}" placeholder="Nome do Voto" onchange="atualizarVoto(${i},'nome',this.value)">
      <div class="grid grid-cols-2 gap-3 mt-1">
        <div><label class="text-xs text-emerald-400 font-bold"><i class="fas fa-plus-circle"></i> Positivo</label><textarea class="input-field bg-slate-900 text-sm p-2 h-16 resize-y mt-1 border-emerald-900/50" placeholder="O que você ganha..." onchange="atualizarVoto(${i},'positivo',this.value)">${v.positivo}</textarea></div>
        <div><label class="text-xs text-red-400 font-bold"><i class="fas fa-minus-circle"></i> Negativo</label><textarea class="input-field bg-slate-900 text-sm p-2 h-16 resize-y mt-1 border-red-900/50" placeholder="O que você sacrifica..." onchange="atualizarVoto(${i},'negativo',this.value)">${v.negativo}</textarea></div>
      </div>
    </div>`;
  });
}
function adicionarVoto()     { votos.push({nome:"Novo Voto",positivo:"",negativo:""}); renderizarVotos(); autoSalvar(); }
function removerVoto(i)      { votos.splice(i,1); renderizarVotos(); autoSalvar(); }
function atualizarVoto(i,c,v){ votos[i][c]=v; autoSalvar(); }

function renderizarCondicoes() {
  const lista = document.getElementById('lista-condicoes');
  lista.innerHTML = '';
  const opts = Object.keys(ditCondicoes).map(k => `<option value="${k}">${k}</option>`).join('');
  condicoes.forEach((c, i) => {
    lista.innerHTML += `
    <div class="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700 transition-colors">
      <select class="input-field bg-transparent border-none p-1 text-sm font-semibold text-orange-300 w-1/3" onchange="atualizarCondicao(${i},'nome',this.value)"><option value="${c.nome}" selected hidden>${c.nome||"Selecione..."}</option>${opts}</select>
      <input type="text" class="input-field bg-slate-900 p-1.5 text-xs w-full" placeholder="Efeito" value="${c.efeito||''}" onchange="atualizarCondicao(${i},'efeito',this.value)">
      <button onclick="removerCondicao(${i})" class="text-slate-500 hover:text-red-400 transition px-2"><i class="fas fa-times"></i></button>
    </div>`;
  });
  calcularDerivados();
}
function adicionarCondicao()   { condicoes.push({nome:"",efeito:""}); renderizarCondicoes(); autoSalvar(); }
function removerCondicao(i)    { condicoes.splice(i,1); renderizarCondicoes(); autoSalvar(); }
function atualizarCondicao(i,c,v) { condicoes[i][c]=v; if(c==='nome'&&ditCondicoes[v]) condicoes[i].efeito=ditCondicoes[v]; renderizarCondicoes(); autoSalvar(); }

function renderizarDefesas() {
  const lista = document.getElementById('lista-defesas');
  lista.innerHTML = '';
  defesas.forEach((d, i) => {
    lista.innerHTML += `
    <div class="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700 transition-colors">
      <select class="input-field bg-transparent border-none p-1 text-sm text-teal-300 font-bold w-1/3" onchange="atualizarDefesa(${i},'tipo',this.value)">
        ${['Resistência','Vulnerabilidade','Imunidade'].map(t=>`<option value="${t}"${d.tipo===t?' selected':''}>${t}</option>`).join('')}
      </select>
      <input type="text" class="input-field bg-slate-900 p-1.5 text-xs w-full" placeholder="Ex: Fogo, Veneno" value="${d.alvo}" onchange="atualizarDefesa(${i},'alvo',this.value)">
      <button onclick="removerDefesa(${i})" class="text-slate-500 hover:text-red-400 transition px-2"><i class="fas fa-times"></i></button>
    </div>`;
  });
}
function adicionarDefesa()    { defesas.push({tipo:"Resistência",alvo:""}); renderizarDefesas(); autoSalvar(); }
function removerDefesa(i)     { defesas.splice(i,1); renderizarDefesas(); autoSalvar(); }
function atualizarDefesa(i,c,v){ defesas[i][c]=v; autoSalvar(); }

function renderizarHabs() {
  ['origem','espec','talento'].forEach(tipo => {
    const lista = document.getElementById(`lista-hab-${tipo}`);
    lista.innerHTML = '';
    habilidades[tipo].forEach((h, i) => {
      lista.innerHTML += `
      <div class="bg-[#0a0812] rounded-md border border-[#1f1b38] relative group transition-colors overflow-hidden mb-3 shadow-sm">
        <div class="bg-black/60 px-3 py-1 border-b border-[#1f1b38] flex justify-between items-center">
          <input type="text" class="w-10/12 bg-transparent font-bold text-white text-sm border-none outline-none focus:ring-0 p-0 transition-colors focus:text-cyan-400 placeholder-slate-500" value="${h.nome}" placeholder="Nome..." onchange="atualizarHab('${tipo}',${i},'nome',this.value)">
          <button onclick="removerHab('${tipo}',${i})" class="text-slate-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-2">
          <textarea class="w-full bg-transparent text-gray-300 text-sm border-none outline-none focus:ring-0 p-0 resize-y h-16 transition-colors focus:text-white placeholder-slate-600 mt-1" placeholder="Regras e efeitos..." onchange="atualizarHab('${tipo}',${i},'desc',this.value)">${h.desc}</textarea>
        </div>
      </div>`;
    });
  });
}
function adicionarHab(t)     { habilidades[t].push({nome:"Nova Habilidade",desc:""}); renderizarHabs(); autoSalvar(); }
function removerHab(t,i)     { habilidades[t].splice(i,1); renderizarHabs(); autoSalvar(); }
function atualizarHab(t,i,c,v){ habilidades[t][i][c]=v; autoSalvar(); }

function renderizarInventario() {
  const lista = document.getElementById('lista-inventario');
  lista.innerHTML = '';
  let pt = 0;
  inventario.forEach((item, i) => {
    pt += item.qtd * item.peso;
    lista.innerHTML += `
    <div class="grid grid-cols-12 gap-2 items-start bg-slate-800 p-2 rounded-lg border border-slate-700 transition-colors">
      <div class="col-span-7 flex flex-col gap-2">
        <input type="text" class="input-field bg-transparent border-none p-1 text-sm font-bold transition-colors" value="${item.nome}" placeholder="Nome do Item" onchange="atualizarItem(${i},'nome',this.value)">
        <textarea class="input-field bg-slate-900 text-xs p-2 h-12 resize-y w-full transition-colors" placeholder="Descrição..." onchange="atualizarItem(${i},'desc',this.value)">${item.desc||''}</textarea>
      </div>
      <div class="col-span-2 pt-1"><input type="number" class="input-field bg-slate-900 p-1.5 text-center text-sm" value="${item.qtd}" min="0" onchange="atualizarItem(${i},'qtd',this.value)"></div>
      <div class="col-span-2 pt-1"><input type="number" class="input-field bg-slate-900 p-1.5 text-center text-sm" value="${item.peso}" min="0" step="0.1" onchange="atualizarItem(${i},'peso',this.value)"></div>
      <div class="col-span-1 pt-2 text-center"><button onclick="removerItem(${i})" class="text-slate-500 hover:text-red-400"><i class="fas fa-trash text-sm"></i></button></div>
    </div>`;
  });
  document.getElementById('peso-total').innerText = pt.toFixed(1);
}
function adicionarItem()  { inventario.push({id:Date.now(),nome:"Novo Item",desc:"",qtd:1,peso:1}); renderizarInventario(); autoSalvar(); }
function removerItem(i)   { inventario.splice(i,1); renderizarInventario(); autoSalvar(); }
function atualizarItem(i,c,v){ if(c==='qtd'||c==='peso')v=parseFloat(v)||0; inventario[i][c]=v; renderizarInventario(); autoSalvar(); }

function renderizarAtaques() {
  const lista = document.getElementById('lista-ataques');
  lista.innerHTML = '';
  const acoesOpts = ['Padrão','Movimento','Bônus','Reação','Livre','Simples','Complexa'];
  ataques.forEach((atk, i) => {
    lista.innerHTML += `
    <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 relative group transition-colors">
      <button onclick="removerAtaque(${i})" class="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><i class="fas fa-times"></i></button>
      <input type="text" class="w-11/12 bg-transparent font-bold text-red-300 text-lg border-none outline-none focus:ring-0 p-0 mb-2" value="${atk.nome}" placeholder="Arma / Ataque" onchange="atualizarAtaque(${i},'nome',this.value)">
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-3"><label class="text-[10px] text-slate-400 uppercase font-bold">Ação</label><select class="input-field bg-slate-900 text-[11px] p-1.5 mt-1" onchange="atualizarAtaque(${i},'acao',this.value)">${acoesOpts.map(a=>`<option value="${a}"${atk.acao===a?' selected':''}>${a}</option>`).join('')}</select></div>
        <div class="col-span-2"><label class="text-[10px] text-slate-400 uppercase font-bold">Teste</label><input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1" value="${atk.teste}" onchange="atualizarAtaque(${i},'teste',this.value)"></div>
        <div class="col-span-3"><label class="text-[10px] text-slate-400 uppercase font-bold">Dano</label><input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1" value="${atk.dano}" onchange="atualizarAtaque(${i},'dano',this.value)"></div>
        <div class="col-span-2"><label class="text-[10px] text-slate-400 uppercase font-bold">Crítico</label><input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1 text-center" value="${atk.critico}" onchange="atualizarAtaque(${i},'critico',this.value)"></div>
        <div class="col-span-2"><label class="text-[10px] text-slate-400 uppercase font-bold">Alcance</label><input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1" value="${atk.alcance}" onchange="atualizarAtaque(${i},'alcance',this.value)"></div>
        <div class="col-span-12"><textarea class="input-field bg-slate-900 text-xs p-2 mt-1 h-16 resize-y w-full" placeholder="Especial / Observações..." onchange="atualizarAtaque(${i},'especial',this.value)">${atk.especial||''}</textarea></div>
      </div>
    </div>`;
  });
}
function adicionarAtaque()    { ataques.push({id:Date.now(),nome:"Novo Ataque",acao:"Padrão",teste:"",dano:"",critico:"",alcance:"",especial:""}); renderizarAtaques(); autoSalvar(); }
function removerAtaque(i)     { ataques.splice(i,1); renderizarAtaques(); autoSalvar(); }
function atualizarAtaque(i,c,v){ ataques[i][c]=v; autoSalvar(); }

function renderizarTecnicas() {
  const lista = document.getElementById('lista-tecnicas');
  lista.innerHTML = '';
  const acoesOpts = ['Padrão','Movimento','Bônus','Reação','Livre','Simples','Complexa'];
  tecnicas.forEach((t, i) => {
    lista.innerHTML += `
    <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 relative group transition-colors">
      <button onclick="removerTecnica(${i})" class="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"><i class="fas fa-times"></i></button>
      <input type="text" class="w-11/12 bg-transparent font-bold text-purple-300 text-lg border-none outline-none focus:ring-0 p-0 mb-2" value="${t.nome}" placeholder="Nome da Técnica" onchange="atualizarTecnica(${i},'nome',this.value)">
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-3"><label class="text-[10px] text-slate-400 uppercase font-bold">Ação</label><select class="input-field bg-slate-900 text-[11px] p-1.5 mt-1" onchange="atualizarTecnica(${i},'acao',this.value)">${acoesOpts.map(a=>`<option value="${a}"${t.acao===a?' selected':''}>${a}</option>`).join('')}</select></div>
        <div class="col-span-2"><label class="text-[10px] text-slate-400 uppercase font-bold">Custo</label><input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1 text-center" value="${t.custo}" onchange="atualizarTecnica(${i},'custo',this.value)"></div>
        <div class="col-span-3"><label class="text-[10px] text-slate-400 uppercase font-bold">Teste</label><input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1" value="${t.teste||''}" onchange="atualizarTecnica(${i},'teste',this.value)"></div>
        <div class="col-span-4"><label class="text-[10px] text-slate-400 uppercase font-bold">Dano/Cura</label><input type="text" class="input-field bg-slate-900 text-xs p-1.5 mt-1" value="${t.dano}" onchange="atualizarTecnica(${i},'dano',this.value)"></div>
        <div class="col-span-12"><textarea class="input-field bg-slate-900 text-sm p-2 mt-1 h-24 resize-y w-full" placeholder="Descrição e efeitos..." onchange="atualizarTecnica(${i},'efeito',this.value)">${t.efeito||''}</textarea></div>
      </div>
    </div>`;
  });
}
function adicionarTecnica()    { tecnicas.push({id:Date.now(),nome:"Nova Técnica",acao:"Padrão",custo:"",teste:"",dano:"",efeito:""}); renderizarTecnicas(); autoSalvar(); }
function removerTecnica(i)     { tecnicas.splice(i,1); renderizarTecnicas(); autoSalvar(); }
function atualizarTecnica(i,c,v){ tecnicas[i][c]=v; autoSalvar(); }

function renderizarShikigamis() {
  const lista = document.getElementById('lista-shikigamis');
  lista.innerHTML = '';
  shikigamis.forEach((s, i) => {
    lista.innerHTML += `
    <div class="bg-cardBg p-5 rounded-lg border border-indigo-900/50 shadow-md relative transition-colors">
      <button onclick="removerShikigami(${i})" class="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition bg-slate-800 px-3 py-1.5 rounded"><i class="fas fa-trash"></i></button>
      <input type="text" class="w-10/12 bg-transparent font-bold text-indigo-300 text-2xl border-none outline-none focus:ring-0 p-0 mb-5" value="${s.nome}" placeholder="Nome do Shikigami" onchange="atualizarShiki(${i},'nome',this.value)">
      <div class="grid grid-cols-2 gap-4 mb-5">
        <div class="bg-slate-800 p-3 rounded-lg border border-slate-700"><span class="text-xs text-slate-400 uppercase font-bold block mb-2">Pontos de Vida</span><div class="flex items-center gap-2"><input type="number" class="input-field text-red-400 font-bold p-2 text-center text-lg" value="${s.pvAtual}" onchange="atualizarShiki(${i},'pvAtual',this.value)"><span class="text-slate-500">/</span><input type="number" class="input-field text-slate-400 p-2 text-center text-lg" value="${s.pvMax}" onchange="atualizarShiki(${i},'pvMax',this.value)"></div></div>
        <div class="bg-slate-800 p-3 rounded-lg border border-slate-700"><span class="text-xs text-slate-400 uppercase font-bold block mb-2">Energia (PE)</span><div class="flex items-center gap-2"><input type="number" class="input-field text-purple-400 font-bold p-2 text-center text-lg" value="${s.peAtual}" onchange="atualizarShiki(${i},'peAtual',this.value)"><span class="text-slate-500">/</span><input type="number" class="input-field text-slate-400 p-2 text-center text-lg" value="${s.peMax}" onchange="atualizarShiki(${i},'peMax',this.value)"></div></div>
      </div>
      <div class="space-y-4">
        <div><span class="text-xs text-slate-400 uppercase font-bold"><i class="fas fa-crosshairs mr-1"></i> Ataques</span><textarea class="input-field bg-slate-900 text-sm p-3 h-20 resize-y mt-2" placeholder="Ex: Mordida (Luta) - 1d8+3" onchange="atualizarShiki(${i},'ataques',this.value)">${s.ataques}</textarea></div>
        <div><span class="text-xs text-slate-400 uppercase font-bold"><i class="fas fa-magic mr-1"></i> Habilidades</span><textarea class="input-field bg-slate-900 text-sm p-3 h-24 resize-y mt-2" placeholder="Voo, Resistências..." onchange="atualizarShiki(${i},'habilidades',this.value)">${s.habilidades}</textarea></div>
      </div>
    </div>`;
  });
}
function adicionarShikigami() { shikigamis.push({nome:"Novo Cão Divino",pvAtual:10,pvMax:10,peAtual:0,peMax:0,ataques:"",habilidades:""}); renderizarShikigamis(); autoSalvar(); }
function removerShikigami(i)  { pedirConfirmacao("Dispensar Shikigami","Excluir definitivamente?","Excluir",()=>{shikigamis.splice(i,1);renderizarShikigamis();autoSalvar();}); }
function atualizarShiki(i,c,v){ shikigamis[i][c]=v; autoSalvar(); }

// ─── TEMA ─────────────────────────────────────────────────────
function ajustarCorHex(hex, lum) {
  hex = String(hex).replace(/[^0-9a-f]/gi,'');
  if(hex.length<6) hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  let res="#";
  for(let i=0;i<3;i++){let c=parseInt(hex.substring(i*2,i*2+2),16);c=Math.round(Math.min(Math.max(0,c+(c*(lum/100))),255)).toString(16);res+=("00"+c).substring(c.length);}
  return res;
}
function aplicarTema(tema) {
  if (!tema) return;
  const dark = ajustarCorHex(tema.cor || "#7c3aed", -30);
  document.documentElement.style.setProperty('--color-cursed', tema.cor || "#7c3aed");
  document.documentElement.style.setProperty('--color-cursed-dark', dark);
  document.documentElement.style.setProperty('--font-main', tema.fonte || "'Poppins', sans-serif");
  document.body.classList.remove('tema-vinteum','modo-batalha','tema-zoltraak');

  if (tema.preset && tema.preset !== 'padrao') document.body.classList.add(`tema-${tema.preset}`);

  const btnBatalha    = document.getElementById('btn-modo-batalha');
  const painelCorr    = document.getElementById('painel-corrosao');
  const painelInex    = document.getElementById('painel-inexistencia');
  const btnSerio      = document.getElementById('btn-modo-serio');
  const tabGrimorio   = document.getElementById('btn-aba-grimorio');
  const tabItens      = document.getElementById('btn-aba-itens');
  const title         = document.getElementById('main-title');

  if (tema.preset === 'vinteum') {
    btnBatalha.classList.remove('hidden');
    painelInex.classList.remove('hidden'); painelInex.classList.add('flex');
    title.style.backgroundImage = 'none';
    if (tema.modoBatalha) {
      document.body.classList.add('modo-batalha');
      btnBatalha.innerHTML = '<i class="fas fa-bolt text-white"></i> MODO BATALHA: ON';
      painelCorr.classList.remove('hidden'); painelCorr.classList.add('grid');
      iniciarPetalas();
    } else {
      btnBatalha.innerHTML = '<i class="fas fa-bolt text-cyan-400"></i> MODO BATALHA';
      painelCorr.classList.add('hidden'); painelCorr.classList.remove('grid');
      pararPetalas();
    }
  } else {
    btnBatalha.classList.add('hidden');
    painelCorr.classList.add('hidden'); painelCorr.classList.remove('grid');
    painelInex.classList.add('hidden'); painelInex.classList.remove('flex');
    pararPetalas();
    title.style.backgroundImage = `linear-gradient(to right, #c084fc, var(--color-cursed))`;
  }

  if (tema.preset === 'zoltraak') {
    title.style.backgroundImage = 'none';
    title.classList.add('text-white');
    tabGrimorio.classList.remove('hidden'); tabItens.classList.remove('hidden');
    btnSerio.classList.remove('hidden');
  } else {
    title.classList.remove('text-white');
    tabGrimorio.classList.add('hidden'); tabItens.classList.add('hidden');
    btnSerio.classList.add('hidden');
    if (!document.getElementById('aba-grimorio').classList.contains('hidden') ||
        !document.getElementById('aba-itens').classList.contains('hidden')) mudarAba('principal');
  }
  calcularDerivados();
}

function toggleModoBatalha() {
  configTema.modoBatalha = !configTema.modoBatalha;
  if (!configTema.modoBatalha && corrosaoAtual > 0) {
    mostrarModal("Protocolo Encerrado", `Corrosão encerrada. Você fica EXAUSTO por ${corrosaoAtual} rodada(s)!`);
    corrosaoAtual = 0;
  }
  aplicarTema(configTema);
  autoSalvar();
}

function abrirConfigModal() {
  const modal = document.getElementById('configModal');
  modal.classList.remove('hidden');
  setTimeout(() => { modal.classList.remove('opacity-0'); document.getElementById('configModalContent').classList.remove('scale-95'); document.getElementById('configModalContent').classList.add('scale-100'); }, 10);
}
function fecharConfigModal() {
  const modal = document.getElementById('configModal');
  modal.classList.add('opacity-0');
  document.getElementById('configModalContent').classList.remove('scale-100'); document.getElementById('configModalContent').classList.add('scale-95');
  setTimeout(() => modal.classList.add('hidden'), 300);
}
function salvarConfigTema() {
  configTema.preset = document.getElementById('tema-preset').value;
  configTema.cor    = document.getElementById('tema-cor').value;
  configTema.fonte  = document.getElementById('tema-fonte').value;
  if (configTema.preset !== 'vinteum') configTema.modoBatalha = false;
  aplicarTema(configTema);
  fecharConfigModal();
  autoSalvar();
}

// ─── MODAIS ───────────────────────────────────────────────────
function mostrarModal(titulo, texto) {
  document.getElementById('msgTitle').innerText = titulo;
  document.getElementById('msgText').innerText  = texto;
  const modal = document.getElementById('msgModal');
  modal.classList.remove('hidden');
  setTimeout(() => { modal.classList.remove('opacity-0'); document.getElementById('msgModalContent').classList.remove('scale-95'); document.getElementById('msgModalContent').classList.add('scale-100'); }, 10);
}
function fecharModal() {
  const modal = document.getElementById('msgModal');
  modal.classList.add('opacity-0');
  document.getElementById('msgModalContent').classList.remove('scale-100'); document.getElementById('msgModalContent').classList.add('scale-95');
  setTimeout(() => modal.classList.add('hidden'), 300);
}
function pedirConfirmacao(titulo, texto, textoBotao, callback) {
  document.getElementById('confirmModalTitle').innerText  = titulo;
  document.getElementById('confirmModalText').innerHTML   = texto;
  const btn = document.getElementById('confirmModalBtnYes');
  btn.innerText = textoBotao;
  btn.onclick   = () => { fecharConfirmModal(); if (callback) callback(); };
  const modal = document.getElementById('confirmModal');
  modal.classList.remove('hidden');
  setTimeout(() => { modal.classList.remove('opacity-0'); document.getElementById('confirmModalContent').classList.remove('scale-95'); document.getElementById('confirmModalContent').classList.add('scale-100'); }, 10);
}
function fecharConfirmModal() {
  const modal = document.getElementById('confirmModal');
  modal.classList.add('opacity-0');
  document.getElementById('confirmModalContent').classList.remove('scale-100'); document.getElementById('confirmModalContent').classList.add('scale-95');
  setTimeout(() => modal.classList.add('hidden'), 300);
}
function confirmarLimparFicha() { localStorage.removeItem('rpg_backup_feiticeiros'); location.reload(); }

// ─── SALVAR / CARREGAR ────────────────────────────────────────
function obterDadosAtuais() {
  let pericias = {};
  periciasBase.forEach(p => {
    const grau  = parseInt(document.getElementById(`grau-${p.id}`)?.value) || 0;
    const bonus = parseInt(document.getElementById(`per-${p.id}`)?.value)  || 0;
    const attr  = document.getElementById(`attr-per-${p.id}`)?.value || p.attr;
    pericias[p.id] = { grau, bonus, attr };
  });
  return {
    jogador: document.getElementById('nome-jogador').value,
    nome:    document.getElementById('nome').value,
    avatar:  avatarImgData,
    grau:    document.getElementById('grau').value,
    origem:  document.getElementById('origem').value,
    classeSelect: document.getElementById('classe-select').value,
    nivel:   document.getElementById('nivel').value,
    secundarios: {
      deslocamento: document.getElementById('deslocamento').value,
      attrCD:       document.getElementById('attr-cd').value,
      caBonus:      document.getElementById('ca-bonus').value,
      rdGeral:      document.getElementById('rd-geral-base').value,
      rdEspecifica: document.getElementById('rd-especifica').value,
    },
    classeInfo: {
      pvBase:  document.getElementById('pv-base').value,
      pvNivel: document.getElementById('pv-nivel').value,
      peBase:  document.getElementById('pe-base').value,
      peNivel: document.getElementById('pe-nivel').value,
    },
    atributos: { for: document.getElementById('attr-for').value, des: document.getElementById('attr-des').value, con: document.getElementById('attr-con').value, int: document.getElementById('attr-int').value, sab: document.getElementById('attr-sab').value, pre: document.getElementById('attr-pre').value },
    pericias,
    status: {
      pvAdicional: document.getElementById('pv-adicional').value,
      peAdicional: document.getElementById('pe-adicional').value,
      pvAtual:     document.getElementById('pv-atual').value,
      peAtual:     document.getElementById('pe-atual').value,
      corrosaoAtual, vazioAtual, fimAtual, exaustaoAtual, modoSerioAtivo,
    },
    condicoes, defesas, votos, shikigamis, treinamentos, habilidadesDin: habilidades,
    inventario, ataques, tecnicas,
    anotacoes: document.getElementById('anotacoes').value,
    tema: configTema,
    magiasAprendidas, magiasInuteis, itensMagicos,
  };
}

function aplicarDadosNaFicha(dados) {
  document.getElementById('nome-jogador').value = dados.jogador || '';
  document.getElementById('nome').value    = dados.nome    || '';
  document.getElementById('grau').value    = dados.grau    || '4';
  document.getElementById('origem').value  = dados.origem  || '';
  document.getElementById('nivel').value   = dados.nivel   || 1;

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
    document.getElementById('attr-cd').value      = dados.secundarios.attrCD       || 'pre';
    document.getElementById('ca-bonus').value     = dados.secundarios.caBonus      || 0;
    document.getElementById('rd-geral-base').value= dados.secundarios.rdGeral      || 0;
    document.getElementById('rd-especifica').value= dados.secundarios.rdEspecifica || '';
  }
  if (dados.classeInfo) {
    document.getElementById('pv-base').value  = dados.classeInfo.pvBase  || 20;
    document.getElementById('pv-nivel').value = dados.classeInfo.pvNivel || 4;
    document.getElementById('pe-base').value  = dados.classeInfo.peBase  || 2;
    document.getElementById('pe-nivel').value = dados.classeInfo.peNivel || 2;
  }
  if (dados.atributos) ['for','des','con','int','sab','pre'].forEach(a => document.getElementById(`attr-${a}`).value = dados.atributos[a] || 10);
  if (dados.pericias) periciasBase.forEach(p => {
    const gEl = document.getElementById(`grau-${p.id}`); const bEl = document.getElementById(`per-${p.id}`); const aEl = document.getElementById(`attr-per-${p.id}`);
    if (gEl && bEl && dados.pericias[p.id] !== undefined) {
      const pd = dados.pericias[p.id];
      if (typeof pd === 'object') { gEl.value=pd.grau||0; bEl.value=pd.bonus||0; if(aEl&&pd.attr)aEl.value=pd.attr; }
      else { bEl.value=pd; gEl.value=pd>0?1:0; }
    }
  });

  condicoes = dados.condicoes || []; defesas = dados.defesas || []; votos = dados.votos || [];
  shikigamis = dados.shikigamis || []; treinamentos = dados.treinamentos || [];
  if (dados.habilidadesDin) habilidades = dados.habilidadesDin;

  if (dados.status) {
    document.getElementById('pv-adicional').value = dados.status.pvAdicional || 0;
    document.getElementById('pe-adicional').value = dados.status.peAdicional || 0;
    document.getElementById('pv-atual').value     = dados.status.pvAtual     || 0;
    document.getElementById('pe-atual').value     = dados.status.peAtual     || 0;
    corrosaoAtual = dados.status.corrosaoAtual || 0;
    vazioAtual    = dados.status.vazioAtual    || 0;
    fimAtual      = dados.status.fimAtual      || 0;
    exaustaoAtual = dados.status.exaustaoAtual || 0;
    modoSerioAtivo= dados.status.modoSerioAtivo|| false;
    document.getElementById('vazio-atual').innerText = vazioAtual;
    document.getElementById('fim-atual').innerText   = fimAtual;
    document.getElementById('bar-fim').style.width   = (fimAtual / 12 * 100) + '%';
  }

  inventario = dados.inventario || [];
  ataques    = (dados.ataques  || []).map(a => ({...a, acao: a.acao || "Padrão"}));
  tecnicas   = (dados.tecnicas || []).map(t => ({...t, acao: t.acao || "Padrão"}));
  document.getElementById('anotacoes').value = dados.anotacoes || '';
  magiasAprendidas = dados.magiasAprendidas || {};
  magiasInuteis    = dados.magiasInuteis    || [];
  itensMagicos     = dados.itensMagicos     || [];

  if (dados.tema) { configTema = dados.tema; aplicarTema(configTema); }

  renderizarCondicoes(); renderizarDefesas(); renderizarVotos(); renderizarShikigamis();
  renderizarTreinamentos(); renderizarHabs(); renderizarInventario();
  renderizarAtaques(); renderizarTecnicas();
  alterarExaustao(0);

  const btnSerio = document.getElementById('btn-modo-serio');
  const seloSerio= document.getElementById('selo-modo-serio');
  if (modoSerioAtivo) { btnSerio.classList.add('modo-serio-on'); seloSerio.classList.remove('hidden'); document.body.classList.add('modo-serio-ativo'); iniciarAuraAzul(); }
  else               { btnSerio.classList.remove('modo-serio-on'); seloSerio.classList.add('hidden'); document.body.classList.remove('modo-serio-ativo'); pararAuraAzul(); }

  calcularDerivados();
  renderizarGrimorioHTML();
  renderizarMagiasInuteis();
  renderizarItensMagicos();
}

function autoSalvar() {
  try {
    localStorage.setItem('rpg_backup_feiticeiros', JSON.stringify(obterDadosAtuais()));
    const el = document.getElementById('save-status');
    if (el) { el.classList.add('saving-indicator','text-green-400'); setTimeout(() => el.classList.remove('saving-indicator','text-green-400'), 1500); }
  } catch (e) { console.error("Erro no auto-save", e); }
}

function exportarFicha() {
  const dados = obterDadosAtuais();
  const link  = document.createElement('a');
  link.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2)));
  link.setAttribute("download", `ficha_${dados.nome || 'feiticeiro'}.json`);
  link.click();
  mostrarModal("Sucesso", "Ficha guardada com sucesso!");
}

function importarFicha(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try { aplicarDadosNaFicha(JSON.parse(e.target.result)); autoSalvar(); mostrarModal("Sucesso", "Ficha carregada!"); }
    catch { mostrarModal("Erro", "Arquivo JSON inválido."); }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ─── INICIALIZAÇÃO ────────────────────────────────────────────
window.onload = async () => {
  const ok = await carregarAPI();
  if (!ok) return;

  inicializarPericias();
  renderizarGrimorioHTML();
  renderizarMagiasInuteis();
  renderizarItensMagicos();

  const backup = localStorage.getItem('rpg_backup_feiticeiros');
  if (backup) {
    try { aplicarDadosNaFicha(JSON.parse(backup)); }
    catch { startFichaLimpa(); }
  } else { startFichaLimpa(); }

  setInterval(autoSalvar, 3000);
};

function startFichaLimpa() {
  mudarClasse();
  renderizarCondicoes(); renderizarDefesas(); renderizarVotos(); renderizarShikigamis();
  renderizarTreinamentos(); renderizarHabs(); renderizarInventario();
  renderizarAtaques(); renderizarTecnicas();
  aplicarTema(configTema);
  renderizarGrimorioHTML(); renderizarMagiasInuteis(); renderizarItensMagicos();
  alterarExaustao(0);
  document.body.classList.remove('modo-serio-ativo');
  pararAuraAzul();
}
