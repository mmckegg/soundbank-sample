soundbank-sample
===

Sample player AudioNode source extended with automatable transpose, tuning and amp.

Intended for use as a source in [soundbank](https://github.com/mmckegg/soundbank), but it is compatiable with any old Web Audio API AudioNode set up.

## Install

```bash
$ npm install soundbank-sample
```

## API

```js
var Sample = require('soundbank-sample')
```

### Sample(audioContext)

Returns a source AudioNode.

**AudioParams**: transpose, tune, amp

### source.mode (get/set)

Set the trigger mode of the audio node: 'hold', 'oneshot', 'loop'

'oneshot' is the same as hold, except the `node.start()` method returns the time the `node.stop()` should be called.

### source.url (get/set)

Choose the audio buffer source. The url must match a key in the passed in `audioContext.sampleCache`.

### source.startOffset (get/set)

Choose the fraction of duration (between `0` and `1`) to use as audio in point. 

### source.endOffset (get/set)

Choose the fraction of duration (between `0` and `1`) to use as audio out or loop point. 

### source.offset (get/set)

Specify the `startOffset` and `endOffset` as an array `[start, end]`.

### source.start(at)

Schedule note start. Can only be called once. For each event, create a new instance of sample player.

### source.stop(at)

Schedule note stop.

## Standalone Example

```js
var Sample = require('soundbank-sample')

var audioContext = new webkitAudioContext()
audioContext.sampleCache = {} // see test.js for full details
loadSample('/sounds/hiss.wav', function(err, buffer){
  audioContext.sampleCache['hiss.wav'] = buffer
})

var sample = Sample(audioContext)

sample.url = 'hiss.wav'
sample.mode = 'oneshot'

sample.startOffset = 0.2
sample.tune.value = 35 // cents
sample.transpose.value = -3 // semitones

// trigger start and end (oneshot will suggest an end time as return value)
var endTime = sample.start(0)
sample.stop(endTime || audioContext.currentTime + 1)
```
