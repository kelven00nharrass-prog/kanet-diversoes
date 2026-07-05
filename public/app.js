/* ==========================================================================
   KA'NET DIVERSÕES — ENGINE DO CLIENTE (JS)
   ========================================================================== */

// 1. SINTETIZADOR DE ÁUDIO WEB AUDIO API (Totalmente Offline)
class SoundSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playClick() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playTick() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.03);
    
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  playBuzzer() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.6);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(113, this.ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(83, this.ctx.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
    
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc2.start();
    osc.stop(this.ctx.currentTime + 0.6);
    osc2.stop(this.ctx.currentTime + 0.6);
  }

  playChime() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const playNote = (freq, delay, duration) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      gain.gain.setValueAtTime(0.08, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + duration);
    };

    playNote(523.25, 0, 0.15); // C5
    playNote(659.25, 0.08, 0.15); // E5
    playNote(783.99, 0.16, 0.3); // G5
  }

  playDiceRattle() {
    this.init();
    if (!this.ctx) return;
    for (let i = 0; i < 8; i++) {
      const delay = i * 0.08;
      const freq = 100 + Math.random() * 300;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);
      gain.gain.setValueAtTime(0.05, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.06);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.07);
    }
  }

  playFanfare() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const playBrassNote = (freq, delay, duration, volume = 0.08) => {
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.005, now + delay);
      
      gain.gain.setValueAtTime(volume, now + delay);
      gain.gain.linearRampToValueAtTime(volume, now + delay + duration - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
      
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + delay);
      osc2.start(now + delay);
      osc.stop(now + delay + duration);
      osc2.stop(now + delay + duration);
    };

    playBrassNote(261.63, 0, 0.2); // C4
    playBrassNote(329.63, 0.2, 0.2); // E4
    playBrassNote(392.00, 0.4, 0.2); // G4
    playBrassNote(523.25, 0.6, 0.8, 0.12); // C5
    playBrassNote(392.00, 0.6, 0.8, 0.05); // G4
    playBrassNote(659.25, 0.8, 0.6, 0.06); // E5
  }
}

const sounds = new SoundSynth();

// 2. CONEXÃO WEBSOCKET E VARIÁVEIS DE ESTADO
let socket = null;
let roomId = null;
let role = null; // 'host', 'tv', 'player', 'spectator'
let playerName = null;
let playerTeam = null; // 'Azul', 'Vermelho', 'Verde', 'Amarelo'
let gameState = null;
let playersList = [];
let wasTimerRunning = false; // Flag para scroll automático no início da rodada
let hasScrolledThisRound = false; // Flag para scroll suave até à carta quando começa a rodada

// Elementos DOM
const screens = {
  lobbyJoin: document.getElementById('screen-lobby-join'),
  lobbyActive: document.getElementById('screen-lobby-active'),
  gameActive: document.getElementById('screen-game-active'),
  gameOver: document.getElementById('screen-game-over')
};

// Detetar endereço do Servidor WebSocket automaticamente
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${wsProtocol}//${window.location.host}`;

// Inicialização: Tentar reconectar ou ler dados salvos na máquina
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadSavedSession();
  
  // Registar Service Worker para suporte PWA (Instalação)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('PWA Service Worker registado!'))
      .catch((err) => console.log('Erro ao registar Service Worker:', err));
  }
});

// Restaurar sessão se o jogador atualizar o navegador ou escaneou QR Code
function loadSavedSession() {
  // 1. Tentar ler da URL (caso tenha escaneado QR code)
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get('room');
  
  if (roomParam) {
    document.getElementById('input-room-code').value = roomParam.trim().toUpperCase();
    showToast("Código da sala preenchido via QR Code!", "success");
  } else {
    // Caso contrário, restaurar sessão anterior se existir
    const savedRoomId = localStorage.getItem('kanet_room_id');
    if (savedRoomId) {
      document.getElementById('input-room-code').value = savedRoomId;
    }
  }

  const savedPlayerName = localStorage.getItem('kanet_player_name');
  const savedRole = localStorage.getItem('kanet_role');
  const savedTeam = localStorage.getItem('kanet_team');

  if (savedRole) {
    const nameInput = document.getElementById('input-player-name');
    if (nameInput) nameInput.value = savedPlayerName || '';
    document.getElementById('select-join-role').value = savedRole;
    document.getElementById('select-player-team').value = savedTeam || 'Azul';
    
    // Atualizar UI de inputs
    toggleRoleInputs(savedRole);
  }
}

// 3. LISTENERS DOS EVENTOS DA INTERFACE (BOTOES E INPUTS)
function setupEventListeners() {
  // Alterar papel no Join altera o formulário
  document.getElementById('select-join-role').addEventListener('change', (e) => {
    toggleRoleInputs(e.target.value);
    sounds.playClick();
  });

  // Ações de Entrada
  document.getElementById('btn-create-room').addEventListener('click', createRoom);
  document.getElementById('btn-join-room').addEventListener('click', joinRoom);
  document.getElementById('btn-leave-room').addEventListener('click', leaveRoom);

  // Ações do Host no Lobby
  document.getElementById('btn-shuffle-teams').addEventListener('click', shuffleTeams);
  document.getElementById('btn-start-game').addEventListener('click', startGame);

  // Botões + Membro por equipa (apenas host)
  document.querySelectorAll('.btn-join-team').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedTeam = e.target.getAttribute('data-team') || e.target.closest('[data-team]')?.getAttribute('data-team');
      if (!selectedTeam) return;
      sounds.playClick();
      if (role === 'host') {
        addMemberToTeam(selectedTeam);
      } else {
        changeTeam(selectedTeam);
      }
    });
  });

  // Ações de Controle de Jogo (Host)
  document.getElementById('btn-host-roll').addEventListener('click', hostRollDice);
  document.getElementById('btn-host-start-round').addEventListener('click', hostStartRound);
  document.getElementById('btn-host-stop-early').addEventListener('click', hostStopEarly);
  document.getElementById('btn-host-confirm-score').addEventListener('click', hostConfirmScore);
  document.getElementById('btn-host-restart').addEventListener('click', hostResetGame);

  // Botoes de Ajuda
  document.getElementById('btn-help-rules').addEventListener('click', () => openModal('rules'));
  document.getElementById('btn-help-connect').addEventListener('click', () => openModal('connect'));
  document.getElementById('btn-help-play').addEventListener('click', () => openModal('play'));
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('instructions-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('instructions-modal')) closeModal();
  });
}

function toggleRoleInputs(selectedRole) {
  const pInputs = document.getElementById('player-inputs');
  if (selectedRole === 'tv') {
    pInputs.style.display = 'none';
  } else {
    pInputs.style.display = 'block';
  }
}

// Conteudo das Modais de Ajuda
const HELP_CONTENT = {
  rules: {
    title: 'Regras do Jogo',
    html: `
      <h3>Objetivo</h3>
      <p>A primeira equipa a atingir a <strong>casa da meta</strong> (30 por padrao) no tabuleiro vence!</p>
      <h3>Estrutura das Cartas</h3>
      <ul>
        <li>Cada carta tem <strong>5 palavras</strong> de temas variados (Biblia, Geografia, Cultura Geral, etc.).</li>
        <li>O explicador deve descre-las sem dizer a palavra, partes dela, derivados ou traducoes.</li>
        <li>As palavras aparecem <strong>so no telemovel do explicador</strong> &mdash; os adivinhadores nao as veem.</li>
      </ul>
      <h3>Pontuacao por Rodada</h3>
      <ul>
        <li>O Anfitriao lanca o dado antes de cada rodada: resultado pode ser <strong>0, 1 ou 2</strong>.</li>
        <li>Esse valor e uma <strong>penalidade</strong> subtraida dos acertos no final.</li>
        <li>Formula: <em>Casas a avancar = Acertos &minus; Dado</em> (minimo 0).</li>
      </ul>
      <h3>Rotacao de Explicadores</h3>
      <ul>
        <li>Dentro de cada equipa, os jogadores alternam quem e o Explicador em cada rodada.</li>
        <li>O sistema gere a fila automaticamente.</li>
      </ul>
      <h3>Proibido ao Explicar</h3>
      <ul>
        <li>Dizer a palavra ou parte dela</li>
        <li>Usar rimas, silabas ou letras da palavra</li>
        <li>Traduzir para outra lingua</li>
        <li>Fazer gestos com o corpo</li>
      </ul>
    `
  },
  connect: {
    title: 'Como Conectar os Dispositivos',
    html: `
      <h3>Modo 1 &mdash; Um Unico Dispositivo (Mais Simples)</h3>
      <ul>
        <li>Abra <strong>http://localhost:3000</strong> no computador ou telemovel que serve de servidor.</li>
        <li>Clique em <strong>Criar Sala</strong> como Anfitriao.</li>
        <li>No lobby, adicione os jogadores manualmente pelo campo <em>"Nome do Jogador"</em>.</li>
        <li>O dispositivo passa de mao em mao entre os explicadores.</li>
        <li>Sem internet, sem Wi-Fi, funciona offline!</li>
      </ul>
      <h3>Modo 2 &mdash; Varios Dispositivos (Wi-Fi Local)</h3>
      <ul>
        <li>O Anfitriao cria a sala &mdash; a app exibe o <strong>endereco IP local</strong>.</li>
        <li>Os outros dispositivos na mesma rede Wi-Fi abrem esse endereco.</li>
        <li>Leia o <strong>QR Code</strong> no ecra do Anfitriao para entrar rapidamente!</li>
        <li>Cada jogador digita o seu nome, escolhe a equipa e clica Entrar no Jogo.</li>
      </ul>
      <h3>Ecra Principal (TV Mode)</h3>
      <ul>
        <li>Ligue um computador/TV ao endereco do servidor e selecione o papel <strong>Ecra Principal (TV)</strong>.</li>
        <li>Este ecra mostra o tabuleiro, o dado 3D, o cronometro e as pontuacoes.</li>
      </ul>
    `
  },
  play: {
    title: 'Como Jogar (Passo a Passo)',
    html: `
      <h3>1. Preparar as Equipas</h3>
      <ul>
        <li>No lobby, divida os jogadores pelas equipas: Azul, Vermelha, Verde e Amarela.</li>
        <li>Pode usar <em>Sortear Equipas</em> para distribuicao automatica equilibrada.</li>
        <li>Quando pronto, o Anfitriao clica em <strong>Iniciar Partida</strong>.</li>
      </ul>
      <h3>2. Inicio de Cada Turno</h3>
      <ul>
        <li>O app indica a equipa da vez e o jogador que sera o <strong>Explicador</strong>.</li>
        <li>O Anfitriao clica em <strong>Lancar Dado</strong> &mdash; o dado anima na TV e revela a penalidade (0, 1 ou 2).</li>
      </ul>
      <h3>3. A Rodada (30 Segundos)</h3>
      <ul>
        <li>O Anfitriao clica em <strong>Iniciar Rodada</strong> para arrancar o cronometro.</li>
        <li>O telemovel do Explicador mostra as 5 palavras &mdash; ele descreve, a equipa adivinha!</li>
        <li>O Anfitriao vai clicando nas palavras que a equipa acerta para as marcar.</li>
      </ul>
      <h3>4. Pontuacao</h3>
      <ul>
        <li>Quando o tempo acaba, o Anfitriao ve o resumo: <em>Acertos &minus; Dado = Casas a avancar</em>.</li>
        <li>Clica em <strong>Confirmar Pontos</strong> para mover os pinos no tabuleiro.</li>
        <li>A vez passa automaticamente para a proxima equipa.</li>
      </ul>
      <h3>5. Fim do Jogo</h3>
      <ul>
        <li>A primeira equipa a chegar a meta (casa 30) vence! &nbsp;&#127942;</li>
        <li>O Anfitriao pode clicar em <strong>Jogar Novamente</strong> para reiniciar.</li>
      </ul>
    `
  }
};

function openModal(type) {
  sounds.playClick();
  const content = HELP_CONTENT[type];
  if (!content) return;
  document.getElementById('modal-title').innerText = content.title;
  document.getElementById('modal-body').innerHTML = content.html;
  document.getElementById('instructions-modal').classList.remove('hidden');
}

function closeModal() {
  sounds.playClick();
  document.getElementById('instructions-modal').classList.add('hidden');
}

// 4. ENVIO DE MENSAGENS E LIGAÇÃO AO BACKEND
function connectWebSocket(callback) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    if (callback) callback();
    return;
  }

  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("Conectado ao servidor Ka'Net!");
    // Iniciar batimento cardíaco para manter a conexão ativa
    setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'HEARTBEAT' }));
      }
    }, 15000);
    
    if (callback) callback();
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleServerMessage(message);
  };

  socket.onerror = (error) => {
    console.error("Erro na conexão:", error);
    showToast("Falha na ligação ao servidor. Verifique o seu Wi-Fi.", "error");
  };

  socket.onclose = () => {
    console.log("Conexão fechada.");
    showToast("Ligação perdida. Tentando reconectar...", "error");
    // Auto-reconexão após 2 segundos
    setTimeout(() => {
      if (roomId) {
        connectWebSocket(() => {
          // Re-entrar na sala anterior
          socket.send(JSON.stringify({
            type: 'JOIN_ROOM',
            payload: { roomId, playerName, role, team: playerTeam }
          }));
        });
      }
    }, 2000);
  };
}

// 5. PROCESSAMENTO DE MENSAGENS RECEBIDAS DO SERVIDOR
function handleServerMessage(message) {
  const { type, payload } = message;

  switch (type) {
    case 'ROOM_CREATED':
      roomId = payload.roomId;
      role = payload.role;
      playerName = 'Anfitrião';
      playerTeam = 'Azul';
      gameState = payload.gameState;
      
      saveSession();
      showScreen('lobbyActive');
      updateLobbyUI();
      showToast("Sala criada com sucesso!", "success");
      break;

    case 'JOINED_SUCCESS':
      roomId = payload.roomId;
      role = payload.role;
      playerName = payload.playerName;
      playerTeam = payload.team;
      
      saveSession();
      showScreen('lobbyActive');
      showToast(`Conectado como ${role === 'tv' ? 'Ecrã Principal' : playerName}!`, "success");
      break;

    case 'STATE_UPDATE':
      gameState = payload.gameState;
      role = payload.role;
      playerName = payload.playerName;
      playerTeam = payload.team;
      playersList = payload.players;
      
      // Sincronizar ecrãs
      syncGameScreen(payload.isExplaining);
      break;

    case 'DICE_ROLLED':
      triggerDiceRollAnimation(payload.roll);
      break;

    case 'TIMER_TICK':
      if (gameState && gameState.activeRound) {
        gameState.activeRound.timer = payload.timer;
        updateTimerUI(payload.timer);
      }
      break;

    case 'ROUND_FINISHED':
      sounds.playBuzzer();
      showToast("Tempo esgotado!", "error");
      break;

    case 'ERROR':
      showToast(payload, "error");
      break;
  }
}

// Guardar dados da sala no navegador
function saveSession() {
  localStorage.setItem('kanet_room_id', roomId);
  localStorage.setItem('kanet_player_name', playerName);
  localStorage.setItem('kanet_role', role);
  localStorage.setItem('kanet_team', playerTeam);
}

// Resetar sessão e limpar cache
function clearSession() {
  localStorage.removeItem('kanet_room_id');
  localStorage.removeItem('kanet_player_name');
  localStorage.removeItem('kanet_role');
  localStorage.removeItem('kanet_team');
}

// 6. CONTROLADORES DOS FLUXOS DE ENTRADA/SAÍDA
function createRoom() {
  sounds.playClick();
  connectWebSocket(() => {
    socket.send(JSON.stringify({ type: 'CREATE_ROOM' }));
  });
}

function joinRoom() {
  sounds.playClick();
  const code = document.getElementById('input-room-code').value.trim();
  const selectedRole = document.getElementById('select-join-role').value;
  const team = document.getElementById('select-player-team') ? document.getElementById('select-player-team').value : 'Azul';

  if (!code || code.length !== 5) {
    showToast("Por favor, introduza o código de 5 caracteres.", "error");
    return;
  }

  connectWebSocket(() => {
    socket.send(JSON.stringify({
      type: 'JOIN_ROOM',
      payload: {
        roomId: code,
        playerName: '',   // Servidor auto-atribui número sequencial
        role: selectedRole,
        team: team
      }
    }));
  });
}

function leaveRoom() {
  sounds.playClick();
  if (socket) {
    socket.close();
  }
  clearSession();
  roomId = null;
  role = null;
  playerName = null;
  playerTeam = null;
  gameState = null;
  playersList = [];
  showScreen('lobbyJoin');
}

// 7. GESTÃO DO LOBBY (Organização das Equipas)
function updateLobbyUI() {
  document.getElementById('display-room-code').innerText = roomId;
  
  // Detetar IPs
  const localIps = [];
  // (Nota: o servidor imprime os IPs na consola. No client, podemos exibir os dados)
  document.getElementById('room-ip-info').innerText = "Ligue os dispositivos na mesma rede Wi-Fi.";

  // Mostrar controlos exclusivos do Host
  const hostElements = document.querySelectorAll('.host-only');
  const playerElements = document.querySelectorAll('.player-only');
  
  if (role === 'host') {
    hostElements.forEach(el => el.classList.remove('hidden'));
    playerElements.forEach(el => el.classList.add('hidden'));
  } else {
    hostElements.forEach(el => el.classList.add('hidden'));
    playerElements.forEach(el => el.classList.remove('hidden'));
  }

  // Desenhar QR Code offline
  const qrContainer = document.getElementById('qrcode-container');
  qrContainer.innerHTML = '';
  // Gerar URL de acesso rápido baseada no host atual
  const joinUrl = `${window.location.protocol}//${window.location.host}/?room=${roomId}`;
  
  new QRCode(qrContainer, {
    text: joinUrl,
    width: 160,
    height: 160,
    colorDark : "#0d1326",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.M
  });

  // Limpar listas de jogadores
  const lists = {
    'Azul': document.getElementById('list-team-azul'),
    'Vermelho': document.getElementById('list-team-vermelho'),
    'Verde': document.getElementById('list-team-verde'),
    'Amarelo': document.getElementById('list-team-amarelo')
  };

  for (const key in lists) {
    if (lists[key]) lists[key].innerHTML = '';
  }

  // Preencher listas
  playersList.forEach(player => {
    const listEl = lists[player.team];
    if (listEl) {
      const li = document.createElement('li');
      li.innerText = player.name;
      if (player.name === playerName && player.team === playerTeam) {
        li.classList.add('me');
      }
      
      // Botão para o host remover/chutar
      if (role === 'host') {
        const kickBtn = document.createElement('span');
        kickBtn.innerHTML = ' ❌';
        kickBtn.style.cursor = 'pointer';
        kickBtn.addEventListener('click', () => kickPlayer(player.name));
        li.appendChild(kickBtn);
      }
      listEl.appendChild(li);
    }
  });

  // Preencher contagem de membros por equipa
  const teamKeys = { 'Azul': 'azul', 'Vermelho': 'vermelho', 'Verde': 'verde', 'Amarelo': 'amarelo' };
  Object.entries(teamKeys).forEach(([team, key]) => {
    const countEl = document.getElementById(`count-team-${key}`);
    if (countEl) {
      const count = playersList.filter(p => p.team === team && p.role !== 'tv').length;
      countEl.innerText = count === 0 ? 'Sem membros' : `${count} membro${count !== 1 ? 's' : ''}`;
    }
  });
}

function kickPlayer(name) {
  const updatedPlayers = playersList.filter(p => p.name !== name);
  socket.send(JSON.stringify({
    type: 'UPDATE_TEAMS',
    payload: {
      players: updatedPlayers
    }
  }));
}

function changeTeam(selectedTeam) {
  if (role === 'host') {
    // Host muda a sua própria equipa se participar
    playerTeam = selectedTeam;
  }
  
  // Atualizar no servidor
  if (socket && socket.readyState === WebSocket.OPEN) {
    const updatedPlayers = playersList.map(p => {
      if (p.name === playerName) {
        p.team = selectedTeam;
      }
      return p;
    });

    socket.send(JSON.stringify({
      type: 'UPDATE_TEAMS',
      payload: {
        players: updatedPlayers,
        team: selectedTeam
      }
    }));
  }
}

// Algoritmo de Sorteamento Aleatório das Equipas (Fisher-Yates)
function shuffleTeams() {
  sounds.playClick();
  const humanPlayers = playersList.filter(p => p.role !== 'tv');
  if (humanPlayers.length === 0) return;

  const teams = ['Azul', 'Vermelho', 'Verde', 'Amarelo'];
  
  // Baralhar jogadores
  for (let i = humanPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [humanPlayers[i], humanPlayers[j]] = [humanPlayers[j], humanPlayers[i]];
  }

  // Distribuir equitativamente
  humanPlayers.forEach((player, index) => {
    player.team = teams[index % teams.length];
  });

  // Atualizar servidor
  socket.send(JSON.stringify({
    type: 'UPDATE_TEAMS',
    payload: {
      players: humanPlayers
    }
  }));
}

// Modo de dado: true = com penalização, false = sem dado
let useDice = true;

function setDiceMode(withDice) {
  useDice = withDice;
  document.getElementById('btn-mode-dado').classList.toggle('active', withDice);
  document.getElementById('btn-mode-semDado').classList.toggle('active', !withDice);
  sounds.playClick();
}


function startGame() {
  sounds.playClick();
  const targetScore = document.getElementById('input-target-score').value;
  socket.send(JSON.stringify({
    type: 'UPDATE_TEAMS',
    payload: {
      targetScore: targetScore,
      useDice: useDice,
      namedMode: false  // Sempre sem nomes: equipa decide quem explica
    }
  }));

  socket.send(JSON.stringify({
    type: 'START_GAME'
  }));
}


// Adicionar membro genérico a uma equipa (sem nome, sistema auto-atribui número global único)
function addMemberToTeam(team) {
  sounds.playClick();
  const totalCount = playersList.filter(p => p.role !== 'tv').length;
  const memberName = `Membro ${totalCount + 1}`;
  const newPlayer = { name: memberName, role: 'player', team: team, active: true };
  const updatedPlayers = [...playersList, newPlayer];
  socket.send(JSON.stringify({
    type: 'UPDATE_TEAMS',
    payload: { players: updatedPlayers }
  }));
  showToast(`${memberName} adicionado à Equipa ${team}!`, "success");
}

// Manter compatibilidade — reencaminhar btn-join-team para addMemberToTeam quando é host
function addPlayerManual() { /* Removido — substituido por addMemberToTeam */ }

// 8. SINCRONIZAÇÃO E FLUXO DO ECRÃ DE JOGO
function syncGameScreen(isExplaining) {
  if (!gameState) return;

  // Manter o ecrã sempre ligado durante o jogo ativo
  if (gameState.step === 'playing' || gameState.step === 'score_recap') {
    requestWakeLock();
  } else {
    releaseWakeLock();
  }

  // Redirecionamento automático de ecrãs principais
  if (gameState.step === 'lobby') {
    showScreen('lobbyActive');
    updateLobbyUI();
    return;
  } else if (gameState.step === 'game_over') {
    showScreen('gameOver');
    document.getElementById('winner-banner').className = `team-banner-large bg-team-${gameState.winner}`;
    document.getElementById('winner-banner').innerText = `Equipa ${gameState.winner}`;
    
    // Lançar confetti épico!
    launchConfetti();
    sounds.playFanfare();

    // Renderizar estatísticas
    renderStatsTable();

    const hostRestarts = document.querySelectorAll('.host-only');
    if (role === 'host') {
      hostRestarts.forEach(el => el.classList.remove('hidden'));
    } else {
      hostRestarts.forEach(el => el.classList.add('hidden'));
    }
    releaseWakeLock();
    return;
  }

  showScreen('gameActive');
  
  // Configurar cabeçalho global do jogo
  document.getElementById('game-room-id').innerText = roomId;
  document.getElementById('game-status-label').innerText = gameState.step === 'score_recap' ? 'RESUMO' : 'A JOGAR';
  
  const scoreBoard = document.getElementById('game-score-board');
  scoreBoard.innerHTML = '';
  
  const currentPlayingTeam = gameState.teamOrder[gameState.currentTeamIndex];

  gameState.teamOrder.forEach(team => {
    const scoreItem = document.createElement('div');
    scoreItem.className = `mini-score-item ${team === currentPlayingTeam ? 'active-team color-' + team.toLowerCase() : ''}`;
    scoreItem.innerHTML = `<strong>${team}</strong>: ${gameState.teams[team].score} pts`;
    scoreBoard.appendChild(scoreItem);
  });

  // Renderizar a lista de alinhamento ativa e a ordem de jogo
  renderActiveTeamsInfo();

  // Ocultar todas as visões de papel primeiro
  document.querySelectorAll('.view-role').forEach(el => el.classList.add('hidden'));

  // Ativar a visão correta
  const gameScreen = document.getElementById('screen-game-active');
  if (role === 'host') {
    gameScreen.classList.remove('player-mode');
    document.getElementById('view-host').classList.remove('hidden');
    renderHostControls();
  } else if (role === 'tv') {
    gameScreen.classList.remove('player-mode');
    document.getElementById('view-tv').classList.remove('hidden');
    renderTVMode();
  } else if (role === 'spectator') {
    gameScreen.classList.remove('player-mode');
    document.getElementById('view-spectator').classList.remove('hidden');
    renderSpectatorMode();
  } else if (role === 'player') {
    gameScreen.classList.add('player-mode');
    document.getElementById('view-player').classList.remove('hidden');
    renderPlayerMode(isExplaining);
  }
}

// 9. RENDERS ESPECÍFICOS POR PAPEL

// A: VISÃO HOST (ANFITRIÃO)
function renderHostControls() {
  const currentTeam = gameState.teamOrder[gameState.currentTeamIndex];
  const currentExplainer = gameState.teams[currentTeam].players[gameState.currentExplainerIndex] || "Ninguém";
  
  const turnBanner = document.getElementById('host-turn-info');
  turnBanner.className = `team-banner bg-team-${currentTeam}`;
  turnBanner.innerText = `${currentTeam} (Explica: ${currentExplainer})`;

  // Dado
  const rollBtn = document.getElementById('btn-host-roll');
  const startRoundBtn = document.getElementById('btn-host-start-round');
  const stopEarlyBtn = document.getElementById('btn-host-stop-early');
  const confirmScoreBtn = document.getElementById('btn-host-confirm-score');
  const diceBadge = document.getElementById('host-dice-result');
  const diceRow = document.getElementById('host-dice-row');

  // Mostrar ou esconder linha do dado consoante o modo
  if (diceRow) diceRow.style.display = gameState.useDice ? '' : 'none';

  if (!gameState.useDice) {
    // Sem dado: inicia imediatamente sem rolar
    startRoundBtn.disabled = gameState.step !== 'playing' || gameState.activeRound.isTimerRunning;
  } else if (gameState.activeRound.hasRolled) {
    rollBtn.disabled = true;
    diceBadge.innerText = gameState.activeRound.diceRoll;
    if (gameState.step === 'playing' && !gameState.activeRound.isTimerRunning) {
      startRoundBtn.disabled = false;
    } else {
      startRoundBtn.disabled = true;
    }
  } else {
    rollBtn.disabled = false;
    diceBadge.innerText = '--';
    startRoundBtn.disabled = true;
  }

  // Timer
  if (gameState.activeRound.isTimerRunning) {
    stopEarlyBtn.classList.remove('hidden');
    startRoundBtn.classList.add('hidden');
  } else {
    stopEarlyBtn.classList.add('hidden');
    startRoundBtn.classList.remove('hidden');
  }

  // Confirmar pontos
  if (gameState.step === 'score_recap') {
    confirmScoreBtn.disabled = false;
  } else {
    confirmScoreBtn.disabled = true;
  }

  // Palavras
  const wordsList = document.getElementById('host-words-list');
  wordsList.innerHTML = '';

  if (gameState.activeRound.words && gameState.activeRound.words.length > 0) {
    gameState.activeRound.words.forEach((word, index) => {
      const isChecked = gameState.activeRound.correctWords[index];
      const li = document.createElement('li');
      li.className = isChecked ? 'checked' : '';
      li.innerHTML = `<span>${word}</span> <div class="check-pill"></div>`;
      
      li.addEventListener('click', () => {
        sounds.playClick();
        socket.send(JSON.stringify({
          type: 'TOGGLE_WORD',
          payload: {
            wordIndex: index,
            value: !isChecked
          }
        }));
      });
      wordsList.appendChild(li);
    });
  }
  // Renderizar o tabuleiro no ecrã do Host
  renderBoard('host-board-track');
}

// B: VISÃO TV MODE (TABULEIRO E CRONÓMETRO)
function renderTVMode() {
  const currentTeam = gameState.teamOrder[gameState.currentTeamIndex];
  const currentExplainer = gameState.teams[currentTeam].players[gameState.currentExplainerIndex] || "Ninguém";

  document.getElementById('tv-current-team').className = `team-banner-large bg-team-${currentTeam}`;
  document.getElementById('tv-current-team').innerText = currentTeam;
  document.getElementById('tv-current-explainer').innerText = `Explicador: ${currentExplainer}`;

  // Dado
  const diceLabel = document.getElementById('tv-dice-label');
  const diceContainer = document.getElementById('dice-container-3d');
  
  if (gameState.useDice && gameState.activeRound.hasRolled && gameState.activeRound.diceRoll !== null) {
    diceLabel.style.display = 'block';
    diceLabel.innerText = `Subtração do Dado: -${gameState.activeRound.diceRoll}`;
    
    // Posicionar o dado virtual 3D na face correta se não estiver rolando
    const cube = document.getElementById('cube-3d');
    if (!cube.classList.contains('spinning')) {
      diceContainer.style.display = 'block';
      cube.className = 'cube-3d'; // Reset
      
      const roll = gameState.activeRound.diceRoll;
      if (roll === 0) {
        cube.classList.add('show-front');
      } else if (roll === 1) {
        cube.classList.add('show-back');
      } else if (roll === 2) {
        cube.classList.add('show-right');
      }
    }
  } else {
    diceLabel.style.display = 'none';
    diceContainer.style.display = 'none';
  }

  // Timer Circular
  updateTimerUI(gameState.activeRound.timer);

  // Tabuleiro
  renderBoard();
}

// Render do Tabuleiro 30 Segundos
function renderBoard(containerId = 'tv-board-track') {
  try {
    const boardTrack = document.getElementById(containerId);
    if (!boardTrack) return;
    boardTrack.innerHTML = '';

    if (!gameState) {
      console.warn("renderBoard: gameState não definido.");
      return;
    }

    const totalCells = parseInt(gameState.targetScore) || 30;
    
    // Criar grelha em linhas de 10
    const rowsCount = Math.ceil((totalCells + 1) / 10);
    if (isNaN(rowsCount) || rowsCount <= 0) {
      console.error("renderBoard: rowsCount inválido:", rowsCount);
      return;
    }
    
    let currentCell = 0;

    for (let r = 0; r < rowsCount; r++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'board-row';
      
      const cols = [];
      for (let c = 0; c < 10; c++) {
        if (currentCell <= totalCells) {
          cols.push(currentCell);
          currentCell++;
        }
      }
      
      if (r % 2 === 1) {
        cols.reverse();
      }

      cols.forEach(cellNum => {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        
        if (cellNum === 0) {
          cell.classList.add('start');
          cell.innerHTML = `<span class="cell-number">PARTIDA</span><span class="cell-theme-icon">🏁</span>`;
        } else if (cellNum === totalCells) {
          cell.classList.add('finish');
          cell.innerHTML = `<span class="cell-number">META</span><span class="cell-theme-icon">🏆</span>`;
        } else {
          let themeIcon = '';
          if (cellNum % 4 === 1) themeIcon = '📖';
          else if (cellNum % 4 === 2) themeIcon = '🌍';
          else if (cellNum % 4 === 3) themeIcon = '🦁';
          else themeIcon = '🧠';

          cell.innerHTML = `<span class="cell-number">${cellNum}</span><span class="cell-theme-icon">${themeIcon}</span>`;
        }

        const pegContainer = document.createElement('div');
        pegContainer.className = 'peg-container';
        
        const teamOrder = gameState.teamOrder || ['Azul', 'Vermelho', 'Verde', 'Amarelo'];
        const teams = gameState.teams || {};

        teamOrder.forEach(team => {
          if (teams[team]) {
            const teamScore = Math.min(totalCells, teams[team].score || 0);
            if (teamScore === cellNum) {
              const peg = document.createElement('div');
              peg.className = `peg peg-${team}`;
              peg.title = team;
              pegContainer.appendChild(peg);
            }
          }
        });
        
        cell.appendChild(pegContainer);
        rowEl.appendChild(cell);
      });

      boardTrack.appendChild(rowEl);
    }
  } catch (error) {
    console.error("Erro ao renderizar o tabuleiro:", error);
  }
}

// Renderizar Alinhamento de Equipas e Ordem de Jogo
function renderActiveTeamsInfo() {
  try {
    const containerIds = [
      'tv-teams-list-active',
      'spec-teams-list-active',
      'player-teams-list-active',
      'host-teams-list-active'
    ];

    containerIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = '';

      if (!gameState || !gameState.teamOrder) return;

      const currentPlayingTeam = gameState.teamOrder[gameState.currentTeamIndex];

      gameState.teamOrder.forEach((team) => {
        const isCurrentTeam = (team === currentPlayingTeam);
        
        const teamRow = document.createElement('div');
        teamRow.className = `tv-team-row-active ${isCurrentTeam ? 'current-turn' : ''}`;
        
        // Cabeçalho da equipa
        const header = document.createElement('div');
        header.className = 'tv-team-header-active';
        
        // Nome com cor
        const nameSpan = document.createElement('span');
        nameSpan.className = `color-${team.toLowerCase()}`;
        nameSpan.innerHTML = `${isCurrentTeam ? '▶ ' : ''}Equipa ${team}`;
        header.appendChild(nameSpan);
        
        // Score
        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'text-muted';
        scoreSpan.innerText = `${gameState.teams[team].score} pts`;
        header.appendChild(scoreSpan);
        
        teamRow.appendChild(header);

        // Jogadores e explicador
        const playersContainer = document.createElement('div');
        playersContainer.className = 'tv-team-players-active';

        const teamPlayers = gameState.teams[team].players || [];
        if (teamPlayers.length === 0) {
          playersContainer.innerHTML = '<em>Sem jogadores</em>';
        } else {
          const currentExplainerIndex = isCurrentTeam ? gameState.currentExplainerIndex : 0;
          
          teamPlayers.forEach((pName, pIdx) => {
            const isExplainer = isCurrentTeam && (pIdx === currentExplainerIndex);
            const pSpan = document.createElement('span');
            pSpan.className = `tv-player-active-name ${isExplainer ? 'is-explainer' : ''}`;
            
            if (isExplainer) {
              pSpan.innerHTML = `🎤 <strong>${pName}</strong>`;
            } else {
              pSpan.innerText = pName;
            }
            
            if (pIdx < teamPlayers.length - 1) {
              pSpan.innerHTML += '<span class="text-muted">, </span>';
            }
            playersContainer.appendChild(pSpan);
          });
        }
        
        teamRow.appendChild(playersContainer);
        el.appendChild(teamRow);
      });
    });
  } catch (err) {
    console.error("Erro ao renderizar alinhamento das equipas:", err);
  }
}

// C: VISÃO JOGADOR DA EQUIPA (simplificada sem nomes)
function renderPlayerMode() {
  const currentTeam = gameState.teamOrder[gameState.currentTeamIndex];
  const isMyTeamActive = (playerTeam === currentTeam);
  const roundRunning = gameState.activeRound.isTimerRunning;
  const isRecap = (gameState.step === 'score_recap');

  // Debug visual no telemovel
  let dbg = document.getElementById('player-debug-bar');
  if (!dbg) {
    dbg = document.createElement('div');
    dbg.id = 'player-debug-bar';
    dbg.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:rgba(0,0,0,0.85);color:#0f0;font-size:11px;padding:4px 8px;z-index:9999;font-family:monospace;';
    document.body.appendChild(dbg);
  }
  dbg.innerText = `Eu:${playerTeam} | Ativa:${currentTeam} | Minha?${isMyTeamActive} | Timer:${roundRunning} | Step:${gameState.step}`;

  const waitingView    = document.getElementById('player-waiting');
  const myTeamWait     = document.getElementById('player-my-team-wait');
  const activeView     = document.getElementById('player-active');

  // Esconder tudo primeiro
  waitingView.classList.add('hidden');
  myTeamWait.classList.add('hidden');
  activeView.classList.add('hidden');

  if (!isMyTeamActive || isRecap) {
    // ─── Outra equipa joga OU recap: mostrar timer decrescente ─────────────
    hasScrolledThisRound = false;
    waitingView.classList.remove('hidden');

    const warning = document.getElementById('player-turn-warning');
    warning.className = `team-banner-large bg-team-${currentTeam}`;
    warning.innerText = `Equipa ${currentTeam}`;

    const msg = document.getElementById('player-waiting-msg');
    msg.innerText = isRecap
      ? '⏱️ O anfitrião está a confirmar os pontos...'
      : `A Equipa ${currentTeam} está a jogar`;

    const timerEl = document.getElementById('player-waiting-timer');
    if (roundRunning) {
      timerEl.innerText = gameState.activeRound.timer;
      timerEl.style.opacity = '1';
      timerEl.style.color = gameState.activeRound.timer <= 5 ? '#ef4444' : 'rgba(255,255,255,0.7)';
    } else {
      timerEl.innerText = '--';
      timerEl.style.opacity = '0.4';
      timerEl.style.color = '';
    }

  } else if (!roundRunning) {
    // ─── É a minha vez mas o round ainda não começou ──────────────────────
    hasScrolledThisRound = false;
    myTeamWait.classList.remove('hidden');
    const warning = document.getElementById('player-my-turn-warning');
    warning.className = `team-banner-large bg-team-${currentTeam}`;
    warning.innerText = `Equipa ${currentTeam}`;

  } else {
    // ─── ROUND A DECORRER: MOSTRAR APENAS AS CARTAS ────────────────────────
    activeView.classList.remove('hidden');

    if (gameState.activeRound.isTimerRunning && !hasScrolledThisRound) {
      hasScrolledThisRound = true;
      const activeWordsCard = document.getElementById('player-words-card-active');
      if (activeWordsCard) {
        setTimeout(() => {
          activeWordsCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }

    if (gameState.activeRound.words) {
      for (let i = 0; i < 5; i++) {
        const el = document.getElementById(`a-word-${i}`);
        if (el) el.innerText = gameState.activeRound.words[i] || '-----';
      }
    }

    const timerEl = document.getElementById('player-active-timer');
    if (timerEl) {
      timerEl.innerText = gameState.activeRound.timer;
      if (gameState.activeRound.timer <= 5) {
        timerEl.classList.add('color-red');
      } else {
        timerEl.classList.remove('color-red');
      }
    }
  }

  wasTimerRunning = gameState.activeRound.isTimerRunning;
}



// D: VISÃO ESPECTADOR
function renderSpectatorMode() {
  const currentTeam = gameState.teamOrder[gameState.currentTeamIndex];
  const currentExplainer = gameState.teams[currentTeam].players[gameState.currentExplainerIndex] || "Ninguém";

  document.getElementById('spec-current-team').className = `team-banner bg-team-${currentTeam}`;
  document.getElementById('spec-current-team').innerText = currentTeam;
  document.getElementById('spec-current-explainer').innerText = `Explicador: ${currentExplainer}`;
  document.getElementById('spec-timer-display').innerText = gameState.activeRound.timer;
  
  const specDiceEl = document.getElementById('spec-dice-display');
  if (!gameState.useDice) {
    specDiceEl.innerText = '';
    specDiceEl.style.display = 'none';
  } else {
    specDiceEl.style.display = '';
    if (gameState.activeRound.hasRolled && gameState.activeRound.diceRoll !== null) {
      specDiceEl.innerText = `Dado: -${gameState.activeRound.diceRoll}`;
    } else {
      specDiceEl.innerText = `Dado: --`;
    }
  }

  // Renderizar o tabuleiro no ecrã do Espectador
  renderBoard('spectator-board-track');
}

// 10. ANIMAÇÕES E AUXILIARES INTERNOS
function updateTimerUI(seconds) {
  const timerTextEl = document.getElementById('tv-timer-display');
  if (timerTextEl) timerTextEl.innerText = seconds;

  // Atualizar progresso circular (SVG stroke-dashoffset)
  // Comprimento do círculo = 283 (dasharray)
  const circleProgress = document.getElementById('timer-progress');
  if (circleProgress) {
    const dashOffset = 283 - (seconds / 30) * 283;
    circleProgress.style.strokeDashoffset = dashOffset;
    
    // Cor do cronómetro com base no tempo restante
    if (seconds <= 5) {
      circleProgress.style.stroke = 'var(--color-danger)';
      if (seconds > 0) sounds.playTick(); // Tique-taque sonoro crítico
    } else if (seconds <= 12) {
      circleProgress.style.stroke = 'var(--color-warning)';
    } else {
      circleProgress.style.stroke = 'var(--color-green)';
    }
  }

  // Atualizar timer também nas outras visões locais
  const playerActiveTimer = document.getElementById('player-active-timer');
  if (playerActiveTimer) {
    playerActiveTimer.innerText = seconds;
    if (seconds <= 5) {
      playerActiveTimer.classList.add('color-red');
    } else {
      playerActiveTimer.classList.remove('color-red');
    }
  }

  const playerWaitingTimer = document.getElementById('player-waiting-timer');
  if (playerWaitingTimer) {
    playerWaitingTimer.innerText = seconds;
    if (seconds <= 5) {
      playerWaitingTimer.style.color = '#ef4444';
      playerWaitingTimer.style.opacity = '1';
    } else {
      playerWaitingTimer.style.color = '';
      playerWaitingTimer.style.opacity = '0.5';
    }
  }

  const specTimer = document.getElementById('spec-timer-display');
  if (specTimer) specTimer.innerText = seconds;
}

// Animação 3D do Dado
function triggerDiceRollAnimation(rollResult) {
  sounds.playDiceRattle();

  const cube = document.getElementById('cube-3d');
  const diceContainer = document.getElementById('dice-container-3d');
  const diceLabel = document.getElementById('tv-dice-label');

  if (!cube) return;

  diceContainer.style.display = 'block';
  diceLabel.style.display = 'block';
  diceLabel.innerText = "Lançando o Dado...";

  // Adicionar classe de rotação rápida
  cube.classList.add('spinning');
  
  // Criar rotação aleatória extrema na animação CSS
  cube.style.transform = `rotateX(${1800 + Math.random() * 360}deg) rotateY(${1800 + Math.random() * 360}deg)`;

  setTimeout(() => {
    cube.classList.remove('spinning');
    cube.className = 'cube-3d'; // Reset
    cube.style.transform = ''; // Limpar estilos inline

    // Definir face correta com base no resultado
    if (rollResult === 0) {
      cube.classList.add('show-front');
    } else if (rollResult === 1) {
      cube.classList.add('show-back');
    } else if (rollResult === 2) {
      cube.classList.add('show-right');
    }

    diceLabel.innerText = `Subtração do Dado: -${rollResult}`;
    sounds.playChime(); // Som de acerto / conclusão
  }, 1200);
}

// 11. CHAMADAS DO HOST AO SERVIDOR
function hostRollDice() {
  sounds.playClick();
  socket.send(JSON.stringify({ type: 'ROLL_DICE' }));
}

function hostStartRound() {
  sounds.playClick();
  socket.send(JSON.stringify({ type: 'START_ROUND' }));
}

function hostStopEarly() {
  sounds.playClick();
  socket.send(JSON.stringify({ type: 'END_ROUND_EARLY' }));
}

function hostConfirmScore() {
  sounds.playClick();
  socket.send(JSON.stringify({ type: 'CONFIRM_ROUND_SCORE' }));
}

function hostResetGame() {
  sounds.playClick();
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
    confettiAnimationId = null;
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  socket.send(JSON.stringify({ type: 'RESET_GAME' }));
}

// 12. SISTEMA DE MENUS E VISIBILIDADE DE ECRÃS
function showScreen(screenKey) {
  for (const key in screens) {
    if (screens[key]) {
      if (key === screenKey) {
        screens[key].classList.add('active');
      } else {
        screens[key].classList.remove('active');
      }
    }
  }
}

// Sistema de Alertas Toast
function showToast(message, type = 'info') {
  const toastEl = document.getElementById('toast');
  toastEl.innerText = message;
  toastEl.className = `toast ${type}`;
  toastEl.classList.remove('hidden');

  setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 3500);
}

// 13. WAKE LOCK API (PREVENIR QUE O ECRÃ SE DESLIGUE)
async function requestWakeLock() {
  if (wakeLock !== null) return;
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake Lock ativo: o ecrã não vai suspender.');
      
      wakeLock.addEventListener('release', () => {
        console.log('Wake Lock libertado.');
        wakeLock = null;
      });
    }
  } catch (err) {
    console.warn(`Não foi possível adquirir Wake Lock: ${err.message}`);
  }
}

function releaseWakeLock() {
  if (wakeLock !== null) {
    wakeLock.release();
    wakeLock = null;
  }
}

// Re-adquirir Wake Lock quando voltar à aba se o jogo estiver a decorrer
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    wakeLock = null;
    if (gameState && (gameState.step === 'playing' || gameState.step === 'score_recap')) {
      await requestWakeLock();
    }
  }
});

// 14. MOTOR DE CONFETIS E TABELA DE ESTATÍSTICAS
let confettiAnimationId = null;

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = [
    '#f59e0b', '#fbbf24', '#3b82f6', '#60a5fa', 
    '#10b981', '#34d399', '#ef4444', '#f87171'
  ];
  
  const particles = [];
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    });
  }

  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((p) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - (p.r / 3)) * 15;
      
      if (p.y > canvas.height) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
      
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });
    
    confettiAnimationId = requestAnimationFrame(draw);
  }
  
  draw();
}

function renderStatsTable() {
  const container = document.getElementById('stats-table-container');
  if (!container || !gameState || !gameState.teamOrder) return;

  const teamOrder = gameState.teamOrder;
  const teams = gameState.teams;

  // Ordenar equipas por pontuação final
  const sortedTeams = [...teamOrder].sort((a, b) => (teams[b].score || 0) - (teams[a].score || 0));

  let html = `
    <table class="stats-table">
      <thead>
        <tr>
          <th>Equipa</th>
          <th>Pontos</th>
          <th>Acertos Totais</th>
          <th>Rodadas</th>
          <th>Média/Rodada</th>
        </tr>
      </thead>
      <tbody>
  `;

  sortedTeams.forEach((teamName, index) => {
    const team = teams[teamName];
    const score = team.score || 0;
    const stats = team.stats || { totalCorrect: 0, roundsPlayed: 0 };
    const totalCorrect = stats.totalCorrect || 0;
    const roundsPlayed = stats.roundsPlayed || 0;
    const average = roundsPlayed > 0 ? (totalCorrect / roundsPlayed).toFixed(1) : '0.0';
    
    const isWinner = teamName === gameState.winner;
    const rowClass = isWinner ? 'stats-row-winner' : '';
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👥';

    html += `
      <tr class="${rowClass}">
        <td><span class="stats-medal">${medal}</span> <span class="color-${teamName.toLowerCase()}">${teamName}</span></td>
        <td><strong>${score}</strong></td>
        <td>${totalCorrect}</td>
        <td>${roundsPlayed}</td>
        <td>${average}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}


