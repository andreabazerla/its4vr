const Parser = require('./_parser');
const uuidv1 = require('uuid/v1');
const href = window.location.href;
const url = new URL(href);
const test = url.searchParams.get('test');

let map = null;
switch (test) {
  case '0':
    map = require('../json/test-0.json');
    break;
  case '1':
    map = require('../json/test-1.json');
    break;
  case '2':
    map = require('../json/test-2.json');
    break;
  case '3':
    map = require('../json/test-3.json');
    break;
  case '4':
    map = require('../json/test-4.json');
    break;
  case '5':
    map = require('../json/test-5.json');
    break;
  case '6':
    map = require('../json/test-6.json');
    break;
  default:
    map = require('../json/test-0.json');
}

let clock = 1000 / 3;
let background = '#ffffff';
let highways = '#000000';
let stroke = 0;
let cellsAlive = '#ff0000';
let hideCells = true;
let showWeights = true;
const clock2 = 3;
let densityIndex = 1;
let speedIndex = 1;
let fluxIndex = 1;
let pollutionIndex = 1;
let lengthIndex = 1;
let typeIndex = 0.5;
let historyPollution = 100;
let increasePollution = 10;
let decreasePollution = 1;

const g = Parser.getMap(Parser.getPlacemarks(map, 0), 0);
const nodes = Parser.getMap(Parser.getPlacemarks(map, 0), 1);
let ways = Parser.getMap(Parser.getPlacemarks(map, 0), 2);
const paths = Parser.getMatrix(ways, nodes, g, 2);
const matrix = Parser.getMatrix(ways, nodes, g, 1);
ways = Parser.getMatrix(ways, nodes, g, 0);
const cells = Parser.getCells(paths, g, 0);

const pathsP = JSON.parse(JSON.stringify(paths));

//const database = new Set();

const active = new Map();
const dead = [];
const priority = new Map();

switch (test) {
  case '0':
    active.set(0, 0.25);

    dead.push(51);
    break;
  case '1':
    active.set(0, 0.5);

    dead.push(151);

    priority.set(4, 0);
    priority.set(1, 1);
    break;
  case '2':
    active.set(0, 0.9);
    active.set(171, 0.9);

    dead.push(136);

    priority.set(4, 0);
    priority.set(6, 1);

    priority.set(8, 0);
    priority.set(1, 1);
    break;
  case '3':
    active.set(0, 0.75);

    dead.push(126);

    priority.set(8, 0);
    priority.set(9, 1);

    priority.set(4, 0);
    priority.set(10, 1);
    break;
  case '4':
    active.set(0, 0.5);

    dead.push(151);

    priority.set(4, 0);
    priority.set(1, 1);
    break;
  case '5':
    active.set(128, 0.5);

    dead.push(151);

    priority.set(1, 0);
    priority.set(3, 1);
    break;
  case '6':
    active.set(12, 0.1);
    active.set(47, 0.3);
    active.set(79, 0.5);

    dead.push(11);

<<<<<<< HEAD
    priority.set(1, 0);
    priority.set(2, 1);
    priority.set(3, 2);
    break;
  default:
    //active.set(0, 0.1);
    active.set(2181, 0.1);
    //active.set(3718, 0.1);

    dead.push(718);
    //dead.push(718, 3382, 3715);

    priority.set(7, 0);
    priority.set(2, 1);

    priority.set(0, 0);
    priority.set(41, 1);
    priority.set(18, 2);

    priority.set(25, 0);
    priority.set(24, 1);

    priority.set(26, 0);
    priority.set(16, 1);

    priority.set(29, 0);
    priority.set(27, 1);

    priority.set(33, 0);
    priority.set(32, 1);

    priority.set(38, 0);
    priority.set(37, 1);

    priority.set(19, 0);
    priority.set(39, 1);

    priority.set(12, 0);
    priority.set(42, 1);

    priority.set(45, 0);
    priority.set(14, 1);
    break;
=======
      priority.set(1, 0);
      priority.set(2, 1);
      priority.set(3, 2);
      break;
    default:
      active.set(0, 0.25);

      dead.push(51);
      break;
      // active.set(0, 0.1);
      // active.set(2181, 0.1);
      // active.set(3718, 0.1);
      //
      // dead.push(718, 3382, 3715);
      //
      // priority.set(7, 0);
      // priority.set(2, 1);
      //
      // priority.set(0, 0);
      // priority.set(41, 1);
      // priority.set(18, 2);
      //
      // priority.set(25, 0);
      // priority.set(24, 1);
      //
      // priority.set(26, 0);
      // priority.set(16, 1);
      //
      // priority.set(29, 0);
      // priority.set(27, 1);
      //
      // priority.set(33, 0);
      // priority.set(32, 1);
      //
      // priority.set(38, 0);
      // priority.set(37, 1);
      //
      // priority.set(19, 0);
      // priority.set(39, 1);
      //
      // priority.set(12, 0);
      // priority.set(42, 1);
      //
      // priority.set(45, 0);
      // priority.set(14, 1);
      // break;
>>>>>>> 27ee1badcd169b6efdcf004350c6bc6d93a74deb
}

for (const [key, value] of priority) {
  pathsP[key].priority = value;
}

let pollution = new Map();
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
      if (paths[i].cells[j].unit.alive === true) {
        alive += 1;
        if (paths[i].cells[j].unit.type === 1) {
          alive2 += increasePollution;
          let alive3 = alive2;
          if (tick > historyPollution && alive2 > 0) {
            alive3 = alive2 - decreasePollution;
          }
          pollution.set(paths[i].cells[j].id, alive3);
        }
        paths[i].cells[j].value = alive2;
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
    const basic = Math.round((((normPollution * pollutionIndex) + (normLength * lengthIndex)) / (((pollutionIndex + lengthIndex)))) * 100) / 100;
    const premium = Math.round((((density * densityIndex) + (speed * speedIndex) + (normLength * lengthIndex)) / (((densityIndex + speedIndex + lengthIndex)))) * 100) / 100;
    for (const A of nodes) {
      for (const B of nodes) {
        if (paths[i].A.x1 === A.lat && paths[i].A.y1 === A.lon && paths[i].B.x2 === B.lat && paths[i].B.y2 === B.lon) {
          matrix[paths[i].A.i][paths[i].B.j].density = density;
          matrix[paths[i].A.i][paths[i].B.j].speed = speed;
          matrix[paths[i].A.i][paths[i].B.j].flux = flux;
          matrix[paths[i].A.i][paths[i].B.j].pollution = normPollution;
          matrix[paths[i].A.i][paths[i].B.j].index = index;
          matrix[paths[i].A.i][paths[i].B.j].basic = basic;
          matrix[paths[i].A.i][paths[i].B.j].premium = premium
          matrix[paths[i].A.i][paths[i].B.j].disabled = paths[i].disabled;
        }
      }
    }
    if (showWeights) {
      const lineWeight = (Math.round((1 - index) * 10) / 10) * 10;
      document.getElementById(`path_${i}`).style.strokeWidth = lineWeight;
      document.getElementById(`path_${i}`).style.opacity = lineWeight / 10;
      // const dec = 255 * index;
      // const hex = Number(parseInt(dec, 10)).toString(16);
      // const color = "#" + hex + hex + hex;
      // document.getElementById(`path_${i}`).style.stroke = color;
    } else {
      document.getElementById(`path_${i}`).style.strokeWidth = 1;
      document.getElementById(`path_${i}`).style.stroke = highways;
      document.getElementById(`path_${i}`).style.opacity = 1;
    }
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
        // 1__
        if (((path.cells)[p1]).unit.alive === true) {
          // 11_
          if (((path.cells)[p2]).unit.alive === false) {
            // 110
            if (((path.cells)[p1]).unit.blocked === true) {
              // 1X0
              ((virgin[path.ID].cells)[h]).unit.alive = ((path.cells)[h]).unit.alive;
              ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[h]).unit.idu;
              ((virgin[path.ID].cells)[h]).unit.destination = ((path.cells)[h]).unit.destination;
              ((virgin[path.ID].cells)[h]).unit.type = ((path.cells)[h]).unit.type;
              ((virgin[path.ID].cells)[h]).unit.blocked = ((path.cells)[h]).unit.blocked;
              virgin[path.ID].disabled = true;
            } else {
              // 110
              ((virgin[path.ID].cells)[h]).unit.alive = false;
              ((virgin[path.ID].cells)[p2]).unit.idu = ((path.cells)[h]).unit.idu;
              ((virgin[path.ID].cells)[h]).unit.idu = 0;
              ((virgin[path.ID].cells)[p2]).unit.destination = ((path.cells)[h]).unit.destination;
              ((virgin[path.ID].cells)[h]).unit.destination = null;
              ((virgin[path.ID].cells)[p2]).unit.type = ((path.cells)[h]).unit.type;
              ((virgin[path.ID].cells)[h]).unit.type = null;
              ((virgin[path.ID].cells)[p2]).unit.blocked = ((path.cells)[h]).unit.blocked;
              ((virgin[path.ID].cells)[h]).unit.blocked = false;
              virgin[path.ID].disabled = false;
            }
          } else {
            // 111
            ((virgin[path.ID].cells)[h]).unit.alive = ((path.cells)[h]).unit.alive;
            ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[h]).unit.idu;
            ((virgin[path.ID].cells)[h]).unit.destination = ((path.cells)[h]).unit.destination;
            ((virgin[path.ID].cells)[h]).unit.type = ((path.cells)[h]).unit.type;
            ((virgin[path.ID].cells)[h]).unit.blocked = ((path.cells)[h]).unit.blocked;
          }
        } else {
          // 10_
          if (((path.cells)[p2]).unit.alive === true) {
            // 101
            if (((path.cells)[p0]).unit.blocked === true) {
              ((virgin[path.ID].cells)[p0]).unit.alive = ((path.cells)[p0]).unit.alive;
              ((virgin[path.ID].cells)[p0]).unit.idu = ((path.cells)[p0]).unit.idu;
              ((virgin[path.ID].cells)[p0]).unit.destination = ((path.cells)[p0]).unit.destination;
              ((virgin[path.ID].cells)[p0]).unit.type = ((path.cells)[p0]).unit.type;
              ((virgin[path.ID].cells)[p0]).unit.blocked = ((path.cells)[p0]).unit.blocked;
              virgin[path.ID].disabled = true;
            } else {
              ((virgin[path.ID].cells)[h]).unit.alive = true;
              ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[p0]).unit.idu;
              ((virgin[path.ID].cells)[p0]).unit.idu = 0;
              ((virgin[path.ID].cells)[h]).unit.destination = ((path.cells)[p0]).unit.destination;
              ((virgin[path.ID].cells)[p0]).unit.destination = null;
              ((virgin[path.ID].cells)[h]).unit.type = ((path.cells)[p0]).unit.type;
              ((virgin[path.ID].cells)[p0]).unit.type = null;
              ((virgin[path.ID].cells)[h]).unit.blocked = ((path.cells)[h]).unit.blocked;
              ((virgin[path.ID].cells)[h]).unit.blocked = false;
              virgin[path.ID].disabled = false;
            }
          } else {
            // 100
            if (((path.cells)[p0]).unit.blocked === true) {
              // X00
              ((virgin[path.ID].cells)[p0]).unit.alive = ((path.cells)[p0]).unit.alive;
              ((virgin[path.ID].cells)[p0]).unit.idu = ((path.cells)[p0]).unit.idu;
              ((virgin[path.ID].cells)[p0]).unit.destination = ((path.cells)[p0]).unit.destination;
              ((virgin[path.ID].cells)[p0]).unit.type = ((path.cells)[p0]).unit.type;
              ((virgin[path.ID].cells)[p0]).unit.blocked = ((path.cells)[p0]).unit.blocked;
              virgin[path.ID].disabled = true;
            } else {
              // 100
              ((virgin[path.ID].cells)[h]).unit.alive = true;
              ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[p0]).unit.idu;
              ((virgin[path.ID].cells)[p0]).unit.idu = 0;
              ((virgin[path.ID].cells)[h]).unit.destination = ((path.cells)[p0]).unit.destination;
              ((virgin[path.ID].cells)[p0]).unit.destination = null;
              ((virgin[path.ID].cells)[h]).unit.type = ((path.cells)[p0]).unit.type;
              ((virgin[path.ID].cells)[p0]).unit.type = null;
              ((virgin[path.ID].cells)[h]).unit.blocked = ((path.cells)[p0]).unit.blocked;
              ((virgin[path.ID].cells)[p0]).unit.blocked = false;
              virgin[path.ID].disabled = false;
            }
          }
        }
      } else {
        // 0__
        if (((path.cells)[p1]).unit.alive === true) {
          // 01_
          if (((path.cells)[p2]).unit.alive === false) {
            // 010
            if (((path.cells)[p1]).unit.blocked === true) {
              // 0X0
              ((virgin[path.ID].cells)[h]).unit.alive = ((path.cells)[h]).unit.alive;
              ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[h]).unit.idu;
              ((virgin[path.ID].cells)[h]).unit.destination = ((path.cells)[h]).unit.destination;
              ((virgin[path.ID].cells)[h]).unit.type = ((path.cells)[h]).unit.type;
              ((virgin[path.ID].cells)[h]).unit.blocked = ((path.cells)[h]).unit.blocked;
              virgin[path.ID].disabled = true;
            } else {
              // 010
              ((virgin[path.ID].cells)[h]).unit.alive = false;
              ((virgin[path.ID].cells)[p2]).unit.idu = ((path.cells)[h]).unit.idu;
              ((virgin[path.ID].cells)[h]).unit.idu = 0;
              ((virgin[path.ID].cells)[p2]).unit.destination = ((path.cells)[h]).unit.destination;
              ((virgin[path.ID].cells)[h]).unit.destination = null;
              ((virgin[path.ID].cells)[p2]).unit.type = ((path.cells)[h]).unit.type;
              ((virgin[path.ID].cells)[h]).unit.type = null;
              ((virgin[path.ID].cells)[p2]).unit.blocked = ((path.cells)[h]).unit.blocked;
              ((virgin[path.ID].cells)[h]).unit.blocked = false;
              virgin[path.ID].disabled = false;
            }
          } else {
            // 011
            ((virgin[path.ID].cells)[h]).unit.alive = ((path.cells)[h]).unit.alive;
            ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[h]).unit.idu;
            ((virgin[path.ID].cells)[h]).unit.destination = ((path.cells)[h]).unit.destination;
            ((virgin[path.ID].cells)[h]).unit.type = ((path.cells)[h]).unit.type;
            ((virgin[path.ID].cells)[h]).unit.blocked = ((path.cells)[h]).unit.blocked;
          }
        } else {
          // 00-
          ((virgin[path.ID].cells)[p2]).unit.alive = ((path.cells)[p2]).unit.alive;
          ((virgin[path.ID].cells)[p2]).unit.idu = ((path.cells)[p2]).unit.idu;
          ((virgin[path.ID].cells)[p2]).unit.destination = ((path.cells)[p2]).unit.destination;
          ((virgin[path.ID].cells)[p2]).unit.type = ((path.cells)[p2]).unit.type;
          ((virgin[path.ID].cells)[p2]).unit.blocked = ((path.cells)[p2]).unit.blocked;
        }
      }
    }
  }
  return virgin;
};

const random = (paths) => {
  for (const birth of active.keys()) {
    for (const path of paths) {
      for (const cell of path.cells) {
        if (cell.id === birth) {
          const limit = active.get(cell.id);
          const rand = Math.random();
          let id = 0;
          id = uuidv1();
          /*
          if (database.size < 9000000000) {
            while (id === 0) {
              id = uuidv1();
            }
          } else {
            id = 0;
          }
          */
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
        if (hideCells === true) {
          document.getElementById(`cell_${cell.id}`).style.display = 'none';
        } else {
          document.getElementById(`cell_${cell.id}`).style.display = 'block'
          document.getElementById(`cell_${cell.id}`).style.fill = '#000000';
        }
      } else {
        document.getElementById(`cell_${cell.id}`).style.display = 'block'
        document.getElementById(`cell_${cell.id}`).style.fill = cellsAlive;
        if (cell.unit.type === 1) {
          document.getElementById(`cell_${cell.id}`).style.fill = cellsAlive;
          document.getElementById(`cell_${cell.id}`).style.stroke = cellsAlive;
        } else {
          document.getElementById(`cell_${cell.id}`).style.fill = 'none';
          document.getElementById(`cell_${cell.id}`).style.stroke = cellsAlive;
        }
      }
    }
  }
};


const reset = (paths) => {
  for (const path of paths) {
    for (let i = 0; i < path.cells.length - 1; i += 1) {
      const cell = path.cells[i];
      cell.unit.alive = false;
    }
  }
  return paths;
};

function hike(start, dist, matrix, prev, type) {
  let next = null;

  if (matrix[start]) {
    let matrix_length = matrix[start].length;
    for (let column = 0; column < matrix_length; column += 1) {
      if (matrix[start][column] && !matrix[start][column].disabled) {
        if (type === 1) {
          if (!dist.has(column) || (dist.has(column) && dist.get(column) > dist.get(start) + (1 - matrix[start][column].basic))) {
            dist.set(column, dist.get(start) + (1 - matrix[start][column].basic));
            let array_nodes = JSON.parse(JSON.stringify(prev.get(start)));
            array_nodes.push(column);
            prev.set(column, array_nodes);
          }
        }
        else {
          if (!dist.has(column) || (dist.has(column) && dist.get(column) > dist.get(start) + (1 - matrix[start][column].premium))) {
            dist.set(column, dist.get(start) + (1 - matrix[start][column].premium));
            let array_nodes = JSON.parse(JSON.stringify(prev.get(start)));
            array_nodes.push(column);
            prev.set(column, array_nodes);
          }
        }
        hike(column, dist, matrix, prev, type);
      }
    }
  }
}

const unblock = (paths, matrix, nodes) => {

  const cross = [];
  let type_auto = null;
  while (cross.push([]) < nodes.length);

  for (let i = 0; i < paths.length; i += 1) {
    const B = paths[i].B.j;
    const priorityN = paths[i].priority;
    cross[B][priorityN] = paths[i];
  }

  for (const path of cross) {
    let stop = false;
    for (let i = 0; i < path.length; i += 1) {
      if (!stop) {
        const lastCell = path[i].cells.length - 2;

        if (path[i].cells[lastCell + 1].unit.alive === true) {
          path[i].cells[lastCell + 1].unit.alive = false;
        }

        if (path[i].cells[lastCell].unit.alive === true) {
          const destination = path[i].cells[lastCell].unit.destination;
          const this_cell = path[i].cells[lastCell].id;
          type_auto = path[i].cells[lastCell].unit.type;
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
            if (matrix[path[i].B.j].length > 0) {
              const Q = JSON.parse(JSON.stringify(nodes));
              let dist = new Map();
              let prev = new Map
              dist.set(path[i].B.j, 0);
              prev.set(path[i].B.j, [path[i].B.j]);
              hike(path[i].B.j, dist, matrix, prev, type_auto);

              // console.log("DISTANZE: ");
              // console.log(dist);
              // console.log("PERCORSO: ");
              // console.log(prev);

              const idu = path[i].cells[path[i].cells.length - 2].unit.idu;
              const type = path[i].cells[path[i].cells.length - 2].unit.type;
              const age = path[i].cells[path[i].cells.length - 2].unit.age;
              const destination = path[i].cells[path[i].cells.length - 2].unit.destination;
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
                    path3.cells[0].unit.idu = idu;
                    path3.cells[0].unit.type = type;
                    path3.cells[0].unit.age = age;
                    path3.cells[0].unit.destination = destination;
                    path3.cells[0].unit.alive = true;
                  }
                  else {
                    path[i].cells[lastCell + 1].unit.alive = true;
                  }
                  break;
                }
              }
            }
          }

          for (let k = i + 1; k < path.length; k++) {
            let invisible = path[k].cells.length - 1;
            path[k].cells[invisible].unit.alive = true;
          }

          stop = true;
        }
      }
    }
  }
  let path_to_return = [];
  for (let c = 0; c < cross.length; c += 1) {
    for (let p = 0; p < cross[c].length; p += 1) {
      path_to_return[cross[c][p].ID] = cross[c][p];
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
var tick = 0;

const heatmap = (paths) => {
  const heatmap = [];
  let max = 0;
  for (let i = 0; i < paths.length; i += 1) {
    for (let j = 0; j < paths[i].cells.length; j += 1) {
      max = Math.max(max, paths[i].cells[j].value);
      const point = {
        x: paths[i].cells[j].nextX,
        y: paths[i].cells[j].nextY,
        value: paths[i].cells[j].value,
      };
      heatmap.push(point);
    }
  }
  return heatmap;
};

const on = Math.floor(Math.random() * 250);
const off = Math.floor(Math.random() * 500) + 250;

let gg = 0;
function loop(paths, virgin, matrix, nodes) {
  if (test === '4') {
    if (tick > on && tick < off) {
      if (paths[1].cells[15].unit.alive === true) {
        paths[1].cells[15].unit.blocked = true;
      }
    } else if (tick >= off) {
      if (paths[1].cells[15].unit.alive === true) {
        paths[1].cells[15].unit.blocked = false;
      }
    }
  }
  const virgin2 = reset(JSON.parse(JSON.stringify(virgin)));
  const paths2 = upgrade(paths, virgin2);
  const paths3 = random(paths2);
  const paths4 = unblock(paths3, matrix, nodes);
  const [paths5, matrix2] = update(paths4, paths, matrix, nodes);
  refresh(paths5);
  tick += 1;
  if (!timeout) {
    var timeout = setTimeout(gg = () => { loop(paths5, virgin2, matrix2, nodes); }, clock);
  }
}

loop(JSON.parse(JSON.stringify(pathsP)), JSON.parse(JSON.stringify(pathsP)), JSON.parse(JSON.stringify(matrix)), JSON.parse(JSON.stringify(nodes)));

const FizzyText = function (clock2, background, highways, stroke, cellsAlive, hideCells, showWeights, densityIndex, speedIndex, pollutionIndex, lengthIndex, typeIndex, historyPollution, increasePollution, decreasePollution) {
  // this.pause = function() { clearTimeout(timeout); };
  this.clock = clock2;
  this.background = background;
  this.highways = highways;
  this.stroke = stroke;
  this.cellsAlive = cellsAlive;
  this.hideCells = hideCells;
  this.showWeights = showWeights;
  this.densityIndex = densityIndex;
  this.speedIndex = speedIndex;
  this.pollutionIndex = pollutionIndex;
  this.lengthIndex = lengthIndex;
  this.typeIndex = typeIndex;
  this.historyPollution = historyPollution;
  this.increasePollution = increasePollution;
  this.decreasePollution = decreasePollution;
  const pathURL = location.protocol + '//' + location.host + location.pathname;
  this.test0 = function () { window.location = pathURL + '?test=0'; };
  this.test1 = function () { window.location = pathURL + '?test=1'; };
  this.test2 = function () { window.location = pathURL + '?test=2'; };
  this.test3 = function () { window.location = pathURL + '?test=3'; };
  this.test4 = function () { window.location = pathURL + '?test=4'; };
  this.test5 = function () { window.location = pathURL + '?test=5'; };
  this.test6 = function () { window.location = pathURL + '?test=6'; };
};

const text = new FizzyText(clock2, background, highways, stroke, cellsAlive, hideCells, showWeights, densityIndex, speedIndex, pollutionIndex, lengthIndex, typeIndex, historyPollution, increasePollution, decreasePollution);
const gui = new dat.GUI({
  load: JSON,
  preset: 'Default',
  // autoPlace: false,
});

// gui.domElement.id = 'gui';

const styles = gui.addFolder('Styles');
const controls = gui.addFolder('Controls');
const tests = gui.addFolder('Tests');

styles.addColor(text, 'background').onChange((value) => {
  background = value;
  document.getElementById('svg').style.background = background;
});

styles.addColor(text, 'highways').onChange((value) => {
  highways = value;
  $('.highway').css('stroke', highways);
});

styles.add(text, 'stroke', { Straight: 0, Dotted: 1, Dashed: 5 }).onChange((value) => {
  stroke = value;
  $('.highway').css('stroke-dasharray', stroke);
});

styles.addColor(text, 'cellsAlive').onChange((value) => {
  cellsAlive = value;
});

styles.add(text, 'hideCells').onChange((value) => {
  hideCells = value;
});

styles.add(text, 'showWeights').onChange((value) => {
  showWeights = value;
});

// styles.open();
// controls.open();
gui.close();
// dat.GUI.toggleHide();

// controls.add(text, 'pause');

controls.add(text, 'clock').min(1).max(100).step(1)
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

controls.add(text, 'historyPollution').step(1)
  .onChange((value) => {
    historyPollution = value;
  },
);

controls.add(text, 'increasePollution').step(1)
  .onChange((value) => {
    increasePollution = value;
  },
);

controls.add(text, 'decreasePollution').step(1)
  .onChange((value) => {
    decreasePollution = value;
  },
);

tests.add(text, 'test0');
tests.add(text, 'test1');
tests.add(text, 'test2');
tests.add(text, 'test3');
tests.add(text, 'test4');
tests.add(text, 'test5');
tests.add(text, 'test6');

gui.remember(text);
