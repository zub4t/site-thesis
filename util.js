function euclideanDistance(p1, p2) {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2)
  );
}

function costFunction(measurements, target) {
  let cost = 0;
  measurements.forEach((m) => {
    cost += Math.abs(m.measurement - euclideanDistance(target, m.position));
  });
  return cost;
}
