exports.deg2px = function (lat, lon) {

  const mapLatTop = 45.38633;
  const mapLatBottom = 45.38401;
  const mapLonLeft = 10.97059;
  const mapLonRight = 10.97398;

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
