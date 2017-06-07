exports.haversine = function (lon1, lat1, lon2, lat2) {
  const R = 6371 * 1000;
  const lat12 = lat1 * (Math.PI / 180);
  const lat22 = lat2 * (Math.PI / 180);
  const deltaLat = (lat2 - lat1) * (Math.PI / 180);
  const deltaLon = (lon2 - lon1) * (Math.PI / 180);

  const a = (Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)) +
            (Math.cos(lat12) * Math.cos(lat22) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
