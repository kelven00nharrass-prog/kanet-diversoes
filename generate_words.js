const fs = require('fs');
const path = require('path');

// 1. POOL DE PALAVRAS TJ E BÍBLICAS (417 originais - serão deduzidas de duplicados)
const rawTjWords = [
  "Jeová", "Jesus", "Espírito santo", "Bíblia", "Reino de Deus", "Reino dos céus", "Paraíso", "Novo mundo", "Vida eterna", "Resgate",
  "Fé", "Amor", "Esperança", "Oração", "Estudo bíblico", "Reunião", "Salão do Reino", "Pregação", "Ministério", "Serviço de campo",
  "Testemunho", "Publicador", "Pioneiro", "Pioneiro regular", "Pioneiro auxiliar", "Ancião", "Servo ministerial", "Betel", "Circuito", "Assembleia",
  "Congresso", "Memorial", "Celebração da morte de Cristo", "Cartas", "Território", "Revisita", "Curso bíblico", "Estudante da Bíblia", "Irmão", "Irmã",
  "Bíblia de Estudo", "Tradução do Novo Mundo", "JW.org", "Aplicativo JW Library", "Cântico", "Oração final", "Oração inicial", "Comentário", "Discurso", "Parte de estudante",
  "Vida e Ministério Cristãos", "Reunião do meio da semana", "Reunião de fim de semana", "Estudo de A Sentinela", "Estudo bíblico congregacional", "Escola do Ministério", "Ministério cristão", "Adoração pura", "Organização de Jeová", "Escravo fiel e prudente",
  "A Sentinela", "Despertai!", "Brochura", "Folheto", "Livro bíblico", "Publicação", "Vídeo JW", "Animação bíblica", "Dramatização", "Série de vídeos",
  "Adão", "Eva", "Noé", "Abraão", "Sara", "Isaque", "Jacó", "José", "Moisés", "Arão",
  "Josué", "Raabe", "Gideão", "Sansão", "Rute", "Samuel", "Saul", "Davi", "Salomão", "Elias",
  "Eliseu", "Isaías", "Jeremias", "Daniel", "Ezequiel", "Jonas", "Jó", "Ester", "Maria", "José",
  "João Batista", "Pedro", "Paulo", "João", "Tiago", "Mateus", "Marcos", "Lucas", "Tomé", "Timóteo",
  "Jerusalém", "Belém", "Nazaré", "Egito", "Israel", "Canaã", "Jordão", "Galileia", "Samaria", "Babilónia",
  "Éden", "Arca", "Dilúvio", "Torre de Babel", "Mar Vermelho", "Dez Mandamentos", "Tabernáculo", "Templo", "Sinagoga", "Monte Sinai",
  "Últimos dias", "Armagedom", "Grande tribulação", "Satanás", "Diabo", "Demónios", "Anjos", "Miguel", "Querubins", "Serafins",
  "Pecado", "Morte", "Ressurreição", "Ungidos", "144 mil", "Grande multidão", "Batismo", "Dedicação", "Consciência", "Integridade",
  "Neutralidade", "Paz", "Perdão", "Humildade", "Mansidão", "Paciência", "Bondade", "Autocontrole", "Pureza", "Lealdade",
  "Família", "Casamento", "Marido", "Esposa", "Filhos", "Pais", "Educação espiritual", "Noite de adoração em família", "Estudo familiar", "Conselho bíblico",
  "Pregação de casa em casa", "Carrinho de publicações", "Testemunho informal", "Pregação pública", "Zona rural", "Território isolado", "Carta de testemunho", "Telefone", "Conversa bíblica", "Convite",
  "Anciãos viajantes", "Superintendente de circuito", "Betelita", "Missionário", "Escola de Gileade", "Escola para Evangelizadores", "Escola do Ministério do Reino", "Servos", "Congregação", "Salão",
  "Microfone", "Plataforma", "Cadeira", "Comentário bíblico", "Irmão que preside", "Leitor", "Orador", "Ajudante", "Som", "Reunião híbrida",
  "Cântico 1", "Cântico do Reino", "Livro de cânticos", "Texto diário", "Examine as Escrituras", "Versículo", "Capítulo", "Tradução bíblica", "Referência bíblica", "Pesquisa bíblica",
  "Provérbios", "Salmos", "Evangelhos", "Atos", "Romanos", "Apocalipse", "Gênesis", "Êxodo", "Levítico", "Deuteronómio",
  "Amor leal", "Sabedoria", "Discernimento", "Conhecimento", "Verdade", "Luz espiritual", "Princípios bíblicos", "Mandamentos", "Conselho", "Exemplo",
  "Obediência", "Serviço voluntário", "Donativos", "Construção de Salões", "Ajuda humanitária", "Comissão de construção", "Tradução bíblica", "Filial", "Escritório mundial", "Organização",
  "Watchtower", "Brooklyn", "Warwick", "Betel de Moçambique", "Moçambique", "Maputo", "Matola", "Congregação local", "Circuito local", "Distrito",
  "“Faça-se a tua vontade”", "“Santificado seja o teu nome”", "“O Reino de Deus”", "“Permanecei firmes”", "“Andar com Deus”", "“Vida cristã”", "“Adoração verdadeira”", "“Amizade com Jeová”", "“Servir a Jeová”", "“Alegria no serviço”",
  "Jovens", "Crianças", "Irmãos espirituais", "Família espiritual", "Congregação mundial", "União", "Amor cristão", "Reunião especial", "Escola bíblica", "Treinamento",
  "Noé e a arca", "Daniel na cova dos leões", "Jonas e o peixe", "Davi e Golias", "José no Egito", "Moisés e o Mar Vermelho", "Jesus e os milagres", "Última ceia", "Ressurreição de Jesus", "Pentecostes",
  "Lobo e cordeiro", "Leão no paraíso", "Jardim do Éden", "Árvore da vida", "Terra paradísica", "Banquete espiritual", "Alimento espiritual", "Escritos inspirados", "Palavra de Deus", "Nome de Jeová",
  "Bondade imerecida", "Misericórdia", "Justiça", "Verdade bíblica", "Sabedoria divina", "Espírito de Jeová", "Servir juntos", "Reunião de pioneiros", "Assembleia regional", "Congresso regional"
];

const rawBiblicalCharacters = [
  "Adão", "Eva", "Caim", "Abel", "Sete", "Noé", "Sem", "Abraão", "Sara", "Ló",
  "Isaque", "Rebeca", "Esaú", "Jacó", "Raquel", "Lia", "José", "Benjamim", "Judá", "Tamar",
  "Moisés", "Arão", "Miriã", "Josué", "Calebe", "Raabe", "Débora", "Baraque", "Gideão", "Sansão",
  "Rute", "Noemi", "Samuel", "Eli", "Saul", "Jônatas", "Davi", "Golias", "Bate-Seba", "Salomão",
  "Roboão", "Elias", "Eliseu", "Acabe", "Jezabel", "Ezequias", "Superintendente", "Isaías", "Jeremias", "Daniel",
  "Sadraque", "Mesaque", "Abednego", "Ester", "Mordecai", "Jó", "Jonas", "Miqueias", "Habacuque", "Zacarias",
  "Maria (mãe de Jesus)", "José (pai adotivo de Jesus)", "João Batista", "Jesus", "Pedro", "André", "Tiago", "João", "Mateus", "Tomé",
  "Filipe", "Bartolomeu", "Simão Pedro", "Judas Iscariotes", "Paulo", "Barnabé", "Silas", "Timóteo", "Tito", "Lucas",
  "Marcos", "Áquila", "Priscila", "Lídia", "Estêvão", "Ananias", "Safira", "Cornélio", "Apolo", "Félix",
  "Pilatos", "Herodes", "Caifás", "Nicodemos", "Marta", "Lázaro", "Zaqueu", "Bartimeu", "Natanael", "Judas (irmão de Jesus)",
  
  // Acontecimentos / Histórias
  "Davi e Golias", "Noé e a arca", "Daniel na cova dos leões", "Jonas e o grande peixe", "Moisés e o Mar Vermelho",
  "José no Egito", "Sansão e Dalila", "Adão e Eva", "Jesus acalma a tempestade", "Jesus transforma água em vinho"
];

const quotes = [
  "“Segue-me.”", "“Bem-aventurados os pacificadores.”", "“A colheita é grande.”", "“Eu sou o caminho”",
  "“A verdade vos libertará.”", "“Eu sou a vida.”", "“Eu sou a verdade.”"
];

// Unificar e limpar palavras TJ / Bíblicas
const biblePool = Array.from(new Set(
  [...rawTjWords, ...rawBiblicalCharacters, ...quotes]
    .map(w => w.trim())
    .filter(w => w.length > 0)
));

// 2. POOL DE GEOGRAFIA (50 bairros de Maputo)
const maputoNeighbourhoods = [
  "Polana Cimento", "Coop", "Sommerschield", "Alto Maé A", "Alto Maé B", "Malhangalene A", "Malhangalene B", "Central A", "Central B", "Central C",
  "Maxaquene A", "Maxaquene B", "Maxaquene C", "Maxaquene D", "Mafalala", "Polana Caniço A", "Polana Caniço B", "Urbanização", "Chamanculo A", "Chamanculo B",
  "Chamanculo C", "Chamanculo D", "Xipamanine", "Malanga", "Munhuana", "Aeroporto A", "Aeroporto B", "Minkadjuíne", "Unidade 7", "Mavalane A",
  "Mavalane B", "Hulene A", "Hulene B", "FPLM", "Ferroviário", "Laulane", "Mahotas", "Albazine", "Costa do Sol", "Bagamoyo",
  "Benfica", "Inhagoia A", "Inhagoia B", "Jardim", "Luís Cabral", "Magoanine", "Malhazine", "Zimpeto", "25 de Junho A", "25 de Junho B"
].map(w => w.trim());

// 3. POOL DE PALAVRAS DO DIA A DIA (300 palavras)
const rawEverydayWords = [
  // Profissões (1-80)
  "Médico", "Enfermeiro", "Professor", "Engenheiro", "Advogado", "Polícia", "Bombeiro", "Agricultor", "Pescador", "Motorista",
  "Piloto", "Cozinheiro", "Garçom", "Pedreiro", "Eletricista", "Mecânico", "Carpinteiro", "Pintor", "Soldador", "Costureira",
  "Cabeleireiro", "Barbeiro", "Dentista", "Farmacêutico", "Veterinário", "Jornalista", "Fotógrafo", "Ator", "Cantor", "Músico",
  "Dançarino", "Escritor", "Contabilista", "Economista", "Gestor", "Empresário", "Vendedor", "Caixa", "Secretária", "Recepcionista",
  "Segurança", "Militar", "Juiz", "Procurador", "Tradutor", "Programador", "Designer", "Técnico de informática", "Cientista", "Arquiteto",
  "Corretor", "Bancário", "Assistente social", "Psicólogo", "Motorista de táxi", "Carteiro", "Professor universitário", "Pastor", "Missionário",
  "Guia turístico", "Atleta", "Treinador", "Árbitro", "Repórter", "Apresentador", "Influenciador", "Comerciante", "Operador de máquina",
  "Técnico eletrónico", "Canalizador", "Jardineiro", "Limpeza", "Babá", "Cozinheiro profissional", "Diretor", "Administrador", "Analista", "Investigador",

  // Objetos (81-200)
  "Telemóvel", "Computador", "Tablet", "Televisão", "Rádio", "Microfone", "Câmara", "Fone de ouvido", "Carregador", "Relógio",
  "Óculos", "Chave", "Carteira", "Mala", "Mochila", "Caneta", "Lápis", "Borracha", "Caderno", "Livro",
  "Mesa", "Cadeira", "Cama", "Sofá", "Armário", "Espelho", "Porta", "Janela", "Cortina", "Tapete",
  "Lâmpada", "Ventilador", "Ar condicionado", "Frigorífico", "Fogão", "Panela", "Prato", "Copo", "Garfo", "Faca",
  "Colher", "Garrafa", "Balde", "Vassoura", "Escova", "Sabão", "Toalha", "Roupa", "Camisa", "Calça",
  "Sapato", "Chapéu", "Cinto", "Anel", "Colar", "Pulseira", "Guarda-chuva", "Cama de bebé", "Brinquedo", "Boneca",
  "Bola", "Bicicleta", "Capacete", "Chave de fenda", "Martelo", "Pregos", "Tesoura", "Fita adesiva", "Caixa", "Saco",
  "Envelope", "Papel", "Impressora", "Teclado", "Rato (mouse)", "Monitor", "Cabo USB", "Pen drive", "Disco rígido", "Extensão elétrica",
  "Bateria", "Lanterna", "Vela", "Isqueiro", "Ferro de passar", "Máquina de lavar", "Aspirador", "Liquidificador", "Torradeira", "Churrasqueira",
  "Colchão", "Almofada", "Cobertor", "Escada", "Cadeado", "Cofre", "Calendário", "Quadro", "Fotografia", "Troféu",
  "Medalha", "Relógio de parede", "Despertador", "Telefone", "Campainha", "Controle remoto", "Ventoinha", "Máquina fotográfica", "Drone", "Impressora 3D",
  "Garrafa térmica", "Chaleira", "Frigideira", "Batedor", "Espátula", "Tigela", "Copo de vidro", "Xícara", "Guardanapo", "Panela de pressão",

  // Coisas, lugares e elementos (201-300)
  "Escola", "Universidade", "Hospital", "Mercado", "Banco", "Restaurante", "Loja", "Igreja", "Salão de beleza", "Cinema",
  "Teatro", "Estádio", "Praia", "Parque", "Aeroporto", "Estação", "Estrada", "Ponte", "Casa", "Prédio",
  "Hotel", "Farmácia", "Biblioteca", "Museu", "Jardim", "Campo", "Fazenda", "Escritório", "Fábrica", "Garagem",
  "Carro", "Moto", "Avião", "Navio", "Comboio", "Autocarro", "Helicóptero", "Camião", "Ambulância", "Trator",
  "Semáforo", "Placa de trânsito", "Rua", "Bairro", "Cidade", "País", "Bandeira", "Dinheiro", "Moeda", "Cartão bancário",
  "Passaporte", "Bilhete", "Chuva", "Sol", "Lua", "Estrela", "Fogo", "Água", "Gelo", "Areia",
  "Pedra", "Árvore", "Flor", "Fruta", "Comida", "Pizza", "Hambúrguer", "Arroz", "Frango", "Chocolate",
  "Café", "Chá", "Música", "Filme", "Série", "Jogo", "Fotografia", "Festa", "Presente", "Casamento",
  "Aniversário", "Viagem", "Dinossauro", "Robô", "Foguete", "Astronauta", "Castelo", "Rei", "Rainha", "Pirata",
  "Dragão", "Tesouro", "Mistério", "Aventura", "Vitória", "Equipa", "Campeão", "Amizade", "Família", "Sorriso"
];

const everydayPool = Array.from(new Set(
  rawEverydayWords.map(w => w.trim()).filter(w => w.length > 0)
));

// Função Fisher-Yates para baralhar arrays
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Criar cópias baralhadas dos pools para puxar sequencialmente sem repetições consecutivas imediatas
let bibleDeck = shuffle([...biblePool]);
let maputoDeck = shuffle([...maputoNeighbourhoods]);
let everydayDeck = shuffle([...everydayPool]);

let bibleIdx = 0;
let maputoIdx = 0;
let everydayIdx = 0;

function pullBibleWord() {
  const word = bibleDeck[bibleIdx];
  bibleIdx = (bibleIdx + 1) % bibleDeck.length;
  // Re-baralhar ao dar a volta completa
  if (bibleIdx === 0) bibleDeck = shuffle([...biblePool]);
  return word;
}

function pullMaputoWord() {
  const word = maputoDeck[maputoIdx];
  maputoIdx = (maputoIdx + 1) % maputoDeck.length;
  if (maputoIdx === 0) maputoDeck = shuffle([...maputoNeighbourhoods]);
  return word;
}

function pullEverydayWord() {
  const word = everydayDeck[everydayIdx];
  everydayIdx = (everydayIdx + 1) % everydayDeck.length;
  if (everydayIdx === 0) everydayDeck = shuffle([...everydayPool]);
  return word;
}

// Gerar exatamente 570 cartas
const totalCards = 570;
const cardsList = [];

for (let i = 1; i <= totalCards; i++) {
  const cardWords = [];
  
  // Garantir unicidade dentro da própria carta de 5 palavras
  // 1. Puxar 2 palavras bíblicas únicas para a carta
  while (cardWords.length < 2) {
    const w = pullBibleWord();
    if (!cardWords.includes(w)) {
      cardWords.push(w);
    }
  }

  // 2. Puxar 1 palavra de geografia local (Bairros de Maputo)
  while (cardWords.length < 3) {
    const w = pullMaputoWord();
    if (!cardWords.includes(w)) {
      cardWords.push(w);
    }
  }

  // 3. Puxar 2 palavras do dia a dia
  while (cardWords.length < 5) {
    const w = pullEverydayWord();
    if (!cardWords.includes(w)) {
      cardWords.push(w);
    }
  }

  // Baralhar as 5 palavras da carta para misturar as posições
  shuffle(cardWords);

  cardsList.push({
    id: i,
    words: cardWords
  });
}

// Guardar o ficheiro final no caminho do workspace
const workspaceWordsJsonPath = "d:/Kelven/KaNet/Kelven System/kanet_diversoes/public/words.json";

fs.writeFileSync(workspaceWordsJsonPath, JSON.stringify(cardsList, null, 2), 'utf-8');
console.log(`✅ Sucesso! Geradas ${cardsList.length} cartas em ${workspaceWordsJsonPath}`);
console.log(`Cada carta contém: 2 TJ/Bíblia, 1 Bairro de Maputo, 2 Everyday Words.`);
console.log(`Amostra Carta 1:`, JSON.stringify(cardsList[0]));
console.log(`Amostra Carta 2:`, JSON.stringify(cardsList[1]));
console.log(`Total palavras TJ únicas: ${biblePool.length}`);
console.log(`Total bairros únicos: ${maputoNeighbourhoods.length}`);
console.log(`Total palavras do dia a dia únicas: ${everydayPool.length}`);
