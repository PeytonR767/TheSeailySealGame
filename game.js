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

            if (ny > 0 && ny < rows - 1 && nx >
