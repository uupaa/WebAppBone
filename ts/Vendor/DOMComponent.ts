export class CSSComponent {
  private _className: string;
  private _styleNode: any;
  constructor(className:string, // @arg CSSClassNameString - "foo", "foo-bar"
              source:string) {  // @arg StyleSheetSourceCodeString - ".foo-bar { color: red }"
    this._className = className;

    {
      // before remove it.
      const styleNode = document.head.querySelector("." + this._className);
      if (styleNode) {
        styleNode.remove();
      }
    }
    document.head.insertAdjacentHTML("beforeend",
      `<style class="${this._className}">${source}</style>`);
    this._styleNode = document.head.querySelector("." + this._className);
    // styleNode has parent
  }
  get styleNode() { // @ret HTMLStyleElement - <style class="className">...</style>
    return this._styleNode;
  }
}

export class HTMLComponent {
  //@ts-ignore
  private _className: string;
  private _containerNode: HTMLDivElement;
  constructor(className:string, // @arg CSSClassNameString - "foo", "foo-bar"
              source:string) {  // @arg HTMLSourceCodeString - '<div class="foo-bar"></div>'
    this._className = className;
    this._containerNode = document.createElement("div");
    this._containerNode.className = className;
    this._containerNode.insertAdjacentHTML("beforeend", source);
    // containerNode has not parent.
  }
  get containerNode():HTMLDivElement { // @ret HTMLDivElement - container div node. <div class="className">...</div>
    return this._containerNode;
  }
}

export class DOMComponent {
  private _css: CSSComponent;
  private _html: HTMLComponent;
  constructor(className:string, // @arg CSSClassNameString - "foo", "foo-bar"
              html:string,      // @arg HTMLSourceCodeString - '<div class="foo-bar"></div>'
              css:string) {     // @arg StyleSheetSourceCodeString - ".foo-bar { color: red }"
    this._css = new CSSComponent(className, css);
    this._html = new HTMLComponent(className, html);
  }
  get styleNode() {
    return this._css.styleNode;
  }
  get containerNode() {
    return this._html.containerNode;
  }
}
