import { BoneView } from "./BoneView"
import { MessageSubscriber, MessagePassing, MessageSelector } from "../Vendor/PubSub"

// App構築用の基底クラス
export class BoneApp implements MessageSubscriber {
  protected _msg: MessagePassing
  protected _view!: BoneView

  constructor() {
    this._msg = new MessagePassing()
    this._msg.register(this, this.enum_messages())
  }
  get msg()  { return this._msg }
  get view() { return this._view }
  enum_messages():Array<MessageSelector> { return [] }
  on_message(selector:string, _params:any = null) {
    switch (selector) {
    }
  }
  protected async init(_root_node:HTMLElement) {
  //this._view = new BoneView(this, _root_node)
  }
  protected async run() { }
}
