soundbank-sample
===

Sample player AudioNode source extended with automatable transpose, tuning and amp.

Intended for use as a source in [soundbank](https://github.com/mmckegg/soundbank), but it is compatible with any Web Audio API AudioNode set up.

## Deprecated

Use [audio-slot/sources/sample](https://github.com/mmckegg/audio-slot) instead.

## Stability

Deprecated: Expect no more changes. Avoid using this module.

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

**AudioParams**: amp

### source.transpose (get/set)

Due to a bug in Chrome, this is not currently an AudioParam, but will be in the future.
See https://code.google.com/p/chromium/issues/detail?id=311284

### source.tune (get/set)

Due to a bug in Chrome, this is not currently an AudioParam, but will be in the future.

### source.mode (get/set)

Set the trigger mode of the audio node: 'hold', 'oneshot', 'loop'

'oneshot' is the same as hold, except the `node.start()` method returns the time the `node.stop()` should be called.

### source.buffer (get/set)

Specify an instance of [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) for playback.

### source.startOffset (get/set)

Choose the fraction of duration (between `0` and `1`) to use as audio in point.

### source.endOffset (get/set)

Choose the fraction of duration (between `0` and `1`) to use as audio out or loop point.

### source.offset (get/set)

Specify the `startOffset` and `endOffset` as an array `[start, end]`.

### source.start(at)

Schedule note start. Can only be called once. For each event, you need to create a new instance.

### source.stop(at)

Schedule note stop.

## Example

```js
var Sample = require('soundbank-sample')

var audioContext = new AudioContext()
audioContext.sampleCache = {} // see example.js for full details
loadSample('/sounds/hiss.wav', function(err, buffer){
  audioContext.sampleCache['hiss.wav'] = buffer
})

var sample = Sample(audioContext)

sample.url = 'hiss.wav'
sample.mode = 'oneshot'

sample.startOffset = 0.2
sample.tune = 35 // cents
sample.transpose = -3 // semitones

// trigger start and end (oneshot will suggest an end time as return value)
var endTime = sample.start(0)
sample.stop(endTime || audioContext.currentTime + 1)
```

To run the example clone the repo and `npm install && npm run example` then navigate to [http://localhost:9966/](http://localhost:9966/).
