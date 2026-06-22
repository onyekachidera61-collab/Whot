import { shuffleArray } from '../utils/helpers.js';

const WHOT_CARDS = {
  CIRCLE: 'circle',
  TRIANGLE: 'triangle',
  SQUARE: 'square',
  STAR: 'star',
  CROSS: 'cross'
};

const SHAPES = Object.values(WHOT_CARDS);

const SPECIAL_CARDS = {
  WHOT: 'WHOT',
  HOLD_ON: 'Hold On',
  PICK_TWO: 'Pick Two',
  GENERAL_MARKET: 'General Market',
  SUSPENSION: 'Suspension',
  STAR: 'Star'
};

export class WhotCard {
  constructor(shape, number, isSpecial = false, specialType = null) {
    this.shape = shape;
    this.number = number;
    this.isSpecial = isSpecial;
    this.specialType = specialType;
  }

  canPlayOn(topCard, chosenShape = null) {
    // WHOT card can play on anything
    if (this.number === 20) return true;

    // If previous player chose a shape (WHOT 20)
    if (chosenShape) {
      return this.shape === chosenShape || this.number === 20;
    }

    // Must match shape or number
    return this.shape === topCard.shape || this.number === topCard.number;
  }
}

export class WhotDeck {
  constructor() {
    this.cards = this.createDeck();
  }

  createDeck() {
    const deck = [];

    // Create numbered cards (1-19) for each shape
    SHAPES.forEach(shape => {
      for (let i = 1; i <= 19; i++) {
        deck.push(new WhotCard(shape, i));
      }
    });

    // Add WHOT 20 cards (4 copies)
    for (let i = 0; i < 4; i++) {
      deck.push(new WhotCard(null, 20, true, SPECIAL_CARDS.WHOT));
    }

    // Add special cards (3 copies each per shape)
    SHAPES.forEach(shape => {
      // Hold On
      for (let i = 0; i < 3; i++) {
        deck.push(new WhotCard(shape, 0, true, SPECIAL_CARDS.HOLD_ON));
      }

      // Pick Two
      for (let i = 0; i < 3; i++) {
        deck.push(new WhotCard(shape, 1, true, SPECIAL_CARDS.PICK_TWO));
      }

      // General Market
      for (let i = 0; i < 3; i++) {
        deck.push(new WhotCard(shape, 2, true, SPECIAL_CARDS.GENERAL_MARKET));
      }

      // Suspension
      for (let i = 0; i < 3; i++) {
        deck.push(new WhotCard(shape, 3, true, SPECIAL_CARDS.SUSPENSION));
      }

      // Star
      for (let i = 0; i < 3; i++) {
        deck.push(new WhotCard(shape, 4, true, SPECIAL_CARDS.STAR));
      }
    });

    return shuffleArray(deck);
  }

  shuffle() {
    this.cards = shuffleArray(this.cards);
  }

  drawCard() {
    return this.cards.pop();
  }

  drawCards(count) {
    const drawn = [];
    for (let i = 0; i < count && this.cards.length > 0; i++) {
      drawn.push(this.drawCard());
    }
    return drawn;
  }

  addToBottom(cards) {
    this.cards.unshift(...shuffleArray(cards));
  }

  remainingCards() {
    return this.cards.length;
  }
}

export class WhotGame {
  constructor(playerCount, gameMode = 'free', entryFee = 0) {
    this.playerCount = playerCount;
    this.gameMode = gameMode;
    this.entryFee = entryFee;
    this.players = [];
    this.deck = new WhotDeck();
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.direction = 1; // 1 for clockwise, -1 for counterclockwise
    this.chosenShape = null;
    this.status = 'waiting'; // waiting, started, paused, ended
    this.winner = null;
    this.gameLog = [];
  }

  addPlayer(player) {
    if (this.players.length < this.playerCount) {
      player.hand = [];
      player.status = 'waiting';
      this.players.push(player);
      return true;
    }
    return false;
  }

  startGame() {
    if (this.players.length !== this.playerCount) {
      throw new Error('Not all players joined');
    }

    // Deal 4 cards to each player
    this.players.forEach(player => {
      player.hand = this.deck.drawCards(4);
      player.status = 'playing';
    });

    // Start discard pile
    let topCard = this.deck.drawCard();
    while (topCard.isSpecial) {
      this.deck.addToBottom([topCard]);
      topCard = this.deck.drawCard();
    }
    this.discardPile.push(topCard);

    this.status = 'started';
    this.log('Game started');
    return true;
  }

  playCard(playerIndex, cardIndex, chosenShape = null) {
    if (playerIndex !== this.currentPlayerIndex) {
      throw new Error('Not your turn');
    }

    const player = this.players[playerIndex];
    const card = player.hand[cardIndex];

    if (!card) {
      throw new Error('Invalid card index');
    }

    const topCard = this.discardPile[this.discardPile.length - 1];

    if (!card.canPlayOn(topCard, this.chosenShape)) {
      throw new Error('Cannot play this card');
    }

    // Remove card from player's hand
    player.hand.splice(cardIndex, 1);
    this.discardPile.push(card);

    // Reset chosen shape if not WHOT
    this.chosenShape = null;

    // Check if player won
    if (player.hand.length === 0) {
      this.winner = player;
      this.status = 'ended';
      player.status = 'won';
      this.log(`${player.username} won the game!`);
      return { gameEnded: true, winner: player };
    }

    // Handle special cards
    const result = this.handleSpecialCard(card, chosenShape);

    // Move to next player
    this.nextPlayer();

    return result;
  }

  handleSpecialCard(card, chosenShape) {
    const result = { special: null };

    if (!card.isSpecial) return result;

    switch (card.specialType) {
      case SPECIAL_CARDS.WHOT:
        this.chosenShape = chosenShape;
        result.special = 'whot';
        break;

      case SPECIAL_CARDS.HOLD_ON:
        this.nextPlayer(); // Skip next player
        result.special = 'hold_on';
        break;

      case SPECIAL_CARDS.PICK_TWO:
        const nextPlayer = this.players[this.currentPlayerIndex];
        const pickedCards = this.deck.drawCards(2);
        nextPlayer.hand.push(...pickedCards);
        result.special = 'pick_two';
        result.pickedCount = 2;
        break;

      case SPECIAL_CARDS.GENERAL_MARKET:
        this.players.forEach((player, index) => {
          if (index !== this.currentPlayerIndex) {
            player.hand.push(this.deck.drawCard());
          }
        });
        result.special = 'general_market';
        break;

      case SPECIAL_CARDS.SUSPENSION:
        this.nextPlayer(); // Skip next player
        result.special = 'suspension';
        break;

      case SPECIAL_CARDS.STAR:
        result.special = 'star';
        break;
    }

    return result;
  }

  pickCard(playerIndex) {
    if (playerIndex !== this.currentPlayerIndex) {
      throw new Error('Not your turn');
    }

    const player = this.players[playerIndex];
    const drawnCard = this.deck.drawCard();
    player.hand.push(drawnCard);

    this.log(`${player.username} picked a card`);
    this.nextPlayer();

    return drawnCard;
  }

  nextPlayer() {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + this.direction + this.playerCount) %
      this.playerCount;
  }

  changeDirection() {
    this.direction = -this.direction;
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getGameState() {
    return {
      status: this.status,
      currentPlayerIndex: this.currentPlayerIndex,
      playerCount: this.players.length,
      players: this.players.map(p => ({
        id: p.id,
        username: p.username,
        cardCount: p.hand.length,
        status: p.status
      })),
      topCard: this.discardPile[this.discardPile.length - 1],
      chosenShape: this.chosenShape,
      deckRemaining: this.deck.remainingCards(),
      winner: this.winner
    };
  }

  getPlayerHand(playerIndex) {
    return this.players[playerIndex]?.hand || [];
  }

  log(message) {
    this.gameLog.push({
      timestamp: new Date(),
      message
    });
  }
}

export default WhotGame;