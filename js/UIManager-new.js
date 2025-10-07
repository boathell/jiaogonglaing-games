/**
 * 全新的UI管理器
 * 负责管理游戏界面和用户交互 - 重写版
 */
class UIManager {
    constructor() {
        this.eventBus = null;
        this.gameEngine = null;
        this.selectedCards = [];
        
        // DOM元素 - 确保正确获取
        this.gameContainer = document.getElementById('game-container');
        this.playerAreas = {
            '0': document.getElementById('player-0'),
            '1': document.getElementById('player-1'),
            '2': document.getElementById('player-2')
        };
        this.playAreas = {
            '0': document.getElementById('last-play'),
            '1': document.getElementById('last-play'),
            '2': document.getElementById('last-play')
        };
        this.cardCountElements = {
            '0': document.querySelector('#player-0 .card-count'),
            '1': document.querySelector('#player-1 .card-count'),
            '2': document.querySelector('#player-2 .card-count')
        };
        
        this.lastPlay = document.getElementById('last-play');
        this.gameStatus = document.getElementById('game-status');
        this.playerCards = document.getElementById('player-cards');
        this.playButton = document.getElementById('play-btn');
        this.passButton = document.getElementById('pass-btn');
        this.newGameButton = document.getElementById('new-game-btn');
        this.helpButton = document.getElementById('help-btn');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.gameResult = document.getElementById('game-result');
        this.tributeInfo = document.getElementById('tribute-info');
        this.nextRoundButton = document.getElementById('next-round-btn');
        this.helpModal = document.getElementById('help-modal');
        this.closeHelpButton = document.querySelector('.close-btn');
        
        console.log('UIManager初始化完成 - 所有DOM元素已获取');
    }
    
    init(gameEngine, eventBus) {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        
        this.bindEvents();
        this.subscribeToEvents();
        
        console.log('UIManager初始化完成');
    }
    
    bindEvents() {
        // 出牌按钮
        this.playButton.addEventListener('click', () => {
            const currentPlayer = this.gameEngine.gameState.getCurrentPlayer();
            if (currentPlayer.isHuman) {
                const selectedCards = currentPlayer.getSelectedCards();
                if (selectedCards.length > 0) {
                    this.eventBus.emit('play-cards', {
                        player: currentPlayer,
                        cards: selectedCards
                    });
                }
            }
        });
        
        // 不出按钮
        this.passButton.addEventListener('click', () => {
            const currentPlayer = this.gameEngine.gameState.getCurrentPlayer();
            if (currentPlayer.isHuman) {
                this.eventBus.emit('pass', {
                    player: currentPlayer
                });
            }
        });
        
        // 新游戏按钮
        this.newGameButton.addEventListener('click', () => {
            this.eventBus.emit('new-game');
        });
        
        // 下一局按钮
        this.nextRoundButton.addEventListener('click', () => {
            this.hideGameOverModal();
            this.eventBus.emit('next-round');
        });
        
        // 帮助按钮
        this.helpButton.addEventListener('click', () => {
            this.showHelpModal();
        });
        
        // 关闭帮助按钮
        this.closeHelpButton.addEventListener('click', () => {
            this.hideHelpModal();
        });
        
        console.log('事件绑定完成');
    }
    
    subscribeToEvents() {
        this.eventBus.on('new-game', () => {
            console.log('收到新游戏事件');
            this.eventBus.emit('game-started', {
                players: this.gameEngine.gameState.players,
                currentPlayerIndex: this.gameEngine.gameState.currentPlayerIndex
            });
        });
        this.eventBus.on('game-started', this.handleGameStarted.bind(this));
        this.eventBus.on('round-started', this.handleRoundStarted.bind(this));
        this.eventBus.on('cards-played', this.handleCardsPlayed.bind(this));
        this.eventBus.on('player-passed', this.handlePlayerPassed.bind(this));
        this.eventBus.on('turn-changed', this.handleTurnChanged.bind(this));
        this.eventBus.on('game-over', this.handleGameOver.bind(this));
        this.eventBus.on('tribute-completed', this.handleTributeCompleted.bind(this));
        this.eventBus.on('invalid-play', this.handleInvalidPlay.bind(this));
    }
    
    handleGameStarted(data) {
        const { players, currentPlayerIndex } = data;
        console.log('游戏开始事件处理');
        
        this.clearAllAreas();
        document.getElementById('game-status').textContent = '';
        
        for (const player of players) {
            this.renderPlayerCards(player);
            this.updateCardCount(player);
        }
        
        this.highlightCurrentPlayer(currentPlayerIndex);
        this.updateButtonStatus();
    }
    
    handleRoundStarted(data) {
        const { players, currentPlayerIndex } = data;
        console.log('回合开始事件处理');
        
        this.clearAllAreas();
        
        for (const player of players) {
            this.renderPlayerCards(player);
            this.updateCardCount(player);
        }
        
        this.highlightCurrentPlayer(currentPlayerIndex);
        this.updateButtonStatus();
    }
    
    handleCardsPlayed(data) {
        const { player, cards, remainingCards } = data;
        console.log(`玩家 ${player.name} 出牌:`, cards.map(c => `${c.suit}${c.rank}`));
        
        this.renderPlayArea(player.id, cards);
        this.renderPlayerCards(player);
        this.updateCardCount(player);
        this.updateButtonStatus();
    }
    
    handlePlayerPassed(data) {
        const { player } = data;
        console.log(`玩家 ${player.name} 不出`);
        
        this.showPassIndicator(player.id);
        this.updateButtonStatus();
    }
    
    handleTurnChanged(data) {
        const { currentPlayerIndex } = data;
        console.log(`回合切换到玩家 ${currentPlayerIndex}`);
        
        this.highlightCurrentPlayer(currentPlayerIndex);
        this.updateButtonStatus();
    }
    
    handleGameOver(data) {
        const { winner, loser, needTribute } = data;
        
        let message = '';
        if (winner.isHuman) {
            message = '🎉 恭喜你赢了！';
        } else {
            message = `${winner.name} 赢了！`;
        }
        
        if (needTribute) {
            message += `\n${loser.name} 需要交公粮。`;
        }
        
        this.gameResult.textContent = message;
        this.showGameOverModal();
    }
    
    handleTributeCompleted(data) {
        const { winner, loser, tributeCard, returnCard } = data;
        
        this.renderPlayerCards(winner);
        this.renderPlayerCards(loser);
        this.updateCardCount(winner);
        this.updateCardCount(loser);
    }
    
    handleInvalidPlay(data) {
        alert('无效的出牌！请检查牌型是否符合规则。');
    }
    
    renderPlayerCards(player) {
        console.log(`渲染玩家 ${player.id} (${player.name}) 的手牌，共 ${player.cards.length} 张`);
        
        const playerArea = this.playerAreas[player.id];
        if (!playerArea) {
            console.error(`找不到玩家 ${player.id} 的区域`);
            return;
        }
        
        const cardsContainer = playerArea.querySelector('.player-cards');
        if (!cardsContainer) {
            console.error(`找不到玩家 ${player.id} 的卡片容器`);
            return;
        }
        
        // 清空现有卡片
        cardsContainer.innerHTML = '';
        
        // 排序手牌
        player.sortCards();
        
        // 渲染每张卡片
        for (let i = 0; i < player.cards.length; i++) {
            const card = player.cards[i];
            const cardElement = this.createCardElement(card, player.isHuman);
            
            if (player.isHuman) {
                cardElement.addEventListener('click', () => {
                    this.handleCardClick(card, cardElement);
                });
                
                if (card.selected) {
                    cardElement.classList.add('selected');
                }
            }
            
            cardsContainer.appendChild(cardElement);
        }
        
        console.log(`玩家 ${player.name} 手牌渲染完成`);
    }
    
    createCardElement(card, isHuman) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.suit = card.suit;
        cardElement.dataset.rank = card.rank;
        
        if (isHuman) {
            // 人类玩家显示实际牌面
            const suitElement = document.createElement('div');
            suitElement.className = 'card-suit';
            suitElement.textContent = this.getSuitSymbol(card.suit);
            
            const rankElement = document.createElement('div');
            rankElement.className = 'card-rank';
            rankElement.textContent = this.getRankText(card.rank);
            
            cardElement.appendChild(suitElement);
            cardElement.appendChild(rankElement);
        } else {
            // 电脑玩家显示背面
            cardElement.style.background = 'linear-gradient(45deg, #8B4513, #A0522D)';
            cardElement.innerHTML = '🂠';
            cardElement.style.fontSize = '40px';
            cardElement.style.color = 'rgba(255,255,255,0.8)';
        }
        
        return cardElement;
    }
    
    renderPlayArea(playerId, cards) {
        const playArea = this.playAreas[playerId];
        if (!playArea) return;
        
        // 清空出牌区域
        playArea.innerHTML = '';
        
        // 渲染出的牌
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const cardElement = this.createCardElement(card, true); // 出的牌总是显示正面
            playArea.appendChild(cardElement);
        }
    }
    
    getSuitSymbol(suit) {
        switch (suit) {
            case 'hearts': return '♥';
            case 'diamonds': return '♦';
            case 'clubs': return '♣';
            case 'spades': return '♠';
            default: return '';
        }
    }
    
    getRankText(rank) {
        switch (rank) {
            case '1': return 'A';
            case '11': return 'J';
            case '12': return 'Q';
            case '13': return 'K';
            default: return rank;
        }
    }
    
    handleCardClick(card, cardElement) {
        console.log(`点击卡片: ${card.suit} ${card.rank}`);
        
        card.selected = !card.selected;
        
        if (card.selected) {
            cardElement.classList.add('selected');
        } else {
            cardElement.classList.remove('selected');
        }
        
        this.updateButtonStatus();
    }
    
    showPassIndicator(playerId) {
        const playArea = this.playAreas[playerId];
        if (!playArea) return;
        
        playArea.innerHTML = '';
        
        const passElement = document.createElement('div');
        passElement.className = 'pass-indicator';
        passElement.textContent = '不出';
        
        playArea.appendChild(passElement);
    }
    
    highlightCurrentPlayer(currentPlayerIndex) {
        // 移除所有高亮
        for (const id in this.playerAreas) {
            this.playerAreas[id].classList.remove('current-player');
        }
        
        // 高亮当前玩家
        const currentPlayerId = currentPlayerIndex.toString();
        if (this.playerAreas[currentPlayerId]) {
            this.playerAreas[currentPlayerId].classList.add('current-player');
        }
    }
    
    updateCardCount(player) {
        const cardCountElement = this.cardCountElements[player.id];
        if (cardCountElement) {
            cardCountElement.textContent = `${player.cards.length} 张牌`;
        }
    }
    
    updateButtonStatus() {
        const currentPlayer = this.gameEngine.gameState.getCurrentPlayer();
        const gameState = this.gameEngine.gameState;
        
        console.log('更新按钮状态:', {
            currentPlayer: currentPlayer.name,
            isHuman: currentPlayer.isHuman,
            phase: gameState.phase,
            selectedCards: currentPlayer.getSelectedCards().length,
            lastValidPlay: !!gameState.lastValidPlay
        });
        
        if (currentPlayer.isHuman && gameState.phase === 'PLAYING') {
            const selectedCards = currentPlayer.getSelectedCards();
            
            // 出牌按钮状态
            this.playButton.disabled = selectedCards.length === 0;
            this.playButton.textContent = selectedCards.length > 0 ? 
                `出牌 (${selectedCards.length}张)` : '出牌';
            
            // 不出按钮状态
            this.passButton.disabled = !gameState.lastValidPlay;
            
            console.log('按钮状态更新完成');
        } else {
            this.playButton.disabled = true;
            this.passButton.disabled = true;
            this.playButton.textContent = '出牌';
        }
    }
    
    clearAllAreas() {
        // 清空玩家区域
        for (const id in this.playerAreas) {
            const cardsContainer = this.playerAreas[id].querySelector('.player-cards');
            if (cardsContainer) {
                cardsContainer.innerHTML = '';
            }
        }
        
        // 清空出牌区域
        if (this.lastPlay) {
            this.lastPlay.innerHTML = '';
        }
    }
    
    showGameOverModal() {
        if (this.gameOverModal) {
            this.gameOverModal.style.display = 'flex';
        }
    }
    
    hideGameOverModal() {
        if (this.gameOverModal) {
            this.gameOverModal.style.display = 'none';
        }
    }
    
    showHelpModal() {
        if (this.helpModal) {
            this.helpModal.style.display = 'flex';
        }
    }
    
    hideHelpModal() {
        if (this.helpModal) {
            this.helpModal.style.display = 'none';
        }
    }
}