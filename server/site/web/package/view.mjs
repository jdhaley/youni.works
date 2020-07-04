export default {
	package$: "youni.works/web/view",
	use: {
		package$control: "youni.works/base/control"
	},
	Viewer: {
		super$: "use.control.Processor",
		viewType: "text",
		viewName: "div",
		get$owner: function() {
			return this.controller;
		},
		view: function(model) {
			let view = this.owner.view(this.viewName);
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
	Frame: {
		super$: "use.control.Owner",
		render: {
		},
		once$window: function() {
			return this.content.ownerDocument.defaultView;
		},
		virtual$selection: function() {
			let selection = this.window.getSelection();
			if (arguments.length) {
					selection.removeAllRanges();
					selection.addRange(arguments[0]);
					return;
			}
			if (selection && selection.rangeCount) {
				return selection.getRangeAt(0);
			} else {
				let range = this.window.document.createRange();
				range.collapse();
				return range;
			}
		},
		view: function(name) {
			let doc = this.content.ownerDocument;
			return arguments.length ? doc.createElement("" + name) : doc.createDocumentFragment();
		},
		control: function(view) {
			let viewer = this.part[view.nodeName.toLowerCase()];
			viewer && viewer.control(view);
		},
		initialize: function(conf) {
			conf.document.owner = this;
			this.sys.define(this, "content", conf.document.body);
			this.sys.implement(this.window.Element.prototype, conf.platform.view);
			this.sys.implement(this.window.Range.prototype, conf.platform.range);
			createStyleSheet(this);
			this.super("initialize", conf);
		}
	},
}

function createStyleSheet(owner) {
	let ele = owner.window.document.createElement("style");
	ele.type = "text/css";
	owner.window.document.head.appendChild(ele);
	owner.sheet = ele.sheet;
}

function defineRule(viewer) {
	let out = `[data-view=I${viewer.id}] {`;
	for (let name in viewer.style) {
		out += name + ":" + viewer.style[name] + ";"
	}
	out += "}";
	let index = viewer.owner.sheet.insertRule(out);
	viewer.style = viewer.owner.sheet.cssRules[index];
}
