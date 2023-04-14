
const initialGuess = { x: 0, y: 0, z: 0 };
const learningRate = 0.01;
const numIterations = 1000;
const tolerance = 1e-9;
function teste(EXP_T){
  
  const test_data = []
  
  iArr.forEach( id =>{
    if(id.length>4){
      const arr = comparisonData.filter(item=>item.id==id && item.exp == EXP_T)  
      const sum = arr.reduce((accumulator, currentValue) => accumulator + currentValue.measurement, 0);
      const average = sum/arr.length
      test_data.push({position:arr[0].pos,measurement:average})
    }
  }) 


  return gradientDescent(test_data, initialGuess, learningRate, numIterations,tolerance);
}
function gradient(measurements, target) {
  const dx = 1e-9;
  const grad = { x: 0, y: 0, z: 0 };

  measurements.forEach((m) => {
    const dist = euclideanDistance(target, m.position);
    const error = m.measurement - dist;

    grad.x += (error / dist) * (target.x - m.position.x);
    grad.y += (error / dist) * (target.y - m.position.y);
    grad.z += (error / dist) * (target.z - m.position.z);
  });

  return grad;
}


function gradientDescent(measurements, initialGuess, learningRate, maxIterations, tolerance) {
  let target = { ...initialGuess };
  let prevCost = costFunction(measurements, target);
  let improvement = Number.POSITIVE_INFINITY;

  for (let i = 0; i < maxIterations && improvement > tolerance; i++) {
    const grad = gradient(measurements, target);
    target.x += learningRate * grad.x;
    target.y += learningRate * grad.y;
    target.z += learningRate * grad.z;

    const currentCost = costFunction(measurements, target);
    improvement = Math.abs(currentCost - prevCost);
    prevCost = currentCost;
  }

  return target;
}
