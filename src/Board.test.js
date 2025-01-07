/**
 * @jest-environment jsdom
*/

import Board from './Board.js';
import Tile from './Tile.js';

describe('Board', () => {
	let board;

	beforeEach(() => {
		document.body.innerHTML = '<div id="game-board"></div>';
		board = new Board();
	});

	afterEach(() => {
		// Clean up the DOM
		document.body.innerHTML = '';
	});

	// board should have default width and height
	test('board should default to 8 wide by 8 high', () => {
		expect(board.width).toBe(8);
		expect(board.height).toBe(8);
	});

	test('board should create the correct number of tiles', () => {
		expect(board.squares.length).toBe(64); // 8 * 8
	});

	test('board should append tiles to the game board element', () => {
		const gameBoardEl = document.getElementById('game-board');
		expect(gameBoardEl.children.length).toBe(64); // 8 * 8
	});
	// board should have the set height and width if given
	test('board should be 3x3 if passed in', () => {
		const board = new Board(3, 3);
		expect(board.width).toBe(3);
		expect(board.height).toBe(3);
		expect(board.squares.length).toBe(9);
	})

	test('should create a board with no three tiles in a row', () => {
		for (let i = 0; i < board.squares.length; i++) {
			const colorType = board.squares[i].element.dataset.type;
			expect(board.isThreeInARow(i, colorType)).toBe(false);
		}
	});

	test('should correctly identify three tiles in a row horizontally', () => {
		// board is 8x8 and squares has to be wxh
		board.squares = [
			new Tile('1', 0), new Tile('1', 1), new Tile('1', 2), new Tile('2', 3), new Tile('2', 4), new Tile('2', 5), new Tile('3', 6), new Tile('3', 7), 
			new Tile('3', 8), new Tile('3', 9), new Tile('3', 10),
		];
		expect(board.isThreeInARow(2, '1')).toBe(true);
		expect(board.isThreeInARow(5, '2')).toBe(true);
		expect(board.isThreeInARow(10, '3')).toBe(true);
	});

	test('should correctly identify three tiles in a row vertically', () => {
		board.squares = [
			new Tile('1', 0), new Tile('2', 1), new Tile('3', 2), new Tile('4', 3), new Tile('2', 4), new Tile('5', 5), new Tile('3', 6), new Tile('3', 7), 
			new Tile('1', 8), new Tile('2', 9), new Tile('3', 10), new Tile('9', 11), new Tile('4', 12), new Tile('5', 13), new Tile('1', 14), new Tile('7', 15), 
			new Tile('1', 16), new Tile('2', 17), new Tile('3', 18)
		];
		expect(board.isThreeInARow(16, '1')).toBe(true);
		expect(board.isThreeInARow(17, '2')).toBe(true);
		expect(board.isThreeInARow(18, '3')).toBe(true);
	});

	test('should return a valid color from the colors array', () => {
		const color = board.getRandomColor();
		expect(board.colors).toContain(color);
	});

})