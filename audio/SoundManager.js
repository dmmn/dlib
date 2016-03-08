import { Howler, Howl } from "howler";

let soundMap = new Map();

let muteLooped = /\bmutelooped\b/.test(window.location.search);

let enabled = true;
let muted = false;

export default class SoundManager {

  static add(url) {
    let split = url.split("/");
    let name = split[split.length - 1].split(".")[0];
    if (SoundManager.get(name)) {
      console.warn(`Sound ${name} is added twice`);
      return;
    }
    let sound = new Howl({
      urls: [url]
    });
    soundMap.set(name, sound);
  }

  static play(name, {loop = false, volume = 1} = {}) {
    let sound = SoundManager.get(name);
    if (!sound) {
      console.error(`Sound ${name} hasn't been added`);
      return;
    }

    sound.loop(loop);
    sound.volume(volume || sound.volume);

    if (sound.loop() && muteLooped) {
      sound.mute();
    }
    sound.play();
  }

  static stop(name) {
    let sound = SoundManager.get(name);
    if (!sound) {
      return;
    }
    sound.stop();
  }

  static get(name) {
    return soundMap.get(name);
  }

  static set muted(value) {
    if (value) {
      muted = true;
      Howler.mute();
    } else {
      if (!enabled) {
        return;
      }
      muted = false;
      Howler.unmute();
    }
  }

  static get muted() {
    return muted;
  }
}

if (/\bmute\b/.test(window.location.search)) {
  enabled = false;
  SoundManager.muted = true;
}
