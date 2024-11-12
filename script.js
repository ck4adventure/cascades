const width = 8;
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
let score = 0;
let squares = [];
const colors = ['1', '2', '3', '4', '5'];
let isPlayerBlocked = false;

// Initialize the board with no initial matches
function createBoard() {
    for (let i = 0; i < width * width; i++) {
        const square = document.createElement('div');
        square.classList.add('tile');

        let randomColor;
        do {
            randomColor = colors[Math.floor(Math.random() * colors.length)];
            square.dataset.type = randomColor;
        } while (check
