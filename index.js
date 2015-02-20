module.exports = function Sample(audioContext){

  var player = audioContext.createBufferSource()

  player.playbackRate.value = 1

  var node = audioContext.createGain() 
  player.connect(node)

  node.amp = node.gain
  node.onended = null

  node.start = start
  node.stop = stop

  node.buffer = null
  node._context = audioContext
  node._player = player
  node._mode = 'hold'
  node._offset = [0, 1]
  node._transpose = 0
  node._tune = 0
  node._refreshPlaybackRate = refreshPlaybackRate
  node._started = false

  Object.defineProperties(node, properties)

  return node
}

var properties = {
  tune: {
    get: function(){
      return this._tune
    },
    set: function(value){
      this._tune = value
      this._refreshPlaybackRate()
    }
  },
  transpose: {
    get: function(){
      return this._transpose
    },
    set: function(value){
      this._transpose = value
      this._refreshPlaybackRate()
    }
  },
  offset: {
    get: function(){
      return this._offset
    }, 
    set: function(value){
      var player = this._player
      if (player.buffer && value){
        player.loopStart = player.buffer.duration * value[0]
        player.loopEnd = player.buffer.duration * value[1]
      }
      this._offset = value || [0, 1]
    }
  },
  startOffset: {
    get: function(){
      return this._offset[0]
    }, 
    set: function(value){
      this.offset = [value || 0, this.offset[1]]
    }
  },
  endOffset: {
    get: function(){
      return this._offset[1]
    }, 
    set: function(value){
      this.offset = [this.offset[0], value || 0]
    }
  },
  mode: {
    get: function(){
      return this._mode
    }, 
    set: function(value){
      var player = this._player
      this._mode = value
      player.loop = value === 'loop'
    }
  }
}

function start(at){
  var node = this
  var audioContext = node._context
  var player = node._player
  var sampleCache = audioContext.sampleCache || {}

  if (!node._started && this.buffer instanceof AudioBuffer){
    player.buffer = this.buffer
    player.loopStart = node._offset[0] * player.buffer.duration
    player.loopEnd = node._offset[1] * player.buffer.duration
    player.onended = node.onended

    if (node._mode !== 'release'){
      if (player.loop){
        player.start(at, player.loopStart, player.buffer.duration)
      } else {
        player.start(at, player.loopStart, player.loopEnd - player.loopStart)
      }
      if (node._mode == 'oneshot'){ // provide an end time
        return at + player.loopEnd - player.loopStart
      }
      node._started = true
    }
  }

}

function stop(at){
  var node = this
  var player = node._player
  if (node._started){
    player.stop(at)
    stopped = true
  } else if (this._mode == 'release'){
    player.start(at, player.loopStart, player.loopEnd - player.loopStart)
    node._started = true
    return at + player.loopEnd - player.loopStart
  }
}

function f(n){
  return parseFloat(this._transpose)||0
}

function refreshPlaybackRate(){
  this._player.playbackRate.value = multiplyTranspose(f(this._transpose) + (f(this._tune) / 100))
}

function multiplyTranspose(value){
  return Math.pow(2, value / 12)
}