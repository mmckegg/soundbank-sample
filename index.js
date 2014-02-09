var createAudioNode = require('custom-audio-node')
var extendTransform = require('audio-param-transform')

module.exports = function(audioContext){

  var player = audioContext.createBufferSource()
  var gain = audioContext.createGain()

  extendTransform(player.playbackRate, audioContext)

  var baseRateParam = player.playbackRate.transform()
  var tuneParam = player.playbackRate.transform(multiplyCents)
  var transposeParam = player.playbackRate.transform(multiplyTranspose)

  var url = null
  var mode = 'hold'
  var startOffset = 0
  var endOffset = 1
  var started = false

  player.connect(gain)

  var node = createAudioNode(null, gain, {
    amp: {
      min: 0, defaultValue: 1,
      target: gain.gain,
    },
    tune: {
      defaultValue: 0,
      target: tuneParam
    },
    transpose: {
      defaultValue: 0,
      target: transposeParam
    },
  })

  node.onended = null

  node.start = function(at){
    var sampleCache = audioContext.sampleCache || {}
    var buffer = sampleCache[url]
    if (!started && buffer){
      player.buffer = buffer
      player.loopStart = startOffset * player.buffer.duration
      player.loopEnd = endOffset * player.buffer.duration
      player.onended = node.onended

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

  node.stop = function(at){
    if (started){
      player.stop(at)
      stopped = true
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

  Object.defineProperty(node, 'startOffset', {
    get: function(){
      return startOffset
    }, 
    set: function(value){
      if (player.buffer){
        player.loopStart = player.buffer.duration * value
      }
      startOffset = value
    }
  })

  Object.defineProperty(node, 'endOffset', {
    get: function(){
      return endOffset
    }, 
    set: function(value){
      if (player.buffer){
        player.loopEnd = player.buffer.duration * value
      }
      endOffset = value
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

function multiplyCents(a, value){
  return multiplyTranspose(a, value / 100)
}

function multiplyTranspose(a, value){
  return a * Math.pow(2, value / 12)
}