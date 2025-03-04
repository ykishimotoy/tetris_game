const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;

const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const tetrominoes = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
];

let currentTetromino = {
    shape: tetrominoes[Math.floor(Math.random() * tetrominoes.length)],
    row: 0,
    col: Math.floor(COLS / 2) - 1,
};

function drawGrid() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (grid[row][col]) {
                context.fillStyle = 'cyan';
                context.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawTetromino() {
    context.fillStyle = 'red';
    currentTetromino.shape.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            if (cell) {
                context.fillRect(
                    (currentTetromino.col + cIdx) * BLOCK_SIZE,
                    (currentTetromino.row + rIdx) * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
                context.strokeRect(
                    (currentTetromino.col + cIdx) * BLOCK_SIZE,
                    (currentTetromino.row + rIdx) * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
            }
        });
    });
}

function update() {
    currentTetromino.row++;
    if (collision()) {
        currentTetromino.row--;
        mergeTetromino();
        clearLines();
        spawnNewTetromino();
    }
    drawGrid();
    drawTetromino();
}

function collision() {
    const { shape, row, col } = currentTetromino;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (
                shape[r][c] &&
                (grid[row + r] === undefined || grid[row + r][col + c] === undefined || grid[row + r][col + c])
            ) {
                return true;
            }
        }
    }
    return false;
}

function mergeTetromino() {
    const { shape, row, col } = currentTetromino;
    shape.forEach((r, rIdx) => {
        r.forEach((cell, cIdx) => {
            if (cell) {
                grid[row + rIdx][col + cIdx] = cell;
            }
        });
    });
}

function clearLines() {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (grid[row].every(cell => cell)) {
            grid.splice(row, 1);
            grid.unshift(Array(COLS).fill(0));
            row++;
        }
    }
}

function spawnNewTetromino() {
    currentTetromino = {
        shape: tetrominoes[Math.floor(Math.random() * tetrominoes.length)],
        row: 0,
        col: Math.floor(COLS / 2) - 1,
    };
    if (collision()) {
        alert('Game Over');
        grid.forEach(row => row.fill(0));
    }
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp': // Rotate
            rotateTetromino();
            break;
        case 'ArrowLeft': // Move left
            currentTetromino.col--;
            if (collision()) {
                currentTetromino.col++;
            }
            break;
        case 'ArrowRight': // Move right
            currentTetromino.col++;
            if (collision()) {
                currentTetromino.col--;
            }
            break;
    }
    drawGrid();
    drawTetromino();
});

function rotateTetromino() {
    const { shape } = currentTetromino;
    const newShape = shape[0].map((_, colIndex) =>
        shape.map(row => row[colIndex]).reverse()
    );
    const originalCol = currentTetromino.col;
    currentTetromino.col = Math.min(
        currentTetromino.col,
        COLS - newShape[0].length
    );
    const originalShape = currentTetromino.shape;
    currentTetromino.shape = newShape;
    if (collision()) {
        currentTetromino.shape = originalShape;
        currentTetromino.col = originalCol;
    }
}

setInterval(update, 500);