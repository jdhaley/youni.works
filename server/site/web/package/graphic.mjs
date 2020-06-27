let STATE;

export default {
	package$: "youni.works/web/graphic",
	use: {
		package$view: "youni.works/web/view"
	},
	Graphic: {
		super$: "use.view.Viewer",
		view: function(model) {
			let view = this.owner.window.document.createElementNS("http://www.w3.org/2000/svg", this.viewName);
			this.control(view, model);
			return view;
		}
	},
	GraphicContext: {
		super$: "Graphic",
		viewName: "svg",
		cellSize: 1,
		identify: function() {
			return ++STATE.lastId;
		},
		extend$action: {
			MouseMove: function(on, event) {
				if (event.buttons == 1 && STATE.selection) {
					STATE.selection.controller.move(STATE.selection, event.offsetX, event.offsetY);
				}
			},
			MouseDown: function(on, event) {
				STATE.selection && STATE.selection.classList.remove("selected");
				if (event.target.classList.contains("selectable")) {
//					if (STATE.selection == event.target) {
//						STATE.selection = null;
//						return;
//					}
					
					if (STATE.selection && event.altKey) {
						this.part.connector.create(on, STATE.selection, event.target);
					}

					STATE.selection = event.target;
					STATE.selection.classList.add("selected");
					
				} else {
					if (event.altKey) {
						STATE.selection = this.part.node.create(on, event.offsetX, event.offsetY);;
					}
				}
			},
			MouseUp: function(on, event) {
			}
		},
		after$initialize: function(conf) {
			STATE = this.sys.extend();
			STATE.selection = null;
			STATE.lastId = 0;
		}
	}
}