export default {
	package$: "youni.works/web/view",
	use: {
		package$control: "youni.works/base/control"
	},
	Viewer: {
		super$: "use.control.Processor",
		type$owner: "Frame",
		get$controller: function() {
			return this.owner;
		},
		viewName: "div",
		viewType: "text",
		view: function(model) {
			let view = this.owner.view(this.viewName);
			this.control(view, model);
			return view;
		},
		control: function(view, model) {
			this.sys.define(view, "controller", this, "const");
			view.model = model;
		},
		action: {
			draw: function(on, signal) {
				let render = this.owner.render;
				render = render && render[this.viewType];
				render && render.call(this, on);
			}
		},
		before$initialize: function(conf) {
			this.sys.define(this, "owner", conf.owner, "const");
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
			let viewer = this.part[view.nodeName.toLowerCase()] || this.part["view"];
			viewer.control(view);
		},
		before$initialize: function(conf) {
			conf.document.owner = this;
			this.sys.define(this, "content", conf.document.body);
			this.sys.implement(this.window.Element.prototype, conf.platform.view);
			this.sys.implement(this.window.Range.prototype, conf.platform.range);
			this.device = this.sys.extend(null, conf.platform.devices);
			createStyleSheet(this);
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
/*
ViewControl: {
	super$: "use.control.Control",
	get$of: function() {
		return this.view.parentNode && this.view.parentNode.control;
	},
	get$owner: function() {
		return this.view.ownerDocument.owner;
	},
	type$view: "View",
	"@iterator": function* iterate() {
		let length = this.view.children.length;
		for (let i = 0; i < length; i++) yield this.view.children[i].control;
	},
	sense: function(sensorType, signal) {
		this.owner.sensor[sensorType](this, signal);
	}
},
*/
