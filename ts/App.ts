import { BoneApp } from "./Bone/BoneApp"
import { BoneView } from "./Bone/BoneView"
import { create_scoped_fragment } from "./Util/DOMUtil"

export const MSG_VIEW_UPDATE = "MSG_VIEW_UPDATE"

export class App extends BoneApp {
  constructor() {
    super()
  }
  override enum_messages() { return [] }
  override async on_message(selector:string) {
    switch (selector) {
      //case MSG_APP_UPDATE: console.log(MSG_APP_UPDATE)
    }
  }
  override async init(root_node:HTMLElement) {
    this._view = new View(this, root_node)
  }
  override async run() {
    await this._view.update()
    console.log(this._view.content_node)
  }
}

export class View extends BoneView {
  constructor(app:App, root_node:HTMLElement, parent_view:BoneView|null = null) {
    super(app, root_node, parent_view)
  }
  override enum_messages() { return [ MSG_VIEW_UPDATE ] }
  override async on_message(selector:string) {
    switch (selector) {
      case MSG_VIEW_UPDATE:
        await this.update()
    }
  }
  override async _render() {
  }

  override _build(root_node:HTMLElement, cn:string):HTMLElement {
    const HTML = `
<div class="menu">Hello</div>
<div class="content">World!</div>
`
    const CSS  = `
:scope {
  --width: 100px;
  --height: 100px;
  outline: 1px solid red;
  display: grid;
  grid-template:
    "MENU"    calc(var(--height) * 0.5)
    "CONTENT" 1fr /
    var(--width);
}
.menu        { grid-area: MENU;    outline: solid 1px blue; color: blue; }
.content     { grid-area: CONTENT; outline: solid 1px blue; color: blue; }
`
    return create_scoped_fragment(root_node, cn, HTML, CSS)
  }
}
