exports.deg2px = function (lat, lon) {

  const href = window.location.href;
  const url = new URL(href);
  const test = url.searchParams.get('test');

  let mapLatTop = 0;
  let mapLatBottom = 0;
  let mapLonLeft = 0;
  let mapLonRight = 0;

  /*
  TEST-1
   */

  switch (test) {
    case '1':
    case '2':
    case '3':
      mapLatTop = 45.40967;
      mapLatBottom = 45.40616;
      mapLonLeft = 10.97420;
      mapLonRight = 10.979209;
      break;
    default:
  }

  /*
  VERONA
   */
  // const mapLatTop = 45.4322;
  // const mapLatBottom = 45.3957;
  // const mapLonLeft = 10.9486;
  // const mapLonRight = 11.0014;

  const mapLonDelta = mapLonRight - mapLonLeft;

  const worldMapWidth = 180 / (mapLonDelta * Math.PI);
  let f = Math.sin(mapLatBottom * (Math.PI / 180));
  const mapOffsetY = (worldMapWidth / 2) * Math.log((1 + f) / (1 - f));
  f = Math.sin(mapLatTop * (Math.PI / 180));
  const mapOffsetTopY = (worldMapWidth / 2) * Math.log((1 + f) / (1 - f));
  const mapHeightNew = mapOffsetTopY - mapOffsetY;
  const newWidth = mapHeightNew;
  const mapRatioWidth = 1 / newWidth;

  const x = (lon - mapLonLeft) * (mapRatioWidth / mapLonDelta);
  f = Math.sin((lat * Math.PI) / 180);
  const y = (mapHeightNew - (((worldMapWidth / 2) * Math.log((1 + f) / (1 - f))) - mapOffsetY));

  return [x, y];
};
