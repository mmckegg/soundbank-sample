// Due to a bug in Chrome, this version isn't working
// See https://code.google.com/p/chromium/issues/detail?id=311284

var AudioVoltage = require('audio-voltage')

var transposeMap = generateTransposeMap()

module.exports = function Sample(audioContext){

  var player = audioContext.createBufferSource()

  player.playbackRate.value = 1

  var tuneVoltage = AudioVoltage(audioContext)
  tuneVoltage.gain.value = 0

  var transposeVoltage = AudioVoltage(audioContext)
  transposeVoltage.gain.value = 0

  applyTranspose(transposeVoltage, player.playbackRate)
  applyTuning(tuneVoltage, transposeVoltage)

  var url = null
  var mode = 'hold'
  var offset = [0, 1]
  var started = false


  var node = audioContext.createGain() 
  player.connect(node)

  node.amp = node.gain
  node.tune = tuneVoltage.gain
  node.transpose = transposeVoltage.gain
  node.onended = null

  node.start = function(at){
    var sampleCache = audioContext.sampleCache || {}
    var buffer = sampleCache[url]
    if (!started && buffer){
      player.buffer = buffer
      player.loopStart = offset[0] * player.buffer.duration
      player.loopEnd = offset[1] * player.buffer.duration
      player.onended = node.onended

      if (mode !== 'release'){
        if (player.loop){
          player.start(at, player.loopStart, player.buffer.duration)
        } else {
          player.start(at, player.loopStart, player.loopEnd - player.loopStart)
        }
        if (mode == 'oneshot'){ // provide an end time
          return at + player.loopEnd - player.loopStart
        }
        started = true
      }

    }
  }

  node.stop = function(at){
    if (started){
      player.stop(at)
      stopped = true
    } else if (mode == 'release'){
      player.start(at, player.loopStart, player.loopEnd - player.loopStart)
      started = true
      return at + player.loopEnd - player.loopStart
    }
  }

  Object.defineProperty(node, 'url', {
    get: function(){
      return url
    }, 
    set: function(value){
      url = value
    }
  })

  Object.defineProperty(node, 'offset', {
    get: function(){
      return offset
    }, 
    set: function(value){
      if (player.buffer && value){
        player.loopStart = player.buffer.duration * value[0]
        player.loopEnd = player.buffer.duration * value[1]
      }
      offset = value || [0, 1]
    }
  })

  Object.defineProperty(node, 'startOffset', {
    get: function(){
      return offset[0]
    }, 
    set: function(value){
      node.offset = [value || 0, node.offset[1]]
    }
  })

  Object.defineProperty(node, 'endOffset', {
    get: function(){
      return offset[1]
    }, 
    set: function(value){
      node.offset = [node.offset[0], value || 0]
    }
  })

  Object.defineProperty(node, 'mode', {
    get: function(){
      return mode
    }, 
    set: function(value){
      mode = value
      player.loop = mode === 'loop'
    }
  })

  return node
}

module.exports.prime = function(context, desc){
  if (desc.url && context.sampleCache && !context.sampleCache[desc.url] && context.loadSample){
    context.loadSample(desc.url)
  }
}

function applyTranspose(source, target){
  var audioContext = source.context

  var scale = audioContext.createGain()
  scale.gain = 1/64
  source.connect(scale)

  var shape = audioContext.createWaveShaper()
  shape.curve = transposeMap
  shape.connect(target)
}

function applyTuning(source, target){
  var audioContext = source.context
  var scale = audioContext.createGain()
  scale.gain = 1/100
  source.connect(target)
}

function generateTransposeMap(){
  var curve = new Float32Array(128)
  for (var i=0;i<64;i++){
    curve[i] = Math.pow(2, (-64 + i) / 12)
  }
  for (var i=0;i<64;i++){
    curve[i+64] = Math.pow(2, i / 12)
  }
  return curve
}

function multiplyCents(a, value){
  return multiplyTranspose(a, value / 100)
}