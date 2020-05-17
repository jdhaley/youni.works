export default {
	package$: "youni.works/ui",
	package$component: "youni.works/component",
	Frame: {
		super$: "component.Owner",
		before$initialize: function(conf) {
			this.initializePlatform(conf);
		},
		initializePlatform: function(conf) {
			let document = this.window.document;
			document.owner = this;
			let ele = document.createElement("style");
			ele.type = "text/css";
			document.head.appendChild(ele);
			this.$style = ele.sheet;
			this.sys.implement(window.Node.prototype, conf.platform.node);
			this.sys.implement(window.Range.prototype, conf.platform.range);
			this.device = this.sys.extend(null, conf.platform.devices);
		},
		activate: function() {
		},
		createView: function(name) {
			let doc = this.window.document;
			return arguments.length ? doc.createElement("" + name) : doc.createDocumentFragment();
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
		sense: {
			event: function(target, action) {
				let owner = target.controller.owner;
				let up = owner.propagate.up;
				target.addEventListener(action.toLowerCase(), event => {
					event[Symbol.Signal] = "Event";
					event.owner = owner;
					if (!up(event.target, action, event)) {
						event.preventDefault();
					}
				});
			},
			//Propagate from the selection container rather than the event target:
			selection: function(target, action) {
				//target.owner is allow document.selectionChange 
				const owner = target.owner || target.controller.owner;
				target.addEventListener(action.toLowerCase(), event => {
					event[Symbol.Signal] = "Event";
					event.owner = owner;
					if (!owner.propagate.up(owner.selection.commonAncestorContainer, action, event)) {
						event.preventDefault();
					}
				});
			}
		},
		getNode: function(path) {
			path = path.split("/");
			let node = this.window.document;
			for (let i = 0 ; i < path.length; i++) {
				node = node.childNodes[1 * path[i]];
				if (!node) throw new Error("Invalid Path.");
			}
			return node;
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
		shortcut: {
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
