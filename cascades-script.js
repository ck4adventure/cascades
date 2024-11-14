// 1. create a board with random tiles
// 2. be able to switch tiles
const width = 8;
const height = 10;
const gameBoard = document.getElementById("game-board");
let squares = [];
let colors = ['1', '2', '3', '4', '5', '6', '7']
let colorTypeBeingDragged, squareIdBeingDragged;
let colorTypeBeingReplaced, squareIdBeingReplaced;
// board pattern
//  0  1  2  3  4  5  6  7
//  8  9 10 11 12 13 14 15
// 16 17 18 19 20 21 22 23
// 24 25 26 27 28 29 30 31 ...

function createBoard() {
	// iterate width by height to fill the board
	for (let i = 0; i < width * height; i++) {
		// create a new div
		let square = document.createElement('div');
		// give it an id
		square.id = i;
		// add to it the tile class
		square.classList.add('tile');

		// allow it to be draggable
		square.setAttribute('draggable', true);
		// pick a random color/dataset-type by indexing into the colors array
		let randomColor;
		do {
			randomColor = colors[Math.floor(Math.random() * colors.length)];
			square.dataset.type = randomColor;
		} while (isThreeInARow(i, randomColor));

		// add event listeners here for better efficiency
		square.addEventListener('dragstart', dragStart);

		// enter and over need to prevent default so we can allow drop target
		square.addEventListener('dragenter', (e) => e.preventDefault());
		square.addEventListener('dragover', dragOver);

		// dragend is when the mouse lets go
		square.addEventListener('dragend', dragEnd);
		// drop occurs only if a valid target
		square.addEventListener('drop', dragDrop);

		gameBoard.appendChild(square);
		squares.push(square);

	}
}

// isThreeInARow should check for 3 in a row horz and vert
// returns true if the current index and color would form 3
function isThreeInARow(index, colorType) {
	// horizontal check can be simplified to only check what is to the left of it
	// allows skipping the first two indexes on the left for each row
	// index modulo width is a way to see where it sits within the row
	if (index % width > 1 && squares[index - 2].dataset.type === colorType && squares[index - 1].dataset.type === colorType) {
		return true;
	}

	// vertical check can be simplified to only check above it
	// allows skipping the first two rows of indexes for each column
	if (index >= 2 * width && squares[index - width].dataset.type === colorType && squares[index - 2 * width].dataset.type === colorType) {
		return true;
	}

	return false;
}


function dragStart(e) {
	colorTypeBeingDragged = this.dataset.type;
	squareIdBeingDragged = parseInt(this.id);
}

function dragOver(e) {
	// on enter, it should be able to know which id it is on
	// we can check here if move it valid and enable drop
	colorTypeBeingReplaced = this.dataset.type;
	squareIdBeingReplaced = parseInt(this.id);

	// Calculate the row and column of the dragged square
	const draggedRow = Math.floor(squareIdBeingDragged / width);
	const draggedCol = squareIdBeingDragged % width;

	// Define valid moves and check for edge cases
	const validMove = (
		(squareIdBeingReplaced === squareIdBeingDragged - 1 && draggedCol > 0) || // Left
		(squareIdBeingReplaced === squareIdBeingDragged + 1 && draggedCol < width - 1) || // Right
		(squareIdBeingReplaced === squareIdBeingDragged - width && draggedRow >= 0) || // Up
		(squareIdBeingReplaced === squareIdBeingDragged + width && draggedRow < height - 1) // Down
	);
	if (validMove) {
		e.preventDefault();
	}
}



// dragend fires whenever let go of mouse
function dragEnd(e) {
	// in case we have moved over many different squares, recapture id
	colorTypeBeingReplaced = this.dataset.type;
	squareIdBeingReplaced = parseInt(this.id);
	// at this point we have to check if there is an actual match
	// reversing the pieces if not
}

// drop fires only if valid drop target under mouse on end
function dragDrop(e) {
	squares[squareIdBeingReplaced].dataset.type = colorTypeBeingDragged;
	squares[squareIdBeingDragged].dataset.type = colorTypeBeingReplaced;
	// handle matches
	removeMatchingHorzTiles(squareIdBeingReplaced, colorTypeBeingDragged)
	removeMatchingHorzTiles(squareIdBeingDragged, colorTypeBeingReplaced)
	removeMatchingVertTiles(squareIdBeingReplaced, colorTypeBeingDragged)
	removeMatchingVertTiles(squareIdBeingDragged, colorTypeBeingReplaced)
}

// removeMatchingTiles starts with squareIdBeingReplaced
// it needs to look left, right, up, down to edges of board
// all touching tiles to index of same type are taken off the board
// and colorTypes need to shift downwards on the board
function removeMatchingHorzTiles(squareID, type) {
	// find left edge index
	// find right edge index
	// find top of col index
	// find bottom of col index

	// board pattern
	//  0  1  2  3  4  5  6  7
	//  8  9 10 11 12 13 14 15
	// 16 17 18 19 20 21 22 23
	// 24 25 26 27 28 29 30 31 ...

	// Calculate the row and column of the dragged square
	// const draggedRow = Math.floor(squareIdBeingDragged / width);
	// const draggedCol = squareIdBeingDragged % width;

	let horzMatchIDs = [squareID]
	const leftMoves = squareID % width; // ie 11 % 8 = 3
	const leftMostIndex = squareID - leftMoves; // 11 - 3 = 8
	const rightMoves = width - leftMoves - 1; // 8 - 3 - 1 = 4
	const rightMostIndex = squareID + rightMoves; // 11 + 4 = 15

	// left side starts with index and decrements until edge
	// continue while colorType is same, adding ids to array
	let left = squareID - 1;
	while (left >= leftMostIndex && squares[left].dataset.type === type) {
		horzMatchIDs.push(left);
		left--;
	}


	// right side starts with index and increment to edge
	// continue while colorType is same, adding ids to array
	let right = squareID + 1;
	while (right <= rightMostIndex && squares[right].dataset.type === type) {
		horzMatchIDs.push(right);
		right++;
	}

	if (horzMatchIDs.length >= 3) {
		horzMatchIDs.forEach(id => squares[id].dataset.type = null)
	}

}

function removeMatchingVertTiles(squareID, type) {
	// find left edge index
	// find right edge index
	// find top of col index
	// find bottom of col index

	// board pattern
	//  0  1  2  3  4  5  6  7
	//  8  9 10 11 12 13 14 15
	// 16 17 18 19 20 21 22 23
	// 24 25 26 27 28 29 30 31 ...


	// top side starts with index, decrementing by width until top
	// continue while colorType is same, adding ids to array
	let vertMatchIDs = [squareID];
	let up = squareID - width;
	while (up >= 0 && squares[up].dataset.type === type) {
		vertMatchIDs.push(up);
		up -= width;
	}
	// bottom side starts with index, incrementing by width until bottom row
	// continue while colorType is same, adding ids to array

	// once all touching ids that match the colorType are found
	// delete them all at once, leaving gaps on the board 
	// null square lets background color show through
	let down = squareID + width;
	while (down < squares.length && squares[down].dataset.type === type ) {
		vertMatchIDs.push(down);
		down += width;
	}


	if (vertMatchIDs.length >= 3) {
		vertMatchIDs.forEach(id => squares[id].dataset.type = null)
	}

}




createBoard();