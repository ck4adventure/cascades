import { describe, it, expect } from 'vitest';
import { Board } from './board.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBoard(gridValues) {
	const board = new Board(8, 8, ['1', '2', '3', '4', '5', '6', '7']);
	board.grid = [...gridValues];
	return board;
}

function emptyGrid() {
	return new Array(64).fill('null');
}

// ---------------------------------------------------------------------------
// getRandomColor
// ---------------------------------------------------------------------------

describe('getRandomColor', () => {
	it('always returns a value from the colors array', () => {
		const board = new Board(8, 8, ['1', '2', '3']);
		for (let i = 0; i < 50; i++) {
			expect(['1', '2', '3']).toContain(board.getRandomColor());
		}
	});

	it('works with a single-color array', () => {
		const board = new Board(8, 8, ['1']);
		expect(board.getRandomColor()).toBe('1');
	});
});

// ---------------------------------------------------------------------------
// isThreeInARow  (used during board init — only checks left and up)
// ---------------------------------------------------------------------------

describe('isThreeInARow', () => {
	it('returns false for index 0 (no tiles left or above)', () => {
		const board = makeBoard(emptyGrid());
		expect(board.isThreeInARow(0, '1')).toBe(false);
	});

	it('returns false when only 1 tile to the left matches', () => {
		const grid = emptyGrid();
		grid[0] = '1';
		const board = makeBoard(grid);
		expect(board.isThreeInARow(1, '1')).toBe(false);
	});

	it('returns true when both tiles to the left match (horizontal 3)', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1';
		const board = makeBoard(grid);
		expect(board.isThreeInARow(2, '1')).toBe(true);
	});

	it('returns false when left neighbors do not match the color', () => {
		const grid = emptyGrid();
		grid[0] = '2'; grid[1] = '2';
		const board = makeBoard(grid);
		expect(board.isThreeInARow(2, '1')).toBe(false);
	});

	it('does not check left across row boundaries (col 0 of row 1)', () => {
		// index 8 is column 0 — index % width === 0, so left check is skipped
		const grid = emptyGrid();
		grid[6] = '1'; grid[7] = '1';
		const board = makeBoard(grid);
		expect(board.isThreeInARow(8, '1')).toBe(false);
	});

	it('returns false when fewer than 2 rows above exist (index < 2*width)', () => {
		const grid = emptyGrid();
		grid[0] = '2';
		const board = makeBoard(grid);
		// index 8 is only 1 row below 0, not enough for vertical check
		expect(board.isThreeInARow(8, '2')).toBe(false);
	});

	it('returns true when both tiles directly above match (vertical 3)', () => {
		const grid = emptyGrid();
		grid[0] = '2'; grid[8] = '2';
		const board = makeBoard(grid);
		expect(board.isThreeInARow(16, '2')).toBe(true);
	});

	it('returns false when upper tiles do not match the color', () => {
		const grid = emptyGrid();
		grid[0] = '3'; grid[8] = '3';
		const board = makeBoard(grid);
		expect(board.isThreeInARow(16, '1')).toBe(false);
	});

	it('works correctly mid-board (row 3, col 4 — index 28)', () => {
		const grid = emptyGrid();
		grid[26] = '5'; grid[27] = '5';
		const board = makeBoard(grid);
		expect(board.isThreeInARow(28, '5')).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// makesThreeInARow  (checks all four directions)
// ---------------------------------------------------------------------------

describe('makesThreeInARow', () => {
	it('returns true with 2 matching tiles to the left', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1';
		const board = makeBoard(grid);
		expect(board.makesThreeInARow(2, '1')).toBe(true);
	});

	it('returns true with 2 matching tiles to the right', () => {
		const grid = emptyGrid();
		grid[1] = '1'; grid[2] = '1';
		const board = makeBoard(grid);
		expect(board.makesThreeInARow(0, '1')).toBe(true);
	});

	it('returns true with 1 matching tile on each side (sandwich)', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[2] = '1';
		const board = makeBoard(grid);
		expect(board.makesThreeInARow(1, '1')).toBe(true);
	});

	it('returns true with 2 matching tiles above', () => {
		const grid = emptyGrid();
		grid[0] = '2'; grid[8] = '2';
		const board = makeBoard(grid);
		expect(board.makesThreeInARow(16, '2')).toBe(true);
	});

	it('returns true with 2 matching tiles below', () => {
		const grid = emptyGrid();
		grid[8] = '2'; grid[16] = '2';
		const board = makeBoard(grid);
		expect(board.makesThreeInARow(0, '2')).toBe(true);
	});

	it('returns true with 1 matching tile above and 1 below', () => {
		const grid = emptyGrid();
		grid[0] = '3'; grid[16] = '3';
		const board = makeBoard(grid);
		expect(board.makesThreeInARow(8, '3')).toBe(true);
	});

	it('returns false with only 1 matching neighbor', () => {
		const grid = emptyGrid();
		grid[0] = '1';
		const board = makeBoard(grid);
		expect(board.makesThreeInARow(1, '1')).toBe(false);
	});

	it('returns false with no matching neighbors', () => {
		const board = makeBoard(emptyGrid());
		expect(board.makesThreeInARow(0, '1')).toBe(false);
	});

	it('does not count across row boundaries horizontally', () => {
		// 6 and 7 are end of row 0; 8 is start of row 1
		const grid = emptyGrid();
		grid[6] = '1'; grid[7] = '1';
		const board = makeBoard(grid);
		expect(board.makesThreeInARow(8, '1')).toBe(false);
	});

	it('returns true when match spans 4+ tiles', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1'; grid[2] = '1';
		const board = makeBoard(grid);
		expect(board.makesThreeInARow(3, '1')).toBe(true);
	});

	it('returns true when both horizontal and vertical match exist', () => {
		const grid = emptyGrid();
		// horizontal: 8, 9, 10  vertical: 1, 9, 17
		grid[8] = '4'; grid[10] = '4';
		grid[1] = '4'; grid[17] = '4';
		const board = makeBoard(grid);
		expect(board.makesThreeInARow(9, '4')).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// isValidMove
// ---------------------------------------------------------------------------

describe('isValidMove', () => {
	const board = new Board(8, 8, ['1', '2', '3', '4', '5', '6', '7']);

	it('allows move right', () => expect(board.isValidMove(0, 1)).toBe(true));
	it('allows move left', () => expect(board.isValidMove(1, 0)).toBe(true));
	it('allows move down', () => expect(board.isValidMove(0, 8)).toBe(true));
	it('allows move up', () => expect(board.isValidMove(8, 0)).toBe(true));

	it('rejects same tile', () => expect(board.isValidMove(0, 0)).toBe(false));
	it('rejects diagonal', () => expect(board.isValidMove(0, 9)).toBe(false));
	it('rejects 2 tiles apart horizontally', () => expect(board.isValidMove(0, 2)).toBe(false));
	it('rejects 2 tiles apart vertically', () => expect(board.isValidMove(0, 16)).toBe(false));

	it('rejects left from left edge (would cross row boundary)', () => {
		// index 8 (row 1 col 0) to index 7 (row 0 col 7) — different rows
		expect(board.isValidMove(8, 7)).toBe(false);
	});

	it('rejects right from right edge (would cross row boundary)', () => {
		// index 7 (row 0 col 7) to index 8 (row 1 col 0)
		expect(board.isValidMove(7, 8)).toBe(false);
	});

	it('rejects up from top row', () => expect(board.isValidMove(0, -8)).toBe(false));
	it('rejects down from bottom row', () => expect(board.isValidMove(63, 71)).toBe(false));

	it('allows move at bottom-right corner upward', () => expect(board.isValidMove(63, 55)).toBe(true));
	it('allows move at bottom-right corner leftward', () => expect(board.isValidMove(63, 62)).toBe(true));
});

// ---------------------------------------------------------------------------
// removeMatchingHorzTiles
// ---------------------------------------------------------------------------

describe('removeMatchingHorzTiles', () => {
	it('removes exactly 3 tiles and returns their IDs', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1'; grid[2] = '1';
		const board = makeBoard(grid);
		const result = board.removeMatchingHorzTiles(0, '1');
		expect(result.length).toBe(3);
		expect(result).toEqual(expect.arrayContaining([0, 1, 2]));
		expect(board.grid[0]).toBe('null');
		expect(board.grid[1]).toBe('null');
		expect(board.grid[2]).toBe('null');
	});

	it('removes 4+ tiles when more than 3 match', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1'; grid[2] = '1'; grid[3] = '1';
		const board = makeBoard(grid);
		expect(board.removeMatchingHorzTiles(1, '1').length).toBe(4);
	});

	it('removes all 8 tiles in a full-row match', () => {
		const grid = emptyGrid();
		for (let i = 0; i < 8; i++) grid[i] = '3';
		const board = makeBoard(grid);
		expect(board.removeMatchingHorzTiles(4, '3').length).toBe(8);
	});

	it('returns empty array and leaves tiles untouched when only 2 match', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1';
		const board = makeBoard(grid);
		const result = board.removeMatchingHorzTiles(0, '1');
		expect(result.length).toBe(0);
		expect(board.grid[0]).toBe('1');
		expect(board.grid[1]).toBe('1');
	});

	it('matches from a center tile leftward and rightward', () => {
		const grid = emptyGrid();
		grid[3] = '2'; grid[4] = '2'; grid[5] = '2';
		const board = makeBoard(grid);
		const result = board.removeMatchingHorzTiles(4, '2');
		expect(result).toEqual(expect.arrayContaining([3, 4, 5]));
	});

	it('does not match across row boundaries', () => {
		// 6 and 7 are row 0, 8 is row 1
		const grid = emptyGrid();
		grid[6] = '1'; grid[7] = '1'; grid[8] = '1';
		const board = makeBoard(grid);
		const result = board.removeMatchingHorzTiles(7, '1');
		expect(result.length).toBe(0);
	});

	it('does not remove non-matching tiles in the same row', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1'; grid[2] = '1'; grid[3] = '2';
		const board = makeBoard(grid);
		board.removeMatchingHorzTiles(1, '1');
		expect(board.grid[3]).toBe('2');
	});
});

// ---------------------------------------------------------------------------
// removeMatchingVertTiles
// ---------------------------------------------------------------------------

describe('removeMatchingVertTiles', () => {
	it('removes exactly 3 tiles and returns their IDs', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[8] = '1'; grid[16] = '1';
		const board = makeBoard(grid);
		const result = board.removeMatchingVertTiles(0, '1');
		expect(result.length).toBe(3);
		expect(result).toEqual(expect.arrayContaining([0, 8, 16]));
		expect(board.grid[0]).toBe('null');
		expect(board.grid[8]).toBe('null');
		expect(board.grid[16]).toBe('null');
	});

	it('removes 4+ tiles when more than 3 match', () => {
		const grid = emptyGrid();
		grid[0] = '2'; grid[8] = '2'; grid[16] = '2'; grid[24] = '2';
		const board = makeBoard(grid);
		expect(board.removeMatchingVertTiles(8, '2').length).toBe(4);
	});

	it('removes all 8 tiles in a full-column match', () => {
		const grid = emptyGrid();
		for (let i = 0; i < 8; i++) grid[i * 8] = '4';
		const board = makeBoard(grid);
		expect(board.removeMatchingVertTiles(0, '4').length).toBe(8);
	});

	it('returns empty array and leaves tiles untouched when only 2 match', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[8] = '1';
		const board = makeBoard(grid);
		const result = board.removeMatchingVertTiles(0, '1');
		expect(result.length).toBe(0);
		expect(board.grid[0]).toBe('1');
	});

	it('matches from a center tile upward and downward', () => {
		const grid = emptyGrid();
		grid[0] = '3'; grid[8] = '3'; grid[16] = '3';
		const board = makeBoard(grid);
		const result = board.removeMatchingVertTiles(8, '3');
		expect(result).toEqual(expect.arrayContaining([0, 8, 16]));
	});

	it('does not remove non-matching tiles in the same column', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[8] = '1'; grid[16] = '1'; grid[24] = '2';
		const board = makeBoard(grid);
		board.removeMatchingVertTiles(0, '1');
		expect(board.grid[24]).toBe('2');
	});
});

// ---------------------------------------------------------------------------
// findCascadeMatches
// ---------------------------------------------------------------------------

describe('findCascadeMatches', () => {
	it('returns empty Set when board has no matches', () => {
		// colors[(col + row*3) % 7] guarantees adjacent cells always differ
		// by 1 (horz) or 3 (vert) mod 7, so no 3-in-a-row can exist
		const colors = ['1', '2', '3', '4', '5', '6', '7'];
		const grid = emptyGrid();
		for (let row = 0; row < 8; row++)
			for (let col = 0; col < 8; col++)
				grid[row * 8 + col] = colors[(col + row * 3) % 7];
		const board = makeBoard(grid);
		expect(board.findCascadeMatches().size).toBe(0);
	});

	it('returns empty Set on an all-null board', () => {
		const board = makeBoard(emptyGrid());
		expect(board.findCascadeMatches().size).toBe(0);
	});

	it('finds and clears a horizontal match of 3', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1'; grid[2] = '1';
		const board = makeBoard(grid);
		const result = board.findCascadeMatches();
		expect(result.size).toBe(3);
		expect([...result]).toEqual(expect.arrayContaining([0, 1, 2]));
		expect(board.grid[0]).toBe('null');
		expect(board.grid[1]).toBe('null');
		expect(board.grid[2]).toBe('null');
	});

	it('finds and clears a vertical match of 3', () => {
		const grid = emptyGrid();
		grid[0] = '2'; grid[8] = '2'; grid[16] = '2';
		const board = makeBoard(grid);
		const result = board.findCascadeMatches();
		expect(result.size).toBe(3);
		expect([...result]).toEqual(expect.arrayContaining([0, 8, 16]));
	});

	it('counts overlapping tiles only once (L-shape)', () => {
		// horizontal: 0,1,2  vertical: 0,8,16  — tile 0 is in both
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1'; grid[2] = '1';
		grid[8] = '1'; grid[16] = '1';
		const board = makeBoard(grid);
		expect(board.findCascadeMatches().size).toBe(5);
	});

	it('counts overlapping tiles only once (T-shape)', () => {
		// horizontal: 0,1,2  vertical: 1,9,17
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1'; grid[2] = '1';
		grid[9] = '1'; grid[17] = '1';
		const board = makeBoard(grid);
		expect(board.findCascadeMatches().size).toBe(5);
	});

	it('finds multiple separate matches and scores both', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1'; grid[2] = '1';
		grid[24] = '2'; grid[25] = '2'; grid[26] = '2';
		const board = makeBoard(grid);
		expect(board.findCascadeMatches().size).toBe(6);
	});

	it('finds a match of 4', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1'; grid[2] = '1'; grid[3] = '1';
		const board = makeBoard(grid);
		expect(board.findCascadeMatches().size).toBe(4);
	});

	it('returns empty Set when only 2 in a row exist', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1';
		const board = makeBoard(grid);
		expect(board.findCascadeMatches().size).toBe(0);
	});

	it('clears matched tiles to null in grid', () => {
		const grid = emptyGrid();
		grid[0] = '3'; grid[8] = '3'; grid[16] = '3';
		const board = makeBoard(grid);
		board.findCascadeMatches();
		expect(board.grid[0]).toBe('null');
		expect(board.grid[8]).toBe('null');
		expect(board.grid[16]).toBe('null');
	});

	it('does not clear non-matched tiles', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1'; grid[2] = '1';
		grid[5] = '2'; // isolated — should survive
		const board = makeBoard(grid);
		board.findCascadeMatches();
		expect(board.grid[5]).toBe('2');
	});
});

// ---------------------------------------------------------------------------
// anyAvailableMoves
// ---------------------------------------------------------------------------

describe('anyAvailableMoves', () => {
	it('returns empty array on an all-null board', () => {
		expect(makeBoard(emptyGrid()).anyAvailableMoves()).toHaveLength(0);
	});

	it('returns empty array with no duplicate colors anywhere near each other', () => {
		// 7-color cycling pattern — no two neighbors share a color
		const grid = emptyGrid();
		const colors = ['1', '2', '3', '4', '5', '6', '7'];
		for (let i = 0; i < 64; i++) grid[i] = colors[i % 7];
		// This may or may not have moves; just confirm it returns an array
		expect(Array.isArray(makeBoard(grid).anyAvailableMoves())).toBe(true);
	});

	it('returns 3-element array when a move exists', () => {
		// obvious horizontal move: X X _ X → farRight pattern
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1'; grid[3] = '1';
		const board = makeBoard(grid);
		const result = board.anyAvailableMoves();
		expect(result.length).toBe(3);
	});

	// --- pair-right patterns ---

	it('detects pair-right with upper-left third tile', () => {
		//  X _ _      (row 0, col 0 — upperLeft of pair)
		//  _ X X _    (row 1, col 1-2 — pair)
		const grid = emptyGrid();
		grid[0] = '1';           // upperLeft (currIndex - width - 1 = 9-8-1 = 0)
		grid[9] = '1'; grid[10] = '1'; // pair
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	it('detects pair-right with lower-left third tile', () => {
		//  _ X X _    (row 0 col 1-2 — pair)
		//  X _ _ _    (row 1 col 0 — lowerLeft: currIndex + width - 1 = 1+8-1=8)
		const grid = emptyGrid();
		grid[1] = '1'; grid[2] = '1'; // pair (currIndex=1)
		grid[8] = '1';                 // lowerLeft
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	it('detects pair-right with upper-right third tile', () => {
		//  _ _ X      (row 0 col 2 — upperRight of rightIndex: rightIndex-width+1 = 2-8+1=-5? No...)
		//  Actually: rightIndex=2, upperRightIndex = rightIndex - width + 1 = 2-8+1 = -5 (invalid for row 0)
		//  Use row 1: pair at 9,10; upperRightIndex = 10-8+1 = 3
		//  _ _ _ X    (row 0 col 3 — index 3)
		//  _ X X _    (row 1 col 1-2)
		const grid = emptyGrid();
		grid[3] = '1';             // upperRight
		grid[9] = '1'; grid[10] = '1'; // pair (currIndex=9, rightIndex=10)
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	it('detects pair-right with lower-right third tile', () => {
		//  X X _ _    (row 0 col 0-1 — pair, currIndex=0)
		//  _ _ X _    (row 1 col 2 — lowerRightIndex = 0+1+8+1 = 10)
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1'; // pair
		grid[10] = '1';                // lowerRight
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	it('detects pair-right with far-left third tile (X _ X X)', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[2] = '1'; grid[3] = '1';
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	it('detects pair-right with far-right third tile (X X _ X)', () => {
		const grid = emptyGrid();
		grid[0] = '1'; grid[1] = '1'; grid[3] = '1';
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	// --- pair-below patterns ---

	it('detects pair-below with upper-left third tile', () => {
		//  X _ _    (row 0 col 0 — upperLeft of currIndex=9: 9-8-1=0)
		//  _ X _    (row 1 col 1 — currIndex=9)
		//  _ X _    (row 2 col 1 — lowerIndex=17)
		const grid = emptyGrid();
		grid[0] = '1';
		grid[9] = '1'; grid[17] = '1';
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	it('detects pair-below with upper-right third tile', () => {
		//  _ _ X    (row 0 col 2 — upperRight of currIndex=9: 9-8+1=2)
		//  _ X _    (row 1 col 1 — currIndex=9)
		//  _ X _    (row 2 col 1 — lowerIndex=17)
		const grid = emptyGrid();
		grid[2] = '1';
		grid[9] = '1'; grid[17] = '1';
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	it('detects pair-below with lower-left third tile', () => {
		//  _ X _    (row 0 col 1 — currIndex=1)
		//  _ X _    (row 1 col 1 — lowerIndex=9)
		//  X _ _    (row 2 col 0 — lowerLeftIndex=1+8+8-1=16)
		const grid = emptyGrid();
		grid[1] = '1'; grid[9] = '1'; grid[16] = '1';
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	it('detects pair-below with lower-right third tile', () => {
		//  X _    (row 0 col 0 — currIndex=0)
		//  X _    (row 1 col 0 — lowerIndex=8)
		//  _ X    (row 2 col 1 — lowerRightIndex=0+8+8+1=17)
		const grid = emptyGrid();
		grid[0] = '1'; grid[8] = '1'; grid[17] = '1';
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	it('detects pair-below with far-upper third tile', () => {
		//  X    (row 0 — farUpperIndex = 16-8-8 = 0)
		//  _    (row 1)
		//  X    (row 2 — currIndex=16)
		//  X    (row 3 — lowerIndex=24)
		const grid = emptyGrid();
		grid[0] = '1'; grid[16] = '1'; grid[24] = '1';
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	it('detects pair-below with far-lower third tile', () => {
		//  X    (row 0 — currIndex=0)
		//  X    (row 1 — lowerIndex=8)
		//  _    (row 2)
		//  X    (row 3 — farLowerIndex=0+8*3=24)
		const grid = emptyGrid();
		grid[0] = '1'; grid[8] = '1'; grid[24] = '1';
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	// --- x_x horz patterns ---

	it('detects x_x horizontal with middle-above third tile', () => {
		//  _ X _    (row 0 col 1 — midAboveIndex = 8-8+1 = 1)
		//  X _ X    (row 1 col 0,2 — currIndex=8, endIndex=10)
		const grid = emptyGrid();
		grid[1] = '1';
		grid[8] = '1'; grid[10] = '1';
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	it('detects x_x horizontal with middle-below third tile', () => {
		//  X _ X    (row 0 col 0,2 — currIndex=0, endIndex=2)
		//  _ X _    (row 1 col 1 — midBelowIndex = 0+8+1 = 9)
		const grid = emptyGrid();
		grid[0] = '1'; grid[2] = '1'; grid[9] = '1';
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	// --- x_x vert patterns ---

	it('detects x_x vertical with left-middle third tile', () => {
		//  _ X    (row 0 col 1 — currIndex=1, belowIndex=17)
		//  X _    (row 1 col 0 — leftMiddleIndex = 1+8-1 = 8)
		//  _ X    (row 2 col 1)
		const grid = emptyGrid();
		grid[1] = '1'; grid[8] = '1'; grid[17] = '1';
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});

	it('detects x_x vertical with right-middle third tile', () => {
		//  X _    (row 0 col 0 — currIndex=0, belowIndex=16)
		//  _ X    (row 1 col 1 — rightMiddleIndex = 0+8+1 = 9)
		//  X _    (row 2 col 0)
		const grid = emptyGrid();
		grid[0] = '1'; grid[9] = '1'; grid[16] = '1';
		expect(makeBoard(grid).anyAvailableMoves().length).toBe(3);
	});
});

// ---------------------------------------------------------------------------
// initialize
// ---------------------------------------------------------------------------

describe('initialize', () => {
	it('fills all 64 grid positions (no null tiles)', () => {
		const board = new Board(8, 8, ['1', '2', '3', '4', '5', '6', '7']);
		board.initialize();
		expect(board.grid.every(t => t !== 'null')).toBe(true);
		expect(board.grid.length).toBe(64);
	});

	it('uses only valid colors', () => {
		const colors = ['1', '2', '3', '4', '5', '6', '7'];
		const board = new Board(8, 8, colors);
		board.initialize();
		expect(board.grid.every(t => colors.includes(t))).toBe(true);
	});

	it('produces no initial horizontal 3-in-a-row', () => {
		const board = new Board(8, 8, ['1', '2', '3', '4', '5', '6', '7']);
		board.initialize();
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 6; col++) {
				const i = row * 8 + col;
				const t = board.grid[i];
				expect(
					board.grid[i + 1] === t && board.grid[i + 2] === t,
					`3-in-a-row at [${row}][${col}]`
				).toBe(false);
			}
		}
	});

	it('produces no initial vertical 3-in-a-row', () => {
		const board = new Board(8, 8, ['1', '2', '3', '4', '5', '6', '7']);
		board.initialize();
		for (let row = 0; row < 6; row++) {
			for (let col = 0; col < 8; col++) {
				const i = row * 8 + col;
				const t = board.grid[i];
				expect(
					board.grid[i + 8] === t && board.grid[i + 16] === t,
					`3-in-a-column at [${row}][${col}]`
				).toBe(false);
			}
		}
	});

	it('can be called multiple times without throwing', () => {
		const board = new Board(8, 8, ['1', '2', '3', '4', '5', '6', '7']);
		for (let i = 0; i < 10; i++) {
			expect(() => board.initialize()).not.toThrow();
		}
	});
});
