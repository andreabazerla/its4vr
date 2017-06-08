const Parser = require('./_parser');
const map = require('../json/test-1.json');

let clock = 1000 / 3;
let background = '#ffffff';
let highways = '#000000';
let stroke = 0;
let clock2 = 3;
let densityIndex = 1;
let speedIndex = 1;
let fluxIndex = 1;
let pollutionIndex = 1;

const FizzyText = function(clock2, background, highways, stroke, densityIndex, speedIndex, pollutionIndex) {
  this.clock = clock2;
  this.background = background;
  this.highways = highways;
  this.stroke = stroke;
  this.densityIndex = densityIndex;
  this.speedIndex = speedIndex;
  this.pollutionIndex = pollutionIndex;
};

const text = new FizzyText(clock2, background, highways, stroke, densityIndex, speedIndex, pollutionIndex);
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


gui.remember(text);

const g = Parser.getMap(Parser.getPlacemarks(map, 1), 0);
const nodes = Parser.getMap(Parser.getPlacemarks(map, 1), 1);
const ways = Parser.getMap(Parser.getPlacemarks(map, 1), 2);

const paths = Parser.getMatrix(ways, nodes, g, 2);
const matrix = Parser.getMatrix(ways, nodes, g, 1);
const cells = Parser.getCells(paths, g, 0);

const pathsP = JSON.parse(JSON.stringify(paths));

const database = new Set();

const active = [];
active.push(0,13,19);

const dead = [];
active.push(42);

const priority = new Map();
// priority.set(21, -1);

const heatmap = [];

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
  for (let i = 0; i < paths.length; i += 1) {
    for (let j = 1; j < paths[i].cells.length - 1; j += 1) {
      let alive2 = pollution.get(paths[i].cells[j].id);
      if (paths[i].cells[j].unit.alive === true) {
        const x = paths[i].cells[j].nextX;
        const y = paths[i].cells[j].nextY;
        const coo = {
          x,
          y,
        };
        alive += 1;
        alive2 += 1;
        pollution.set(paths[i].cells[j].id, alive2);
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
    if (paths[i].cells.length > maxLength) maxLength = paths[i].cells.length;
    if (totAlive > maxPollution) maxPollution = totAlive;
    normPollution = 1 - (totAlive / maxPollution);
    // let normPollution2 = 0;
    // const normLength = paths[i].cells.length / maxLength;
    // if (normPollution > 0) {
    // normPollution2 = (normPollution + (1 - normLength)) / 2;
    //  normPollution2 = normPollution;
    // } else {
    //  normPollution2 = normPollution;
    // }
    // normPollution2 = normPollution;
    // console.log(i + ' ' + normPollution);
    paths[i].pollution = normPollution;
    const index = Math.round((((density * densityIndex) + (speed * speedIndex) + (normPollution * pollutionIndex)) / (((densityIndex + speedIndex + pollutionIndex)))) * 100) / 100;
    paths[i].index = index;
    console.log(i + ' ' + Math.round(index * 100) + '%');
    for (const A of nodes) {
      for (const B of nodes) {
        if (paths[i].A.x1 === A.lat && paths[i].A.y1 === A.lon && paths[i].B.x2 === B.lat && paths[i].B.y2 === B.lon) {
          matrix[paths[i].B.j][paths[i].A.i].density = density;
          matrix[paths[i].B.j][paths[i].A.i].speed = speed;
          matrix[paths[i].B.j][paths[i].A.i].flux = flux;
          matrix[paths[i].B.j][paths[i].A.i].pollution = pollution;
          matrix[paths[i].B.j][paths[i].A.i].index = index;
        }
      }
    }
    alive = 0;
    totAlive = 0;
    density = 0;
    speed = 0;
    flux = 0;
    changed = 0;
  }
  console.log('----------------------');
  console.log(heatmap);
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
          } else {
            ((virgin[path.ID].cells)[h]).unit.alive = ((path.cells)[h]).unit.alive;
            ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[h]).unit.idu;
          }
        } else {
          if (((path.cells)[p2]).unit.alive === true) {
            ((virgin[path.ID].cells)[h]).unit.alive = true;
            ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[p0]).unit.idu;
            ((virgin[path.ID].cells)[p0]).unit.idu = 0;
          } else {
            ((virgin[path.ID].cells)[h]).unit.alive = true;
            ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[p0]).unit.idu;
            ((virgin[path.ID].cells)[p0]).unit.idu = 0;
          }
        }
      } else {
        if (((path.cells)[p1]).unit.alive === true) {
          if (((path.cells)[p2]).unit.alive === false) {
            ((virgin[path.ID].cells)[h]).unit.alive = false;
            ((virgin[path.ID].cells)[p2]).unit.idu = ((path.cells)[h]).unit.idu;
            ((virgin[path.ID].cells)[h]).unit.idu = 0;
          } else {
            ((virgin[path.ID].cells)[h]).unit.alive = ((path.cells)[h]).unit.alive;
            ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[h]).unit.idu;
          }
        } else {
          ((virgin[path.ID].cells)[h]).unit.alive = ((path.cells)[h]).unit.alive;
          ((virgin[path.ID].cells)[h]).unit.idu = ((path.cells)[h]).unit.idu;
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
  for (const birth of active) {
    for (const path of paths) {
      for (const cell of path.cells) {
        if (cell.id === birth) {
          cell.birth = Math.random();
          let id = 0;
          if (database.size < 9000000000) {
            while (id === 0) {
              id = createID(database);
            }
          } else {
            id = 0;
          }
          if (cell.birth > 0.90 && path.cells[1].unit.alive === false) {
            cell.unit.alive = true;
            cell.unit.idu = id;
          } else {
            cell.unit.alive = false;
          }
          break;
        }
        break;
      }
    }
  }
  for (const death of dead) {
    for (const path of paths) {
      for (const cell of path.cells) {
        if (cell.id === dead) {
          cell.death = Math.random();
          break;
        }
        break;
      }
      break;
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

// const unblock = (paths, matrix) => {
//   for (const path of paths) {
//     if (path.priority === 0) {
//       path.cells.slice(-1)[0].alive = false;
//     }
//     if (path.cells[1].alive === false) {
//       for (const path2 of paths) {
//         if (path2.priority >= 0) {
//           if (path.A.x1 === path2.B.x2 && path.A.y1 === path2.B.y2) {
//             if (path2.cells[path2.cells.length - 2].alive === true) {
//               path.cells[0].alive = true;
//             }
//           }
//         }
//       }
//     }
//   }
//   return paths;
// };

const unblock = (paths, matrix, nodes) => {
  const map2 = new Map();
  const map3 = new Map();
  for (const path of paths) {
    if (path.priority === 0) {
      path.cells.slice(-1)[0].unit.alive = false;
    }
    // for (const A of nodes) {
    //   for (const B of nodes) {
    //     if (path.A.x1 === A.lat && path.A.y1 === A.lon && path.B.x2 === B.lat && path.B.y2 === B.lon) {
    //       map2.set([path.B.j, path.A.i], matrix[path.B.j][path.A.i].density);
    //     }
    //   }
    // }
    // for (const path of paths) {
    //   if (path.cells[1].alive === false) {
    //     console.log(path);
    //   }
    // }
  }
  return paths;
};

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

let gg = 0;
function routine(paths, virgin, matrix, nodes) {
  const virgin2 = resetf(JSON.parse(JSON.stringify(virgin)));
  const paths2 = upgrade(paths, virgin2);
  const paths3 = random(paths2, database);
  // const paths4 = unblock(paths3, matrix, nodes);
  const [paths5, matrix2] = update(paths3, paths, matrix, nodes);
  refresh(paths5);
  tick += 1;
  if (!timeout) {
    var timeout = setTimeout(gg = () => { routine(paths5, virgin2, matrix2, nodes); }, clock);
  }
}

routine(JSON.parse(JSON.stringify(pathsP)), JSON.parse(JSON.stringify(pathsP)), JSON.parse(JSON.stringify(matrix)), JSON.parse(JSON.stringify(nodes)));
