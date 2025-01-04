// Tile is used by the Board
// it knows its index in the array (pos on board)
// and it knows its type

class Tile {
	constructor(color, index) {
		this.color = color;
		this.index = index;
		// this.row = row;
		// this.col = col;
		this.element = document.createElement('div');
		this.element.id = index;
		this.element.classList.add('tile');
		this.element.setAttribute('draggable', true);
		this.element.dataset.type = color;
	}

	swapWith(otherTile) {
		[this.type, otherTile.type] = [otherTile.type, this.type];
	}

}

export default Tile;