// 1. create a board with random tiles
// 2. be able to switch tiles
class CascadesGame {
	constructor(width, height) {
		this.width = 8;
		this.height = 8;
		this.gameBoard = document.getElementById("game-board");
		this.squares = [];
		this.colors = ['1', '2', '3', '4', '5', '6', '7'];
		this.colorTypeBeingDragged;
		this.squareIdBeingDragged;
		this.colorTypeBeingReplaced;
		this.squareIdBeingReplaced;
		this.currentScore = 0;
		this.dropSpeed = 200;

		this.createBoard();
		this.attachEventListeners();
	}

	createBoard() {
		// iterate width by height to fill the board
		for (let i = 0; i < this.width * this.height; i++) {
			// create a new div
			let square = document.createElement('div');
			// give it an id
			square.id = i;
			// add to it the tile class
			square.classList.add('tile');
			// Set the inner text to the index number
			// square.innerText = i;

			// allow it to be draggable
			square.setAttribute('draggable', true);
			// pick a random color/dataset-type by indexing into the colors array
			let randomColor;
			do {
				randomColor = this.getRandomColor();
				square.dataset.type = randomColor;
			} while (this.isThreeInARow(i, randomColor));

			// add event listeners here for better efficiency
			square.addEventListener('dragstart', this.dragStart.bind(this));

			// enter and over need to prevent default so we can allow drop target
			square.addEventListener('dragenter', (e) => e.preventDefault());
			square.addEventListener('dragover', this.dragOver.bind(this));

			// dragend is when the mouse lets go
			square.addEventListener('dragend', this.dragEnd.bind(this));
			// drop occurs only if a valid target
			square.addEventListener('drop', this.dragDrop.bind(this));

			// debugging to check square type
			// square.addEventListener('mouseover', showSquareType);
			// square.addEventListener('mouseout', hideSquareType);

			// Add touch event listeners
			square.addEventListener('touchstart', this.handleTouchStart);
			square.addEventListener('touchmove', this.handleTouchMove);
			square.addEventListener('touchend', this.handleTouchEnd);
			square.addEventListener('touchcancel', this.handleTouchCancel);

			this.gameBoard.appendChild(square);
			this.squares.push(square);

		}
	}

	attachEventListeners() {
		document.getElementById('reset-button').addEventListener('click', this.resetGame.bind(this));
		document.getElementById('how-to-button').addEventListener('click', this.showRulesModal.bind(this));
		document.getElementById('close-button').addEventListener('click', this.hideRulesModal.bind(this));
		document.getElementById('x-button').addEventListener('click', this.hideRulesModal.bind(this));
		document.getElementById('okBtn').addEventListener('click', this.hideNoMovesModal.bind(this));
		document.getElementById('resetBtn').addEventListener('click', () => {
			this.hideNoMovesModal();
			this.resetGame();
		});

		var slider = document.getElementById("myRange");
		slider.oninput = (function (e) {
			const reversedValue = slider.max - (e.target.value - slider.min);
			this.dropSpeed = reversedValue;
		}).bind(this);
	}

	showRulesModal() {
		const modal = document.getElementById('how-to-modal');
		modal.style.display = 'block';
	}

	hideRulesModal() {
		const modal = document.getElementById('how-to-modal');
		modal.style.display = 'none';
	}

	showNoMovesModal() {
		const modal = document.getElementById('no-moves-modal');
		modal.style.display = 'block';
	}

	hideNoMovesModal() {
		const modal = document.getElementById('no-moves-modal');
		modal.style.display = 'none';
	}

	resetGame() {
		this.squares = []; // take out color data
		this.currentScore = 0;
		this.updateScore(0);
		this.gameBoard.innerHTML = ''; // Clear the board display
		this.createBoard();
	}

	updateScore(points) {
		this.currentScore += points;
		document.getElementById('current-score').innerHTML = this.currentScore;
	}

	showSquareType(e) {
		const squareId = e.target.id;
		const square = this.squares[squareId];
		const tooltip = document.getElementById('tooltip');
		tooltip.textContent = `Type: ${square.dataset.type}`;
		tooltip.style.display = 'block';
		tooltip.style.left = `${e.pageX + 10}px`;
		tooltip.style.top = `${e.pageY + 10}px`;
	}

	hideSquareType() {
		const tooltip = document.getElementById('tooltip');
		tooltip.style.display = 'none';
	}

	getRandomColor() {
		return this.colors[Math.floor(Math.random() * this.colors.length)];
	}

	// isThreeInARow should check for 3 in a row horz and vert
	// returns true if the current index and color would form 3
	isThreeInARow(index, colorType) {
		// horizontal check can be simplified to only check what is to the left of it
		// allows skipping the first two indexes on the left for each row
		// index modulo width is a way to see where it sits within the row
		if (index % this.width > 1 && this.squares[index - 2].dataset.type === colorType && this.squares[index - 1].dataset.type === colorType) {
			return true;
		}

		// vertical check can be simplified to only check above it
		// allows skipping the first two rows of indexes for each column
		if (index >= 2 * this.width && this.squares[index - this.width].dataset.type === colorType && this.squares[index - 2 * this.width].dataset.type === colorType) {
			return true;
		}

		return false;
	}

	// makesThreeInARow checks around the index specified
	makesThreeInARow(index, colorType) {
		// Horizontal check
		const rowStart = Math.floor(index / this.width) * this.width;
		const rowEnd = rowStart + this.width;
		let horizontalCount = 1;

		// Check left
		for (let i = index - 1; i >= rowStart && this.squares[i].dataset.type === colorType; i--) {
			horizontalCount++;
		}
		// Check right
		for (let i = index + 1; i < rowEnd && this.squares[i].dataset.type === colorType; i++) {
			horizontalCount++;
		}
		if (horizontalCount >= 3) return true;

		// Vertical check
		let verticalCount = 1;

		// Check up
		for (let i = index - this.width; i >= 0 && this.squares[i].dataset.type === colorType; i -= this.width) {
			verticalCount++;
		}
		// Check down
		for (let i = index + this.width; i < this.width * this.height && this.squares[i].dataset.type === colorType; i += this.width) {
			verticalCount++;
		}
		if (verticalCount >= 3) return true;

		return false;
	}

	// mobile
	handleTouchStart(e) {
		this.colorTypeBeingDragged = this.dataset.type;
		this.squareIdBeingDragged = parseInt(e.target.id);
	}

	handleTouchMove(e) {
		e.preventDefault(); // Prevent default scrolling behavior

		const touch = e.touches[0];
		const element = document.elementFromPoint(touch.clientX, touch.clientY);

		if (element && element.classList.contains('tile')) {
			this.colorTypeBeingReplaced = element.dataset.type;
			this.squareIdBeingReplaced = parseInt(element.id);
		}
	}
	// TODO refactor into single function for touchEnd and dragDrop
	// handleTouchEnd is for a successful switch where players finger comes up
	async handleTouchEnd(e) {
		// don't have to rerun the entire check in case user drags square around

		// Define valid moves and check for edge cases
		// valid is only one square in each direction
		// but it should also be part of a match horz/vertical
		if (this.isValidMove(this.squareIdBeingDragged, this.squareIdBeingReplaced) && this.makesThreeInARow(this.squareIdBeingReplaced, this.colorTypeBeingDragged)) {
			// if valid, try the swap
			this.squares[this.squareIdBeingDragged].dataset.type = this.colorTypeBeingReplaced;
			// squares[squareIdBeingReplaced].dataset.type = colorTypeBeingDragged;
			await this.animateFill(this.squares[this.squareIdBeingReplaced], this.colorTypeBeingDragged);

			// everything is allowed to disappear together
			const horz1 = this.removeMatchingHorzTiles(this.squareIdBeingReplaced, this.colorTypeBeingDragged);
			const horz2 = this.removeMatchingHorzTiles(this.squareIdBeingDragged, this.colorTypeBeingReplaced);
			const verts1 = this.removeMatchingVertTiles(this.squareIdBeingReplaced, this.colorTypeBeingDragged);
			const verts2 = this.removeMatchingVertTiles(this.squareIdBeingDragged, this.colorTypeBeingReplaced);

			const all = [...horz1, ...horz2, ...verts1, ...verts2];

			this.updateScore(all.length * 10)
			// all.sort();

			this.moveDown();

		} else {
			// Reset variables if the move is not valid
			this.colorTypeBeingDragged = null;
			this.squareIdBeingDragged = null;
			this.colorTypeBeingReplaced = null;
			this.squareIdBeingReplaced = null;
		}
	}

	handleTouchCancel(e) {

		// Reset variables
		this.colorTypeBeingDragged = null;
		this.squareIdBeingDragged = null;
		this.colorTypeBeingReplaced = null;
		this.squareIdBeingReplaced = null;
	}

	dragStart(e) {
		this.colorTypeBeingDragged = e.target.dataset.type;
		this.squareIdBeingDragged = parseInt(e.target.id);
	}

	dragOver(e) {
		this.colorTypeBeingReplaced = e.target.dataset.type;
		this.squareIdBeingReplaced = parseInt(e.target.id);


		if (this.isValidMove(this.squareIdBeingDragged, this.squareIdBeingReplaced) && this.makesThreeInARow(this.squareIdBeingReplaced, this.colorTypeBeingDragged)) {
			e.preventDefault(e)
		}
	}

	// dragEnd is a cleanup function of drag n drop api
	dragEnd() {
		// this should fire last apparently, as a cleanup function
		// I think function for move and clear can trigger here
	}

	// drop fires only if valid drop target under mouse on end
	dragDrop(e) {
		// rerun the entire check in case user drags square around
		this.colorTypeBeingReplaced = e.target.dataset.type;
		this.squareIdBeingReplaced = parseInt(e.target.id);

		this.squares[this.squareIdBeingDragged].dataset.type = this.colorTypeBeingReplaced;
		this.squares[this.squareIdBeingReplaced].dataset.type = this.colorTypeBeingDragged;

		// Define valid moves and check for edge cases
		// valid is only one square in each direction
		// but it should also be part of a match horz/vertical
		if (this.isValidMove(this.squareIdBeingDragged, this.squareIdBeingReplaced) && this.makesThreeInARow(this.squareIdBeingReplaced, this.colorTypeBeingDragged)) {
			// if valid, try the swap
			// squares[squareIdBeingDragged].dataset.type = colorTypeBeingReplaced;
			// squares[squareIdBeingReplaced].dataset.type = colorTypeBeingDragged;

			// everything is allowed to disappear together
			const horz1 = this.removeMatchingHorzTiles(this.squareIdBeingReplaced, this.colorTypeBeingDragged);
			const horz2 = this.removeMatchingHorzTiles(this.squareIdBeingDragged, this.colorTypeBeingReplaced);
			const verts1 = this.removeMatchingVertTiles(this.squareIdBeingReplaced, this.colorTypeBeingDragged);
			const verts2 = this.removeMatchingVertTiles(this.squareIdBeingDragged, this.colorTypeBeingReplaced);

			const all = new Set([...horz1, ...horz2, ...verts1, ...verts2]);
			// all.sort();
			this.updateScore(all.size * 10)

			this.moveDown();

		} else {
			this.squares[this.squareIdBeingDragged].dataset.type = this.colorTypeBeingDragged;
			this.squares[this.squareIdBeingReplaced].dataset.type = this.colorTypeBeingReplaced;
		}

	}

	// isValidMove checks that some kind of 3 in a row can be formed
	isValidMove(squareIdBeingDragged, squareIdBeingReplaced) {
		const draggedRow = Math.floor(squareIdBeingDragged / this.width);
		const draggedCol = squareIdBeingDragged % this.width;

		return (
			(squareIdBeingReplaced === squareIdBeingDragged - 1 && draggedCol > 0) || // Left
			(squareIdBeingReplaced === squareIdBeingDragged + 1 && draggedCol < this.width - 1) || // Right
			(squareIdBeingReplaced === squareIdBeingDragged - this.width && draggedRow > 0) || // Up
			(squareIdBeingReplaced === squareIdBeingDragged + this.width && draggedRow < this.height - 1) // Down
		);
	}

	// removeMatchingTiles starts with squareIdBeingReplaced
	// it needs to look left, right, up, down to edges of board
	// all touching tiles to index of same type are taken off the board
	// and colorTypes need to shift downwards on the board
	removeMatchingHorzTiles(squareID, type) {
		// board pattern
		//  0  1  2  3  4  5  6  7
		//  8  9 10 11 12 13 14 15
		// 16 17 18 19 20 21 22 23
		// 24 25 26 27 28 29 30 31 ...


		let horzMatchIDs = [squareID]
		const leftMoves = squareID % this.width; // ie 11 % 8 = 3
		const leftMostIndex = squareID - leftMoves; // 11 - 3 = 8
		const rightMoves = this.width - leftMoves - 1; // 8 - 3 - 1 = 4
		const rightMostIndex = squareID + rightMoves; // 11 + 4 = 15

		// left side starts with index and decrements until edge
		// continue while colorType is same, adding ids to array
		let left = squareID - 1;
		while (left >= leftMostIndex && this.squares[left].dataset.type === type) {
			horzMatchIDs.push(left);
			left--;
		}


		// right side starts with index and increment to edge
		// continue while colorType is same, adding ids to array
		let right = squareID + 1;
		while (right <= rightMostIndex && this.squares[right].dataset.type === type) {
			horzMatchIDs.push(right);
			right++;
		}

		if (horzMatchIDs.length >= 3) {
			horzMatchIDs.forEach(id => {
				this.squares[id].dataset.type = "null";
			})

			return horzMatchIDs;
		}

		return [];

	}

	removeMatchingVertTiles(squareID, type) {
		// board pattern
		//  0  1  2  3  4  5  6  7
		//  8  9 10 11 12 13 14 15
		// 16 17 18 19 20 21 22 23
		// 24 25 26 27 28 29 30 31 ...


		// top side starts with index, decrementing by width until top
		// continue while colorType is same, adding ids to array
		let vertMatchIDs = [squareID];
		let up = squareID - this.width;
		while (up >= 0 && this.squares[up].dataset.type === type) {
			vertMatchIDs.push(up);
			up -= this.width;
		}
		// bottom side starts with index, incrementing by width until bottom row
		// continue while colorType is same, adding ids to array

		// once all touching ids that match the colorType are found
		// delete them all at once, leaving gaps on the board 
		// null square lets background color show through
		let down = squareID + this.width;
		while (down < this.squares.length && this.squares[down].dataset.type === type) {
			vertMatchIDs.push(down);
			down += this.width;
		}


		if (vertMatchIDs.length >= 3) {
			vertMatchIDs.forEach(id => {
				this.squares[id].dataset.type = "null";
			})
			return vertMatchIDs;
		}

		return [];
	}




	// board pattern
	//  0  1  2  3  4  5  6  7
	//  8  9 10 11 12 13 14 15
	// 16 17 18 19 20 21 22 23
	// 24 25 26 27 28 29 30 31 ...


	// animate fill should make things wait while animation runs
	animateFill(element, color) {
		return new Promise((resolve) => {
			element.classList.add('fill');
			element.dataset.type = color;
			element.style.animationDuration = `${this.dropSpeed}ms`;
			console.log(this.dropSpeed);
			setTimeout(() => {
				element.classList.remove('fill');
				resolve();
			}, this.dropSpeed); // Match the duration of the CSS animation
		});
	}

	// moveDown probably should start at highest index deleted
	// but for now can start at bottom and work through it all
	// moveDown looks for any nulled indexes and shifts the squares colors downward by col
	async moveDown() {
		const bottomLeft = this.squares.length - this.width;
		let emptyIndexes = [];

		for (let i = this.squares.length - 1, col = 7; i >= bottomLeft; i--, col--) {
			let current = i;

			while (current >= 0) {
				const value = this.squares[current].dataset.type;
				if (value === "null") {
					emptyIndexes.push(current);
				} else if (value !== "null" && emptyIndexes.length > 0) {
					const colorFound = this.squares[current].dataset.type;
					const nextUP = emptyIndexes.shift();
					this.squares[current].dataset.type = "null";
					emptyIndexes.push(current);

					// apply fill animation
					await this.animateFill(this.squares[nextUP], colorFound);
				}
				current -= this.width;
			}

			// Fill the top row with new pieces if needed
			while (emptyIndexes.length > 0) {
				const nextUp = emptyIndexes.shift();
				const newColor = this.getRandomColor();
				await this.animateFill(this.squares[nextUp], newColor);
			}
		}

		this.findCascadeMatches();

		const availIndexes = this.anyAvailableMoves();
		if (availIndexes.length < 3) {
			console.log("no moves left")
			setTimeout(() => {
				this.showNoMovesModal();
			}, 500);

		}


	}

	// always starting from the bottom up, find the first set of 3
	// findCascadeMatches starts from the bottom right and searches for all matches
	findCascadeMatches() {

		let matchesFound = false;
		let vertMatchIDs, horzMatchIDs;
		const matchesSet = new Set();

		for (let index = this.squares.length - 1; index >= 0; index--) {

			// const lowest = newIndexes.pop();

			const type = this.squares[index].dataset.type;

			vertMatchIDs = [index];
			// up
			let up = index - this.width;
			while (up >= 0 && this.squares[up].dataset.type === type) {
				vertMatchIDs.push(up);
				up -= this.width;
			}
			// down
			let down = index + this.width;
			while (down < this.squares.length && this.squares[down].dataset.type === type) {
				vertMatchIDs.push(down);
				down += this.width;
			}

			horzMatchIDs = [index];
			const leftMoves = index % this.width; // ie 11 % 8 = 3
			const leftMostIndex = index - leftMoves; // 11 - 3 = 8
			const rightMoves = this.width - leftMoves - 1; // 8 - 3 - 1 = 4
			const rightMostIndex = index + rightMoves; // 11 + 4 = 15

			// left
			let left = index - 1;
			while (left >= leftMostIndex && this.squares[left].dataset.type === type) {
				horzMatchIDs.push(left);
				left--;
			}
			// right
			let right = index + 1;
			while (right <= rightMostIndex && this.squares[right].dataset.type === type) {
				horzMatchIDs.push(right);
				right++;
			}


			if (horzMatchIDs.length >= 3) {
				matchesFound = true;
				horzMatchIDs.forEach(id => {
					this.squares[id].dataset.type = "null";
					matchesSet.add(id);
				})
			}

			if (vertMatchIDs.length >= 3) {
				matchesFound = true;
				vertMatchIDs.forEach(id => {
					this.squares[id].dataset.type = "null";
					matchesSet.add(id);
				})
			}

			vertMatchIDs = null;
			horzMatchIDs = null;

		}
		this.updateScore(matchesSet.size * 10);

		// if it's been flipped to true, do another move down
		if (matchesFound) {
			this.moveDown();
		}

	}

	// anyAvailableMoves runs through the board from top to bottom
	// returns true on first match found, returns false if gets to end and no matches found
	anyAvailableMoves() {
		// starting at the top
		for (let currIndex = 0; currIndex < this.squares.length; currIndex++) {
			const rowStart = Math.floor(currIndex / this.width) * this.width; // gre 0
			const rowEnd = rowStart + (this.width - 1);

			const prevRowStart = rowStart - this.width;
			const prevRowEnd = rowEnd - this.width;

			const nextRowStart = rowStart + this.width > this.squares.length - 1 ? null : rowStart + this.width;
			const nextRowEnd = rowEnd + this.width > this.squares.length - 1 ? null : rowEnd + this.width;

			// console.log("prev row start/end: ", prevRowStart, prevRowEnd);
			// console.log("nextRow start/end", nextRowStart, nextRowEnd);
			const currentSquare = this.squares[currIndex];

			// two in a rows
			const rightIndex = currIndex + 1;
			const rightSquare = this.squares[rightIndex];
			// horizontally
			if (rightIndex <= rowEnd && currentSquare.dataset.type === rightSquare.dataset.type) {
				// diagonal square upper left
				const upperLeftIndex = currIndex - this.width - 1;
				const upperLeftSquare = this.squares[upperLeftIndex];
				if (upperLeftIndex >= prevRowStart && upperLeftSquare && upperLeftSquare.dataset.type === currentSquare.dataset.type) {
					// console.log("upperLeftIndex");
					return [upperLeftIndex, currIndex, rightIndex];
				}
				// diag square lower left
				const lowerLeftIndex = currIndex + this.width - 1;
				const lowerLeftSquare = this.squares[lowerLeftIndex];
				if (lowerLeftIndex >= nextRowStart && lowerLeftSquare && lowerLeftSquare.dataset.type === currentSquare.dataset.type) {
					// console.log("lowerLeftIndex");	
					return [lowerLeftIndex, currIndex, rightIndex];
				}
				// diag square upper right
				const upperRightIndex = rightIndex - this.width + 1;
				const upperRightSquare = this.squares[upperRightIndex];
				if (upperRightIndex <= prevRowEnd && upperRightSquare && upperRightSquare.dataset.type === rightSquare.dataset.type) {
					// console.log("upperRightIndex");
					return [currIndex, rightIndex, upperRightIndex];
				}
				// diag square lower right
				const lowerRightIndex = currIndex + 1 + this.width + 1;
				const lowerRightSquare = this.squares[lowerRightIndex];
				// console.log("next row end ", nextRowEnd)
				if (lowerRightIndex <= nextRowEnd && lowerRightSquare && lowerRightSquare.dataset.type === rightSquare.dataset.type) {
					// console.log("lowerRightIndex");
					return [currIndex, rightIndex, lowerRightIndex];
				}
				// far left in line
				const farLeftIndex = currIndex - 2;
				const farLeftSquare = this.squares[farLeftIndex];
				if (farLeftIndex >= rowStart && farLeftSquare.dataset.type === currentSquare.dataset.type) {
					// console.log("farLeftIndex");
					return [farLeftIndex, currIndex, rightIndex];
				}

				// far right in line
				const farRightIndex = currIndex + 3;
				const farRightSquare = this.squares[farRightIndex];
				if (farRightIndex <= rowEnd && farRightSquare.dataset.type === currentSquare.dataset.type) {
					// console.log("farRightIndex");
					return [currIndex, rightIndex, farRightIndex];
				}
			}



			// two in a row vertically
			// since starting at top only have see if below matches
			if (currIndex < this.squares.length - this.width) {
				const lowerIndex = currIndex + this.width;
				const lowerSquare = this.squares[lowerIndex];
				// console.log("current index, lower square: ", currIndex, lowerIndex);
				if (lowerSquare.dataset.type === currentSquare.dataset.type) {
					// upper left
					const upperLeftIndex = currIndex - this.width - 1;
					const upperLeftSquare = this.squares[upperLeftIndex];
					if (upperLeftIndex >= prevRowStart && upperLeftSquare && upperLeftSquare.dataset.type === currentSquare.dataset.type) {
						// console.log("upperLeftIndex");
						return [upperLeftIndex, currIndex, lowerIndex];
					}
					// upper right
					const upperRightIndex = currIndex - this.width + 1;
					const upperRightSquare = this.squares[upperRightIndex];
					if (upperRightSquare && upperRightIndex <= prevRowEnd && upperRightIndex >= prevRowStart && upperRightSquare.dataset.type === currentSquare.dataset.type) {
						// console.log("upperRightIndex");
						return [upperRightIndex, currIndex, lowerIndex];
					}
					// lower left
					const lowerLeftIndex = currIndex + this.width + this.width - 1;
					const lowerLeftSquare = this.squares[lowerLeftIndex];
					if (lowerLeftIndex >= nextRowStart + this.width && lowerLeftSquare && lowerLeftSquare.dataset.type === currentSquare.dataset.type) {
						// console.log("lowerLeftIndex");
						return [currIndex, lowerIndex, lowerLeftIndex];
					}
					// lower right
					const lowerRightIndex = currIndex + this.width + this.width + 1;
					const lowerRightSquare = this.squares[lowerRightIndex];
					if (lowerRightIndex <= nextRowEnd + this.width && lowerRightSquare && lowerRightSquare.dataset.type === lowerSquare.dataset.type) {
						// console.log("lowerRightIndex");
						return [currIndex, lowerIndex, lowerRightIndex];
					}

					// far top
					const farUpperIndex = currIndex - this.width - this.width;
					const farUpperSquare = this.squares[farUpperIndex];
					if (farUpperIndex >= 0 && farUpperSquare && farUpperSquare.dataset.type === currentSquare.dataset.type) {
						// console.log("farUpperIndex");
						return [farUpperIndex, currIndex, lowerIndex];
					}

					// far bottom
					const farLowerIndex = currIndex + (this.width * 3);
					const farLowerSquare = this.squares[farLowerIndex];
					if (farLowerIndex < this.squares.length && farLowerSquare && farLowerSquare.dataset.type === currentSquare.dataset.type) {
						// console.log("farLowerIndex");
						return [currIndex, lowerIndex, farLowerIndex];
					}
				}
			}

			// 
			// if x y x, then find x in middle above or below

			// horz checks
			const endIndex = currIndex + 2;
			const endSquare = this.squares[endIndex];
			if (endIndex <= rowEnd && endSquare && endSquare.dataset.type === currentSquare.dataset.type) {
				// middle above
				const midAboveIndex = currIndex - this.width + 1;
				const midAboveSquare = this.squares[midAboveIndex];
				if (midAboveSquare && midAboveIndex <= prevRowEnd && midAboveIndex >= prevRowStart && midAboveSquare.dataset.type === currentSquare.dataset.type) {
					// console.log("middleAbove");
					return [currIndex, midAboveIndex, endIndex];
				}
				// middle below
				const midBelowIndex = currIndex + this.width + 1;
				const midBelowSquare = this.squares[midBelowIndex];
				if (midBelowIndex <= nextRowEnd && midBelowIndex >= nextRowStart && midBelowSquare.dataset.type === currentSquare.dataset.type) {
					// console.log("midBelow")
					return [currIndex, midBelowIndex, endIndex];
				}
			}

			// vert checks
			const belowIndex = currIndex + this.width + this.width;
			const belowSquare = this.squares[belowIndex];

			if (belowIndex < this.squares.length && belowSquare && belowSquare.dataset.type === currentSquare.dataset.type) {
				// left middle
				const leftMiddleIndex = currIndex + this.width - 1;
				const leftMiddleSquare = this.squares[leftMiddleIndex];
				if (leftMiddleIndex >= nextRowStart && leftMiddleIndex <= nextRowEnd && leftMiddleSquare.dataset.type === currentSquare.dataset.type) {
					// console.log("leftMiddle");
					return [currIndex, leftMiddleIndex, belowIndex];
				}
				// right middle
				const rightMiddleIndex = currIndex + this.width + 1;
				const rightMiddleSquare = this.squares[rightMiddleIndex];
				if (rightMiddleIndex >= nextRowStart && rightMiddleIndex <= nextRowEnd && rightMiddleSquare.dataset.type === currentSquare.dataset.type) {
					// console.log("rightMiddle")
					return [currIndex, rightMiddleIndex, belowIndex];
				}
			}

		}
		// if no cases above have matched
		return [];

	}

}












// var slider = document.getElementById("myRange");
// var output = document.getElementById("demo");
// output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
// slider.oninput = function () {
// 	// output.innerHTML = this.value;
// 	// change animate value
// 	const reversedValue = slider.max - (this.value - slider.min);

// 	dropSpeed = reversedValue;

// }





// document.getElementById('how-to-button').addEventListener('click', showRulesModal);

// Function to show the rules modal
// function showRulesModal() {
// 	const modal = document.getElementById('how-to-modal');
// 	modal.style.display = 'block';
// }

// document.getElementById('okBtn').addEventListener('click', hideNoMovesModal);
// document.getElementById('resetBtn').addEventListener('click', () => {
// 	hideNoMovesModal();
// 	resetGame();
// });

// Function to hide the rules modal
// function hideRulesModal() {
// 	const modal = document.getElementById('how-to-modal');
// 	modal.style.display = 'none';
// }

// Event listener for the close button
// document.getElementById('close-button').addEventListener('click', hideRulesModal);
// document.getElementById('x-button').addEventListener('click', hideRulesModal);
// Event listener to close the modal when clicking outside of it
window.addEventListener('click', function (event) {
	const modal = document.getElementById('rules-modal');
	if (event.target === modal) {
		modal.style.display = 'none';
	}
});

const game = new CascadesGame(8, 8);