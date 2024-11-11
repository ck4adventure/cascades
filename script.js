// Game settings
const width = 8;
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
let score = 0;
let squares = [];
const colors = ['1', '2', '3', '4', '5']; // Represent different colors

// Initialize game board
function createBoard() {
    for (let i = 0; i < width * width; i++) {
        const square = document.createElement('div');
        square.classList.add('tile');
        square.dataset.type = colors[Math.floor(Math.random() * colors.length)];
        square.setAttribute('draggable', true);
        square.id = i;
        gameBoard.appendChild(square);
        squares.push(square);
    }
}

// Drag and Drop Events
let colorBeingDragged, colorBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced;

squares.forEach(square => {
    square.addEventListener('dragstart', dragStart);
    square.addEventListener('dragend', dragEnd);
    square.addEventListener('dragover', dragOver);
    square.addEventListener('dragenter', dragEnter);
    square.addEventListener('dragleave', dragLeave);
    square.addEventListener('drop', dragDrop);
});

function dragStart() {
    colorBeingDragged = this.dataset.type;
    squareIdBeingDragged = parseInt(this.id);
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {}

function dragDrop() {
    colorBeingReplaced = this.dataset.type;
    squareIdBeingReplaced = parseInt(this.id);
    squares[squareIdBeingDragged].dataset.type = colorBeingReplaced;
    squares[squareIdBeingReplaced].dataset.type = colorBeingDragged;
}

function dragEnd() {
    // Check if move is valid
    const validMoves = [
        squareIdBeingDragged - 1, 
        squareIdBeingDragged + 1,
        squareIdBeingDragged - width,
        squareIdBeingDragged + width
    ];
    const validMove = validMoves.includes(squareIdBeingReplaced);

    if (squareIdBeingReplaced && validMove) {
        squareIdBeingReplaced = null;
    } else if (squareIdBeingReplaced && !validMove) {
        squares[squareIdBeingReplaced].dataset.type = colorBeingReplaced;
        squares[squareIdBeingDragged].dataset.type = colorBeingDragged;
    } else squares[squareIdBeingDragged].dataset.type = colorBeingDragged;

    checkForMatches();
}

// Check for matches
function checkForMatches() {
    checkRowForThree();
    checkColumnForThree();
    moveDown();
}

// Check rows for matches of three
function checkRowForThree() {
    for (let i = 0; i < width * width - 2; i++) {
        if (i % width > width - 3) continue; // Skip last two columns

        const row = [i, i + 1, i + 2];
        const decidedType = squares[i].dataset.type;
        const isBlank = decidedType === '';

        if (row.every(index => squares[index].dataset.type === decidedType && !isBlank)) {
            score += row.length;
            row.forEach(index => squares[index].dataset.type = '');
            scoreDisplay.textContent = score;
        }
    }
}

// Check columns for matches of three
function checkColumnForThree() {
    for (let i = 0; i < width * (width - 2); i++) {
        const column = [i, i + width, i + width * 2];
        const decidedType = squares[i].dataset.type;
        const isBlank = decidedType === '';

        if (column.every(index => squares[index].dataset.type === decidedType && !isBlank)) {
            score += column.length;
            column.forEach(index => squares[index].dataset.type = '');
            scoreDisplay.textContent = score;
        }
    }
}

// Move pieces down to fill empty spaces
function moveDown() {
    for (let i = width * (width - 1) - 1; i >= 0; i--) {
        if (squares[i + width] && squares[i + width].dataset.type === '') {
            squares[i + width].dataset.type = squares[i].dataset.type;
            squares[i].dataset.type = '';
        }
    }

    // Fill the top row with new pieces if needed
    for (let i = 0; i < width; i++) {
        if (squares[i].dataset.type === '') {
            squares[i].dataset.type = colors[Math.floor(Math.random() * colors.length)];
        }
    }

    setTimeout(checkForMatches, 100); // Check for new matches after filling
}

// Restart Game Button
document.getElementById('reset-button').addEventListener('click', resetGame);

function resetGame() {
    score = 0;
    scoreDisplay.textContent = score;
    gameBoard.innerHTML = ''; // Clear the board
    squares = [];
    createBoard(); // Re-create the game board
}

// Initialize the game board
createBoard();
