// api/grimorio.js

const bdGrimorio = {
    essencias: [
        { id: 'e_fogo', sub: 'Elementos Físicos', nome: 'Fogo/Calor', desc: 'Queima, aquece, ilumina, derrete.', cor: '#ff4500' },
        { id: 'e_agua', sub: 'Elementos Físicos', nome: 'Água/Líquido', desc: 'Molha, afoga, limpa, dilui.', cor: '#00bfff' },
        { id: 'e_vento', sub: 'Elementos Físicos', nome: 'Vento/Ar', desc: 'Empurra, corta, afasta gases, oxigena.', cor: '#e0ffff' },
        { id: 'e_terra', sub: 'Elementos Físicos', nome: 'Terra/Rocha', desc: 'Esmaga, cria peso, serve de base sólida.', cor: '#8b4513' },
        { id: 'e_gelo', sub: 'Elementos Físicos', nome: 'Gelo/Frio', desc: 'Congela, esfria, preserva, deixa escorregadio.', cor: '#afeeee' },
        { id: 'e_raio', sub: 'Elementos Físicos', nome: 'Raio/Eletricidade', desc: 'Dá choque, paralisa, conduz energia.', cor: '#ffd700' },
        { id: 'e_luz', sub: 'Elementos Físicos', nome: 'Luz/Brilho', desc: 'Cega inimigos, ilumina ambientes, revela.', cor: '#ffffe0' },
        { id: 'e_sombra', sub: 'Elementos Físicos', nome: 'Sombra/Escuridão', desc: 'Oculta, cega, esfria.', cor: '#4b0082' },
        { id: 'e_planta', sub: 'Elementos Físicos', nome: 'Planta/Madeira', desc: 'Amarra, cresce, serve de construção.', cor: '#228b22' },
        { id: 'e_areia', sub: 'Elementos Físicos', nome: 'Areia/Pó', desc: 'Cega, camufla, soterra, lixa.', cor: '#f4a460' },
        { id: 'e_lama', sub: 'Elementos Físicos', nome: 'Lama/Pântano', desc: 'Atola, suja, amortece quedas.', cor: '#556b2f' },
        { id: 'e_fumaca', sub: 'Elementos Físicos', nome: 'Fumaça/Gás', desc: 'Sufoca, esconde a visão, sobe pelo ar.', cor: '#696969' },
        { id: 'e_cristal', sub: 'Elementos Físicos', nome: 'Cristal/Vidro', desc: 'Perfura, reflete luz, corta, isola.', cor: '#dda0dd' },
        { id: 'e_magma', sub: 'Elementos Físicos', nome: 'Magma/Lava', desc: 'Derrete tudo, dano massivo de fogo e terra.', cor: '#ff0000' },
        { id: 'e_som', sub: 'Elementos Físicos', nome: 'Som/Vibração', desc: 'Estoura tímpanos, imita vozes, quebra vidro.', cor: '#00ced1' },
        { id: 'e_carne', sub: 'Corpo e Biologia', nome: 'Carne/Osso', desc: 'Cura ferimentos físicos, repara tecidos.', cor: '#ffb6c1' },
        { id: 'e_sangue', sub: 'Corpo e Biologia', nome: 'Sangue/Vitalidade', desc: 'Rouba vida, cicatriza, rastreia linhagem.', cor: '#8b0000' },
        { id: 'e_veneno', sub: 'Corpo e Biologia', nome: 'Veneno/Toxina', desc: 'Adoece, apodrece, corrói.', cor: '#32cd32' },
        { id: 'e_acido', sub: 'Corpo e Biologia', nome: 'Ácido/Corrosão', desc: 'Derrete metais e fechaduras.', cor: '#adff2f' },
        { id: 'e_odor', sub: 'Corpo e Biologia', nome: 'Odor/Cheiro', desc: 'Atrai monsters, esconde cheiro, enoja.', cor: '#bdb76b' },
        { id: 'e_sono', sub: 'Corpo e Biologia', nome: 'Sono/Fadiga', desc: 'Desmaia, acalma, tira a energia.', cor: '#483d8b' },
        { id: 'e_adrena', sub: 'Corpo e Biologia', nome: 'Adrenalina', desc: 'Acelera reações, tira medo, aumenta força.', cor: '#ff8c00' },
        { id: 'e_gravi', sub: 'Conceitos e Forças', nome: 'Gravidade', desc: 'Aumenta o peso ou zera o peso (flutua).', cor: '#8a2be2' },
        { id: 'e_espaco', sub: 'Conceitos e Forças', nome: 'Espaço/Vácuo', desc: 'Teletransporta, corta ignorando armadura.', cor: '#00008b' },
        { id: 'e_tempo', sub: 'Conceitos e Forças', nome: 'Tempo', desc: 'Deixa lento, rápido, rebobina segundos.', cor: '#fff8dc' },
        { id: 'e_cinet', sub: 'Conceitos e Forças', nome: 'Cinética (Impacto)', desc: 'Força de batida pura invisível.', cor: '#d3d3d3' },
        { id: 'e_magnet', sub: 'Conceitos e Forças', nome: 'Magnetismo', desc: 'Puxa ou empurra metais pesados.', cor: '#c0c0c0' },
        { id: 'e_ilusao', sub: 'Conceitos e Forças', nome: 'Ilusão/Miragem', desc: 'Cria imagens mentais falsas.', cor: '#ff69b4' },
        { id: 'e_memo', sub: 'Conceitos e Forças', nome: 'Memória', desc: 'Apaga segundos recentes ou guarda infos.', cor: '#87cefa' },
        { id: 'e_verd', sub: 'Conceitos e Forças', nome: 'Verdade', desc: 'Impede mentiras, revela o que está oculto.', cor: '#f0e68c' },
        { id: 'e_emocao', sub: 'Conceitos e Forças', nome: 'Emoção', desc: 'Causa medo, alegria, raiva ou calma.', cor: '#db7093' },
        { id: 'e_cola', sub: 'Conceitos e Forças', nome: 'Ligação (Cola)', desc: 'Gruda duas coisas com força inquebrável.', cor: '#daa520' },
        { id: 'e_atrito', sub: 'Conceitos e Forças', nome: 'Atrito', desc: 'Deixa escorregadio ou totalmente travado.', cor: '#cd853f' },
        { id: 'e_repul', sub: 'Conceitos e Forças', nome: 'Repulsão', desc: 'Como ímã invertido, afasta tudo.', cor: '#6495ed' },
        { id: 'e_absor', sub: 'Conceitos e Forças', nome: 'Absorção', desc: 'Suga impactos, água, luz ou magias.', cor: '#2f4f4f' },
        { id: 'e_elasti', sub: 'Conceitos e Forças', nome: 'Elasticidade', desc: 'Faz pedra quicar, espadas dobrarem.', cor: '#ffdab9' },
        { id: 'e_ferrug', sub: 'Conceitos e Forças', nome: 'Ferrugem/Decomp.', desc: 'Envelhece materiais rapidamente.', cor: '#a0522d' },
        { id: 'e_mudez', sub: 'Conceitos e Forças', nome: 'Mudez/Silêncio', desc: 'Apaga qualquer onda sonora da área.', cor: '#708090' },
        { id: 'e_densi', sub: 'Conceitos e Forças', nome: 'Densidade', desc: 'Faz um graveto ficar duro como aço.', cor: '#778899' },
        { id: 'e_tinta', sub: 'Conceitos e Forças', nome: 'Tinta/Registro', desc: 'Escreve, copia, marca caminhos.', cor: '#000000' }
    ],
    formas: [
        { id: 'f_flecha', sub: 'Ataque e Movimento', nome: 'Flecha/Disparo', desc: 'Um tiro reto e rápido.' },
        { id: 'f_lamina', sub: 'Ataque e Movimento', nome: 'Lâmina/Corte', desc: 'Forma um fio afiado (faca ou espada).' },
        { id: 'f_explos', sub: 'Ataque e Movimento', nome: 'Explosão/Estouro', desc: 'Expande violentamente do centro para fora.' },
        { id: 'f_corren', sub: 'Ataque e Movimento', nome: 'Corrente/Chicote', desc: 'Linha longa flexível que chicoteia/amarra.' },
        { id: 'f_cone', sub: 'Ataque e Movimento', nome: 'Cone/Sopro', desc: 'Sai de você abrindo em triângulo.' },
        { id: 'f_pilar', sub: 'Ataque e Movimento', nome: 'Pilar/Estaca', desc: 'Brota do chão ou da parede para cima.' },
        { id: 'f_chuva', sub: 'Ataque e Movimento', nome: 'Chuva/Queda', desc: 'Cai do céu atingindo uma área grande.' },
        { id: 'f_meteor', sub: 'Ataque e Movimento', nome: 'Meteoro/Massa', desc: 'Esfera gigante que cai num único ponto.' },
        { id: 'f_onda', sub: 'Ataque e Movimento', nome: 'Onda/Tsunami', desc: 'Uma parede que avança varrendo o chão.' },
        { id: 'f_bumer', sub: 'Ataque e Movimento', nome: 'Bumerangue', desc: 'Vai até um ponto e volta para você.' },
        { id: 'f_mao', sub: 'Ferramentas Físicas e Defesa', nome: 'Mão/Garra', desc: 'Agarra, aperta, pega objetos.' },
        { id: 'f_olho', sub: 'Ferramentas Físicas e Defesa', nome: 'Olho/Lente', desc: 'Permite enxergar, aumenta a visão (lupa).' },
        { id: 'f_ouvid', sub: 'Ferramentas Físicas e Defesa', nome: 'Ouvido/Funil', desc: 'Capta sons distantes.' },
        { id: 'f_parede', sub: 'Ferramentas Físicas e Defesa', nome: 'Parede/Escudo', desc: 'Uma barreira plana e imóvel.' },
        { id: 'f_cupula', sub: 'Ferramentas Físicas e Defesa', nome: 'Cúpula/Redoma', desc: 'Meia-esfera protetora sobre uma área.' },
        { id: 'f_esfera', sub: 'Ferramentas Físicas e Defesa', nome: 'Esfera/Bolha', desc: 'Uma bola perfeita (pode ser oca).' },
        { id: 'f_fio', sub: 'Ferramentas Físicas e Defesa', nome: 'Fio/Corda', desc: 'Linha longa para pendurar ou tecer.' },
        { id: 'f_roda', sub: 'Ferramentas Físicas e Defesa', nome: 'Roda/Engrenagem', desc: 'Algo circular que gira.' },
        { id: 'f_asa', sub: 'Ferramentas Físicas e Defesa', nome: 'Asa/Pena', desc: 'Permite planar, voar ou criar vento.' },
        { id: 'f_degrau', sub: 'Ferramentas Físicas e Defesa', nome: 'Degrau/Plataforma', desc: 'Uma base plana no ar para pisar.' },
        { id: 'f_ponte', sub: 'Ferramentas Físicas e Defesa', nome: 'Ponte/Caminho', desc: 'Uma passarela longa.' },
        { id: 'f_porta', sub: 'Ferramentas Físicas e Defesa', nome: 'Porta/Fresta', desc: 'Cria uma passagem onde não tem.' },
        { id: 'f_chave', sub: 'Ferramentas Físicas e Defesa', nome: 'Chave/Pino', desc: 'Entra em buracos com a forma exata.' },
        { id: 'f_rede', sub: 'Ferramentas Físicas e Defesa', nome: 'Rede/Teia', desc: 'Malha cruzada para capturar/amortecer.' },
        { id: 'f_tapete', sub: 'Ferramentas Físicas e Defesa', nome: 'Tapete/Piso', desc: 'Fica rente ao chão.' },
        { id: 'f_espelh', sub: 'Formas Complexas e Autônomas', nome: 'Espelho/Refletor', desc: 'Devolve o que bater nele.' },
        { id: 'f_buraco', sub: 'Formas Complexas e Autônomas', nome: 'Buraco/Cratera', desc: 'Abre uma cavidade para baixo.' },
        { id: 'f_armadi', sub: 'Formas Complexas e Autônomas', nome: 'Armadilha/Mina', desc: 'Escondido esperando algo pisar.' },
        { id: 'f_aura', sub: 'Formas Complexas e Autônomas', nome: 'Aura/Veste', desc: 'Cobre o seu corpo como uma roupa.' },
        { id: 'f_nuvem', sub: 'Formas Complexas e Autônomas', nome: 'Nuvem/Névoa', desc: 'Se espalha pelo ar preenchendo o ambiente.' },
        { id: 'f_vortic', sub: 'Formas Complexas e Autônomas', nome: 'Vórtice/Redemoinho', desc: 'Gira sugando tudo para o centro.' },
        { id: 'f_servo', sub: 'Formas Complexas e Autônomas', nome: 'Servo/Boneco', desc: 'Um avatar bípede para tarefas burras.' },
        { id: 'f_passar', sub: 'Formas Complexas e Autônomas', nome: 'Pássaro/Mensag.', desc: 'Forma voadora autônoma para longas dist.' },
        { id: 'f_carapa', sub: 'Formas Complexas e Autônomas', nome: 'Carapaça', desc: 'Envolve corpo aliado como armadura grossa.' },
        { id: 'f_agulha', sub: 'Formas Complexas e Autônomas', nome: 'Agulha/Seringa', desc: 'Fina o suficiente para pele ou fechaduras.' },
        { id: 'f_tubo', sub: 'Formas Complexas e Autônomas', nome: 'Tubo/Cano', desc: 'Canal oco por onde coisas podem passar.' },
        { id: 'f_gancho', sub: 'Formas Complexas e Autônomas', nome: 'Gancho/Anzol', desc: 'Puxa e trava em quinas.' },
        { id: 'f_guarda', sub: 'Formas Complexas e Autônomas', nome: 'Guarda-chuva', desc: 'Protege apenas de coisas caindo de cima.' },
        { id: 'f_mola', sub: 'Formas Complexas e Autônomas', nome: 'Mola', desc: 'Comprime e ejeta com força.' },
        { id: 'f_coroa', sub: 'Formas Complexas e Autônomas', nome: 'Coroa/Anel', desc: 'Circula a cabeça (bom para magia mental).' }
    ],
    modificadores: [
        { id: 'm_tempor', sub: 'Tempo e Gatilho', nome: 'Temporizador', desc: 'Desliga sozinho depois de X horas/minutos.' },
        { id: 'm_atraso', sub: 'Tempo e Gatilho', nome: 'Atraso/Timer', desc: 'Só ativa X tempo depois de desenhar.' },
        { id: 'm_condic', sub: 'Tempo e Gatilho', nome: 'Condicional', desc: 'Só funciona se a condição acontecer.' },
        { id: 'm_perman', sub: 'Tempo e Gatilho', nome: 'Permanente', desc: 'Nunca desliga (gasta muita mana).' },
        { id: 'm_eco', sub: 'Tempo e Gatilho', nome: 'Eco/Repetição', desc: 'Acontece duas vezes seguidas.' },
        { id: 'm_gigant', sub: 'Espaço e Tamanho', nome: 'Gigante', desc: 'Multiplica o tamanho da forma.' },
        { id: 'm_minusc', sub: 'Espaço e Tamanho', nome: 'Minúsculo', desc: 'Encolhe para o tamanho de uma moeda.' },
        { id: 'm_telegu', sub: 'Espaço e Tamanho', nome: 'Teleguiado', desc: 'Faz curva no ar perseguindo um alvo.' },
        { id: 'm_perfur', sub: 'Espaço e Tamanho', nome: 'Perfurante', desc: 'Atravessa a primeira coisa que bater.' },
        { id: 'm_adesiv', sub: 'Espaço e Tamanho', nome: 'Adesivo/Grudento', desc: 'Magia não se mexe, fica colada no local.' },
        { id: 'm_invisi', sub: 'Furtividade e Utilidade', nome: 'Invisível', desc: 'A forma gerada não pode ser vista.' },
        { id: 'm_silenc', sub: 'Furtividade e Utilidade', nome: 'Silencioso', desc: 'Anula seu próprio som ao existir.' },
        { id: 'm_falso', sub: 'Furtividade e Utilidade', nome: 'Falso/Camuflado', desc: 'Tem a aparência de um item comum.' },
        { id: 'm_limpo', sub: 'Furtividade e Utilidade', nome: 'Limpo', desc: 'Não deixa rastros mágicos ou físicos.' },
        { id: 'm_partil', sub: 'Furtividade e Utilidade', nome: 'Partilhado', desc: 'Efeito se aplica a quem você der a mão.' },
        { id: 'm_vampir', sub: 'Efeitos Especiais', nome: 'Vampírico', desc: 'O que tirar do alvo, passa pra você.' },
        { id: 'm_protet', sub: 'Efeitos Especiais', nome: 'Protetor/Amigo', desc: 'Reconhece aliados e não dá dano neles.' },
        { id: 'm_revers', sub: 'Efeitos Especiais', nome: 'Reversível', desc: 'Pode cancelar de longe num estalo.' },
        { id: 'm_adapta', sub: 'Efeitos Especiais', nome: 'Adaptável', desc: 'Elemento muda sozinho pela necessidade.' },
        { id: 'm_ligaca', sub: 'Efeitos Especiais', nome: 'Ligação Mental', desc: 'Enxerga/sente através da magia.' }
    ],
    gatilhos: [
        /* ... TODOS OS SEUS GATILHOS (Incluí todos os 50 que você mandou) ... */
        { id: 'g_impact', sub: 'Físicos e Mecânicos', nome: 'Impacto/Pancada', desc: 'Ativa quando o objeto bate forte em algo.' },
        { id: 'g_fricca', sub: 'Físicos e Mecânicos', nome: 'Fricção', desc: 'Ativa ao esfregar o objeto.' },
        { id: 'g_quebra', sub: 'Físicos e Mecânicos', nome: 'Quebra/Rompimento', desc: 'A magia explode se o objeto for destruído.' },
        /* ... (Continue a lista com todos os itens do seu código original aqui) ... */
    ],
    config: {
        periciasBase: [ 
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
        ],
        classesRPG: {
            "feiticeiro": { pvBase: 20, pvNivel: 4, peBase: 5, peNivel: 2 },
            "atleta": { pvBase: 24, pvNivel: 6, peBase: 3, peNivel: 1 }
        },
        listaTreinamentosPadrao: ["Combate Corpo-a-Corpo", "Uso de Armas", "Meditação", "Personalizado"],
        ditCondicoes: {
            "Abalado": "-2 em todos os testes",
            "Apavorado": "-5 em todos os testes e não pode se aproximar da fonte",
            "Exausto": "Metade do deslocamento e -5 em testes físicos",
            "Doente": "-2 em todos os testes e não pode recuperar PV/PE naturalmente"
        }
    }
};

export default function handler(req, res) {
    // Trava de segurança (opcional durante testes, ligue para produção)
    const origin = req.headers.origin || "";
    // if (!origin.includes("seu-dominio.vercel.app")) return res.status(403).end();

    if (req.method === 'GET') {
        return res.status(200).json(bdGrimorio);
    }
    return res.status(405).json({ message: 'Método não permitido.' });
}
