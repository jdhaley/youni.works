export default {
	package$: "youniworks.com/ui",
	package$component: "youniworks.com/component",
	Frame: {
		super$: "component.Owner",
		before$initialize: function(conf) {
			this.initializePlatform(conf);
		},
		activate: function() {
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
		createView: function(name) {
			return this.window.document.createElement(name);
		},
		initializePlatform: function(conf) {
			let document = this.window.document;
			document.owner = this;
			let ele = document.createElement("style");
			ele.type = "text/css";
			document.head.appendChild(ele);
			this.$style = ele.sheet;
			this.sys.implement(window.Range.prototype, conf.platform.range);
			this.sys.implement(window.Element.prototype, conf.platform.element);
			this.device = this.sys.extend(null, conf.platform.devices);
		},
		extend$sense: {
			selection: function(target, action) {
				let owner = target.controller.owner;
				target.addEventListener(action.toLowerCase(), event => {
					event[Symbol.Message] = "Event";
					event.range = owner.selection;
					if (!owner.propagate.up(event.range.commonAncestorContainer, action, event)) {
						event.preventDefault();
					}
				});
			}
		}
	},
	Viewer: {
		super$: "component.Controller",
		after$initialize: function(conf) {
			this.owner.controller["I" + this.id] = this;
			if (this.style) addStyle(this, conf);
		},
		createView: function(model) {
			let view = this.owner.createView(this.controlName || "div");
			view.model = model;
			this.control(view);
			return view;
		},
		control: function(control) {
			if (control.controller == this) return;
			control.controller = this;
			if (this.name) control.dataset.view = "I" + this.id;
			if (this.classes) control.className = this.classes;
		},
		draw: function(view) {
			view.innerHTML = "" + view.model;
		},
		model: function(view) {
			return view.textContent;
		},
		action: {
			draw: function(signal) {
				this.draw(signal.on);
			},
			error: function(error) {
				console.log(error);
				error.action = "";
			}
		}
	}
}

function addStyle(viewer) {
	let out = `[data-view=I${viewer.id}] {`;
	for (let name in viewer.style) {
		out += name + ":" + viewer.style[name] + ";"
	}
	out += "}";
	let index = viewer.owner.$style.insertRule(out);
	viewer.style = viewer.owner.$style.cssRules[index];
}
