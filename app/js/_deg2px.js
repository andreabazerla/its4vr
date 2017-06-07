exports.deg2px = function (lat, lon) {
  // const mapLatTop = 45.47;
  // const mapLatBottom = 45.37;
  // const mapLonLeft = 10.92;
  // const mapLonRight = 11.06;

  const mapLatTop = 45.38633;
  const mapLatBottom = 45.38401;
  const mapLonLeft = 10.97059;
  const mapLonRight = 10.97398;

  // const mapLatTop = 45.40205;
  // const mapLatBottom = 45.40065;
  // const mapLonLeft = 10.98091;
  // const mapLonRight = 10.98293;

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
