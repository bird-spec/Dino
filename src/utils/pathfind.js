let rows = 5
let cols = 5 // these need to inherint from terrian or NPC.js
let grid = new Array(cols);

let openSet = []
let closedSet = []


let start = []
let end = []
let path = []

function heuristic(position0, position1) {
  let d1 = Math.abs(position1.x - position0.x);
  let d2 = Math.abs(position1.y - position0.y);

  return d1 + d2;
}

function gridPoint(x,y){
    this.x = x;
    this.y = y;
    this.f =0;
    this.g = 0;
    this.h = 0;
    this.parent = null;
    this.neighbors = []

    this.updateNeighbors = function(grid){
        let i = this.x;
        let j = this.y;
        if (i < cols - 1) {
            this.neighbors.push(grid[i+1][j]);
        }
        if (i > 0) {
            this.neighbors.push(grid[i-1][j]);
        }
        if (j < rows - 1){
            this.neighbors.push(grid[i][j+1]);
        }
        if (j > 0) {
          this.neighbors.push(grid[i][j - 1]);
        }
    };
}

function init() {
    for (let i = 0; i < cols; i++) {
        grid[i] = new Array(rows);
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = new gridPoint(i,j);
        }
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j].updateNeighbors(grid);
        }
    }

    start = grid[0][0];
    end = grid[cols-1][rows-1];
}

//testy westy i like to tyepe please help me AHHHHHHHHHHHHHHHHHHHHHHHH





export function pathfind() {
    init()

    while (openSet.length > 0) {
        let lowestValue = 0;

        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < lowestValue) {
                lowestValue = openSet[i].f;
            }
        }
        let current = openSet[lowestValue];

        if (current === end) {
            let temp = current;
            path.push(temp);
            while (temp.parent) {
                path.push(temp.parent);
                temp = temp.parent;
            }
            console.log("path found");
            return path.reverse();
        }

        openSet.splice(openSet.indexOf(current), 1);
        closedSet.push(current);
        //current.isWall = false; // for when i add Z stuff for 2d path finding

        let neighbors = current.neighbors;

        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];

            if (!closedSet.includes(neighbor)) {
                let possibleG = current.g + 1;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (possibleG >= neighbor.g) {
                    continue;
                }

                neighbor.g = possibleG;
                neighbor.h = heuristic(neighbor, end);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
            }
        }

    }

    return []
}