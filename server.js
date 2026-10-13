const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const os = require('os');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'public')));

// Estado global dos jogos (Salas)
// Chave: roomId (ex: A8D7F), Valor: objeto da sala
const rooms = new Map();

// Carregar palavras do JSON
let cardDeck = [];
try {
  const wordsData = fs.readFileSync(path.join(__dirname, 'public', 'words.json'), 'utf-8');
  cardDeck = JSON.parse(wordsData);
  console.log(`Carregadas ${cardDeck.length} cartas do banco de palavras.`);
} catch (err) {
  console.error("Erro ao carregar words.json:", err);
}

// ── Registo global de cartas jogadas nas últimas 24h ──────────────────────────
// Chave: cardId (number), Valor: timestamp (ms) da última vez que foi jogada
const usedCardLog = new Map();
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

/** Remove do registo cartas jogadas há mais de 24h. */
function purgeOldCards() {
  const now = Date.now();
  for (const [cardId, ts] of usedCardLog) {
    if (now - ts > TWENTY_FOUR_HOURS) usedCardLog.delete(cardId);
  }
}

/** Devolve true se a carta já foi jogada nas últimas 24h em qualquer sala. */
function isCardUsedRecently(cardId) {
  const ts = usedCardLog.get(cardId);
  if (!ts) return false;
  return (Date.now() - ts) < TWENTY_FOUR_HOURS;
}

/** Marca uma carta como jogada agora. */
function logCardUsed(cardId) {
  usedCardLog.set(cardId, Date.now());
}
// ─────────────────────────────────────────────────────────────────────────────

// Auxiliar para gerar código de sala aleatório (5 caracteres)
function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sem O, I, 0, 1 para evitar confusão
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Obter os IPs locais da máquina
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }
  return addresses;
}

// WebSocket: Gerir conexões
wss.on('connection', (ws) => {
  ws.roomId = null;
  ws.role = 'spectator';
  ws.playerName = 'Espectador';
  ws.team = '';

  let userSession = {
    roomId: null,
    playerName: null,
    role: null, // 'host', 'tv', 'player', 'spectator'
    team: null  // 'Azul', 'Vermelho', 'Verde', 'Amarelo'
  };

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const { type, payload } = data;

      switch (type) {
        case 'CREATE_ROOM':
          handleCreateRoom(ws);
          break;

        case 'JOIN_ROOM':
          handleJoinRoom(ws, payload);
          break;

        case 'UPDATE_TEAMS':
          handleUpdateTeams(ws, payload);
          break;

        case 'START_GAME':
          handleStartGame(ws);
          break;

        case 'ROLL_DICE':
          handleRollDice(ws);
          break;

        case 'START_ROUND':
          handleStartRound(ws);
          break;

        case 'TOGGLE_WORD':
          handleToggleWord(ws, payload);
          break;

        case 'END_ROUND_EARLY':
          handleEndRoundEarly(ws);
          break;

        case 'CONFIRM_ROUND_SCORE':
          handleConfirmRoundScore(ws);
          break;

        case 'RESET_GAME':
          handleResetGame(ws);
          break;

        case 'HEARTBEAT':
          // Apenas manter a conexão viva
          ws.send(JSON.stringify({ type: 'PONG' }));
          break;
      }
    } catch (err) {
      console.error("Erro no processamento da mensagem:", err);
    }
  });

  ws.on('close', () => {
    if (userSession.roomId) {
      const room = rooms.get(userSession.roomId);
      if (room) {
        // Remover o jogador ou marcar como inativo
        room.clients.delete(ws);
        
        // Se for o Host e não houver mais ninguém, ou se a sala ficar vazia
        if (room.clients.size === 0) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          rooms.delete(userSession.roomId);
          console.log(`Sala ${userSession.roomId} eliminada por inatividade.`);
        } else {
          // Atualizar lista de jogadores
          room.players = room.players.filter(p => p.name !== userSession.playerName || p.role === 'tv');
          // Se o desconectado era o host, designar um novo ou manter a sala aberta para reconexão
          broadcastRoomState(room);
        }
      }
    }
  });

  // Funções de manipulação dentro do escopo da conexão

  function handleCreateRoom(socket) {
    const roomId = generateRoomId();
    purgeOldCards();
    
    // Separar cartas que ainda não foram jogadas nas últimas 24h das já jogadas
    const unusedCards = [];
    const usedCards = [];
    cardDeck.forEach(c => {
      if (isCardUsedRecently(c.id)) {
        usedCards.push(c);
      } else {
        unusedCards.push(c);
      }
    });

    const shuffleArr = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    shuffleArr(unusedCards);
    shuffleArr(usedCards);

    // O baralho da sala coloca primeiro todas as cartas frescas/inéditas
    const roomDeck = [...unusedCards, ...usedCards];

    const room = {
      roomId: roomId,
      clients: new Set([socket]),
      deck: roomDeck,
      deckIndex: 0,
      usedDeck: [],
      players: [], // { name, team, role, active }
      gameState: {
        step: 'lobby', // 'lobby', 'setup', 'playing', 'score_recap', 'game_over'
        teams: {
          'Azul': { score: 0, players: [] },
          'Vermelho': { score: 0, players: [] },
          'Verde': { score: 0, players: [] },
          'Amarelo': { score: 0, players: [] }
        },
        teamOrder: ['Azul', 'Vermelho', 'Verde', 'Amarelo'],
        currentTeamIndex: 0,
        currentExplainerIndex: 0,
        targetScore: 30,  // Casas para ganhar
        useDice: true,    // true = com dado, false = apenas acertos
        namedMode: true,  // true = app escolhe explicador, false = equipa decide
        autoHost: true,   // true = Modo Anfitrião Automático (adversários validam)
        activeRound: {
          timer: 30,
          isTimerRunning: false,
          words: [], // 5 palavras da rodada
          correctWords: [false, false, false, false, false], // Estado dos acertos
          diceRoll: null,
          hasRolled: false
        },
        winner: null
      },
      timerInterval: null
    };

    rooms.set(roomId, room);
    const defaultHostTeam = 'Azul';
    userSession.roomId = roomId;
    userSession.role = 'host';
    userSession.playerName = 'Você (Anfitrião)';
    userSession.team = defaultHostTeam;

    socket.roomId = roomId;
    socket.role = 'host';
    socket.playerName = 'Você (Anfitrião)';
    socket.team = defaultHostTeam;

    // Registar o anfitrião na lista de jogadores da sua equipa
    room.players = [
      { name: 'Você (Anfitrião)', role: 'player', team: defaultHostTeam, active: true, isHost: true }
    ];

    socket.send(JSON.stringify({
      type: 'ROOM_CREATED',
      payload: {
        roomId: roomId,
        role: 'host',
        team: defaultHostTeam,
        gameState: room.gameState
      }
    }));
    
    console.log(`Sala criada: ${roomId}`);
  }

  function handleJoinRoom(socket, payload) {
    const { roomId, playerName, role, team } = payload;
    const cleanRoomId = roomId.trim().toUpperCase();
    const room = rooms.get(cleanRoomId);

    if (!room) {
      socket.send(JSON.stringify({ type: 'ERROR', payload: 'Sala não encontrada.' }));
      return;
    }

    userSession.roomId = cleanRoomId;
    userSession.role = role || 'player';
    userSession.team = team || 'Azul';

    // Auto-atribuir número sequencial se não tiver nome (modo sem nomes)
    let assignedName;
    if (role === 'tv') {
      assignedName = 'Ecrã Principal';
    } else if (playerName && playerName.trim()) {
      assignedName = playerName.trim();
    } else {
      // Usar contagem global para garantir nomes únicos e evitar colisões de busca
      const totalCount = room.players.filter(p => p.role !== 'tv').length;
      assignedName = `Membro ${totalCount + 1}`;
    }
    userSession.playerName = assignedName;

    socket.roomId = cleanRoomId;
    socket.playerName = assignedName;
    socket.role = userSession.role;
    socket.team = userSession.team;

    room.clients.add(socket);

    if (role === 'tv') {
      console.log(`Ecrã Principal conectado na sala ${cleanRoomId}`);
    } else {
      // Remover duplicados com o mesmo nome para evitar bugs de reconexão ou re-entrada
      room.players = room.players.filter(p => p.name !== assignedName);

      room.players.push({
        name: assignedName,
        role: userSession.role,
        team: userSession.team,
        active: true
      });
      console.log(`Jogador ${assignedName} entrou na sala ${cleanRoomId} na equipa ${userSession.team}`);
    }

    socket.send(JSON.stringify({
      type: 'JOINED_SUCCESS',
      payload: {
        roomId: cleanRoomId,
        role: userSession.role,
        playerName: assignedName,
        team: userSession.team
      }
    }));

    broadcastRoomState(room);
  }

  function handleUpdateTeams(socket, payload) {
    // Apenas o host ou os jogadores no lobby podem reorganizar
    const room = rooms.get(userSession.roomId);
    if (!room) return;

    const { players, teams, teamOrder, targetScore, useDice, namedMode, autoHost, hostTeam } = payload;
    
    if (hostTeam && userSession.role === 'host') {
      userSession.team = hostTeam;
      socket.team = hostTeam;
    }
    if (players) room.players = players;
    if (teams) room.gameState.teams = teams;
    if (teamOrder) room.gameState.teamOrder = teamOrder;
    if (targetScore) room.gameState.targetScore = parseInt(targetScore) || 30;
    if (typeof useDice !== 'undefined') room.gameState.useDice = useDice;
    if (typeof namedMode !== 'undefined') room.gameState.namedMode = namedMode;
    if (typeof autoHost !== 'undefined') room.gameState.autoHost = autoHost;

    broadcastRoomState(room);
  }

  function handleStartGame(socket) {
    const room = rooms.get(userSession.roomId);
    if (!room) return;
    if (userSession.role !== 'host' && !room.gameState.autoHost) return;

    // Atualizar equipas com base na lista de jogadores ativos
    // Resetar pontuações
    for (const t of room.gameState.teamOrder) {
      room.gameState.teams[t].score = 0;
      room.gameState.teams[t].stats = { totalCorrect: 0, roundsPlayed: 0 };
      room.gameState.teams[t].players = room.players
        .filter(p => p.team === t && p.role !== 'tv')
        .map(p => p.name);
    }

    // Filtrar equipas sem jogadores para remover da ordem de jogo nesta partida
    room.gameState.teamOrder = room.gameState.teamOrder.filter(t => room.gameState.teams[t].players.length > 0);

    if (room.gameState.teamOrder.length === 0) {
      socket.send(JSON.stringify({ type: 'ERROR', payload: 'É necessária pelo menos uma equipa com jogadores para começar.' }));
      return;
    }

    room.gameState.step = 'playing';
    room.gameState.currentTeamIndex = 0;
    room.gameState.currentExplainerIndex = 0;
    
    prepareNextRound(room);
    broadcastRoomState(room);
  }

  function handleRollDice(socket) {
    const room = rooms.get(userSession.roomId);
    if (!room) return;
    const isHost = (userSession.role === 'host');
    const currentPlayingTeam = room.gameState.teamOrder[room.gameState.currentTeamIndex];
    const isActivePlayer = (userSession.role === 'player' && userSession.team === currentPlayingTeam);
    if (!isHost && !(room.gameState.autoHost && isActivePlayer)) return;
    if (room.gameState.activeRound.hasRolled) return;

    // Dado 30 Segundos: Valores 0, 1, ou 2.
    // Distribuição típica: 0 (muito comum), 1, 2. Vamos fazer aleatório entre 0, 1, 2.
    const rollOptions = [0, 0, 1, 1, 2, 0]; // Dando mais peso ao 0 para ser fiel ao jogo físico
    const roll = rollOptions[Math.floor(Math.random() * rollOptions.length)];

    room.gameState.activeRound.diceRoll = roll;
    room.gameState.activeRound.hasRolled = true;

    // Sincronizar rolar de dado
    broadcastToAll(room, {
      type: 'DICE_ROLLED',
      payload: {
        roll: roll
      }
    });

    // Atualizar estado completo depois de 1.5s (dá tempo para a animação do dado)
    setTimeout(() => {
      broadcastRoomState(room);
    }, 1500);
  }

  function handleStartRound(socket) {
    const room = rooms.get(userSession.roomId);
    if (!room) return;
    const isHost = (userSession.role === 'host');
    const currentPlayingTeam = room.gameState.teamOrder[room.gameState.currentTeamIndex];
    const isActivePlayer = (userSession.role === 'player' && userSession.team === currentPlayingTeam);
    if (!isHost && !(room.gameState.autoHost && isActivePlayer)) return;
    if (room.gameState.activeRound.isTimerRunning) return;

    // Se estiver no modo com dado e ainda não rolou, rolar automaticamente
    if (room.gameState.useDice && !room.gameState.activeRound.hasRolled) {
      const rollOptions = [0, 0, 1, 1, 2, 0];
      const roll = rollOptions[Math.floor(Math.random() * rollOptions.length)];
      room.gameState.activeRound.diceRoll = roll;
      room.gameState.activeRound.hasRolled = true;
      broadcastToAll(room, {
        type: 'DICE_ROLLED',
        payload: { roll: roll }
      });
    }

    room.gameState.activeRound.isTimerRunning = true;
    
    // Iniciar contagem decrescente no servidor
    room.gameState.activeRound.timer = 30;
    
    // Notificar início imediato
    broadcastRoomState(room);

    room.timerInterval = setInterval(() => {
      room.gameState.activeRound.timer--;
      
      if (room.gameState.activeRound.timer <= 0) {
        clearInterval(room.timerInterval);
        room.gameState.activeRound.isTimerRunning = false;
        room.gameState.step = 'score_recap';
        
        broadcastToAll(room, { type: 'ROUND_FINISHED' });
        broadcastRoomState(room);
      } else {
        // Enviar apenas atualização do cronómetro para desempenho
        broadcastToAll(room, {
          type: 'TIMER_TICK',
          payload: {
            timer: room.gameState.activeRound.timer
          }
        });
      }
    }, 1000);
  }

  function handleToggleWord(socket, payload) {
    const room = rooms.get(userSession.roomId);
    if (!room) return;

    // Permitido se for host OU se autoHost estiver ativo e o cliente for de uma equipa adversária
    const isHost = (userSession.role === 'host');
    const currentPlayingTeam = room.gameState.teamOrder[room.gameState.currentTeamIndex];
    const isOpponent = (userSession.role === 'player' && userSession.team !== currentPlayingTeam);
    const canToggle = isHost || (room.gameState.autoHost && isOpponent);

    if (!canToggle) return;
    
    const { wordIndex, value } = payload;
    if (wordIndex >= 0 && wordIndex < 5) {
      room.gameState.activeRound.correctWords[wordIndex] = value;
      broadcastRoomState(room);
    }
  }

  function handleEndRoundEarly(socket) {
    const room = rooms.get(userSession.roomId);
    if (!room) return;
    const isHost = (userSession.role === 'host');
    const currentPlayingTeam = room.gameState.teamOrder[room.gameState.currentTeamIndex];
    const isOpponent = (userSession.role === 'player' && userSession.team !== currentPlayingTeam);
    const isActivePlayer = (userSession.role === 'player' && userSession.team === currentPlayingTeam);
    if (!isHost && !(room.gameState.autoHost && (isOpponent || isActivePlayer))) return;
    if (!room.gameState.activeRound.isTimerRunning) return;

    clearInterval(room.timerInterval);
    room.gameState.activeRound.isTimerRunning = false;
    room.gameState.step = 'score_recap';
    
    broadcastToAll(room, { type: 'ROUND_FINISHED' });
    broadcastRoomState(room);
  }

  function handleConfirmRoundScore(socket) {
    const room = rooms.get(userSession.roomId);
    if (!room) return;

    const isHost = (userSession.role === 'host');
    const currentPlayingTeam = room.gameState.teamOrder[room.gameState.currentTeamIndex];
    const isOpponent = (userSession.role === 'player' && userSession.team !== currentPlayingTeam);
    const canConfirm = isHost || (room.gameState.autoHost && isOpponent);

    if (!canConfirm) return;
    if (room.gameState.step !== 'score_recap') return;

    // Calcular pontuação final da rodada
    const correctCount = room.gameState.activeRound.correctWords.filter(Boolean).length;
    const diceRoll = room.gameState.activeRound.diceRoll || 0;
    
    // Casas = Acertos - Dado (se useDice) ou apenas Acertos
    const pointsEarned = room.gameState.useDice
      ? Math.max(0, correctCount - diceRoll)
      : correctCount;
    
    const currentTeam = room.gameState.teamOrder[room.gameState.currentTeamIndex];
    room.gameState.teams[currentTeam].score += pointsEarned;

    // Atualizar estatísticas da equipa
    if (!room.gameState.teams[currentTeam].stats) {
      room.gameState.teams[currentTeam].stats = { totalCorrect: 0, roundsPlayed: 0 };
    }
    room.gameState.teams[currentTeam].stats.totalCorrect += correctCount;
    room.gameState.teams[currentTeam].stats.roundsPlayed += 1;

    // Verificar se ganhou
    if (room.gameState.teams[currentTeam].score >= room.gameState.targetScore) {
      room.gameState.winner = currentTeam;
      room.gameState.step = 'game_over';
    } else {
      // Passar para a próxima equipa
      room.gameState.currentTeamIndex = (room.gameState.currentTeamIndex + 1) % room.gameState.teamOrder.length;
      
      // Atualizar a fila de explicadores para a equipa que vai jogar
      const nextTeam = room.gameState.teamOrder[room.gameState.currentTeamIndex];
      const nextTeamPlayers = room.gameState.teams[nextTeam].players;
      room.gameState.currentExplainerIndex = (room.gameState.currentExplainerIndex + 1) % (nextTeamPlayers.length || 1);
      
      room.gameState.step = 'playing';
      prepareNextRound(room);
    }

    broadcastRoomState(room);
  }

  function handleResetGame(socket) {
    const room = rooms.get(userSession.roomId);
    if (!room || userSession.role !== 'host') return;

    if (room.timerInterval) clearInterval(room.timerInterval);
    
    room.gameState.step = 'lobby';
    room.gameState.winner = null;
    
    for (const t of room.gameState.teamOrder) {
      room.gameState.teams[t].score = 0;
    }

    broadcastRoomState(room);
  }

  // Prepara uma nova carta estritamente inédita para a rodada
  function prepareNextRound(room) {
    // Se esgotar as 570 cartas da sala (caso extremo de mais de 570 rondas):
    if (room.deckIndex >= room.deck.length) {
      console.log("Todas as cartas do baralho foram jogadas! Baralhando novamente...");
      room.deckIndex = 0;
      for (let i = room.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [room.deck[i], room.deck[j]] = [room.deck[j], room.deck[i]];
      }
    }

    // Puxa a próxima carta sequencial (garantindo que nunca repete na mesma partida)
    const nextCard = room.deck[room.deckIndex++];
    if (nextCard) {
      logCardUsed(nextCard.id);
      room.usedDeck.push(nextCard);
    }

    room.gameState.activeRound = {
      timer: 30,
      isTimerRunning: false,
      words: nextCard ? nextCard.words : ["Sem Palavras", "Erro", "Recarregar", "Erro", "Erro"],
      correctWords: [false, false, false, false, false],
      diceRoll: null,
      hasRolled: false
    };
  }
});

// Envia uma mensagem a todos os clientes ligados na sala
function broadcastToAll(room, messageObj) {
  const msgStr = JSON.stringify(messageObj);
  room.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msgStr);
    }
  });
}

// Filtra e envia o estado da sala para cada cliente com base no seu papel (role)
function broadcastRoomState(room) {
  room.clients.forEach((client) => {
    if (client.readyState !== WebSocket.OPEN) return;

    // Encontrar os dados deste cliente específico
    // NOTA: Para fins de WebSocket simples, o papel é deduzido a partir da sessão guardada no socket
    // Vamos fazer um filtro de segurança para esconder as palavras
    let clientRole = 'spectator';
    let clientTeam = '';
    let clientName = '';

    // Procurar nas conexões ativas
    // Para simplificar, podemos anexar o papel ao próprio socket na conexão
    // e ler aqui.
  });

  // Solução melhor: iterar sobre cada cliente e enviar o estado personalizado.
  // Vamos associar o papel de cada socket ligando-o aos players da sala.
  // Mas como associar o WS com o jogador? Podemos guardar propriedades no próprio objeto 'ws'.
  
  // Vamos implementar isto anexando propriedades diretamente ao objeto WebSocket
  room.clients.forEach((clientSocket) => {
    if (clientSocket.readyState !== WebSocket.OPEN) return;

    const role = clientSocket.role || 'spectator';
    const name = clientSocket.playerName || 'Espectador';
    
    // Obter equipa correta da lista de jogadores (source of truth)
    const playerObj = room.players.find(p => p.name === name);
    const team = playerObj ? playerObj.team : (clientSocket.team || '');
    
    // Sincronizar propriedade do socket
    if (playerObj) {
      clientSocket.team = playerObj.team;
    }

    // Determinar equipa ativa e equipa validadora (fiscal)
    const currentTeamName = room.gameState.teamOrder[room.gameState.currentTeamIndex];
    const validatorTeamIndex = (room.gameState.currentTeamIndex + 1) % (room.gameState.teamOrder.length || 1);
    const validatorTeamName = room.gameState.teamOrder[validatorTeamIndex];
    const currentTeamPlayers = room.gameState.teams[currentTeamName] ? room.gameState.teams[currentTeamName].players : [];
    const currentExplainer = currentTeamPlayers[room.gameState.currentExplainerIndex];
    
    // No modo Anfitrião Automático, o próprio host joga numa das equipas!
    const isPlayingHost = (role === 'host' && room.gameState.autoHost && team && team !== 'none');
    const isPlayerOrPlayingHost = (role === 'player' || isPlayingHost);
    const isActiveTeam = isPlayerOrPlayingHost && (team === currentTeamName);

    // Sem modo de nomes: toda a equipa ativa vê as cartas
    const isCurrentExplainer = false;

    // Filtrar estado
    const filteredState = {
      step: room.gameState.step,
      teams: room.gameState.teams,
      teamOrder: room.gameState.teamOrder,
      currentTeamIndex: room.gameState.currentTeamIndex,
      currentExplainerIndex: room.gameState.currentExplainerIndex,
      validatorTeam: validatorTeamName,
      targetScore: room.gameState.targetScore,
      useDice: room.gameState.useDice,
      namedMode: room.gameState.namedMode,
      autoHost: room.gameState.autoHost,
      winner: room.gameState.winner,
      activeRound: {
        timer: room.gameState.activeRound.timer,
        isTimerRunning: room.gameState.activeRound.isTimerRunning,
        diceRoll: room.gameState.activeRound.diceRoll,
        hasRolled: room.gameState.activeRound.hasRolled,
        correctWords: room.gameState.activeRound.correctWords
      }
    };

    // Palavras: visíveis para:
    // 1. Host
    // 2. Membros da equipa ativa (para explicar)
    // 3. Membros da equipa adversária quando o Modo Anfitrião Automático estiver ligado (para fiscalizar/validar!)
    const isOpponentInAuto = room.gameState.autoHost && (isPlayerOrPlayingHost && !isActiveTeam);
    const canSeeWords = role === 'host' || isActiveTeam || isOpponentInAuto;

    if (canSeeWords) {
      filteredState.activeRound.words = room.gameState.activeRound.words;
    } else {
      // Ocultar palavras apenas para ecrã principal (TV) e espectadores
      filteredState.activeRound.words = ["?????", "?????", "?????", "?????", "?????"];
    }

    console.log(`[STATE] Para: ${name} | Papel: ${role} | Equipa: ${team} | Equipa Ativa: ${currentTeamName} | Ativo? ${isActiveTeam} | Vê cartas? ${canSeeWords} | Timer: ${room.gameState.activeRound.timer}s`);

    clientSocket.send(JSON.stringify({
      type: 'STATE_UPDATE',
      payload: {
        gameState: filteredState,
        role: role,
        isHost: (role === 'host'),
        playerName: name,
        team: team,
        players: room.players,
        isExplaining: isCurrentExplainer
      }
    }));
  });
}

// Inicializar o servidor HTTP
server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Servidor Ka'Net diversões ativo na porta ${PORT}`);
  console.log(`Acesse localmente em: http://localhost:${PORT}`);
  
  const ips = getLocalIPs();
  if (ips.length > 0) {
    console.log(`\nDispositivos na mesma rede Wi-Fi podem aceder em:`);
    ips.forEach(ip => {
      console.log(`👉 http://${ip}:${PORT}`);
    });
  }
  console.log(`==================================================`);
});
