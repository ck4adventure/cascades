const width = 8;
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
let score = 0;
let squares = [];
const colors = ['1', '2', '3', '4', '5', '6', '7'];
let isPlayerBlocked = false; // To block player actions during animations

// Initialize game board with no matches
// builds from the top down
function createBoard() {
		// iterate to create as many tiles as needed
    for (let i = 0; i < width * width; i++) {
        const square = document.createElement('div');
        square.classList.add('tile');

        let randomColor;
        do {
						// get a random color
            randomColor = colors[Math.floor(Math.random() * colors.length)];
						// set it, so long as it doesn't create an initial match set
						// else get a new random color
            square.dataset.type = randomColor;
        } while (checkForInitialMatch(i, randomColor)); // Prevent initial matches

				// squares move by dragging
        square.setAttribute('draggable', true);
        square.id = i;
        gameBoard.appendChild(square);
        squares.push(square);
    }
}

// checkForInitialMatch returns a bool if a row of 3 is formed vert or horz
function checkForInitialMatch(index, color) {
		// horizontal matches
		// skip first two columns, then check to the left to make sure it doesn't form three in a row
    if (index % width > 1 && squares[index - 1].dataset.type === color && squares[index - 2].dataset.type === color) {
        return true;
    }
		// vertical matches
		// skip top two lines, check the two above
    if (index >= 2 * width && squares[index - width].dataset.type === color && squares[index - 2 * width].dataset.type === color) {
        return true;
    }
    return false;
}

createBoard();