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
	data: data(),
	display: display(),
	dom: dom(),
	views: views()
}
const conf = undefined;
const main = function main_loadModule(module) {
			return module.use.system.load(module);
		};
export default main(module, conf);
function data() {
	const pkg = {
	"DataSource": {
		"type$": "/base/data/DataSource",
		"type$textUtil": "/base/util/Text",
		"type$viewType": "/view/View",
		"once$views": function once$views() {
			let views = Object.create(null);
			for (let typeName in this.types) {
				let type = this.types[typeName];
				let members = Object.create(null);
				for (let name in type.members) {
					let conf = type.members[name];
					if (!conf.caption) {
						conf.caption = this.textUtil.captionize(name);
					}
					let view = this.owner.create(conf.viewType || this.viewType);
					this.owner.extend(view, {
						extend$conf: conf,
						dataSource: this,
					});
					members[name] = view;
				}
				views[typeName] = members;
			}
			return views;
		},
		"once$owner": function once$owner() {
			return this[Symbol.for("owner")];
		}
	}
}
return pkg;
}

function display() {
	const pkg = {
	"type$": ["/dom", "/base/view", "/base/util"],
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

function dom() {
	const pkg = {
	"type$": "/base/control",
	"Node": {
		"type$": ["/dom/Receiver", "/dom/Sender", "/dom/Sensor"],
		"peer": null,
		"once$from": function once$from() {
			let of = this.peer.parentNode.$peer;
			let from = Object.create(null);
			from[Symbol.iterator] = function*() {
				if (of) yield of;
			}
			return from;
		},
		"once$to": function once$to() {
			const nodes = this.peer.childNodes;
			let to = Object.create(null);
			to[Symbol.iterator] = function*() {
				for (let i = 0, len = nodes.length; i < len; i++) {
					let node = nodes[i];
					if (node.$peer) yield node.$peer;
				}
			}
			return to;
		},
		"at": function at(key) {
			if (typeof key == "string" && key.charAt(0) == "@") {
				return this.peer.getAttribute(key.substring(1));
			}
			for (let part of this.to) {
				if (part.key == key) return part;
			}
		},
		"put": function put(key, value) {
			if (typeof key == "string" && key.charAt(0) == "@") {
				this.peer.setAttribute(key.substring(1), value);
				return;
			}
			value.key = key;
			this.peer.append(value.peer);
		}
	},
	"Document": {
		"type$": "/dom/Node",
		"document": null,
		"type$from": "/dom/Iterable",
		"get$peer": function get$peer() {
			return this.document.body;
		},
		"get$location": function get$location() {
			return this.document.location;
		},
		"createElement": function createElement(name, namespace) {
			if (namespace) {
				return this.document.createElementNS(namespace, name);
			} else {
				return this.document.createElement(name);
			}
		},
		"createId": function createId() {
			let id = this.document.$lastId || 0;
			this.document.$lastId = ++id;
			return id;
		}
	},
	"Element": {
		"type$": "/dom/Node",
		"type$owner": "/dom/Document",
		"namespace": "",
		"once$nodeName": function once$nodeName() {
			return this.className;
		},
		"once$peer": function once$peer() {
			let peer = this.owner.createElement(this.nodeName, this.namespace);
			peer.$peer = this;
			return peer;
		},
		"once$className": function once$className() {
			return this[Symbol.toStringTag].charAt(0).toLowerCase() + this[Symbol.toStringTag].substring(1);
		},
		"virtual$markup": function virtual$markup() {
			if (arguments.length) {
				this.peer.innerHTML = arguments[0];
			} else {
				return this.peer.innerHTML;
			}
		},
		"get": function get(name) {
			return this.peer.getAttribute(name);
		},
		"set": function set(name, value) {
			this.peer.setAttribute(name, value);
		},
		"get$of": function get$of() {
			return this.peer.parentNode.$peer;
		},
		"append": function append(control) {
			this.peer.append(control.peer);
		}
	}
}
return pkg;
}

function views() {
	const pkg = {
	"type$": "/display",
	"Caption": {
		"type$": "/views/Display",
		"get$caption": function get$caption() {
			return this.conf.caption;
		},
		"view": function view(model) {
			this.markup = this.caption;
		}
	},
	"Key": {
		"type$": "/views/Display",
		"view": function view() {
			this.peer.title = this.of.key || "";
		}
	},
	"Value": {
		"type$": "/views/Display",
		"view": function view(model) {
			this.markup = model;
		}
	},
	"Pane": {
		"members": {
			"type$header": "/views/Caption",
			"type$body": "/views/Display"
		}
	},
	"Cell": {
		"type$": ["/views/Display", "/views/Pane"],
		"require$rule": "CSS-RULE",
		"members": {
			"type$header": "/views/Caption",
			"type$body": "/views/Value"
		},
		"extend$conf": {
			"cellHeader": true,
			"cellBody": true
		},
		"modelFor": function modelFor(key) {
			return this.model && this.model[this.key] || "";
		},
		"size": function size(width) {
			this.rule.style.flex = "0 0 " + width + "px",
			this.rule.style.minWidth = width + "px";
		},
		"start": function start(conf) {
			this.super(start, conf);
			conf = this.conf;
			let members = this.members;
			this.let("members", Object.create(null));
			if (conf.cellHeader) {
				this.members.header = members.header;
			}
			if (conf.cellBody) {
				let editors = this.owner.editors;
				let editor = editors[conf.inputType || conf.dataType] || editors.string
				this.members.body = editor;
			}
		}
	},
	"Record": {
		"type$": "/views/Display",
		"display": "h",
		"start": function start(conf) {
			this.super(start, conf);
			if (!this.members && conf.record) {
				this.let("members", conf.record);
			}
		}
	},
	"Row": {
		"type$": ["/views/Display", "/views/Pane"],
		"display": "h",
		"members": {
			"type$header": "/views/Display",
			"type$body": "/views/Record"
		}
	},
	"Collection": {
		"type$": "/views/Display",
		"display": "v",
		"contentType": {
			"type$": "/views/Row",
			"members": {
				"type$header": "/views/Key",
				"type$body": "/views/Record"
			},
			"extend$conf": {
				"cellHeader": false
			}
		}
	},
	"Table": {
		"type$": ["/views/Display", "/views/Pane"],
		"display": "v",
		"members": {
			"header": {
				"type$": "/views/Row",
				"extend$conf": {
					"cellBody": false
				}
			},
			"body": {
				"type$": "/views/Collection"
			},
			"footer": {
				"type$": "/views/Row",
				"extend$conf": {
					"cellHeader": false,
					"cellBody": false
				}
			}
		},
		"view": function view(model) {
			if (model === undefined && this.conf.dataSource) {
				model = this.conf.dataSource.data[this.conf.data.set];
			}
			this.super(view, model);
		},
		"start": function start(conf) {
			this.super(start, conf);
			if (!this.conf.dataSource && this.conf.data) {
				this.conf.dataSource = this.owner.app.data[this.conf.data.source];
				this.processRecord(this.conf.dataSource.views[this.conf.data.view]);
			}
		},
		"processRecord": function processRecord(record) {
			let owner = this.owner;
			let tableId = "I" + owner.createId();
			for (let name in record) {
				let member = record[name];
				member.rule = createRule(name, member.conf);
			}
			this.peer.id = tableId;
			this.conf.record = record;

			function createRule(name, conf) {
				let width = conf.columnSize * 1 || 4;
				return owner.createStyle(`#${tableId} .${name}`, {
					"flex": (conf.flex === false ? "0 0 " : "1 1 ") + width + "cm",
					"min-width": width / 4 + "cm"
				});
			}	
		}
	}
}
return pkg;
}

