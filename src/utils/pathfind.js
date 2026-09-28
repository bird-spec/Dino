let rows = 100;
let cols = 100; // still need to find a way to make ts dynamic w/ terrain .js
let grid = new Array(cols);

let openSet = [];
let closedSet = [];

let start = null;
let end = null;
let path = [];

function heuristic(position0, position1) {
    let d1 = Math.abs(position1.x - position0.x);
    let d2 = Math.abs(position1.y - position0.y);
    return d1 + d2;
}

function gridPoint(x, y) {
    this.x = x;
    this.y = y;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.parent = null;
    this.neighbors = [];
    this.isObstacle = false;

    // Resets pathfinding values between runs
    this.reset = function() {
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.parent = null;
    };

    this.updateNeighbors = function(grid) {
        this.neighbors = [];
        let i = this.x;
        let j = this.y;

        if (i < cols - 1) this.neighbors.push(grid[i + 1][j]);
        if (i > 0)        this.neighbors.push(grid[i - 1][j]);
        if (j < rows - 1) this.neighbors.push(grid[i][j + 1]);
        if (j > 0)        this.neighbors.push(grid[i][j - 1]);
    };
}

function init(obstacleCallback = null) {
    for (let i = 0; i < cols; i++) {
        grid[i] = new Array(rows);
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = new gridPoint(i, j);

            if (obstacleCallback && typeof obstacleCallback === 'function') {
                grid[i][j].isObstacle = obstacleCallback(i, j);
            }
        }
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].updateNeighbors(grid);
        }
    }
}

export function pathfind(startPos = { x: 0, y: 0 }, endPos = { x: cols - 1, y: rows - 1 }, obstacleCallback = null) {
    init(obstacleCallback);

    if (
        startPos.x < 0 || startPos.x >= cols || startPos.y < 0 || startPos.y >= rows ||
        endPos.x < 0 || endPos.x >= cols || endPos.y < 0 || endPos.y >= rows
    ) {
        console.warn("out of bounds:");
        return [];
    }

    start = grid[startPos.x][startPos.y];
    end = grid[endPos.x][endPos.y];

    if (start.isObstacle || end.isObstacle) {
        console.warn("Twin its broken(start or end is an obstacle)")
        return [];
    }

    openSet = [start];
    closedSet = [];
    path = [];

    while (openSet.length > 0) {
        let winnerIndex = 0;
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < openSet[winnerIndex].f) {
                winnerIndex = i;
            }
        }

        let current = openSet[winnerIndex];

        if (current === end) {
            let temp = current;
            path.push(temp);
            while (temp.parent) {
                path.push(temp.parent);
                temp = temp.parent;
            }
            return path.reverse();
        }

        openSet.splice(winnerIndex, 1);
        closedSet.push(current);

        let neighbors = current.neighbors;

        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];

            // Ignore blocked obstacle nodes or already evaluated nodes
            if (neighbor.isObstacle || closedSet.includes(neighbor)) {
                continue;
            }

            let possibleG = current.g + 1;
            let newPathFound = false;

            if (!openSet.includes(neighbor)) {
                newPathFound = true;
                neighbor.h = heuristic(neighbor, end);
                openSet.push(neighbor);
            } else if (possibleG < neighbor.g) {
                newPathFound = true;
            }

            if (newPathFound) {
                neighbor.g = possibleG;
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
            }
        }
    }

    return [];
}