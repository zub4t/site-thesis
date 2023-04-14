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

$(function () {
  // Function to create options for select element
  function createOptions(select, options) {
    select.html('<option>Select ' + select.attr('id') + '(s)</option>')
    for (var i = 0; i < options.length; i++) {
      select.append(
        '<option value="' + options[i] + '">' + options[i] + '</option>'
      )
    }
  }

  // Function to handle file upload
  $('#jsonFile').change(function () {
    var file = this.files[0]
    var reader = new FileReader()
    reader.onload = function (e) {
      var data = JSON.parse(e.target.result)
      createOptions($('#IDs'), data.listIDsAndBSSIDS)
      createOptions($('#EXPs'), data.listExp)
      createOptions($('#EXP_VIEW'),data.listExp)
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
})

$('#EXP_VIEW').change(function () {
  let exp=document.querySelector('#EXP_VIEW').value
  let pos = teste(exp)
  Draw(pos, mobileLocation[exp])



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

function Draw(pos, true_pos) {
  var objectToRemove = scene.getObjectByName('smartphone')
  if (objectToRemove !== undefined) {
    scene.remove(objectToRemove)
  }

  objectToRemove = scene.getObjectByName('guess')
  if (objectToRemove !== undefined) {
    scene.remove(objectToRemove)
  }
  const coneGeometry = new THREE.ConeGeometry(1, 2, 32)
  // Create a blue material for the cone
  const coneMaterialBlue = new THREE.MeshBasicMaterial({ color: 0x0000ff })
  // Create a mesh from the geometry and material, and position it
  const guess = new THREE.Mesh(coneGeometry, coneMaterialBlue)
  guess.position.set(pos.x * 20, 0, pos.y * 20)

  // Add the cone mesh to the scene and give it an ID for later reference
  guess.name = 'guess'

  // Create a blue material for the cone
  const coneMaterialGreen = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  // Create a mesh from the geometry and material, and position it
  const smartphone = new THREE.Mesh(coneGeometry, coneMaterialGreen)
  smartphone.position.set(true_pos[0] * 20, true_pos[2] * 20, true_pos[1] * 20)

  // Add the cone mesh to the scene and give it an ID for later reference
  smartphone.name = 'smartphone'

  scene.add(guess)
  scene.add(smartphone)
}
$(document).ready(function () {
  console.log('Page has finished loading')
  toggleCanvas(0)
})
function toggleCanvas(i){
  if(i==0){
    document.querySelectorAll('.index').forEach(item=>item.style.display = 'block')
    document.querySelectorAll('.viwer').forEach(item=>item.style.display = 'none')
  }else{

    document.querySelectorAll('.viwer').forEach(item=>item.style.display = 'block')

    document.querySelectorAll('.index').forEach(item=>item.style.display = 'none')
  }
}
