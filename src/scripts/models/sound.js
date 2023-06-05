export default class Sound {
  playing = false;
  ready;
  player;

  constructor({
    url,
    loop = false,
    autoplay = false,
    volume = 1,
    muted = false,
    ...props
  }) {
    Object.assign(this, {
      url,
      loop,
      autoplay,
      muted,
      volume: volume != null ? volume : 1,
    });

    this.setup();
  }

  setup() {
    const { url, loop, autoplay, volume } = this;

    const player = (this.player = new Audio(url));

    player.preload = "auto";
    player.loop = loop;
    player.autoplay = autoplay;
    player.volume = volume;

    player.oncanplaythrough = () => {
      setTimeout(() => (this.ready = true), 0);
    };
  }

  json() {
    const { ready, url, autoplay, muted, loop } = this;

    if (!ready) {
      return null;
    }

    return { url, autoplay, muted, loop };
  }

  togglePlay() {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  pause() {
    const { player } = this;

    if (player && player.pause) {
      player.pause();
    }
  }

  play() {
    const { player } = this;

    if (player && player.play) {
      player.play();
    }
  }

  toggleSound() {
    this.muted = !this.muted;

    if (this.muted) {
      this.pause();
    } else {
      this.play();
    }
  }

  setSpeed(value) {
    const { player } = this;

    if (player && player.pause) {
      player.playbackRate = value;
    }
  }
}
