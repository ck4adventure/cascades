// the game should instantiate a board with the correct width and height

import Tile from './Tile.js';

class Board {
	constructor(height = 8, width = 8) {
		this.height = height;
		this.width = width;
		this.squares = [];
		this.colors = ['1', '2', '3', '4', '5', '6', '7'];
		this.gameBoardEl = document.getElementById("game-board");
		this.createBoard();
	}

	// createBoard fills the squares arr with tiles
	// tiles must be ensured to notbe three in a row vert or horz
	createBoard() {
		// iterate width by height to fill the board
		for (let i = 0; i < this.width * this.height; i++) {
			// pick a random color/dataset-type by indexing into the colors array
			let randomColor;
			do {
				randomColor = this.getRandomColor();
			} while (this.isThreeInARow(i, randomColor));

			let square = new Tile(randomColor, i);
			this.gameBoardEl.appendChild(square.element);
			this.squares.push(square);
		}
	}

	// isThreeInARow checks only for 3 in a row vert or horz
	// returns bool
	isThreeInARow(index, colorType) {
		// Horizontal check
		if (index % this.width > 1) {
			const leftTwo = index - 2;
			const leftOne = index - 1;
			if (leftTwo >= 0 && this.squares[leftTwo] && this.squares[leftTwo].element.dataset.type === colorType &&
				leftOne >= 0 && this.squares[leftOne] && this.squares[leftOne].element.dataset.type === colorType) {
				return true;
			}
		}

		// Vertical check
		if (index >= 2 * this.width) {
			const aboveTwo = index - 2 * this.width;
			const aboveOne = index - this.width;
			if (aboveTwo >= 0 && this.squares[aboveTwo] && this.squares[aboveTwo].element.dataset.type === colorType &&
				aboveOne >= 0 && this.squares[aboveOne] && this.squares[aboveOne].element.dataset.type === colorType) {
				return true;
			}
		}

		return false;
	}

	getRandomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }
}

export default Board;