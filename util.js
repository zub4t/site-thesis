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


function combinations(arr, groupSize) {
  if (groupSize === 0) {
    return [[]];
  }
  
  if (arr.length < groupSize) {
    return [];
  }
  
  const result = [];
  for (let i = 0; i <= arr.length - groupSize; i++) {
    const remainingCombinations = combinations(arr.slice(i + 1), groupSize - 1);
    for (const combination of remainingCombinations) {
      result.push([arr[i], ...combination]);
    }
  }

  return result;
}

function randomColor() {
  const colorValue = Math.floor(Math.random() * 0xffffff);
  return colorValue;
}
