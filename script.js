const width = 8;
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
let score = 0;
let squares = [];
const colors = ['1', '2', '3', '4', '5'];
let isPlayerBlocked = false; // To prevent player interaction during board updates

// Initialize game board without matches
function createBoard() {
    for (let i = 0; i < width * width; i++) {
        const square = document.createElement('div');
        square.classList.add('tile');

        let randomColor;
        do {
            randomColor = colors[Math.floor(Math.random() * colors.length)];
            square.dataset.type = randomColor;
        } while (checkForInitialMatch(i, randomColor)); // Prevent initial matches

        square.setAttribute('draggable', true);
        square.id = i;
        gameBoard.appendChild(square);
        squares.push(square);
    }

    addDragEventListeners();
}

// Prevent initial matches in the board setup
function checkForInitialMatch(index, color) {
    if (index % width > 1 && squares[index - 1].dataset.type === color && squares[index - 2].dataset.type === color) {
        return true;
    }
    if (index >= 2 * width && squares[index - width].dataset.type === color && squares[index - 2 * width].dataset.type === color) {
        return true;
    }
    return false;
}

// Add drag event listeners
function addDragEventListeners() {
    squares.forEach(square => {
        square.addEventListener('dragstart', dragStart);
        square.addEventListener('dragend', dragEnd);
        square.addEventListener('dragover', dragOver);
        square.addEventListener('dragenter', dragEnter);
        square.addEventListener('dragleave', dragLeave);
        square.addEventListener('drop', dragDrop);
    });
}

// Drag variables
let colorBeingDragged, colorBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced;

function dragStart() {
    if (isPlayerBlocked) return;
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
    if (isPlayerBlocked) return;
    colorBeingReplaced = this.dataset.type;
    squareIdBeingReplaced = parseInt(this.id);
    squares[squareIdBeingDragged].dataset.type = colorBeingReplaced;
    squares[squareIdBeingReplaced].dataset.type = colorBeingDragged;
}

function dragEnd() {
    if (isPlayerBlocked) return;

    const validMoves = [
        squareIdBeingDragged - 1,
        squareIdBeingDragged + 1,
        squareIdBeingDragged - width,
        squareIdBeingDragged + width
    ];

    const validMove = validMoves.includes(squareIdBeingReplaced);

    if (squareIdBeingReplaced && validMove) {
        if (checkForMatchAfterMove()) {
            isPlayerBlocked = true;
            squareIdBeingReplaced = null;
            handleMatches();
        } else {
            squares[squareIdBeingReplaced].dataset.type = colorBeingReplaced;
            squares[squareIdBeingDragged].dataset.type = colorBeingDragged;
        }
    } else {
        squares[squareIdBeingReplaced].dataset.type = colorBeingReplaced;
        squares[squareIdBeingDragged].dataset.type = colorBeingDragged;
    }
}

// Check if move creates a match
function checkForMatchAfterMove() {
    return checkExtendedRowMatch() || checkExtendedColumnMatch();
}

// Handle matches by removing tiles, shifting pieces, and checking for new matches
function handleMatches() {
    let matchesFound = checkExtendedRowMatch() || checkExtendedColumnMatch();
    if (matchesFound) {
        setTimeout(() => {
            moveDown();
            handleMatches(); // Recursively handle cascades
        }, 300);
    } else {
        isPlayerBlocked = false;
    }
}

// Extended row match checking to detect matches as far left and right as possible
function checkExtendedRowMatch() {
    let matchFound = false;

    for (let i = 0; i < width * width; i++) {
        const type = squares[i].dataset.type;
        if (type === '') continue;

        let matchIndices = [i];

        // Check left
        let left = i - 1;
        while (left >= Math.floor(i / width) * width && squares[left].dataset.type === type) {
            matchIndices.push(left);
            left--;
        }

        // Check right
        let right = i + 1;
        while (right < Math.floor(i / width) * width + width && squares[right].dataset.type === type) {
            matchIndices.push(right);
            right++;
        }

        // If we have a match of 3 or more
        if (matchIndices.length >= 3) {
            matchIndices.forEach(index => squares[index].dataset.type = ''); // Clear matched pieces
            score += matchIndices.length;
            matchFound = true;
        }
    }
    scoreDisplay.textContent = score;
    return matchFound;
}

// Extended column match checking to detect matches as far up and down as possible
function checkExtendedColumnMatch() {
    let matchFound = false;

    for (let i = 0; i < width * (width - 1); i++) {
        const type = squares[i].dataset.type;
        if (type === '') continue;

        let matchIndices = [i];

        // Check upwards
        let up = i - width;
        while (up >= 0 && squares[up].dataset.type === type) {
            matchIndices.push(up);
            up -= width;
        }

        // Check downwards
        let down = i + width;
        while (down < width * width && squares[down].dataset.type === type) {
            matchIndices.push(down);
            down += width;
        }

        // If we have a match of 3 or more
        if (matchIndices.length >= 3) {
            matchIndices.forEach(index => squares[index].dataset.type = ''); // Clear matched pieces
            score += matchIndices.length;
            matchFound = true;
        }
    }
    scoreDisplay.textContent = score;
    return matchFound;
}

// Move pieces down to fill empty spaces
function moveDown() {
    for (let i = width * (width - 1) - 1; i >= 0; i--) {
        if (squares[i].dataset.type === '' && squares[i - width] && squares[i - width].dataset.type !== '') {
            squares[i].dataset.type = squares[i - width].dataset.type;
            squares[i - width].dataset.type = '';
        }
    }

    // Refill the top row with new pieces if needed
    for (let i = 0; i < width; i++) {
        if (squares[i].dataset.type === '') {
            squares[i].dataset.type = colors[Math.floor(Math.random() * colors.length)];
        }
    }
}

// Restart Game Button
document.getElementById('reset-button').addEventListener('click', resetGame);

function resetGame() {
    score = 0;
    scoreDisplay.textContent = score;
    gameBoard.innerHTML = '';
    squares = [];
    isPlayerBlocked = false;
    createBoard();
}

// Initialize the game board
createBoard();
