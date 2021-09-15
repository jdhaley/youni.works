import system from "./system.youni.works-2.1.mjs";
import base from "./base.youni.works-1.2.mjs";
const module = {
	"name": "display.youni.works",
	"version": "1.0",
	"moduleType": "library"
};
module.use = {
	system: system,
	base: base
}
module.package = {
	display: display()
}
const conf = undefined;
const main = function main_loadModule(module) {
			return module.use.system.load(module);
		};
export default main(module, conf);
function display() {
	const pkg = {
	"type$": ["/base/dom", "/base/view", "/base/util"],
	"Display": {
		"type$": ["/display/Instance", "/display/Element", "/display/View", "/display/Bounded"],
		"nodeName": "div",
		"extend$conf": {
		},
		"display": "",
		"get$style": function get$style() {
			return this.peer.style;
		},
		"get$styles": function get$styles() {
			return this.peer.classList;
		},
		"virtual$box": function virtual$box() {
			if (arguments.length) {
				let r = arguments[0];
				this.position(r.left, r.top);
				this.size(r.width, r.height);
				return;
			}
			return this.peer.getBoundingClientRect();
		},
		"size": function size(width, height) {
			this.style.width = Math.max(width, 16) + "px";
			this.style.minWidth = this.style.width;
			this.style.height = Math.max(height, 16) + "px";
			this.style.minHeight = this.style.height;
		},
		"position": function position(x, y) {
			this.style.position = "absolute";			
			this.style.left = x + "px";
			this.style.top = y + "px";
		},
		"createPart": function createPart(key, type) {
			let part = this.owner.create(type, this.conf);
			this.put(key, part);
			if (this.members) part.styles.add(key);
			return part;
		},
		"start": function start(conf) {
			if (conf) this.let("conf", conf, "extend");
			if (this.display) this.styles.add(this.display);
			this.styles.add(this.className);
		}
	}
}
return pkg;
}

