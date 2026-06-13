function distance(a, b) {
  const R = 6371;
  const dLat = ((b.latitude || b.lat) - (a.latitude || a.lat)) * (Math.PI / 180);
  const dLon = ((b.longitude || b.lng) - (a.longitude || a.lng)) * (Math.PI / 180);
  const lat1 = (a.latitude || a.lat) * (Math.PI / 180);
  const lat2 = (b.latitude || b.lat) * (Math.PI / 180);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function nearestNeighbor(points, startIndex = 0) {
  if (!Array.isArray(points) || points.length === 0) return [];
  const remaining = points.map((point, index) => ({ ...point, index }));
  const route = [];
  let current = remaining.splice(startIndex, 1)[0];
  route.push(current);

  while (remaining.length > 0) {
    let nearest = remaining[0];
    let bestDistance = distance(current, nearest);

    for (const candidate of remaining.slice(1)) {
      const candidateDistance = distance(current, candidate);
      if (candidateDistance < bestDistance) {
        nearest = candidate;
        bestDistance = candidateDistance;
      }
    }

    current = nearest;
    route.push(current);
    remaining.splice(remaining.indexOf(current), 1);
  }

  return route;
}

function twoOpt(route) {
  if (!Array.isArray(route) || route.length < 4) return route;
  let best = route.slice();
  let improved = true;

  const routeDistance = (path) =>
    path.reduce((sum, point, index) => {
      if (index === 0) return 0;
      return sum + distance(path[index - 1], point);
    }, 0);

  while (improved) {
    improved = false;
    for (let i = 1; i < best.length - 2; i += 1) {
      for (let j = i + 1; j < best.length - 1; j += 1) {
        const newRoute = best
          .slice(0, i)
          .concat(best.slice(i, j + 1).reverse(), best.slice(j + 1));
        if (routeDistance(newRoute) < routeDistance(best)) {
          best = newRoute;
          improved = true;
        }
      }
    }
  }

  return best;
}

module.exports = {
  distance,
  nearestNeighbor,
  twoOpt,
};