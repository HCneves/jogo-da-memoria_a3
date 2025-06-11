// Elementos do DOM
const gameContainer = document.getElementById('game-container');
const movesCount = document.getElementById('moves-count');
const timeValue = document.getElementById('time');
const restartButton = document.getElementById('restart');
const playAgainButton = document.getElementById('play-again');
const popup = document.querySelector('.popup');
const finalTime = document.getElementById('final-time');
const finalMoves = document.getElementById('final-moves');
const pairsSelect = document.getElementById('pairs-select');
const bestScoreElement = document.getElementById('best-score');
const performanceMessage = document.getElementById('performance-message');
const feedbackMessage = document.getElementById('feedback-message');

// Elementos de áudio
const flipSound = document.getElementById('flip-sound');
const matchSound = document.getElementById('match-sound');
const errorSound = document.getElementById('error-sound');
const winSound = document.getElementById('win-sound');

// Ícones para as cartas
const icons = [
    { icon: 'fas fa-heart', color: '#D50000' },
    { icon: 'fas fa-star', color: '#FFD600' },
    { icon: 'fas fa-bolt', color: '#40C4FF' },
    { icon: 'fas fa-moon', color: '#7C4DFF' },
    { icon: 'fas fa-tree', color: '#00C853' },
    { icon: 'fas fa-bell', color: '#FF6D00' },
    { icon: 'fas fa-gem', color: '#EC407A' },
    { icon: 'fas fa-snowflake', color: '#81D4FA' },
    { icon: 'fas fa-fire', color: '#FF3D00' },
    { icon: 'fas fa-rocket', color: '#7986CB' }
];

// Variáveis do jogo
let cards = [];
let moves = 0;
let timer;
let seconds = 0;
let minutes = 0;
let firstCard = null;
let secondCard = null;
let locked = false;
let matchedPairs = 0;
let totalPairs = 6;
let bestScores = {};

// Mensagens de incentivo
const encouragingMessages = [
    "Boa!",
    "Muito bem!",
    "Você está indo bem!",
    "Excelente!",
    "Continue assim!",
    "Ótima memória!",
    "Incrível!"
];

// Carregar melhores pontuações do localStorage
function loadBestScores() {
    const savedScores = localStorage.getItem('memoryGameBestScores');
    if (savedScores) {
        bestScores = JSON.parse(savedScores);
    }
    updateBestScoreDisplay();
}

// Salvar melhor pontuação
function saveBestScore() {
    if (!bestScores[totalPairs] || moves < bestScores[totalPairs]) {
        bestScores[totalPairs] = moves;
        localStorage.setItem('memoryGameBestScores', JSON.stringify(bestScores));
        updateBestScoreDisplay();
    }
}

// Atualizar exibição do recorde
function updateBestScoreDisplay() {
    bestScoreElement.textContent = bestScores[totalPairs] ? bestScores[totalPairs] : '-';
}

// Mostrar mensagem de feedback
function showFeedback(message) {
    feedbackMessage.textContent = message;
    feedbackMessage.classList.add('show');
    
    setTimeout(() => {
        feedbackMessage.classList.remove('show');
    }, 2000);
}

// Criar cartas
function createCards() {
    gameContainer.innerHTML = '';
    
    // Selecionar ícones para o número de pares atual
    const selectedIcons = icons.slice(0, totalPairs);
    
    // Criar array com pares de ícones
    const cardPairs = [...selectedIcons, ...selectedIcons];
    
    // Embaralhar cartas
    const shuffledCards = shuffle([...cardPairs]);
    
    // Criar elementos de carta
    shuffledCards.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <i class="${item.icon}" style="color: ${item.color}"></i>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => flipCard(card));
        gameContainer.appendChild(card);
    });
    
    // Atualizar array de cartas
    cards = document.querySelectorAll('.card');
    
    // Ajustar layout para diferentes números de pares
    if (totalPairs <= 4) {
        gameContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
    } else if (totalPairs <= 6) {
        gameContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
    } else if (totalPairs <= 8) {
        gameContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
    } else {
        gameContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
    }
}

// Inicialização
function init() {
    // Resetar contadores
    moves = 0;
    seconds = 0;
    minutes = 0;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    locked = false;
    
    // Atualizar UI
    movesCount.textContent = moves;
    timeValue.textContent = '00:00';
    
    // Obter número de pares selecionado
    totalPairs = parseInt(pairsSelect.value);
    updateBestScoreDisplay();
    
    // Criar cartas
    createCards();
    
    // Iniciar timer
    clearInterval(timer);
    timer = setInterval(updateTime, 1000);
    
    // Esconder popup
    popup.classList.add('hide');
}

// Embaralhar array (algoritmo Fisher-Yates)
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Atualizar timer
function updateTime() {
    seconds++;
    if (seconds === 60) {
        minutes++;
        seconds = 0;
    }
    
    // Formatar tempo
    const secondsValue = seconds < 10 ? `0${seconds}` : seconds;
    const minutesValue = minutes < 10 ? `0${minutes}` : minutes;
    
    timeValue.textContent = `${minutesValue}:${secondsValue}`;
}

// Reproduzir som
function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Erro ao reproduzir som:", e));
}

// Virar carta
function flipCard(card) {
    if (locked || card.classList.contains('flipped') || card === firstCard) return;
    
    // Som de virar carta
    playSound(flipSound);
    
    card.classList.add('flipped');
    
    if (!firstCard) {
        // Primeira carta selecionada
        firstCard = card;
    } else {
        // Segunda carta selecionada
        secondCard = card;
        
        // Incrementar contador de movimentos
        moves++;
        movesCount.textContent = moves;
        
        // Verificar se as cartas são iguais
        checkMatch();
    }
}

// Verificar se as cartas são iguais
function checkMatch() {
    // Comparar os ícones das cartas
    const firstCardIcon = firstCard.querySelector('.card-back i').className;
    const secondCardIcon = secondCard.querySelector('.card-back i').className;
    
    const isMatch = firstCardIcon === secondCardIcon;
    
    if (isMatch) {
        // Som de acerto
        playSound(matchSound);
        
        // Marcar como encontradas
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        
        // Mostrar mensagem de incentivo
        const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        showFeedback(randomMessage);
        
        // Resetar seleção
        resetSelection();
        
        // Incrementar pares encontrados
        matchedPairs++;
        
        // Verificar se o jogo acabou
        if (matchedPairs === totalPairs) {
            setTimeout(() => {
                endGame();
            }, 1000);
        }
    } else {
        // Som de erro
        playSound(errorSound);
        
        // Adicionar classe de erro para animação
        firstCard.classList.add('wrong');
        secondCard.classList.add('wrong');
        
        // Bloquear temporariamente
        locked = true;
        
        // Virar as cartas de volta após um tempo
        setTimeout(() => {
            firstCard.classList.remove('flipped', 'wrong');
            secondCard.classList.remove('flipped', 'wrong');
            resetSelection();
        }, 1000);
    }
}

// Resetar seleção de cartas
function resetSelection() {
    firstCard = null;
    secondCard = null;
    locked = false;
}

// Gerar mensagem de desempenho
function generatePerformanceMessage() {
    if (moves <= totalPairs * 2) {
        return "Memória incrível! Você é um gênio!";
    } else if (moves <= totalPairs * 3) {
        return "Excelente! Sua memória é impressionante!";
    } else if (moves <= totalPairs * 4) {
        return "Muito bom! Continue praticando!";
    } else {
        return "Bom trabalho! Tente novamente para melhorar seu recorde!";
    }
}

// Finalizar jogo
function endGame() {
    clearInterval(timer);
    
    // Som de vitória
    playSound(winSound);
    
    // Salvar melhor pontuação
    saveBestScore();
    
    // Atualizar popup
    finalTime.textContent = timeValue.textContent;
    finalMoves.textContent = moves;
    performanceMessage.textContent = generatePerformanceMessage();
    
    // Mostrar popup
    popup.classList.remove('hide');
}

// Event Listeners
restartButton.addEventListener('click', init);
playAgainButton.addEventListener('click', init);
pairsSelect.addEventListener('change', init);

// Iniciar jogo
window.addEventListener('load', () => {
    loadBestScores();
    init();
});