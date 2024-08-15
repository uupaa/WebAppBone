import { BoneApp } from "./BoneApp"
import { ClassNameString, CSSSelectorString, find_node, find_nodes, create_scoped_fragment } from "../Util/DOMUtil"
import { MessageSubscriber, MessageSelector, MessageParams } from "../Vendor/PubSub"

export const MOCK_HTML = `<div class="menu">menu</div><div class="content">content</div>`
export const MOCK_CSS  = `
:scope {
  --width: 100px;
  --menu-height: 50px;
  --content-height: 50px;
  display: grid;
  grid-template:
    "MENU"     var(--menu-height)
    "CONTENT"  var(--content-height) /
    var(--width);
}
.menu    { grid-area: MENU;    outline: solid 1px blue; color: blue; }
.content { grid-area: CONTENT; outline: solid 1px pink; color: pink; }
`

// View構築用の基底クラス, class View extends BoneView の形で使用する
//  1. AppとViewへの参照を保持する. this._app, this._view
//  2. 自身のroot_nodeへの参照を保持する. this._root_node
//  3. 自身のroot_node以下のDOM要素を検索する機能を提供する. find(), find_all()
//  4. レンダリング用メソッドの雛形を提供する. _render()
//  5. 初回レンダリングで呼ばれるメソッドの雛形を提供する. _render_init()
//  6. View構築用のメソッドの雛形を提供する. _build()
export class BoneView implements MessageSubscriber {
  //@ts-ignore
  protected _app: BoneApp
  protected _view: BoneView|null = null
  protected _root_node: HTMLElement
  protected _class_name: ClassNameString // extends したクラスのクラス名が入る。例: class TestUnit extends BaseUnit なら "TestUnit" になる
  protected _render_count: number = 0 // レンダリングした回数
  constructor(app:BoneApp, root_node:HTMLElement, parent_view:BoneView|null = null) {
    this._app = app
    this._view = parent_view
    this._root_node = root_node
    this._class_name = this.constructor.name
    this._app.msg.register(this, this.enum_messages())
  }
  get root_node() { return this._root_node }
  get content_node() { return this._root_node.firstElementChild?.nextElementSibling }
  enum_messages():Array<MessageSelector> { return [] }
  on_message(_selector:MessageSelector, _params:MessageParams = undefined) {
    //switch (selector) {
    //  case MSG_VIEW_UPDATE: await this.update()
    //}
  }
  // 管理下のCSSセレクタにマッチするDOM要素を検索する
  find(selector:CSSSelectorString):HTMLElement {
    return find_node(this._root_node, selector, this._class_name )
  }
  // 管理下のCSSセレクタにマッチするDOM要素を全て検索する
  find_all(selector:CSSSelectorString):Array<HTMLElement> {
    return find_nodes(this._root_node, selector, this._class_name )
  }
  async update() {
    if (!this._render_count) { // at first? -> create dom tree
      // <div class="class_name"><stype>@scope{ ... }</style> ... </div>
      this._root_node = this._build(this._root_node, this._class_name)
      await this._render_init()
    }
    await this._render()
    ++this._render_count
  }
  protected async _render_init() {
    // 初回レンダリング時に _render()の前に呼ばれる
    // 一度だけ実行する処理が必要ならこのメソッドをオーバーライドする
  }
  protected async _render() {
    // レンダリング内容を実装する
  }
  protected focus() {
    // 画面切り替えやTab切り替えなどでフォーカスを与えたい要素がある場合は、このメソッドをオーバーライドし設定する
  }
  protected _build(root_node:HTMLElement, cn:ClassNameString):HTMLElement {
    return create_scoped_fragment(root_node, cn, MOCK_HTML, MOCK_CSS)
  }
}
