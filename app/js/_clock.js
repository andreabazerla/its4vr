const Parser = require('./_parser');
const map = require('../json/test-2.json');

let clock = 1000 / 3;
let background = '#ffffff';
let highways = '#000000';
let stroke = 0;
const clock2 = 3;
let densityIndex = 1;
let speedIndex = 1;
let fluxIndex = 1;
let pollutionIndex = 1;
let lengthIndex = 1;
let typeIndex = 1;

const FizzyText = function (clock2, background, highways, stroke, densityIndex, speedIndex, pollutionIndex, lengthIndex, typeIndex) {
  this.clock = clock2;
  this.background = background;
  this.highways = highways;
  this.stroke = stroke;
  this.densityIndex = densityIndex;
  this.speedIndex = speedIndex;
  this.pollutionIndex = pollutionIndex;
  this.lengthIndex = lengthIndex;
  this.typeIndex = typeIndex;
};

const text = new FizzyText(clock2, background, highways, stroke, densityIndex, speedIndex, pollutionIndex, lengthIndex, typeIndex);
const gui = new dat.GUI({
  load: JSON,
  preset: 'Default'
});

const style = gui.addFolder('Style');
const controls = gui.addFolder('Controls');

style.addColor(text, 'background').onChange((value) => {
  background = value;
  document.getElementById('svg').style.background = background;
});

style.addColor(text, 'highways').onChange((value) => {
  highways = value;
  $('.highway').css('stroke', highways);
});

style.add(text, 'stroke', { Straight: 0, Dotted: 1, Dashed: 5 }).onChange((value) => {
  stroke = value;
  $('.highway').css('stroke-dasharray', stroke);
});

style.open();
controls.open();

controls.add(text, 'clock').min(1).max(10).step(1)
  .onChange((value) => {
    clock = 1000 / value;
  },
);

controls.add(text, 'densityIndex').min(0).max(1).step(0.01)
  .onChange((value) => {
    densityIndex = value;
  },
);

controls.add(text, 'speedIndex').min(0).max(1).step(0.01)
  .onChange((value) => {
    speedIndex = value;
  },
);

controls.add(text, 'pollutionIndex').min(0).max(1).step(0.01)
  .onChange((value) => {
    pollutionIndex = value;
  },
);

controls.add(text, 'lengthIndex').min(0).max(1).step(0.01)
  .onChange((value) => {
    lengthIndex = value;
  },
);

controls.add(text, 'typeIndex').min(0).max(1).step(0.01)
  .onChange((value) => {
    typeIndex = value;
  },
);

gui.remember(text);

const g = Parser.getMap(Parser.getPlacemarks(map, 1), 0);
const nodes = Parser.getMap(Parser.getPlacemarks(map, 1), 1);
let ways = Parser.getMap(Parser.getPlacemarks(map, 1), 2);
const paths = Parser.getMatrix(ways, nodes, g, 2);
const matrix = Parser.getMatrix(ways, nodes, g, 1);
ways = Parser.getMatrix(ways, nodes, g, 0);
const cells = Parser.getCells(paths, g, 0);

const pathsP = JSON.parse(JSON.stringify(paths));

const database = new Set();

const active = new Map();

active.set(0, 0.70);
active.set(172, 1);
const dead = [];
dead.push(171, 61, 163);

const priority = new Map();
priority.set(2, 0);
priority.set(4, 1);
priority.set(6, 0);
priority.set(5, 1);
priority.set(9, 0);
priority.set(1, 1);

for (const [key, value] of priority) {
  pathsP[key].priority = value;
}

/**
 * @param pollutiown
 * map of cells, any cell identified by id has a number that means how many car pass on it
 */
const pollution = new Map();
for (const cell of cells) {
  pollution.set(cell.id, 0);
}

const getMaxLength = (paths) => {
  let maxLength = 0;
  for (let i = 0; i < paths.length; i += 1) {
    maxLength = Math.max(paths[i].length, maxLength);
  }
  return maxLength;
};

const maxRealLength = getMaxLength(pathsP);

let maxPollution = 0;
let maxLength = 0;
/**
 *
 * @param {*} paths
 * @param {*} oldPaths
 * @param {*} matrix
 * @param {*} nodes
 *
 * @constant totAlive identified how many cells comes alive in a pat from the beginning
 */
const update = (paths, oldPaths, matrix, nodes) => {
  let alive = 0;
  let changed = 0;
  let totAlive = 0;
  let density = 0;
  let speed = 0;
  let flux = 0;
  let normPollution = 0;
  let length = 0;
  let normLength = 0;
  for (let i = 0; i < paths.length; i += 1) {
    for (let j = 1; j < paths[i].cells.length - 1; j += 1) {
      let alive2 = pollution.get(paths[i].cells[j].id);
      if (paths[i].cells[j].unit.alive === true && paths[i].cells[j].unit.type === 1) {
        alive += 1;
        alive2 += 1;
        pollution.set(paths[i].cells[j].id, alive2);
        paths[i].cells[j].increment = alive2;
      }
      if (oldPaths[i].cells[j].unit.alive === false && paths[i].cells[j].unit.alive === true) {
        changed += 1;
      }
      totAlive += alive2;
    }
    speed = changed / (paths[i].cells.length - 2);
    density = 1 - (alive / (paths[i].cells.length - 2));
    flux = density * speed;
    paths[i].density = density;
    paths[i].speed = speed;
    paths[i].flux = flux;
    maxPollution = Math.max(totAlive, maxPollution);
    normPollution = 1 - (totAlive / maxPollution);
    normLength = 1 - (paths[i].length / maxRealLength);
    paths[i].pollution = normPollution;
    const index = Math.round((((density * densityIndex) + (speed * speedIndex) + (normPollution * pollutionIndex) + (normLength * lengthIndex)) / (((densityIndex + speedIndex + pollutionIndex + lengthIndex)))) * 100) / 100;
    paths[i].index = index;
    // console.log(i + ' ' + Math.round(index * 100) + '%');
    for (const A of nodes) {
      for (const B of nodes) {
        if (paths[i].A.x1 === A.lat && paths[i].A.y1 === A.lon && paths[i].B.x2 === B.lat && paths[i].B.y2 === B.lon) {
          matrix[paths[i].A.i][paths[i].B.j].density = density;
          matrix[paths[i].A.i][paths[i].B.j].speed = speed;
          matrix[paths[i].A.i][paths[i].B.j].flux = flux;
          matrix[paths[i].A.i][paths[i].B.j].pollution = normPollution;
          matrix[paths[i].A.i][paths[i].B.j].index = index;
        }
      }
    }
    const lineWeight = (Math.round((1 - index) * 10) / 10) * 10;
    document.getElementById(`path_${i}`).style.strokeWidth = lineWeight;
    // document.getElementById(`path_${i}`).style.opacity = lineWeight / 10;
    const dec = 255 * index;
    const hex = Number(parseInt(dec, 10)).toString(16);
    const color = "#" + hex + hex + hex;
    document.getElementById(`path_${i}`).style.stroke = color;
    alive = 0;
    totAlive = 0;
    density = 0;
    speed = 0;
    flux = 0;
    changed = 0;
  }
  return [paths, matrix];
};

const upgrade = (paths, virgin) => {
  for (const path of paths) {
    for (let i = 0; i + 2 < (path.cells).length; i += 1) {
      const p0 = i + 0;
      const p1 = i + 1;
      const p2 = i + 2;
      const h = p1;
      if (((path.cells)[p0]).unit.alive === true) {
        if (((path.cells)[p1]).unit.alive === true) {
          if (((path.cells)[p2]).unit.alive === false) {
            ((virgin[path.ID].cells)[h]).unit.alive = false;
            ((virgin[path.ID].cells)[p2]).unit.idu = ((path.cells)[h]).unit.idu;
            ((virgin[path.ID].cells)[h]).unit.idu = 0;
            ((virgin[path.ID].cells)[p2]).unit.destination = ((path.cells)[h]).unit.destination;
            ((virgin[path.ID].cells)[h]).unit.destination = null;
            ((virgin[path.ID].cells)[p2]).unit.type = ((path.cells)[h]).unit.type;
            ((virgin[path.ID].cells)[h]).unit.type = null;
          } else {
            ((virgin[path.ID].cells)[h]).unit.alive = ((path.cells)[h]).unit.alive;
            ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[h]).unit.idu;
            ((virgin[path.ID].cells)[h]).unit.destination = ((path.cells)[h]).unit.destination;
            ((virgin[path.ID].cells)[h]).unit.type = ((path.cells)[h]).unit.type;
          }
        } else {
          if (((path.cells)[p2]).unit.alive === true) {
            ((virgin[path.ID].cells)[h]).unit.alive = true;
            ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[p0]).unit.idu;
            ((virgin[path.ID].cells)[p0]).unit.idu = 0;
            ((virgin[path.ID].cells)[h]).unit.destination = ((path.cells)[p0]).unit.destination;
            ((virgin[path.ID].cells)[p0]).unit.destination = null;
            ((virgin[path.ID].cells)[h]).unit.type = ((path.cells)[p0]).unit.type;
            ((virgin[path.ID].cells)[p0]).unit.type = null;
          } else {
            ((virgin[path.ID].cells)[h]).unit.alive = true;
            ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[p0]).unit.idu;
            ((virgin[path.ID].cells)[p0]).unit.idu = 0;
            ((virgin[path.ID].cells)[h]).unit.destination = ((path.cells)[p0]).unit.destination;
            ((virgin[path.ID].cells)[p0]).unit.destination = null;
            ((virgin[path.ID].cells)[h]).unit.type = ((path.cells)[p0]).unit.type;
            ((virgin[path.ID].cells)[p0]).unit.type = null;
          }
        }
      } else {
        if (((path.cells)[p1]).unit.alive === true) {
          if (((path.cells)[p2]).unit.alive === false) {
            ((virgin[path.ID].cells)[h]).unit.alive = false;
            ((virgin[path.ID].cells)[p2]).unit.idu = ((path.cells)[h]).unit.idu;
            ((virgin[path.ID].cells)[h]).unit.idu = 0;
            ((virgin[path.ID].cells)[p2]).unit.destination = ((path.cells)[h]).unit.destination;
            ((virgin[path.ID].cells)[h]).unit.destination = null;
            ((virgin[path.ID].cells)[p2]).unit.type = ((path.cells)[h]).unit.type;
            ((virgin[path.ID].cells)[h]).unit.type = null;
          } else {
            ((virgin[path.ID].cells)[h]).unit.alive = ((path.cells)[h]).unit.alive;
            ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[h]).unit.idu;
            ((virgin[path.ID].cells)[h]).unit.destination = ((path.cells)[h]).unit.destination;
            ((virgin[path.ID].cells)[h]).unit.type = ((path.cells)[h]).unit.type;
          }
        } else {
          ((virgin[path.ID].cells)[h]).unit.alive = ((path.cells)[h]).unit.alive;
          ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[h]).unit.idu;
          ((virgin[path.ID].cells)[h]).unit.destination = ((path.cells)[h]).unit.destination;
          ((virgin[path.ID].cells)[h]).unit.type = ((path.cells)[h]).unit.type;
        }
      }
    }
  }
  return virgin;
};

const createID = () => {
  const id = Math.floor(1000000000 + (Math.random() * 9000000000));
  const alive = database.has(id);
  if (!alive) {
    database.add(id);
    return id;
  } else {
    return 0;
  }
};

const random = (paths, database) => {
  for (const birth of active.keys()) {
    for (const path of paths) {
      for (const cell of path.cells) {
        if (cell.id === birth) {
          const limit = active.get(cell.id);
          const rand = Math.random();
          let id = 0;
          if (database.size < 9000000000) {
            while (id === 0) {
              id = createID(database);
            }
          } else {
            id = 0;
          }
          const rand2 = (Math.random() + typeIndex) / 2;
          if (rand < limit && path.cells[1].unit.alive === false) {
            cell.unit.idu = id;
            cell.unit.alive = true;
            cell.unit.destination = dead[Math.floor(Math.random() * dead.length)];
            if (rand2 > 0.5) {
              cell.unit.type = 1;
            } else {
              cell.unit.type = 0;
            }
          } else {
            cell.unit.alive = false;
          }
          break;
        }
        break;
      }
    }
  }
  return paths;
};

const refresh = (paths) => {
  for (const path of paths) {
    for (let i = 1; i < path.cells.length - 1; i += 1) {
      const cell = path.cells[i];
      if (cell.unit.alive === false) {
        document.getElementById(`cell_${cell.id}`).style.fill = '#000000';
      } else {
        document.getElementById(`cell_${cell.id}`).style.fill = '#ff0000';
      }
    }
  }
};

const resetf = (paths) => {
  for (const path of paths) {
    for (let i = 0; i < path.cells.length - 1; i += 1) {
      const cell = path.cells[i];
      cell.unit.alive = false;
      cell.birth = 0;
    }
  }
  return paths;
};

/**
* @author Lorenzo Bellani
* @param {*} start nodo di partenza
* @param {*} next prossimo nodo scelto
* @param {*} dist mappa delle distanzr
* @param {*} matrix matrice associata
* @param {*} prev mappa dei perscorsi
*/
function hike(start, dist, matrix, prev) {
  let next = null;
  if (matrix[start]) {
    let matrix_length = matrix[start].length;
    for (let column = 0; column < matrix_length; column += 1) {
      if (matrix[start][column]) {
        if (!dist.has(column) || (dist.has(column) && dist.get(column) > dist.get(start) + matrix[start][column].length)) {
          dist.set(column, dist.get(start) + matrix[start][column].length);
          let array_nodes = JSON.parse(JSON.stringify(prev.get(start)));
          array_nodes.push(column);
          prev.set(column, array_nodes);
        }
        hike(column, dist, matrix, prev);
        /*
        if (next === null || dist.get(next) > dist.get(column)) {
          next = column;
        }
        */
      }
    }
  }
}

const unblock = (paths, matrix, nodes) => {

  const cross = [];
  while (cross.push([]) < nodes.length);

  for (let i = 0; i < paths.length; i += 1) {
    const B = paths[i].B.j;
    const priorityN = paths[i].priority;
    cross[B][priorityN] = paths[i];
  }

  for (const cros of cross) {
    for (const path of cros) {
      const lastCell = path.cells.length - 2;

      if (path.cells[lastCell + 1].unit.alive === true) {
        path.cells[lastCell + 1].unit.alive = false;
      }
      if (path.cells[lastCell].unit.alive === true) {
        const destination = path.cells[lastCell].unit.destination;
        const this_cell = path.cells[lastCell].id;
        if (this_cell !== destination - 1) {
          let ok = false;
          let pathNodeDest = null;
          for (const path2 of paths) {
            for (const cell of path2.cells) {
              if (destination === cell.id) {
                pathNodeDest = path2.B.j;
                ok = true;
                break;
              }
              if (ok) {
                break;
              }
            }
          }
          if (matrix[path.B.j].length > 0) {
            const Q = JSON.parse(JSON.stringify(nodes));

            let dist = new Map();
            let prev = new Map
            dist.set(path.B.j, 0);
            prev.set(path.B.j, [path.B.j]);
            hike(path.B.j, dist, matrix, prev);

            console.log("DISTANZE: ");
            console.log(dist);
            console.log("PERCORSO: ");
            console.log(prev);

            const destination = path.cells[path.cells.length - 2].unit.destination;
            let ok = false;
            for (const path2 of paths) {
              for (const cell of path2.cells) {
                if (destination === cell.id) {
                  const pathNodeDest = path2.B.j;
                  ok = true;
                  break;
                }
                if (ok) {
                  break;
                }
              }
            }
            const next_step = prev.get(pathNodeDest);
            const start_node = next_step[0];
            const next_node = next_step[1];
            for (const path3 of paths) {
              if (path3.A.i === start_node && path3.B.j === next_node) {
                if (!path3.cells[1].unit.alive) {
                  path3.cells[0].unit.destination = destination;
                  path3.cells[0].unit.alive = true;
                }
                else {
                  path.cells[lastCell + 1].unit.alive = true;
                }
                break;
              }
            }
          }
        }
        break;
      }
    }
  }
  let path_to_return = [];
  for(let c = 0; c < cross.length; c += 1){
    for(let p = 0; p < c.length; p +=1){
      path_to_return[c[p].ID]=c[p];
    }
  }
  return path_to_return;
}


const block = (paths, matrix) => {
  const paths3 = JSON.parse(JSON.stringify(paths));
  for (const path of paths3) {
    path.cells.slice(-1)[0].unit.alive = true;
  }
  return paths3;
};

let f = 0;
let h = 0;
let tick = 0;

const heatmapf = (paths) => {
  const heatmap = [];
  let max = 0;
  for (let i = 0; i < paths.length; i += 1) {
    for (let j = 0; j < paths[i].cells.length; j += 1) {
      max = Math.max(max, paths[i].cells[j].increment);
      const point = {
        x: paths[i].cells[j].nextX,
        y: paths[i].cells[j].nextY,
        value: paths[i].cells[j].increment,
      };
      heatmap.push(point);
    }
  }
  return heatmap;
};

let gg = 0;
function routine(paths, virgin, matrix, nodes) {
  const virgin2 = resetf(JSON.parse(JSON.stringify(virgin)));
  const paths2 = upgrade(paths, virgin2);
  const paths3 = random(paths2, database);
  const paths4 = unblock(paths3, matrix, nodes);
  const [paths5, matrix2] = update(paths3, paths, matrix, nodes);
  const heatmap = heatmapf(paths5);
  refresh(paths5);
  tick += 1;
  if (!timeout) {
    var timeout = setTimeout(gg = () => { routine(paths5, virgin2, matrix2, nodes); }, clock);
  }
}

routine(JSON.parse(JSON.stringify(pathsP)), JSON.parse(JSON.stringify(pathsP)), JSON.parse(JSON.stringify(matrix)), JSON.parse(JSON.stringify(nodes)));
