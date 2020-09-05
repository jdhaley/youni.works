const observers = Symbol("observers");
let MOVE = null;
let MOUSE_TARGET = null;
export default {
	package$: "youni.works/base/app",
	use: {
		package$control: "youni.works/base/control",
		package$cell: "youni.works/base/cell"
	},
	Application: {
		super$: "use.control.Viewer",
		viewName: "main.application",
		extend$events: {
			input: UP,
			mousedown: function(event) {
				MOUSE_TARGET = event.target;
				event.mouseTarget = MOUSE_TARGET;
				UP(event, MOUSE_TARGET);
			},
			mouseup: function(event) {
				if (MOUSE_TARGET) {
					event.mouseTarget = MOUSE_TARGET;
					UP(event, MOUSE_TARGET);
					MOUSE_TARGET = null;
				}
			},
			mousemove: function(event) {
				if (MOUSE_TARGET) {
					event.mouseTarget = MOUSE_TARGET;
					UP(event, MOUSE_TARGET);
				}
			},
			mouseleave: function(event) {
				if (MOUSE_TARGET) {
					event.mouseTarget = MOUSE_TARGET;
					UP(event, MOUSE_TARGET);
					MOUSE_TARGET = null;
				}
			}
		}
	},
	Window: {
		super$: "use.control.Item",
		viewName: ".window",
		startMove: function(window, target) {
			return target == window.header;	
		}
	},
	DataWindow: {
		super$: "Window",
		use: {
			type$cell: "use.cell"
		},
		show: function(parent, conf, model) {
			let view = this.createView(parent, model);
			let record = this.sys.extend(this.use.cell.Record, {
				fields: view.ownerDocument.types[conf.type]
			});
			let editor = this.sys.extend(model && model.length ? this.use.cell.Table : this.use.cell.Properties, {
				record: record
			});
			editor.createView(view.body, model);
			return view;
		}
	}
}

function UP(event, from) {
	let controller = event.currentTarget.controller;
	controller && controller.owner.transmit.up(from || event.target, event);
}