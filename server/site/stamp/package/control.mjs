const observers = Symbol("observers");

export default {
	package$: "youni.works/base/control",
	Control: {
		receive: Control_receive
	},
	Controller: {
		super$: "Object",
		process: function(control, event) {
		}
	},
	Owner: {
		super$: "Object",
		send: function(type, source, object, name, value) {
			let event = {
				type: type,
				source: source,
				object: object,
				property: name,
				value: value
			};
			
			if (object[observers]) for (let target of object[observers]) {
				if (target && target.receive) target.receive(event);
			}
		},
		bind: function(control, model) {
			this.unbind(control);
			if (typeof model == "object") {
				if (!model[observers]) model[observers] = [];
				model[observers].push(control);
			}
			if (model !== undefined) control.model = model;
		},
		unbind: function(control) {
			if (control.model && control.model[observers]) {
				let list = control.model[observers];
				for (let i = 0, len = list.length; i < len; i++) {
					if (control == list[i]) {
						list.splice(i, 1);
						break;
					}
				}
			}
			delete control.model;
		},
	},
	ViewOwner: {
		super$: "Owner",
		ownerOf: function(document) {
			if (!document.owner) {
				document.owner = this.sys.extend(this, {
					document: document,
					classes: []
				});
			}
			return document.owner;
		},
		create: function(doc, name, attributes) {
			let baseClass = "";
			let dot = name.indexOf(".");
			switch (dot) {
				case -1:
					break;
				case 0:
					baseClass = name.substring(1);
					name = "div";
					break;
				default:
					baseClass = name.substring(dot + 1);
					name = name.substring(0, dot);
					break;
			}
			let ele = doc.createElement(name);
			this.setAttributes(ele, attributes);
			if (baseClass) ele.classList.add(baseClass);
			return ele;
		},
		setAttributes(ele, attributes) {
			if (attributes) for (let name in attributes) {
				ele.setAttribute(name, attributes[name]);
			}
		},
		append: function(parent, name, attributes) {
			let ele = this.create(parent.ownerDocument, name, attributes);
			parent.append(ele);
			return ele;
		}
	},
	Viewer: {
		super$: "Controller",
		type$owner: "ViewOwner",
		
		viewName: "div.view",
		viewAttributes: function(model, type) {
			return null;
		},
		classOf: function(ele) {
			let owner = this.owner.ownerOf(ele);
			let cls = owner.classes[this.viewName];
			if (!cls) {
				cls = this.sys.extend(null, {
					controller: this
				});
				owner.classes[this.viewName] = cls;
			}
			return cls;
		},
		createView: function(parent, model, type) {
			let owner = this.owner.ownerOf(parent);
			let view = owner.append(parent, this.viewName, this.viewAttributes(model, type));
			this.view(view, model);
			return view;
		},
		view: function(view, model) {
			view.controller = this;
			this.owner.bind(view, model);
			this.draw(view);
			this.control(view);
			view.receive = Control_receive;
			return view;
		},
		draw: function(view) {
		},
		control: function(view) {
		}
	},
	Item: {
		super$: "Viewer",
		viewName: ".item",
		draw: function(view) {
			view.header = this.drawHeader(view);
			view.body = this.drawBody(view);
			view.footer = this.drawFooter(view);
			view.style.top = "100px";
			view.style.left = "100px";
		},
		drawHeader: function(view) {
			let header = this.owner.append(view, "div.header");
			//header.contentEditable = true;
			header.innerHTML = "<br>";
			return header;
		},
		drawBody: function(view) {
			return this.owner.append(view, "div.body");
		},
		drawFooter: function(view) {
			return this.owner.append(view, "div.footer");
		}
	},
	Shape: {
		super$: "Viewer",
		viewName: "div.shape",
		uom: "mm",
		shape: function(object) {
			return object || this.sys.extend(null, {
				shape: "rectangle",
				path: "",
				width: 10,
				height: 10,
				image: "",
				data: ""
			});
		},
		size: function(view) {
			let shape = view.shape;
			let w = shape.width + this.uom;
			view.style.minWidth = w;
			view.style.maxWidth = w;
			let h = shape.height + this.uom;
			view.style.minHeight = h;
			view.style.maxHeight = h;
		},
		draw: function(view) {
			if (!view.shape) view.shape = this.shape(view.model);
			this.size(view);
			this.drawImage(view);
			this.drawData(view);
			this.drawPath(view);
		},
		drawImage: function(view) {
			let shape = view.shape;
			let w = shape.width - 2 + this.uom;
			let h = shape.height - 2 + this.uom;
			if (shape.image) this.owner.append(view, "img", {
				src: shape.image,
				style: `width:${w};height:{$h};`
			});
		},
		drawData: function(view) {
			let shape = view.shape;
			if (shape.data) {
				view.data = this.owner.append(view, "span.data");
				if (shape.image) view.data.style.webkitTextStroke = ".2mm rgba(255, 255, 255, .25)";

				view.data.innerHTML = shape.data.replace("\n", "<br>");
			}
		},
		drawPath: function(view, shape) {
//			if (shape.path) ctx.append("path", {
//				d: this.path.draw(ctx.x, ctx.y, this.width, this.height)
//			});
		}
	},
	Styles: {
		super$: "Object",
		document: null,
		once$sheet: function() {
			let styles = this.document.createElement("style");
			styles.type = "text/css";
			this.document.head.appendChild(styles);
			return styles.sheet;
		},
		createRule: function(selector, object) {
			let out = `${selector} {\n`;
			out += styleProperties("", object);
			out += "\n}";
			let index = this.styles.insertRule(out);
			return this.styles.cssRules[index];
		}
	}
}
function Control_receive(event) {
	this.controller && this.controller.process(this, event);
}

function styleProperties(prefix, object) {
	out = "";
	for (let name in object) {
		let value = object[name];
		if (typeof value == "object") {
			out += defineProperties(prefix + name + "-", value);
		} else {
			out += "\t" + prefix + name + ": " + value + ";\n"
		}
	}
	return out;
}
