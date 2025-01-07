/**
 * @jest-environment jsdom
*/


import Tile from './Tile.js';

describe('Tile', () => {
    let tile1, tile2;

    beforeEach(() => {
        tile1 = new Tile('red', 1);
        tile2 = new Tile('blue', 2);
    });

    test('should create a tile with the correct properties', () => {
        expect(tile1.color).toBe('red');
        expect(tile1.index).toBe(1);
        expect(tile1.element).toBeInstanceOf(HTMLElement);
        expect(tile1.element.id).toBe('1');
        expect(tile1.element.classList.contains('tile')).toBe(true);
        expect(tile1.element.getAttribute('draggable')).toBe('true');
        expect(tile1.element.dataset.type).toBe('red');
    });

    test('should swap properties with another tile', () => {
        tile1.swapWith(tile2);

        expect(tile1.color).toBe('blue');
        expect(tile1.element.dataset.type).toBe('blue');
        expect(tile2.color).toBe('red');
        expect(tile2.element.dataset.type).toBe('red');
    });
});