//char Control
var idsBssidsArray = []
var expArray = []
//Gradient Control
var iArr = []
var eArr = []
var mobileLocation = null
var myChart = null
var EXPChoices = null
var IDSChoices = null
var regressionResult = null
var comparisonData = null
function onDocumentLoad() {
  EXPChoices = new Choices(document.getElementById('EXPs'), {
    removeItemButton: true,
  })
  IDSChoices = new Choices(document.getElementById('IDs'), {
    removeItemButton: true,
  })
  EXPChoices.passedElement.element.addEventListener(
    'addItem',
    function (event) {
      if (event.detail.value == 'all') {
        EXPChoices.config.choices.forEach((item) => {
          if (item.value != 'all') EXPChoices.setValue([item])
        })
        EXPChoices.removeActiveItemsByValue('all')
      } else {
        expArray.push(event.detail.value)
      }
    },
    false
  )
  IDSChoices.passedElement.element.addEventListener(
    'addItem',
    function (event) {
      if (event.detail.value == 'all') {
        IDSChoices.config.choices.forEach((item) => {
          if (item.value != 'all') IDSChoices.setValue([item])
        })
        IDSChoices.removeActiveItemsByValue('all')
      } else {
        idsBssidsArray.push(event.detail.value)
      }
    },
    false
  )

  IDSChoices.passedElement.element.addEventListener(
    'removeItem',
    function (event) {
      idsBssidsArray = idsBssidsArray.filter(
        (item) => item !== event.detail.value
      )
    },
    false
  )
  EXPChoices.passedElement.element.addEventListener(
    'removeItem',
    function (event) {
      expArray = expArray.filter((item) => item !== event.detail.value)
    },
    false
  )
}

function createOptions(select, options) {
  select.html('<option value="all">Select All</option>')
  for (var i = 0; i < options.length; i++) {
    select.append(
      '<option value="' + options[i] + '">' + options[i] + '</option>'
    )
  }
}

function fetchJSON(url) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then((jsonData) => {
      //  console.log(jsonData); // do something with the retrieved JSON data
      parse(jsonData)
    })
    .catch((error) => {
      console.error('There was a problem fetching the JSON data:', error)
    })
}
// Function to handle file upload
$('#jsonFile').change(function () {
  var file = this.files[0]
  var reader = new FileReader()
  reader.onload = function (e) {
    var data = JSON.parse(e.target.result)
    createOptions($('#IDs'), data.listIDsAndBSSIDS)
    createOptions($('#EXPs'), data.listExp)
    createOptions($('#EXP_VIEW'), data.listExp)
    onDocumentLoad()
    comparisonData = data.comparisonData
    iArr = data.listIDsAndBSSIDS
    eArr = data.listExp
    mobileLocation = data.mobileLocationMap
    localStorage.setItem('comparisonData', comparisonData)
    localStorage.setItem('iArr', iArr)
    localStorage.setItem('eArr', eArr)
    localStorage.setItem('mobileLocation', mobileLocation)
  }
  reader.readAsText(file)
})
function parse(data) {
  createOptions($('#IDs'), data.listIDsAndBSSIDS)
  createOptions($('#EXPs'), data.listExp)
  createOptions($('#EXP_VIEW'), data.listExp)
  onDocumentLoad()
  comparisonData = data.comparisonData
  iArr = data.listIDsAndBSSIDS
  eArr = data.listExp
  mobileLocation = data.mobileLocationMap
  localStorage.setItem('comparisonData', comparisonData)
  localStorage.setItem('iArr', iArr)
  localStorage.setItem('eArr', eArr)
  localStorage.setItem('mobileLocation', mobileLocation)
}
$('#EXP_VIEW').change(function () {
  let exp = document.querySelector('#EXP_VIEW').value
  let pos = teste(exp)
  Draw(pos, mobileLocation[exp], 0, 0x0000ff)
})

$('#TECHNOLOGY').change(function () {
  if (document.querySelector('#TECHNOLOGY').value == 'UWB') {
    bias = (measurement) => measurement
    technology = (id) => id <= 4
  } else {
    technology = (id) => id > 4
    bias = measurement => measurement / 1.16 - 0.63
  }
})
function createChart() {
  if (myChart) {
    myChart.destroy() // Destroy the existing chart
  }
  data_main = comparisonData
    .filter(
      (item) => idsBssidsArray.includes(item.id) && expArray.includes(item.exp)
    )
    .map((item) => ({
      x: item.groundTruth,
      y: item.measurement,
      id: item.id,
    }))
  const start = 0
  const end = 10
  const step = 0.001
  const range = []

  for (let i = start; i <= end; i += step) {
    range.push(i)
  }

  regressionResult = regression.linear(
    data_main.map((data) => [data.x, data.y])
  )
  const lmsLine = {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'LMS Line',
          data: range.map((data) => ({
            x: data,
            y: regressionResult.predict(data)[1],
          })),
          borderColor: 'rgba(255, 0, 0, 1)',
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderWidth: 1,
          fill: false,
        },
      ],
    },
  }
  const ctx = document.getElementById('comparisonChart').getContext('2d')
  myChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'y=x line',
          data: [
            {
              x: 0,
              y: 0,
            },
            {
              x: 10,
              y: 10,
            },
          ],
          borderColor: 'rgba(255, 45, 0, 1)',
          type: 'line', // Set the type for this dataset to 'line'
          fill: false,
        },
        {
          label: 'LMS',
          data: [
            {
              x: 0,
              y: regressionResult.predict(0)[1],
            },
            {
              x: 10,
              y: regressionResult.predict(10)[1],
            },
          ],
          borderColor: 'rgba(255, 255, 0, 1)',
          type: 'line', // Set the type for this dataset to 'line'
          fill: false,
        },
        {
          label: 'groundTruth X measurement',

          data: data_main,
          pointBackgroundColor: data_main.map((item) =>
            item.id.length === 4
              ? 'rgba(75, 192, 192, 1)'
              : 'rgba(54, 162, 235, 1)'
          ),
          pointBorderColor: data_main.map((item) =>
            item.id.length === 4
              ? 'rgba(75, 192, 192, 1)'
              : 'rgba(54, 162, 235, 1)'
          ),
          borderWidth: 1,
        },
      ],
    },
    options: {
      events: [], // Disable all mouse interactions
      plugins: {
        tooltip: {
          enabled: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Ground Truth',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Measurement',
          },
        },
      },
    },
  })
}

function Draw(pos, true_pos, id, color) {
  var objectToRemove = scene.getObjectByName(`smartphone_${id}`)
  if (objectToRemove !== undefined) {
    scene.remove(objectToRemove)
  }

  objectToRemove = scene.getObjectByName(`guess_${id}`)
  if (objectToRemove !== undefined) {
    scene.remove(objectToRemove)
  }
  const coneGeometry = new THREE.ConeGeometry(1, 2, 32)
  // Create a blue material for the cone
  const coneMaterialBlue = new THREE.MeshBasicMaterial({ color: color })
  // Create a mesh from the geometry and material, and position it
  const guess = new THREE.Mesh(coneGeometry, coneMaterialBlue)
  guess.position.set(pos.x * 20, 0, pos.y * 20)

  // Add the cone mesh to the scene and give it an ID for later reference
  guess.name = `guess_${id}`

  // Create a blue material for the cone
  const coneMaterialGreen = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  // Create a mesh from the geometry and material, and position it
  const smartphone = new THREE.Mesh(coneGeometry, coneMaterialGreen)
  smartphone.position.set(true_pos[0] * 20, true_pos[2] * 20, true_pos[1] * 20)

  // Add the cone mesh to the scene and give it an ID for later reference
  smartphone.name = `smartphone_${id}`

  scene.add(guess)
  scene.add(smartphone)
}
$(document).ready(function () {
  console.log('Page has finished loading')
  fetchJSON('./file.json')
  toggleCanvas(0)
})
function toggleCanvas(i) {
  if (i == 0) {
    document
      .querySelectorAll('.index')
      .forEach((item) => (item.style.display = 'block'))
    document
      .querySelectorAll('.viwer')
      .forEach((item) => (item.style.display = 'none'))
  } else {
    document
      .querySelectorAll('.viwer')
      .forEach((item) => (item.style.display = 'flex'))

    document
      .querySelectorAll('.index')
      .forEach((item) => (item.style.display = 'none'))
  }
}

//comparisonData.filter(x => x.exp=="EXP_52").forEach(x => {if(!f.includes(x.id))f.push(x.id)})
function groupByIdAndTimestampWithMargin(objects) {
  // Group objects by timestamp (considering 0.5 seconds after and 0.4 seconds before)
  const timestampMap = new Map()
  objects.forEach((obj) => {
    let found = false
    const objDate = new Date(obj.timestamp)
    timestampMap.forEach((value, key) => {
      const keyDate = new Date(key)
      if (
        Math.abs(objDate.getTime() - keyDate.getTime()) < 1000
        //&&
        //        objDate.getSeconds() === keyDate.getSeconds()
      ) {
        value.push(obj)
        found = true
      }
    })

    if (!found) {
      timestampMap.set(obj.timestamp, [obj])
    }
  })

  // Create a map with distinct ids and their average measurements
  const resultMap = new Map()
  timestampMap.forEach((group, timestamp) => {
    const idMap = new Map()
    group.forEach((obj) => {
      if (!idMap.has(obj.id)) {
        idMap.set(obj.id, { sum: 0, count: 0 })
      }
      const currentValue = idMap.get(obj.id)
      currentValue.sum += obj.measurement
      currentValue.count++
      currentValue.position = obj.pos
      idMap.set(obj.id, currentValue)
    })

    const averagedIdMap = new Map()
    idMap.forEach((value, id) => {
      averagedIdMap.set(id, {
        position: value.position,
        measurement: value.sum / value.count,
      })
    })

    resultMap.set(timestamp, averagedIdMap)
  })

  return resultMap
}

function removeAllObjects() {
  scene.children.forEach((item) => {
    if (item.name.includes('smartphone') || item.name.includes('guess')) {
      scene.remove(item)
    }
  })
}

function teste2(groupSize,EXP_T) {
  let objectToRemove = scene.getObjectByName('guideLine')
  if (objectToRemove !== undefined) {
    scene.remove(objectToRemove)
  }

  const material = new THREE.LineBasicMaterial({ color: 0x00ff00 })
  const points = []
  points.push(new THREE.Vector3(1, 0, 1.66))
  points.push(new THREE.Vector3(8, 0, 1.66))
  points.push(new THREE.Vector3(8, 0, 3.66))
  points.push(new THREE.Vector3(1, 0, 3.66))
  points.push(new THREE.Vector3(1, 0, 1.66))
  points.forEach((p) => {
    p.multiplyScalar(20)
  })
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const line = new THREE.Line(geometry, material)
  line.name = 'guideLine'
  scene.add(line)
  var t = comparisonData.filter((item) => {
    return item.exp == EXP_T && technology(item.id.length)
  })
  let s = groupByIdAndTimestampWithMargin(t)
  let keyArr = Array.from(s.keys())
  let c = 0
  let arrColors = []
  let idInterval = setInterval(() => {
    if (keyArr[c] == undefined) {
      clearInterval(idInterval)
      removeAllObjects()
      return
    }
    let arr = Array.from(s.get(keyArr[c]).values())
    let cc = combinations(arr, groupSize)
    if (arrColors.length == 0) {
      arrColors = new Array(cc.length).fill(-1)
    }
    let d = 0
    cc.forEach((item) => {
      if (arrColors[d] == -1) {
        arrColors[d] = randomColor()
      }
      item.forEach((x) => (x.measurement = bias(x.measurement)))
      let pos = gradientDescent(
        item,
        initialGuess,
        learningRate,
        numIterations,
        tolerance
      )
      Draw(pos, [0, 0, 0], d, arrColors[d])
      d++
    })
    c++
  }, 200)
}
