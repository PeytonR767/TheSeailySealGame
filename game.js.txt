const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TILE = 40;
const ROWS = 15;
const COLS = 20;

const COLORS = {
    wall: "#1e3a5f",
    seal: "#cce8ff",
    fish: "#ffd966",
    orca: "#000000",
    orcaEye: "#ff0000"
};

const MAZE = [
    "WWWWWWWWWWWWWWWWWWWW",
    "W........W.........W",
    "W.WWWW.W.W.WWWWW.W.W",
    "W.W....W...W.....W.W",
    "W.W.WWWWWWW.WWWW.W.W",
    "W...W.....W.....W..W",
    "WWW.W.WWWWW.WWW.WWWW",
    "W.....W...S.....W..W",
    "W.WWWWW.WWWWW.WWW.WW",
    "W.W.....W.....W...OW",
    "W.W.WWWWW.WWW.W.WW.W",
    "W...W.....F...W....W",
    "WWWWWWWWWWWWWWWWWWWW",
];

function find(char) {
    let list = [];
    for (let y = 0; y < MAZE.length; y++) {
        for (let x = 0; x < MAZE[y].length; x++) {
            if (MAZE[y][x] === char) list.push({ x, y });
        }
    }
    return list;
}

let seal = find("S")[0];
let fish = new Set(find("F").map(f => `${f.x},${f.y}`));
let orcas = [find("O")[0]];

let score = 0;
let gameOver = false;

document.addEventListener("keydown", e => {
    if (gameOver && e.key === "r") location.reload();
    moveSeal(e.key);
});

function isWall(x, y) {
    return MAZE[y][x] === "W";
}

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
    for (let y = 0; y < MAZE.length; y++) {
        for (let x = 0; x < MAZE[y].length; x++) {
            if (MAZE[y][x] === "W") {
                ctx.fillStyle = COLORS.wall;
                ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
            }
        }
    }

    // Draw fish
    for (let f of fish) {
        let [x, y] = f.split(",").map(Number);
        ctx.fillStyle = COLORS.fish;
        ctx.beginPath();
        ctx.arc(x * TILE + 20, y * TILE + 20, 10, 0, Math.PI * 2);
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
