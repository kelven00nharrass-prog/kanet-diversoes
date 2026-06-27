const fs = require('fs');
const path = require('path');

// 1. POOL DE PALAVRAS: BÍBLIA E RELIGIÃO (Mínimo de 1000 palavras para gerar 500 cartas com 2 palavras cada)
const bibleWords = [
  // Livros da Bíblia
  "Génesis", "Êxodo", "Levítico", "Números", "Deuteronómio", "Josué", "Juízes", "Rute", 
  "Primeiro de Samuel", "Segundo de Samuel", "Primeiro dos Reis", "Segundo dos Reis", 
  "Primeiro das Crónicas", "Segundo das Crónicas", "Esdras", "Neemias", "Ester", "Jó", 
  "Salmos", "Provérbios", "Eclesiastes", "Cântico de Salomão", "Isaías", "Jeremias", 
  "Lamentações", "Ezequiel", "Daniel", "Oseias", "Joel", "Amós", "Obadias", "Jonas", 
  "Miqueias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias", 
  "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "Primeira aos Coríntios", 
  "Segunda aos Coríntios", "Gálatas", "Efésios", "Filipenses", "Colossenses", 
  "Primeira aos Tessalonicenses", "Segunda aos Tessalonicenses", "Primeira a Timóteo", 
  "Segunda a Timóteo", "Tito", "Filémon", "Hebreus", "Tiago", "Primeira de Pedro", 
  "Segunda de Pedro", "Primeira de João", "Segunda de João", "Terceira de João", 
  "Judas", "Apocalipse",

  // Personagens Bíblicos, Reis, Profetas, Juízes, Apóstolos, Mulheres
  "Adão", "Eva", "Abel", "Caim", "Sete", "Enoque", "Noé", "Sem", "Cam", "Jafé",
  "Abraão", "Sara", "Lot", "Isaque", "Rebeca", "Jacob", "Lia", "Raquel", "Esaú", 
  "José", "Benjamim", "Judá", "Ruben", "Simeão", "Levi", "Dan", "Naftali", "Gad", 
  "Aser", "Issacar", "Zabulão", "Dina", "Potifar", "Moisés", "Arão", "Miriã", 
  "Zípora", "Jetro", "Josué", "Calebe", "Raabe", "Otniel", "Eude", "Sangar", 
  "Débora", "Baraque", "Gideão", "Abimeleque", "Tola", "Jair", "Jefté", "Ibçã", 
  "Elom", "Abdom", "Sansão", "Dalila", "Eli", "Samuel", "Ana", "Elcana", "Saul", 
  "Jónatas", "David", "Goliás", "Mical", "Abigail", "Bate-Seba", "Salomão", 
  "Roboão", "Jeroboão", "Asa", "Josafá", "Acabe", "Jezabel", "Elias", "Eliseu", 
  "Naamã", "Jeú", "Senaqueribe", "Ezequias", "Josias", "Nabucondonosor", "Ciro", 
  "Dário", "Artaxerxes", "Esdras", "Neemias", "Ester", "Mordecai", "Hamã", "Jó", 
  "Elifaz", "Bildade", "Zofar", "Eliú", "Isaías", "Jeremias", "Baruque", 
  "Ezequiel", "Daniel", "Sadraque", "Mesaque", "Abedego", "Belsazar", "Dário", 
  "Oseias", "Joel", "Amós", "Obadias", "Jonas", "Miqueias", "Naum", "Habacuque", 
  "Sofonias", "Ageu", "Zacarias", "Malaquias", "Zacarias", "Isabel", 
  "João Batista", "Maria", "José", "Jesus", "Simeão", "Ana a Profetisa", "Pedro", 
  "André", "Tiago", "João", "Filipe", "Bartolomeu", "Mateus", "Tomé", "Tiago de Alfeu", 
  "Tadeu", "Simão o Zelote", "Judas Iscariotes", "Matias", "Paulo", "Barnabé", 
  "Marcos", "Lucas", "Timóteo", "Tito", "Silas", "Apolo", "Áquila", "Priscila", 
  "Lídia", "Tabita", "Dorcás", "Cornélio", "Estêvão", "Filipe o Evangelizador", 
  "Félix", "Festo", "Agripa", "César", "Fileto", "Himeneu", "Alexandre", "Demas", 
  "Diótrefes", "Gaius", "Filemon", "Onésimo", "Epafrodito", "Tíquico", "Aristarco",

  // Lugares Bíblicos, Montanhas, Rios
  "Éden", "Ararate", "Ur", "Harã", "Canaã", "Siquém", "Betel", "Hebrom", "Egipto", 
  "Mar Vermelho", "Sinai", "Horebe", "Cades-Barneia", "Moabe", "Jordão", "Jericó", 
  "Ai", "Siló", "Belém", "Jerusalém", "Sião", "Sodoma", "Gomorra", "Babilónia", 
  "Nínive", "Nilo", "Eufrates", "Tigre", "Gaza", "Damasco", "Tiro", "Sidom", 
  "Samaria", "Monte Carmelo", "Monte Tabor", "Monte Hermom", "Monte das Oliveiras", 
  "Golgota", "Getsemani", "Nazaré", "Galileia", "Rio Jordão", "Mar da Galileia", 
  "Mar Morto", "Cafarnaum", "Caná", "Jope", "Cesareia", "Antioquia", "Tarsos", 
  "Damasco", "Éfeso", "Filipos", "Tessalónica", "Atenas", "Corinto", "Roma", 
  "Patmos", "Malta", "Colossos", "Laodiceia", "Sardes", "Filadélfia", "Pérgamo", 
  "Tiatira", "Esmirna", "Armagedon",

  // Histórias Bíblicas, Parábolas, Milagres, Profecias, Objetos, Povos, Anjos
  "Dilúvio", "Arca de Noé", "Torre de Babel", "Arco-Íris", "Sarça Ardente", 
  "Dez Pragas", "Páscoa", "Maná", "Tábua das Leis", "Tabernáculo", "Arca da Aliança", 
  "Templo de Salomão", "Bezerro de Ouro", "Muralhas de Jericó", "Lã de Gideão", 
  "Cabelo de Sansão", "Funda de David", "Harpa de David", "Carruagem de Fogo", 
  "Cova dos Leões", "Fornalha Ardente", "Estrela de Belém", "Manjedoura", 
  "Batismo de Jesus", "Tentação no Deserto", "Água em Vinho", "Multiplicação dos Pães", 
  "Caminhar sobre a Água", "Pesca Maravilhosa", "Parábola do Semeador", 
  "Bom Samaritano", "Filho Pródigo", "Ovelha Perdida", "Trigo e Joio", 
  "Dez Virgens", "Talentos", "Última Ceia", "Coroa de Espinhos", "Ressurreição", 
  "Ascensão", "Pentecostes", "Visão de Pedro", "Caminho de Damasco", 
  "Nova Jerusalém", "Querubim", "Serafim", "Arcanjo Miguel", "Anjo Gabriel", 
  "Filisteus", "Amalequitas", "Cananeus", "Egípcios", "Babilónios", "Romanos", 
  "Persas", "Gregos", "Assírios", "Fariseus", "Saduceus", "Escribas", "Sinédrio", 
  "Sábado", "Dízimo", "Incenso", "Mirra", "Ouro", "Azeite", "Trigo", "Cevada", 
  "Videira", "Figueira", "Mostarda", "Cordeiro Pascal", "Pão Asmo",

  // Meu Livro de Histórias Bíblicas (Temas/Histórias)
  "Criação da Terra", "Belo Jardim", "Primeiro Lar", "Porquê Envelhecer", 
  "Homem Mau", "Gigantes na Terra", "Grande Barco", "Nova Vida", 
  "Grande Torre", "Amigo de Deus", "Promessa de Deus", "Destruição de Cidades", 
  "Mulher de Lot", "Teste de Abraão", "Esposa para Isaque", "Gémeos Diferentes", 
  "Jacob em Harã", "Grande Família", "Jacob viaja", "Sonhos de José", 
  "José vendido", "José na prisão", "Sonhos do Faraó", "José governa", 
  "Família unida", "Trabalho duro", "Bebé no cesto", "Moisés foge", 
  "Sarça que arde", "Voz no Sinai", "Pragas no Egipto", "Travessia do Mar", 
  "Comida do Céu", "Dez Mandamentos", "Bezerro infiel", "Tenda de Adoração", 
  "Doze Espias", "Vara de Arão", "Serpente de Cobre", "Jumenta de Balaão", 
  "Josué comanda", "Queda de Jericó", "Roubo de Acã", "Gideão vence", 
  "Sansão o forte", "Rute e Noemi", "Ana pede um filho", "Samuel no templo", 
  "Saul o primeiro rei", "David e Golias", "David foge", "David coroado", 
  "Sabedoria de Salomão", "Templo construído", "Reino dividido", "Jezabel a má", 
  "Elias e os profetas", "Eliseu e os milagres", "Jonas e o grande peixe", 
  "Promessa de Isaías", "Daniel na cova", "Três hebreus salvos", "Ester salva o povo", 
  "Neemias reconstrói", "Anjo visita Maria", "Nascimento em Belém", "Jesus no templo", 
  "Batismo no Jordão", "Jesus escolhe apóstolos", "Sermão do Monte", 
  "Jesus cura doentes", "Ressurreição de Lázaro", "Entrada em Jerusalém", 
  "Traição de Judas", "Morte na estaca", "Túmulo vazio", "Jesus aparece", 
  "Regresso ao Céu", "Pentecostes em Jerusalém", "Paulo viaja", "Caminho de Damasco", 
  "Visão de João", "Paraíso na Terra",

  // Imite a Sua Fé (Temas / Ensinos)
  "Imite a Sua Fé", "Fé de Abel", "Enoque andou com Deus", "Noé construiu", 
  "Abraão obedeceu", "Sara esperou", "Rute escolheu", "Samuel ouviu", 
  "David confiou", "Elias orou", "Ester arriscou", "Jonas aprendeu", 
  "Pedro arrependeu-se", "Maria aceitou", "Marta serviu", "José protegeu", 
  "Rute e a lealdade", "Ester e a coragem", "Jonas e a misericórdia", 
  "David e o perdão", "Abigail e a prudência", "Débora e o encorajamento", 
  "Noemi e o consolo", "Ana e a perseverança", "Josias e a retidão",

  // Vídeos Infantis (Pedro e Sofia) & Qualidades
  "Pedro e Sofia", "Sofia aprende a partilhar", "Pedro diz a verdade", 
  "Oração diária", "Obediência aos pais", "Escutar nas reuniões", 
  "Amigos na escola", "Honestidade nos testes", "Ajudar nas limpezas", 
  "Respeito pelos mais velhos", "Boas maneiras", "Não ser egoísta", 
  "Perdoar o amigo", "Pregação com os pais", "Estudo em família", 
  "Fazer as pazes", "Dar graças", "Pedir desculpa", "Ajudar os necessitados", 
  "Proteger a criação",

  // Cânticos (Temas de Adoração)
  "Cantemos de Coração", "Novo Cântico", "Reino de Jeová", "Pregação Pública", 
  "Esperança da Ressurreição", "Amor Fraternal", "Fé Inabalável", "Lealdade Cristã", 
  "Estudo Pessoal", "Oração de Agradecimento", "Paz Mental", "Alegria da Colheita", 
  "Perseverança nas Provações", "Resgate de Cristo", "Criação Louva", 
  "Luz na Escuridão", "Nome de Deus", "Santidade", "Betel a nossa casa", 
  "Trabalho voluntário", "União de irmãos", "Encargo do Reino", "Fidelidade", 
  "Bons Amigos", "Marcha do Reino",

  // História das Testemunhas de Jeová / Datas / Organização
  "Betel", "Estudantes da Bíblia", "Nome Testemunhas de Jeová", 
  "Tradução do Novo Mundo", "Anuário", "Revista Sentinela", "Despertai!", 
  "Congressos de Distrito", "Assembleias de Circuito", "Visita do Superintendente", 
  "Corpo Governante", "Comissão de Filial", "Pioneiro Regular", "Pioneiro Auxiliar", 
  "Betelita", "Missionário", "Escola de Gileade", "Carrinhos de Testemunho", 
  "Salão do Reino", "Salão de Assembleias", "Estudo de Livro", "Reunião de Fim de Semana", 
  "Reunião de Meio de Semana", "Vida e Ministério", "Discurso Público", 
  "Ministério de Casa em Casa", "Testemunho Informal", "Cartas de Testemunho", 
  "Estudos Bíblicos", "Revisitas", "Folhetos", "Brochuras", "Tratados", 
  "Campanhas Especiais", "Memorial da Morte", "Comemoração", "Santa Ceia", 
  "1914", "1919", "1931", "1942", "1975", "2013", "Charles Russell", 
  "Joseph Rutherford", "Nathan Knorr", "Fred Franz", "Brooklyn", "Warwick", 
  "Patterson", "Wallkill", "Perseguição na Alemanha", "Triângulo Roxo", 
  "Perseguição na Rússia", "Bandeira de Malawi", "Obra Proibida", "Trabalho Clandestino", 
  "Bíblias em miniatura", "Estação de Rádio WBBR", "Foto-Drama da Criação", 
  "Declaração de Factos", "Resolução de Columbus", "Adopção do Nome", 
  "Escola do Ministério Teocrático", "Escola de Pioneiros", "Escola para Evangelizadores", 
  "JW Broadcasting", "JW Library", "Língua de Sinais", "Braille", 
  "Comissão de Redação", "Comissão de Ensino", "Comissão de Pessoal", 
  "Comissão de Editores", "Comissão de Coordenadores", "Departamento de Tradução", 
  "Serviço de Informação sobre Hospitais", "Comissões de Ligação com Hospitais", 
  "Ajuda em Desastres", "Construção de Salões", "Design e Construção Local", 
  "Voluntários de Salão", "Servos Ministeriais", "Anciãos", "Corpo de Anciãos", 
  "Presidente da Reunião", "Leitor da Sentinela", "Dirigente do Estudo", 
  "Indicador", "Operador de Som", "Operador de Vídeo", "Microfonista", 
  "Limpeza do Salão", "Manutenção do Salão", "Território de Pregação", 
  "Cartão de Território", "Relatório de Serviço", "Pessoas Interessadas", 
  "Nova Luz", "Entendimento Clarificado", "Grande multidão", "Pequeno rebanho", 
  "Ungidos", "Outras ovelhas", "Governo do Reino", "Milénio", "Juízo Final", 
  "Paraíso Restaurado", "Soberania de Jeová", "Resposta a Satanás", 
  "Integridade", "Neutralidade Cristã", "Recusa de Sangue", "Alternativas Médicas", 
  "Tribunais e Defesa Legal", "Supremo Tribunal", "Liberdade de Adoração", 
  "Direitos Humanos", "Associação Internacional", "Selo da Sociedade", 
  "Torre de Vigia de Sião", "Watchtower", "Sociedade Torre de Vigia", 
  "Associação das Testemunhas", "Edificações de Filiais", "Gráficas de Betel", 
  "Produção de Bíblias", "Distribuição Gratuita", "Donativos Voluntários"
];

// 2. POOL DE PALAVRAS: GEOGRAFIA (Moçambique & Mundial) - Mínimo de 500 palavras
const geographyWords = [
  // Moçambique: Províncias
  "Maputo", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", 
  "Cabo Delgado", "Niassa",

  // Moçambique: Distritos, Cidades, Vilas e Localidades
  "Matola", "Beira", "Chimoio", "Quelimane", "Tete Cidade", "Pemba", "Lichinga", 
  "Xai-Xai", "Maxixe", "Inhambane Cidade", "Nacala", "Angoche", "Mocuba", "Gurúè", 
  "Chokwé", "Chibuto", "Manjacaze", "Bilene", "Macia", "Zandamela", "Quissico", 
  "Inharrime", "Homoíne", "Morrumbene", "Massinga", "Vilankulo", "Inhassoro", 
  "Mambone", "Buzi", "Dondo", "Nhamatanda", "Gorongosa", "Caia", "Marromeu", 
  "Sussundenga", "Manica Vila", "Gondola", "Catandica", "Moatize", "Songo", 
  "Changara", "Mutarara", "Chinde", "Inhassunge", "Nicoadala", "Namacurra", 
  "Maganja da Costa", "Pebane", "Alto Molócuè", "Milange", "Moma", "Angoche Cidade", 
  "Liúpo", "Mogovolas", "Meconta", "Monapo", "Ilha de Moçambique", "Mossuril", 
  "Nacala-a-Velha", "Memba", "Eráti", "Namapa", "Ribáuè", "Malema", "Lalaua", 
  "Montepuez", "Chiúre", "Balama", "Namuno", "Ancuabe", "Quissanga", "Mocímboa da Praia", 
  "Palma", "Mueda", "Nangade", "Cuamba", "Mandimba", "Marrupa", "Metangula", 
  "Mecanhelas", "Maua", "Nipepe", "Boane", "Namaacha", "Manhiça", "Marracuene", 
  "Moamba", "Matutuíne", "Magude", "Xinavane",

  // Moçambique: Bairros Famosos (Maputo, Matola, Beira, etc.)
  "Polana", "Chamanculo", "Maxaquene", "Mafalala", "Costa do Sol", "Sommerschield", 
  "Aeroporto", "Malhangalene", "Alto Maé", "Central", "Coop", "Caramujo", 
  "Munhuana", "Bairro do Porto", "Choupal", "Urbanização", "Bairro FPLM", "Inhagoia", 
  "Zimpeto", "Magoanine", "Hulene", "Bairro da Manga", "Macurungo", "Chaimite", 
  "Pontagêa", "Esturro", "Munhava", "Inhamízua", "Matola A", "Matola F", 
  "T3", "Liberdade", "Fomento", "Belo Horizonte", "Juba",

  // Moçambique: Rios, Lagos, Ilhas, Parques
  "Rio Rovuma", "Rio Zambeze", "Rio Limpopo", "Rio Save", "Rio Incomati", "Rio Umbeluzi", 
  "Rio Lúrio", "Rio Licungo", "Rio Púnguè", "Rio Búzi", "Lago Niassa", "Lagoa Bilene", 
  "Barragem de Cahora Bassa", "Parque Nacional da Gorongosa", "Reserva Especial de Maputo", 
  "Parque Nacional do Limpopo", "Parque Nacional de Bazaruto", "Parque Nacional das Quirimbas", 
  "Reserva de Niassa", "Ilha da Inhaca", "Ilha de Moçambique", "Ilha do Bazaruto", 
  "Ilha da Benguerra", "Ilha de Santa Carolina", "Arquipélago das Quirimbas", 
  "Ponta do Ouro", "Ponta Mamoli", "Cabo das Correntes",

  // Geografia Mundial: Países
  "Portugal", "Brasil", "Angola", "Cabo Verde", "Guiné-Bissau", "São Tomé e Príncipe", 
  "Timor-Leste", "Espanha", "França", "Itália", "Alemanha", "Inglaterra", 
  "África do Sul", "Zimbabwe", "Malawi", "Zâmbia", "Tanzânia", "Swazilândia", 
  "Quénia", "Nigéria", "Egipto", "Marrocos", "Senegal", "Gana", "EUA", 
  "Canadá", "México", "Argentina", "Colômbia", "Chile", "Peru", "China", 
  "Japão", "Índia", "Coreia do Sul", "Rússia", "Austrália", "Nova Zelândia", 
  "Turquia", "Grécia", "Holanda", "Bélgica", "Suíça", "Áustria", "Suécia", 
  "Noruega", "Finlândia", "Dinamarca", "Irlanda", "Polónia",

  // Geografia Mundial: Capitais
  "Lisboa", "Brasília", "Luanda", "Praia", "Bissau", "São Tomé Cidade", "Dili", 
  "Madrid", "Paris", "Roma", "Berlim", "Londres", "Pretória", "Harare", 
  "Lilongwe", "Lusaka", "Dodoma", "Mbabane", "Nairobi", "Abuja", "Cairo", 
  "Rabat", "Dakar", "Accra", "Washington", "Ottawa", "Cidade do México", 
  "Buenos Aires", "Bogotá", "Santiago", "Lima", "Pequim", "Tóquio", "Nova Deli", 
  "Seul", "Moscovo", "Camberra", "Wellington", "Ancara", "Atenas", "Amesterdão", 
  "Bruxelas", "Berna", "Viena", "Estocolmo", "Oslo", "Helsínquia", "Copenhaga", 
  "Dublin", "Varsóvia",

  // Geografia Mundial: Continentes, Oceanos, Outros
  "África", "Europa", "Ásia", "América do Norte", "América do Sul", "Oceânia", 
  "Antártida", "Oceano Índico", "Oceano Atlântico", "Oceano Pacífico", 
  "Oceano Ártico", "Mar Mediterrâneo", "Mar Vermelho", "Mar das Caraíbas", 
  "Deserto do Sara", "Deserto do Kalahari", "Montanhas dos Himalaias", "Monte Evereste", 
  "Monte Kilimanjaro", "Rio Amazonas", "Rio Nilo", "Rio Mississippi", 
  "Bandeira de Portugal", "Bandeira de Moçambique", "Bandeira do Brasil", 
  "Linha do Equador", "Trópico de Capricórnio", "Trópico de Câncer"
];

// 3. POOL DE PALAVRAS: NATUREZA E ANIMAIS (Mínimo de 500 palavras)
const natureAnimalsWords = [
  // Mamíferos
  "Leão", "Elefante", "Zebra", "Girafa", "Hipopótamo", "Leopardo", "Chita", "Hiena", 
  "Rinoceronte", "Búfalo", "Antílope", "Impala", "Gnu", "Cudo", "Facocero", 
  "Chimpanzé", "Gorila", "Babuíno", "Macaco", "Urso", "Urso Polar", "Panda", 
  "Tigre", "Lobo", "Raposa", "Chacal", "Cachorro", "Gato", "Leão Marinho", 
  "Foca", "Lontra", "Castor", "Esquilo", "Coelho", "Lebre", "Rato", "Morcego", 
  "Preguiça", "Tamanduá", "Armadilho", "Canguru", "Coala", "Ornitorrinco", 
  "Golfinho", "Baleia", "Baleia Azul", "Orca", "Tubarão", "Cavalo", "Burro", 
  "Zebra", "Porco", "Vaca", "Touro", "Boi", "Ovelha", "Cabra", "Veado", 
  "Cervo", "Camelo", "Dromedário", "Lama", "Alpaca",

  // Aves
  "Águia", "Falcão", "Gavião", "Coruja", "Mocho", "Corvo", "Pombo", "Rola", 
  "Andorinha", "Pardal", "Canário", "Rouxinol", "Papagaio", "Periquito", 
  "Arara", "Tucano", "Cegonha", "Garça", "Flamingo", "Pelicano", "Gaivota", 
  "Albatroz", "Pato", "Ganso", "Cisne", "Galinha", "Galo", "Peru", 
  "Faisão", "Pavão", "Avestruz", "Ema", "Pinguim", "Colibri", "Beija-flor", 
  "Pica-pau", "Martim-pescador", "Cordoniz",

  // Répteis e Anfíbios
  "Crocodilo", "Aligator", "Jacaré", "Tartaruga", "Cágado", "Cágado-terrestre", 
  "Camaleão", "Iguana", "Lagarto", "Melga", "Lagartixa", "Serpente", 
  "Cobra", "Jiboia", "Anaconda", "Cascavel", "Cobra-coral", "Víbora", 
  "Sapo", "Rã", "Salamandra", "Tritão",

  // Peixes e Animais Marinhos
  "Tubarão Branco", "Tubarão Martelo", "Raia", "Manta", "Atum", "Bacalhau", 
  "Salmão", "Sardinha", "Carapau", "Pescada", "Peixe Palhaço", "Cavalo Marinho", 
  "Estrela do Mar", "Ouriço do Mar", "Medusa", "Água-viva", "Polvo", "Lula", 
  "Caranguejo", "Lagosta", "Camarão", "Amêijoa", "Mexilhão", "Ostra", 
  "Coral", "Esponja Marinha",

  // Insetos e Aracnídeos
  "Abelha", "Vespa", "Formiga", "Termita", "Borboleta", "Traça", "Mosca", 
  "Mosquito", "Melga", "Gafanhoto", "Grilo", "Louva-a-deus", "Escaravelho", 
  "Joaninha", "Barata", "Pulga", "Piolho", "Percevejo", "Centopeia", 
  "Aranha", "Tarântula", "Escorpião", "Carrapato",

  // Árvores e Plantas
  "Eucalipto", "Pinheiro", "Oliveira", "Palmeira", "Acácia", "Embondeiro", 
  "Mafurreira", "Mangueira", "Coqueiro", "Sobreiro", "Carvalho", "Choupana", 
  "Bambu", "Videira", "Mostarda", "Trigo", "Cevada", "Milho", "Arroz", 
  "Algodoeiro", "Cana-de-açúcar", "Caféeiro", "Chazeiro", "Cacau", 
  "Roseira", "Margarida", "Orquídea", "Girassol", "Lírio", "Cravo", 
  "Tulipa", "Jasmim", "Hera", "Feto", "Musgo", "Cacto", "Aloe Vera",

  // Frutas e Legumes
  "Manga", "Banana", "Laranja", "Limão", "Tangerina", "Papaia", "Ananás", 
  "Abacate", "Coco", "Goiaba", "Maçã", "Pera", "Pêssego", "Ameixa", 
  "Uva", "Melancia", "Melão", "Morango", "Framboesa", "Amora", "Figo", 
  "Tomate", "Batata", "Batata-doce", "Mandioca", "Cenoura", "Cebola", 
  "Alho", "Repolho", "Alface", "Espinafre", "Abóbora", "Feijão", "Ervilha", 
  "Pimento", "Pepino",

  // Minerais e Elementos Naturais
  "Ouro", "Prata", "Cobre", "Ferro", "Bronze", "Diamante", "Rubi", "Esmeralda", 
  "Quartzo", "Carvão", "Petróleo", "Areia", "Argila", "Pedra", "Cristal", 
  "Sal", "Enxofre", "Mármore", "Granito", "Água", "Fogo", "Vento", "Terra", 
  "Ar", "Nuvem", "Chuva", "Neve", "Gelo", "Relâmpago", "Trovão"
];

// 4. POOL DE PALAVRAS: NOMES, OBJETOS E PROFISSÕES (Mínimo de 500 palavras)
const generalWords = [
  // Nomes Próprios Femininos (A a Z)
  "Ana", "Amélia", "Alice", "Beatriz", "Bárbara", "Bruna", "Carla", "Catarina", 
  "Camila", "Daniela", "Diana", "Débora", "Elena", "Elisa", "Ester", 
  "Fernanda", "Filipa", "Fátima", "Gabriela", "Glória", "Gisela", "Helena", 
  "Inês", "Isabel", "Irene", "Joana", "Júlia", "Jessica", "Katya", 
  "Luísa", "Lúcia", "Lara", "Maria", "Marta", "Mariana", "Nádia", 
  "Natália", "Neuza", "Olívia", "Otília", "Patrícia", "Paula", "Pamela", 
  "Rosa", "Rita", "Raquel", "Sara", "Sílvia", "Sofia", "Teresa", 
  "Tatiana", "Telma", "Vanessa", "Vera", "Vitória", "Yasmin", "Zélia", 
  "Zuraida",

  // Nomes Próprios Masculinos (A a Z)
  "António", "Alberto", "Augusto", "Alfredo", "Bruno", "Bernardo", "Bento", 
  "Carlos", "Cláudio", "César", "Daniel", "David", "Duarte", "Eduardo", 
  "Edson", "Elísio", "Fernando", "Filipe", "Francisco", "Gabriel", "Guilherme", 
  "Gonçalo", "Hélder", "Hugo", "Henrique", "Igor", "Inácio", "Ivo", 
  "João", "José", "Jorge", "Júlio", "Kelven", "Kevin", "Luis", 
  "Lucas", "Leonel", "Manuel", "Mário", "Miguel", "Nuno", "Nelson", 
  "Newton", "Orlando", "Óscar", "Otávio", "Pedro", "Paulo", "Patrício", 
  "Rui", "Ricardo", "Rafael", "Samuel", "Sérgio", "Sandro", "Tiago", 
  "Tomás", "Tito", "Válter", "Vasco", "Victor", "William", "Wilson", 
  "Xavier", "Yuri", "Zacarias",

  // Objetos: Ferramentas
  "Martelo", "Alicate", "Chave de Fendas", "Serrote", "Berbequim", "Parafuso", 
  "Prego", "Martelo Elétrico", "Nível de Bolha", "Metro de Carpinteiro", "Fita Métrica", 
  "Chave Inglesa", "Lima", "Tesoura de Poda", "Enxada", "Pá", "Rake", "Vassoura", 
  "Carrinho de Mão", "Escada", "Corda", "Fio de Prumo",

  // Objetos: Móveis e Decoração
  "Sofá", "Cama", "Mesa de Jantar", "Cadeira", "Poltrona", "Roupeiro", "Armário", 
  "Estante", "Cómoda", "Mesa de Cabeceira", "Espelho", "Tapete", "Cortina", 
  "Almofada", "Quadro", "Relógio de Parede", "Abajur", "Lustre", "Vaso",

  // Objetos: Cozinha
  "Prato", "Copo", "Chávena", "Garfo", "Faca", "Colher", "Panela", "Frigideira", 
  "Tábua de Cortar", "Forno", "Fogão", "Micro-ondas", "Frigorífico", "Congelador", 
  "Torradeira", "Chaleira", "Liquidificador", "Batedeira", "Máquina de Café", 
  "Lava-louça", "Esponja", "Pano de Prato", "Ralador", "Abridor de Garrafas",

  // Objetos: Escritório, Escola e Papelaria
  "Caneta", "Lápis", "Borracha", "Afia-lápis", "Régua", "Caderno", "Livro", 
  "Estojo", "Mochila", "Dossiê", "Grampeador", "Clips", "Tesoura", 
  "Fita Adesiva", "Calculadora", "Quadro Branco", "Marcador", "Papel A4", 
  "Envelope", "Agenda",

  // Objetos: Tecnologia e Eletrónicos
  "Computador", "Portátil", "Telemóvel", "Smartphone", "Tablet", "Rato", 
  "Teclado", "Monitor", "Impressora", "Auscultadores", "Auriculares", 
  "Coluna de Som", "Televisão", "Comando", "Projetor", "Câmara Fotográfica", 
  "Carregador", "Cabo USB", "Router Wi-Fi", "Consola de Jogos", "Disco Externo", 
  "Pen Drive",

  // Profissões
  "Médico", "Enfermeiro", "Dentista", "Farmacêutico", "Fisioterapeuta", 
  "Veterinário", "Professor", "Educador", "Diretor", "Advogado", 
  "Juiz", "Procurador", "Polícia", "Bombeiro", "Militar", "Segurança", 
  "Engenheiro", "Engenheiro Civil", "Arquiteto", "Carpinteiro", "Mecânico", 
  "Eletricista", "Pintor", "Serralheiro", "Pedreiro", "Canalizador", 
  "Cozinheiro", "Padeiro", "Pasteleiro", "Garçom", "Barman", "Recepcionista", 
  "Secretário", "Contabilista", "Administrador", "Gerente", "Vendedor", 
  "Caixa", "Repartidor", "Motorista", "Taxista", "Piloto de Avião", 
  "Comissário de Bordo", "Maquinista", "Marinheiro", "Jornalista", "Repórter", 
  "Fotógrafo", "Escritor", "Poeta", "Designer", "Programador", "Informático", 
  "Cientista", "Investigador", "Astrónomo", "Artista", "Ator", "Cantor", 
  "Músico", "Dançarino", "Pintor Artístico", "Escultor", "Alfaiate", 
  "Costureira", "Barbeiro", "Cabeleireiro", "Esteticista", "Jardineiro", 
  "Agricultor", "Pescador"
];

// FUNÇÃO PARA BARALHAR UM ARRAY (Fisher-Yates Shuffle)
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

// GARANTIR QUE NÃO TEMOS DUPLICADOS NAS NOSSAS FONTES
const uniqueBible = [...new Set(bibleWords)];
const uniqueGeography = [...new Set(geographyWords)];
const uniqueNature = [...new Set(natureAnimalsWords)];
const uniqueGeneral = [...new Set(generalWords)];

console.log(`Palavras únicas carregadas:`);
console.log(`- Bíblia/Religião: ${uniqueBible.length}`);
console.log(`- Geografia: ${uniqueGeography.length}`);
console.log(`- Natureza/Animais: ${natureNatureCount = uniqueNature.length}`);
console.log(`- Geral (Nomes, Obj, Prof): ${uniqueGeneral.length}`);

// Baralhar todas as listas antes de gerar as cartas
shuffle(uniqueBible);
shuffle(uniqueGeography);
shuffle(uniqueNature);
shuffle(uniqueGeneral);

// CRIAR CARTAS
// Cada carta terá 5 palavras no total:
// - 2 palavras de Bíblia/Religião (Garante forte representação bíblica e JW)
// - 1 palavra de Geografia (Moçambique ou Mundial)
// - 1 palavra de Natureza/Animais
// - 1 palavra Geral (Nome próprio, Objeto ou Profissão)
//
// Para 500 cartas precisaremos de:
// - 1000 palavras bíblicas
// - 500 geográficas
// - 500 de natureza/animais
// - 500 gerais

const totalCards = 520; // Geramos 520 cartas para estar acima de 500
const cards = [];

let bibleIndex = 0;
let geoIndex = 0;
let natureIndex = 0;
let generalIndex = 0;

for (let i = 1; i <= totalCards; i++) {
  const cardWords = [];
  
  // 1. Pegar 2 palavras bíblicas (reutiliza se acabar o pool)
  for (let b = 0; b < 2; b++) {
    cardWords.push(uniqueBible[bibleIndex]);
    bibleIndex = (bibleIndex + 1) % uniqueBible.length;
  }
  
  // 2. Pegar 1 geográfica
  cardWords.push(uniqueGeography[geoIndex]);
  geoIndex = (geoIndex + 1) % uniqueGeography.length;
  
  // 3. Pegar 1 de natureza
  cardWords.push(uniqueNature[natureIndex]);
  natureIndex = (natureIndex + 1) % uniqueNature.length;
  
  // 4. Pegar 1 geral
  cardWords.push(uniqueGeneral[generalIndex]);
  generalIndex = (generalIndex + 1) % uniqueGeneral.length;
  
  // Baralhar as 5 palavras da carta para que a posição das palavras bíblicas, geográficas etc. não seja previsível
  shuffle(cardWords);
  
  cards.push({
    id: i,
    words: cardWords
  });
}

// Salvar as cartas geradas na pasta public/words.json
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.join(publicDir, 'words.json');
fs.writeFileSync(outputPath, JSON.stringify(cards, null, 2), 'utf-8');

console.log(`\nSucesso! Geradas ${cards.length} cartas misturadas em ${outputPath}.`);
console.log(`Cada carta contém 5 palavras combinadas de forma aleatória e equilibrada.`);
console.log(`Exemplo da Carta 1: ${JSON.stringify(cards[0].words)}`);
console.log(`Exemplo da Carta 2: ${JSON.stringify(cards[1].words)}`);
