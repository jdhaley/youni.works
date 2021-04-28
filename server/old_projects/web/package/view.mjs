export default {
	package$: "youni.works/web/view",
	use: {
		package$control: "youni.works/base/control"
	},
	Viewer: {
		super$: "use.control.Processor",
		viewType: "text",
		viewName: "div",
		template: "",
		get$owner: function() {
			return this.controller;
		},
		view: function(model) {
			let view = this.owner.create(this.viewName);
			if (this.template) view.innerHTML = this.template;
			view.model = this.model(model);
			this.control(view);
			return view;
		},
		control: function(view) {
			this.sys.define(view, "controller", this, "const");			
		},
		model: function(model) {
			return model;
		},
		draw: function(view) {
			let render = this.owner.render && this.owner.render[this.viewType];
			render && render.call(this, view);			
		},
		action: {
			draw: function(on, signal) {
				this.draw(on);
			}
		},
		before$initialize: function(conf) {
			this.sys.define(this, "controller", conf.owner, "const");
		}
	},
	Owner: {
		super$: "use.control.Owner",
		get$location: function() {
			return this.content.ownerDocument.defaultView.location;
		},
		virtual$title: function() {
			if (arguments.length) {
				this.content.ownerDocument.title = arguments[0];
				return;
			}
			return this.content.ownerDocument.title;
		},
		render: {
		},
		create: function(name) {
			let doc = this.content.ownerDocument;
			if (!name) return doc.createDocumentFragment();
			name = "" + name;
			let index = name.lastIndexOf("/");
			if (index >= 0) {
				return doc.createElementNS(name.substring(0, index), name.substring(index + 1));
			}
			return doc.createElement("" + name);
		},
		createStyle: function(selector, object) {
			let out = `${selector} {\n`;
			out += defineProperties("", object);
			out += "\n}";
			let index = this.styles.insertRule(out);
			return this.styles.cssRules[index];
		},
		after$initialize: function(conf) {
			createStyleSheet(this);
		}
	}
}

function createStyleSheet(owner) {
	let control = owner.create("style");
	control.type = "text/css";
	control.ownerDocument.head.appendChild(control);
	owner.styles = control.sheet;
}

function defineProperties(prefix, object) {
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
