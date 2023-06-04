import Component from "../components/component.js";

export default class Sound extends Component {
  playing = false;
  ready;

  constructor({
    url,
    loop = false,
    autoplay = false,
    volume = 1,
    muted = false,
    ...props
  }) {
    super(Object.assign({ tagType: "audio", parent: document.body }, props));

    Object.assign(this, {
      url,
      loop,
      autoplay,
      muted,
      volume: volume != null ? volume : 1,
    });

    if (this.el) {
      this.el.setAttribute("src", url);
      this.el.setAttribute("type", "audio/mpeg");
      this.el.setAttribute("preload", "auto");

      this.el.setAttribute("loop", loop ? "loop" : undefined);
      this.el.setAttribute("autoplay", autoplay ? "autoplay" : undefined);
      this.el.setAttribute("volume", this.volume);
      this.el.volume = this.volume;

      this.el.oncanplaythrough = () => {
        this.ready = true;
      };
    }
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
    if (this.el && this.el.play) {
      this.el.pause();
    }
  }

  play() {
    if (this.el && this.el.play) {
      this.el.play();
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
    if (this.el) {
      this.el.playbackRate = value;
    }
  }
}
