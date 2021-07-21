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

    const isFull = () => {
        for (value of gameboardArray) {
            if (value === "") {
                return false;
            }
        }
        return true;
    }

    return { render, clearArray, getValueAt, isFull };
})();


const GameController = (() => {
    // Contains all game logic, win conditions and turn management

    let player1 = null;
    let player2 = null;

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
        let player1Name = document.querySelector("#player1-name").value;
        let player2Name = document.querySelector("#player2-name").value;

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
        nextTurnSymbol = "X";
        nextTurnSymbolDisplay.innerText = nextTurnSymbol;
    };


    const newTurn = () => {
        // Advances turn and calls to evaluate game

        (nextTurnSymbol === "X") ? nextTurnSymbol = "O" : nextTurnSymbol = "X"
        nextTurnSymbolDisplay.innerText = nextTurnSymbol;
        _evaluateGame();
    };


    const _evaluateGame = () => {
        // Checks for win / draw conditions 
        const winConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]]
        for (condition of winConditions) {
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
        DisplayController.displayGameOver(player.name + " WINS!");
    }

    const _draw = () => {
        DisplayController.displayGameOver("DRAW!");
    }


    // Just used to communicate current turn to GameBoard
    const currentTurnSymbol = () => {
        return nextTurnSymbol;
    };

    return { newGame, newTurn, currentTurnSymbol, player1, player2 };
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