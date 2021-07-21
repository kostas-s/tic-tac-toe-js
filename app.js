"use strict"

const DisplayController = (() => {
    // Controls window hiding and popup

    const gameboardSection = document.querySelector(".gameboard")
    const overlayPanel = document.querySelector(".overlay");
    const gameOverWindow = document.querySelector(".game-over-window");
    const playerSelectWindow = document.querySelector(".player-select-window");

    const displayGameOver = (text) => {
        // Displays text in game over window, blurs background and awaits new game click

        const gameOverText = document.querySelector(".game-over-text");
        gameboardSection.classList.add("blurred");
        overlayPanel.classList.add("activated");
        gameOverWindow.classList.add("activated");
        gameOverText.innerText = text;
    }

    const hideGameOver = () => {
        // Hides game over window and un-blurs gameboard

        gameboardSection.classList.remove("blurred");
        overlayPanel.classList.remove("activated");
        gameOverWindow.classList.remove("activated");
    }

    const displayPlayerSelect = () => {
        // Displays player select window, blurs gameboard and awaits player to select
        // names and AI option.

        gameboardSection.classList.add("blurred");
        overlayPanel.classList.add("activated");
        playerSelectWindow.classList.add("activated");
    }

    const hidePlayerSelect = () => {
        // Hides player select window and un-blurs gameboard

        gameboardSection.classList.remove("blurred");
        overlayPanel.classList.remove("activated");
        playerSelectWindow.classList.remove("activated");
    }

    const setPlayer1Name = (name) => {
        const player1NameDisplay = document.querySelector(".player1-display");
        player1NameDisplay.textContent = "Player 1 (X): " + name;
    }

    const setPlayer2Name = (name) => {
        const player2NameDisplay = document.querySelector(".player2-display");
        player2NameDisplay.textContent = "Player 2 (O): " + name;
    }

    return {
        displayGameOver, hideGameOver, displayPlayerSelect, hidePlayerSelect,
        setPlayer1Name, setPlayer2Name
    };
})();

const GameBoard = (() => {
    // Contains everything related to gameboard display gameboard click handlers

    const gameboardArray = ["", "", "", "", "", "", "", "", ""];
    const gameboardSection = document.querySelector(".gameboard")

    const render = () => {
        // Refresh gameboard display

        gameboardSection.innerHTML = "";
        for (let i = 0; i < gameboardArray.length; i++) {
            const newBlock = document.createElement("div");
            newBlock.classList.add("block");
            newBlock.dataset.value = i;
            newBlock.innerText = gameboardArray[i];
            newBlock.addEventListener("click", (evt) => { clickedBlock(evt.target) });
            gameboardSection.appendChild(newBlock);
        }
    }


    const clickedBlock = (target) => {
        // Check if block occupied call to advance turn accordingly
        // Ignore click if CPU's turn

        if (GameController.getPlayerFromSymbol(GameController.currentTurnSymbol()).cpu === "true") {
            return;
        }
        if (target.innerText === "") {
            gameboardArray[target.dataset.value] = GameController.currentTurnSymbol();
            target.innerText = GameController.currentTurnSymbol();
            GameController.newTurn();
        }
    }


    const clearArray = () => {
        // Clears array WITHOUT refreshing. Don't forget to refresh calling render

        for (let i = 0; i < gameboardArray.length; i++) {
            gameboardArray[i] = "";
        }
    }

    const getValueAt = (i) => {
        return gameboardArray[i];
    }

    const setValueAt = (i, value) => {
        gameboardArray[i] = value;
    }

    const isFull = () => {
        for (let value of gameboardArray) {
            if (value === "") {
                return false;
            }
        }
        return true;
    }

    const getGameboardArray = () => {
        return gameboardArray
    }

    return { render, clearArray, setValueAt, getValueAt, isFull, getGameboardArray };
})();


const GameController = (() => {
    // Contains all game logic, win conditions and turn management

    let player1 = null;
    let player2 = null;
    let gameOver = false;

    const btnNewGame = document.querySelector(".btn-new-game");
    btnNewGame.addEventListener("click", () => newGame());

    const btnStartGame = document.querySelector(".btn-start-game");
    btnStartGame.addEventListener("click", () => _startGame());

    const nextTurnSymbolDisplay = document.querySelector(".next-turn-symbol");
    let nextTurnSymbol = "X";

    const newGame = () => {
        DisplayController.hideGameOver();
        DisplayController.displayPlayerSelect();
    }

    const _getPlayerInfo = () => {
        // Reads player info from form, creates Player objects
        // and assigns into player1 and player2 variables

        let player1Name = document.querySelector("#player1-name").value || "John Doe";
        let player2Name = document.querySelector("#player2-name").value || "Jane Doe";

        let player1CPU = document.querySelector("#player1-cpu").dataset.cpu;
        let player2CPU = document.querySelector("#player2-cpu").dataset.cpu;

        DisplayController.setPlayer1Name(player1Name);
        DisplayController.setPlayer2Name(player2Name);

        player1 = PlayerFactory(player1Name, player1CPU);
        player2 = PlayerFactory(player2Name, player2CPU);
    }

    const _startGame = () => {
        // New game, clears board and starts next turn
        _getPlayerInfo();
        DisplayController.hidePlayerSelect();
        GameBoard.clearArray();
        GameBoard.render();
        gameOver = false;
        nextTurnSymbol = "O";
        newTurn();
    };


    const newTurn = () => {
        // Advances turn and calls to evaluate game
        _evaluateGame();
        if (!gameOver) {
            (nextTurnSymbol === "X") ? nextTurnSymbol = "O" : nextTurnSymbol = "X"
            nextTurnSymbolDisplay.innerText = nextTurnSymbol;
            if (getPlayerFromSymbol(nextTurnSymbol).cpu === "true" && !GameBoard.isFull()) {
                _cpuTurn();
            }
        }
    };

    const _evaluateMoveWins = (index, move) => {
        const testingGameBoard = [...GameBoard.getGameboardArray()];
        testingGameBoard[index] = move;
        const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]]
        for (let condition of winConditions) {
            if (testingGameBoard[condition[0]] === "") continue;
            if (testingGameBoard[condition[0]] ===
                testingGameBoard[condition[1]]
                && testingGameBoard[condition[1]] ===
                testingGameBoard[condition[2]]) {
                return true;
            }
        }
        return false;
    }

    const _cpuTurn = () => {
        // Find all empty blocks and store in array

        const allBlocks = Array.from(document.querySelectorAll(".block"));
        const freeBlocks = allBlocks.filter(b => b.innerText === "");

        // Pick block after 1 sec
        setTimeout(() => {
            let pickedBlock = null;
            let currentTurn = currentTurnSymbol();
            let otherTurn;
            (currentTurn === "X") ? otherTurn = "O" : otherTurn = "X";

            // CPU Picks winning move if there is one
            for (let block of freeBlocks) {
                if (_evaluateMoveWins(block.dataset.value, currentTurn)) {
                    pickedBlock = block;
                    console.log(currentTurn + " found winning move!!");
                    break;
                }
            }

            // If no winning move is found, check if other player is about to win and block him
            if (pickedBlock === null) {
                for (let block of freeBlocks) {
                    if (_evaluateMoveWins(block.dataset.value, otherTurn)) {
                        pickedBlock = block;
                        console.log(currentTurn + " found blocking move!!");
                        break;
                    }
                }
            }

            // As a last resort, pick a random block
            if (pickedBlock === null) {
                pickedBlock = freeBlocks[Math.floor(Math.random() * freeBlocks.length)];
                console.log(currentTurn + " making random move...");
            }

            GameBoard.setValueAt(pickedBlock.dataset.value, currentTurnSymbol());
            pickedBlock.innerText = currentTurnSymbol();
            newTurn();
        }, 1000);

    }


    const getPlayerFromSymbol = (symbol) => {
        if (symbol === "X") { return player1 };
        if (symbol === "O") { return player2 };
        return null;
    }

    const _evaluateGame = () => {
        // Checks for win / draw conditions 
        const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]]
        for (let condition of winConditions) {
            if (GameBoard.getValueAt(condition[0]) === "") continue;
            if (GameBoard.getValueAt(condition[0]) ===
                GameBoard.getValueAt(condition[1])
                && GameBoard.getValueAt(condition[1]) ===
                GameBoard.getValueAt(condition[2])) {
                (GameBoard.getValueAt(condition[0]) === "X") ?
                    _playerWon(player1) : _playerWon(player2);
                return;
            }
        }

        if (GameBoard.isFull()) {
            _draw();
            return;
        }
    };

    const _playerWon = (player) => {
        gameOver = true;
        DisplayController.displayGameOver(player.name + " WINS!");
    }

    const _draw = () => {
        gameOver = true;
        DisplayController.displayGameOver("DRAW!");
    }


    // Just used to communicate current turn to GameBoard
    const currentTurnSymbol = () => {
        return nextTurnSymbol;
    };

    return { newGame, newTurn, currentTurnSymbol, player1, player2, getPlayerFromSymbol };
})();

const PlayerFactory = function (name, cpu) {
    // Construct players

    return { name, cpu };
}

const btnPlayerCPU = document.querySelectorAll(".btn-player-cpu");
// CPU Switches basic functionality

for (let btn of btnPlayerCPU) {
    btn.addEventListener("click", (evt) => {
        if (evt.target.dataset.cpu === "true") {
            evt.target.dataset.cpu = "false";
            evt.target.classList.remove("activated");
        } else {
            evt.target.dataset.cpu = "true";
            evt.target.classList.add("activated");
        }
    })
}

GameController.newGame();