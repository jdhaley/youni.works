const observers = Symbol("observers");
let MOVE = null;

export default {
	package$: "youni.works/base/item",
	use: {
		package$control: "youni.works/base/control",
		package$cell: "youni.works/view/cell"
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
