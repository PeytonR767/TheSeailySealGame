]const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TILE = 40;

const COLORS = {
    wall: "#1e3a5f",
    seal: "#cce8ff",
    fish: "#ffd966",
    orca: "#000000",
    orcaEye: "#ff0000"
};

// -------------------------
// RANDOM MAZE GENERATION
// -------------------------

function generateMaze(rows, cols) {
    let maze = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => "W")
    );

    function carve(x, y) {
        const dirs = [
            [2, 0],
            [-2, 0],
            [0, 2],
            [0, -2]
        ].sort(() => Math.random() - 0.5);

        for (let [dx, dy] of dirs) {
            let nx = x + dx;
            let ny = y + dy;

            if (ny > 0 && ny < rows - 1 && nx > 0 && nx < cols - 1 && maze[ny][nx] === "W") {
                maze[ny][nx] = ".";
                maze[y + dy / 2][x + dx / 2] = ".";
                carve(nx, ny);
            }
        }
    }

    maze[1][1] = ".";
    carve(1, 1);
    return maze;
}

// Generate maze sized to canvas
const ROWS = canvas.height / TILE; // 600 / 40 = 15
const COLS = canvas.width / TILE;  // 800 / 40 = 20
let MAZE = generateMaze(ROWS, COLS);

// -------------------------
// HELPERS
// -------------------------

function inBounds(x, y) {
    return y >= 0 && y < ROWS && x >= 0 && x < COLS;
}

function isWall(x, y) {
    if (!inBounds(x, y)) return true;
    return MAZE[y][x] === "W";
}

function randomOpenTile() {
    let x, y;
    do {
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
    } while (isWall(x, y));
    return { x, y };
}

// -------------------------
// ENTITY SETUP
// -------------------------

let seal = randomOpenTile();
let orcas = [randomOpenTile()];

// Make sure orca doesn't spawn
