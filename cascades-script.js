// 1. create a board with random tiles
const width = 8;
const height = 8;
const gameBoard = document.getElementById("game-board");
let squares = [];
let colors = ['1','2','3','4','5','6','7']
// board pattern
//  0  1  2  3  4  5  6  7
//  8  9 10 11 12 13 14 15
// 16 17 18 19 20 21 22 23
// 24 25 26 27 28 29 30 31 ...

function createBoard() {
	// iterate width by height to fill the board
	for (let i = 0; i < width*height; i++) {
		// create a new div
		let square = document.createElement('div');
		// give it an id
		square.id = i;
		// add to it the tile class
		square.classList.add('tile');
		// pick a random color/dataset-type by indexing into the colors array
		let randomColor;
		do {
			randomColor = colors[Math.floor(Math.random() * colors.length)];
			square.dataset.type = randomColor;
		} while (isThreeInARow(i, randomColor));

		gameBoard.appendChild(square);
		squares.push(square);

	}
}

// isThreeInARow should check for 3 in a row horz and vert
// returns true if the current index and color would form 3
function  isThreeInARow(index, colorType){
	// horizontal check can be simplified to only check what is to the left of it
	// allows skipping the first two indexes on the left for each row
	// index modulo width is a way to see where it sits within the row
	if (index % width > 1 && squares[index-2].dataset.type === colorType && squares[index-1].dataset.type === colorType) {
		return true;
	}

	// vertical check can be simplified to only check above it
	// allows skipping the first two rows of indexes for each column
	if (index >= 2 * width && squares[index-width].dataset.type === colorType && squares[index - 2 * width].dataset.type === colorType) {
		return true;
	}

	return false;
}

createBoard();