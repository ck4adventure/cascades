// board pattern:
//  0  1  2  3  4  5  6  7
//  8  9 10 11 12 13 14 15
// 16 17 18 19 20 21 22 23
// 24 25 26 27 28 29 30 31 ...

class Board {
	constructor(width, height, colors) {
		this.width = width;
		this.height = height;
		this.colors = colors;
		this.grid = new Array(width * height).fill('null');
	}

	getRandomColor() {
		return this.colors[Math.floor(Math.random() * this.colors.length)];
	}

	// Only checks left and up — used during initialization to avoid initial matches
	isThreeInARow(index, colorType) {
		const { width, grid } = this;
		if (index % width > 1 && grid[index - 2] === colorType && grid[index - 1] === colorType) return true;
		if (index >= 2 * width && grid[index - width] === colorType && grid[index - 2 * width] === colorType) return true;
		return false;
	}

	// Checks all directions — used to validate that a swap creates a match
	makesThreeInARow(index, colorType) {
		const { width, height, grid } = this;
		const rowStart = Math.floor(index / width) * width;
		const rowEnd = rowStart + width;

		let h = 1;
		for (let i = index - 1; i >= rowStart && grid[i] === colorType; i--) h++;
		for (let i = index + 1; i < rowEnd && grid[i] === colorType; i++) h++;
		if (h >= 3) return true;

		let v = 1;
		for (let i = index - width; i >= 0 && grid[i] === colorType; i -= width) v++;
		for (let i = index + width; i < width * height && grid[i] === colorType; i += width) v++;
		return v >= 3;
	}

	isValidMove(dragId, replaceId) {
		const { width, height } = this;
		const dragRow = Math.floor(dragId / width);
		const dragCol = dragId % width;
		return (
			(replaceId === dragId - 1 && dragCol > 0) ||
			(replaceId === dragId + 1 && dragCol < width - 1) ||
			(replaceId === dragId - width && dragRow > 0) ||
			(replaceId === dragId + width && dragRow < height - 1)
		);
	}

	removeMatchingHorzTiles(squareID, type) {
		const { width, grid } = this;
		const leftMostIndex = squareID - (squareID % width);
		const rightMostIndex = squareID + (width - (squareID % width) - 1);

		const ids = [squareID];
		for (let l = squareID - 1; l >= leftMostIndex && grid[l] === type; l--) ids.push(l);
		for (let r = squareID + 1; r <= rightMostIndex && grid[r] === type; r++) ids.push(r);

		if (ids.length >= 3) {
			ids.forEach(id => { grid[id] = 'null'; });
			return ids;
		}
		return [];
	}

	removeMatchingVertTiles(squareID, type) {
		const { width, grid } = this;
		const ids = [squareID];
		for (let u = squareID - width; u >= 0 && grid[u] === type; u -= width) ids.push(u);
		for (let d = squareID + width; d < grid.length && grid[d] === type; d += width) ids.push(d);

		if (ids.length >= 3) {
			ids.forEach(id => { grid[id] = 'null'; });
			return ids;
		}
		return [];
	}

	// Finds all cascade matches, clears them in grid, returns Set of matched IDs
	findCascadeMatches() {
		const { width, grid } = this;
		const matched = new Set();

		for (let index = grid.length - 1; index >= 0; index--) {
			const type = grid[index];
			if (type === 'null') continue;

			const verts = [index];
			for (let u = index - width; u >= 0 && grid[u] === type; u -= width) verts.push(u);
			for (let d = index + width; d < grid.length && grid[d] === type; d += width) verts.push(d);
			if (verts.length >= 3) verts.forEach(id => matched.add(id));

			const rowStart = Math.floor(index / width) * width;
			const rowEnd = rowStart + width;
			const horz = [index];
			for (let l = index - 1; l >= rowStart && grid[l] === type; l--) horz.push(l);
			for (let r = index + 1; r < rowEnd && grid[r] === type; r++) horz.push(r);
			if (horz.length >= 3) horz.forEach(id => matched.add(id));
		}

		matched.forEach(id => { grid[id] = 'null'; });
		return matched;
	}

	anyAvailableMoves() {
		const { width, grid } = this;
		const size = grid.length;

		for (let currIndex = 0; currIndex < size; currIndex++) {
			const type = grid[currIndex];
			if (type === 'null') continue;

			const rowStart = Math.floor(currIndex / width) * width;
			const rowEnd = rowStart + (width - 1);
			const prevRowStart = rowStart - width;
			const prevRowEnd = rowEnd - width;
			const nextRowStart = rowStart + width > size - 1 ? null : rowStart + width;
			const nextRowEnd = rowEnd + width > size - 1 ? null : rowEnd + width;

			// pair to the right
			const rightIndex = currIndex + 1;
			if (rightIndex <= rowEnd && grid[rightIndex] === type) {
				const upperLeftIndex = currIndex - width - 1;
				if (upperLeftIndex >= prevRowStart && grid[upperLeftIndex] === type) return [upperLeftIndex, currIndex, rightIndex];
				const lowerLeftIndex = currIndex + width - 1;
				if (lowerLeftIndex >= nextRowStart && grid[lowerLeftIndex] === type) return [lowerLeftIndex, currIndex, rightIndex];
				const upperRightIndex = rightIndex - width + 1;
				if (upperRightIndex <= prevRowEnd && grid[upperRightIndex] === type) return [currIndex, rightIndex, upperRightIndex];
				const lowerRightIndex = currIndex + 1 + width + 1;
				if (lowerRightIndex <= nextRowEnd && grid[lowerRightIndex] === type) return [currIndex, rightIndex, lowerRightIndex];
				const farLeftIndex = currIndex - 2;
				if (farLeftIndex >= rowStart && grid[farLeftIndex] === type) return [farLeftIndex, currIndex, rightIndex];
				const farRightIndex = currIndex + 3;
				if (farRightIndex <= rowEnd && grid[farRightIndex] === type) return [currIndex, rightIndex, farRightIndex];
			}

			// pair below
			if (currIndex < size - width) {
				const lowerIndex = currIndex + width;
				if (grid[lowerIndex] === type) {
					const upperLeftIndex = currIndex - width - 1;
					if (upperLeftIndex >= prevRowStart && grid[upperLeftIndex] === type) return [upperLeftIndex, currIndex, lowerIndex];
					const upperRightIndex = currIndex - width + 1;
					if (upperRightIndex <= prevRowEnd && upperRightIndex >= prevRowStart && grid[upperRightIndex] === type) return [upperRightIndex, currIndex, lowerIndex];
					const lowerLeftIndex = currIndex + width + width - 1;
					if (lowerLeftIndex >= nextRowStart + width && grid[lowerLeftIndex] === type) return [currIndex, lowerIndex, lowerLeftIndex];
					const lowerRightIndex = currIndex + width + width + 1;
					if (lowerRightIndex <= nextRowEnd + width && grid[lowerRightIndex] === type) return [currIndex, lowerIndex, lowerRightIndex];
					const farUpperIndex = currIndex - width - width;
					if (farUpperIndex >= 0 && grid[farUpperIndex] === type) return [farUpperIndex, currIndex, lowerIndex];
					const farLowerIndex = currIndex + (width * 3);
					if (farLowerIndex < size && grid[farLowerIndex] === type) return [currIndex, lowerIndex, farLowerIndex];
				}
			}

			// x_x pattern — horz
			const endIndex = currIndex + 2;
			if (endIndex <= rowEnd && grid[endIndex] === type) {
				const midAboveIndex = currIndex - width + 1;
				if (midAboveIndex <= prevRowEnd && midAboveIndex >= prevRowStart && grid[midAboveIndex] === type) return [currIndex, midAboveIndex, endIndex];
				const midBelowIndex = currIndex + width + 1;
				if (midBelowIndex <= nextRowEnd && midBelowIndex >= nextRowStart && grid[midBelowIndex] === type) return [currIndex, midBelowIndex, endIndex];
			}

			// x_x pattern — vert
			const belowIndex = currIndex + width + width;
			if (belowIndex < size && grid[belowIndex] === type) {
				const leftMiddleIndex = currIndex + width - 1;
				if (leftMiddleIndex >= nextRowStart && leftMiddleIndex <= nextRowEnd && grid[leftMiddleIndex] === type) return [currIndex, leftMiddleIndex, belowIndex];
				const rightMiddleIndex = currIndex + width + 1;
				if (rightMiddleIndex >= nextRowStart && rightMiddleIndex <= nextRowEnd && grid[rightMiddleIndex] === type) return [currIndex, rightMiddleIndex, belowIndex];
			}
		}

		return [];
	}

	initialize() {
		for (let i = 0; i < this.width * this.height; i++) {
			let color;
			do {
				color = this.getRandomColor();
				this.grid[i] = color;
			} while (this.isThreeInARow(i, color));
		}
	}
}

class Game {
	constructor() {
		this.board = new Board(8, 8, ['1', '2', '3', '4', '5', '6', '7']);
		this.squares = [];
		this.currentScore = 0;
		this.dropSpeed = 200;
		this.draggedId = null;
		this.draggedType = null;
		this.replacedId = null;
		this.replacedType = null;

		this.gameBoard = document.getElementById('game-board');
		this.scoreEl = document.getElementById('current-score');

		this.setupUI();
		this.createBoard();
	}

	syncTile(index) {
		this.squares[index].dataset.type = this.board.grid[index];
	}

	syncAllTiles() {
		this.board.grid.forEach((color, i) => {
			this.squares[i].dataset.type = color;
		});
	}

	updateScore(points) {
		this.currentScore += points;
		this.scoreEl.textContent = this.currentScore;
	}

	resetDragState() {
		this.draggedId = null;
		this.draggedType = null;
		this.replacedId = null;
		this.replacedType = null;
	}

	animateFill(element, color) {
		return new Promise((resolve) => {
			element.classList.add('fill');
			element.dataset.type = color;
			setTimeout(() => {
				element.classList.remove('fill');
				resolve();
			}, this.dropSpeed);
		});
	}

	createBoard() {
		this.board.initialize();
		for (let i = 0; i < this.board.width * this.board.height; i++) {
			const square = document.createElement('div');
			square.id = i;
			square.classList.add('tile');
			square.setAttribute('draggable', true);
			square.dataset.type = this.board.grid[i];

			square.addEventListener('dragstart', (e) => this.dragStart(e));
			square.addEventListener('dragenter', (e) => e.preventDefault());
			square.addEventListener('dragover', (e) => this.dragOver(e));
			square.addEventListener('drop', (e) => this.dragDrop(e));
			square.addEventListener('touchstart', (e) => this.handleTouchStart(e));
			square.addEventListener('touchmove', (e) => this.handleTouchMove(e));
			square.addEventListener('touchend', (e) => this.handleTouchEnd(e));
			square.addEventListener('touchcancel', () => this.resetDragState());

			this.gameBoard.appendChild(square);
			this.squares.push(square);
		}
	}

	dragStart(e) {
		const el = e.currentTarget;
		this.draggedType = el.dataset.type;
		this.draggedId = parseInt(el.id);
	}

	dragOver(e) {
		if (this.draggedId === null) return;
		const el = e.currentTarget;
		this.replacedType = el.dataset.type;
		this.replacedId = parseInt(el.id);

		if (this.board.isValidMove(this.draggedId, this.replacedId) &&
			this.board.makesThreeInARow(this.replacedId, this.draggedType)) {
			e.preventDefault();
		}
	}

	dragDrop(e) {
		if (this.draggedId === null) return;
		const el = e.currentTarget;
		this.replacedType = el.dataset.type;
		this.replacedId = parseInt(el.id);

		if (this.board.isValidMove(this.draggedId, this.replacedId) &&
			this.board.makesThreeInARow(this.replacedId, this.draggedType)) {
			this.board.grid[this.draggedId] = this.replacedType;
			this.board.grid[this.replacedId] = this.draggedType;
			this.syncTile(this.draggedId);
			this.syncTile(this.replacedId);

			const horz1 = this.board.removeMatchingHorzTiles(this.replacedId, this.draggedType);
			const horz2 = this.board.removeMatchingHorzTiles(this.draggedId, this.replacedType);
			const vert1 = this.board.removeMatchingVertTiles(this.replacedId, this.draggedType);
			const vert2 = this.board.removeMatchingVertTiles(this.draggedId, this.replacedType);
			this.syncAllTiles();

			const matched = new Set([...horz1, ...horz2, ...vert1, ...vert2]);
			this.updateScore(matched.size * 10);
			this.moveDown();
		}
	}

	handleTouchStart(e) {
		const el = e.currentTarget;
		this.draggedType = el.dataset.type;
		this.draggedId = parseInt(el.id);
	}

	handleTouchMove(e) {
		e.preventDefault();
		const touch = e.touches[0];
		const element = document.elementFromPoint(touch.clientX, touch.clientY);
		if (element && element.classList.contains('tile')) {
			this.replacedType = element.dataset.type;
			this.replacedId = parseInt(element.id);
		}
	}

	async handleTouchEnd(e) {
		if (this.draggedId === null) return;

		if (this.board.isValidMove(this.draggedId, this.replacedId) &&
			this.board.makesThreeInARow(this.replacedId, this.draggedType)) {
			this.board.grid[this.draggedId] = this.replacedType;
			this.syncTile(this.draggedId);
			await this.animateFill(this.squares[this.replacedId], this.draggedType);
			this.board.grid[this.replacedId] = this.draggedType;

			const horz1 = this.board.removeMatchingHorzTiles(this.replacedId, this.draggedType);
			const horz2 = this.board.removeMatchingHorzTiles(this.draggedId, this.replacedType);
			const vert1 = this.board.removeMatchingVertTiles(this.replacedId, this.draggedType);
			const vert2 = this.board.removeMatchingVertTiles(this.draggedId, this.replacedType);
			this.syncAllTiles();

			const matched = new Set([...horz1, ...horz2, ...vert1, ...vert2]);
			this.updateScore(matched.size * 10);
			this.moveDown();
		} else {
			this.resetDragState();
		}
	}

	async moveDown() {
		const { grid, width } = this.board;
		const bottomLeft = this.squares.length - width;

		for (let i = this.squares.length - 1; i >= bottomLeft; i--) {
			let emptyIndexes = [];
			let current = i;

			while (current >= 0) {
				if (grid[current] === 'null') {
					emptyIndexes.push(current);
				} else if (emptyIndexes.length > 0) {
					const color = grid[current];
					const nextUp = emptyIndexes.shift();
					grid[current] = 'null';
					emptyIndexes.push(current);
					await this.animateFill(this.squares[nextUp], color);
					grid[nextUp] = color;
				}
				current -= width;
			}

			while (emptyIndexes.length > 0) {
				const nextUp = emptyIndexes.shift();
				const newColor = this.board.getRandomColor();
				await this.animateFill(this.squares[nextUp], newColor);
				grid[nextUp] = newColor;
			}
		}

		const matched = this.board.findCascadeMatches();
		if (matched.size > 0) {
			this.syncAllTiles();
			this.updateScore(matched.size * 10);
			this.moveDown();
			return;
		}

		if (this.board.anyAvailableMoves().length < 3) {
			setTimeout(() => this.showNoMovesModal(), 500);
		}
	}

	resetGame() {
		this.squares = [];
		this.currentScore = 0;
		this.scoreEl.textContent = 0;
		this.gameBoard.innerHTML = '';
		this.board = new Board(8, 8, ['1', '2', '3', '4', '5', '6', '7']);
		this.createBoard();
	}

	showNoMovesModal() { document.getElementById('no-moves-modal').style.display = 'block'; }
	hideNoMovesModal() { document.getElementById('no-moves-modal').style.display = 'none'; }
	showRulesModal() { document.getElementById('how-to-modal').style.display = 'block'; }
	hideRulesModal() { document.getElementById('how-to-modal').style.display = 'none'; }

	setupUI() {
		document.getElementById('reset-button').addEventListener('click', () => this.resetGame());

		const slider = document.getElementById('myRange');
		slider.oninput = () => {
			this.dropSpeed = slider.max - (slider.value - slider.min);
		};

		document.getElementById('how-to-button').addEventListener('click', () => this.showRulesModal());
		document.getElementById('close-button').addEventListener('click', () => this.hideRulesModal());
		document.getElementById('x-button').addEventListener('click', () => this.hideRulesModal());
		document.getElementById('okBtn').addEventListener('click', () => this.hideNoMovesModal());
		document.getElementById('resetBtn').addEventListener('click', () => {
			this.hideNoMovesModal();
			this.resetGame();
		});

		window.addEventListener('click', (e) => {
			const modal = document.getElementById('rules-modal');
			if (e.target === modal) modal.style.display = 'none';
		});
	}
}

new Game();
