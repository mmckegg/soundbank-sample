var Sample = require('./index')

var audioContext = new AudioContext()
var sample = Sample(audioContext)
sample.url = 'hiss.wav'

audioContext.sampleCache = {}
loadSample('/sounds/hiss.wav', function(err, buffer){
  audioContext.sampleCache['hiss.wav'] = buffer
})

sample.connect(audioContext.destination)

addValueSlider(sample, 'startOffset', 0.0001, 0, 1)
addValueSlider(sample, 'endOffset', 0.0001, 0, 1)

addSlider(sample.amp, 0.001, 0, 10)
addSlider(sample.transpose, 1, -24, 24)
addSlider(sample.tune, 1, -600, 600)

var triggerButton = document.createElement('button')
triggerButton.textContent = 'Trigger 10s (reload page between trigger)'
triggerButton.onclick = function(){
  sample.start(audioContext.currentTime)
  sample.stop(audioContext.currentTime+10)
}
document.body.appendChild(triggerButton)

var triggerButton = document.createElement('button')
triggerButton.textContent = 'Trigger 0.1s (reload page between trigger)'
triggerButton.onclick = function(){
  var suggestedEnd = sample.start(audioContext.currentTime)
  if (suggestedEnd){
    sample.stop(suggestedEnd)
  } else {
    sample.stop(audioContext.currentTime+0.1)
  }
}
document.body.appendChild(triggerButton)


var modePicker = document.createElement('select')
modePicker.innerHTML = '<option>hold</option><option>oneshot</option><option>loop</option>'
modePicker.onchange = function(){
  sample.mode = this.value
}
document.body.appendChild(modePicker)

var bufferPicker = document.createElement('select')
bufferPicker.innerHTML = '<option>hiss.wav</option><option>none</option>'
bufferPicker.onchange = function(){
  sample.url = this.value
}
document.body.appendChild(bufferPicker)


function addSlider(param, step, min, max){
  var container = document.createElement('div')
  container.appendChild(document.createTextNode(param.name))
  var label = document.createTextNode(param.defaultValue)
  var slider = document.createElement('input')
  slider.type = 'range'
  slider.min = min != null ? min : (param.min || 0)
  slider.max = max != null ? max : (param.max || 100)
  slider.value = param.defaultValue

  slider.style.width = '300px'

  if (step){
    slider.step = step
  }

  slider.onchange = function(){
    label.data = this.value
    param.value = parseFloat(this.value)
  }
  container.appendChild(slider)
  container.appendChild(label)
  document.body.appendChild(container)
}

function addValueSlider(node, property, step, min, max){
  var container = document.createElement('div')
  container.appendChild(document.createTextNode(property))
  var label = document.createTextNode(node[property])
  var slider = document.createElement('input')
  slider.type = 'range'
  slider.min = min
  slider.max = max
  slider.value = node[property]

  slider.style.width = '300px'

  if (step){
    slider.step = step
  }

  slider.onchange = function(){
    label.data = this.value
    node[property] = parseFloat(this.value)
  }
  container.appendChild(slider)
  container.appendChild(label)
  document.body.appendChild(container)
}

function loadSample(url, cb){
  requestArrayBuffer(url, function(err, data){  if(err)return cb&&cb(err)
    audioContext.decodeAudioData(data, function(buffer){
      cb(null, buffer)
    }, function(err){
      cb(err)
    })
  })
}

function requestArrayBuffer(url, cb){
  var request = new window.XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    cb(null, request.response)
  }
  request.onerror = cb
  request.send();
}