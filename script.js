// Handle matches by removing tiles, shifting pieces, and checking for new matches
function handleMatches() {
    let matchesFound;
    
    do {
        matchesFound = checkExtendedRowMatch() || checkExtendedColumnMatch();
        if (matchesFound) {
            moveDown(); // Shift pieces down to fill gaps
        }
    } while (matchesFound);

    // Once all matches are resolved and board is stable, re-enable player actions
    isPlayerBlocked = false;
}

// Extended row match checking to detect matches as far left and right as possible
function checkExtendedRowMatch() {
    let matchFound = false;

    for (let i = 0; i < width * width; i++) {
        const type = squares[i].dataset.type;
        if (type === '') continue;

        let matchIndices = [i];

        // Check left
        let left = i - 1;
        while (left >= Math.floor(i / width) * width && squares[left].dataset.type === type) {
            matchIndices.push(left);
            left--;
        }

        // Check right
        let right = i + 1;
        while (right < Math.floor(i / width) * width + width && squares[right].dataset.type === type) {
            matchIndices.push(right);
            right++;
        }

        // If we have a match of 3 or more
        if (matchIndices.length >= 3) {
            matchIndices.forEach(index => squares[index].dataset.type = ''); // Clear matched pieces
            score += matchIndices.length;
            matchFound = true;
        }
    }
    scoreDisplay.textContent = score;
    return matchFound;
}

// Extended column match checking to detect matches as far up and down as possible
function checkExtendedColumnMatch() {
    let matchFound = false;

    for (let i = 0; i < width * (width - 1); i++) {
        const type = squares[i].dataset.type;
        if (type === '') continue;

        let matchIndices = [i];

        // Check upwards
        let up = i - width;
        while (up >= 0 && squares[up].dataset.type === type) {
            matchIndices.push(up);
            up -= width;
        }

        // Check downwards
        let down = i + width;
        while (down < width * width && squares[down].dataset.type === type) {
            matchIndices.push(down);
            down += width;
        }

        // If we have a match of 3 or more
        if (matchIndices.length >= 3) {
            matchIndices.forEach(index => squares[index].dataset.type = ''); // Clear matched pieces
            score += matchIndices.length;
            matchFound = true;
        }
    }
    scoreDisplay.textContent = score;
    return matchFound;
}

// Move pieces down to fill empty spaces
function moveDown() {
    let moved;

    do {
        moved = false;
        for (let i = width * (width - 1) - 1; i >= 0; i--) {
            if (squares[i].dataset.type === '' && squares[i - width] && squares[i - width].dataset.type !== '') {
                // Move tile from above down to current empty spot
                squares[i].dataset.type = squares[i - width].dataset.type;
                squares[i - width].dataset.type = '';
                moved = true; // Indicate that at least one tile moved
            }
        }

        // Fill the top row with new pieces if needed
        for (let i = 0; i < width; i++) {
            if (squares[i].dataset.type === '') {
                squares[i].dataset.type = colors[Math.floor(Math.random() * colors.length)];
                moved = true; // New tiles added, so board may have changed
            }
        }
    } while (moved); // Continue until no more tiles move down
}

// Restart Game Button
document.getElementById('reset-button').addEventListener('click', resetGame);

function resetGame() {
    score = 0;
    scoreDisplay.textContent = score;
    gameBoard.innerHTML = '';
    squares = [];
    isPlayerBlocked = false;
    createBoard();
}

// Initialize the game board
createBoard();
