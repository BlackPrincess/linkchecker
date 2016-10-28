class LinkError {
  constructor(message) {
    this.message = message
  }
  
  createNgElement() {
    const ng = document.createElement("span")
    ng.className = "link-checker-ng"
    ng.innerText = this.message
    return ng;
  }
}

class Checker {
  addNgElement(target, error) {
    const ng = error.createNgElement()
    target.appendChild(ng)
  }
  
  check(list) {
    // TODO: Refactoring
    if(list.length === 0) return;
    const [a, ...xs] = list
    const href = a.getAttribute("href")
    
    if(href.startsWith("javascript:")) {
      this.check(xs)
      return
    }
    
    if(href === "") {
      this.addNgElement(a, new LinkError("href=''"))
      this.check(xs)
      return
    }
    if(href === "#") {
      this.addNgElement(a, new LinkError("href='#'"))
      this.check(xs)
      return
    }

    fetch(href).then((res) => {
      if(res.body === null) {
        this.addNgElement(a, new LinkError("unchecked"))
        return res
      }
      if(!res.ok) {
        this.addNgElement(a, new LinkError(res.status))
        return res
      }
      return res
    }).then((res) => {
      this.check(xs)
      return res
    })
  }
  
  clear() {
    document.querySelectorAll(".link-checker-ng").forEach((a) => a.remove())
  }
}



chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
  if (request == "check") {
    const checker = new Checker()
    checker.clear()
    checker.check(Array.from(document.querySelectorAll("a")))
  }
}); 
