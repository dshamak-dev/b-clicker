import ScreenComponent from "../components/screen.component.js";

export default class GameScreen extends ScreenComponent {
  constructor(props) {
    super(
      Object.assign({}, props, {
        className: "landing-screen select-none",
      })
    );

    this.addStyle("background-color", 'black');
  }
}
