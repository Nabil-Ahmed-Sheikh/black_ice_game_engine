# Audio

`src/audio/` — Web Audio API facade with master / music / SFX volume buses.

## Browser Requirement

The `AudioContext` can only be started from a user-gesture handler. Call
`engine.audio.resume()` in a click or keydown listener:

```js
document.addEventListener('click', () => engine.audio.resume(), { once: true });
```

## AudioManager API

```js
const audio = engine.audio;

// Loading
await audio.loadClip('jump', '/sounds/jump.wav');  // fetch + decode
audio.unloadClip('jump');
audio.getClip('jump');  // → AudioClip | undefined

// Playback
const id = audio.play('jump', {
  loop: false,
  volume: 0.8,      // [0..1] — relative to the SFX bus
  pitch: 1.0,       // playback rate multiplier
  music: false,     // true → routes through music bus instead of SFX bus
  onEnd: () => {},  // callback when clip finishes
});

audio.stop(id);
audio.stopAll();

// Volume control
audio.setMasterVolume(0.9);
audio.setMusicVolume(0.6);
audio.setSfxVolume(1.0);

// Cleanup
await audio.destroy();
```

## AudioClip

Returned by `loadClip`. Read-only:

```js
clip.buffer    // AudioBuffer
clip.duration  // number (seconds)
```
