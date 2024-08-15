export type MessageSelector = string
export type MessageParams   = string | number | object | Array<number> | Array<string> | undefined

// メッセージを受診しようとするインスタンス(MessageSubscriber)に必要なI/Fの定義
// MessageSubscriber はメッセージを受診用のメソッド onmessage() を実装する必要がある
export interface MessageSubscriber {
  enum_messages():Array<MessageSelector> // List of message
  on_message(selector:MessageSelector, params:any):any|void // Message Handler/Router
}

// メッセージを受診するインスタンスの管理
export class MessagePassing {
  private _subscribers:Set<MessageSubscriber> = new Set() // メッセージを受診するインスタンス
  private _selectors:Map<MessageSubscriber, Array<MessageSelector>> = new Map() // インスタンスが受診するメッセージの対応表
  
  // メッセージの受診者を指定して、Messageインスタンスを作成する
  // 引数を指定しないと broadcast になる
  to(...subscribers:Array<MessageSubscriber>):Message {
    const to = new Set(subscribers.length ? subscribers.concat() // broadcast
                                          : this._subscribers.keys()) // unicast, multicast
    return new Message(this._selectors, to)
  }

  // メッセージを受診するインスタンスを登録する
  //
  //  以下の形で使用する
  //    1. msg.register(インスタンス, ["ping"])
  register(subscriber:MessageSubscriber, selectors:Array<MessageSelector>):MessagePassing {
    if (!subscriber) {
      throw new TypeError(`Invalid subscriber: ${subscriber}`)
    }
    if (!Array.isArray(selectors)) {
      throw new TypeError(`Invalid selectors: ${selectors}`)
    }
    if (typeof subscriber.on_message !== "function") {
      throw new TypeError(`${subscriber.constructor.name} has not onmessage function`)
    }
    if (selectors.filter(selector => !selector).length) {
      throw new TypeError(`Invalid selectors: selectors has null, from ${subscriber.constructor.name}`)
    }
    this._subscribers.add(subscriber)
    this._selectors.set(subscriber, selectors.slice()) // shallow copy
    return this
  }

  // メッセージを受診するインスタンスを削除する
  unregister(subscriber:MessageSubscriber):MessagePassing {
    this._subscribers.delete(subscriber)
    this._selectors.delete(subscriber)
    return this
  }

  // メッセージを受診するインスタンスを全て削除する
  unregisterAll():MessagePassing {
    this._subscribers.clear()
    this._selectors.clear()
    return this
  }
}

// メッセージの送信と各インスタンスのonmessage()メソッドの呼び出し
export class Message {
  private _selectors:Map<MessageSubscriber, Array<MessageSelector>>
  private _to:Set<MessageSubscriber> // unique array

  constructor(selectors:Map<MessageSubscriber, Array<MessageSelector>>, to:Set<MessageSubscriber>) {
    this._selectors = selectors
    this._to = to
  }

  // [DEPRECATED] use not()
  remove(subscriber:MessageSubscriber):Message {
    this._to.delete(subscriber)
    return this
  }

  not(subscriber:MessageSubscriber):Message {
    this._to.delete(subscriber)
    return this
  }

  // メッセージを同期送信し結果を受け取る。受け取ったメッセージが格納されたMessageResultクラスのインスタンスを返す
  //
  //  以下の形で使用する
  //    1. BROADCAST
  //        - const result = msg.to().send(MESSAGE, PARAMS)
  //    2. MULTICAST
  //        - const result = msg.to().not(インスタンス).send(MESSAGE, PARAMS)
  //        - const result = msg.to(インスタンス, ...).send(MESSAGE, PARAMS)
  //    3. UNICAST
  //        - const result = msg.to(インスタンス).send(MESSAGE, PARAMS)
  send(selector:MessageSelector, params:MessageParams = undefined):MessageResult {
    const to = Array.from(this._to.values())
    const result = new MessageResult()

    try {
      for (let i = 0, iz = to.length; i < iz; ++i) {
        const subscriber:MessageSubscriber = to[i]

        if (subscriber) {
          const selectors = this._selectors.get(subscriber) // [ "ping", ... ]

          if (selectors && selectors.includes(selector) ) {
            const r:any = subscriber.on_message(selector, params)
            result.set(subscriber, r)
          } else {
            //console.warn(`Selector (${selector}) not allowed by the subscriber (${subscriber.constructor.name}) have been ignored.`);
          }
        }
      }
    } catch (err) {
      console.error(err)
    }
    return result
  }

  // メッセージを非同期送信する。結果は受け取らない
  //
  //  以下の形で使用する
  //    1. BROADCAST
  //        - msg.to().post(MESSAGE, PARAMS)
  //    2. MULTICAST
  //        - msg.to().not(インスタンス).post(MESSAGE, PARAMS)
  //        - msg.to(インスタンス, ...).post(MESSAGE, PARAMS)
  //    3. UNICAST
  //        - msg.to(インスタンス).post(MESSAGE, PARAMS)
  post(selector:MessageSelector, params:MessageParams = undefined):void {
    const to = Array.from(this._to.values())

    try {
      setTimeout(() => {
        for (let i = 0, iz = to.length; i < iz; ++i) {
          const subscriber:MessageSubscriber = to[i]

          if (subscriber) {
            const selectors = this._selectors.get(subscriber) // [ "ping", ... ]

            if (selectors && selectors.includes(selector) ) {
              subscriber.on_message(selector, params)
            } else {
              //console.warn(`Selector (${selector}) not allowed by the subscriber (${subscriber.constructor.name}) have been ignored.`);
            }
          }
        }
      }, 0)
    } catch (err) {
      console.error(err)
    }
  }
}

// msg.to().send() の戻り値を保持するクラス
export class MessageResult {
  private _result:Map<MessageSubscriber, any> = new Map()

  set(subscriber:MessageSubscriber, value:any):void {
    this._result.set(subscriber, value)
  }
  get(subscriber:MessageSubscriber):any {
    return this._result.get(subscriber)
  }
  has(subscriber:MessageSubscriber):any {
    return this._result.has(subscriber)
  }
  list():Array<any> {
    return Array.from(this._result.values())
  }
}

/* TEST CODE
const ERR  = "\u001b[31m"; // RED
const WARN = "\u001b[33m"; // YELLOW
const INFO = "\u001b[32m"; // GREEN
const CLR  = "\u001b[0m";  // WHITE

const { MessagePassing } = require("../lib/PubSub.cjs.js");

class Sub1 {
  constructor(msg) {
    msg.register(this, ["Hello"]);
  }
  onmessage(selector, params) {
    switch (selector) {
      case "Hello": return "World";
    }

  }
}
class Sub2 {
  constructor(msg) {
    msg.register(this, ["Happy"]);
  }
  onmessage(selector, params) {
    switch (selector) {
      case "Happy": return "Halloween";
    }
  }
}

const msg = new MessagePassing();
const sub1 = new Sub1(msg);
const sub2 = new Sub2(msg);

// post is no result
msg.to(sub1, sub2).post("Hello"); // multicast
msg.to().remove(sub1).post("Happy", [1, 2, 3]); // broadcast(exclude sub1)

// send with result
const result1 = msg.to(sub1, sub2).send("Hello"); // multicas
const result2 = msg.to().remove(sub1).send("Happy", [1, 2, 3]); // broadcast(exclude sub1))

if (result1.get(sub1) === "World" &&
    result1.get(sub2) === undefined &&
    result2.get(sub1) === undefined &&
    result2.get(sub2) === "Halloween" &&
    result2.list(sub2).join("") === ["Halloween"].join("") ) {
  console.log(INFO + "OK" + CLR);
} else {
  console.log(ERR + "NG" + CLR);
}
 */