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
		extend$action: {
			MouseMove: function(on, event) {
				if (event.buttons == 1 && STATE.selection) {
					STATE.selection.controller.move(STATE.selection, event.offsetX, event.offsetY);
				}
			},
			MouseDown: function(on, event) {
				STATE.selection && STATE.selection.setAttribute("stroke", "slateGray");
				if (event.target.handle) {
					if (STATE.selection == event.target) {
						STATE.selection = null;
						return;
					}
					
					if (STATE.selection && event.altKey) {
						this.part.connector.create(on, STATE.selection, event.target);
					}

					STATE.selection = event.target;
					STATE.selection.setAttribute("stroke", "green");
					
				} else {
					if (event.altKey) {
						STATE.selection = this.part.handle.create(on, event.offsetX, event.offsetY);;
						STATE.selection.setAttribute("stroke", "green");
					}
				}
			},
			MouseUp: function(on, event) {
			}
		},
		after$initialize: function(conf) {
			STATE = this.sys.extend();
			STATE.selection = null;
		}
	}
}