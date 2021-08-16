import system from "./system.youni.works-2.1.mjs";
import base from "./base.youni.works-1.2.mjs";
const module = {
	"name": "dom.youni.works",
	"version": "1.0",
	"moduleType": "library"
};
module.use = {
	system: system,
	base: base
}
module.package = {
	dom: dom()
}
const conf = undefined;
const main = function main_loadModule(module) {
			return module.use.system.load(module);
		};
export default main(module, conf);
function dom() {
	const pkg = {
	"type$": "/base/control",
	"Document": {
		"type$": "/dom/Component",
		"document": null,
		"get$peer": function get$peer() {
			return this.document.body;
		},
		"get$location": function get$location() {
			return this.document.location;
		},
		"createNode": function createNode(name) {
			if (name.indexOf("/") >= 0) {
				let idx = name.lastIndexOf("/");
				return this.document.createElementNS(name.substring(0, idx), name.substring(idx + 1));
			} else {
				return this.document.createElement(name);
			}
		},
		"createId": function createId() {
			let id = this.document.$lastId || 0;
			this.document.$lastId = ++id;
			return id;
		},
		"link": function link(attrs) {
			let node = this.createNode("link");
			for (let attr in attrs) {
				node.setAttribute(attr, attrs[attr]);
			}
			this.document.head.append(node);
			return node;
		}
	},
	"Element": {
		"type$": "/dom/Control",
		"type$owner": "/dom/Document",
		"namespace": "",
		"get": function get(name) {
			return this.peer.getAttribute(name);
		},
		"set": function set(name, value) {
			this.peer.setAttribute(name, value);
		},
		"once$nodeName": function once$nodeName() {
			return this.className;
		},
		"once$className": function once$className() {
			return this[Symbol.toStringTag].charAt(0).toLowerCase() + this[Symbol.toStringTag].substring(1);
		},
		"get$to": function get$to() {
			const nodes = this.peer.childNodes;
			if (!nodes.$to) nodes.$to = this[Symbol.for("owner")].create({
				symbol$iterator: function*() {
					for (let i = 0, len = nodes.length; i < len; i++) {
						let node = nodes[i];
						if (node.$peer) yield node.$peer;
					}
				}
			});
			return nodes.$to;
		},
		"get$of": function get$of() {
			return this.peer.parentNode.$peer;
		},
		"once$from": function once$from() {
			let from = this.peer.parentNode.$peer;
			return this[Symbol.for("owner")].create({
				symbol$iterator: function*() {
					if (from) yield from;
				}
			});
		},
		"once$peer": function once$peer() {
			let name = (this.namespace ? this.namespace + "/" : "") + this.nodeName;
			let peer = this.owner.createNode(name);
			peer.$peer = this;
			if (typeof this.at == "object") {
				for (let name in this.at) {
					peer.setAttribute(name, this.at[name]);
				}
			}
			return peer;
		},
		"append": function append(control) {
			this.peer.append(control.peer);
		}
	}
}
return pkg;
}

