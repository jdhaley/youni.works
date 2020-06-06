export default {
	package$: "youni.works/diagram/parts",
	use: {
		package$ui: "youni.works/web/control"
	},
	public: {
		body: {
			type$: "use.ui.Viewer",
			viewType: "composite",
			part: {
				main: {
					type$: "use.ui.Viewer",
					part: {
						ribbon: {
							type$: "use.ui.Viewer",
						},
						body: {
							type$: "use.ui.Viewer",
						}
					},
					after$control: function(view) {
						let control = view.control;
						control.sense("event", "Click");
						control.sense("event", "KeyDown");
						control.sense("event", "MouseDown");
						control.sense("event", "MouseUp");
					//	view.ownerDocument.sense("selection", "SelectionChange");
					},
					after$initialize: function(conf) {
						let doc = this.owner.window.document;
						doc.execCommand("styleWithCSS", false, false);
						doc.execCommand("defaultParagraphSeparator", false, "P");
						//	sys.implement(this, cmd.Commander);
						//this.lastCommand = this.sys.extend();
					}
				}
			}
		}
	}
}
