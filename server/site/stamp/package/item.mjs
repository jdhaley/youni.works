const observers = Symbol("observers");
let MOVE = null;

export default {
	package$: "youni.works/base/item",
	use: {
		package$control: "youni.works/base/control"
	},
	Window: {
		super$: "use.control.Item",
		viewName: ".window",
		control: function(view) {
			view.header.addEventListener("mousedown", this.actions.startMove);			
			view.ownerDocument.body.addEventListener("mousemove", this.actions.move);			
			view.ownerDocument.documentElement.addEventListener("mouseleave", this.actions.endMove);			
			view.ownerDocument.body.addEventListener("mouseup", this.actions.endMove);			
		},
		extend$actions: {
			startMove: function(event) {
				let box = event.target.getBoundingClientRect();
				MOVE = {
					x: event.pageX - box.x,
					y: event.pageY - box.y,
					ele: event.target.parentNode
				}
				document.documentElement.style.cursor = "move";
				event.preventDefault();
			},
			move: function(event) {
				console.log("x");
				if (!MOVE) return;
				MOVE.ele.style.left = event.pageX - MOVE.x  + "px";
				MOVE.ele.style.top = event.pageY  - MOVE.y  + "px";				
			},
			endMove: function(event) {
				document.documentElement.style.cursor = "default";
				MOVE = null;
			}
		}
	},
	TableWindow: {
		super$: "Window",
		use: {
			type$control: "use.control"
		},
		show: function(parent, conf, model) {
			let view = this.createView(parent, model);
			let record = this.sys.extend(this.use.control.Record, {
				fields: view.ownerDocument.types[conf.type]
			});
			let table = this.sys.extend(this.use.control.Table, {
				record: record
			});
			table.createView(view, model);
			return view;
		}
	}
}
