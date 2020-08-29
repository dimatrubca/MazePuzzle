let W = 25;
let H = 15;
let startRow = 0;
let startCol = 0;
let endRow = H - 1;
let endCol = W - 1;

const primaryMessage = document.getElementById("primary-message");
const helperMessage = document.getElementById("helper-message");
const gridSelector = document.getElementById("grid-selector");
const movesDisplay = document.getElementById("moves")
const mazeContainer = document.getElementById("maze-container")

class Cell {
    constructor() {
        // define cell borders
        this.top = true;
        this.bottom = true;
        this.right = true;
        this.left = true;
    }
}

const dirsArray = ["right", "left", "top", "bottom"];

// vector of directions: [row_offset, col_offset]
const dirs = {
    "right": [0, 1],
    "left": [0, -1],
    "top": [-1, 0],
    "bottom": [1, 0]
}

opposite_border = {
    "right": "left",
    "left": "right",
    "top": "bottom",
    "bottom": "top"
};

// create grid of cells with H rows and W cols
function createGrid() {
    let grid = [];

    for (let i = 0; i < H; i++) {
        grid[i] = [];
        for (let j = 0; j < W; j++) {
            grid[i][j] = new Cell()
        }
    }
    return grid;
};

// Checks if cell (row, col) exists
function OK(i, j) {
    return (i>=0 && j>=0 && i<H && j<W)
}

// Checks if cell maze[x][y] was vizited (thus contains missing border)
function isVisited(i, j) {
    return !(maze[i][j].top && maze[i][j].bottom &&
        maze[i][j].right && maze[i][j].left)
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }

    return array;
}

 // recursive depth-first-search
function dfs(i, j) {
    shuffledDirs = shuffleArray([...dirsArray])

    for (dir of shuffledDirs) {
        const i2 = i + dirs[dir][0];
        const j2 = j + dirs[dir][1];

        if (!OK(i2, j2)) continue;
        console.log(i2, j2)
        if (isVisited(i2, j2)) continue;

        console.log(i2, j2, dir)

        maze[i][j][dir] = false;
        maze[i2][j2][opposite_border[dir]] = false;
        dfs(i2, j2);
    }
}

// creates html table represinting generated maze[W][H]
// return 2D array of html table cells
function createHtmlMaze() {
    let table = document.createElement("table");
    let tbody = document.createElement("tbody");
    let tableMaze = [];

    for (let rowIdx = 0; rowIdx < H; rowIdx++) {            
        let row = document.createElement("tr");
        tableMaze[rowIdx] = [];
        for (let colIdx = 0; colIdx < W; colIdx++) {
            let tableCell = document.createElement("td");
            let cell = maze[rowIdx][colIdx];

            for (const [dir, exists] of Object.entries(cell)) {
                if (!exists) {
                    tableCell.style["border-" + dir] = "none";
                    console.log(dir)
                }
            }

            tableMaze[rowIdx][colIdx] = tableCell
            row.appendChild(tableCell);
        }
        tbody.appendChild(row);
    }

    table.appendChild(tbody);
    mazeContainer.appendChild(table);

    return tableMaze;
}

function initializeMaze() {
    // remove existing maze if exists
    let oldMaze = document.querySelector('#maze-container table');
    if (oldMaze) oldMaze.parentNode.removeChild(oldMaze);

    // create new maze
    maze = createGrid();
    dfs(startRow, startCol);
    table = createHtmlMaze();

    // update maze constants
    endRow = H - 1;
    endCol = W - 1;
}


function initializeGame() {
    initializeMaze()

    // mark starting and ending cells in the maze
    table[startRow][startCol].classList.add("focus");
    table[endRow][endCol].classList.add("end");

    moves = 0;
    currI = startRow;
    currJ = startCol;
    movesDisplay.textContent = "Moves: 0";

    primaryMessage.textContent = "Maze Puzzle";
    movesDisplay.textContent = "0";
    gridSelector.classList.add("no-display");
    helperMessage.classList.add("no-display");

    gameStarted = true;
}

function endGame() {
    gridSelector.classList.remove("no-display");
    helperMessage.classList.add("no-display");
    primaryMessage.textContent = "Congrulations! Moves made: " + moves;
    
    gameStarted = false;
}

function extractNumbersFromString(str) {
    let numbers = []

    for (let i = 0; i < str.length; i++) {
        // skip non-digit characters
        while (i < str.length && (str[i] < '0' || str[i] > '9')) i++;

        // read consecutiv digits and store obtained number
        let nr = 0;
        while (i < str.length && str[i] >='0' && str[i] <= '9') {
            nr = nr*10 + (str[i] - '0');
            i++;
        }

        if (nr != 0) numbers.push(nr);
    }

    return numbers;
}

const buttons = document.querySelectorAll("#grid-selector button")
buttons.forEach(btn => {
    btn.addEventListener("click", function(e) {
        // get grid dimensions from button content 
        dims = extractNumbersFromString(this.textContent);
        W = dims[0]; 
        H = dims[1];
        console.log("clicked");
        console.log(dims);
        initializeGame()
    })
}

)

let maze, table;
let score, moves, currI, currJ, gameStarted;

initializeMaze()

document.onkeydown = function(e) {
    e = e || window.event;

    let dir = ""
    switch (event.keyCode) {
        case 37: // left
            dir = "left";
            break;
        case 38: // up
            dir = "top";
            break;
        case 39: // right
            dir = "right";
            break;
        case 40: // down
            dir = "bottom";
            break;
    }

    if (dir == "" || !gameStarted) return;
    let newI = currI + dirs[dir][0];
    let newJ = currJ + dirs[dir][1];

    // check if move is possible
    if (!OK(newI, newJ) || maze[currI][currJ][dir]) return;

    let currCell = table[currI][currJ];
    
    console.log(currI, currJ)
    console.log(table[currI][currJ])
    table[currI][currJ].classList.remove('focus')
    table[currI][currJ].classList.add('visited')
    table[newI][newJ].classList.add('focus')
    console.log(table[newI][newJ])
    currI = newI;
    currJ = newJ;

    moves += 1;
    movesDisplay.textContent = moves;

    // if end cell reached than end game
    if (currI == endRow && currJ == endCol) {
        endGame()
    }
};