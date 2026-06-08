let gridSize = [20, 20];
let gridInfo = [];
let gContain = document.getElementById("grid-container");
document.documentElement.style.setProperty('--grid-size', gridSize[0]);

//World Settings
const mountainProbability = 0.001;
const mountainChainProbability = 0.6;
const canExpandLand = true;
const expandLandCycles = 2;
const landExpansionProbability = 0.1;
const waterLevel = 0;
const waterMaxExpand = waterLevel + 2;
const waterSquaredBrush = true;
const isArchipelago = false;

//User
let hvSwapping = false;
let currentHvShape = 0;
const hvShape = ["single", "adj", "adj-square", "lg-adj", "lg-adj-square"];
let currentHoveredCell = [-1, -1];


class Cell {
    constructor(x, y, data, wall, height) {
        this.x = x;
        this.y = y;
        this.data = data;
        this.isWall = wall;
        this.height = height;
    }
}

main();
function main() {
    generateGrid();
    createMountainChains();
    adjustAllHeights(10);

    // Expand
    if (canExpandLand) {
        for (let o = 1; o < expandLandCycles + 1; o++) {
            expandLands(landExpansionProbability / o, 7);
            adjustAllHeights(10);

        }
    }

    createWater();
    updateAllCellsClasses();

    document.addEventListener("keypress", (event) => {
        let keyName = (event.key).toUpperCase();

        if (keyName === "A") {
            swapHvShape();
            console.log("Changed hvShape to " + hvShape[currentHvShape]);

        }
    })

}

function swapHvShape() {
    hvSwapping = true;
    let elems = document.querySelectorAll(".selected");
    elems.forEach.call(elems, function (el) {
        el.classList.remove("selected");
    });
    if (currentHvShape >= hvShape.length - 1) { currentHvShape = 0 } else { currentHvShape++; }
    if (currentHoveredCell[0] != -1) { hoverCell(currentHoveredCell[0], currentHoveredCell[1], document.getElementById("cell-" + currentHoveredCell[0] + "-" + currentHoveredCell[1]),0,7); }
}

function hoverCell(x, y, targetCell, minHeight = -99, maxHeight = 99) {
    
    targetCell.classList.toggle("selected");
    if (hvShape[currentHvShape] !== "single") {
        getHoverShape(x, y, hvShape[currentHvShape]).forEach(element => {
            if (gridInfo[element[0]][element[1]][1].height < maxHeight && gridInfo[element[0]][element[1]][1].height > minHeight) {
                document.getElementById("cell-" + element[0] + "-" + element[1]).classList.toggle("selected");
            }
        })
    }
}

function getHoverShape(x, y, shape) {
    switch (shape) {
        case "adj":
            return getAdjacentCells(x, y, false);
        case "adj-square":
            return getAdjacentCells(x, y, true);
        case "lg-adj":
            return getAdjacentCells(x, y, false, 1, 3);
        case "lg-adj-square":
            return getAdjacentCells(x, y, true, 1, 3);
        default:
            return -1;
    }
}


function adjustAllHeights(nb) {
    for (let i = nb; i > 0; i--) {
        adjustHeights(i);
    }
}



function generateGrid(params) {
    for (let i = 0; i < gridSize[0]; i++) {
        gridInfo.push([]);
        for (let j = 0; j < gridSize[1]; j++) {

            let wall = (Math.random() < mountainProbability);
            let wh = wall ? 10 : -1;
            gridInfo[i].push([j, new Cell(i, j, "Cell : [" + i + ":" + j + "]", wall, wh)]);
            let newCell = document.createElement("div");
            newCell.setAttribute("id", "cell-" + i + "-" + j);
            newCell.setAttribute("class", "grid-cell");
            if (wall) { newCell.classList.toggle("wall"); }
            newCell.addEventListener("click", (e) => {
                console.log(gridInfo[i][j][1]);
            })
            newCell.addEventListener("mouseover", (e) => {
                currentHoveredCell = [i, j];
                hoverCell(i, j, newCell, 0, 7);
            })
            newCell.addEventListener("mouseout", (e) => {
                currentHoveredCell = [-1, -1];
                hoverCell(i, j, newCell, 0, 7)
            })
            //newCell.innerHTML = wall ? "W" : "/";
            gContain.appendChild(newCell);


        }
    }
}

function createMountainChains() {

    for (let i = 0; i < gridSize[0]; i++) {
        for (let j = 0; j < gridSize[1]; j++) {
            if (haveAdjacentMountains(i, j)) {
                if (Math.random() < mountainChainProbability) {
                    editCellHeight(i, j, 10)
                }
            }


        }
    }
}

function haveAdjacentMountains(x, y) {
    let res = false;
    getAdjacentCells(x, y, false).forEach(element => {
        if (gridInfo[element[0]][element[1]][1].height == 10) {
            res = true;
        }
    });
    return res;
}


function adjustHeights(h) {

    for (let i = 0; i < gridSize[0]; i++) {
        for (let j = 0; j < gridSize[1]; j++) {
            if (gridInfo[i][j][1].height == h) {
                getAdjacentCells(i, j, false).forEach(element => {
                    if (gridInfo[element[0]][element[1]][1].height < h) {
                        editCellHeight(element[0], element[1], h - 1)
                    }
                });
            }
        }
    }
}

function createWater() {
    for (let i = 0; i < gridSize[0]; i++) {
        for (let j = 0; j < gridSize[1]; j++) {
            if (gridInfo[i][j][1].height <= waterLevel) {

                let canSpawnWater = true;
                getAdjacentCells(i, j, waterSquaredBrush).forEach(element => {
                    if (gridInfo[element[0]][element[1]][1].height > waterMaxExpand) {
                        canSpawnWater = false;
                    }
                });
                if (canSpawnWater) { editCellHeight(i, j, -2); }

            }
        }
    }
}


function expandLands(probability, maxHeight) {
    for (let i = 0; i < gridSize[0]; i++) {
        for (let j = 0; j < gridSize[1]; j++) {

            if (gridInfo[i][j][1].height != 7 && (Math.random() < probability)) {
                let randHeight = Math.floor(Math.random() * maxHeight);
                if (gridInfo[i][j][1].height < randHeight) { editCellHeight(i, j, randHeight); }
            }


        }
    }
}


function getAdjacentCells(x, y, squareBrush, start = 1, size = 1) {
    let adj = [];

    for (let i = start; i < size + 1; i++) {
        if (x + i < gridSize[0]) { adj.push([x + i, y]) }
        if (x - i >= 0) { adj.push([x - i, y]) }
        if (y + i < gridSize[1]) { adj.push([x, y + i]) }
        if (y - 1 >= 0) { adj.push([x, y - i]) }

        if (squareBrush) {
            if (x + i < gridSize[0] && y + i < gridSize[1]) { adj.push([x + i, y + i]) }
            if (x - i >= 0 && y - 1 >= 0) { adj.push([x - i, y - i]) }
            if (x + i < gridSize[0] && y - i >= 0) { adj.push([x + i, y - i]) }
            if (x - i >= 0 && y + 1 < gridSize[1]) { adj.push([x - i, y + i]) }
        }
    }


    return adj;
}

function getCircleCells(x,y,r) {
    let circle = [];
    
}

function editCellHeight(x, y, z) {
    let c = document.getElementById("cell-" + x + "-" + y);
    if (z == -2) {
        gridInfo[x][y][1].height = z;
        c.classList.add("water");
        //c.innerHTML = "~";
    } else {
        if (c) {
            gridInfo[x][y][1].height = z;
            c.classList.add("wl-" + z);
            //c.innerHTML = z;
        }
    }
}
function updateAllCellsClasses() {
    for (let i = 0; i < gridSize[0]; i++) {
        for (let j = 0; j < gridSize[1]; j++) {

            let c = document.getElementById("cell-" + i + "-" + j);
            c.setAttribute("class", "grid-cell");
            let z = gridInfo[i][j][1].height;

            if (z == -2) {
                c.classList.add("water");
            } else if (z == waterLevel + 1) {
                c.classList.add("sand");
            } else {
                if (c) {
                    let level = z > 6 && !isArchipelago ? z : z - waterLevel;
                    c.classList.add("wl-" + level);
                }
            }


        }
    }
}

