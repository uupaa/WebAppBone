export type ClassNameString = string // class TestUnit extends BaseUnit -> "TestUnit"
export type CSSSelectorString = string
export type HTMLSourceCodeString = string // '<div class="TestUnit"></div>'
export type StyleSheetSourceCodeString = string // ".TestUnit { color: red }"

// HTML文字列とCSS文字列から
// <div class="class_name"><style>@scope{ CSS }</style> HTML </div>
// な DocumentFragment を生成し placeholder と入れ替える
export const create_scoped_fragment = (placeholder:HTMLElement,                         // <div>placeholder</div>
                                       class_name:ClassNameString,                      // "TestUnit"
                                       html:HTMLSourceCodeString,                       // '<div class="TestUnit"></div>'
                                       css:StyleSheetSourceCodeString):HTMLElement => { // ".TestUnit { color: red }"
  if (!placeholder || !placeholder.parentNode) { throw new TypeError(`Invalid placeholder`) }
  // BEFORE:
  //  <div>placeholder</div>
  //
  // AFTER:
  //  <div class="class_name">
  //    <style>
  //      @scope {
  //        CSS
  //      }
  //    </style>
  //    HTML
  //  </div>
  const new_node = document.createElement("div")
  new_node.className = class_name
  new_node.insertAdjacentHTML("beforeend", `<style>@scope{${css}}</style>${html}`)

  placeholder.parentNode.replaceChild(new_node, placeholder) // swap node
  return new_node
}

// CSSセレクタに一致する要素をroot_node以下から "root_node selector" で検索する
// class_name が指定されている場合は, "root_node .class_name selector" で検索する
export const find_node = (root_node:HTMLElement, selector:CSSSelectorString, class_name:ClassNameString = ""):HTMLElement => {
  const query = class_name ? `.${class_name} ${selector}` : selector
  const r:HTMLElement|null = root_node.querySelector(query)
  if (r) { return r }
  throw new Error(`${query} is not found`)
}

// CSSセレクタに一致する要素をroot_node以下から "root_node selector" で全て検索する
// class_name が指定されている場合は, "root_node .class_name selector" で全て検索する
export const find_nodes = (root_node:HTMLElement, selector:CSSSelectorString, class_name:ClassNameString = ""):Array<HTMLElement> => {
  const query = class_name ? `.${class_name} ${selector}` : selector
  const r:NodeListOf<HTMLElement>|null = root_node.querySelectorAll(query)
  if (r) { return Array.from(r) }
  throw new Error(`${query} is not found`)
}