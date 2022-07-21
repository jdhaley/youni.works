import {Viewer} from "./v3.1.dom.js";
interface $Peer extends HTMLElement {
	$viewer: Display;
}
class Display extends Viewer {
	get peer(): $Peer {
		return super.peer as $Peer;
	}
	get style(): CSSStyleDeclaration {
		return this.peer.style;
	}
	get styles() {
		return this.peer.classList;
	}
	get box() {
		return this.peer.getBoundingClientRect();
	}
	set box(r: DOMRect) {
		this.position(r.left, r.top);
		this.size(r.width, r.height);
	}
	size(width: number, height: number) {
		this.style.width = Math.max(width, 16) + "px";
		this.style.minWidth = this.style.width;
		this.style.height = Math.max(height, 16) + "px";
		this.style.minHeight = this.style.height;
	}
	position(x: number, y: number) {
		this.style.position = "absolute";			
		this.style.left = x + "px";
		this.style.top = y + "px";
	}
	getStyle(name?: string): CSSStyleDeclaration {
		return name ? this.peer.classList[name] : this.peer.style;
	}
}
