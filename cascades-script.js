import { Board } from './board.js';

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
