import { DOMComponent } from "./DOMComponent";

let loadingIcon:LoadingIcon|null = null;

class LoadingIcon {
  private _icon: HTMLDivElement;
  private _container: HTMLElement|null = null;
  constructor() {
    this._icon = _createDOMComponent(this.constructor.name).containerNode;
  }
  private _attachNode(container:HTMLElement) {
    this._container = container;
    this._container.appendChild(this._icon);
  }
  /*
  setX(x) {
    const sx = window.pageXOffset;
    const ww = window.innerWidth / 2;
    this._icon.style.left = `${ww + sx}px`;
  }
   */
  show(container:HTMLElement) {
    this._attachNode(container);
    this._icon.style.display = "block";
  }
  hide() {
    this._icon.style.display = "none";
  }
}

export function showLoadingIcon(container:HTMLElement) {
  if (!loadingIcon) {
    loadingIcon = new LoadingIcon();
  }
  loadingIcon.show(container);
}

/*
function showLoadingIconWithPosition(container, x) {
  if (!loadingIcon) {
    loadingIcon = new LoadingIcon();
  }
  loadingIcon.setX(x);
  loadingIcon.show(container);
}
 */

export function hideLoadingIcon() {
  if (loadingIcon) {
    loadingIcon.hide();
  }
}

function _createDOMComponent(className:string):DOMComponent {
  const cn = className;

  // loading spinner: http://tobiasahlin.com/spinkit/
  const HTML = `
<div class="spinner">
  <div class="bounce1"></div>
  <div class="bounce2"></div>
  <div class="bounce3"></div>
</div>
`;

  const CSS = `
.${cn} {
  position: absolute;
  z-index: 1000;
  display: none;
  top: 50.5%;
  left: 46%;
  -webkit-user-select: none;
  user-select: none;

}
.${cn} .spinner {
  margin: 0 auto;
  width: 70px;
  height: 20px;
  text-align: center;
}
.${cn} .spinner > div {
  width: 18px;
  height: 18px;
  /*
  background-color: rgba(135, 206, 235, 0.65);
  box-shadow: 0 0px 3px 4px rgba(135,206,235,0.4);
   */
  background-color: rgba(206, 135, 235, 0.65);
  box-shadow: 0 0px 3px 4px rgba(206,135,235,0.4);

  border-radius: 100%;
  display: inline-block;
  -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  animation: sk-bouncedelay 1.4s infinite ease-in-out both;
}
.${cn} .spinner .bounce1 {
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}
.${cn} .spinner .bounce2 {
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}
@-webkit-keyframes sk-bouncedelay {
  0%, 80%, 100% { -webkit-transform: scale(0) }
  40% { -webkit-transform: scale(1.0) }
}
@keyframes sk-bouncedelay {
  0%, 80%, 100% { 
    -webkit-transform: scale(0);
    transform: scale(0);
  } 40% { 
    -webkit-transform: scale(1.0);
    transform: scale(1.0);
  }
}`;

  return new DOMComponent(cn, HTML, CSS);
}
