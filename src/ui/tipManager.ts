class TipManager {
	private id: string;
	private element: HTMLDivElement = null;
	
	constructor(id: string) {
		this.id = id;
	}
	
	private isElementCreated() {
		return this.element !== null;
	}
	
	private getElement() {
		if (this.isElementCreated()) {
			return this.element;
		} else {
			var el = document.createElement("div");
			el.id = this.id;
			document.body.appendChild(el);
			el.addEventListener("click", (ev) => this.hide());
			return this.element = el;
		}
	}
	
	show(text: string, nearRect: ClientRect) {
		var tip = this.getElement();
		tip.innerHTML = text;
		tip.style.display = "inline-block";
		tip.style.top = (nearRect.top + window.pageYOffset).toString() + "px";
		tip.style.left = (nearRect.right + window.pageXOffset + 10).toString() + "px";
	}
	
	hide() {
		if (this.isElementCreated()) {
			this.element.style.display = "none";
		}
	}
}

export = TipManager