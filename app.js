const DisplayController = (() => {
    // Controls window hiding and popup

    const gameboardSection = document.querySelector(".gameboard")
    const overlayPanel = document.querySelector(".overlay");
    const gameOverWindow = document.querySelector(".game-over-window");

    const displayGameOver = (text) => {
        // Displays text in game over window, blurs background and awaits new game click
        const gameOverText = document.querySelector(".game-over-text");
        gameboardSection.classList.add("blurred");
        overlayPanel.classList.add("activated");
        gameOverWindow.classList.add("activated");
        gameOverText.innerText = text;
    }

    const hideGameOver = () => {
        gameboardSection.classList.remove("blurred");
        overlayPanel.classList.remove("activated");
        gameOverWindow.classList.remove("activated");
    }

    return { displayGameOver, hideGameOver };
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

    return { render, clearArray };
})();


const GameController = (() => {
    // Contains all game logic, win conditions and turn management

    const btnNewGame = document.querySelector(".btn-new-game");
    btnNewGame.addEventListener("click", () => _newGame());


    const nextTurnSymbolDisplay = document.querySelector(".next-turn-symbol");
    let nextTurnSymbol = "X";

    const _newGame = () => {
        DisplayController.hideGameOver();
        startGame;
    }

    const startGame = () => {
        // New game, clears board and starts next turn

        GameBoard.clearArray();
        GameBoard.render();
        nextTurnSymbol = "X";
    };

    const newTurn = () => {
        // Advances turn and calls to evaluate game

        (nextTurnSymbol === "X") ? nextTurnSymbol = "O" : nextTurnSymbol = "X"
        nextTurnSymbolDisplay.innerText = nextTurnSymbol;
        evaluateGame();
    };

    const evaluateGame = () => {
        // Checks for win / draw conditions 
        DisplayController.displayGameOver("I WON");
        console.log("Check for game over...");
    };

    // Just used to communicate current turn to GameBoard
    const currentTurnSymbol = () => {
        return nextTurnSymbol;
    };

    return { startGame, newTurn, currentTurnSymbol };
})();

GameController.startGame();