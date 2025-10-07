# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chinese poker card game called "交公粮" (Jiao Gong Liang - "Paying Grain Tax"), a three-player card game popular in southwestern Henan province. The game is implemented as a web application with one human player and two AI players.

## Development Commands

```bash
# Run tests
npm test

# Run a specific test file
npm test -- tests/card.test.js
```

## Architecture

The codebase follows an MVC pattern with these key modules:

### Core Components
- **GameEngine** (`js/GameEngine.js`): Central game controller managing game flow, rules, and state transitions
- **EventBus** (`js/EventBus.js`): Pub/sub system for decoupled communication between modules
- **CardManager** (`js/CardManager.js`): Handles card operations, shuffling, dealing, and pattern validation
- **AIManager** (`js/AIManager.js`): AI decision-making logic for computer players
- **UIManager** (`js/UIManager.js`): Handles UI updates and user interactions

### Data Models (`js/models/`)
- **Card**: Card entity with suit, rank, value properties
- **Player**: Player entity with cards, AI/human flag, and game state
- **GameState**: Central game state tracking players, current turn, last play, and tribute rules

### Game Rules
- 3 players, 18 cards each from a 54-card deck (including jokers)
- Valid plays: single cards, pairs, three-of-a-kind (no straights, flushes, or combinations)
- Players must follow the same card type or pass
- Winner is first to empty their hand
- Special "tribute" rules where loser gives highest card to winner

## Testing Approach

Tests use Jest with jsdom environment for DOM manipulation. Test files are in `tests/` directory and follow the pattern `*.test.js`. The test setup includes DOM mocking in `tests/setup.js`.

## Key Implementation Details

- Game initialization happens in `js/main.js` which creates all managers and starts the game
- All modules communicate through the EventBus to maintain loose coupling
- AI players make decisions based on game state analysis and card evaluation
- The tribute system (交粮) is a core feature where specific rules determine card exchange between winner and loser