// 1. create a board with random tiles
// 2. be able to switch tiles
const width = 8;
const height = 8;
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
			randomColor = getRandomColor();
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

		// debugging to check square type
		// square.addEventListener('mouseover', showSquareType);
		// square.addEventListener('mouseout', hideSquareType);

		// Add touch event listeners
		square.addEventListener('touchstart', handleTouchStart);
		square.addEventListener('touchmove', handleTouchMove);
		square.addEventListener('touchend', handleTouchEnd);
		square.addEventListener('touchcancel', handleTouchCancel);

		gameBoard.appendChild(square);
		squares.push(square);

	}
}

function showSquareType(e) {
	const squareId = e.target.id;
	const square = squares[squareId];
	const tooltip = document.getElementById('tooltip');
	tooltip.textContent = `Type: ${square.dataset.type}`;
	tooltip.style.display = 'block';
	tooltip.style.left = `${e.pageX + 10}px`;
	tooltip.style.top = `${e.pageY + 10}px`;
}

function hideSquareType() {
	const tooltip = document.getElementById('tooltip');
	tooltip.style.display = 'none';
}

function getRandomColor() {
	return colors[Math.floor(Math.random() * colors.length)];
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

// mobile
function handleTouchStart(e) {
	colorTypeBeingDragged = this.dataset.type;
	squareIdBeingDragged = parseInt(this.id);
}

function handleTouchMove(e) {
    e.preventDefault(); // Prevent default scrolling behavior

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.classList.contains('tile')) {
        colorTypeBeingReplaced = element.dataset.type;
        squareIdBeingReplaced = parseInt(element.id);
    }
}

// TODO refactor into single function for touchEnd and dragDrop
// handleTouchEnd is for a successful switch where players finger comes up
function handleTouchEnd(e) {
	// rerun the entire check in case user drags square around
	console.log('Touch end:', squareIdBeingReplaced);





	// Define valid moves and check for edge cases
	// valid is only one square in each direction
	// but it should also be part of a match horz/vertical
	if (isValidMove(squareIdBeingDragged, squareIdBeingReplaced) && makesThreeInARow(squareIdBeingReplaced, colorTypeBeingDragged)) {
		// if valid, try the swap
		squares[squareIdBeingDragged].dataset.type = colorTypeBeingReplaced;
		// squares[squareIdBeingReplaced].dataset.type = colorTypeBeingDragged;

		// everything is allowed to disappear together
		const horz1 = removeMatchingHorzTiles(squareIdBeingReplaced, colorTypeBeingDragged);
		const horz2 = removeMatchingHorzTiles(squareIdBeingDragged, colorTypeBeingReplaced);
		const verts1 = removeMatchingVertTiles(squareIdBeingReplaced, colorTypeBeingDragged);
		const verts2 = removeMatchingVertTiles(squareIdBeingDragged, colorTypeBeingReplaced);

		// const all = [...horz1, ...horz2, ...verts1, ...verts2];
		// all.sort();

		moveDown();

	} else {
        // Reset variables if the move is not valid
        colorTypeBeingDragged = null;
        squareIdBeingDragged = null;
        colorTypeBeingReplaced = null;
        squareIdBeingReplaced = null;
    }
}

function handleTouchCancel(e) {
    console.log('Touch cancel');
    // Reset variables
    colorTypeBeingDragged = null;
    squareIdBeingDragged = null;
    colorTypeBeingReplaced = null;
    squareIdBeingReplaced = null;
}
// dragStart identifies the square chosen by the player's click
function dragStart(e) {
	colorTypeBeingDragged = this.dataset.type;
	squareIdBeingDragged = parseInt(this.id);
}

// dragOver needs to ensure a valid drop target
function dragOver(e) {
	colorTypeBeingReplaced = this.dataset.type;
	squareIdBeingReplaced = parseInt(this.id);


	if (isValidMove(squareIdBeingDragged, squareIdBeingReplaced) && makesThreeInARow(squareIdBeingReplaced, colorTypeBeingDragged)) {
		e.preventDefault(e)
	}
}


// makesThreeInARow checks around the index specified
function makesThreeInARow(index, colorType) {
	// Horizontal check
	const rowStart = Math.floor(index / width) * width;
	const rowEnd = rowStart + width;
	let horizontalCount = 1;

	// Check left
	for (let i = index - 1; i >= rowStart && squares[i].dataset.type === colorType; i--) {
		horizontalCount++;
	}
	// Check right
	for (let i = index + 1; i < rowEnd && squares[i].dataset.type === colorType; i++) {
		horizontalCount++;
	}
	if (horizontalCount >= 3) return true;

	// Vertical check
	let verticalCount = 1;

	// Check up
	for (let i = index - width; i >= 0 && squares[i].dataset.type === colorType; i -= width) {
		verticalCount++;
	}
	// Check down
	for (let i = index + width; i < width * height && squares[i].dataset.type === colorType; i += width) {
		verticalCount++;
	}
	if (verticalCount >= 3) return true;

	return false;
}

// dragEnd is a cleanup function of drag n drop api
function dragEnd() {
	// this should fire last apparently, as a cleanup function
	// I think function for move and clear can trigger here
}

// drop fires only if valid drop target under mouse on end
function dragDrop(e) {
	// rerun the entire check in case user drags square around
	colorTypeBeingReplaced = this.dataset.type;
	squareIdBeingReplaced = parseInt(this.id);


	// Define valid moves and check for edge cases
	// valid is only one square in each direction
	// but it should also be part of a match horz/vertical
	const validMove = isValidMove(squareIdBeingDragged, squareIdBeingReplaced)
	if (validMove && makesThreeInARow(squareIdBeingReplaced, colorTypeBeingDragged)) {
		// if valid, try the swap
		squares[squareIdBeingDragged].dataset.type = colorTypeBeingReplaced;
		// squares[squareIdBeingReplaced].dataset.type = colorTypeBeingDragged;

		// everything is allowed to disappear together
		const horz1 = removeMatchingHorzTiles(squareIdBeingReplaced, colorTypeBeingDragged);
		const horz2 = removeMatchingHorzTiles(squareIdBeingDragged, colorTypeBeingReplaced);
		const verts1 = removeMatchingVertTiles(squareIdBeingReplaced, colorTypeBeingDragged);
		const verts2 = removeMatchingVertTiles(squareIdBeingDragged, colorTypeBeingReplaced);

		// const all = [...horz1, ...horz2, ...verts1, ...verts2];
		// all.sort();

		moveDown();

	}

}

function isValidMove(squareIdBeingDragged, squareIdBeingReplaced) {
	const draggedRow = Math.floor(squareIdBeingDragged / width);
	const draggedCol = squareIdBeingDragged % width;

	return (
		(squareIdBeingReplaced === squareIdBeingDragged - 1 && draggedCol > 0) || // Left
		(squareIdBeingReplaced === squareIdBeingDragged + 1 && draggedCol < width - 1) || // Right
		(squareIdBeingReplaced === squareIdBeingDragged - width && draggedRow > 0) || // Up
		(squareIdBeingReplaced === squareIdBeingDragged + width && draggedRow < height - 1) // Down
	);
}


// removeMatchingTiles starts with squareIdBeingReplaced
// it needs to look left, right, up, down to edges of board
// all touching tiles to index of same type are taken off the board
// and colorTypes need to shift downwards on the board
function removeMatchingHorzTiles(squareID, type) {
	// board pattern
	//  0  1  2  3  4  5  6  7
	//  8  9 10 11 12 13 14 15
	// 16 17 18 19 20 21 22 23
	// 24 25 26 27 28 29 30 31 ...


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
		horzMatchIDs.forEach(id => {
			squares[id].dataset.type = "null";
		})

		return horzMatchIDs;
	}

	return [];

}

function removeMatchingVertTiles(squareID, type) {
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
	while (down < squares.length && squares[down].dataset.type === type) {
		vertMatchIDs.push(down);
		down += width;
	}


	if (vertMatchIDs.length >= 3) {
		vertMatchIDs.forEach(id => {
			squares[id].dataset.type = "null";
		})
		return vertMatchIDs;
	}

	return [];
}

// animate fill should make things wait while animation runs
function animateFill(element, color) {
	return new Promise((resolve) => {
		element.classList.add('fill');
		element.dataset.type = color;
		setTimeout(() => {
			element.classList.remove('fill');
			resolve();
		}, 300); // Match the duration of the CSS animation
	});
}

// moveDown probably should start at highest index deleted
// but for now can start at bottom and work through it all
// moveDown looks for any nulled indexes and shifts the squares colors downward by col
async function moveDown() {
	const bottomLeft = squares.length - width;
	let emptyIndexes = [];

	for (let i = squares.length - 1, col = 7; i >= bottomLeft; i--, col--) {
		let current = i;

		while (current >= 0) {
			const value = squares[current].dataset.type;
			if (value === "null") {
				emptyIndexes.push(current);
			} else if (value !== "null" && emptyIndexes.length > 0) {
				const colorFound = squares[current].dataset.type;
				const nextUP = emptyIndexes.shift();
				squares[current].dataset.type = "null";
				emptyIndexes.push(current);

				// apply fill animation
				await animateFill(squares[nextUP], colorFound);
			}
			current -= width;
		}

		// Fill the top row with new pieces if needed
		while (emptyIndexes.length > 0) {
			const nextUp = emptyIndexes.shift();
			const newColor = getRandomColor();
			await animateFill(squares[nextUp], newColor);
		}
	}

	findCascadeMatches();
}

// findCascadeMatches
// always starting from the bottom up, find the first set of 3
// findCascadeMatches starts from the bottom right and searches for all matches
function findCascadeMatches() {

	let matchesFound = false;

	for (let index = squares.length - 1; index >= 0; index--) {

		// const lowest = newIndexes.pop();

		const type = squares[index].dataset.type;

		let vertMatchIDs = [index];
		// up
		let up = index - width;
		while (up >= 0 && squares[up].dataset.type === type) {
			vertMatchIDs.push(up);
			up -= width;
		}
		// down
		let down = index + width;
		while (down < squares.length && squares[down].dataset.type === type) {
			vertMatchIDs.push(down);
			down += width;
		}

		let horzMatchIDs = [index];
		const leftMoves = index % width; // ie 11 % 8 = 3
		const leftMostIndex = index - leftMoves; // 11 - 3 = 8
		const rightMoves = width - leftMoves - 1; // 8 - 3 - 1 = 4
		const rightMostIndex = index + rightMoves; // 11 + 4 = 15

		// left
		let left = index - 1;
		while (left >= leftMostIndex && squares[left].dataset.type === type) {
			horzMatchIDs.push(left);
			left--;
		}
		// right
		let right = index + 1;
		while (right <= rightMostIndex && squares[right].dataset.type === type) {
			horzMatchIDs.push(right);
			right++;
		}


		if (horzMatchIDs.length >= 3) {
			matchesFound = true;
			horzMatchIDs.forEach(id => {
				squares[id].dataset.type = "null";
			})
		}

		if (vertMatchIDs.length >= 3) {
			matchesFound = true;
			vertMatchIDs.forEach(id => {
				squares[id].dataset.type = "null";
			})
		}

	}

	// if it's been flipped to true, do another move down
	if (matchesFound) {
		// console.log("cascade matches were found, should move down");
		moveDown();
	}

}


// attach resetGame function to reset button
document.getElementById('reset-button').addEventListener('click', resetGame);

function resetGame() {
	squares = []; // take out color data
	gameBoard.innerHTML = ''; // Clear the board display
	createBoard();
}

document.getElementById('how-to-button').addEventListener('click', showRulesModal);

// Function to show the rules modal
function showRulesModal() {
    const modal = document.getElementById('how-to-modal');
    modal.style.display = 'block';
}

// Function to hide the rules modal
function hideRulesModal() {
    const modal = document.getElementById('how-to-modal');
    modal.style.display = 'none';
}

// Event listener for the close button
document.querySelector('.close-button').addEventListener('click', hideRulesModal);

// Event listener to close the modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('rules-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

createBoard();