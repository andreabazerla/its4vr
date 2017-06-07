const deg2px = require('./_deg2px');
const haversine = require('./_haversine');

module.exports = {
  getPlacemarks(json, folder) {
    return json.kml.Document[0].Folder[folder].Placemark;
  },
  getBody() {
    const body = document.body;
    return body;
  },
  getSvg(body) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttributeNS(null, 'viewBox', '0 0 1 1');
    svg.setAttributeNS(null, 'id', 'svg');
    body.appendChild(svg);
    return svg;
  },
  getG(svg) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttributeNS(null, 'id', 'g');
    svg.appendChild(g);
    return g;
  },
  getPath(g) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttributeNS(null, 'class', 'highway');
    return path;
  },
  getMap(placemarks, key) {
    let points = [];
    const nodes = [];
    const ways = [];
    const check = [];
    let ID = 0;
    let id = 0;
    let coordinates = '';
    let g = 0;
    if (key === 0) {
      g = this.getG(this.getSvg(this.getBody()));
    }
    for (let i = 0; i < placemarks.length; i += 1) {
      const path = this.getPath();
      const point = placemarks[i].LineString[0].coordinates[0].replace(/\s\s+/g, ' ').trim().split(' ');
      for (let k = 0; k < point.length; k += 1) {
        const lat = parseFloat(point[k].split(',')[0]);
        const lon = parseFloat(point[k].split(',')[1]);
        const xy = deg2px.deg2px(lon, lat);
        const x = xy[0];
        const y = xy[1];
        coordinates += ` ${x},${y}`;
        const Point = {
          ID,
          lat,
          lon,
          x,
          y,
        };
        points.push(Point);
        if (check.indexOf(point[k]) === -1) {
          check.push(point[k]);
          nodes.push(Point);
        }
        ID += 1;
      }
      if (key === 0) {
        path.setAttributeNS(null, 'd', `M ${coordinates}`);
        const data = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        data.setAttributeNS(null, 'class', 'data');
        data.setAttributeNS(null, 'id', `data_${id}`);
        data.innerHTML = `${id}`;

        path.appendChild(data);
        g.appendChild(path);

        id += 1;
      }
      coordinates = '';
      ways.push({
        i,
        points,
      });
      points = [];
    }
    if (key === 0) {
      return g;
    } else if (key === 1) {
      return nodes;
    } else if (key === 2) {
      return ways;
    }
  },
  cells(d, u) {
    return d % u < u / 2 ? Math.floor(d / u) : Math.ceil(d / u);
  },
  ratio(n1, n2, me) {
    let ii = [];
    let jj = [];
    ii = deg2px.deg2px(Number.parseFloat(n1.y1, 10), Number.parseFloat(n1.x1, 10));
    jj = deg2px.deg2px(Number.parseFloat(n2.y2, 10), Number.parseFloat(n2.x2, 10));
    const dx = ii[0] - jj[0];
    const dy = ii[1] - jj[1];
    const x = dx / (me);
    const y = dy / (me);
    return [x, y];
  },
  ratio2(n1, n2, me) {
    let ii = [];
    let jj = [];
    ii = deg2px.deg2px(Number.parseFloat(n1.lon, 10), Number.parseFloat(n1.lat, 10));
    jj = deg2px.deg2px(Number.parseFloat(n2.lon, 10), Number.parseFloat(n2.lat, 10));
    const dx = ii[0] - jj[0];
    const dy = ii[1] - jj[1];
    const x = dx / (me);
    const y = dy / (me);
    return [x, y];
  },
  getMatrix(ways, points, g, key) {
    const paths = [];
    const matrix = [];
    while (matrix.push([]) < 50);

    let i = 0;
    let j = 0;
    let k = 0;
    let ID = 0;
    let w = 0;
    let cells = [];
    let id = 0;

    for (const way of ways) {
      for (const q of points) {
        for (const qq of points) {
          for (let l = 0; l + 1 < (way.points).length; l += 1) {
            const h = k + 1;
            const x1 = Number.parseFloat(way.points[k].lat, 10);
            const y1 = Number.parseFloat(way.points[k].lon, 10);
            const x2 = Number.parseFloat(way.points[h].lat, 10);
            const y2 = Number.parseFloat(way.points[h].lon, 10);
            if (Number.parseFloat(q.lat, 10) === x1 && Number.parseFloat(q.lon, 10) === y1 && Number.parseFloat(qq.lat, 10) === x2 && Number.parseFloat(qq.lon, 10) === y2) {

              let nextX = 0;
              let nextY = 0;

              const birth = 0;
              const death = 0;

              const idu = 0;
              const type = 0;
              let alive = false;
              const age = 0;

              cells.push({
                id,
                nextX,
                nextY,
                birth,
                death,
                unit: {
                  idu,
                  type,
                  alive,
                  age,
                },
              });

              id += 1;

              const nm = this.cells(haversine.haversine(x1, y1, x2, y2), 5);
              nextX = deg2px.deg2px(y1, x1)[0];
              nextY = deg2px.deg2px(y1, x1)[1];

              for (let n = 0; n < nm; n += 1) {
                const x = this.ratio2(way.points[k], way.points[h], nm)[0];
                const y = this.ratio2(way.points[k], way.points[h], nm)[1];

                if (n === 0) {
                  nextX -= x / 2;
                  nextY -= y / 2;
                } else {
                  nextX -= x;
                  nextY -= y;
                }

                cells.push({
                  id,
                  nextX,
                  nextY,
                  birth,
                  death,
                  unit: {
                    idu,
                    type,
                    alive,
                    age,
                  },
                });

                id += 1;
              }
              nextX = 0;
              nextY = 0;
              alive = true;
              const priority = 0;

              cells.push({
                id,
                nextX,
                nextY,
                birth,
                death,
                unit: {
                  idu,
                  type,
                  alive,
                  age,
                },
              });

              const length = haversine.haversine(x1, y1, x2, y2);
              const density = 0;
              const speed = 0;
              const flux = 0;
              const pollution = 0;
              const index = 0;

              paths.push({
                ID,
                A: {
                  i,
                  x1,
                  y1,
                },
                B: {
                  j,
                  x2,
                  y2,
                },
                cells,
                priority,
                length,
                density,
                speed,
                flux,
                pollution,
                index,
              });

              matrix[j][i] = {
                length,
                density,
                speed,
                flux,
                pollution,
                index,
              };

              ID += 1;
            }
            cells = [];
            k += 1;
          }
          k = 0;
          j += 1;
        }
        j = 0;
        i += 1;
      }
      i = 0;
      w += 1;
    }
    if (key === 0) {
      return ways;
    } else if (key === 1) {
      return matrix;
    } else if (key === 2) {
      return paths;
    }
  },
  getCells(paths, g, key) {
    const cells = [];
    let id = 0;
    for (const path of paths) {

      let nextX = 0;
      let nextY = 0;
      const birth = 0;
      const death = 0;
      let alive = false;
      const idu = 0;
      const type = 0;
      const age = 0;


      cells.push({
        id,
        nextX,
        nextY,
        birth,
        death,
        unit: {
          idu,
          type,
          alive,
          age,
        },
      });

      id += 1;

      const m = this.cells(haversine.haversine(Number.parseFloat(path.A.x1, 10), Number.parseFloat(path.A.y1, 10), Number.parseFloat(path.B.x2, 10), Number.parseFloat(path.B.y2, 10)), 5);
      nextX = deg2px.deg2px(Number.parseFloat(path.A.y1, 10), Number.parseFloat(path.A.x1, 10))[0];
      nextY = deg2px.deg2px(Number.parseFloat(path.A.y1, 10), Number.parseFloat(path.A.x1, 10))[1];

      for (let n = 0; n < m; n += 1) {
        const x = this.ratio(path.A, path.B, m)[0];
        const y = this.ratio(path.A, path.B, m)[1];

        if (n === 0) {
          nextX -= x / 2;
          nextY -= y / 2;
        } else {
          nextX -= x;
          nextY -= y;
        }

        cells.push({
          id,
          nextX,
          nextY,
          birth,
          death,
          unit: {
            idu,
            type,
            alive,
            age,
          },
        });

        if (key === 0) {
          const cell = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          const data = document.createElementNS('http://www.w3.org/2000/svg', 'title');

          cell.setAttributeNS(null, 'class', 'circle');
          cell.setAttributeNS(null, 'id', `cell_${id}`);
          cell.setAttributeNS(null, 'cx', nextX);
          cell.setAttributeNS(null, 'cy', nextY);
          cell.setAttributeNS(null, 'r', '0.005px');

          data.setAttributeNS(null, 'class', 'data');
          data.setAttributeNS(null, 'id', `data_${id}`);
          data.innerHTML = `${id}`;

          g.appendChild(cell);
          cell.appendChild(data);
        }

        id += 1;
      }
      nextX = 0;
      nextY = 0;

      cells.push({
        id,
        nextX,
        nextY,
        birth,
        death,
        unit: {
          idu,
          type,
          alive,
          age,
        },
      });
    }
    return cells;
  },
};
