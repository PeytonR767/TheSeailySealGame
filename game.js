const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TILE = 40;
const ROWS = canvas.height / TILE;
const COLS = canvas.width / TILE;

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

let MAZE = generateMaze(ROWS, COLS);

// -------------------------
// HELPERS
// -------------------------

function inBounds(x, y) {
    return x >= 0 && x < COLS && y >= 0 && y < ROWS;
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

// Make sure orca doesn't spawn on seal
while (orcas[0].x === seal.x && orcas[0].y === seal.y) {
    orcas[0] = randomOpenTile();
}

// Place fish randomly
let fish = new Set();
for (let i = 0; i < 12; i++) {
    let f = randomOpenTile();
    fish.add(`${f.x},${f.y}`);
}

let score = 0;
let gameOver = false;

document.addEventListener("keydown", e => {
    if (gameOver && (e.key === "r" || e.key === "R")) {
        location.reload();
    }
    moveSeal(e.key);
});

function moveSeal(key) {
    if (gameOver) return;

    let dx = 0, dy = 0;
    if (key === "ArrowLeft") dx = -1;
    if (key === "ArrowRight") dx = 1;
    if (key === "ArrowUp") dy = -1;
    if (key === "ArrowDown") dy = 1;

    let nx = seal.x + dx;
    let ny = seal.y + dy;

    if (!isWall(nx, ny)) {
        seal.x = nx;
        seal.y = ny;
    }

    let keyStr = `${seal.x},${seal.y}`;
    if (fish.has(keyStr)) {
        fish.delete(keyStr);
        score += 10;
    }
}

function moveOrcas() {
    for (let o of orcas) {
        let dx = Math.sign(seal.x - o.x);
        let dy = Math.sign(seal.y - o.y);

        let options = [
            { x: o.x + dx, y: o.y },
            { x: o.x, y: o.y + dy },
            { x: o.x - dx, y: o.y },
            { x: o.x, y: o.y - dy }
        ];

        for (let opt of options) {
            if (!isWall(opt.x, opt.y)) {
                o.x = opt.x;
                o.y = opt.y;
                break;
            }
        }

        if (o.x === seal.x && o.y === seal.y) {
            gameOver = true;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (MAZE[y][x] === "W") {
                ctx.fillStyle = COLORS.wall;
                ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
            }
        }
    }

// Draw fish (actual fish shape)
for (let f of fish) {
    let [x, y] = f.split(",").map(Number);
    let cx = x * TILE + 20;
    let cy = y * TILE + 20;

    // Body
    ctx.fillStyle = COLORS.fish;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy);
    ctx.lineTo(cx - 24, cy - 6);
    ctx.lineTo(cx - 24, cy + 6);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(cx + 6, cy - 2, 2, 0, Math.PI * 2);
    ctx.fill();
}

    // Draw seal
    ctx.fillStyle = COLORS.seal;
    ctx.beginPath();
    ctx.arc(seal.x * TILE + 20, seal.y * TILE + 20, 16, 0, Math.PI * 2);
    ctx.fill();

    // Draw orcas
    for (let o of orcas) {
        ctx.fillStyle = COLORS.orca;
        ctx.fillRect(o.x * TILE + 5, o.y * TILE + 5, 30, 30);

        ctx.fillStyle = COLORS.orcaEye;
        ctx.beginPath();
        ctx.arc(o.x * TILE + 28, o.y * TILE + 12, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // Score
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 10, 20);

    if (gameOver) {
        ctx.fillText("You were caught! Press R to restart", 250, 300);
    }
}

function gameLoop() {
    if (!gameOver) moveOrcas();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

